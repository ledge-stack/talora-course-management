const regNumberRegex = /^2[0-9]\/[UXIE]\/\d{4,5}(?:\/(?:EVE|PS|PSA))?$/;
const studentNumberRegex = /^2[0-9]007\d{5}$/;

console.log('reg:', regNumberRegex.test('25/U/26621'));
console.log('stu:', studentNumberRegex.test('2500726621'));
