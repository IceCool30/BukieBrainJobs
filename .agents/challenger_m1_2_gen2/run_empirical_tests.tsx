import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Button } from '../../packages/ui/src/components/Button';
import { Card } from '../../packages/ui/src/components/Card';
import { InputField } from '../../packages/ui/src/components/InputField';
import { BukiePassportBadge } from '../../packages/ui/src/components/BukiePassportBadge';
import { EscrowShield } from '../../packages/ui/src/components/EscrowShield';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, failureMsg: string) {
  if (condition) {
    results.push({ suite, name, passed: true });
    console.log(`PASS [${suite}] - ${name}`);
  } else {
    results.push({ suite, name, passed: false, message: failureMsg });
    console.error(`FAIL [${suite}] - ${name}: ${failureMsg}`);
  }
}

function safeRender(name: string, fn: () => void) {
  console.log(`Executing test block: ${name}`);
  try {
    fn();
  } catch (err: any) {
    console.error(`Error in test block ${name}:`, err.message);
  }
}

console.log('=== STARTING EMPIRICAL TEST SUITE FOR M1 COMPONENTS ===\n');

const buttonSuite = 'Button Component';

safeRender('1.1 Default Button', () => {
  const html = ReactDOMServer.renderToString(<Button label="Submit Order" />);
  assert(html.includes('<button'), buttonSuite, 'Default tag element', 'Should render a <button> tag');
  assert(html.includes('Submit Order'), buttonSuite, 'Label rendering', 'Should render label text');
  assert(html.includes('bg-[#001A41]'), buttonSuite, 'Primary variant color token', 'Primary button must use Navy #001A41');
  assert(html.includes('rounded-full'), buttonSuite, 'Pill shape styling', 'Button must be pill-shaped (rounded-full)');
});

safeRender('1.2 Loading Button', () => {
  const html = ReactDOMServer.renderToString(<Button label="Processing" isLoading={true} />);
  assert(html.includes('aria-busy="true"'), buttonSuite, 'ARIA busy attribute', 'Loading button must have aria-busy="true"');
  assert(html.includes('disabled'), buttonSuite, 'Loading disabled attribute', 'Loading button must be disabled');
  assert(html.includes('animate-spin'), buttonSuite, 'Loading spinner SVG', 'Loading button must show spinning loader');
});

safeRender('1.3 Disabled Button', () => {
  const html = ReactDOMServer.renderToString(<Button label="Disabled Action" disabled={true} />);
  assert(html.includes('disabled'), buttonSuite, 'Disabled attribute presence', 'Disabled button must set disabled attribute');
  assert(html.includes('aria-disabled="true"'), buttonSuite, 'ARIA disabled attribute', 'Disabled button must set aria-disabled="true"');
  assert(html.includes('disabled:opacity-50'), buttonSuite, 'Disabled opacity styling', 'Disabled button must have opacity-50');
});

safeRender('1.4 Button Variants', () => {
  const emerald = ReactDOMServer.renderToString(<Button label="Pay Now" variant="emerald" />);
  assert(emerald.includes('bg-[#296A4B]'), buttonSuite, 'Emerald variant color token', 'Emerald variant must use #296A4B');

  const accent = ReactDOMServer.renderToString(<Button label="Apply" variant="accent" />);
  assert(accent.includes('bg-[#296A4B]'), buttonSuite, 'Accent variant mapping', 'Accent variant must map to Emerald #296A4B');

  const secondary = ReactDOMServer.renderToString(<Button label="Cancel" variant="secondary" />);
  assert(secondary.includes('border-[#001A41]'), buttonSuite, 'Secondary variant outline', 'Secondary variant must have Navy border');

  const destructive = ReactDOMServer.renderToString(<Button label="Delete" variant="destructive" />);
  assert(destructive.includes('bg-[#DC2626]'), buttonSuite, 'Destructive variant color', 'Destructive variant must use #DC2626 red');
});

