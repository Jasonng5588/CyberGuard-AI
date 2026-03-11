import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deployment config
  // NEXT_PUBLIC_API_URL must be set in Vercel dashboard to your FastAPI backend URL
  // e.g. https://your-fastapi-backend.railway.app or https://your-backend.fly.dev

  // Allow images from Supabase storage if needed in future
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // Suppress hydration mismatch warnings in dev caused by browser extensions
  // (e.g. password managers, tab managers injecting data attributes on <html>)
  // Already handled by suppressHydrationWarning in layout.tsx
};

export default nextConfig;
