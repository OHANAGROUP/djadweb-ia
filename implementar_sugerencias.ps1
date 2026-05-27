#Requires -Version 5.1
$ErrorActionPreference='Stop'
$F="C:\_AUTOMATIZAI\03_PRODUCTOS\dejadwebiar\frontend"
$S="$F\src\app"

Write-Host "🚀 IMPLEMENTANDO SUGERENCIAS" -ForegroundColor Cyan

# ── 1. FIX FAVICON ──
Write-Host "1. Fix favicon 404..." -ForegroundColor Yellow
$lp="$S\layout.tsx"
$l=Get-Content $lp -Raw -Encoding UTF8
$l=$l -replace "icon: '/favicon.ico'","icon: '/dejawebiar_icon.png'"
$l=$l -replace "apple: '/apple-touch-icon.png'","apple: '/dejawebiar_icon.png'"
[System.IO.File]::WriteAllText($lp,$l,[System.Text.UTF8Encoding]::new($false))
Write-Host "   ✅ layout.tsx icons fixed" -ForegroundColor Green

# ── FUNCTION: Create a page ──
function New-Page($path, $content) {
    $fp="$S\$path\page.tsx"
    $d=[System.IO.Path]::GetDirectoryName($fp)
    if(-not (Test-Path $d)){New-Item -ItemType Directory -Path $d -Force|Out-Null}
    [System.IO.File]::WriteAllText($fp,$content,[System.Text.UTF8Encoding]::new($false))
    Write-Host "   ✅ $path/page.tsx" -ForegroundColor Green
}

# ── SHARED PAGE STYLES ──
$H='use client; import { useRouter } from "next/navigation"'
$H=$H.Replace(';',"`n")

$S1 = @"
const st = {
  pg: { minHeight:'100vh', background:'var(--brand-bg)', fontFamily:'var(--font-ui),Syne,sans-serif' },
  hd: { borderBottom:'1px solid var(--gray-100)', padding:'20px 0', background:'#fff' },
  hi: { maxWidth:800, margin:'0 auto', padding:'0 20px', display:'flex', alignItems:'center', justifyContent:'space-between' },
  lg: { fontFamily:'var(--font-brand),"Barlow Condensed",sans-serif', fontWeight:900, fontSize:22, color:'var(--brand-black)', textDecoration:'none', letterSpacing:'-0.03em' },
  bk: { background:'none', border:'1.5px solid var(--gray-200)', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontSize:13, fontWeight:700, color:'var(--gray-600)', fontFamily:'var(--font-ui),Syne,sans-serif', transition:'all 0.2s' },
  ct: { maxWidth:800, margin:'0 auto', padding:'48px 20px 80px' },
  t1: { fontFamily:'var(--font-brand),"Barlow Condensed",sans-serif', fontWeight:900, fontSize:36, color:'var(--brand-black)', marginBottom:8, lineHeight:1.1 },
  dt: { fontSize:13, color:'var(--gray-400)', marginBottom:40 },
  h2: { fontSize:20, fontWeight:800, color:'var(--gray-800)', marginTop:40, marginBottom:12 },
  h3: { fontSize:16, fontWeight:700, color:'var(--gray-700)', marginTop:28, marginBottom:8 },
  p: { fontSize:15, lineHeight:1.8, color:'var(--gray-600)', marginBottom:16 },
  ul: { paddingLeft:24, marginBottom:16 },
  li: { fontSize:15, lineHeight:1.8, color:'var(--gray-600)', marginBottom:6 },
  ft: { borderTop:'1px solid var(--gray-100)', padding:'24px 0', textAlign:'center' as const, fontSize:12, color:'var(--gray-400)' },
}
"@

# ── 2. PRIVACIDAD ──
$priv = @"
$H

$S1

