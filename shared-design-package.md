# Shared Design Package & Visual Components Blueprint
## BukieBrainJobs "Corporate Modern" & "Premium Minimalism" Design System

This blueprint details the **Tailwind CSS** (for Next.js 14 Web/PWA) and **NativeWind v4** (for Expo React Native Mobile) shared visual system. It establishes visual hierarchy, color tokens, and core UI component primitives to ensure identical brand presentation across all platforms [58, 59].

---

## 1. Shared Design Tokens (`theme.ts` / `tailwind.config.js`)

To maintain mathematical consistency between Next.js and Expo, use these exact design tokens in your tailwind/metro configurations [58, 64].

### Tailwind Configuration (`tailwind.config.js` or `packages/shared/theme.ts`)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#001a41',       // Primary foundation: authority and stability [60]
          navyHover: '#000f2d',  // 10% Darker for primary button hover [65]
          emerald: '#296a4b',    // Strategic signal/success CTA (Apply/Book) [61]
          emeraldHover: '#205139',
          crimson: '#ba1a1a',    // Error state [58]
          amber: '#d97706',      // Warning state
          background: '#f8f9ff',  // Base background color [58]
          slate: {
            50: '#f8f9fa',
            100: '#f1f3f5',
            200: '#e9ecef',
            300: '#dee2e6',
            400: '#ced4da',
            500: '#adb5bd',      // Gray neutrals for border and layout [61]
            600: '#6c757d',
            700: '#495057',
            800: '#343a40',
          }
        }
      },
      fontFamily: {
        headline: ['Hanken Grotesk', 'sans-serif'], // Sharp modern edge for display [62]
        body: ['Inter', 'sans-serif'],             // Systematic readability [62]
      },
      borderRadius: {
        'button': '9999px', // Pill-shaped CTAs and status chips [64]
        'input': '1rem',    // approached organic shape language: 16px [64]
        'card': '2rem',     // heavily rounded organic corners: 32px [64]
      },
      boxShadow: {
        // Level 2 Ambient Shadow: Subtle 15% opacity primary navy shadow [63]
        'ambient-hover': '0 4px 20px rgba(0, 26, 65, 0.15)', 
      }
    }
  }
}
```

### Global Typography Utilities (`global.css`)
```css
/* Custom typography classes enforcing minimum 1.5x line height and premium letter tracking [62] */
@layer utilities {
  .typo-display {
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 3rem; /* 48px */
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: #001a41;
  }
  .typo-headline {
    font-family: 'Hanken Grotesk', sans-serif;
    font-size: 1.5rem; /* 24px */
    font-weight: 600;
    line-height: 1.33;
    color: #001a41;
  }
  .typo-body-lg {
    font-family: 'Inter', sans-serif;
    font-size: 1.125rem; /* 18px */
    font-weight: 400;
    line-height: 1.55;
    letter-spacing: 0.01em;
  }
  .typo-body-md {
    font-family: 'Inter', sans-serif;
    font-size: 1rem; /* 16px */
    font-weight: 400;
    line-height: 1.5;
  }
  .typo-label-md {
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem; /* 14px */
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: 0.05em;
  }
}
```

---

## 2. Shared Core UI Components (React/TypeScript)

Below are cross-platform visual structures. For Expo Mobile, these map directly via **NativeWind v4** (using `className`), only falling back to inline styling or `StyleSheet` for safe-areas, keyboards, and animation values [260].

### A. Buttons (`Button.tsx`)
```tsx
import React from 'react';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'accent';
  onPress: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  variant = 'primary', 
  onPress, 
  disabled = false 
}) => {
  const baseStyle = "rounded-full px-6 py-3 font-body text-center font-medium transition-all duration-200 active:scale-95";
  
  const variantStyles = {
    primary: "bg-brand-navy text-white hover:bg-brand-navyHover", // Pill-shaped deep navy [65]
    secondary: "border border-brand-navy text-brand-navy bg-transparent hover:bg-brand-navy/5", // 1px border [65]
    accent: "bg-brand-emerald text-white hover:bg-brand-emeraldHover" // Emerald signals primary submit [65]
  };

  return (
    <button 
      onClick={onPress}
      disabled={disabled}
      className={`${baseStyle} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  );
};
```

### B. Service/Artisan Card (`Card.tsx`)
Enforces Level 2 Hover Shadow Tinted with Deep Navy [63, 65].
```tsx
import React from 'react';

interface CardProps {
  title: string;
  subtitle: string;
  image?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, image, onClick, children }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-brand-slate-200 rounded-card p-6 transition-all duration-300 hover:shadow-ambient-hover hover:border-transparent cursor-pointer"
    >
      {image && <img src={image} alt={title} className="w-full h-40 object-cover rounded-input mb-4" />}
      <h3 className="font-headline text-lg font-semibold text-brand-navy mb-1">{title}</h3>
      <p className="font-body text-sm text-brand-slate-600 mb-4">{subtitle}</p>
      {children}
    </div>
  );
};
```

### C. Input Field with Floating Visual Focus (`InputField.tsx`) Enforces 1rem corner radius [64, 65]
```tsx
import React from 'react';

interface InputFieldProps {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: string) => void;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  placeholder, 
  type = 'text', 
  value, 
  onChange, 
  error 
}) => {
  return (
    <div className="flex flex-col mb-4">
      <label className="font-body text-sm font-medium text-brand-navy mb-2 tracking-wide">
        {label}
      </label>
      <input 
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-brand-slate-300 rounded-input px-4 py-3 font-body text-base outline-none transition-all focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
      />
      {error && <span className="font-body text-xs text-brand-crimson mt-1">{error}</span>}
    </div>
  );
};
```

---

## 3. Specialized BukieBrainJobs Trust & Security Elements

These bespoke UI elements handle our two structural competitive moats: **BukiePassport** verification and the secure **Milestone Escrow** lifecycle [174, 516].

### A. The BukiePassport Verification Badge (`BukiePassportBadge.tsx`)
```tsx
import React from 'react';

interface BukiePassportProps {
  ninVerified: boolean;
  biometricMatch: boolean;
  faceMatch: boolean;
  compact?: boolean;
}

export const BukiePassportBadge: React.FC<BukiePassportProps> = ({
  ninVerified,
  biometricMatch,
  faceMatch,
  compact = false
}) => {
  const isFullyVerified = ninVerified && biometricMatch && faceMatch;

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${isFullyVerified ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-slate-100 text-brand-slate-600'}`}>
        <span className="text-xs font-semibold tracking-wider font-body">BukiePassport ✓</span>
      </div>
    );
  }

  return (
    <div className="border border-brand-slate-200 rounded-card p-5 bg-white shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-brand-slate-100 pb-3">
        <span className="font-headline font-bold text-brand-navy">BukiePassport Status</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isFullyVerified ? 'bg-brand-emerald/15 text-brand-emerald' : 'bg-brand-amber/15 text-brand-amber'}`}>
          {isFullyVerified ? 'Active Vetting' : 'Vetting Incomplete'}
        </span>
      </div>
      <div className="flex flex-col gap-2 font-body text-sm">
        <div className="flex items-center justify-between">
          <span className="text-brand-slate-600">NIN Identity Anchor</span>
          <span className={ninVerified ? 'text-brand-emerald font-bold' : 'text-brand-slate-400'}>
            {ninVerified ? 'Verified ✓' : 'Pending'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-brand-slate-600">SmartSelfie Face-Match</span>
          <span className={faceMatch ? 'text-brand-emerald font-bold' : 'text-brand-slate-400'}>
            {faceMatch ? 'Verified ✓' : 'Pending'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-brand-slate-600">Biometric Check</span>
          <span className={biometricMatch ? 'text-brand-emerald font-bold' : 'text-brand-slate-400'}>
            {biometricMatch ? 'Verified ✓' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
};
```

