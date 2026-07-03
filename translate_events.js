const fs = require('fs');
const { translate } = require('@vitalets/google-translate-api');

const pLimit = async (concurrency) => {
    const { default: pLimitFn } = await import('p-limit');
    return pLimitFn(concurrency);
};

async function run() {
    console.log("Starting events translation...");
    const limit = await pLimit(10); // 10 concurrent requests

    const enDict = JSON.parse(fs.readFileSync('extracted_en.json', 'utf8'));
    const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
    const es = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));
    const de = JSON.parse(fs.readFileSync('src/locales/de.json', 'utf8'));

    if (!en.events) en.events = {};
    if (!es.events) es.events = {};
    if (!de.events) de.events = {};

    const entries = Object.entries(enDict);
    console.log(`Translating ${entries.length} items to ES and DE...`);

    let done = 0;
    const promises = entries.map(([key, text]) => {
        return limit(async () => {
            en.events[key] = text;
            
            try {
                const resEs = await translate(text, { to: 'es' });
                es.events[key] = resEs.text;
            } catch(e) {
                es.events[key] = text;
            }
            
            try {
                const resDe = await translate(text, { to: 'de' });
                de.events[key] = resDe.text;
            } catch(e) {
                de.events[key] = text;
            }
            done++;
            if (done % 50 === 0) console.log(`Finished ${done}/${entries.length}`);
        });
    });

    await Promise.all(promises);

    fs.writeFileSync('src/locales/en.json', JSON.stringify(en, null, 4));
    fs.writeFileSync('src/locales/es.json', JSON.stringify(es, null, 4));
    fs.writeFileSync('src/locales/de.json', JSON.stringify(de, null, 4));

    console.log("Events translation complete.");
}

// We need p-limit for concurrency
run().catch(console.error);
