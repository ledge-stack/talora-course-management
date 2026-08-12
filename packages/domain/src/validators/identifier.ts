/**
 * Identifier Validation Logic for Student Numbers and Registration Numbers.
 * Enforces institution rules and leading year (YY) consistency.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  yearPrefix?: string;
}

export function validateStudentNumber(studentNumber: string): ValidationResult {
  if (!studentNumber) {
    return { valid: false, error: 'Student number is required' };
  }
  // Pattern: YY007XXXXXa (2 digits year, 007 prefix, 5 digits, 1 letter)
  const regex = /^(\d{2})007\d{5}[a-zA-Z]$/;
  const match = studentNumber.trim().match(regex);
  if (!match) {
    return {
      valid: false,
      error: 'Invalid student number format. Expected format matching YY007XXXXXa',
    };
  }
  return { valid: true, yearPrefix: match[1] };
}

export function validateRegistrationNumber(regNumber: string): ValidationResult {
  if (!regNumber) {
    return { valid: false, error: 'Registration number is required' };
  }
  // Pattern: YY/U/XXXXX or YY/U/XXXXX/EVE or YY/U/XXXXX/PS
  const regex = /^(\d{2})\/U\/\d{4,6}(?:\/(?:EVE|PS))?$/i;
  const match = regNumber.trim().match(regex);
  if (!match) {
    return {
      valid: false,
      error: 'Invalid registration number format. Expected YY/U/XXXXX, YY/U/XXXXX/EVE, or YY/U/XXXXX/PS',
    };
  }
  return { valid: true, yearPrefix: match[1] };
}

export function validateIdentifierConsistency(
  studentNumber: string,
  regNumber: string
): ValidationResult {
  const studentVal = validateStudentNumber(studentNumber);
  if (!studentVal.valid) return studentVal;

  const regVal = validateRegistrationNumber(regNumber);
  if (!regVal.valid) return regVal;

  if (studentVal.yearPrefix !== regVal.yearPrefix) {
    return {
      valid: false,
      error: `Year prefix mismatch: Student number year (${studentVal.yearPrefix}) does not match registration number year (${regVal.yearPrefix})`,
    };
  }

  return { valid: true, yearPrefix: studentVal.yearPrefix };
}
