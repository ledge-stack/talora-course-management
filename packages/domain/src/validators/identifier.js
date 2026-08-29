"use strict";
/**
 * Identifier Validation Logic for Student Numbers and Registration Numbers.
 * Enforces institution rules and leading year (YY) consistency.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateStudentNumber = validateStudentNumber;
exports.validateRegistrationNumber = validateRegistrationNumber;
exports.validateIdentifierConsistency = validateIdentifierConsistency;
function validateStudentNumber(studentNumber) {
    if (!studentNumber) {
        return { valid: false, error: 'Student number is required' };
    }
    // Pattern: YY007XXXXX (2 digits year, 007 prefix, 5 digits)
    const regex = /^(\d{2})007\d{5}$/;
    const match = studentNumber.trim().match(regex);
    if (!match) {
        return {
            valid: false,
            error: 'Invalid student number format. Expected format matching YY007XXXXX',
        };
    }
    return { valid: true, yearPrefix: match[1] };
}
function validateRegistrationNumber(regNumber) {
    if (!regNumber) {
        return { valid: false, error: 'Registration number is required' };
    }
    // Pattern: YY/[A-Z]/XXXXX with optional /EVE, /PS, or /PSA suffix
    const regex = /^(\d{2})\/[a-zA-Z]\/\d{4,6}(?:\/(?:EVE|PS|PSA))?$/i;
    const match = regNumber.trim().match(regex);
    if (!match) {
        return {
            valid: false,
            error: 'Invalid registration number format. Expected YY/[Letter]/XXXXX with optional /EVE, /PS, or /PSA suffix',
        };
    }
    return { valid: true, yearPrefix: match[1] };
}
function validateIdentifierConsistency(studentNumber, regNumber) {
    const studentVal = validateStudentNumber(studentNumber);
    if (!studentVal.valid)
        return studentVal;
    const regVal = validateRegistrationNumber(regNumber);
    if (!regVal.valid)
        return regVal;
    if (studentVal.yearPrefix !== regVal.yearPrefix) {
        return {
            valid: false,
            error: `Year prefix mismatch: Student number year (${studentVal.yearPrefix}) does not match registration number year (${regVal.yearPrefix})`,
        };
    }
    return { valid: true, yearPrefix: studentVal.yearPrefix };
}
