import re

with open('C:/_AUTOMATIZAI/03_PRODUCTOS/dejadwebiar/landing.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Replace logo_robot.png with djadwebia_logo_final.png
html = html.replace('logo_robot.png', 'djadwebia_logo_final.png')

# 2. Fix typo "¿Dónde tenís que ir A?"
html = html.replace('¿Dónde tenís que ir A?<br>', '¿Dónde tenís que ir?<br>')

# 3. Replace the entire <style> block
new_style = """<style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --negro:        #ffffff;   
      --negro-hover:  #e0e0e0;
      --fondo:        #050508;   
      --fondo-glass:  rgba(255, 255, 255, 0.04);
      --border-glass: rgba(255, 255, 255, 0.08);

      --blue:         #60a5fa;
      --blue-dark:    #3b82f6;
      --blue-light:   rgba(59, 130, 246, 0.1);
      --blue-border:  rgba(59, 130, 246, 0.2);

      --gray-50:      #0a0a0e;
      --gray-100:     #121218;
      --gray-200:     #1a1a24;
      --gray-300:     #2a2a36;
      --gray-400:     #525266;
      --gray-500:     #8a8a9e;
      --gray-600:     #a1a1b5;
      --gray-700:     #c4c4d4;
      --gray-800:     #e2e2ec;
      --gray-900:     #ffffff;

      --green:        #4ade80;
      --green-light:  rgba(74, 222, 128, 0.1);
      --green-border: rgba(74, 222, 128, 0.2);
      --orange:       #ff7a00;
      --orange-light: rgba(255, 122, 0, 0.1);
      --red:          #f87171;

      --radius:       12px;
      --radius-lg:    20px;
      --shadow-card:  0 8px 32px rgba(0,0,0,.6);
      --shadow-glow:  0 0 24px rgba(255, 122, 0, 0.15);
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Syne', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: var(--gray-900);
      background: var(--fondo);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    img { display: block; max-width: 100%; }

    /* ─── Layout helpers ─── */
    .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
    .text-center { text-align: center; }

    /* ─── NAV ─── */
    nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(5,5,8,.7);
      border-bottom: 1px solid var(--border-glass);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
    .nav-inner {
      max-width: 1100px; margin: 0 auto; padding: 0 20px;
      height: 64px; display: flex; align-items: center; justify-content: space-between;
    }
    .nav-logo { display: flex; align-items: center; gap: 0; text-decoration: none; }
    .nav-logo-text { display: flex; align-items: center; }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { font-size: 14px; color: var(--gray-600); transition: color .15s; }
    .nav-links a:hover { color: var(--gray-900); }
    .nav-actions { display: flex; gap: 10px; align-items: center; }
    .btn-ghost { background: none; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--gray-600); padding: 6px 12px; border-radius: var(--radius); transition: background .15s; }
    .btn-ghost:hover { background: var(--gray-100); }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: var(--radius); font-size: 14px; font-weight: 700; cursor: pointer; border: none; transition: all .2s; text-decoration: none; letter-spacing: .01em; }
    .btn-primary { background: var(--negro); color: var(--fondo); box-shadow: var(--shadow-glow); }
    .btn-primary:hover { background: var(--negro-hover); box-shadow: 0 0 32px rgba(255, 122, 0, 0.3); transform: translateY(-1px); }
    .btn-outline { background: transparent; color: var(--gray-800); border: 1px solid var(--border-glass); }
    .btn-outline:hover { background: var(--fondo-glass); border-color: var(--gray-400); }
    .btn-lg { padding: 14px 32px; font-size: 16px; border-radius: var(--radius); }
    .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; color: var(--gray-600); }
    .mobile-menu { display: none; border-top: 1px solid var(--border-glass); padding: 16px 20px; flex-direction: column; gap: 12px; background: var(--fondo); }
    .mobile-menu a { font-size: 15px; color: var(--gray-700); padding: 6px 0; display: block; }
    .mobile-menu.open { display: flex; }

    /* ─── HERO ─── */
    .hero { 
      padding: 120px 0 112px; 
      text-align: center; 
      background: radial-gradient(circle at top center, rgba(255,122,0,0.08) 0%, rgba(5,5,8,1) 60%);
    }
    .badge-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--fondo-glass); color: var(--gray-700); border: 1px solid var(--border-glass);
      border-radius: 99px; padding: 5px 16px; font-size: 12px; font-weight: 700; margin-bottom: 24px;
      letter-spacing: .03em; text-transform: uppercase;
      backdrop-filter: blur(8px);
    }
    .hero h1 {
      font-size: clamp(2.2rem, 5vw, 4rem);
      font-weight: 900; line-height: 1.1; letter-spacing: -1.5px;
      margin-bottom: 24px;
    }
    .hero h1 .accent {
      color: var(--orange);
      font-family: 'Barlow Condensed', Impact, Arial Narrow, sans-serif;
      font-weight: 600;
      letter-spacing: -0.03em;
      text-shadow: 0 0 24px rgba(255, 122, 0, 0.4);
    }
    .hero p { font-size: clamp(15px, 2vw, 18px); color: var(--gray-500); max-width: 560px; margin: 0 auto 36px; line-height: 1.7; }
    .email-form { display: flex; gap: 10px; max-width: 420px; margin: 0 auto; flex-wrap: wrap; }
    .email-form input {
      flex: 1; min-width: 0; height: 46px; border: 1px solid var(--border-glass); border-radius: var(--radius);
      padding: 0 16px; font-size: 14px; font-family: inherit; outline: none;
      background: var(--fondo-glass); color: var(--negro); transition: all .2s;
    }
    .email-form input:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(255,122,0,.15); background: rgba(255,255,255,0.08); }
    .email-form .btn { height: 46px; white-space: nowrap; }
    .success-msg {
      display: none; align-items: center; gap: 8px;
      color: var(--green); background: var(--green-light); border: 1px solid var(--green-border);
      border-radius: var(--radius); padding: 10px 20px; font-size: 14px; font-weight: 700; margin: 0 auto;
      max-width: fit-content;
    }
    .hero-note { font-size: 12px; color: var(--gray-400); margin-top: 10px; }
    .stats { display: flex; justify-content: center; gap: 40px; margin-top: 56px; flex-wrap: wrap; }
    .stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .stat-num { font-size: 28px; font-weight: 800; color: var(--gray-900); }
    .stat-label { font-size: 13px; color: var(--gray-500); }
    .stats-divider { width: 1px; background: var(--border-glass); align-self: stretch; }

    /* ─── DEMO ─── */
    .demo-section { background: var(--gray-50); border-top: 1px solid var(--border-glass); border-bottom: 1px solid var(--border-glass); padding: 72px 0; }
    .browser-window { max-width: 720px; margin: 0 auto; border: 1px solid var(--border-glass); border-radius: var(--radius-lg); background: var(--fondo-glass); box-shadow: 0 12px 48px rgba(0,0,0,.6); overflow: hidden; backdrop-filter: blur(20px); }
    .browser-bar { background: rgba(255,255,255,0.02); padding: 10px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-glass); }
    .dots { display: flex; gap: 6px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; opacity: 0.8; }
    .dot.red { background: #fc5c5c; }
    .dot.yellow { background: #fdbc40; }
    .dot.green { background: #34c749; }
    .url-bar { flex: 1; background: rgba(0,0,0,0.3); border: 1px solid var(--border-glass); border-radius: 6px; padding: 4px 12px; font-size: 12px; color: var(--gray-400); margin-left: 8px; }
    .browser-content { padding: 24px; }
    .demo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .demo-header h3 { font-size: 15px; font-weight: 600; color: var(--gray-900); }
    .tag-green { background: var(--green-light); color: var(--green); border: 1px solid var(--green-border); border-radius: 99px; padding: 2px 10px; font-size: 11px; font-weight: 600; }
    
    .causa-row {
      display: flex; align-items: center; justify-content: space-between;
      border: 1px solid var(--border-glass); border-radius: 8px; padding: 11px 16px; margin-bottom: 8px;
      font-size: 13px; cursor: pointer; transition: background .15s; background: rgba(255,255,255,0.02);
    }
    .causa-row:hover { background: rgba(255,255,255,0.05); }
    .causa-left .causa-rit { font-family: 'SF Mono', 'Courier New', monospace; font-weight: 600; color: var(--gray-800); }
    .causa-left .causa-sep { color: var(--gray-500); margin: 0 8px; }
    .causa-left .causa-tribunal { font-size: 12px; color: var(--gray-500); }
    .causa-right { display: flex; align-items: center; gap: 8px; }
    .tag-type { border: 1px solid var(--border-glass); color: var(--gray-600); border-radius: 99px; padding: 2px 10px; font-size: 11px; font-weight: 700; }
    .causa-estado { font-size: 12px; font-weight: 600; }
    .causa-estado.active { color: var(--orange); text-shadow: 0 0 10px rgba(255,122,0,0.5); }
    .causa-estado.done { color: var(--gray-500); }

    /* ─── HOW IT WORKS ─── */
    .section { padding: 96px 0; }
    .section-alt { background: var(--gray-50); border-top: 1px solid var(--border-glass); border-bottom: 1px solid var(--border-glass); }
    .section-head { text-align: center; margin-bottom: 56px; }
    .section-head h2 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; margin-bottom: 10px; letter-spacing: -.5px; }
    .section-head p { color: var(--gray-500); font-size: 15px; max-width: 480px; margin: 0 auto; }
    .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
    .step { display: flex; gap: 16px; }
    .step-num { width: 40px; height: 40px; border-radius: 50%; background: var(--orange); color: var(--fondo); font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: inherit; box-shadow: var(--shadow-glow); }
    .step-body h3 { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
    .step-body p { font-size: 13px; color: var(--gray-500); line-height: 1.65; }

    /* ─── FEATURES ─── */
    .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .feature-card { border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 24px; background: var(--fondo-glass); backdrop-filter: blur(10px); transition: box-shadow .2s, transform .2s, border-color .2s; box-shadow: var(--shadow-card); }
    .feature-card:hover { box-shadow: var(--shadow-glow); transform: translateY(-4px); border-color: rgba(255,122,0,.3); }
    .feature-icon { width: 38px; height: 38px; background: rgba(255,122,0,0.1); color: var(--orange); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .feature-card h3 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
    .feature-card p { font-size: 13px; color: var(--gray-500); line-height: 1.65; }

    /* ─── SOURCES ─── */
    .sources-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .source-card { display: flex; align-items: flex-start; gap: 14px; border: 1px solid var(--border-glass); border-radius: var(--radius); padding: 18px; transition: border-color .2s, box-shadow .2s; background: var(--fondo-glass); }
    .source-card:hover { border-color: var(--orange); box-shadow: var(--shadow-glow); }
    .source-icon { width: 38px; height: 38px; background: var(--fondo); border: 1px solid var(--border-glass); color: #fff; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; flex-shrink: 0; }
    .source-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .tag-available { background: var(--green-light); color: var(--green); border: 1px solid var(--green-border); border-radius: 99px; padding: 1px 8px; font-size: 11px; font-weight: 600; }
    .tag-soon { background: rgba(255,255,255,0.05); color: var(--gray-500); border: 1px solid var(--border-glass); border-radius: 99px; padding: 1px 8px; font-size: 11px; font-weight: 600; }
    .source-desc { font-size: 12px; color: var(--gray-500); }

    /* ─── TESTIMONIALS ─── */
    .testimonials-section { background: var(--fondo); padding: 80px 0; border-top: 1px solid var(--border-glass); }
    .testimonials-section h2 { color: #fff; font-size: 1.6rem; font-weight: 800; text-align: center; margin-bottom: 48px; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .testimonial { background: var(--fondo-glass); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 28px; backdrop-filter: blur(10px); }
    .testimonial-quote { color: rgba(255,255,255,.85); font-size: 14px; line-height: 1.75; margin-bottom: 20px; }
    .testimonial-author { color: #fff; font-size: 14px; font-weight: 700; }
    .testimonial-loc { color: rgba(255,255,255,.45); font-size: 12px; margin-top: 2px; }

    /* ─── PRICING ─── */
    .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: start; }
    .plan-card { border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 28px; position: relative; background: var(--fondo-glass); box-shadow: var(--shadow-card); backdrop-filter: blur(10px); }
    .plan-card.popular { border-color: rgba(255,122,0,0.4); box-shadow: var(--shadow-glow); }
    .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--orange); color: var(--fondo); border-radius: 99px; padding: 4px 16px; font-size: 11px; font-weight: 800; white-space: nowrap; letter-spacing: .04em; }
    .plan-name { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
    .plan-desc { font-size: 12px; color: var(--gray-500); margin-bottom: 16px; }
    .plan-price { display: flex; align-items: flex-end; gap: 4px; margin-bottom: 24px; }
    .price-currency { font-size: 13px; color: var(--gray-500); margin-bottom: 4px; }
    .price-amount { font-size: 2.2rem; font-weight: 900; line-height: 1; letter-spacing: -1px; }
    .price-period { font-size: 12px; color: var(--gray-400); margin-bottom: 4px; }
    .plan-features { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
    .plan-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--gray-600); }
    .check { color: var(--green); flex-shrink: 0; margin-top: 1px; }

    /* ─── FINAL CTA ─── */
    .cta-section { background: radial-gradient(circle at center, rgba(255,122,0,0.1) 0%, rgba(5,5,8,1) 70%); padding: 88px 0; text-align: center; border-top: 1px solid var(--border-glass); }
    .cta-section h2 { color: #fff; font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; margin-bottom: 14px; }
    .cta-section p { color: var(--gray-400); font-size: 15px; max-width: 480px; margin: 0 auto; margin-bottom: 32px;}

    /* ─── FOOTER ─── */
    footer { border-top: 1px solid var(--border-glass); padding: 40px 0; background: var(--fondo); }
    .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; font-size: 12px; color: var(--gray-500); }
    .footer-logo { display: flex; align-items: center; gap: 8px; }
    .footer-links { display: flex; gap: 20px; }
    .footer-links a:hover { color: var(--gray-800); }

    /* ─── RESPONSIVE ─── */
    @media (max-width: 900px) {
      .features-grid { grid-template-columns: repeat(2, 1fr); }
      .testimonials-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 700px) {
      .nav-links, .nav-actions { display: none; }
      .hamburger { display: block; }
      .steps-grid { grid-template-columns: 1fr; }
      .sources-grid { grid-template-columns: 1fr; }
      .pricing-grid { grid-template-columns: 1fr; }
      .stats-divider { display: none; }
      .stat-cards { grid-template-columns: 1fr; }
      .features-grid { grid-template-columns: 1fr; }
      .hero { padding: 80px 0 70px; background: radial-gradient(circle at top center, rgba(255,122,0,0.1) 0%, rgba(5,5,8,1) 50%); }
      .hero h1 { font-size: 2.2rem; }
      .email-form { flex-direction: column; }
      .email-form input, .email-form .btn { width: 100%; }
      .footer-inner { flex-direction: column; align-items: flex-start; }
      .search-row { flex-direction: column; gap: 16px; }
      .search-field { min-width: 100%; }
    }

    /* ─── SVG icons ─── */
    svg { display: inline-block; vertical-align: middle; }

    /* ─── BUSCAR (LIVE) ─── */
    .search-form {
      max-width: 720px; margin: 0 auto 32px; display: flex; flex-direction: column; gap: 12px;
    }
    .search-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .search-field { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 140px; }
    .search-field label { font-size: 12px; font-weight: 600; color: var(--gray-500); }
    .search-field input, .search-field select {
      height: 44px; border: 1px solid var(--border-glass); border-radius: var(--radius);
      padding: 0 14px; font-size: 14px; font-family: inherit; font-weight: 500;
      outline: none; background: rgba(0,0,0,0.5); color: var(--negro);
      transition: border-color .2s, box-shadow .2s, transform .2s;
    }
    .search-field input:focus, .search-field select:focus {
      border-color: var(--orange); box-shadow: 0 0 0 3px rgba(255,122,0,.2);
      transform: translateY(-1px); background: rgba(0,0,0,0.8);
    }
    .search-actions { display: flex; justify-content: center; margin-top: 4px; }
    .btn-search {
      padding: 13px 36px; background: var(--orange); color: var(--fondo); border: none;
      border-radius: var(--radius); font-size: 15px; font-weight: 800; font-family: inherit;
      cursor: pointer; transition: background .2s, transform .2s, box-shadow .2s;
      display: flex; align-items: center; gap: 8px; letter-spacing: .01em;
      box-shadow: var(--shadow-glow);
    }
    .btn-search:hover { background: #ff8e24; transform: translateY(-2px); box-shadow: 0 0 32px rgba(255, 122, 0, 0.4); }
    .btn-search:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }

    /* Loading spinner */
    .spinner {
      width: 18px; height: 18px; border: 2px solid rgba(0,0,0,.4);
      border-top-color: #000; border-radius: 50%;
      animation: spin .7s linear infinite; display: none;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Results */
    #results-window { display: none; max-width: 720px; margin: 0 auto; }
    .results-summary {
      display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
    }
    .result-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--fondo-glass); color: var(--gray-700);
      border: 1px solid var(--border-glass); border-radius: 99px;
      padding: 5px 14px; font-size: 12px; font-weight: 700; letter-spacing: .02em;
    }
    .result-badge.green { background: var(--green-light); color: var(--green); border-color: var(--green-border); }
    .result-badge.orange { background: var(--orange-light); color: var(--orange); border-color: rgba(255,122,0,0.3); }
    .causas-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .error-box {
      background: rgba(239, 83, 80, 0.1); border: 1px solid rgba(239, 83, 80, 0.3); border-radius: 10px;
      padding: 16px 20px; color: #ff8a80; font-size: 14px; text-align: center;
    }
    .empty-box {
      background: rgba(255,255,255,0.02); border: 1px solid var(--border-glass); border-radius: 10px;
      padding: 32px; text-align: center; color: var(--gray-500); font-size: 14px;
    }
    .empty-box strong { display: block; color: var(--gray-800); font-size: 15px; margin-bottom: 6px; }
    .url-bar-live { color: var(--gray-700) !important; font-weight: 500; }
  </style>"""

html = re.sub(r'<style>.*?</style>', new_style, html, flags=re.DOTALL)

with open('C:/_AUTOMATIZAI/03_PRODUCTOS/dejadwebiar/landing.html', 'w', encoding='utf-8') as f:
    f.write(html)
