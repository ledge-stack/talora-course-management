"use strict";
/**
 * Role-based & Scope-based authorization logic for Talora
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlatformAdmin = isPlatformAdmin;
exports.canManageClass = canManageClass;
exports.canManageGroup = canManageGroup;
exports.canViewOffering = canViewOffering;
function isPlatformAdmin(user) {
    return user.roles.some((r) => r.role === 'PLATFORM_ADMIN');
}
function canManageClass(user, classId) {
    if (isPlatformAdmin(user))
        return true;
    return user.roles.some((r) => r.role === 'CLASS_REPRESENTATIVE' && r.classId === classId);
}
function canManageGroup(user, groupId) {
    if (isPlatformAdmin(user))
        return true;
    return user.roles.some((r) => r.role === 'GROUP_LEADER' && r.groupId === groupId);
}
function canViewOffering(user, offeringId, classId) {
    if (isPlatformAdmin(user))
        return true;
    return user.roles.some((r) => {
        if (r.role === 'STUDENT' && r.offeringId === offeringId)
            return true;
        if (r.role === 'CLASS_REPRESENTATIVE' && classId && r.classId === classId)
            return true;
        return false;
    });
}
__exportStar(require("./jwt"), exports);
__exportStar(require("./password"), exports);
