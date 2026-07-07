import fs from 'fs';

const report = JSON.parse(fs.readFileSync('eslint_report.json', 'utf8'));

report.forEach(fileReport => {
    if (fileReport.errorCount === 0 && fileReport.warningCount === 0) return;
    
    let content = fs.readFileSync(fileReport.filePath, 'utf8');
    let lines = content.split('\n');
    let modified = false;

    // We process from bottom to top so that column replacements don't shift earlier columns on the same line.
    // However, if we replace character by character, line length changes. 
    // It's safer to just look at the line and replace unescaped chars.
    
    const messages = fileReport.messages.filter(m => m.ruleId === 'react/no-unescaped-entities' || m.ruleId === '@typescript-eslint/ban-ts-comment');
    
    // Sort descending by line and column
    messages.sort((a, b) => {
        if (a.line !== b.line) return b.line - a.line;
        return b.column - a.column;
    });

    for (const msg of messages) {
        if (msg.ruleId === '@typescript-eslint/ban-ts-comment') {
            const i = msg.line - 1;
            if (lines[i].includes('@ts-ignore')) {
                lines[i] = lines[i].replace('@ts-ignore', '@ts-expect-error');
                modified = true;
            }
        }
        else if (msg.ruleId === 'react/no-unescaped-entities') {
            const i = msg.line - 1;
            // The exact character is usually at msg.column - 1
            let col = msg.column - 1;
            let char = lines[i][col];
            
            if (char === "'") {
                lines[i] = lines[i].substring(0, col) + '&apos;' + lines[i].substring(col + 1);
                modified = true;
            } else if (char === '"') {
                lines[i] = lines[i].substring(0, col) + '&quot;' + lines[i].substring(col + 1);
                modified = true;
            } else {
                // If the column is slightly off, we try to safely replace standard cases in that line
                // This is a bit riskier, but often works if we target words like "don't"
                if (lines[i].includes("'")) {
                    // Only replace single quotes that are between letters, e.g. "don't"
                    lines[i] = lines[i].replace(/([a-zA-Z])'([a-zA-Z])/g, "$1&apos;$2");
                    // Also things like "Let's" -> "Let&apos;s"
                    modified = true;
                }
                if (lines[i].includes('"')) {
                    // We only want to replace quotes outside of tags. Too complex for simple regex.
                    // Fallback to manual for complex ones if needed.
                }
            }
        }
    }

    if (modified) {
        fs.writeFileSync(fileReport.filePath, lines.join('\n'));
        console.log(`Fixed ${fileReport.filePath}`);
    }
});
