import type { ComponentProps, ReactNode } from 'react';

type Props = ComponentProps<'svg'> & { categoryId: string };

const navy = '#001A41';
const green = '#296A4B';
const mint = '#ABEEC8';
const pale = '#E9F8EF';
const white = '#FFFFFF';
const gold = '#E7BD63';
const sky = '#A8DCE7';

function All() {
  return <>
    <rect x="11" y="11" width="18" height="18" rx="5" fill={mint} stroke={navy} strokeWidth="2.5" />
    <rect x="35" y="11" width="18" height="18" rx="5" fill={sky} stroke={navy} strokeWidth="2.5" />
    <rect x="11" y="35" width="18" height="18" rx="5" fill={gold} stroke={navy} strokeWidth="2.5" />
    <rect x="35" y="35" width="18" height="18" rx="5" fill={green} stroke={navy} strokeWidth="2.5" />
  </>;
}

function Generator() {
  return <>
    <path d="M16 26h32v22H16z" fill={gold} stroke={navy} strokeWidth="3" strokeLinejoin="round" />
    <path d="M20 22h24v5H20z" fill={mint} stroke={navy} strokeWidth="3" strokeLinejoin="round" />
    <rect x="21" y="31" width="12" height="10" rx="2" fill={white} stroke={navy} strokeWidth="2" />
    <circle cx="41" cy="36" r="5" fill={green} stroke={navy} strokeWidth="2" />
    <path d="M18 48v5m28-5v5M24 20v-6h16v6" stroke={navy} strokeWidth="3" strokeLinecap="round" />
    <circle cx="27" cy="36" r="1.5" fill={green} />
  </>;
}

function Ac() {
  return <>
    <rect x="9" y="20" width="46" height="21" rx="7" fill={sky} stroke={navy} strokeWidth="3" />
    <path d="M14 27h27M17 34h25" stroke={navy} strokeWidth="2" strokeLinecap="round" />
    <path d="M17 38h28" stroke={green} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="48" cy="29" r="3" fill={white} stroke={navy} strokeWidth="1.5" />
    <path d="M21 47c2 3 5 3 7 0m3 0c2 3 5 3 7 0" stroke={green} strokeWidth="2.5" strokeLinecap="round" />
  </>;
}

function Plumbing() {
  return <>
    <path d="M15 14v18c0 4 3 7 7 7h9v11" fill="none" stroke={sky} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 14h12m-6-5v10M31 50h17" stroke={green} strokeWidth="4" strokeLinecap="round" />
    <path d="M44 19c5 6 5 11 0 15-5-4-5-9 0-15Z" fill={mint} stroke={navy} strokeWidth="2.5" />
    <path d="M20 39h10" stroke={mint} strokeWidth="2" strokeLinecap="round" />
  </>;
}

function Electrical() {
  return <>
    <path d="M22 15v12m20-12v12" stroke={navy} strokeWidth="4" strokeLinecap="round" />
    <rect x="17" y="27" width="30" height="23" rx="7" fill={pale} stroke={navy} strokeWidth="3" />
    <path d="m33 30-7 12h7l-3 8 10-14h-7l4-6Z" fill={gold} stroke={green} strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="42" cy="43" r="2" fill={green} />
  </>;
}

function Cleaning() {
  return <>
    <path d="M23 18h14l3 8-4 4v19H20V30l4-4v-8Z" fill={sky} stroke={navy} strokeWidth="3" strokeLinejoin="round" />
    <path d="M26 18v-5h9" stroke={green} strokeWidth="3" strokeLinecap="round" />
    <path d="M25 35h7m-8 7h9" stroke={green} strokeWidth="2.5" strokeLinecap="round" />
    <path d="m44 19 3 3m-7 1 4-4m1 9 4 1" stroke={gold} strokeWidth="3" strokeLinecap="round" />
  </>;
}

function Carpentry() {
  return <>
    <path d="m17 42 22-22 8 8-22 22H17v-8Z" fill={gold} stroke={navy} strokeWidth="3" strokeLinejoin="round" />
    <path d="m27 32 5 5m4-9 5 5" stroke={green} strokeWidth="2.5" strokeLinecap="round" />
    <path d="m15 19 9-8 10 10-8 8-11-10Z" fill={white} stroke={navy} strokeWidth="3" strokeLinejoin="round" />
    <path d="m26 22 14 14" stroke={green} strokeWidth="4" strokeLinecap="round" />
  </>;
}

function Television() {
  return <>
    <rect x="10" y="15" width="44" height="29" rx="5" fill={navy} />
    <rect x="14" y="19" width="36" height="21" rx="2" fill={sky} />
    <path d="m29 51 4-7 4 7m-15 1h22" stroke={green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="46" cy="23" r="2" fill={white} />
  </>;
}

function Moving() {
  return <>
    <path d="M15 22h27v24H15z" fill={gold} stroke={navy} strokeWidth="3" strokeLinejoin="round" />
    <path d="m15 22 13-8 14 8m-14-8v32" stroke={green} strokeWidth="3" strokeLinejoin="round" />
    <path d="M45 28v18h7V28h-7Z" fill={sky} stroke={navy} strokeWidth="3" strokeLinejoin="round" />
    <circle cx="19" cy="51" r="4" fill={green} stroke={navy} strokeWidth="2" />
    <circle cx="48" cy="51" r="4" fill={green} stroke={navy} strokeWidth="2" />
  </>;
}

export default function ServiceTaskIcon({ categoryId, className, ...props }: Props) {
  const icons: Record<string, () => ReactNode> = {
    all: All,
    generator: Generator,
    ac: Ac,
    plumbing: Plumbing,
    electrical: Electrical,
    cleaning: Cleaning,
    carpentry: Carpentry,
    'tv-mounting': Television,
    moving: Moving,
  };
  const Icon = icons[categoryId] ?? Plumbing;
  return <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true" {...props}><Icon /></svg>;
}
