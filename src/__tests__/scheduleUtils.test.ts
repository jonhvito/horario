import { generateSubjectCode } from '../utils/scheduleUtils';

test('generateSubjectCode creates code in correct format', () => {
  const code = generateSubjectCode([2, 4], 'M', [1, 2]);
  expect(code).toBe('24M12');
});