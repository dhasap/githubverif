# DevPack API Dashboard

Dashboard web untuk mengelola GitHub Student Developer Pack verifikasi via API AhsanLabs.

## Fitur

- 🔐 **API Key Management** - Input API key, ganti key, revoke key
- 📊 **Dashboard** - Lihat credit balance dan statistik akun
- ✅ **Verification Form** - Submit verifikasi dengan pilihan role (student/faculty) dan 2FA
- 📋 **Job History** - Riwayat verifikasi dengan polling status real-time
- 🌙 **Dark Mode** - Support dark mode

## Tech Stack

- Next.js 16.2.3
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand (state management)
- Lucide React (icons)
- Sonner (toast notifications)

## API Base URL

```
http://api.ahsanlabs.online
```

## Cara Deploy ke Vercel

### Opsi 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login ke Vercel:
```bash
vercel login
```

3. Deploy:
```bash
cd devpack-web
vercel --prod
```

### Opsi 2: Deploy via GitHub (Recommended)

1. Push project ini ke GitHub repository
2. Buka [vercel.com](https://vercel.com)
3. Import repository dari GitHub
4. Konfigurasi:
   - Framework Preset: Next.js
   - Root Directory: `devpack-web` (jika repo root berisi folder lain)
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Deploy!

### Opsi 3: Deploy Manual (Static)

1. Build project:
```bash
cd devpack-web
npm run build
```

2. Upload folder `dist` ke Vercel:
```bash
vercel --prod dist
```

## Cara Mendapatkan API Key

1. Buka Telegram
2. Message [@AutoGithubStudentVer_bot](https://t.me/AutoGithubStudentVer_bot)
3. Ketik `/apikey`
4. Copy API key yang diberikan

## Struktur Folder

```
devpack-web/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Login page (API key input)
│   │   ├── dashboard/         # Dashboard page
│   │   ├── verify/            # Verification form
│   │   ├── history/           # Job history
│   │   └── settings/          # Settings (change/revoke API key)
│   ├── components/
│   │   ├── Header.tsx         # Navigation header
│   │   ├── ApiKeyInput.tsx    # API key input form
│   │   ├── CreditCard.tsx     # Credit stats display
│   │   └── JobStatusBadge.tsx # Job status badge
│   └── lib/
│       └── store.ts           # Zustand store
├── dist/                      # Build output
└── package.json
```

## Environment Variables

Tidak diperlukan environment variables karena API key diinput user dan disimpan di localStorage.

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Catatan

- API Key disimpan di localStorage browser
- Credit hanya dikenakan saat status `approved`
- Polling job status otomatis saat melihat history dengan `?job=ID`
