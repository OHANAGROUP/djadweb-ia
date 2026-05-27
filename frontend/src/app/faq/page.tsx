import type { Metadata } from 'next'
import PageContent from './page-content'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description: 'Respuestas a las preguntas más frecuentes sobre Tramita: planes, seguridad, consultas, alertas y más.',
  openGraph: {
    title: 'Preguntas Frecuentes · Tramita',
    description: 'Respuestas a las preguntas más frecuentes sobre Tramita: planes, seguridad, consultas, alertas y más.',
  },
  twitter: {
    title: 'Preguntas Frecuentes · Tramita',
    description: 'Respuestas a las preguntas más frecuentes sobre Tramita: planes, seguridad, consultas, alertas y más.',
  },
}

export default function Page() {
  return <PageContent />
}
