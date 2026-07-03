import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['es.json', 'de.json'];

const additions = {
    es: {
        sh_type_fund: "Fondo",
        sh_type_mgmt: "MGMT",
        sh_type_vc: "VC",
        sh_type_float: "Público",
        sh_type_you: "Tú",
        sh_type_parent: "Matriz",
        sh_name_you_personal: "Tú (Personal)",
        sh_name_corp_treasury: "Tesorería Corporativa",
        sh_name_parent: "Matriz",
        sh_name_you_founder: "Tú (Fundador)",
        sh_name_early_investors: "Inversores Iniciales",
        sh_name_public_float: "Capital Flotante",
        sh_name_management: "Dirección"
    },
    de: {
        sh_type_fund: "Fonds",
        sh_type_mgmt: "MGMT",
        sh_type_vc: "VC",
        sh_type_float: "Öffentlich",
        sh_type_you: "Du",
        sh_type_parent: "Mutter",
        sh_name_you_personal: "Du (Privat)",
        sh_name_corp_treasury: "Firmenkasse",
        sh_name_parent: "Muttergesellschaft",
        sh_name_you_founder: "Du (Gründer)",
        sh_name_early_investors: "Frühe Investoren",
        sh_name_public_float: "Streubesitz",
        sh_name_management: "Management"
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));

    if (!data.dashboard.markets) data.dashboard.markets = {};
    Object.assign(data.dashboard.markets, additions[lang]);

    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});

console.log("Injected shareholder translations!");