safeRender('1.5 Touch Target Sizes', () => {
  const sm = ReactDOMServer.renderToString(<Button label="Small" size="sm" />);
  assert(sm.includes('min-h-[36px]'), buttonSuite, 'Small touch target min-height', 'Small size must have min-h-[36px]');

  const md = ReactDOMServer.renderToString(<Button label="Medium" size="md" />);
  assert(md.includes('min-h-[44px]'), buttonSuite, 'Medium touch target min-height', 'Medium size must have min-h-[44px]');

  const lg = ReactDOMServer.renderToString(<Button label="Large" size="lg" />);
  assert(lg.includes('min-h-[52px]'), buttonSuite, 'Large touch target min-height', 'Large size must have min-h-[52px]');
});

safeRender('1.6 Full Width', () => {
  const full = ReactDOMServer.renderToString(<Button label="Full" fullWidth={true} />);
  assert(full.includes('w-full'), buttonSuite, 'Full width class', 'Full width button must have w-full class');
});


const cardSuite = 'Card Component';

safeRender('2.1 Default Card', () => {
  const html = ReactDOMServer.renderToString(
    <Card title="Task Details" subtitle="Generator repair service">
      <p>Body content</p>
    </Card>
  );
  assert(html.includes('rounded-[32px]'), cardSuite, '32px corner radius', 'Card must have rounded-[32px]');
  assert(!html.includes('role="button"'), cardSuite, 'Non-interactive role', 'Non-interactive card should not have role="button"');
  assert(!html.includes('tabindex="0"'), cardSuite, 'Non-interactive tabIndex', 'Non-interactive card should not have tabIndex="0"');
  assert(html.includes('Task Details'), cardSuite, 'Title rendering', 'Card should render title');
  assert(html.includes('Generator repair service'), cardSuite, 'Subtitle rendering', 'Card should render subtitle');
});

safeRender('2.2 Interactive Card', () => {
  const html = ReactDOMServer.renderToString(
    <Card title="Clickable Card" interactive={true} onClick={() => {}}>
      <p>Card content</p>
    </Card>
  );
  assert(html.includes('role="button"'), cardSuite, 'Interactive role="button"', 'Interactive card must have role="button"');
  assert(html.includes('tabindex="0"'), cardSuite, 'Interactive tabindex="0"', 'Interactive card must have tabindex="0"');
  assert(html.includes('cursor-pointer'), cardSuite, 'Interactive cursor pointer', 'Interactive card must have cursor-pointer');
});

safeRender('2.3 Card Padding', () => {
  const padNone = ReactDOMServer.renderToString(<Card padding="none">None</Card>);
  assert(padNone.includes('p-0'), cardSuite, 'Padding none (p-0)', 'Padding none must set p-0');

  const padLg = ReactDOMServer.renderToString(<Card padding="lg">Large</Card>);
  assert(padLg.includes('p-8'), cardSuite, 'Padding lg (p-8)', 'Padding lg must set p-8');
});

safeRender('2.4 Card Header Slots', () => {
  const headerSlot = ReactDOMServer.renderToString(
    <Card header={<div id="custom-header">Custom Header</div>}>
      <p>Content</p>
    </Card>
  );
  assert(headerSlot.includes('id="custom-header"'), cardSuite, 'Header slot rendering', 'Card header slot must render custom header node');

  const headerAction = ReactDOMServer.renderToString(
    <Card title="Task Card" headerAction={<button>Action</button>}>
      <p>Content</p>
    </Card>
  );
  assert(headerAction.includes('Task Card'), cardSuite, 'Header action title', 'Card header action layout must display title');
  assert(headerAction.includes('<button>Action</button>'), cardSuite, 'Header action slot content', 'Card header action layout must display action button');
});


const inputSuite = 'InputField Component';

safeRender('3.1 Input Label & ID', () => {
  const html = ReactDOMServer.renderToString(
    <InputField label="Full Name" placeholder="Enter name" />
  );
  assert(html.includes('for="input-full-name"'), inputSuite, 'Label htmlFor linkage', 'Label htmlFor must match generated input ID');
  assert(html.includes('id="input-full-name"'), inputSuite, 'Input ID generation', 'Input ID must match label slug');
  assert(html.includes('FULL NAME'), inputSuite, 'Label uppercase display', 'Label should render text in uppercase');
});

