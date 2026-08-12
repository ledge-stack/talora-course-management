import {
  validateStudentNumber,
  validateRegistrationNumber,
  validateIdentifierConsistency,
} from '../src/validators/identifier';

describe('Identifier Validation', () => {
  describe('Student Number Validation', () => {
    test('validates valid student number format YY007XXXXX', () => {
      expect(validateStudentNumber('2400712345').valid).toBe(true);
    });

    test('validates student number with whitespace padding', () => {
      expect(validateStudentNumber('  2400712345  ').valid).toBe(true);
    });

    test('rejects student number with invalid prefix', () => {
      expect(validateStudentNumber('2400812345').valid).toBe(false);
    });

    test('rejects student number with incorrect digit count (boundary size)', () => {
      expect(validateStudentNumber('240071234').valid).toBe(false); // 4 digits instead of 5
      expect(validateStudentNumber('24007123456').valid).toBe(false); // 6 digits instead of 5
    });

    test('rejects student number with special characters', () => {
      expect(validateStudentNumber('240071234@').valid).toBe(false);
      expect(validateStudentNumber('240071234-').valid).toBe(false);
    });

    test('rejects student number with trailing letter', () => {
      expect(validateStudentNumber('2400712345a').valid).toBe(false);
      expect(validateStudentNumber('2400712345A').valid).toBe(false);
    });

    test('rejects empty or missing student number', () => {
      expect(validateStudentNumber('').valid).toBe(false);
      expect(validateStudentNumber('   ').valid).toBe(false);
    });
  });

  describe('Registration Number Validation', () => {
    test('validates base registration number format with arbitrary letters', () => {
      expect(validateRegistrationNumber('24/U/12345').valid).toBe(true);
      expect(validateRegistrationNumber('24/I/12345').valid).toBe(true);
      expect(validateRegistrationNumber('24/X/12345').valid).toBe(true);
    });

    test('validates registration number with EVE/PS/PSA suffix', () => {
      expect(validateRegistrationNumber('24/U/12345/EVE').valid).toBe(true);
      expect(validateRegistrationNumber('24/U/12345/PS').valid).toBe(true);
      expect(validateRegistrationNumber('24/I/12345/PS').valid).toBe(true);
      expect(validateRegistrationNumber('24/U/12345/PSA').valid).toBe(true);
    });

    test('validates lowercase variants for registration number', () => {
      expect(validateRegistrationNumber('24/u/12345/eve').valid).toBe(true);
      expect(validateRegistrationNumber('24/i/12345/ps').valid).toBe(true);
      expect(validateRegistrationNumber('24/x/12345/psa').valid).toBe(true);
    });

    test('rejects registration number with invalid format', () => {
      expect(validateRegistrationNumber('invalid').valid).toBe(false);
      expect(validateRegistrationNumber('24/9/12345').valid).toBe(false); // Using number instead of letter
      expect(validateRegistrationNumber('24/UU/12345').valid).toBe(false); // Using two letters
    });

    test('rejects registration number with boundary digits length', () => {
      expect(validateRegistrationNumber('24/U/123').valid).toBe(false); // 3 digits
      expect(validateRegistrationNumber('24/U/1234567').valid).toBe(false); // 7 digits
    });

    test('rejects registration number with special characters in sequence', () => {
      expect(validateRegistrationNumber('24/U/12!45').valid).toBe(false);
    });
  });

  describe('Identifier Consistency', () => {
    test('validates year consistency between student and reg number', () => {
      const validMatch = validateIdentifierConsistency('2400712345', '24/U/12345');
      expect(validMatch.valid).toBe(true);
      expect(validMatch.yearPrefix).toBe('24');
    });

    test('rejects mismatched year prefixes with descriptive error', () => {
      const yearMismatch = validateIdentifierConsistency('2400712345', '23/U/12345');
      expect(yearMismatch.valid).toBe(false);
      expect(yearMismatch.error).toContain('Year prefix mismatch');
    });

    test('rejects if student number is invalid', () => {
      const invalidStudent = validateIdentifierConsistency('invalid', '24/U/12345');
      expect(invalidStudent.valid).toBe(false);
    });

    test('rejects if registration number is invalid', () => {
      const invalidReg = validateIdentifierConsistency('2400712345', 'invalid');
      expect(invalidReg.valid).toBe(false);
    });
  });
});
