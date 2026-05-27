const { createClient } = require('@supabase/supabase-js');
const { decrypt } = require('../utils/crypto_decrypt');
const logger = require('../utils/logger');
const tgrScraper = require('../scrapers/tgr');
const siiScraper = require('../scrapers/sii');

// Inicialización de Supabase se hará dentro de runAll para evitar crasheos si faltan env vars en boot

async function runAll() {
  logger.info('[SyncWorker] Iniciando ciclo de sincronización background...');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan credenciales de Supabase en el backend (.env)');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Obtener credenciales activas
  const { data: credentials, error: credError } = await supabase
    .from('user_credentials')
    .select('*')
    .is('revoked_at', null);

  if (credError) {
    logger.error('[SyncWorker] Error obteniendo credenciales', credError);
    throw new Error('Error DB: ' + credError.message);
  }

  if (!credentials || credentials.length === 0) {
    logger.info('[SyncWorker] No hay credenciales activas para sincronizar.');
    return { success: true, processed: 0 };
  }

  let processedCount = 0;

  // 2. Iterar sobre cada credencial
  for (const cred of credentials) {
    const startedAt = new Date().toISOString();
    const startMs = Date.now();

    // 2.1. Registrar el run (estado: running)
    const { data: runRecord, error: runError } = await supabase
      .from('sync_runs')
      .insert({
        user_id: cred.user_id,
        provider: cred.provider,
        status: 'running',
        started_at: startedAt
      })
      .select('id')
      .single();

    if (runError || !runRecord) {
      logger.error('[SyncWorker] No se pudo crear sync_run', runError);
      continue;
    }

    const runId = runRecord.id;

    try {
      // 2.2. Desencriptar contraseña en memoria
      const plainPassword = decrypt(cred.encrypted_password, cred.encryption_version);
      let payload = {};

      // 2.3. Ejecutar Scraper
      if (cred.provider === 'tgr') {
        payload = await tgrScraper.consultarDeudaSimple(cred.username);
      } else if (cred.provider === 'sii') {
        payload = await siiScraper.consultarDatosBasicos(cred.username);
        // Futuro: usar plainPassword para autenticar en portal privado SII
      } else {
        throw new Error(`Provider no soportado: ${cred.provider}`);
      }

      // 2.4. Obtener el snapshot anterior para detectar cambios (simplificado)
      const { data: lastSnapshot } = await supabase
        .from('sync_snapshots')
        .select('data_payload')
        .eq('user_id', cred.user_id)
        .eq('provider', cred.provider)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let changesDetected = true; // Por defecto true si es el primer snapshot
      if (lastSnapshot && lastSnapshot.data_payload) {
        // Simple deep compare usando stringify (para MVP)
        changesDetected = JSON.stringify(lastSnapshot.data_payload) !== JSON.stringify(payload);
      }

      // 2.5. Guardar el nuevo snapshot
      await supabase.from('sync_snapshots').insert({
        sync_run_id: runId,
        user_id: cred.user_id,
        provider: cred.provider,
        data_payload: payload,
        changes_detected: changesDetected
      });

      // 2.6. Marcar run como success
      const latencyMs = Date.now() - startMs;
      await supabase.from('sync_runs')
        .update({ status: 'success', finished_at: new Date().toISOString(), latency_ms: latencyMs })
        .eq('id', runId);

      processedCount++;
      logger.info(`[SyncWorker] Éxito para user=${cred.user_id} provider=${cred.provider} changes=${changesDetected}`);

    } catch (err) {
      // 2.7. Marcar run como error
      const latencyMs = Date.now() - startMs;
      await supabase.from('sync_runs')
        .update({ status: 'error', error_code: err.message, finished_at: new Date().toISOString(), latency_ms: latencyMs })
        .eq('id', runId);
      logger.error(`[SyncWorker] Error procesando user=${cred.user_id}`, err.message);
    }
  }

  logger.info(`[SyncWorker] Ciclo terminado. Procesados: ${processedCount}`);
  return { success: true, processed: processedCount };
}

module.exports = {
  runAll
};
