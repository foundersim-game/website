import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.foundersim.app',
    appName: 'Founder Sim',
    webDir: 'out',
    server: {
        androidScheme: 'https',
        iosScheme: 'https'
    },
    ios: {
        contentInset: 'never'
    },
    plugins: {
        AdMob: {
            androidScheme: 'https'
        }
    }
};

export default config;
