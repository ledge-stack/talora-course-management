import {
  validateStudentNumber,
  validateRegistrationNumber,
  validateIdentifierConsistency,
} from '../src/validators/identifier';

describe('Identifier Validation', () => {
  test('validates student number format YY007XXXXXa', () => {
    expect(validateStudentNumber('2400712345a').valid).toBe(true);
    expect(validateStudentNumber('invalid').valid).toBe(false);
  });

  test('validates registration number format', () => {
    expect(validateRegistrationNumber('24/U/12345').valid).toBe(true);
    expect(validateRegistrationNumber('24/U/12345/EVE').valid).toBe(true);
    expect(validateRegistrationNumber('24/U/12345/PS').valid).toBe(true);
    expect(validateRegistrationNumber('invalid').valid).toBe(false);
  });

  test('validates year consistency between student and reg number', () => {
    const validMatch = validateIdentifierConsistency('2400712345a', '24/U/12345');
    expect(validMatch.valid).toBe(true);

    const yearMismatch = validateIdentifierConsistency('2400712345a', '23/U/12345');
    expect(yearMismatch.valid).toBe(false);
    expect(yearMismatch.error).toContain('Year prefix mismatch');
  });
});
