const fs = require('fs');
const ts = require('typescript');
const { translate } = require('@vitalets/google-translate-api');

const pLimit = async (concurrency) => {
    const { default: pLimitFn } = await import('p-limit');
    return pLimitFn(concurrency);
};

async function run() {
    const fileContent = fs.readFileSync('src/lib/engine/storyline.ts', 'utf8');
    const sourceFile = ts.createSourceFile('storyline.ts', fileContent, ts.ScriptTarget.Latest, true);

    let enDict = {};
    let replacements = [];

    function visit(node) {
        if (ts.isObjectLiteralExpression(node)) {
            let isDialog = false;
            let triggerId = '';
            
            for (const prop of node.properties) {
                if (ts.isPropertyAssignment(prop) && prop.name && prop.name.text === 'trigger') {
                    if (ts.isStringLiteral(prop.initializer)) {
                        isDialog = true;
                        triggerId = prop.initializer.text;
                    }
                }
            }
            
            if (isDialog && triggerId) {
                for (const prop of node.properties) {
                    if (!ts.isPropertyAssignment(prop)) continue;
                    
                    const propName = prop.name.text;
                    const translatableProps = ['title', 'message', 'buttonText', 'choiceALabel', 'choiceADescription', 'choiceBLabel', 'choiceBDescription'];
                    
                    if (translatableProps.includes(propName) && ts.isStringLiteral(prop.initializer)) {
                        const fullKey = `storyline_${triggerId}_${propName}`;
                        enDict[fullKey] = prop.initializer.text;
                        
                        replacements.push({
                            start: prop.initializer.getStart(sourceFile, false),
                            end: prop.initializer.getEnd(),
                            text: `"storyline.${fullKey}"`
                        });
                    }
                }
            }
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    console.log(`Extracted ${Object.keys(enDict).length} storyline strings.`);

    const limit = await pLimit(10);
    const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
    const es = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));
    const de = JSON.parse(fs.readFileSync('src/locales/de.json', 'utf8'));

    if (!en.storyline) en.storyline = {};
    if (!es.storyline) es.storyline = {};
    if (!de.storyline) de.storyline = {};

    const entries = Object.entries(enDict);
    let done = 0;
    const promises = entries.map(([key, text]) => {
        return limit(async () => {
            en.storyline[key] = text;
            try { es.storyline[key] = (await translate(text, { to: 'es' })).text; } catch(e) { es.storyline[key] = text; }
            try { de.storyline[key] = (await translate(text, { to: 'de' })).text; } catch(e) { de.storyline[key] = text; }
            done++;
            if (done % 20 === 0) console.log(`Finished ${done}/${entries.length}`);
        });
    });

    await Promise.all(promises);

    fs.writeFileSync('src/locales/en.json', JSON.stringify(en, null, 4));
    fs.writeFileSync('src/locales/es.json', JSON.stringify(es, null, 4));
    fs.writeFileSync('src/locales/de.json', JSON.stringify(de, null, 4));

    replacements.sort((a, b) => b.start - a.start);
    let newFileContent = fileContent;
    for (const rep of replacements) {
        newFileContent = newFileContent.substring(0, rep.start) + rep.text + newFileContent.substring(rep.end);
    }
    fs.writeFileSync('src/lib/engine/storyline_i18n.ts', newFileContent);
    console.log("Storyline translation complete.");
}

run().catch(console.error);
