import { Subject } from '../types/schedule';
import { ValidationError, StorageError } from '../utils/errors';
import { generateId, isValidId } from '../utils/scheduleUtils';

// Constantes configuráveis
export const STORAGE_KEY = 'schedule_data';
export const BACKUP_KEY = 'schedule_backup';
export const MAX_BACKUPS = 5;

/**
 * Serviço responsável por gerenciar o armazenamento local dos dados do horário
 */
export class StorageService {
  /**
   * Verifica se o localStorage está disponível no navegador
   */
  private static isLocalStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida se os dados são um array válido de Subject
   */
  private static validateData(data: any): data is Subject[] {
    if (!Array.isArray(data)) {
      throw new ValidationError('Dados inválidos: deve ser um array');
    }

    for (const subject of data) {
      if (!subject.id) {
        subject.id = generateId();
      } else if (!isValidId(subject.id)) {
        throw new ValidationError('Dados inválidos: ID inválido');
      }
      if (!subject.name || typeof subject.name !== 'string') {
        throw new ValidationError('Dados inválidos: nome inválido');
      }
      if (!subject.code || typeof subject.code !== 'string') {
        throw new ValidationError('Dados inválidos: código inválido');
      }
      if (!subject.location || typeof subject.location !== 'string') {
        throw new ValidationError('Dados inválidos: local inválido');
      }
      if (!Array.isArray(subject.days) || subject.days.length === 0) {
        throw new ValidationError('Dados inválidos: dias inválidos');
      }
      if (!subject.shift || typeof subject.shift !== 'string') {
        throw new ValidationError('Dados inválidos: turno inválido');
      }
      if (!Array.isArray(subject.timeSlots) || subject.timeSlots.length === 0) {
        throw new ValidationError('Dados inválidos: horários inválidos');
      }
      if (typeof subject.professor !== 'string') {
        throw new ValidationError('Dados inválidos: professor inválido');
      }
      if (!subject.color || typeof subject.color !== 'string') {
        throw new ValidationError('Dados inválidos: cor inválida');
      }
    }

    return true;
  }

  /**
   * Comprime os dados usando base64
   */
  private static compressData(data: string): string {
    return btoa(data);
  }

  /**
   * Descomprime os dados de base64
   */
  private static decompressData(data: string): string {
    try {
      return atob(data);
    } catch (error) {
      throw new ValidationError('Dados corrompidos');
    }
  }

  /**
   * Cria um backup dos dados atuais
   */
  private static createBackup(data: Subject[]): void {
    if (!this.isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage não está disponível');
    }

    try {
      const backups = this.getBackups();
      const newBackup = {
        timestamp: Date.now(),
        data: this.compressData(JSON.stringify(data)),
      };

      backups.unshift(newBackup);
      if (backups.length > MAX_BACKUPS) {
        backups.pop();
      }

      localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      throw new StorageError('Erro ao criar backup');
    }
  }

  /**
   * Recupera todos os backups disponíveis
   */
  private static getBackups(): { timestamp: number; data: string }[] {
    if (!this.isLocalStorageAvailable()) {
      return [];
    }

    try {
      const backups = localStorage.getItem(BACKUP_KEY);
      return backups ? JSON.parse(backups) : [];
    } catch (error) {
      throw new StorageError('Erro ao acessar ou recuperar backups do localStorage');
    }
  }

  /**
   * Salva os dados no localStorage
   */
  static saveData(data: Subject[]): void {
    if (!this.isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage não está disponível');
    }

    try {
      this.validateData(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.createBackup(data);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StorageError('Erro ao salvar dados no armazenamento local');
    }
  }

  /**
   * Carrega os dados do localStorage
   */
  static loadData(): Subject[] {
    try {
      if (!localStorage) {
        throw new StorageError('Armazenamento local não disponível');
      }

      const data = localStorage.getItem('schedule_data');
      if (!data) {
        return [];
      }

      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        throw new ValidationError('Dados corrompidos');
      }
      this.validateData(parsedData);
      return parsedData;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StorageError('Erro ao carregar dados do armazenamento local');
    }
  }

  /**
   * Limpa todos os dados do localStorage
   */
  static clearData(): void {
    if (!this.isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage não está disponível');
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BACKUP_KEY);
    } catch {
      throw new StorageError('Erro ao limpar dados do armazenamento local');
    }
  }

  /**
   * Exporta os dados em formato JSON
   */
  static exportData(): string {
    if (!this.isLocalStorageAvailable()) {
      throw new StorageError('LocalStorage não está disponível');
    }

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return '[]';
      }

      return data;
    } catch (error) {
      throw new StorageError('Erro ao exportar dados do armazenamento local');
    }
  }

  /**
   * Importa dados de uma string JSON
   */
  static importData(jsonData: string): void {
    try {
      if (!localStorage) {
        throw new StorageError('Armazenamento local não disponível');
      }

      let data;
      try {
        data = JSON.parse(jsonData);
      } catch (error) {
        throw new ValidationError('Dados importados inválidos');
      }
      this.validateData(data);
      localStorage.setItem('schedule_data', jsonData);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StorageError('Erro ao importar dados do armazenamento local');
    }
  }

  /**
   * Restaura um backup específico
   */
  static restoreBackup(timestamp: number): void {
    try {
      if (!localStorage) {
        throw new StorageError('Armazenamento local não disponível');
      }

      const backups = this.getBackups();
      const backup = backups.find((b) => b.timestamp === timestamp);

      if (!backup) {
        throw new ValidationError('Backup não encontrado');
      }

      let data;
      try {
        data = this.decompressData(backup.data);
      } catch (error) {
        throw new ValidationError('Dados do backup corrompidos');
      }

      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        throw new ValidationError('Dados do backup corrompidos');
      }
      this.validateData(parsedData);
      localStorage.setItem('schedule_data', data);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StorageError('Erro ao restaurar backup');
    }
  }

  /**
   * Retorna lista de backups disponíveis
   */
  static getAvailableBackups(): { timestamp: number; date: string }[] {
    if (!this.isLocalStorageAvailable()) {
      return [];
    }

    try {
      const backups = this.getBackups();
      return backups.map((backup) => ({
        timestamp: backup.timestamp,
        date: new Date(backup.timestamp).toLocaleString(),
      }));
    } catch {
      return [];
    }
  }
}