### B. Escrow Transaction Shield (`EscrowShield.tsx`)
Conveys security messaging regarding authorized payment locks to build platform trust [176].
```tsx
import React from 'react';

interface EscrowProps {
  amount: number;
  status: 'PENDING_AUTHORIZATION' | 'HELD_IN_ESCROW' | 'RELEASED_TO_ARTISAN' | 'REFUNDED';
}

export const EscrowShield: React.FC<EscrowProps> = ({ amount, status }) => {
  const textMapping = {
    PENDING_AUTHORIZATION: 'Authorizing pre-payment hold...',
    HELD_IN_ESCROW: 'Locked safely in Milestone Escrow',
    RELEASED_TO_ARTISAN: 'Milestone complete - funds disbursed',
    REFUNDED: 'Milestone canceled - funds returned'
  };

  const statusColors = {
    PENDING_AUTHORIZATION: 'bg-brand-slate-100 text-brand-slate-700 border-brand-slate-300',
    HELD_IN_ESCROW: 'bg-brand-navy text-white border-transparent',
    RELEASED_TO_ARTISAN: 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20',
    REFUNDED: 'bg-brand-crimson/10 text-brand-crimson border-brand-crimson/20'
  };

  return (
    <div className={`flex flex-col items-center p-4 border rounded-card text-center gap-2 ${statusColors[status]}`}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/20">
        {/* SVG Shield / Lock representation */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <span className="font-headline font-bold text-lg">₦{amount.toLocaleString()}</span>
      <p className="font-body text-xs tracking-wide">{textMapping[status]}</p>
    </div>
  );
};
```

