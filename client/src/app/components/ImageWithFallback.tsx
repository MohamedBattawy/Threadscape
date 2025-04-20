"use client";

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type ImageWithFallbackProps = ImageProps & {
  fallbackSrc?: string;
};

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "/placeholder.jpg",
  ...rest
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      {...rest}
      src={error ? fallbackSrc : src}
      alt={alt}
      onError={() => setError(true)}
    />
  );
} 