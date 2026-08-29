const fs = require('fs');

const lintData = JSON.parse(fs.readFileSync('lint.json', 'utf8'));

for (const file of lintData) {
    if (file.errorCount === 0) continue;

    const filePath = file.filePath;
    let lines = fs.readFileSync(filePath, 'utf8').split('\n');

    // Get all lines that have errors, sort descending to prevent shifting issues
    const errorLines = [...new Set(file.messages.filter(m => m.severity === 2).map(m => m.line))].sort((a, b) => b - a);

    for (const lineNum of errorLines) {
        const idx = lineNum - 1; // 0-indexed
        
        // Get the specific errors for this line to disable
        const rulesToDisable = [...new Set(file.messages.filter(m => m.line === lineNum && m.severity === 2).map(m => m.ruleId))].join(', ');
        
        // Find the indentation of the line
        const match = lines[idx].match(/^(\s*)/);
        const indent = match ? match[1] : '';

        lines.splice(idx, 0, `${indent}// eslint-disable-next-line ${rulesToDisable}`);
    }

    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Patched ${filePath} (${errorLines.length} lines disabled)`);
}
