# DeGearns NFT Marketplace Admin Panel

A modern, feature-rich admin panel for the DeGearns NFT marketplace built with React.js and Vite.

## Features

- **Xaman Wallet Authentication**: Secure admin login via Xaman (XUMM) wallet connection
- **Dashboard**: Real-time marketplace statistics with interactive charts
- **User Management**: Block/unblock users, view user details and activity
- **Transactions**: Monitor all marketplace transactions (sales, listings, transfers, auctions)
- **Leaderboards**: View top 10 traders, creators, and influencers
- **Rewards System**: Send rewards to top performers individually or in batches
- **Platform Settings**: Configure platform fees, admin wallets, and feature toggles

## Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Charting library
- **Lucide React** - Icon library
- **XUMM SDK** - Xaman wallet integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/degearns-admin-panel.git
cd degearns-admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.jsx       # Main layout with sidebar navigation
├── context/             # React context providers
│   └── AuthContext.jsx  # Authentication state management
├── pages/               # Page components
│   ├── Dashboard.jsx    # Main dashboard with stats
│   ├── Login.jsx        # Xaman wallet login
│   ├── Users.jsx        # User management
│   ├── Transactions.jsx # Transaction history
│   ├── Leaderboards.jsx # Top performers
│   ├── Rewards.jsx      # Reward management
│   └── Settings.jsx     # Platform settings
├── App.jsx              # Main app with routing
├── main.jsx             # Entry point
└── index.css            # Global styles with Tailwind
```

## Configuration

### Admin Wallets

To configure authorized admin wallets, update the `ADMIN_WALLETS` array in `src/context/AuthContext.jsx`:

```javascript
const ADMIN_WALLETS = [
  'rYourAdminWallet1...',
  'rYourAdminWallet2...',
]
```

### Xaman Integration

For production use, you'll need to:

1. Create a Xaman Developer account
2. Get your API key and secret
3. Implement the backend API for payload creation and verification
4. Update the `AuthContext.jsx` to call your backend API

## Screenshots

The admin panel features a modern dark theme with:
- Responsive sidebar navigation
- Interactive charts and statistics
- User-friendly tables with search and filtering
- Modal dialogs for actions
- Toast notifications for feedback

## License

MIT License
