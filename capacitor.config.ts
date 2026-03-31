import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.huntersjournal.app",
  appName: "Hunter's Journal",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#03050d",
      showSpinner: false,
    },
  },
};

export default config;
