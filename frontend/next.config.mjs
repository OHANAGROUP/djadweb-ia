/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'DJADWEB-IA®',
  },
}

export default nextConfig
