const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../apps/web/src/app/(dashboard)/timetable/TimetableGrid.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace e =>
content = content.replace(/onChange=\{e =>/g, 'onChange={(e: any) =>');
// Replace cu =>
content = content.replace(/cu =>/g, '(cu: any) =>');
// Replace (d, i) =>
content = content.replace(/\(d, i\) =>/g, '(d: any, i: any) =>');

fs.writeFileSync(file, content);
console.log('Fixed implicit anys in TimetableGrid.tsx');
