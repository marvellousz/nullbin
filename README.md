# NullBin

A privacy-first, client-side encrypted, optionally self-hostable Pastebin alternative with a clean, modern UX.

**No accounts. No tracking. Just safe sharing.**

## Features

- **Client-Side Encryption**: All paste content is encrypted with AES-256 before sending to server
- **Shareable Links**: Hash fragment contains decryption key (never sent to server)
- **Optional Password**: Add extra protection with user-defined passwords
- **Expiry Support**: Auto-delete pastes after specified time (1h, 1d, 7d, 30d, or never)
- **Dark Mode UI**: Clean, focused interface with dark/light theme toggle
- **Syntax Highlighting**: Support for 40+ programming languages using Shiki
- **Responsive Design**: Works perfectly on desktop and mobile
- **Self-Hostable**: Deploy on your own infrastructure

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with TTL (Time To Live) indexes
- **Encryption**: Web Crypto API (AES-GCM)
- **Syntax Highlighting**: Shiki
- **Deployment**: Vercel-ready (or any Node.js hosting)

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
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
   
   Edit `.env.local` and configure your MongoDB connection:
   ```env
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=nullbin
   ```

4. **Start MongoDB**
   
   **Option A: Local MongoDB**
   ```bash
   # Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
   # Then start the service
   mongod
   ```
   
   **Option B: MongoDB Atlas (Cloud)**
   - Create a free account at [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a new cluster
   - Get your connection string and update `MONGODB_URI` in `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB`: Database name (default: 'nullbin')

### Database Setup

The application automatically:
- Creates necessary indexes for performance
- Sets up TTL (Time To Live) indexes for automatic cleanup of expired pastes
- Initializes the database schema on first run

## Security Features

### Client-Side Encryption
- All paste content is encrypted using AES-256-GCM before transmission
- Encryption key is generated client-side and never sent to the server
- Hash fragment in URLs contains the decryption key (not sent in HTTP requests)

### Data Privacy
- Server only stores encrypted content
- No user accounts or tracking
- Automatic expiration of pastes
- Optional password protection for additional security

## API Reference

### Create Paste
```http
POST /api/paste
Content-Type: application/json

{
  "title": "Optional title",
  "content": "encrypted_content_here",
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

## Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `MONGODB_DB`: Your database name

### Self-Hosting

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Set up reverse proxy** (optional)
   Configure nginx or Apache to proxy requests to your Next.js application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/nullbin/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Made with care for privacy and security**
