/**
 * Auto-translator: Translates en.json → fr.json and pt.json
 * - Protects {{interpolation}} variables from being mangled by Google Translate
 * - Processes in small batches to avoid rate limits
 * - Skips keys that are already translated (for re-runs)
 */

const fs = require('fs');
const path = require('path');

// Use dynamic import for the ESM package
async function main() {
    const { translate } = await import('google-translate-api-x');

    const enPath = path.join(__dirname, 'src', 'locales', 'en.json');
    const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

    const TARGETS = [
        { code: 'fr', name: 'French', outputFile: 'fr.json' },
        { code: 'pt', name: 'Portuguese (Brazil)', outputFile: 'pt.json', tld: 'com.br' }
    ];

    // Flatten a nested object into dot-notation key/value pairs
    function flatten(obj, prefix = '') {
        const result = {};
        for (const [k, v] of Object.entries(obj)) {
            const key = prefix ? `${prefix}.${k}` : k;
            if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
                Object.assign(result, flatten(v, key));
            } else if (typeof v === 'string') {
                result[key] = v;
            }
        }
        return result;
    }

    // Rebuild nested from flat
    function unflatten(flat) {
        const result = {};
        for (const [key, value] of Object.entries(flat)) {
            const parts = key.split('.');
            let cur = result;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!cur[parts[i]]) cur[parts[i]] = {};
                cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = value;
        }
        return result;
    }

    // Protect {{variables}} and emoji by replacing with placeholders
    function protectPlaceholders(text) {
        const tokens = [];
        let tokenIdx = 0;
        // Replace {{variable}} with XTOKENX_n_XTOKENX
        let protected_ = text.replace(/\{\{[^}]+\}\}/g, (match) => {
            const id = `XTKN${tokenIdx++}X`;
            tokens.push({ id, original: match });
            return id;
        });
        return { protected: protected_, tokens };
    }

    function restorePlaceholders(text, tokens) {
        let restored = text;
        for (const { id, original } of tokens) {
            // Google sometimes adds spaces around our tokens; handle that
            restored = restored.replace(new RegExp(id.replace(/X/g, 'X'), 'g'), original);
        }
        return restored;
    }

    const flatEn = flatten(en);
    const keys = Object.keys(flatEn);

    console.log(`📚 Found ${keys.length} keys to translate.\n`);

    // Translate in batches of 50 to avoid rate limits
    async function translateBatch(texts, targetLang) {
        const results = [];
        const BATCH = 50;
        for (let i = 0; i < texts.length; i += BATCH) {
            const chunk = texts.slice(i, i + BATCH);
            try {
                const res = await translate(chunk, { to: targetLang, autoCorrect: false });
                const translated = Array.isArray(res) ? res.map(r => r.text) : [res.text];
                results.push(...translated);
                process.stdout.write(`  ✓ ${Math.min(i + BATCH, texts.length)}/${texts.length} strings translated\r`);
                // Small delay between batches to be polite to the API
                if (i + BATCH < texts.length) {
                    await new Promise(resolve => setTimeout(resolve, 350));
                }
            } catch (err) {
                console.error(`\n  ❌ Error on batch ${i}-${i + BATCH}:`, err.message);
                // On error, push originals so we don't lose keys
                results.push(...chunk);
            }
        }
        return results;
    }

    for (const target of TARGETS) {
        console.log(`\n🌍 Translating to ${target.name}...`);
        
        const outPath = path.join(__dirname, 'src', 'locales', target.outputFile);
        
        // Load existing file if it exists (for re-runs)
        let existingFlat = {};
        if (fs.existsSync(outPath)) {
            const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
            existingFlat = flatten(existing);
        }

        const translatedFlat = { ...existingFlat };
        
        // Only translate keys that are missing
        const toTranslate = keys.filter(k => !existingFlat[k]);
        console.log(`  ${toTranslate.length} keys need translation (${keys.length - toTranslate.length} already done).`);

        if (toTranslate.length === 0) {
            console.log(`  ✅ Already complete!`);
            continue;
        }

        // Protect placeholders and build source texts
        const protectedData = toTranslate.map(k => protectPlaceholders(flatEn[k]));
        const sourceTexts = protectedData.map(d => d.protected);

        // Translate
        const translated = await translateBatch(sourceTexts, target.code);

        // Restore placeholders and save
        for (let i = 0; i < toTranslate.length; i++) {
            translatedFlat[toTranslate[i]] = restorePlaceholders(translated[i], protectedData[i].tokens);
        }

        const output = unflatten(translatedFlat);
        fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
        console.log(`\n  ✅ Saved → src/locales/${target.outputFile}`);
    }

    console.log('\n🎉 All translations complete!');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
