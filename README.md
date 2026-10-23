# Budget App

A mobile-first personal budget app built with Expo, React Native, and TypeScript.

## Features

- Balance overview and recent activity
- Expenses with categories, search, date filters, and one-time or subscription labels
- Savings goals with progress bars and contributions
- Spending statistics with a category donut chart
- Profile settings with built-in and custom currency choices
- Local storage and a confirmed reset option

## Run with Expo Go

Install Node.js and Expo Go on your phone, then run:

```sh
npm ci
npm start -- --go --lan
```

Connect your phone and computer to the same Wi-Fi network and scan the QR code with Expo Go. If LAN access is blocked, try `npm start -- --go --tunnel`.

For a browser preview, run `npm run web`.

## Checks

```sh
npm run lint
npx tsc --noEmit
```

## Data and behavior

Budget data is saved locally on the device using AsyncStorage. This app does not include a backend or cloud synchronization. Currency settings change how amounts are displayed; they do not convert existing amounts using exchange rates. Subscription labels identify logged expenses and do not automatically create future charges.

## Project structure

- `src/app/`: Expo Router screens
- `src/components/`: shared UI
- `src/store/`: budget state and local persistence
- `src/constants/`: colors and currency definitions
- `src/utils/`: budget helpers
- `assets/`: app images and icons

## Install the Android APK

Open [the latest GitHub release](https://github.com/saad123under/budget-app/releases/latest) on your Android phone and download `budget-app-1.0.0.apk` from Assets. Open the downloaded file to install Budget. This standalone build does not require Expo Go or a running development server. Because this repository is private, sign in to a GitHub account with access before downloading.

## Build an Android APK

The `preview` EAS profile produces an installable APK:

```sh
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

The project is linked to its Expo project in `app.json`. Builds require access to that Expo account. Signing credentials are managed separately through Expo and must never be committed to the repository. Reuse the same signing key for future updates.

