## Getting Started

This project is built using **React Native** with the **Expo** framework.

Before contributing, make sure you’re comfortable with **React** and **TypeScript**.  
If you’re only reviewing or using the app, don’t worry — you don’t need to dive into the internals.

---

## Project Structure

- **`/components/custom`** — Contains reusable, app-specific UI components created for this project.  
  _(The `ui` folder includes open-source UI components — no need to edit those.)_

- **`/hooks`** — Provides abstraction layers for managing **Context Providers** and **Bluetooth** logic.

- **`/app`** — Contains the core layout and screen (page) files for the app.

---

## Bluetooth Low Energy (BLE) Overview

This app communicates with the microcontroller using **Bluetooth Low Energy (BLE)**.

Think of it like a **client–server** model:

- The **ESP32** acts as the **server**, serving as the _source of truth_.
- The **React Native app** is the **client**, responsible for displaying and interacting with that data.

---

## Connection Workflow

Obviously, the app can only detect Bluetooth devices that are **powered on**.

To reduce interference and confusion from unrelated devices, the app filters out all peripherals that don’t belong to this project.

Once a connection is established, the UI updates automatically to show the current connection state.  
It does the same when a device disconnects.

### Services and Characteristics

BLE communication relies on **services** and **characteristics**, which represent the functionality a device exposes.  
Within this project:

- The **ESP32 firmware** defines a constant **UUID** for its BLE service.
- The **mobile app** uses that exact UUID (defined in `useBluetoothLE.ts`) to connect and read data.

**Important:** these UUID values must match on both the app and the microcontroller.  
If you change one without updating the other, the app will no longer be able to read the correct data.

---

## Managing Connection State

A convenient custom hook handles all the heavy lifting for connecting, disconnecting, scanning, and maintaining near real‑time updates.

To interact with Bluetooth devices — connecting, disconnecting, or accessing detected devices — **always use this hook** rather than calling BLE libraries directly.

This hook also exposes a **BluetoothManager singleton** for cases where you need direct programmatic control.

---

## Summary

- The app connects to an ESP32 over **Bluetooth Low Energy**.
- Connection logic and UI state are abstracted via a dedicated **hook**.
- UUIDs between the microcontroller and app **must match**.
- Project structure follows the standard React Native / Expo conventions for components, hooks, and app pages.

# Running for local development

To test this app, you need an Apple Developer Account. There is certian functionality that is not enabled in Expo Go so you can't test for free.

## Install Dependencies

Run `npm install` to install the dependencies for this project. Next, run `npx expo prebuild`. After run `npx expo start` to start the dev server. Install the dev build from iTunes.
