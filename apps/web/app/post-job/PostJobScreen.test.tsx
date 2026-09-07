import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import PostJobScreen from '../../components/post-job/PostJobScreen';
import {
  savePreservedJobDraft,
  clearPreservedJobDraft,
  getPreservedJobDraft,
  setMockAuthenticatedUser,
} from '../../lib/auth';

function makeSearchParams(params: Record<string, string> = {}): ReadonlyURLSearchParams {
  return new URLSearchParams(params) as unknown as ReadonlyURLSearchParams;
}

function makeRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  };
}

afterEach(() => {
  cleanup();
  clearPreservedJobDraft();
  setMockAuthenticatedUser(null);
  vi.clearAllMocks();
});

describe('PostJobScreen: Initial Render & Defaults', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({}));
  });

  it('renders page hero, five form sections, and preview summary card with defaults', () => {
    render(<PostJobScreen />);

    // Page title and subtitle
    expect(
      screen.getByRole('heading', { level: 1, name: /post a job & receive quotes/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/describe your project, maintenance, or repair needs/i)).toBeInTheDocument();

    // Section 1: Job Requirement
    expect(screen.getByRole('heading', { level: 2, name: /job requirement/i })).toBeInTheDocument();
    const specificServiceRadio = screen.getByRole('radio', { name: /specific service/i });
    expect(specificServiceRadio).toBeChecked();

    // Category dropdown
    const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;
    expect(categorySelect.value).toBe('');

    // Photo cue placeholder
    expect(screen.getByText(/photos help workers understand your job/i)).toBeInTheDocument();

    // Section 2: Location
    expect(screen.getByRole('heading', { level: 2, name: /location details/i })).toBeInTheDocument();
    const citySelect = screen.getByLabelText(/city \/ operating area/i) as HTMLSelectElement;
    expect(citySelect.value).toBe('Lagos');

    // Section 3: Schedule
    expect(screen.getByRole('heading', { level: 2, name: /schedule & timing/i })).toBeInTheDocument();
    const arrivalSelect = screen.getByLabelText(/preferred arrival window/i) as HTMLSelectElement;
    expect(arrivalSelect.value).toBe('Any time');

    // Section 4: Budget
    expect(screen.getByRole('heading', { level: 2, name: /budget & pricing/i })).toBeInTheDocument();
    const negotiableRadio = screen.getByRole('radio', { name: /open to discussion \/ negotiable/i });
    expect(negotiableRadio).toBeChecked();

    // Section 5: Preferred BrainWorker
    expect(screen.getByRole('heading', { level: 2, name: /preferred brainworker/i })).toBeInTheDocument();
    expect(screen.getByText(/no specific worker requested/i)).toBeInTheDocument();

    // Desktop live summary card
    expect(screen.getByRole('heading', { level: 2, name: /request preview/i })).toBeInTheDocument();
  });
});

describe('PostJobScreen: URL Query Parameter Context Hydration', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
  });

  it('prefills category, city, and broader project type from query params', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({
        category: 'generator',
        city: 'Abuja',
        type: 'broader_project',
      }),
    );

    render(<PostJobScreen />);

    const broaderProjectRadio = screen.getByRole('radio', { name: /broader project/i });
    expect(broaderProjectRadio).toBeChecked();

    const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;
    expect(categorySelect.value).toBe('generator');

    const citySelect = screen.getByLabelText(/city \/ operating area/i) as HTMLSelectElement;
    expect(citySelect.value).toBe('Abuja (FCT)');
  });

  it('hydrates preferred BrainWorker from query param and allows removing preference', async () => {
    const user = userEvent.setup();
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({
        worker: 'bw-1',
      }),
    );

    render(<PostJobScreen />);

    // Shows worker details in the worker section
    expect(screen.getAllByText(/engr\. emeka nwosu/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/preference only:/i)).toBeInTheDocument();

    // Review card displays preferred artisan
    expect(screen.getByText(/informational preference only/i)).toBeInTheDocument();

    // Remove preference button
    const removeBtn = screen.getByRole('button', { name: /remove preference/i });
    await user.click(removeBtn);

    // Cleared from form and preview
    expect(screen.getByText(/no specific worker requested/i)).toBeInTheDocument();
    expect(screen.queryByText(/informational preference only/i)).not.toBeInTheDocument();
  });

  it('shows an informational notice when an unactivated city is provided in query params', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({
        city: 'London',
      }),
    );

    render(<PostJobScreen />);

    expect(screen.getByText(/service in london coming soon/i)).toBeInTheDocument();
    const citySelect = screen.getByLabelText(/city \/ operating area/i) as HTMLSelectElement;
    expect(citySelect.value).toBe('');
  });
});

