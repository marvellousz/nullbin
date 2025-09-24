# nullbin

A privacy-first, client-side encrypted pastebin alternative. No accounts, no tracking, just secure sharing.

## Features

- Client-side encryption (AES-256)
- Auto-expiring pastes
- Syntax highlighting
- Optional password protection
- No registration required

## Tech Stack

- Next.js 15 with TypeScript
- MongoDB with TTL indexes
- Tailwind CSS
- Web Crypto API

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone and install dependencies:
```bash
git clone https://github.com/yourusername/nullbin.git
cd nullbin
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=nullbin
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. Start MongoDB:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `MONGODB_URI`: MongoDB connection string (required)
- `MONGODB_DB`: Database name (default: 'nullbin')
- `NEXT_PUBLIC_BASE_URL`: Base URL for shareable links (optional)

## Usage

### Creating a Paste

1. Click "Start Creating"
2. Enter your content
3. Select language and expiry time
4. Optionally set a password
5. Click "Create Paste"
6. Share the generated link

### Viewing a Paste

1. Click "Find Paste"
2. Enter paste ID or full URL
3. Content decrypts automatically in your browser

## Security

- All content encrypted client-side before transmission
- Decryption keys stored in URL hash (never sent to server)
- Server only stores encrypted data
- Automatic paste expiration

## Deployment

### Vercel

1. Deploy to Vercel:
```bash
npm i -g vercel
vercel
```

2. Set environment variables in Vercel dashboard:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `MONGODB_DB`: Your database name

### Self-Hosting

Deploy to any Node.js hosting platform with MongoDB support.

## API

### Create Paste
```http
POST /api/paste
Content-Type: application/json

{
  "content": "encrypted_content",
  "language": "javascript",
  "expiry": "1d",
  "iv": "initialization_vector",
  "password": "optional_password_hash"
}
```

### Get Paste
```http
GET /api/paste/[id]
```

## License

MIT