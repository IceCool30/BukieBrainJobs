// __mocks__/next/image.tsx
// Lightweight next/image stub for jsdom tests.
// Renders a plain <img> with all passed props forwarded so
// tests can assert on src, alt, and other attributes.
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export default function Image({ fill: _fill, priority: _priority, sizes: _sizes, ...props }: ImageProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} />;
}
