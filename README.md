# FinTrack - Personal Finance Management App

A modern, cross-platform mobile application built with React Native and Expo for tracking personal finances, managing transactions, and analyzing spending patterns. FinTrack provides an intuitive interface with beautiful glassmorphism design, real-time currency conversion, and comprehensive financial analytics.

## Overview

FinTrack is a full-featured personal finance management application that helps users take control of their financial life. The app allows users to track income and expenses, categorize transactions, view detailed analytics, and manage their budget across multiple currencies. Built with a focus on user experience, the app features smooth animations, dark mode support, and a clean, modern interface.

## Features

### 🔐 Authentication & Security
- **Email-based authentication** with email verification code flow
- **Social authentication** via Google and Apple Sign-In
- **Secure session management** with JWT tokens
- **Email verification** with 6-digit code verification screen
- **Session-based verification** with resend code functionality

### 💰 Transaction Management
- **Add transactions** with income and expense tracking
- **Transaction details** including amount, category, date, and notes
- **Recurring transactions** support for regular payments
- **Transaction filtering** by type, category, and date range
- **Transaction editing and deletion**
- **Quick transaction entry** with intuitive form interface

### 📊 Financial Analytics
- **Dashboard overview** with total balance, income, and expenses
- **Visual charts** including bar charts and pie charts
- **Category-wise spending analysis** with percentage breakdowns
- **Period-based filtering** (month, quarter, year)
- **Savings calculation** and financial health metrics
- **Recent transactions** quick view

### 🌍 Multi-Currency Support
- **Real-time exchange rates** fetched from external API
- **Currency conversion** for USD, EUR, GBP, RUB, JPY
- **Offline rate caching** with fallback rates
- **Currency selection** in settings
- **Automatic amount conversion** throughout the app

### 🎨 User Interface & Experience
- **Glassmorphism design** with blur effects and translucent cards
- **Dark mode** with system preference detection
- **Smooth animations** powered by React Native Reanimated
- **Haptic feedback** for better user interaction
- **Pull-to-refresh** functionality
- **Responsive layout** optimized for iOS and Android
- **Safe area handling** for modern device screens

### 📱 Core Screens
- **Welcome Screen** - First-time user onboarding
- **Authentication** - Login and signup with email verification
- **Dashboard** - Financial overview with balance and summary cards
- **Transactions** - Complete transaction list with filtering
- **Add Transaction** - Quick entry form for new transactions
- **Analytics** - Visual charts and spending insights
- **Settings** - App preferences, currency selection, and account management
- **Category Management** - Custom category creation and editing

### 🗂️ Category Management
- **Predefined categories** for common expenses
- **Custom category creation** with icons and colors
- **Category editing** and deletion
- **Category filtering** by transaction type
- **Visual category chips** with color coding

## Tech Stack

### Core Framework
- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (~54.0.33) - Development platform and tooling
- **Expo Router** (~6.0.23) - File-based routing system
- **TypeScript** (~5.9.2) - Type-safe development

### UI & Styling
- **React Native Reanimated** (~4.1.1) - Smooth animations and gestures
- **Expo Blur** (~15.0.8) - Glassmorphism blur effects
- **Expo Linear Gradient** (~15.0.8) - Gradient backgrounds
- **React Native Chart Kit** (^6.12.0) - Data visualization
- **React Native SVG** (15.12.1) - Vector graphics
- **Custom theme system** with light/dark mode support

### Navigation
- **React Navigation** (^7.1.8) - Navigation library
- **Expo Router** - File-based routing with typed routes
- **Bottom tab navigation** with custom tab bar

### State Management
- **React Context API** - Global state management
- **AsyncStorage** (2.2.0) - Local data persistence
- **Custom hooks** for currency conversion and app state

### Authentication
- **Expo Apple Authentication** (~8.0.8) - Apple Sign-In
- **Expo Auth Session** (~7.0.10) - OAuth flows
- **JWT token management** with secure storage

### Utilities
- **Expo Haptics** (~15.0.8) - Tactile feedback
- **Expo Constants** (~18.0.13) - App configuration
- **React Native Safe Area Context** (~5.6.0) - Safe area handling
- **React Native Gesture Handler** (~2.28.0) - Touch gestures
- **React Native Modal DateTime Picker** (^18.0.0) - Date selection

### Fonts
- **Outfit** (600 SemiBold, 700 Bold) - Headings
- **DM Sans** (400 Regular, 500 Medium, 600 SemiBold) - Body text

## Project Structure