safeRender('3.2 Input Error State', () => {
  const html = ReactDOMServer.renderToString(
    <InputField label="Email" error="Invalid email address" />
  );
  assert(html.includes('aria-invalid="true"'), inputSuite, 'ARIA invalid attribute', 'Error input must set aria-invalid="true"');
  assert(html.includes('aria-describedby="input-email-error"'), inputSuite, 'ARIA describedby attribute', 'Error input aria-describedby must point to error ID');
  assert(html.includes('id="input-email-error"'), inputSuite, 'Error message ID', 'Error message element must have error ID');
  assert(html.includes('border-[#DC2626]'), inputSuite, 'Error crimson border', 'Error input must have crimson border #DC2626');
  assert(html.includes('Invalid email address'), inputSuite, 'Error message text', 'Error message text must render');
});

safeRender('3.3 Input Helper Text', () => {
  const html = ReactDOMServer.renderToString(
    <InputField label="Phone" helperText="Enter 11-digit phone number" />
  );
  assert(html.includes('Enter 11-digit phone number'), inputSuite, 'Helper text rendering', 'Helper text must render when no error');
});

safeRender('3.4 Input Counter & MaxLength', () => {
  const html = ReactDOMServer.renderToString(
    <InputField label="Bio" value="Hello" maxLength={100} showCounter={true} />
  );
  assert(html.includes('5/100'), inputSuite, 'Character counter rendering', 'Character counter must show 5/100');
  assert(html.includes('maxlength="100"'), inputSuite, 'Native maxLength attribute', 'Input element must have maxlength="100"');
});

safeRender('3.5 Input Icons', () => {
  const html = ReactDOMServer.renderToString(
    <InputField label="Search" leftIcon={<span>IconL</span>} rightIcon={<span>IconR</span>} />
  );
  assert(html.includes('pl-10'), inputSuite, 'Left icon left-padding', 'Left icon input must have pl-10 class');
  assert(html.includes('pr-10'), inputSuite, 'Right icon right-padding', 'Right icon input must have pr-10 class');
});


const badgeSuite = 'BukiePassportBadge Component';

safeRender('4.1 Compact Badges', () => {
  const pro = ReactDOMServer.renderToString(<BukiePassportBadge tier="Pro" compact={true} />);
  assert(pro.includes('BUKIEPASSPORT PRO'), badgeSuite, 'Compact Pro label', 'Compact Pro badge text must match');
  assert(pro.includes('bg-[#296A4B]'), badgeSuite, 'Compact Pro green bg', 'Compact Pro badge must use green background');

  const lite = ReactDOMServer.renderToString(<BukiePassportBadge tier="Lite" compact={true} />);
  assert(lite.includes('BUKIEPASSPORT LITE'), badgeSuite, 'Compact Lite label', 'Compact Lite badge text must match');

  const unverified = ReactDOMServer.renderToString(<BukiePassportBadge tier="Unverified" compact={true} />);
  assert(unverified.includes('BUKIEPASSPORT UNVERIFIED'), badgeSuite, 'Compact Unverified label', 'Compact Unverified badge text must match');
});

safeRender('4.2 Full Card Badge', () => {
  const html = ReactDOMServer.renderToString(
    <BukiePassportBadge tier="Pro" ninVerified={true} bvnVerified={true} smartSelfieVerified={true} guarantorVerified={true} showDetails={true} />
  );
  assert(html.includes('rounded-[32px]'), badgeSuite, '32px card container radius', 'Full card badge must use rounded-[32px]');
  assert(html.includes('Tier 2 Pro'), badgeSuite, 'Tier 2 Pro header badge', 'Header must display Tier 2 Pro for Pro tier');
  assert(html.includes('4/4 Completed'), badgeSuite, 'Pro completion counter', 'Pro tier must show 4/4 Completed');
  assert(html.includes('width:100%'), badgeSuite, 'Pro progress width 100%', 'Pro tier progress bar must be 100%');
  assert(html.includes('NIN Anchor'), badgeSuite, 'NIN Anchor step', 'Verification details must include NIN Anchor');
  assert(html.includes('SmartSelfie'), badgeSuite, 'SmartSelfie step', 'Verification details must include SmartSelfie');
  assert(html.includes('Biometric Match'), badgeSuite, 'Biometric Match step', 'Verification details must include Biometric Match');
  assert(html.includes('Guarantor Audit'), badgeSuite, 'Guarantor Audit step', 'Verification details must include Guarantor Audit');
});


