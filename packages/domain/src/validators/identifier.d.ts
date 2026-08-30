/**
 * Identifier Validation Logic for Student Numbers and Registration Numbers.
 * Enforces institution rules and leading year (YY) consistency.
 */
export interface ValidationResult {
    valid: boolean;
    error?: string;
    yearPrefix?: string;
}
export declare function validateStudentNumber(studentNumber: string): ValidationResult;
export declare function validateRegistrationNumber(regNumber: string): ValidationResult;
export declare function validateIdentifierConsistency(studentNumber: string, regNumber: string): ValidationResult;
