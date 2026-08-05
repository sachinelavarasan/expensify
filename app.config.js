const { withGradleProperties } = require('@expo/config-plugins');

const withIncreasedMetaspace = (config) =>
  withGradleProperties(config, (config) => {
    const key = 'org.gradle.jvmargs';
    const value = '-Xmx6144m -XX:MaxMetaspaceSize=2048m';
    const existing = config.modResults.find((item) => item.type === 'property' && item.key === key);
    if (existing) {
      existing.value = value;
    } else {
      config.modResults.push({ type: 'property', key, value });
    }
    return config;
  });

const isDev = process.env.APP_VARIANT === 'development';
const googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON || (isDev ? './google-services-dev.json' : './google-services.json');

export default {
  "expo": {
    "name": isDev ? "Expensify Dev" : "Expensify",
    "slug": "expensify",
    "version": "1.0.32",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": isDev ? "expensify-dev" : "expensify",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": false,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png"
      },
      "package": isDev ? "com.sachinelavarasan.expensify.dev" : "com.sachinelavarasan.expensify",
      "googleServicesFile": googleServicesFile,
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      withIncreasedMetaspace,
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/app-splash-screen.png",
          "imageWidth": 200,
          "backgroundColor": "#FfFfFf",
          "dark": {
            "image": "./assets/images/app-splash-screen-dark.png",
            "backgroundColor": "#0E0E10"
          }
        }
      ],
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          },
          "android": {
            "enableMinifyInReleaseBuilds": true,
            "enableShrinkResourcesInReleaseBuilds": true
          }
        }
      ],
      [
        "expo-notifications",
        {
          "defaultChannel": "default",
          "enableBackgroundRemoteNotifications": false
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Expensify wants access to your photos"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "ee0659e6-673e-4d72-99b4-71ba8310ab58"
      }
    },
    "updates": {
      "url": "https://u.expo.dev/ee0659e6-673e-4d72-99b4-71ba8310ab58"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
