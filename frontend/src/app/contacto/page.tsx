import type { Metadata } from 'next'
import PageContent from './page-content'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Ponte en contacto con Tramita. Email, Email y dirección para soporte y consultas.',
  openGraph: {
    title: 'Contacto · Tramita',
    description: 'Ponte en contacto con Tramita. Email, Email y dirección para soporte y consultas.',
  },
  twitter: {
    title: 'Contacto · Tramita',
    description: 'Ponte en contacto con Tramita. Email, Email y dirección para soporte y consultas.',
  },
}

export default function Page() {
  return <PageContent />
}
