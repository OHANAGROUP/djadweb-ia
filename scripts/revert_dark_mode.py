import re

with open('C:/_AUTOMATIZAI/03_PRODUCTOS/dejadwebiar/landing.html', 'r', encoding='utf-8') as f:
    html = f.read()

original_style = """<style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      /* ── Paleta AutomatizAI (de quenotekguen) ── */
      --negro:        #0a0a0e;   /* primario CTA */
      --negro-hover:  #1a1a22;
      --fondo:        #f5f5f0;   /* background cálido */

      /* Azul institucional — TramitAI / PJUD */
      --blue:         #1565c0;
      --blue-dark:    #0d47a1;
      --blue-light:   #e3f2fd;
      --blue-border:  #90caf9;

      /* Grises de marca */
      --gray-50:      #f5f5f0;
      --gray-100:     #ececec;
      --gray-200:     #e0e0e0;
      --gray-300:     #cccccc;
      --gray-400:     #888888;
      --gray-500:     #666666;
      --gray-600:     #444444;
      --gray-700:     #2a2a2a;
      --gray-800:     #1a1a1a;
      --gray-900:     #0a0a0e;

      /* Semáforo */
      --green:        #2e7d32;
      --green-light:  #e8f5e9;
      --green-border: #a5d6a7;
      --orange:       #e65100;
      --orange-light: #fff3e0;
      --red:          #e63946;

      /* Geometría */
      --radius:       12px;
      --radius-lg:    20px;
      --shadow-card:  0 2px 16px rgba(0,0,0,.06);
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
      background: rgba(245,245,240,.95);
      border-bottom: 1px solid var(--gray-200);
      backdrop-filter: blur(10px);
    }
    .nav-inner {
      max-width: 1100px; margin: 0 auto; padding: 0 20px;
      height: 56px; display: flex; align-items: center; justify-content: space-between;
    }
    .nav-logo { display: flex; align-items: center; gap: 0; text-decoration: none; }
    .nav-logo-text { display: flex; align-items: center; }
    .logo-badge {
      width: 28px; height: 28px; background: var(--negro); border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 12px; font-weight: 800; letter-spacing: -.5px;
    }
    .nav-links { display: flex; gap: 28px; }
    .nav-links a { font-size: 14px; color: var(--gray-600); transition: color .15s; }
    .nav-links a:hover { color: var(--gray-900); }
    .nav-actions { display: flex; gap: 10px; align-items: center; }
    .btn-ghost { background: none; border: none; cursor: pointer; font-size: 14px; font-weight: 600; color: var(--gray-600); padding: 6px 12px; border-radius: var(--radius); transition: background .15s; }
    .btn-ghost:hover { background: var(--gray-100); }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; border-radius: var(--radius); font-size: 14px; font-weight: 700; cursor: pointer; border: none; transition: all .15s; text-decoration: none; letter-spacing: .01em; }
    .btn-primary { background: var(--negro); color: #fff; }
    .btn-primary:hover { background: var(--negro-hover); }
    .btn-outline { background: var(--fondo); color: var(--gray-800); border: 2px solid var(--gray-200); }
    .btn-outline:hover { background: var(--gray-100); border-color: var(--gray-300); }
    .btn-lg { padding: 14px 32px; font-size: 16px; border-radius: var(--radius); }
    .hamburger { display: none; background: none; border: none; cursor: pointer; padding: 4px; color: var(--gray-600); }
    .mobile-menu { display: none; border-top: 1px solid var(--gray-100); padding: 16px 20px; flex-direction: column; gap: 12px; background: #fff; }
    .mobile-menu a { font-size: 15px; color: var(--gray-700); padding: 6px 0; display: block; }
    .mobile-menu.open { display: flex; }

    /* ─── HERO ─── */
    .hero { padding: 80px 0 96px; text-align: center; }
    .badge-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--gray-100); color: var(--gray-700); border: 1px solid var(--gray-200);
      border-radius: 99px; padding: 5px 16px; font-size: 12px; font-weight: 700; margin-bottom: 24px;
      letter-spacing: .03em; text-transform: uppercase;
    }
    .hero h1 {
      font-size: clamp(2rem, 5vw, 3.75rem);
      font-weight: 900; line-height: 1.1; letter-spacing: -1.5px;
      margin-bottom: 24px;
    }
    .hero h1 .accent {
      color: var(--orange);
      font-family: 'Barlow Condensed', Impact, Arial Narrow, sans-serif;
      font-weight: 600;
      letter-spacing: -0.03em;
    }
    .hero p { font-size: clamp(15px, 2vw, 18px); color: var(--gray-500); max-width: 560px; margin: 0 auto 36px; line-height: 1.7; }
    .email-form { display: flex; gap: 10px; max-width: 420px; margin: 0 auto; flex-wrap: wrap; }
    .email-form input {
      flex: 1; min-width: 0; height: 46px; border: 2px solid var(--gray-200); border-radius: var(--radius);
      padding: 0 16px; font-size: 14px; font-family: inherit; outline: none;
      background: #fff; transition: border-color .15s, box-shadow .15s;
    }
    .email-form input:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(230,81,0,.15); }
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
    .stats-divider { width: 1px; background: var(--gray-200); align-self: stretch; }

    /* ─── DEMO ─── */
    .demo-section { background: var(--gray-100); border-top: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200); padding: 72px 0; }
    .browser-window { max-width: 720px; margin: 0 auto; border: 1px solid var(--gray-200); border-radius: var(--radius-lg); background: #fff; box-shadow: 0 4px 32px rgba(0,0,0,.08); overflow: hidden; }
    .browser-bar { background: var(--gray-100); padding: 10px 16px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--gray-200); }
    .dots { display: flex; gap: 6px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot.red { background: #fc5c5c; }
    .dot.yellow { background: #fdbc40; }
    .dot.green { background: #34c749; }
    .url-bar { flex: 1; background: #fff; border: 1px solid var(--gray-200); border-radius: 6px; padding: 4px 12px; font-size: 12px; color: var(--gray-400); margin-left: 8px; }
    .browser-content { padding: 24px; }
    .demo-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .demo-header h3 { font-size: 15px; font-weight: 600; }
    .tag-green { background: var(--green-light); color: var(--green); border: 1px solid var(--green-border); border-radius: 99px; padding: 2px 10px; font-size: 11px; font-weight: 600; }
    
    .causa-row {
      display: flex; align-items: center; justify-content: space-between;
      border: 1px solid var(--gray-100); border-radius: 8px; padding: 11px 16px; margin-bottom: 8px;
      font-size: 13px; cursor: pointer; transition: background .1s;
    }
    .causa-row:hover { background: var(--gray-50); }
    .causa-left .causa-rit { font-family: 'SF Mono', 'Courier New', monospace; font-weight: 600; color: var(--gray-800); }
    .causa-left .causa-sep { color: var(--gray-300); margin: 0 8px; }
    .causa-left .causa-tribunal { font-size: 12px; color: var(--gray-500); }
    .causa-right { display: flex; align-items: center; gap: 8px; }
    .tag-type { border: 1px solid var(--gray-300); color: var(--gray-600); border-radius: 99px; padding: 2px 10px; font-size: 11px; font-weight: 700; }
    .causa-estado { font-size: 12px; font-weight: 600; }
    .causa-estado.active { color: var(--orange); }
    .causa-estado.done { color: var(--gray-400); }

    /* ─── HOW IT WORKS ─── */
    .section { padding: 96px 0; }
    .section-alt { background: var(--gray-100); border-top: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200); }
    .section-head { text-align: center; margin-bottom: 56px; }
    .section-head h2 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; margin-bottom: 10px; letter-spacing: -.5px; }
    .section-head p { color: var(--gray-500); font-size: 15px; max-width: 480px; margin: 0 auto; }
    .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
    .step { display: flex; gap: 16px; }
    .step-num { width: 40px; height: 40px; border-radius: 50%; background: var(--negro); color: #fff; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-family: inherit; }
    .step-body h3 { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
    .step-body p { font-size: 13px; color: var(--gray-500); line-height: 1.65; }

    /* ─── FEATURES ─── */
    .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .feature-card { border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: 24px; background: #fff; transition: box-shadow .2s, transform .2s; box-shadow: var(--shadow-card); }
    .feature-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.1); transform: translateY(-2px); }
    .feature-icon { width: 38px; height: 38px; background: var(--gray-100); color: var(--negro); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .feature-card h3 { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
    .feature-card p { font-size: 13px; color: var(--gray-500); line-height: 1.65; }

    /* ─── SOURCES ─── */
    .sources-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .source-card { display: flex; align-items: flex-start; gap: 14px; border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 18px; transition: border-color .2s, box-shadow .2s; background: #fff; }
    .source-card:hover { border-color: var(--negro); box-shadow: var(--shadow-card); }
    .source-icon { width: 38px; height: 38px; background: var(--negro); color: #fff; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; flex-shrink: 0; }
    .source-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .tag-available { background: var(--green-light); color: var(--green); border: 1px solid var(--green-border); border-radius: 99px; padding: 1px 8px; font-size: 11px; font-weight: 600; }
    .tag-soon { background: var(--gray-100); color: var(--gray-500); border: 1px solid var(--gray-200); border-radius: 99px; padding: 1px 8px; font-size: 11px; font-weight: 600; }
    .source-desc { font-size: 12px; color: var(--gray-500); }

    /* ─── TESTIMONIALS ─── */
    .testimonials-section { background: var(--negro); padding: 80px 0; }
    .testimonials-section h2 { color: #fff; font-size: 1.6rem; font-weight: 800; text-align: center; margin-bottom: 48px; }
    .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .testimonial { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); border-radius: var(--radius-lg); padding: 28px; }
    .testimonial-quote { color: rgba(255,255,255,.85); font-size: 14px; line-height: 1.75; margin-bottom: 20px; }
    .testimonial-author { color: #fff; font-size: 14px; font-weight: 700; }
    .testimonial-loc { color: rgba(255,255,255,.45); font-size: 12px; margin-top: 2px; }

    /* ─── PRICING ─── */
    .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: start; }
    .plan-card { border: 1px solid var(--gray-200); border-radius: var(--radius-lg); padding: 28px; position: relative; background: #fff; box-shadow: var(--shadow-card); }
    .plan-card.popular { border-color: var(--negro); box-shadow: 0 8px 32px rgba(10,10,14,.14); }
    .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--negro); color: #fff; border-radius: 99px; padding: 4px 16px; font-size: 11px; font-weight: 800; white-space: nowrap; letter-spacing: .04em; }
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
    .cta-section { background: var(--negro); padding: 88px 0; text-align: center; }
    .cta-section h2 { color: #fff; font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 800; margin-bottom: 14px; }
    .cta-section p { color: var(--gray-400); font-size: 15px; max-width: 480px; margin: 0 auto 32px; }

    /* ─── FOOTER ─── */
    footer { border-top: 1px solid var(--gray-100); padding: 40px 0; }
    .footer-inner { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; font-size: 12px; color: var(--gray-400); }
    .footer-logo { display: flex; align-items: center; gap: 8px; }
    .logo-sm { width: 20px; height: 20px; background: var(--negro); border-radius: 5px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 800; }
    .footer-logo span { font-weight: 700; color: var(--gray-600); }
    .footer-links { display: flex; gap: 20px; }
    .footer-links a:hover { color: var(--gray-700); }

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
      .hero { padding: 80px 0 70px; }
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
      height: 44px; border: 2px solid var(--gray-200); border-radius: var(--radius);
      padding: 0 14px; font-size: 14px; font-family: inherit; font-weight: 500;
      outline: none; background: #fff; color: var(--negro);
      transition: border-color .15s, box-shadow .15s;
    }
    .search-field input:focus, .search-field select:focus {
      border-color: var(--orange); box-shadow: 0 0 0 3px rgba(230,81,0,.15);
    }
    .search-actions { display: flex; justify-content: center; margin-top: 4px; }
    .btn-search {
      padding: 13px 36px; background: var(--negro); color: #fff; border: none;
      border-radius: var(--radius); font-size: 15px; font-weight: 800; font-family: inherit;
      cursor: pointer; transition: background .15s, transform .15s;
      display: flex; align-items: center; gap: 8px; letter-spacing: .01em;
    }
    .btn-search:hover { background: var(--negro-hover); transform: translateY(-1px); }
    .btn-search:disabled { opacity: .6; cursor: not-allowed; transform: none; }

    /* Loading spinner */
    .spinner {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff; border-radius: 50%;
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
      background: var(--gray-100); color: var(--gray-700);
      border: 1px solid var(--gray-200); border-radius: 99px;
      padding: 5px 14px; font-size: 12px; font-weight: 700; letter-spacing: .02em;
    }
    .result-badge.green { background: var(--green-light); color: var(--green); border-color: var(--green-border); }
    .result-badge.orange { background: var(--orange-light); color: var(--orange); border-color: #ffccbc; }
    .causas-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .error-box {
      background: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px;
      padding: 16px 20px; color: #be123c; font-size: 14px; text-align: center;
    }
    .empty-box {
      background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 10px;
      padding: 32px; text-align: center; color: var(--gray-500); font-size: 14px;
    }
    .empty-box strong { display: block; color: var(--gray-700); font-size: 15px; margin-bottom: 6px; }
    .url-bar-live { color: var(--gray-700) !important; font-weight: 500; }
  </style>"""

html = re.sub(r'<style>.*?</style>', original_style, html, flags=re.DOTALL)

with open('C:/_AUTOMATIZAI/03_PRODUCTOS/dejadwebiar/landing.html', 'w', encoding='utf-8') as f:
    f.write(html)
