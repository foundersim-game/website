import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.foundersim.app',
    appName: 'Founder Sim',
    webDir: 'out',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        AdMob: {
            initializeOnInApp: true,
            androidScheme: 'https'
        }
    }
};

export default config;
