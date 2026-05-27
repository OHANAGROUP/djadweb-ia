#!/usr/bin/env pwsh
# FIX_BUILD_ERRORS.ps1
# Quita el index.lock, commitea los 3 archivos limpios, y pushea.
# Ejecutar desde: C:\_AUTOMATIZAI\03_PRODUCTOS\tramita

Set-Location "C:\_AUTOMATIZAI\03_PRODUCTOS\tramita"

Write-Host "=== Paso 1: Eliminar index.lock ===" -ForegroundColor Yellow
$lockFile = ".git\index.lock"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force
    Write-Host "  ✅ index.lock eliminado" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  No existe index.lock (OK)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Paso 2: Verificar conteo de lineas ===" -ForegroundColor Yellow
$navbar  = (Get-Content "frontend\src\components\Navbar.tsx").Count
$plans   = (Get-Content "frontend\src\lib\plans.ts").Count
$buscar  = (Get-Content "frontend\src\app\api\buscar\route.ts").Count
Write-Host "  Navbar.tsx : $navbar lineas (esperado 235)"
Write-Host "  plans.ts   : $plans lineas (esperado 139)"
Write-Host "  route.ts   : $buscar lineas (esperado 183)"

Write-Host ""
Write-Host "=== Paso 3: git add de los 3 archivos ===" -ForegroundColor Yellow
git add frontend/src/components/Navbar.tsx frontend/src/lib/plans.ts frontend/src/app/api/buscar/route.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ git add fallo. Verifica el repo." -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Archivos staged" -ForegroundColor Green

Write-Host ""
Write-Host "=== Paso 4: git commit ===" -ForegroundColor Yellow
git commit -m "fix: remove duplicate trailing syntax from Navbar, plans, buscar route"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ git commit fallo" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Commit creado" -ForegroundColor Green

Write-Host ""
Write-Host "=== Paso 5: git push ===" -ForegroundColor Yellow
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Push fallo" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Push exitoso — Vercel deberia disparar un nuevo build" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Listo. Monitorea el build en: https://vercel.com/ohanagroup/tramita" -ForegroundColor Magenta
