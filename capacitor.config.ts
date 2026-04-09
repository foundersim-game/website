import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.foundersim.app',
    appName: 'Founder Sim',
    webDir: 'out',
    server: {
        androidScheme: 'https'
    },
    ios: {
        contentInset: 'automatic',
        backgroundColor: '#0f1117'
    },
    plugins: {
        AdMob: {
            androidScheme: 'https'
        }
    }
};

export default config;
