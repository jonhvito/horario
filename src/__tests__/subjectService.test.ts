import { SubjectService } from '../services/subjectService';
import { ValidationError, ConflictError } from '../utils/errors';

describe('SubjectService', () => {
  const mockSubject = {
    name: 'Cálculo I',
    location: 'CAE 108',
    days: [2, 4],
    shift: 'M' as const,
    timeSlots: [1, 2]
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('addSubject', () => {
    it('should add a new subject successfully', () => {
      const subject = SubjectService.addSubject(mockSubject);
      expect(subject).toMatchObject({
        ...mockSubject,
        id: expect.any(String),
        code: expect.any(String),
        color: expect.any(String)
      });
    });

    it('should throw ConflictError when there is a schedule conflict', () => {
      SubjectService.addSubject(mockSubject);
      expect(() => SubjectService.addSubject(mockSubject)).toThrow(ConflictError);
    });
  });

  describe('updateSubject', () => {
    it('should update an existing subject successfully', () => {
      const subject = SubjectService.addSubject(mockSubject);
      const updates = { name: 'Cálculo II' };
      const updated = SubjectService.updateSubject(subject.id, updates);
      expect(updated.name).toBe('Cálculo II');
    });

    it('should throw ValidationError when subject is not found', () => {
      expect(() => SubjectService.updateSubject('non-existent-id', { name: 'New Name' }))
        .toThrow(ValidationError);
    });

    it('should throw ConflictError when update creates a conflict', () => {
      const subject1 = SubjectService.addSubject(mockSubject);
      const subject2 = SubjectService.addSubject({
        ...mockSubject,
        name: 'Cálculo II',
        days: [3, 5]
      });

      expect(() => SubjectService.updateSubject(subject2.id, { days: [2, 4] }))
        .toThrow(ConflictError);
    });
  });

  describe('deleteSubject', () => {
    it('should delete a subject successfully', () => {
      const subject = SubjectService.addSubject(mockSubject);
      SubjectService.deleteSubject(subject.id);
      const subjects = SubjectService.loadSubjects();
      expect(subjects).toHaveLength(0);
    });

    it('should throw ValidationError when subject is not found', () => {
      expect(() => SubjectService.deleteSubject('non-existent-id'))
        .toThrow(ValidationError);
    });
  });

  describe('getSubjectConflicts', () => {
    it('should return empty array when there are no conflicts', () => {
      const conflicts = SubjectService.getSubjectConflicts(mockSubject);
      expect(conflicts).toHaveLength(0);
    });

    it('should return conflicts when they exist', () => {
      SubjectService.addSubject(mockSubject);
      const conflicts = SubjectService.getSubjectConflicts(mockSubject);
      expect(conflicts).toHaveLength(4); // Two time slots for each of the two days
    });
  });

  describe('exportSchedule and importSchedule', () => {
    it('should export and import schedule successfully', () => {
      const subject = SubjectService.addSubject(mockSubject);
      const exported = SubjectService.exportSchedule();
      SubjectService.clearSchedule();
      const imported = SubjectService.importSchedule(exported);
      expect(imported).toBe(true);
      const subjects = SubjectService.loadSubjects();
      expect(subjects).toHaveLength(1);
      expect(subjects[0]).toMatchObject({
        ...mockSubject,
        id: subject.id,
        code: subject.code,
        color: subject.color
      });
    });

    it('should return false when importing invalid data', () => {
      expect(SubjectService.importSchedule('invalid-json')).toBe(false);
    });
  });
}); 