import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'source.unsplash.com',
      'res.cloudinary.com',
      'localhost',
      'loremflickr.com',
      'placehold.co',
      'placekitten.com',
      'picsum.photos'
    ],
  },
};

export default nextConfig;
