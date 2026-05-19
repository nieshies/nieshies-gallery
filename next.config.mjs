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
};

export default nextConfig;
