import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Barlow_Condensed, Syne } from 'next/font/google'
import './globals.css'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '900'],
  variable: '--font-brand',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-ui',
  display: 'swap',
})

const BASE_URL = 'https://dejadwebiar.vercel.app'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0E',
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'DJADWEB-IA® — Deja de webear con el Estado',
    template: '%s · DJADWEB-IA®',
  },
  description:
    'Consulta tus causas judiciales del PJUD, deudas SII y trámites del Estado chileno en segundos. Sin ClaveÚnica. Sin ir a 5 portales distintos. Tu GPS Burocrático.',
  keywords: [
    'trámites Chile',
    'causas judiciales PJUD',
    'deudas SII Chile',
    'poder judicial Chile',
    'consulta RUT Chile',
    'burocracia Chile',
    'GPS burocrático',
    'DJADWEB-IA',
    'tramitai',
    'oficina judicial virtual',
  ],
  authors: [{ name: 'AutomatizAI', url: 'https://automatizai.cl' }],
  creator: 'AutomatizAI',
  publisher: 'AutomatizAI',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: 'DJADWEB-IA® — Deja de webear con el Estado',
    description:
      'Un solo lugar para todos tus trámites del Estado chileno. Causas PJUD, deudas SII, TGR y más. Lenguaje simple, sin burocracia.',
    url: BASE_URL,
    siteName: 'DJADWEB-IA®',
    type: 'website',
    locale: 'es_CL',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'DJADWEB-IA® — GPS Burocrático Chile',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DJADWEB-IA® — Deja de webear con el Estado',
    description:
      'Consulta causas PJUD, deudas SII y trámites del Estado chileno en segundos. Tu GPS Burocrático.',
    images: [`${BASE_URL}/og-image.png`],
    creator: '@automatizai',
  },
  icons: {
    icon: '/dejawebiar_icon.png',
    apple: '/dejawebiar_icon.png',
  },
}

// ── Schema.org JSON-LD ────────────────────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'DJADWEB-IA®',
  url: BASE_URL,
  description:
    'Plataforma de IA para simplificar trámites del Estado chileno: consultas PJUD, SII, TGR y más.',
  applicationCategory: 'LegalApplication',
  operatingSystem: 'Web',
  offers: [
    { '@type': 'Offer', name: 'Gratuito', price: '0', priceCurrency: 'CLP' },
    { '@type': 'Offer', name: 'Básico', price: '3990', priceCurrency: 'CLP' },
    { '@type': 'Offer', name: 'Premium', price: '7990', priceCurrency: 'CLP' },
  ],
  provider: {
    '@type': 'Organization',
    name: 'AutomatizAI',
    url: 'https://automatizai.cl',
    sameAs: ['https://twitter.com/automatizai'],
  },
  inLanguage: 'es-CL',
  countryOfOrigin: 'CL',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${barlowCondensed.variable} ${syne.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {process.env.NEXT_PUBLIC_GA_ID && process.env.NEXT_PUBLIC_GA_ID !== 'G-XXXXXXXXXX' && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
        {children}
      </body>
    </html>
  )
}
