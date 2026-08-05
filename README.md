# Expensify 📱

A modern, cross-platform expense tracking application built with Expo and React Native.
Expensify helps users track expenses, visualize spending patterns, and export reports securely.

Supports Android, iOS, and Web platforms.

---

## ✨ Features

- 📊 Track daily income and expenses, with recurring transactions and starred items
- 📈 Interactive dashboard, budgets, and spending stats
- 🔐 JWT-based authentication (signup/login, OTP verification, password reset) against the [expensify-api](../expensify-api) backend
- 📁 Import/export transactions (Excel)
- 🔔 Push notifications
- ⚡ Fast and optimized performance with React Query
- 📱 Cross-platform support (Android, iOS, Web)
- 🧭 File-based routing with Expo Router

---

## 📱 Tech Stack

### Mobile App

![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo Router](https://img.shields.io/badge/Expo_Router-000020?style=for-the-badge&logo=expo&logoColor=white)

### Language & State

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)

### Forms & Validation

![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3068B7?style=for-the-badge&logo=zod&logoColor=white)

### Authentication

Custom JWT auth against the Expensify API — access/refresh tokens stored via `expo-secure-store`, with automatic token refresh in `lib/apiClient.ts`.

### Platforms

![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=ios&logoColor=white)

---

## 🚀 Getting started

```bash
npm install
```

Create a `.env` with the backend URL:

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Then run:

```bash
npm run start      # Expo dev server (scan the QR code, or press a/i/w)
npm run android     # Run on a connected Android device
npm run ios         # Run on iOS simulator
npm run web         # Run in the browser
```

This app talks to the [expensify-api](../expensify-api) backend — make sure it's running (see its README) and that `EXPO_PUBLIC_API_URL` points at it.

## 🧪 Dev vs Production app variants

The app can be built as two separate, side-by-side-installable apps from the same codebase, switched via the `APP_VARIANT` env var (read in `app.config.js`):

|                 | Development (`APP_VARIANT=development`) | Production (`APP_VARIANT=production` / unset) |
| --------------- | --------------------------------------- | --------------------------------------------- |
| App name        | Expensify Dev                           | Expensify                                     |
| Android package | `com.sachinelavarasan.expensify.dev`    | `com.sachinelavarasan.expensify`              |
| URL scheme      | `expensify-dev`                         | `expensify`                                   |
| Firebase config | `google-services-dev.json`              | `google-services.json`                        |

Both `google-services*.json` files are registered under the same Firebase project (the `-dev` file just also lists the `.dev` package as a client), so push notifications work in both variants.

### Run locally

```bash
# Development variant (installs as "Expensify Dev", separate from prod)
APP_VARIANT=development npx expo prebuild --clean -p android
APP_VARIANT=development npm run android

# Production variant
APP_VARIANT=production npx expo prebuild --clean -p android
APP_VARIANT=production npm run android
```

Or set `APP_VARIANT=development` (or `production`) once in your `.env` and just run `npx expo prebuild --clean -p android && npm run android` — no need to repeat the flag on every command. Re-run `prebuild --clean` whenever you switch variants, since the native `android/` project (gitignored) is regenerated from `app.config.js`.

### Cloud builds (EAS)

`eas.json` build profiles already set `APP_VARIANT` per profile:

- `development`, `preview`, `preview2`, `preview3`, `preview4` → `APP_VARIANT=development`
- `production` → `APP_VARIANT=production`

```bash
eas build --profile preview --platform android     # dev-variant APK (com.sachinelavarasan.expensify.dev)
eas build --profile production --platform android  # prod-variant build
```

### Internal testers via Play Console (AAB)

Play Console's internal testing track distributes builds under your existing app entry, which is registered as `com.sachinelavarasan.expensify` — not the `.dev` package. Use the `previewInternal` profile for this: it builds an **app bundle (AAB)** using the **production package** but pointed at the staging API, so it uploads to the same Play Console app your `production` profile already submits to.

```bash
eas build --profile previewInternal --platform android
eas submit --profile previewInternal --platform android --path <path-to-aab>
```

Note: both `production` and `previewInternal` submit to the same `internal` track, so submitting a `previewInternal` build replaces whatever build is currently on that track.

### Dev variant as its own Play Console app (`devInternal`)

To distribute the `.dev` package (`com.sachinelavarasan.expensify.dev`) to internal testers via Play Console, it needs to be registered as a **separate app** — Play Console apps are keyed by package name, and this one is different from `com.sachinelavarasan.expensify`. One-time manual setup required before this works:

1. In Play Console, create a new app entry using package name `com.sachinelavarasan.expensify.dev`.
2. Under **Setup → API access**, grant the existing service account (`play-console-services.json`) access to this new app (or link a new one).
3. The very first release for a brand-new app **must** be uploaded manually through the Play Console UI — Google's Publishing API rejects the first upload of a new app. After that first manual upload, `eas submit` works normally.

Once that's done:

```bash
eas build --profile devInternal --platform android
eas submit --profile devInternal --platform android --path <path-to-aab>
```

This builds an AAB with the `.dev` package/name pointed at the staging API, submitted to that app's `internal` track — independent from `production`/`previewInternal`, which target the base package.

## 📂 Project structure

- `app/` — Expo Router file-based routes
  - `(root)/(auth)/` — login, signup, OTP verification, password reset
  - `(root)/dashboard/` — dashboard, budget, stats, profile
  - `(root)/` — transactions, accounts, categories, recurring transactions, import/export, settings
- `contexts/` — `AuthContext`, `NotificationContext`, `ThemedContext`
- `lib/` — `apiClient` (axios + token refresh), `secureStorage`, `tokenStore`
- `utils/Colors.ts` — app theme/brand colors

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction/)
