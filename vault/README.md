# Vault — Zero-Knowledge Encrypted Asset Manager

Vault is a full-stack cybersecurity-focused application for storing sensitive notes, API keys, credentials, and private files with **client-side encryption**.

## Security Model

- Encryption and decryption happen in the browser using Web Crypto API.
- Key derivation uses PBKDF2 (`SHA-256`, `250000` iterations).
- Data encryption uses AES-GCM 256.
- Server stores only encrypted data + salt + IV.
- Server never sees plaintext vault content.

## Features

- Secure encrypted vault items (notes, API keys, credentials, files)
- Master-password-derived key system
- TOTP-based 2FA (Speakeasy + QR code)
- Immutable audit logs (non-editable, non-deletable)
- Dead man’s switch with mock recovery email dispatch
- Optional one-time secure share links with expiry
- Security dashboard (last login, failed attempts, access locations)

## Stack

- Frontend: React + Vite + TailwindCSS + Web Crypto API
- Backend: Node.js + Express + MongoDB
- Security libs: Speakeasy, qrcode

## Setup

### 1) Install root dependencies

```bash
cd /home/kali/code/vault
npm install
```

### 2) Configure backend env

```bash
cp server/.env.example server/.env
```

Update `server/.env` with your values (`MONGO_URI`, `JWT_SECRET`).

### 3) Configure frontend env

```bash
cp client/.env.example client/.env
```

### 4) Install package dependencies

```bash
npm install --prefix server
npm install --prefix client
```

### 5) Run

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Dead Man Switch Testing

- Configure trusted email and inactivity period in UI.
- Click **Test Recovery Email** to simulate delivery.
- Check backend terminal output for mock email recovery link.

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/2fa/regenerate`
- `GET /api/vault`
- `POST /api/vault`
- `GET /api/vault/:id`
- `DELETE /api/vault/:id`
- `POST /api/vault/:id/share`
- `GET /api/vault/share/:token`
- `GET /api/audit`
- `GET /api/security/dashboard`
- `PUT /api/security/dead-man-switch`
- `POST /api/security/dead-man-switch/trigger`
- `GET /api/security/dead-man-switch/events`
- `GET /api/security/recovery/:token`
