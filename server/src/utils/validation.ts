/**
 * Production Validation Utilities for Talora
 */

export const validateStudentId = (studentId: string): { isValid: boolean; message?: string } => {
  // Typical University Format check (e.g., 10 digits)
  if (!/^\d{10}$/.test(studentId)) {
    return { isValid: false, message: 'Student ID must be exactly 10 digits.' };
  }
  return { isValid: true };
};

export const validateGmail = (email: string): boolean => {
  // Hard requirement: Gmail only
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
};
