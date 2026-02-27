import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.horsereserved.app',
  appName: 'Horse Reserved',
  webDir: 'dist/horse-reserved-front/browser',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'dark',
    },
  },
};

export default config;
