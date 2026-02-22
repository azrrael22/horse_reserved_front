import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cabalgatas.salento',
  appName: 'Cabalgatas Salento',
  webDir: 'dist/horse-reserved-front/browser',
  server: {
    // ⚠️ Solo en desarrollo. Comenta esto para builds de producción.
    // Permite que la app nativa apunte al servidor de dev local.
    androidScheme: 'https',
    // url: 'http://192.168.X.X:4200',  // descomenta con tu IP local para live reload nativo
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FAF7F2',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#2D5A27',
    },
  },
};

export default config;
