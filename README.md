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

- Bun (latest version)
- MongoDB
- Stripe account
- Google OAuth credentials

### MongoDB Setup

1. Install MongoDB:

   - **macOS**: `brew install mongodb-community`
   - **Windows**: Download and install from [MongoDB website](https://www.mongodb.com/try/download/community)
   - **Linux**: Follow distribution-specific instructions from [MongoDB docs](https://www.mongodb.com/docs/manual/administration/install-on-linux/)

2. Start MongoDB:

   - **macOS/Linux**: `mongod --dbpath=/path/to/data/directory`
   - **Windows**: `mongod --dbpath=C:\path\to\data\directory`
   - Or use the MongoDB service if installed

3. Verify MongoDB is running:
   - Connect to MongoDB shell: `mongosh`
   - You should see a connection to localhost:27017

### Database Seeding

The project includes scripts to seed your database with sample data:


Note: The seeding script uses the email specified in the script to associate data with a user. Make sure to update the email in the script (`server/src/scripts/seeder.ts`) to match an existing user in your database.

### Installation

1. Clone the repository

```bash
git clone https://github.com/moritzWa/deeptable.git
cd deeptable
```

2. Install dependencies

```bash
bun install
```

4. Start the development servers


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
