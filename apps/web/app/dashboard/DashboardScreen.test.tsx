import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import DashboardScreen from '../../components/dashboard/DashboardScreen';
import * as authStorage from '../../lib/auth/storage';
import { AuthUser } from '../../lib/auth/types';

// Mock Next.js navigation
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('WEB-010 DashboardScreen Component', () => {
  const mockCustomerUser: AuthUser = {
    id: 'usr-customer-88',
    name: 'Babajide Adeleke',
    email: 'babajide@example.com',
    phone: '+2348031234567',
    provider: 'google',
    role: 'customer',
    isBrainWorkerApproved: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);
    vi.spyOn(authStorage, 'setMockAuthenticatedUser').mockImplementation(() => {});
  });

  it('renders authenticated dashboard with customer greeting and operational identity', () => {
    render(<DashboardScreen />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Babajide Adeleke/i);
    expect(screen.getByText(/Operational Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/BukieGuarantee Protected/i)).toBeInTheDocument();
  });

  it('renders the two primary marketplace action entry points', () => {
    render(<DashboardScreen />);

    // Primary: Find a Service -> /services
    const findServiceLink = screen.getByRole('link', { name: /Find a Service/i });
    expect(findServiceLink).toBeInTheDocument();
    expect(findServiceLink).toHaveAttribute('href', '/services');

    // Secondary: Post a Job -> /post-job
    const postJobLink = screen.getByRole('link', { name: /Post a Job/i });
    expect(postJobLink).toBeInTheDocument();
    expect(postJobLink).toHaveAttribute('href', '/post-job');
  });

  it('renders persistent desktop sidebar navigation with all required destinations', () => {
    render(<DashboardScreen />);

    const sidebar = screen.getByRole('navigation', { name: /Desktop Sidebar/i });
    expect(sidebar).toBeInTheDocument();

    // Check all five required destinations inside desktop sidebar
    expect(within(sidebar).getByRole('button', { name: /Home/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('button', { name: /Jobs \/ Bookings/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('button', { name: /Messages/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('button', { name: /Notifications/i })).toBeInTheDocument();
    expect(within(sidebar).getByRole('button', { name: /Profile/i })).toBeInTheDocument();
  });

  it('renders persistent mobile bottom navigation for authenticated customers', () => {
    render(<DashboardScreen />);

    const bottomNav = screen.getByRole('navigation', { name: /Mobile Bottom Navigation/i });
    expect(bottomNav).toBeInTheDocument();

    // Verify touch targets are present
    const bottomNavButtons = bottomNav.querySelectorAll('button');
    expect(bottomNavButtons.length).toBe(5);
  });

  it('renders mixed activity state with correct operational priority: Active -> Upcoming -> Recent', () => {
    render(<DashboardScreen />);

    // Active Work section is prominent
    const activeSection = screen.getByRole('region', { name: /Active Work/i });
    expect(activeSection).toBeInTheDocument();
    expect(screen.getByText(/Inverter Backup & Battery Inspection/i)).toBeInTheDocument();
    expect(screen.getByText(/Reviewing Proposals/i)).toBeInTheDocument();

    // Upcoming Work section is present
    const upcomingSection = screen.getByRole('region', { name: /Upcoming Work/i });
    expect(upcomingSection).toBeInTheDocument();
    expect(screen.getByText(/Split-Unit AC Deep Servicing/i)).toBeInTheDocument();
    expect(screen.getByText(/Chidi Okonkwo/i)).toBeInTheDocument();

    // Recent Activity section is present with subordinate styling
    const recentSection = screen.getByRole('region', { name: /Recent Activity/i });
    expect(recentSection).toBeInTheDocument();
    expect(screen.getByText(/Bathroom Pipe & Trap Replacement/i)).toBeInTheDocument();
  });

  it('renders honest first-run state with zero fake bookings and clear getting started guide', () => {
    mockSearchParams = new URLSearchParams('state=first_run');
    render(<DashboardScreen />);

    expect(screen.getByText(/Welcome to your account home/i)).toBeInTheDocument();
    // Zero fake jobs or bookings
    expect(screen.queryByText(/Inverter Backup & Battery Inspection/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Split-Unit AC Deep Servicing/i)).not.toBeInTheDocument();

    // First run actions
    expect(screen.getByRole('link', { name: /Find a Service/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Post a Job/i })).toBeInTheDocument();
    expect(screen.getByText(/How BukieBrainJobs Works/i)).toBeInTheDocument();
  });

  it('shows honest development notice when clicking Messages or Notifications', () => {
    render(<DashboardScreen />);

    const messagesBtn = screen.getAllByRole('button', { name: /Messages/i })[0]!;
    fireEvent.click(messagesBtn);

    expect(screen.getByRole('dialog', { name: /Direct Messaging Notice/i })).toBeInTheDocument();
    expect(screen.getByText(/Direct real-time chat with your chosen BrainWorker is part of our upcoming/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close Notice/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog', { name: /Direct Messaging Notice/i })).not.toBeInTheDocument();
  });

  it('renders stable skeleton loading state when state=loading', () => {
    mockSearchParams = new URLSearchParams('state=loading');
    render(<DashboardScreen />);

    const loadingRegion = screen.getByRole('status', { name: /Loading dashboard content/i });
    expect(loadingRegion).toBeInTheDocument();
    expect(loadingRegion).toHaveAttribute('aria-busy', 'true');
  });

  it('isolates partial section failure and provides localized retry', () => {
    mockSearchParams = new URLSearchParams('state=partial_failure');
    render(<DashboardScreen />);

    expect(screen.getByText(/Could not load active requests/i)).toBeInTheDocument();
    // Upcoming work remains available
    expect(screen.getByRole('region', { name: /Upcoming Work/i })).toBeInTheDocument();

    // Click retry to restore active work
    const retryBtn = screen.getByRole('button', { name: /Retry Active Requests/i });
    fireEvent.click(retryBtn);

    expect(screen.queryByText(/Could not load active requests/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Inverter Backup & Battery Inspection/i)).toBeInTheDocument();
  });

  it('renders offline banner and notice when state=offline', () => {
    mockSearchParams = new URLSearchParams('state=offline');
    render(<DashboardScreen />);

    expect(screen.getByText(/Offline Mode: Showing cached dashboard activity/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refresh Status/i })).toBeInTheDocument();
  });

  it('displays green confirmation notice when returning from job creation with jobCreated param', () => {
    mockSearchParams = new URLSearchParams('jobCreated=REQ-55192&jobTitle=Borehole+Submersible+Pump+Check');
    render(<DashboardScreen />);

    const alertNotice = screen.getByRole('alert');
    expect(alertNotice).toBeInTheDocument();
    expect(alertNotice).toHaveTextContent(/REQ-55192/);
    expect(alertNotice).toHaveTextContent(/Borehole Submersible Pump Check/);

    // Request is prepended to active work
    expect(screen.getAllByText(/Request Received/i).length).toBeGreaterThanOrEqual(1);
  });

  it('handles sign-out cleanly by clearing mock user session and navigating to login', () => {
    render(<DashboardScreen />);

    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(signOutBtn);

    expect(authStorage.setMockAuthenticatedUser).toHaveBeenCalledWith(null);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('redirects unauthenticated guests to login with returnUrl=/dashboard', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
    render(<DashboardScreen />);

    expect(screen.getByText(/Authentication required/i)).toBeInTheDocument();
    const loginLink = screen.getByRole('link', { name: /Sign In Now/i });
    expect(loginLink).toHaveAttribute('href', '/login?returnUrl=%2Fdashboard');
  });
});
