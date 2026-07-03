import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enStore from '../locales/en.json';
import esStore from '../locales/es.json';
import deStore from '../locales/de.json';
import frStore from '../locales/fr.json';
import ptStore from '../locales/pt.json';

// Initialize i18next
i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enStore },
            es: { translation: esStore },
            de: { translation: deStore },
            fr: { translation: frStore },
            pt: { translation: ptStore }
        },
        lng: typeof window !== 'undefined' ? localStorage.getItem('founder_sim_language') || 'en' : 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already escapes values
        }
    });

// Listen for language changes to save to localStorage
i18n.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('founder_sim_language', lng);
    }
});

export default i18n;
