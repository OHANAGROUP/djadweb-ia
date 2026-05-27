import { test, expect } from '@playwright/test';

test.describe('DJADWEB-IA® — Suite de Pruebas E2E del Frontend', () => {

  test('Debería desplegar banner amigable de servicio degradado ante caídas del Scraper Render', async ({ page }) => {
    // 1. Interceptar y forzar error 503 (Outage simulado) en la llamada API a buscar SII/TGR
    await page.route('**/api/buscar/**', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Error al consultar SII/TGR',
          detalle: 'Outage simulado para pruebas de resiliencia de la interfaz.'
        })
      });
    });

    // 2. Navegar a la página de búsqueda
    await page.goto('/buscar');

    // 3. Rellenar formulario con datos simulados
    await page.fill('input[placeholder*="RUT"]', '76.124.908-1');
    await page.click('button:has-text("Buscar")');

    // 4. Verificar que se despliega la UI degradada con el mensaje amigable
    const degradedMessage = page.locator('text=Estamos experimentando una alta congestión');
    await expect(degradedMessage).toBeVisible({ timeout: 5000 });

    // 5. Verificar que el botón alternativo de agendar alerta por email está disponible
    const alertButton = page.locator('button:has-text("Agendar Alerta por Email")');
    await expect(alertButton).toBeVisible();
  });

  test('Debería permitir registrar una Alerta por Correo de forma asíncrona ante degradaciones', async ({ page }) => {
    // Interceptar API de alertas
    await page.route('**/api/alertas', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Alerta registrada con éxito.' })
      });
    });

    await page.goto('/buscar');
    
    // Forzar el estado degradado
    await page.route('**/api/buscar/**', route => route.fulfill({ status: 503 }));
    await page.fill('input[placeholder*="RUT"]', '76.124.908-1');
    await page.click('button:has-text("Buscar")');

    // Click en "Agendar Alerta por Email"
    await page.click('button:has-text("Agendar Alerta por Email")');

    // Completar el modal/formulario de la alerta
    await page.fill('input[type="email"]', 'pablo@automatizai.cl');
    await page.click('button:has-text("Confirmar Alerta")');

    // Validar mensaje de éxito
    const successToast = page.locator('text=Alerta agendada exitosamente');
    await expect(successToast).toBeVisible();
  });

});
