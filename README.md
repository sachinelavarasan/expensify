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
