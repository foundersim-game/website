const fs = require('fs');
const ts = require('typescript');

const fileContent = fs.readFileSync('src/lib/engine/events.ts', 'utf8');
const sourceFile = ts.createSourceFile('events.ts', fileContent, ts.ScriptTarget.Latest, true);

let enDict = {};
let replacements = [];

function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
        let isEvent = false;
        let eventId = '';
        
        // Find event_id
        for (const prop of node.properties) {
            if (ts.isPropertyAssignment(prop) && prop.name && prop.name.text === 'event_id') {
                if (ts.isStringLiteral(prop.initializer)) {
                    isEvent = true;
                    eventId = prop.initializer.text;
                }
            }
        }
        
        if (isEvent && eventId) {
            for (const prop of node.properties) {
                if (!ts.isPropertyAssignment(prop)) continue;
                
                const propName = prop.name.text;
                if (propName === 'title' && ts.isStringLiteral(prop.initializer)) {
                    enDict[`${eventId}_title`] = prop.initializer.text;
                    replacements.push({
                        start: prop.initializer.getStart(sourceFile, false),
                        end: prop.initializer.getEnd(),
                        text: `"events.${eventId}_title"`
                    });
                } else if (propName === 'description' && ts.isStringLiteral(prop.initializer)) {
                    enDict[`${eventId}_desc`] = prop.initializer.text;
                    replacements.push({
                        start: prop.initializer.getStart(sourceFile, false),
                        end: prop.initializer.getEnd(),
                        text: `"events.${eventId}_desc"`
                    });
                } else if (propName === 'choices' && ts.isArrayLiteralExpression(prop.initializer)) {
                    prop.initializer.elements.forEach((choice, idx) => {
                        if (ts.isObjectLiteralExpression(choice)) {
                            for (const cProp of choice.properties) {
                                if (ts.isPropertyAssignment(cProp) && cProp.name.text === 'text' && ts.isStringLiteral(cProp.initializer)) {
                                    enDict[`${eventId}_choice_${idx}`] = cProp.initializer.text;
                                    replacements.push({
                                        start: cProp.initializer.getStart(sourceFile, false),
                                        end: cProp.initializer.getEnd(),
                                        text: `"events.${eventId}_choice_${idx}"`
                                    });
                                }
                            }
                        }
                    });
                }
            }
        }
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);

fs.writeFileSync('extracted_en.json', JSON.stringify(enDict, null, 2));
console.log(`Extracted ${Object.keys(enDict).length} strings.`);

// Apply replacements backwards so indices don't shift
replacements.sort((a, b) => b.start - a.start);
let newFileContent = fileContent;
for (const rep of replacements) {
    newFileContent = newFileContent.substring(0, rep.start) + rep.text + newFileContent.substring(rep.end);
}
fs.writeFileSync('src/lib/engine/events_i18n.ts', newFileContent);