describe('PostJobScreen: Form Interactions & Live Preview Synchronization', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({}));
  });

  it('synchronizes title and category selection with the live review summary card', async () => {
    const user = userEvent.setup();
    render(<PostJobScreen />);

    const titleInput = screen.getByLabelText(/job title/i);
    await user.type(titleInput, 'Complete house rewiring project');

    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, 'electrical');

    // Title appears in preview
    expect(screen.getAllByText('Complete house rewiring project').length).toBeGreaterThanOrEqual(1);
    // Category appears in preview
    expect(screen.getAllByText(/electrical & solar inverter/i).length).toBeGreaterThanOrEqual(1);
  });

  it('handles "I am not sure" category and reflects in preview', async () => {
    const user = userEvent.setup();
    render(<PostJobScreen />);

    const categorySelect = screen.getByLabelText(/category/i);
    await user.selectOptions(categorySelect, 'not_sure');

    expect(screen.getByText(/category: to be matched/i)).toBeInTheDocument();
  });

  it('reveals date picker when specific date is selected and rejects past dates via min attribute', async () => {
    const user = userEvent.setup();
    render(<PostJobScreen />);

    // Date picker initially hidden
    expect(screen.queryByLabelText(/preferred service date/i)).not.toBeInTheDocument();

    // Click Specific Date radio
    const specificDateRadio = screen.getByRole('radio', { name: /specific date/i });
    await user.click(specificDateRadio);

    // Date picker revealed
    const dateInput = screen.getByLabelText(/preferred service date/i) as HTMLInputElement;
    expect(dateInput).toBeInTheDocument();

    // Min attribute prevents past date selection
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(dateInput.getAttribute('min')).toBe(todayStr);
  });

  it('updates budget and budget type in preview', async () => {
    const user = userEvent.setup();
    render(<PostJobScreen />);

    const budgetInput = screen.getByLabelText(/estimated budget/i);
    await user.type(budgetInput, '₦50,000');

    const fixedRadio = screen.getByRole('radio', { name: /fixed budget/i });
    await user.click(fixedRadio);

    expect(screen.getByText('₦50,000 (fixed)')).toBeInTheDocument();
  });
});

describe('PostJobScreen: Validation Behavior', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({}));
  });

  it('shows required field validation errors when submitting with empty fields', async () => {
    const user = userEvent.setup();
    render(<PostJobScreen />);

    // Submit without filling title, description, address
    const submitBtn = screen.getAllByRole('button', { name: /save & sign in to post job/i })[0]!;
    await user.click(submitBtn);

    expect(screen.getByText('Enter a title for your job request.')).toBeInTheDocument();
    expect(screen.getByText('Describe the work you need done.')).toBeInTheDocument();
    expect(screen.getByText('Enter a complete street address.')).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/job title/i);
    expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    expect(titleInput).toHaveAttribute('aria-describedby', 'post-job-title-error');
  });

  it('validates minimum lengths for title and description', async () => {
    const user = userEvent.setup();
    render(<PostJobScreen />);

    await user.type(screen.getByLabelText(/job title/i), 'Fix pipe');
    await user.type(screen.getByLabelText(/job description/i), 'Need fix asap');
    await user.type(screen.getByLabelText(/street address/i), '123');

    const submitBtn = screen.getAllByRole('button', { name: /save & sign in to post job/i })[0]!;
    await user.click(submitBtn);

    expect(screen.getByText('Use at least 10 characters to describe the job.')).toBeInTheDocument();
    expect(
      screen.getByText('Add enough detail for BrainWorkers to understand the job (at least 20 characters).'),
    ).toBeInTheDocument();
    expect(screen.getByText('Enter a complete street address.')).toBeInTheDocument();
  });

  it('requires preferredDate when urgency is specific_date', async () => {
    const user = userEvent.setup();
    render(<PostJobScreen />);

    // Fill valid title, description, address
    await user.type(screen.getByLabelText(/job title/i), 'Fix leaking water pipes');
    await user.type(screen.getByLabelText(/job description/i), 'Water is leaking continuously under the kitchen sink.');
    await user.type(screen.getByLabelText(/street address/i), '12 Awolowo Road, Ikoyi');

    // Choose Specific Date but leave date empty
    const specificDateRadio = screen.getByRole('radio', { name: /specific date/i });
    await user.click(specificDateRadio);

    const submitBtn = screen.getAllByRole('button', { name: /save & sign in to post job/i })[0]!;
    await user.click(submitBtn);

    expect(screen.getByText('Choose a preferred service date.')).toBeInTheDocument();
  });

  it('clears field errors as user types valid content', async () => {
    const user = userEvent.setup();
    render(<PostJobScreen />);

    const submitBtn = screen.getAllByRole('button', { name: /save & sign in to post job/i })[0]!;
    await user.click(submitBtn);

    expect(screen.getByText('Enter a title for your job request.')).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/job title/i);
    await user.type(titleInput, 'Valid length job title');

    expect(screen.queryByText('Enter a title for your job request.')).not.toBeInTheDocument();
  });
});

