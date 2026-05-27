import type { Metadata } from 'next'
import PageContent from './page-content'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Ponte en contacto con DEJAWEBEAR. Email, WhatsApp y dirección para soporte y consultas.',
  openGraph: {
    title: 'Contacto · DEJAWEBEAR',
    description: 'Ponte en contacto con DEJAWEBEAR. Email, WhatsApp y dirección para soporte y consultas.',
  },
  twitter: {
    title: 'Contacto · DEJAWEBEAR',
    description: 'Ponte en contacto con DEJAWEBEAR. Email, WhatsApp y dirección para soporte y consultas.',
  },
}

export default function Page() {
  return <PageContent />
}
