// __mocks__/next/link.tsx
// Lightweight next/link stub for jsdom tests.
// Renders a plain <a> element so tests can assert on href and link text.
import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
}

export default function Link({ href, prefetch: _prefetch, replace: _replace, scroll: _scroll, children, ...props }: LinkProps) {
  return <a href={href} {...props}>{children}</a>;
}
