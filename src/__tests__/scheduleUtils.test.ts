import { generateSubjectCode, checkScheduleConflicts, getNextAvailableColor, validateSubjectForm, validateScheduleCode, parseScheduleCode } from '../utils/scheduleUtils';
import { Subject } from '../types/schedule';

describe('scheduleUtils', () => {
  describe('generateSubjectCode', () => {
    it('creates code in correct format', () => {
      const code = generateSubjectCode([2, 4], 'M', [1, 2]);
      expect(code).toBe('24M12');
    });

    it('sorts days and timeSlots', () => {
      const code = generateSubjectCode([4, 2], 'M', [2, 1]);
      expect(code).toBe('24M12');
    });
  });

  describe('checkScheduleConflicts', () => {
    const mockSubject: Omit<Subject, 'id' | 'code' | 'color'> = {
      name: 'Cálculo I',
      location: 'CAE 108',
      days: [2, 4],
      shift: 'M',
      timeSlots: [1, 2],
      professor: ''
    };

    it('returns empty array when there are no conflicts', () => {
      const conflicts = checkScheduleConflicts(mockSubject, []);
      expect(conflicts).toHaveLength(0);
    });

    it('returns conflicts when they exist', () => {
      const existingSubject: Subject = {
        ...mockSubject,
        id: '123',
        code: '24M12',
        color: '#ef4444'
      };
      const conflicts = checkScheduleConflicts(mockSubject, [existingSubject]);
      expect(conflicts).toHaveLength(4);
    });

    it('excludes subject from conflict check when excludeSubjectId is provided', () => {
      const existingSubject: Subject = {
        ...mockSubject,
        id: '123',
        code: '24M12',
        color: '#ef4444'
      };
      const conflicts = checkScheduleConflicts(mockSubject, [existingSubject], '123');
      expect(conflicts).toHaveLength(0);
    });

    it('throws error for invalid days', () => {
      expect(() => checkScheduleConflicts({ ...mockSubject, days: [1, 8] }, [])).toThrow();
    });

    it('throws error for invalid timeSlots', () => {
      expect(() => checkScheduleConflicts({ ...mockSubject, timeSlots: [0, 7] }, [])).toThrow();
    });
  });

  describe('getNextAvailableColor', () => {
    it('returns first color when no subjects exist', () => {
      const color = getNextAvailableColor([]);
      expect(color).toBe('#ef4444');
    });

    it('returns next available color when some colors are used', () => {
      const subjects: Subject[] = [
        {
          id: '1',
          name: 'Cálculo I',
          code: '24M12',
          location: 'CAE 108',
          days: [2, 4],
          shift: 'M',
          timeSlots: [1, 2],
          professor: '',
          color: '#ef4444'
        }
      ];
      const color = getNextAvailableColor(subjects);
      expect(color).toBe('#f97316');
    });
  });

  describe('validateSubjectForm', () => {
    it('returns empty array for valid form', () => {
      const errors = validateSubjectForm('Cálculo I', 'CAE 108', [2, 4], 'M', [1, 2]);
      expect(errors).toHaveLength(0);
    });

    it('validates name', () => {
      expect(validateSubjectForm('', 'CAE 108', [2, 4], 'M', [1, 2])).toContain('Nome da disciplina é obrigatório');
      expect(validateSubjectForm('a'.repeat(101), 'CAE 108', [2, 4], 'M', [1, 2])).toContain('Nome da disciplina deve ter no máximo 100 caracteres');
    });

    it('validates location', () => {
      expect(validateSubjectForm('Cálculo I', '', [2, 4], 'M', [1, 2])).toContain('Local da aula é obrigatório');
      expect(validateSubjectForm('Cálculo I', 'a'.repeat(51), [2, 4], 'M', [1, 2])).toContain('Local da aula deve ter no máximo 50 caracteres');
    });

    it('validates days', () => {
      expect(validateSubjectForm('Cálculo I', 'CAE 108', [], 'M', [1, 2])).toContain('Selecione pelo menos um dia da semana');
      expect(validateSubjectForm('Cálculo I', 'CAE 108', [1, 8], 'M', [1, 2])).toContain('Dias inválidos. Use valores entre 2 (Segunda) e 7 (Sábado).');
    });

    it('validates shift', () => {
      expect(validateSubjectForm('Cálculo I', 'CAE 108', [2, 4], '', [1, 2])).toContain('Selecione um turno');
    });

    it('validates timeSlots', () => {
      expect(validateSubjectForm('Cálculo I', 'CAE 108', [2, 4], 'M', [])).toContain('Selecione pelo menos um horário');
      expect(validateSubjectForm('Cálculo I', 'CAE 108', [2, 4], 'M', [0, 7])).toContain('Horários inválidos para o turno M. Use valores entre 1 e 6.');
      expect(validateSubjectForm('Cálculo I', 'CAE 108', [2, 4], 'N', [5, 6])).toContain('Horários inválidos para o turno N. Use valores entre 1 e 4.');
    });
  });

  describe('validateScheduleCode', () => {
    it('returns true for valid code', () => {
      expect(validateScheduleCode('24M12').isValid).toBe(true);
    });

    it('returns false for invalid format', () => {
      expect(validateScheduleCode('invalid').isValid).toBe(false);
    });

    it('returns false for invalid days', () => {
      expect(validateScheduleCode('18M12').isValid).toBe(false);
    });

    it('returns false for invalid timeSlots', () => {
      expect(validateScheduleCode('24M78').isValid).toBe(false);
    });
  });

  describe('parseScheduleCode', () => {
    it('parses valid code correctly', () => {
      const result = parseScheduleCode('24M12');
      expect(result).toEqual({
        days: [2, 4],
        shift: 'M',
        timeSlots: [1, 2]
      });
    });

    it('returns null for invalid code', () => {
      expect(parseScheduleCode('invalid')).toBeNull();
    });

    it('handles case-insensitive shift', () => {
      const result = parseScheduleCode('24m12');
      expect(result?.shift).toBe('M');
    });

    it('removes duplicate days and timeSlots', () => {
      const result = parseScheduleCode('2244M1122');
      expect(result).toEqual({
        days: [2, 4],
        shift: 'M',
        timeSlots: [1, 2]
      });
    });
  });
});