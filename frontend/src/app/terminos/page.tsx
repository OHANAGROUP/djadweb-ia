import type { Metadata } from 'next'
import PageContent from './page-content'

export const metadata: Metadata = {
  title: 'Términos de Servicio',
  description: 'Términos y condiciones de uso de Tramita. Información sobre planes, responsabilidades y limitaciones del servicio.',
  openGraph: {
    title: 'Términos de Servicio · Tramita',
    description: 'Términos y condiciones de uso de Tramita. Información sobre planes, responsabilidades y limitaciones del servicio.',
  },
  twitter: {
    title: 'Términos de Servicio · Tramita',
    description: 'Términos y condiciones de uso de Tramita. Información sobre planes, responsabilidades y limitaciones del servicio.',
  },
}

export default function Page() {
  return <PageContent />
}
