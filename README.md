# nullbin

A privacy-first, client-side encrypted pastebin alternative. No accounts, no tracking, just secure sharing.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

NullBin solves the problem of sharing sensitive code, notes, or data securely without requiring user accounts or exposing content to servers. All content is encrypted client-side before transmission, ensuring complete privacy.

**Who it's for:** Developers, security-conscious users, and anyone who needs to share encrypted content temporarily.

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: MongoDB with TTL indexes
- **Encryption**: Web Crypto API (AES-256-GCM)
- **Syntax Highlighting**: Shiki
- **Deployment**: Vercel-ready

## Features

- **Client-Side Encryption**: All content encrypted in browser before transmission
- **Auto-Expiring Pastes**: Set expiration times (1h, 1d, 7d, 30d, or never)
- **Syntax Highlighting**: Support for 40+ programming languages
- **Optional Password Protection**: Add extra security layer
- **No Registration**: Share instantly without accounts
- **Secure Sharing**: Decryption keys in URL hash, never sent to server

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/marvellousz/nullbin.git
   cd nullbin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Create `.env.local` with:
   ```env
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=nullbin
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to use the application.

## Usage

### Creating a Paste

1. **Click "Start Creating"** on the homepage
2. **Enter your content** in the editor
3. **Select language** for syntax highlighting
4. **Choose expiry time** (1h, 1d, 7d, 30d, or never)
5. **Optionally set password** for extra security
6. **Click "Create Paste"** to generate encrypted link
7. **Share the link** - decryption key is in the URL hash

### Viewing a Paste

1. **Click "Find Paste"** on the homepage
2. **Enter paste ID or full URL** with hash fragment
3. **Content decrypts automatically** in your browser
4. **No server access** to your content

## Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository** to Vercel
2. **Add environment variables** in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `MONGODB_DB`: Your database name
   - `NEXT_PUBLIC_BASE_URL`: Your production domain
3. **Deploy** - Vercel handles the build automatically

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- `MONGODB_URI` (MongoDB Atlas connection string)
- `MONGODB_DB` (database name)
- `NEXT_PUBLIC_BASE_URL` (production domain)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- **GitHub**: [https://github.com/marvellousz/nullbin](https://github.com/marvellousz/nullbin)

---

Built with ❤️ for privacy