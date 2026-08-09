import { create } from 'zustand';
import { 
  UserRole, 
  TaskCategory, 
  ArtisanProfile, 
  TaskBooking, 
  ChatMessage, 
  ArtisanWallet, 
  AdminDispute,
  TaskStatus 
} from '@bukiebrainjobs/types';
import { 
  MOCK_CATEGORIES, 
  MOCK_ARTISANS, 
  MOCK_BOOKINGS, 
  MOCK_CHAT_MESSAGES, 
  MOCK_ARTISAN_WALLET, 
  MOCK_ADMIN_DISPUTES 
} from './mockData';

// Re-export mock data
export * from './mockData';

// --- AUTH STORE ---
interface AuthState {
  currentRole: UserRole;
  userPhone: string;
  userName: string;
  isLoggedIn: boolean;
  passportStatus: 'Unverified' | 'Pending Lite' | 'Verified Lite' | 'Verified Pro';
  setRole: (role: UserRole) => void;
  login: (phone: string, name: string) => void;
  logout: () => void;
  submitPassportLite: (bvn: string, nin: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentRole: 'client',
  userPhone: '+2348011112222',
  userName: 'Dr. Tunde Fashola',
  isLoggedIn: true,
  passportStatus: 'Verified Pro',
  setRole: (role) => set({ currentRole: role }),
  login: (phone, name) => set({ isLoggedIn: true, userPhone: phone, userName: name }),
  logout: () => set({ isLoggedIn: false }),
  submitPassportLite: () => set({ passportStatus: 'Pending Lite' }),
}));

// --- BOOKINGS & MATCHING STORE ---
interface BookingState {
  categories: TaskCategory[];
  artisans: ArtisanProfile[];
  bookings: TaskBooking[];
  activeBookingId: string | null;
  selectedCity: string;
  searchQuery: string;
  selectedCategorySlug: string | null;
  chatMessages: Record<string, ChatMessage[]>;
  
  setSelectedCity: (city: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategorySlug: (slug: string | null) => void;
  setActiveBookingId: (id: string | null) => void;
  createBookingDraft: (booking: Omit<TaskBooking, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateBookingStatus: (bookingId: string, status: TaskStatus) => void;
  releaseEscrow: (bookingId: string) => void;
  sendChatMessage: (bookingId: string, text: string, senderRole: UserRole, senderId?: string, senderName?: string) => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  categories: MOCK_CATEGORIES,
  artisans: MOCK_ARTISANS,
  bookings: MOCK_BOOKINGS,
  activeBookingId: 'booking-801',
  selectedCity: 'Lagos',
  searchQuery: '',
  selectedCategorySlug: null,
  chatMessages: {
    'booking-801': MOCK_CHAT_MESSAGES,
  },

  setSelectedCity: (city) => set({ selectedCity: city }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategorySlug: (slug) => set({ selectedCategorySlug: slug }),
  setActiveBookingId: (id) => set({ activeBookingId: id }),

  createBookingDraft: (newBookingData) => {
    const newId = `booking-${Date.now().toString().slice(-4)}`;
    const newBooking: TaskBooking = {
      ...newBookingData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      bookings: [newBooking, ...state.bookings],
      activeBookingId: newId,
    }));
    return newId;
  },

  updateBookingStatus: (bookingId, status) => {
    set((state) => ({
      bookings: state.bookings.map((b) => 
        b.id === bookingId ? { ...b, status, updatedAt: new Date().toISOString() } : b
      ),
    }));
  },

  releaseEscrow: (bookingId) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'completed_and_paid',
              preAuthStatus: 'Captured',
              updatedAt: new Date().toISOString(),
            }
          : b
      ),
    }));
  },

  sendChatMessage: (bookingId, text, senderRole, senderId = 'user_1', senderName = 'Dr. Tunde Fashola') => {
    // Anti-disintermediation check for keyword flagging
    const bypassKeywords = ['cash', 'pay cash', 'bank transfer', 'whatsapp', '080', '090', '070', '081', 'direct payment'];
    const lowerText = text.toLowerCase();
    const isFlagged = bypassKeywords.some((kw) => lowerText.includes(kw));

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      bookingId,
      senderId,
      senderName,
      senderRole,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFlaggedForBypass: isFlagged,
      flaggedReason: isFlagged ? 'Message contains potential off-platform payment terms' : undefined,
    };

    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [bookingId]: [...(state.chatMessages[bookingId] || []), newMessage],
      },
    }));
  },
}));

// --- WALLET & EARNINGS STORE ---
interface WalletState {
  wallet: ArtisanWallet;
  isSameHourAvailable: boolean;
  requestInstantPayout: (amount: number) => void;
  toggleSameHourAvailability: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: MOCK_ARTISAN_WALLET,
  isSameHourAvailable: true,
  requestInstantPayout: (amount) => {
    set((state) => ({
      wallet: {
        ...state.wallet,
        availableBalanceNaira: Math.max(0, state.wallet.availableBalanceNaira - amount),
        recentTransactions: [
          {
            id: `tx-${Date.now()}`,
            bookingId: 'payout',
            description: `Instant Payout to ${state.wallet.payoutBankName}`,
            amountNaira: amount,
            type: 'payout',
            status: 'completed',
            date: new Date().toISOString().split('T')[0] || '2026-08-05',
          },
          ...state.wallet.recentTransactions,
        ],
      },
    }));
  },
  toggleSameHourAvailability: () => {
    set((state) => ({
      isSameHourAvailable: !state.isSameHourAvailable,
    }));
  },
}));

// --- ADMIN DISPUTES & PASSPORT STORE ---
export interface PendingPassportItem {
  id: string;
  applicantName: string;
  bvn: string;
  nin: string;
  faceMatchScore: number;
  submittedAt: string;
}

interface AdminState {
  disputes: AdminDispute[];
  pendingPassports: PendingPassportItem[];
  resolveDispute: (disputeId: string, status: AdminDispute['status']) => void;
  approvePassport: (id: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  disputes: MOCK_ADMIN_DISPUTES,
  pendingPassports: [
    {
      id: 'pass_101',
      applicantName: 'Musa Ibrahim (Generator Specialist)',
      bvn: '222******11',
      nin: '111******44',
      faceMatchScore: 98.4,
      submittedAt: '2026-08-05'
    },
    {
      id: 'pass_102',
      applicantName: 'Chidi Okafor (AC Technician)',
      bvn: '224******99',
      nin: '109******22',
      faceMatchScore: 96.2,
      submittedAt: '2026-08-04'
    }
  ],
  resolveDispute: (disputeId, status) => {
    set((state) => ({
      disputes: state.disputes.map((d) => (d.id === disputeId ? { ...d, status } : d)),
    }));
  },
  approvePassport: (id) => {
    set((state) => ({
      pendingPassports: state.pendingPassports.filter((p) => p.id !== id),
    }));
  },
}));
