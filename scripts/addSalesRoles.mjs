import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['en.json', 'es.json', 'de.json'];

const roles = {
    en: {
        growth_specialist: "Growth Specialist", account_executive: "Account Executive",
        devrel_growth: "DevRel / Growth", solutions_architect: "Solutions Architect",
        acquisition_manager: "Acquisition Manager", content_partnership: "Content Partnership",
        monetization_manager: "Monetization Manager", ad_network_sales: "Ad Network Sales",
        conversion_analyst: "Conversion Analyst", partnership_manager: "Partnership Manager",
        learning_consultant: "Learning Consultant", institutional_sales: "Institutional Sales",
        developer_advocate: "Developer Advocate", enterprise_sales: "Enterprise Sales",
        supply_growth: "Supply Growth", merchant_success: "Merchant Success"
    },
    es: {
        growth_specialist: "Especialista en Growth", account_executive: "Ejecutivo de Cuentas",
        devrel_growth: "DevRel / Growth", solutions_architect: "Arquitecto de Soluciones",
        acquisition_manager: "Manager de Adquisición", content_partnership: "Alianzas de Contenido",
        monetization_manager: "Manager de Monetización", ad_network_sales: "Ventas de Ad Network",
        conversion_analyst: "Analista de Conversión", partnership_manager: "Manager de Alianzas",
        learning_consultant: "Consultor de Aprendizaje", institutional_sales: "Ventas Institucionales",
        developer_advocate: "Developer Advocate", enterprise_sales: "Ventas Enterprise",
        supply_growth: "Growth de Oferta", merchant_success: "Éxito de Comerciantes"
    },
    de: {
        growth_specialist: "Wachstumsspezialist", account_executive: "Account Executive",
        devrel_growth: "DevRel / Wachstum", solutions_architect: "Lösungsarchitekt",
        acquisition_manager: "Akquisitionsmanager", content_partnership: "Content-Partnerschaften",
        monetization_manager: "Monetarisierungsmanager", ad_network_sales: "Werbenetzwerk-Verkauf",
        conversion_analyst: "Conversion-Analyst", partnership_manager: "Partnerschaftsmanager",
        learning_consultant: "Lernberater", institutional_sales: "Institutioneller Vertrieb",
        developer_advocate: "Entwickler-Advokat", enterprise_sales: "Unternehmensvertrieb",
        supply_growth: "Angebotswachstum", merchant_success: "Händlererfolg"
    }
};

files.forEach(f => {
    const lang = f.split('.')[0];
    const p = path.join(ROOT, 'src/locales', f);
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    if (!data.dashboard.roles) data.dashboard.roles = {};
    Object.assign(data.dashboard.roles, roles[lang]);
    
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log("Sales roles translated.");