```
finance-app-frontend/
├── app/                          # Expo Router app directory
│   ├── (tabs)/                  # Tab navigation screens
│   │   ├── index.tsx            # Dashboard screen
│   │   ├── transactions.tsx    # Transactions list
│   │   ├── add.tsx              # Add transaction screen
│   │   ├── analytics.tsx         # Analytics and charts
│   │   ├── settings.tsx         # Settings screen
│   │   └── _layout.tsx          # Tab layout configuration
│   ├── auth.tsx                 # Authentication screen
│   ├── verify-code.tsx          # Email verification screen
│   ├── welcome.tsx              # Welcome/onboarding screen
│   ├── categories.tsx           # Category management
│   ├── transaction/[id].tsx    # Transaction detail screen
│   └── _layout.tsx              # Root layout and navigation
├── components/                  # Reusable UI components
│   ├── ui/
│   │   └── glass-card.tsx       # Glassmorphism card component
│   ├── category-chip.tsx        # Category display chip
│   ├── summary-card.tsx         # Financial summary card
│   └── transaction-row.tsx      # Transaction list item
├── context/                     # React Context providers
│   ├── AuthContext.tsx          # Authentication state
│   ├── AppContext.tsx           # App-wide state (transactions, categories)
│   └── ThemeContext.tsx         # Theme and appearance
├── services/                    # API and business logic
│   ├── api-client.ts           # HTTP client and error handling
│   ├── auth.ts                  # Authentication service
│   ├── transactions.ts          # Transaction API service
│   ├── categories.ts            # Category API service
│   ├── exchange-rates.ts        # Currency exchange rate service
│   └── mock-data.ts             # Mock data for development
├── hooks/                       # Custom React hooks
│   └── useCurrency.ts           # Currency conversion hook
├── types/                       # TypeScript type definitions
│   ├── auth.ts                  # Authentication types
│   └── index.ts                 # General app types
├── constants/                   # App constants
│   └── theme.ts                 # Theme colors, spacing, typography
└── assets/                      # Images, fonts, and static assets
```

## Architecture

### State Management
The app uses React Context API for global state management with three main contexts:

1. **AuthContext** - Manages user authentication state, login/logout, and token persistence
2. **AppContext** - Handles transactions, categories, currency selection, and financial statistics
3. **ThemeContext** - Controls theme mode (light/dark/system) and color scheme

### API Integration
- **RESTful API client** with automatic token injection
- **Error handling** with custom ApiError class
- **Mock mode** toggle for development without backend
- **Type-safe API calls** with TypeScript interfaces

### Data Persistence
- **AsyncStorage** for user preferences and tokens
- **Exchange rate caching** with TTL (1 hour)
- **Offline fallback rates** for currency conversion

### Navigation Flow
```
Welcome → Auth → Verify Code → Dashboard
                ↓
         (Tabs: Dashboard, Transactions, Add, Analytics, Settings)
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finance-app-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on a platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your device

### Available Scripts

- `npm start` - Start Expo development server
- `npm run ios` - Start and open iOS simulator
- `npm run android` - Start and open Android emulator
- `npm run web` - Start web version
- `npm run lint` - Run ESLint

## Configuration

### API Configuration
The app connects to a FastAPI backend. Configure the API URL via the `EXPO_PUBLIC_API_URL` environment variable. Default: `http://localhost:8000/api/v1`

### Mock Mode
Toggle mock mode in `services/api-client.ts`:
```typescript
export const USE_MOCK = true; // Set to false for real API
```

When mock mode is enabled, the app uses local mock data instead of making API calls.

## Key Features Explained

### Email Verification Flow
After signup or login, users receive a 6-digit verification code via email. The verification screen features:
- Auto-advancing digit inputs
- Paste support for SMS autofill
- Resend code functionality with 60-second cooldown
- Error handling for expired/invalid codes

### Currency Conversion
All amounts are stored in USD on the backend. The frontend:
- Fetches exchange rates from external API
- Caches rates for 1 hour
- Falls back to hardcoded rates when offline
- Converts and displays amounts in selected currency

### Glassmorphism Design
The app uses a modern glassmorphism aesthetic with:
- Translucent cards with blur effects
- Subtle borders and shadows
- Gradient backgrounds
- Smooth animations and transitions

### Analytics
The analytics screen provides:
- Bar charts for income/expense trends
- Pie charts for category-wise spending
- Period filtering (month/quarter/year)
- Visual insights into spending patterns

## Development Notes

### Type Safety
The project uses TypeScript throughout with strict type checking. All API responses and component props are typed.

### Code Style
- ESLint configuration with Expo preset
- Consistent naming conventions
- Component-based architecture
- Separation of concerns (services, components, contexts)

### Performance Optimizations
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers
- Lazy loading for screens
- Optimized re-renders with Context splitting

## Backend Integration

This frontend expects a FastAPI backend with the following endpoints:
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-code` - Email verification
- `POST /auth/resend-code` - Resend verification code
- `POST /auth/social` - Social authentication
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout
- `GET /transactions` - List transactions
- `POST /transactions` - Create transaction
- `GET /transactions/:id` - Get transaction
- `PATCH /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction
- `GET /transactions/stats` - Get statistics
- `GET /categories` - List categories
- `POST /categories` - Create category
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

See `BACKEND_HANDOFF.md` for complete API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Version

Current version: **1.0.0**

---

Built with ❤️ using React Native and Expo
