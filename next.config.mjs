/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lgfzavckayernrxbnrzo.supabase.co",
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