const escrowSuite = 'EscrowShield Component';

safeRender('5.1 Escrow PENDING_AUTHORIZATION', () => {
  const html = ReactDOMServer.renderToString(<EscrowShield amount={25000} status="PENDING_AUTHORIZATION" />);
  assert(html.includes('Pre-Auth Pending'), escrowSuite, 'Pending Auth pill label', 'Pending Auth state must show Pre-Auth Pending pill label');
  assert(html.includes('bg-amber-50'), escrowSuite, 'Pending Auth amber background', 'Pending Auth state must use amber background');
  assert(html.includes('animate-spin'), escrowSuite, 'Pending Auth spinner icon', 'Pending Auth state must render spinning loader icon');
  assert(html.includes('₦25,000'), escrowSuite, 'Naira currency formatting', 'Must format 25000 to ₦25,000');
});

safeRender('5.2 Escrow HELD_IN_ESCROW', () => {
  const html = ReactDOMServer.renderToString(<EscrowShield amount={50000} status="HELD_IN_ESCROW" />);
  assert(html.includes('Funds Secured'), escrowSuite, 'Held in Escrow pill label', 'Held in Escrow state must show Funds Secured pill label');
  assert(html.includes('bg-[#001A41]'), escrowSuite, 'Held in Escrow Navy background', 'Held in Escrow state must use Navy #001A41 background');
  assert(html.includes('₦50,000'), escrowSuite, 'Naira currency formatting', 'Must format 50000 to ₦50,000');
});

safeRender('5.3 Escrow RELEASED_TO_ARTISAN', () => {
  const html = ReactDOMServer.renderToString(<EscrowShield amount={75000} status="RELEASED_TO_ARTISAN" />);
  assert(html.includes('Disbursed'), escrowSuite, 'Released pill label', 'Released state must show Disbursed pill label');
  assert(html.includes('bg-[#296A4B]/10'), escrowSuite, 'Released emerald background', 'Released state must use Emerald background');
});

safeRender('5.4 Escrow REFUNDED', () => {
  const html = ReactDOMServer.renderToString(<EscrowShield amount={15000} status="REFUNDED" />);
  assert(html.includes('Refunded'), escrowSuite, 'Refunded pill label', 'Refunded state must show Refunded pill label');
  assert(html.includes('bg-red-50'), escrowSuite, 'Refunded red background', 'Refunded state must use Red background');
});

safeRender('5.5 Escrow Legacy Aliases', () => {
  const preAuth = ReactDOMServer.renderToString(<EscrowShield amount={10000} status="Pre-Authorized" />);
  assert(preAuth.includes('Funds Secured'), escrowSuite, 'Legacy Pre-Authorized alias mapping', 'Legacy Pre-Authorized alias must map to HELD_IN_ESCROW');

  const captured = ReactDOMServer.renderToString(<EscrowShield amount={10000} status="Captured" />);
  assert(captured.includes('Disbursed'), escrowSuite, 'Legacy Captured alias mapping', 'Legacy Captured alias must map to RELEASED_TO_ARTISAN');
});

safeRender('5.6 Escrow Compact', () => {
  const compact = ReactDOMServer.renderToString(<EscrowShield amount={30000} status="HELD_IN_ESCROW" compact={true} />);
  assert(compact.includes('₦30,000 Escrow'), escrowSuite, 'Compact Escrow pill text', 'Compact Escrow pill must display ₦30,000 Escrow');
});

console.log('\n=============================================================');
const passedCount = results.filter(r => r.passed).length;
const totalCount = results.length;
console.log(`TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