describe('PostJobScreen: Guest Authentication Handoff', () => {
  let routerMock: ReturnType<typeof makeRouter>;

  beforeEach(() => {
    routerMock = makeRouter();
    vi.mocked(useRouter).mockReturnValue(routerMock);
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({}));
  });

  it('saves draft to storage and navigates to login with returnUrl and handoff parameters', async () => {
    const user = userEvent.setup();
    render(<PostJobScreen />);

    // Fill valid form
    await user.type(screen.getByLabelText(/job title/i), 'Generator engine repair and overhaul');
    await user.type(
      screen.getByLabelText(/job description/i),
      'The 5kVA generator produces heavy smoke and dies after running for five minutes.',
    );
    await user.type(screen.getByLabelText(/street address/i), '45 Admiralty Way, Lekki Phase 1');
    await user.type(screen.getByLabelText(/nearest landmark/i), 'Beside Filmhouse Cinema');
    await user.type(screen.getByLabelText(/estimated budget/i), '₦30,000');

    const submitBtn = screen.getAllByRole('button', { name: /save & sign in to post job/i })[0]!;
    await user.click(submitBtn);

    // Verify storage saved
    const savedDraft = getPreservedJobDraft();
    expect(savedDraft).not.toBeNull();
    expect(savedDraft?.title).toBe('Generator engine repair and overhaul');
    expect(savedDraft?.city).toBe('Lagos');
    expect(savedDraft?.streetAddress).toBe('45 Admiralty Way, Lekki Phase 1');
    expect(savedDraft?.landmark).toBe('Beside Filmhouse Cinema');
    expect(savedDraft?.budget).toBe('₦30,000');

    // Verify router navigation
    expect(routerMock.push).toHaveBeenCalledWith('/login?returnUrl=/post-job&handoff=1');
  });
});

