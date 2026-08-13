export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  server?: {
    url?: string;
    cleartext?: boolean;
    androidScheme?: string;
  };
  plugins?: {
    SplashScreen?: {
      launchShowDuration?: number;
      backgroundColor?: string;
      showSpinner?: boolean;
    };
    StatusBar?: {
      style?: 'DARK' | 'LIGHT' | 'DEFAULT';
      backgroundColor?: string;
    };
    PushNotifications?: {
      presentationOptions?: ('badge' | 'sound' | 'alert')[];
    };
  };
}

const config: CapacitorConfig = {
  appId: 'com.bukiebrainjobs.app',
  appName: 'BukieBrainJobs',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#001A41',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#001A41',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
