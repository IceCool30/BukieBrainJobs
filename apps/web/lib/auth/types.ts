export type AuthProvider = 'google' | 'apple' | 'phone' | 'email';

export type AuthMode =
  | 'welcome'
  | 'signin'
  | 'register'
  | 'role_select'
  | 'phone_otp'
  | 'forgot_password'
  | 'reset_password';

export type UserRole = 'customer' | 'brainworker';

export interface MockSessionUser {
  id: string;
  name: string;
  role: 'client' | 'artisan' | 'admin';
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string | undefined;
  phone?: string | undefined;
  provider: AuthProvider;
  role: UserRole;
  isBrainWorkerApproved: boolean; // Always false for new registrations; approval requires separate verification
}

export interface PreservedBookingDraft {
  service?: string | undefined;
  priceContext?: string | undefined;
  city?: string | undefined;
  worker?: string | null | undefined;
  streetAddress?: string | undefined;
  landmark?: string | undefined;
  date?: string | undefined;
  arrivalWindow?: string | undefined;
  jobDescription?: string | undefined;
  paymentPreference?: string | undefined;
}

export interface AuthState {
  user: AuthUser | null;
  mode: AuthMode;
  role: UserRole;
  phone: string;
  email: string;
  isSubmitting: boolean;
  error?: string | undefined;
  successMessage?: string | undefined;
  preservedBooking: PreservedBookingDraft | null;
  returnUrl: string;
}
