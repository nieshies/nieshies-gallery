/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Photos are already resized + compressed to webp@82 by sharp on upload,
    // so Vercel's /_next/image optimizer adds no real value. Bypassing it
    // avoids the free-tier image-optimization quota (HTTP 402) entirely.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lgfzavckayernrxbnrzo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lgfzavckayernrxbnrzo.supabase.co",
        pathname: "/storage/v1/render/image/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/products",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
