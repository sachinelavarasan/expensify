export default {
  "expo": {
    "name": "Expensify",
    "slug": "expensify",
    "version": "1.0.32",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "expensify",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": false,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png"
      },
      "package": "com.sachinelavarasan.expensify",
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON,
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/app-splash-screen.png",
          "imageWidth": 200,
          "backgroundColor": "#1A1A2E"
        }
      ],
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
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
