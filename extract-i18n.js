const fs = require('fs');
const path = require('path');

const locales = ['en', 'es', 'de'];
const localesDir = path.join(__dirname, 'src', 'locales');

function readDirRecursively(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            readDirRecursively(filePath, fileList);
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

function setDeep(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    // Only set if not already present to avoid overwriting manually translated stuff
    // EXCEPT if we are strictly updating the english version, then maybe we overwrite? 
    // Let's just set if missing for now.
    if (current[keys[keys.length - 1]] === undefined) {
        current[keys[keys.length - 1]] = value;
    }
}

const allTsxFiles = readDirRecursively(path.join(__dirname, 'src'));
const extractRegex = /t\(\s*['"]([^'"]+)['"]\s*,\s*\{[^}]*defaultValue:\s*(['"])(.*?)(?<!\\)\2/gs;

let extractedCount = 0;
const defaultValues = {};

for (const file of allTsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = extractRegex.exec(content)) !== null) {
        const key = match[1];
        const defaultValue = match[3];
        defaultValues[key] = defaultValue;
        extractedCount++;
    }
}

console.log(`Extracted ${extractedCount} keys with default values.`);

for (const loc of locales) {
    const filePath = path.join(localesDir, `${loc}.json`);
    let fileData = {};
    if (fs.existsSync(filePath)) {
        fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    for (const [key, value] of Object.entries(defaultValues)) {
        setDeep(fileData, key, value);
    }

    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
    console.log(`Updated ${loc}.json`);
}