describe('PostJobScreen: Draft Restoration (?jobContinuation=1)', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
  });

  it('restores draft data and displays the emerald restoration banner with dismiss action', async () => {
    const user = userEvent.setup();

    // Pre-populate storage
    savePreservedJobDraft({
      jobType: 'specific_service',
      category: 'plumbing',
      title: 'Water tank overflow pipe repair',
      description: 'The overhead water tank overflow pipe is disconnected and leaking onto the balcony.',
      city: 'Port Harcourt',
      streetAddress: '18 Stadium Road',
      landmark: 'Near Shell Gate',
      urgency: 'flexible',
      arrivalWindow: 'Morning (8am - 12pm)',
      budget: '₦15,000',
      budgetType: 'fixed',
    });

    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({
        jobContinuation: '1',
      }),
    );

    render(<PostJobScreen />);

    // Emerald restoration banner
    expect(
      screen.getByRole('heading', { level: 2, name: /your job request details have been restored/i }),
    ).toBeInTheDocument();

    // Inputs restored
    expect((screen.getByLabelText(/job title/i) as HTMLInputElement).value).toBe(
      'Water tank overflow pipe repair',
    );
    expect((screen.getByLabelText(/city \/ operating area/i) as HTMLSelectElement).value).toBe(
      'Port Harcourt',
    );
    expect((screen.getByLabelText(/street address/i) as HTMLInputElement).value).toBe(
      '18 Stadium Road',
    );
    expect((screen.getByLabelText(/estimated budget/i) as HTMLInputElement).value).toBe(
      '₦15,000',
    );

    // Dismiss banner
    const dismissBtn = screen.getByRole('button', { name: /dismiss restored alert/i });
    await user.click(dismissBtn);
    expect(
      screen.queryByRole('heading', { level: 2, name: /your job request details have been restored/i }),
    ).not.toBeInTheDocument();
  });
});

describe('PostJobScreen: Authenticated Submission & Success View', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({}));
    setMockAuthenticatedUser({
      id: 'usr-customer-1',
      name: 'Amara Okafor',
      email: 'amara@example.com',
      provider: 'email',
      role: 'customer',
      isBrainWorkerApproved: false,
    });
  });

  it('renders "Submit Job Request" button when user is authenticated', () => {
    render(<PostJobScreen />);

    expect(screen.getAllByRole('button', { name: /submit job request/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/amara okafor/i).length).toBeGreaterThanOrEqual(1);
  });

  it('submits successfully and transitions to the Request Received confirmation view', async () => {
    const user = userEvent.setup();
    render(<PostJobScreen />);

    // Fill valid form
    await user.type(screen.getByLabelText(/job title/i), 'Split AC installation in bedroom');
    await user.type(
      screen.getByLabelText(/job description/i),
      'Need complete mounting and copper pipe installation for a 1.5HP Panasonic split AC.',
    );
    await user.type(screen.getByLabelText(/street address/i), '10 Glover Road, Ikoyi');

    const submitBtn = screen.getAllByRole('button', { name: /submit job request/i })[0]!;
    await user.click(submitBtn);

    // Transitions to pending
    expect(screen.getAllByText(/submitting request\.\.\./i).length).toBeGreaterThanOrEqual(1);

    // Transitions to success view after simulated latency
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { level: 1, name: /request received/i })).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    // Reference code
    expect(screen.getByText(/reference:/i)).toBeInTheDocument();
    expect(screen.getByText(/REQ-/i)).toBeInTheDocument();

    // Honest next steps
    expect(screen.getByText(/what happens next/i)).toBeInTheDocument();
    expect(screen.getByText(/no payment has occurred/i)).toBeInTheDocument();
    expect(screen.getByText(/no worker dispatched yet/i)).toBeInTheDocument();

    // Job summary details
    expect(screen.getByText('Split AC installation in bedroom')).toBeInTheDocument();
    expect(screen.getByText('10 Glover Road, Ikoyi, Lagos')).toBeInTheDocument();

    // Directory return action
    const directoryLink = screen.getByRole('link', { name: /browse services directory/i });
    expect(directoryLink).toBeInTheDocument();
    expect(directoryLink).toHaveAttribute('href', '/services');
  });

  it('handles simulated submission error without losing user form input', async () => {
    const user = userEvent.setup();
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({
        mockError: '1',
      }),
    );

    render(<PostJobScreen />);

    await user.type(screen.getByLabelText(/job title/i), 'Fix water heater leakage');
    await user.type(
      screen.getByLabelText(/job description/i),
      'Water heater in master bath is leaking from base connection continuously.',
    );
    await user.type(screen.getByLabelText(/street address/i), '8 Victoria Island Close');

    const submitBtn = screen.getAllByRole('button', { name: /submit job request/i })[0]!;
    await user.click(submitBtn);

    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', { level: 2, name: /submission could not be completed right now/i }),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    // Form inputs preserved
    expect((screen.getByLabelText(/job title/i) as HTMLInputElement).value).toBe(
      'Fix water heater leakage',
    );

    // Try again button exists
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
