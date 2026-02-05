# Athena Dashboard - Frontend

React + TypeScript frontend application for the Athena BI Dashboard.

## Tech Stack

- **React 19** + **TypeScript** - UI framework
- **Vite** - Build tool and dev server
- **Material-UI (MUI) v5** - UI component library
- **React Router v6** - Routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **Recharts + ECharts** - Data visualization
- **TanStack Table** - Data tables
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Update `.env.local` with your configuration:
   ```bash
   VITE_API_URL=http://localhost:8000
   ```

### Development

Start the development server:

```bash
pnpm dev
# or
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

### Build

Build for production:

```bash
pnpm build
# or
npm run build
```

### Preview Production Build

```bash
pnpm preview
# or
npm run preview
```

## Project Structure

```
src/
├── api/              # API client and endpoints
├── components/       # Reusable components
│   ├── common/      # Generic components
│   ├── charts/      # Chart components
│   ├── tables/      # Table components
│   ├── filters/     # Filter components
│   └── layout/      # Layout components
├── features/         # Feature modules
│   ├── auth/        # Authentication
│   └── dashboard/   # Dashboard features
├── pages/           # Page components
├── store/           # State management (Zustand)
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── styles/          # Theme and styles
└── types/           # TypeScript types
```

## Development Status

🚧 **Phase 1 Complete** - Basic skeleton with routing and placeholder pages.

Next: Phase 2 - Authentication & Login Screen
