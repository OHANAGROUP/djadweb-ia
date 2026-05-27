import type { Metadata } from 'next'
import PageContent from './page-content'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad de DEJAWEBEAR. Conoce cómo protegemos tus datos personales según la Ley N°19.628 de Chile.',
  openGraph: {
    title: 'Política de Privacidad · DEJAWEBEAR',
    description: 'Política de privacidad de DEJAWEBEAR. Conoce cómo protegemos tus datos personales según la Ley N°19.628 de Chile.',
  },
  twitter: {
    title: 'Política de Privacidad · DEJAWEBEAR',
    description: 'Política de privacidad de DEJAWEBEAR. Conoce cómo protegemos tus datos personales según la Ley N°19.628 de Chile.',
  },
}

export default function Page() {
  return <PageContent />
}
