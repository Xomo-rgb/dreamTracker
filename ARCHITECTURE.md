# DreemTrack - Medical Patient Management App

A React Native Expo app converted from Flutter with excellent component composition, reusability, and separation of concerns.

## 🏗️ Architecture

### Clean Architecture Principles

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card)
│   └── common/         # Business-specific components (Header, PatientCard)
├── screens/            # Screen components
├── hooks/              # Custom React hooks for state management
├── services/           # External service integrations (Firebase, API)
├── theme/              # Design system and theming
└── types/              # TypeScript type definitions
```

### Key Features

- **Component Composition**: Highly reusable components with prop-based customization
- **Separation of Concerns**: Clear separation between UI, business logic, and data
- **Custom Hooks**: Encapsulated state management and side effects
- **TypeScript**: Full type safety throughout the application
- **Theme System**: Consistent design system with centralized styling

## 🚀 Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install firebase @react-native-async-storage/async-storage expo-linear-gradient
   ```

2. **Configure Firebase**
   - Update `src/services/authService.ts` with your Firebase config
   - Add your `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

3. **Run the App**
   ```bash
   npm start
   ```

## 🎨 Component Examples

### Reusable Button Component
```tsx
<Button
  title="Sign In"
  onPress={handleSignIn}
  variant="primary"
  size="large"
  loading={isLoading}
/>
```

### Composable Input Component
```tsx
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  leftIcon="mail-outline"
  keyboardType="email-address"
  error={emailError}
/>
```

### Patient Card with Navigation
```tsx
<PatientCard
  patient={patient}
  onPress={() => router.push('/patient-detail')}
/>
```

## 🔧 Custom Hooks

### Authentication Hook
```tsx
const { user, loading, signIn, signOut, isAuthenticated } = useAuth();
```

## 🎯 Best Practices Implemented

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition over Inheritance**: Components are composed rather than extended
3. **Props Interface**: Clear TypeScript interfaces for all component props
4. **Theme Consistency**: All styling uses the centralized theme system
5. **Error Boundaries**: Proper error handling and user feedback
6. **Performance**: Optimized re-renders with proper dependency arrays

## 📱 Screens

- **Login Screen**: Authentication with form validation
- **Home Screen**: Dashboard with statistics and quick actions
- **Patients Screen**: List with search and filtering
- **Patient Detail**: Individual patient information and actions

## 🔐 Authentication Flow

The app uses Firebase Authentication with a custom `useAuth` hook that provides:
- User state management
- Authentication methods (sign in, sign up, sign out)
- Loading states
- Error handling

## 🎨 Design System

The theme system provides:
- Consistent colors, spacing, and typography
- Responsive design tokens
- Dark/light mode support (ready for implementation)
- Reusable style patterns

This architecture ensures maintainability, scalability, and excellent developer experience while following React Native and Expo best practices.