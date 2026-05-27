// MCP Tool: PJUD Consultation
// Calls the backend scraper

export async function executePjudSearch(params: {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  competencia: string;
  anio?: string;
}, apiKey: string): Promise<any> {
  const response = await fetch(`${process.env.SCRAPER_URL}/api/pjud/nombre`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(45000)
  });

  if (!response.ok) {
    throw new Error(`PJUD API error: ${response.statusText}`);
  }

  return response.json();
}