### C. Bottom Animated Navigation Bar (React Native NativeWind/Zustand Pattern)
Custom tab bar supporting springy selection indicators moving smoothly between routes [137].
```tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

interface TabBarProps {
  activeRouteName: string;
  onNavigate: (routeName: string) => void;
}

export const BottomTabBar: React.FC<TabBarProps> = ({ activeRouteName, onNavigate }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const routes = [
    { name: 'Home', icon: '🏠' },
    { name: 'Learn', icon: '📚' },
    { name: 'AI Teacher', icon: '🤖' },
    { name: 'Chat', icon: '💬' },
    { name: 'Profile', icon: '👤' }
  ];

  const handlePress = (index: number, name: string) => {
    // Linear smooth animation instead of bouncy spring [139]
    Animated.timing(slideAnim, {
      toValue: index * TAB_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onNavigate(name);
  };

  return (
    <View className="flex-row bg-white border-t border-brand-slate-200 h-20 items-center justify-start pb-4 relative">
      {/* Sliding active indicator circle [137] */}
      <Animated.View 
        style={{
          transform: [{ translateX: slideAnim }],
          width: TAB_WIDTH,
          position: 'absolute',
          top: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View className="w-12 h-12 bg-brand-navy rounded-full items-center justify-center shadow-ambient-hover" />
      </Animated.View>

      {routes.map((route, index) => {
        const isActive = activeRouteName === route.name;

        return (
          <TouchableOpacity
            key={route.name}
            onPress={() => handlePress(index, route.name)}
            activeOpacity={0.8}
            style={{ width: TAB_WIDTH }}
            className="items-center justify-center h-full"
          >
            {isActive ? (
              // Active: Show icon only within the colored sliding bubble [137]
              <Text className="text-xl text-white z-10">{route.icon}</Text>
            ) : (
              // Inactive: Show both icon and label [137]
              <View className="items-center justify-center">
                <Text className="text-xl text-brand-slate-500">{route.icon}</Text>
                <Text className="font-body text-xs text-brand-slate-500 mt-1 font-medium">{route.name}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
```

---

## 4. Engineering Action Steps

1. **Verify Tokens**: Ensure the colors perfectly align with your brand parameters before styling layout layers [105].
2. **Build and Validate visually**: Compile this file package in `packages/shared/` so that both your Next.js web application and Expo Mobile app import and parse from the identical definitions [113].
3. **Draft UI using local Mock Stores**: Build screens in Phase 1 with 100% simulated transactions prior to database integration [120, 212].
