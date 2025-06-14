import { Subject } from '../types/schedule';
import { ValidationError, StorageError } from '../utils/errors';

const STORAGE_KEY = 'schedule_data';
const BACKUP_KEY = 'schedule_backup';
const MAX_BACKUPS = 5;

export class StorageService {
  private static compressData(data: unknown): string {
    try {
      const jsonString = JSON.stringify(data);
      return btoa(jsonString);
    } catch (error) {
      throw new StorageError('Erro ao comprimir dados');
    }
  }

  private static decompressData(compressedData: string): unknown {
    try {
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch (error) {
      throw new StorageError('Erro ao descomprimir dados');
    }
  }

  private static createBackup(data: Subject[]): void {
    try {
      const backups = this.getBackups();
      const newBackup = {
        timestamp: Date.now(),
        data: this.compressData(data)
      };

      backups.unshift(newBackup);
      if (backups.length > MAX_BACKUPS) {
        backups.pop();
      }

      localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
    } catch (error) {
      console.error('Erro ao criar backup:', error);
    }
  }

  private static getBackups(): Array<{ timestamp: number; data: string }> {
    try {
      const backups = localStorage.getItem(BACKUP_KEY);
      return backups ? JSON.parse(backups) : [];
    } catch (error) {
      console.error('Erro ao recuperar backups:', error);
      return [];
    }
  }

  static saveData(data: Subject[]): void {
    try {
      if (!Array.isArray(data)) {
        throw new ValidationError('Dados inválidos para salvar');
      }

      const compressedData = this.compressData(data);
      localStorage.setItem(STORAGE_KEY, compressedData);
      this.createBackup(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StorageError('Erro ao salvar dados');
    }
  }

  static loadData(): Subject[] {
    try {
      const compressedData = localStorage.getItem(STORAGE_KEY);
      if (!compressedData) {
        return [];
      }

      const data = this.decompressData(compressedData);
      if (!Array.isArray(data)) {
        throw new ValidationError('Dados corrompidos');
      }

      return data;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StorageError('Erro ao carregar dados');
    }
  }

  static clearData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      throw new StorageError('Erro ao limpar dados');
    }
  }

  static exportData(): string {
    try {
      const data = this.loadData();
      return this.compressData(data);
    } catch (error) {
      throw new StorageError('Erro ao exportar dados');
    }
  }

  static importData(compressedData: string): void {
    try {
      const data = this.decompressData(compressedData);
      if (!Array.isArray(data)) {
        throw new ValidationError('Dados inválidos para importação');
      }
      this.saveData(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StorageError('Erro ao importar dados');
    }
  }

  static restoreBackup(timestamp: number): void {
    try {
      const backups = this.getBackups();
      const backup = backups.find(b => b.timestamp === timestamp);
      
      if (!backup) {
        throw new ValidationError('Backup não encontrado');
      }

      const data = this.decompressData(backup.data);
      if (!Array.isArray(data)) {
        throw new ValidationError('Dados do backup corrompidos');
      }

      this.saveData(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StorageError('Erro ao restaurar backup');
    }
  }

  static getAvailableBackups(): Array<{ timestamp: number; date: string }> {
    try {
      const backups = this.getBackups();
      return backups.map(backup => ({
        timestamp: backup.timestamp,
        date: new Date(backup.timestamp).toLocaleString()
      }));
    } catch (error) {
      throw new StorageError('Erro ao listar backups');
    }
  }
} 