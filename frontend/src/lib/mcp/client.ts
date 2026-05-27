// MCP Client - Tool definitions for Anthropic Claude
import { createClient } from '@/lib/supabase-server';

// Tool definition shape for Anthropic API
type ToolDefinition = {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
};

export async function getMCPTools(userId: string): Promise<ToolDefinition[]> {
  const supabase = await createClient();

  // Get user's subscription to determine available tools
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single();

  const plan = (sub?.plan as string) || 'free';
  const isPremium = plan === 'premium';

  const tools: ToolDefinition[] = [
    {
      name: 'consultar_pjud',
      description: 'Busca causas judiciales en el Poder Judicial de Chile (PJUD) por nombre de persona o empresa.',
      input_schema: {
        type: 'object',
        properties: {
          nombre: { type: 'string', description: 'Nombre de la persona o empresa' },
          apellidoPaterno: { type: 'string', description: 'Apellido paterno' },
          apellidoMaterno: { type: 'string', description: 'Apellido materno (opcional)' },
          competencia: {
            type: 'string',
            enum: ['civil', 'laboral', 'familia', 'cobranza', 'penal', 'suprema', 'apelaciones'],
            description: 'Competencia del tribunal'
          },
          rut: { type: 'string', description: 'RUT de la persona (opcional)' }
        },
        required: ['nombre', 'competencia']
      }
    },
    {
      name: 'consultar_sii',
      description: 'Consulta datos basicos del SII de Chile: razon social, actividad economica, inicio de actividades de un RUT.',
      input_schema: {
        type: 'object',
        properties: {
          rut: { type: 'string', description: 'RUT a consultar (ej: 11111111-1)' }
        },
        required: ['rut']
      }
    },
    {
      name: 'consultar_tgr',
      description: 'Consulta deudas registradas en la Tesoreria General de la Republica de Chile por RUT.',
      input_schema: {
        type: 'object',
        properties: {
          rut: { type: 'string', description: 'RUT a consultar' }
        },
        required: ['rut']
      }
    }
  ];

  // Premium-only tools
  if (isPremium) {
    tools.push({
      name: 'consultar_alertas',
      description: 'Obtiene las alertas activas del usuario actual.',
      input_schema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximo de alertas (default 10)' }
        }
      }
    });
  }

  return tools;
}