export default function PrivacidadPage() {
  const r = useRouter()
  return (
    <div style={st.pg}>
      <header style={st.hd}><div style={st.hi}><a href="/" style={st.lg}>DJADWEB-IA&reg;</a><button onClick={()=>r.push('/')} style={st.bk}>&larr; Volver</button></div></header>
      <main style={st.ct}>
        <h1 style={st.t1}>Pol&iacute;tica de Privacidad</h1>
        <p style={st.dt}>Última actualización: 26 de mayo de 2026</p>
        <p style={st.p}>En <strong>DJADWEB-IA&reg;</strong> (operado por <strong>AutomatizAI</strong>), valoramos y protegemos tu privacidad. Esta pol&iacute;tica explica c&oacute;mo recopilamos, usamos y resguardamos tu informaci&oacute;n.</p>
        <h2 style={st.h2}>1. Datos que recopilamos</h2>
        <p style={st.p}>Recopilamos únicamente la informaci&oacute;n necesaria para operar nuestro servicio:</p>
        <ul style={st.ul}>
          <li style={st.li}><strong>Datos de cuenta:</strong> correo electr&oacute;nico y nombre al registrarte.</li>
          <li style={st.li}><strong>Datos de consulta:</strong> RUT, nombres y datos de causas que ingreses voluntariamente.</li>
          <li style={st.li}><strong>Datos de pago:</strong> procesados por MercadoPago. No almacenamos datos financieros sensibles.</li>
          <li style={st.li}><strong>Datos de uso:</strong> páginas visitadas e interacciones con el copiloto IA.</li>
        </ul>
        <h2 style={st.h2}>2. C&oacute;mo usamos tus datos</h2>
        <ul style={st.ul}>
          <li style={st.li}>Para procesar consultas a portales del Estado chileno.</li>
          <li style={st.li}>Para mejorar nuestro copiloto IA y la experiencia de usuario.</li>
          <li style={st.li}>Para enviar alertas sobre cambios en causas o tr&aacute;mites (plan activo).</li>
          <li style={st.li}>Para comunicaciones transaccionales (facturas, cambios en el servicio).</li>
        </ul>
        <h2 style={st.h2}>3. No compartimos tus datos</h2>
        <p style={st.p}>No vendemos, alquilamos ni compartimos tu informaci&oacute;n personal con terceros para fines comerciales. Podemos compartir datos con autoridades si la ley chilena lo exige.</p>
        <h2 style={st.h2}>4. Seguridad</h2>
        <p style={st.p}>Implementamos cifrado en tr&aacute;nsito (HTTPS/TLS), autenticaci&oacute;n segura mediante Supabase, y acceso restringido a bases de datos.</p>
        <h2 style={st.h2}>5. Tus derechos</h2>
        <p style={st.p}>De acuerdo con la Ley N&deg; 19.628 sobre Protecci&oacute;n de la Vida Privada en Chile, tienes derecho a: solicitar acceso, rectificaci&oacute;n o eliminaci&oacute;n de tus datos, oponerte al tratamiento, y solicitar portabilidad. Escr&iacute;benos a <strong>hola@tramitai.cl</strong>.</p>
        <h2 style={st.h2}>6. Cookies</h2>
        <p style={st.p}>Utilizamos cookies estrictamente necesarias para el funcionamiento de la plataforma. No usamos cookies de rastreo publicitario.</p>
        <h2 style={st.h2}>7. Contacto</h2>
        <p style={st.p}>Dudas: <strong>hola@tramitai.cl</strong> o <a href="/contacto" style={{color:'var(--brand-orange)'}}>p&aacute;gina de contacto</a>.</p>
      </main>
      <footer style={st.ft}>&copy; 2026 DJADWEB-IA&reg; &middot; AutomatizAI.</footer>
    </div>
  )
}
"@
New-Page "privacidad" $priv

# ── 3. TERMINOS ──
$term = @"
$H

$S1

export default function TerminosPage() {
  const r = useRouter()
  return (
    <div style={st.pg}>
      <header style={st.hd}><div style={st.hi}><a href="/" style={st.lg}>DJADWEB-IA&reg;</a><button onClick={()=>r.push('/')} style={st.bk}>&larr; Volver</button></div></header>
      <main style={st.ct}>
        <h1 style={st.t1}>T&eacute;rminos de Servicio</h1>
        <p style={st.dt}>Última actualización: 26 de mayo de 2026</p>
        <p style={st.p}>Al usar <strong>DJADWEB-IA&reg;</strong>, operado por <strong>AutomatizAI</strong>, aceptas los siguientes t&eacute;rminos.</p>
        <h2 style={st.h2}>1. Descripci&oacute;n del Servicio</h2>
        <p style={st.p}>Asistente digital que centraliza consultas a portales p&uacute;blicos chilenos (PJUD, SII, TGR). No reemplaza asesor&iacute;a legal profesional.</p>
        <h2 style={st.h2}>2. Uso del Servicio</h2>
        <ul style={st.ul}>
          <li style={st.li}>Debes ser mayor de 18 a&ntilde;os o tener autorizaci&oacute;n legal.</li>
          <li style={st.li}>Ciertas funcionalidades requieren registro y/o plan de pago.</li>
          <li style={st.li}>No uses la plataforma para actividades il&iacute;citas.</li>
          <li style={st.li}>Eres responsable de la veracidad de los datos ingresados.</li>
        </ul>
        <h2 style={st.h2}>3. Planes y Pagos</h2>
        <ul style={st.ul}>
          <li style={st.li}><strong>Gratuito:</strong> 3 consultas/mes.</li>
          <li style={st.li}><strong>B&aacute;sico ($3.990/mes):</strong> consultas ilimitadas, alertas WhatsApp/email, historial.</li>
          <li style={st.li}><strong>Premium ($7.990/mes):</strong> todo lo anterior + monitorizaci&oacute;n continua + soporte prioritario.</li>
          <li style={st.li}>Pagos por MercadoPago. Suscripci&oacute;n renovable autom&aacute;ticamente. Cancela desde tu dashboard.</li>
        </ul>
        <h2 style={st.h2}>4. Limitaci&oacute;n de Responsabilidad</h2>
        <p style={st.p}>No garantizamos exactitud total de datos de te
