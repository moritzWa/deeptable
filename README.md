# DeepTable

A powerful data analysis and visualization SaaS platform with authentication, payments, and a modern UI.

## Features

- 🔐 Authentication with Google OAuth
- 💳 Stripe payment integration
- 🎨 Modern UI with Tailwind CSS and Shadcn UI
- 📱 Responsive design
- 🔍 SEO optimized
- 🚀 Full-stack TypeScript (React + Node.js)
- 📊 MongoDB database integration
- 🔄 Monorepo structure with workspaces

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB
- Stripe account
- Google OAuth credentials

### Installation

1. Clone the repository
```bash
git clone https://github.com/moritzWa/deeptable.git
cd deeptable
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Copy example env files
cp server/.env.example server/.env
touch client/.env
```

4. Update environment variables in both `client/.env` and `server/.env`

5. Start the development server
```bash
npm run dev
```

## Customization

Search for "GitHire" in the codebase to find all instances that need to be replaced with your own brand name. Key files to check:

- `client/src/components/LandingPage.tsx`
- `client/src/App.tsx`
- `client/src/components/navbar.tsx`
- `client/src/app/blog/posts/index.tsx`
- `server/src/index.ts`

## Deployment

The application is set up as a monorepo with separate client and server packages:

- Frontend: Deploy the `client` directory to a static hosting service
- Backend: Deploy the `server` directory to a Node.js hosting service

## License

MIT

## Support

For questions or support, please open an issue in the repository. 