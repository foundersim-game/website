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
        backgroundColor: '#f7f8fc'
    },
    plugins: {
        AdMob: {
            androidScheme: 'https'
        }
    }
};

export default config;
