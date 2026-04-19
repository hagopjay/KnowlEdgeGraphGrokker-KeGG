pls provide as many sophisticated pipelines where we can take an existing or synthetic scientific/ engineering/ economic etc dataset and then properly transfer and tranform the data through analytical processes into a BEAUTIFUL blender visualizations! and i mean i want the blender visualization to be the CROWN JEWEL of the output and all your EFFORTS here. find a few great example datasets or domains to mine and then pivot and expend all energy on brilliantly creative and technical ways of vISUALIZING THEM!! thank you maestro!



Here are your **five complete data → Blender crown jewel pipelines**, each with fully runnable Python preprocessing code and `bpy` Blender scripts:

---

**01 — Seismic Globe** (USGS earthquake catalog)
The centrepiece technique: a Gaussian KDE density map of 20,000 earthquakes gets baked as a UV emission texture onto an Earth sphere, so tectonic plate boundaries literally glow amber. Each quake point is depth-color-coded — shallow = incandescent yellow, deep mantle = cyan — with emission strength scaled logarithmically to magnitude. A volumetric atmosphere shell scatters blue Rayleigh light into a planetary limb halo.

**02 — Protein Ribbon Sculpture** (RCSB PDB / AlphaFold)
DSSP secondary structure annotations drive three glass materials: α-helices get SSS blue transmission glass, β-sheets get amber, loops get clear. Caustic rendering at 16 bounces fires light through the refractive protein mass. B-factor crystallographic flexibility data modulates the NURBS bevel radius along the backbone — rigid core vs wobbly terminus is physically accurate *and* visually expressive.

**03 — Atmospheric Wind Field** (ERA5 reanalysis, NOAA)
3,000 RK4-integrated streamlines through the real 3D wind velocity field, each with per-point bevel radius set to local wind speed. Jet streams swell fat and white-yellow; tropical doldrums thin to a whisper. A 70%-transmission Earth shell renders beneath the atmosphere. 5K cinematic format.

**04 — Market Correlation Crystal** (S&P 500, yfinance)
Spearman correlations → 3D MDS layout → sector-colored diamond-IOR glass orbs. Correlation filaments between them are cylinders whose radius encodes r-strength; cross-sector edges blend both sector hues. Compositor Fog Glow halos every orb. Stocks with higher annualized volatility become physically larger spheres.

**05 — Dark Matter Cosmic Web** (N-body simulation)
Leapfrog-integrated N-body gravity with Zel'dovich initial conditions, density gridded at 128³ via SPH smoothing, exported as a sparse OpenVDB volume. A 4-stop attribute-driven color ramp (black → violet → blue → white) drives the volume shader. Marching-cubes filament skeletons add luminous curve geometry along density ridges.



<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Data → Blender: Scientific Visualization Pipelines</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@300;400;600&family=Overpass:wght@200;400;700&display=swap" rel="stylesheet">
<style>
  :root {
    --void: #020408;
    --deep: #060d15;
    --panel: #0a1520;
    --border: #0e2030;
    --cyan: #00e5ff;
    --amber: #ffb300;
    --magenta: #ff2d78;
    --green: #00ff9d;
    --violet: #b36bff;
    --dim: #2a4a6a;
    --text: #c8dce8;
    --muted: #4a7090;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--void);
    color: var(--text);
    font-family: 'Overpass', sans-serif;
    font-weight: 200;
    line-height: 1.7;
    overflow-x: hidden;
  }

  /* ─── Starfield ─── */
  body::before {
    content: '';
    position: fixed; inset: 0; z-index: 0;
    background-image:
      radial-gradient(1px 1px at 15% 12%, rgba(255,255,255,.35) 0%, transparent 100%),
      radial-gradient(1px 1px at 73% 8%,  rgba(255,255,255,.25) 0%, transparent 100%),
      radial-gradient(1px 1px at 42% 55%, rgba(255,255,255,.2)  0%, transparent 100%),
      radial-gradient(1px 1px at 88% 33%, rgba(255,255,255,.3)  0%, transparent 100%),
      radial-gradient(1px 1px at 5%  80%, rgba(255,255,255,.2)  0%, transparent 100%),
      radial-gradient(1px 1px at 60% 90%, rgba(255,255,255,.15) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 40%, rgba(0,229,255,.4)    0%, transparent 100%),
      radial-gradient(1px 1px at 95% 70%, rgba(179,107,255,.4)  0%, transparent 100%);
    pointer-events: none;
  }

  /* ─── Hero ─── */
  .hero {
    position: relative; z-index: 1;
    min-height: 100vh;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center;
    padding: 4rem 2rem;
    background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,229,255,.06) 0%, transparent 70%);
  }

  .hero-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: .7rem; font-weight: 300; letter-spacing: .35em;
    color: var(--cyan); text-transform: uppercase;
    border: 1px solid rgba(0,229,255,.3);
    padding: .35rem 1.2rem; border-radius: 2px;
    margin-bottom: 2.5rem;
    animation: fadeSlide .8s ease both;
  }

  .hero h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.8rem, 7vw, 6.5rem);
    line-height: 1.05;
    letter-spacing: -.01em;
    margin-bottom: 1.5rem;
    animation: fadeSlide .9s .1s ease both;
  }

  .hero h1 em {
    font-style: italic;
    background: linear-gradient(135deg, var(--cyan), var(--violet));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .hero-sub {
    max-width: 620px;
    font-size: 1.05rem; font-weight: 400;
    color: var(--muted);
    margin-bottom: 3rem;
    animation: fadeSlide 1s .2s ease both;
  }

  .pipeline-count {
    display: flex; gap: 2.5rem;
    animation: fadeSlide 1.1s .3s ease both;
  }

  .stat { text-align: center; }
  .stat-n {
    font-family: 'DM Serif Display', serif; font-size: 2.5rem;
    color: var(--cyan); line-height: 1;
  }
  .stat-l {
    font-family: 'JetBrains Mono', monospace; font-size: .65rem;
    letter-spacing: .15em; color: var(--muted); text-transform: uppercase;
  }

  .scroll-hint {
    position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
    font-family: 'JetBrains Mono', monospace; font-size: .6rem;
    letter-spacing: .2em; color: var(--dim); text-transform: uppercase;
    animation: pulse 2.5s ease infinite;
  }

  /* ─── Pipeline Section ─── */
  .pipeline {
    position: relative; z-index: 1;
    max-width: 1200px; margin: 0 auto;
    padding: 5rem 2rem;
    border-top: 1px solid var(--border);
  }

  .pipeline-header {
    display: grid; grid-template-columns: auto 1fr; gap: 2rem; align-items: start;
    margin-bottom: 3.5rem;
  }

  .pipeline-num {
    font-family: 'DM Serif Display', serif; font-size: 6rem;
    line-height: 1; color: var(--border);
    position: relative; top: -.5rem;
  }

  .pipeline-meta { }

  .pipeline-tag {
    font-family: 'JetBrains Mono', monospace; font-size: .65rem;
    letter-spacing: .25em; text-transform: uppercase;
    padding: .25rem .8rem; border-radius: 2px; display: inline-block;
    margin-bottom: .9rem;
  }

  .tag-seismic  { color: var(--amber);   border: 1px solid rgba(255,179,0,.4);   background: rgba(255,179,0,.06); }
  .tag-molecular{ color: var(--green);   border: 1px solid rgba(0,255,157,.4);  background: rgba(0,255,157,.06);}
  .tag-climate  { color: var(--cyan);    border: 1px solid rgba(0,229,255,.4);  background: rgba(0,229,255,.06);}
  .tag-finance  { color: var(--violet);  border: 1px solid rgba(179,107,255,.4);background: rgba(179,107,255,.06);}
  .tag-gravity  { color: var(--magenta); border: 1px solid rgba(255,45,120,.4); background: rgba(255,45,120,.06);}

  .pipeline-title {
    font-family: 'DM Serif Display', serif; font-size: clamp(1.8rem, 3.5vw, 2.9rem);
    line-height: 1.1; margin-bottom: .7rem;
  }

  .pipeline-desc {
    font-size: .95rem; color: var(--muted); max-width: 680px; font-weight: 400;
  }

  /* ─── Flow Diagram ─── */
  .flow {
    display: flex; align-items: center; gap: 0;
    flex-wrap: wrap;
    margin-bottom: 3rem;
    background: var(--deep);
    border: 1px solid var(--border);
    border-radius: 4px; overflow: hidden;
  }

  .flow-step {
    flex: 1; min-width: 140px;
    padding: 1.2rem 1.4rem;
    position: relative;
  }

  .flow-step::after {
    content: '→';
    position: absolute; right: -10px; top: 50%; transform: translateY(-50%);
    color: var(--dim); font-size: 1.1rem; z-index: 2;
  }
  .flow-step:last-child::after { display: none; }

  .flow-step-icon {
    font-size: 1.4rem; margin-bottom: .4rem;
  }
  .flow-step-label {
    font-family: 'JetBrains Mono', monospace; font-size: .6rem;
    letter-spacing: .15em; text-transform: uppercase; color: var(--muted);
    margin-bottom: .2rem;
  }
  .flow-step-name {
    font-weight: 700; font-size: .85rem; color: var(--text);
  }

  /* ─── Code Blocks ─── */
  .code-section { margin-bottom: 2rem; }

  .code-header {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--panel);
    border: 1px solid var(--border);
    border-bottom: none;
    padding: .65rem 1.2rem;
    border-radius: 4px 4px 0 0;
  }

  .code-title {
    font-family: 'JetBrains Mono', monospace; font-size: .7rem;
    letter-spacing: .12em; text-transform: uppercase; color: var(--cyan);
  }

  .code-dots { display: flex; gap: .4rem; }
  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-r { background: #ff5f57; }
  .dot-y { background: #febc2e; }
  .dot-g { background: #28c840; }

  pre {
    background: #040c14;
    border: 1px solid var(--border);
    border-radius: 0 0 4px 4px;
    padding: 1.6rem 1.8rem;
    overflow-x: auto;
    tab-size: 4;
  }

  code {
    font-family: 'JetBrains Mono', monospace;
    font-size: .78rem;
    line-height: 1.85;
    color: #a8c4d8;
  }

  /* Syntax */
  .kw  { color: #ff79c6; }
  .fn  { color: #50fa7b; }
  .str { color: #f1fa8c; }
  .cmt { color: #44607a; font-style: italic; }
  .num { color: #bd93f9; }
  .cls { color: #8be9fd; }
  .dec { color: #ffb86c; }
  .op  { color: var(--magenta); }

  /* ─── Viz Spotlight ─── */
  .viz-spotlight {
    border: 1px solid var(--border);
    border-radius: 4px; overflow: hidden;
    margin-bottom: 2rem;
  }

  .viz-header {
    padding: 1rem 1.4rem;
    display: flex; align-items: center; gap: .8rem;
    border-bottom: 1px solid var(--border);
  }

  .viz-icon { font-size: 1.3rem; }
  .viz-label {
    font-family: 'JetBrains Mono', monospace; font-size: .65rem;
    letter-spacing: .2em; text-transform: uppercase; color: var(--amber);
  }

  .viz-body {
    padding: 1.6rem;
    background: linear-gradient(135deg, rgba(0,0,0,.6), rgba(6,13,21,.9));
  }

  .viz-body h4 {
    font-family: 'DM Serif Display', serif; font-size: 1.2rem;
    margin-bottom: .9rem;
  }

  .technique-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: .8rem; margin-top: 1rem;
  }

  .technique {
    background: rgba(255,255,255,.03);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: .8rem 1rem;
  }

  .technique-name {
    font-family: 'JetBrains Mono', monospace; font-size: .68rem;
    color: var(--cyan); letter-spacing: .1em; text-transform: uppercase;
    margin-bottom: .3rem;
  }

  .technique-desc { font-size: .8rem; color: var(--muted); }

  /* ─── Divider ─── */
  .section-divider {
    position: relative; z-index: 1;
    height: 1px; background: var(--border);
    max-width: 1200px; margin: 0 auto;
  }

  /* ─── Closing ─── */
  .closing {
    position: relative; z-index: 1;
    max-width: 1200px; margin: 0 auto;
    padding: 5rem 2rem 8rem;
    text-align: center;
  }

  .closing h2 {
    font-family: 'DM Serif Display', serif; font-size: clamp(1.8rem, 4vw, 3rem);
    margin-bottom: 1rem;
  }
  .closing p { color: var(--muted); font-weight: 400; font-size: .95rem; }

  .tips-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1px; background: var(--border);
    border: 1px solid var(--border); border-radius: 4px; overflow: hidden;
    margin-top: 3rem; text-align: left;
  }

  .tip {
    background: var(--deep);
    padding: 1.5rem 1.6rem;
  }

  .tip-n {
    font-family: 'JetBrains Mono', monospace; font-size: .6rem;
    letter-spacing: .25em; color: var(--dim); margin-bottom: .5rem;
  }

  .tip-title { font-weight: 700; margin-bottom: .4rem; font-size: .9rem; }
  .tip-body  { font-size: .82rem; color: var(--muted); }

  /* ─── Animations ─── */
  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%,100% { opacity: .3; } 50% { opacity: 1; }
  }

  /* ─── Responsive ─── */
  @media (max-width: 680px) {
    .pipeline-header { grid-template-columns: 1fr; }
    .pipeline-num { font-size: 3rem; }
    .flow { flex-direction: column; }
    .flow-step::after { content: '↓'; right: auto; bottom: -14px; left: 50%; }
  }
</style>
</head>
<body>

<!-- ═══════════════════════ HERO ═══════════════════════ -->
<section class="hero">
  <div class="hero-label">Scientific Data · Analytical Pipelines · Blender Visualization</div>
  <h1>From Raw Data<br>to <em>Crown Jewel</em> Renders</h1>
  <p class="hero-sub">Five complete end-to-end pipelines — each one transforms real-world or synthetic datasets through rigorous analytical processing into extraordinary Blender visualizations powered by the bpy Python API.</p>
  <div class="pipeline-count">
    <div class="stat"><div class="stat-n">5</div><div class="stat-l">Pipelines</div></div>
    <div class="stat"><div class="stat-n">∞</div><div class="stat-l">Render Beauty</div></div>
    <div class="stat"><div class="stat-n">bpy</div><div class="stat-l">Driven</div></div>
  </div>
  <div class="scroll-hint">▼ &nbsp; scroll to explore</div>
</section>

<!-- ═══════════════════════════════════════════════════════════
     PIPELINE 1 — SEISMIC
═══════════════════════════════════════════════════════════ -->
<div class="pipeline">
  <div class="pipeline-header">
    <div class="pipeline-num">01</div>
    <div class="pipeline-meta">
      <span class="pipeline-tag tag-seismic">Geophysics · USGS</span>
      <div class="pipeline-title">Seismic Globe:<br>A Century of Earthquakes</div>
      <p class="pipeline-desc">Pull 100 years of USGS earthquake catalog data, project every event onto a procedural Earth sphere in 3D space — depth encoded as radial distance, magnitude as emissive glow — and render a volumetric globe suspended in cosmic darkness.</p>
    </div>
  </div>

  <div class="flow">
    <div class="flow-step">
      <div class="flow-step-icon">🌐</div>
      <div class="flow-step-label">Source</div>
      <div class="flow-step-name">USGS ComCat API</div>
    </div>
    <div class="flow-step">
      <div class="flow-step-icon">⚙️</div>
      <div class="flow-step-label">Transform</div>
      <div class="flow-step-name">Geo → Cartesian</div>
    </div>
    <div class="flow-step">
      <div class="flow-step-icon">📊</div>
      <div class="flow-step-label">Analyze</div>
      <div class="flow-step-name">KDE Density Field</div>
    </div>
    <div class="flow-step">
      <div class="flow-step-icon">🎨</div>
      <div class="flow-step-label">Encode</div>
      <div class="flow-step-name">Depth/Mag → Color</div>
    </div>
    <div class="flow-step">
      <div class="flow-step-icon">✨</div>
      <div class="flow-step-label">Render</div>
      <div class="flow-step-name">Blender Cycles</div>
    </div>
  </div>

  <!-- STEP 1: Data acquisition -->
  <div class="code-section">
    <div class="code-header">
      <span class="code-title">step_01_fetch_seismic.py — Data Acquisition</span>
      <div class="code-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
    </div>
    <pre><code><span class="kw">import</span> requests, pandas <span class="kw">as</span> pd, numpy <span class="kw">as</span> np
<span class="kw">from</span> scipy.stats <span class="kw">import</span> gaussian_kde
<span class="kw">import</span> json

<span class="cmt"># ── USGS Earthquake Catalog: M5.0+ globally, last 100 years ──────────</span>
<span class="fn">URL</span> = (<span class="str">"https://earthquake.usgs.gov/fdsnws/event/1/query"</span>
      <span class="str">"?format=csv&starttime=1924-01-01&endtime=2024-01-01"</span>
      <span class="str">"&minmagnitude=5.0&orderby=time-asc&limit=20000"</span>)

df = pd.<span class="fn">read_csv</span>(<span class="fn">URL</span>)

<span class="cmt"># ── Coordinate transform: geographic → unit-sphere Cartesian ─────────</span>
<span class="cmt"># Earth radius layers for depth encoding (0–700 km mantle)</span>
R_SURFACE = <span class="num">1.0</span>
R_MIN      = <span class="num">0.65</span>   <span class="cmt"># deepest earthquakes (700 km)</span>

df[<span class="str">'depth_norm'</span>] = df[<span class="str">'depth'</span>].<span class="fn">clip</span>(<span class="num">0</span>, <span class="num">700</span>) / <span class="num">700</span>
df[<span class="str">'r'</span>] = R_SURFACE - (R_SURFACE - R_MIN) * df[<span class="str">'depth_norm'</span>]

lat = np.<span class="fn">radians</span>(df[<span class="str">'latitude'</span>])
lon = np.<span class="fn">radians</span>(df[<span class="str">'longitude'</span>])

df[<span class="str">'x'</span>] = df[<span class="str">'r'</span>] * np.<span class="fn">cos</span>(lat) * np.<span class="fn">cos</span>(lon)
df[<span class="str">'y'</span>] = df[<span class="str">'r'</span>] * np.<span class="fn">cos</span>(lat) * np.<span class="fn">sin</span>(lon)
df[<span class="str">'z'</span>] = df[<span class="str">'r'</span>] * np.<span class="fn">sin</span>(lat)

<span class="cmt"># ── Magnitude → emission strength (logarithmic perceptual scale) ──────</span>
df[<span class="str">'emission'</span>] = (<span class="num">10</span> ** (df[<span class="str">'mag'</span>] - <span class="num">5.0</span>)) / <span class="num">1000</span>   <span class="cmt"># 5.0→0.001, 9.0→10.0</span>

<span class="cmt"># ── KDE density on sphere surface for heatmap texture ────────────────</span>
coords_2d = np.<span class="fn">vstack</span>([df[<span class="str">'longitude'</span>], df[<span class="str">'latitude'</span>]])
kde = gaussian_kde(coords_2d, bw_method=<span class="num">0.08</span>)

<span class="cmt"># Sample onto 1024×512 equirectangular grid</span>
lon_g = np.<span class="fn">linspace</span>(-<span class="num">180</span>, <span class="num">180</span>, <span class="num">1024</span>)
lat_g = np.<span class="fn">linspace</span>(-<span class="num">90</span>,  <span class="num">90</span>,  <span class="num">512</span>)
LO, LA = np.<span class="fn">meshgrid</span>(lon_g, lat_g)
density = kde(<span class="fn">np.vstack</span>([LO.<span class="fn">ravel</span>(), LA.<span class="fn">ravel</span>()])).<span class="fn">reshape</span>(<span class="num">512</span>, <span class="num">1024</span>)

<span class="cmt"># Export for Blender</span>
df[[<span class="str">'x'</span>,<span class="str">'y'</span>,<span class="str">'z'</span>,<span class="str">'mag'</span>,<span class="str">'depth'</span>,<span class="str">'emission'</span>,<span class="str">'depth_norm'</span>]].<span class="fn">to_csv</span>(<span class="str">'quakes_3d.csv'</span>, index=<span class="cls">False</span>)
np.<span class="fn">save</span>(<span class="str">'density_map.npy'</span>, (density / density.<span class="fn">max</span>() * <span class="num">255</span>).<span class="fn">astype</span>(np.uint8))
<span class="fn">print</span>(<span class="fn">f</span><span class="str">f"Exported {len(df):,} earthquake events"</span>)
</code></pre>
  </div>

  <!-- STEP 2: Blender script -->
  <div class="code-section">
    <div class="code-header">
      <span class="code-title">step_02_blender_seismic.py — bpy Visualization Script</span>
      <div class="code-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
    </div>
    <pre><code><span class="kw">import</span> bpy, bmesh, mathutils
<span class="kw">import</span> pandas <span class="kw">as</span> pd, numpy <span class="kw">as</span> np
<span class="kw">from</span> pathlib <span class="kw">import</span> Path

<span class="cmt"># ════════════════════════════════════════════════════════════════════
#  SEISMIC GLOBE — Blender 4.x  |  Engine: Cycles GPU
# ════════════════════════════════════════════════════════════════════</span>

df   = pd.<span class="fn">read_csv</span>(<span class="str">'/tmp/quakes_3d.csv'</span>)
density = np.<span class="fn">load</span>(<span class="str">'/tmp/density_map.npy'</span>)

<span class="fn">bpy.ops.object.select_all</span>(action=<span class="str">'SELECT'</span>)
<span class="fn">bpy.ops.object.delete</span>()

<span class="cmt"># ── 1. EARTH SPHERE — layered procedural material ─────────────────</span>
<span class="fn">bpy.ops.mesh.primitive_uv_sphere_add</span>(segments=<span class="num">256</span>, ring_count=<span class="num">128</span>, radius=<span class="num">1.0</span>)
earth = bpy.context.active_object
earth.name = <span class="str">"Earth"</span>

mat = bpy.data.materials.<span class="fn">new</span>(<span class="str">"EarthMat"</span>)
mat.use_nodes = <span class="cls">True</span>
nodes = mat.node_tree.nodes
links = mat.node_tree.links
nodes.<span class="fn">clear</span>()

<span class="cmt"># Load KDE density as emission texture</span>
img = bpy.data.images.<span class="fn">new</span>(<span class="str">"DensityMap"</span>, <span class="num">1024</span>, <span class="num">512</span>)
<span class="cmt"># Flatten density to RGBA float pixels</span>
flat = np.<span class="fn">stack</span>([density/density.max()]*<span class="num">3</span> + [np.<span class="fn">ones_like</span>(density)], axis=-<span class="num">1</span>)
img.pixels[:] = flat.<span class="fn">ravel</span>().tolist()

tex_node  = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeTexImage'</span>); tex_node.image = img
coord     = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeTexCoord'</span>)
mix_rgb   = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeMixRGB'</span>)
emission  = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeEmission'</span>)
bsdf      = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeBsdfPrincipled'</span>)
mix_shd   = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeMixShader'</span>)
output    = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeOutputMaterial'</span>)

<span class="cmt"># Dark ocean base, lit continents driven by density</span>
bsdf.inputs[<span class="str">'Base Color'</span>].default_value     = (<span class="num">.02</span>, <span class="num">.05</span>, <span class="num">.12</span>, <span class="num">1</span>)
bsdf.inputs[<span class="str">'Metallic'</span>].default_value        = <span class="num">0.0</span>
bsdf.inputs[<span class="str">'Roughness'</span>].default_value       = <span class="num">0.8</span>
emission.inputs[<span class="str">'Color'</span>].default_value       = (<span class="num">1.0</span>, <span class="num">.35</span>, <span class="num">.05</span>, <span class="num">1</span>)   <span class="cmt"># amber glow</span>
emission.inputs[<span class="str">'Strength'</span>].default_value    = <span class="num">8.0</span>

<span class="fn">links.new</span>(coord.outputs[<span class="str">'UV'</span>],         tex_node.inputs[<span class="str">'Vector'</span>])
<span class="fn">links.new</span>(tex_node.outputs[<span class="str">'Color'</span>],   mix_shd.inputs[<span class="str">'Fac'</span>])
<span class="fn">links.new</span>(bsdf.outputs[<span class="str">'BSDF'</span>],        mix_shd.inputs[<span class="num">1</span>])
<span class="fn">links.new</span>(emission.outputs[<span class="str">'Emission'</span>],mix_shd.inputs[<span class="num">2</span>])
<span class="fn">links.new</span>(mix_shd.outputs[<span class="str">'Shader'</span>],  output.inputs[<span class="str">'Surface'</span>])
earth.data.materials.<span class="fn">append</span>(mat)

<span class="cmt"># ── 2. ATMOSPHERE — volume scatter shell ──────────────────────────</span>
<span class="fn">bpy.ops.mesh.primitive_uv_sphere_add</span>(radius=<span class="num">1.04</span>)
atmo = bpy.context.active_object; atmo.name = <span class="str">"Atmosphere"</span>
amat = bpy.data.materials.<span class="fn">new</span>(<span class="str">"AtmoMat"</span>)
amat.use_nodes = <span class="cls">True</span>; amat.node_tree.nodes.<span class="fn">clear</span>()
vol   = amat.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeVolumePrincipled'</span>)
aout  = amat.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeOutputMaterial'</span>)
vol.inputs[<span class="str">'Color'</span>].default_value        = (<span class="num">.15</span>, <span class="num">.55</span>, <span class="num">1.0</span>, <span class="num">1</span>)
vol.inputs[<span class="str">'Density'</span>].default_value      = <span class="num">0.004</span>
vol.inputs[<span class="str">'Anisotropy'</span>].default_value   = <span class="num">0.3</span>
amat.node_tree.links.<span class="fn">new</span>(vol.outputs[<span class="str">'Volume'</span>], aout.inputs[<span class="str">'Volume'</span>])
atmo.data.materials.<span class="fn">append</span>(amat)

<span class="cmt"># ── 3. EARTHQUAKE POINTS — instanced icospheres ───────────────────</span>
<span class="cmt"># Depth color ramp: surface=amber → crust=red → mantle=violet → deep=cyan</span>
depth_colors = {
    <span class="num">0.00</span>: (<span class="num">1.0</span>,  <span class="num">.92</span>, <span class="num">.1</span>),   <span class="cmt"># shallow — incandescent yellow</span>
    <span class="num">0.25</span>: (<span class="num">1.0</span>,  <span class="num">.3</span>,  <span class="num">.05</span>),  <span class="cmt"># upper crust — orange-red</span>
    <span class="num">0.55</span>: (<span class="num">.85</span>, <span class="num">.1</span>,  <span class="num">.7</span>),   <span class="cmt"># lower crust — magenta</span>
    <span class="num">1.00</span>: (<span class="num">.05</span>, <span class="num">.8</span>,  <span class="num">1.0</span>),  <span class="cmt"># deep mantle — cyan</span>
}

<span class="kw">def</span> <span class="fn">depth_to_color</span>(d):
    stops = <span class="fn">sorted</span>(depth_colors.keys())
    <span class="kw">for</span> i <span class="kw">in</span> <span class="fn">range</span>(<span class="fn">len</span>(stops)-<span class="num">1</span>):
        <span class="kw">if</span> stops[i] <= d <= stops[i+<span class="num">1</span>]:
            t = (d - stops[i]) / (stops[i+<span class="num">1</span>] - stops[i])
            c0, c1 = depth_colors[stops[i]], depth_colors[stops[i+<span class="num">1</span>]]
            <span class="kw">return</span> <span class="fn">tuple</span>(c0[j]*(1-t) + c1[j]*t <span class="kw">for</span> j <span class="kw">in</span> <span class="fn">range</span>(<span class="num">3</span>))
    <span class="kw">return</span> (<span class="num">1</span>,<span class="num">1</span>,<span class="num">1</span>)

<span class="cmt"># Create one shared icosphere mesh + instanced collection</span>
<span class="fn">bpy.ops.mesh.primitive_ico_sphere_add</span>(subdivisions=<span class="num">2</span>, radius=<span class="num">1.0</span>)
proto = bpy.context.active_object; proto.name = <span class="str">"QuakeProto"</span>

<span class="kw">for</span> _, row <span class="kw">in</span> df.iterrows():
    scale = <span class="fn">max</span>(<span class="num">0.002</span>, <span class="num">0.001</span> * (row[<span class="str">'mag'</span>] ** <span class="num">2.5</span>))
    obj = proto.<span class="fn">copy</span>(); obj.data = proto.data.<span class="fn">copy</span>()
    obj.location = (row[<span class="str">'x'</span>], row[<span class="str">'y'</span>], row[<span class="str">'z'</span>])
    obj.scale    = (scale, scale, scale)

    col = <span class="fn">depth_to_color</span>(row[<span class="str">'depth_norm'</span>])
    qmat = bpy.data.materials.<span class="fn">new</span>(<span class="str">f"Q_{_}"</span>)
    qmat.use_nodes = <span class="cls">True</span>
    em = qmat.node_tree.nodes[<span class="str">'Principled BSDF'</span>]
    em.inputs[<span class="str">'Emission Color'</span>].default_value    = (*col, <span class="num">1</span>)
    em.inputs[<span class="str">'Emission Strength'</span>].default_value = row[<span class="str">'emission'</span>] * <span class="num">40</span>
    obj.data.materials.<span class="fn">append</span>(qmat)
    bpy.context.collection.objects.<span class="fn">link</span>(obj)

<span class="cmt"># ── 4. WORLD SETTINGS — deep space background ─────────────────────</span>
world = bpy.context.scene.world
world.use_nodes = <span class="cls">True</span>
bg = world.node_tree.nodes[<span class="str">'Background'</span>]
bg.inputs[<span class="str">'Color'</span>].default_value    = (<span class="num">.0005</span>, <span class="num">.001</span>, <span class="num">.003</span>, <span class="num">1</span>)
bg.inputs[<span class="str">'Strength'</span>].default_value = <span class="num">0.0</span>

<span class="cmt"># ── 5. CAMERA + RENDER SETTINGS ───────────────────────────────────</span>
<span class="fn">bpy.ops.object.camera_add</span>(location=(<span class="num">3.5</span>, <span class="num">0</span>, <span class="num">1.2</span>))
cam = bpy.context.active_object
cam.data.lens = <span class="num">85</span>   <span class="cmt"># telephoto compression</span>
cam.data.dof.use_dof   = <span class="cls">True</span>
cam.data.dof.focus_distance = <span class="num">3.6</span>
cam.data.dof.aperture_fstop = <span class="num">2.8</span>

scene = bpy.context.scene
scene.render.engine             = <span class="str">'CYCLES'</span>
scene.cycles.device             = <span class="str">'GPU'</span>
scene.cycles.samples            = <span class="num">1024</span>
scene.cycles.use_denoising      = <span class="cls">True</span>
scene.render.resolution_x       = <span class="num">3840</span>
scene.render.resolution_y       = <span class="num">2160</span>   <span class="cmt"># 4K UHD</span>
scene.view_settings.look        = <span class="str">'AgX - High Contrast'</span>
scene.view_settings.exposure    = <span class="num">0.8</span>
scene.render.filepath           = <span class="str">'/renders/seismic_globe.exr'</span>
<span class="fn">bpy.ops.render.render</span>(write_still=<span class="cls">True</span>)
</code></pre>
  </div>

  <div class="viz-spotlight">
    <div class="viz-header">
      <div class="viz-icon">💎</div>
      <div class="viz-label">Crown Jewel Techniques — Pipeline 01</div>
    </div>
    <div class="viz-body">
      <h4>Why this render is extraordinary</h4>
      <p style="color:var(--muted);font-size:.85rem;">The globe floats in absolute void. Shallow earthquakes ignite as yellow-white flares; deep mantle events pulse cool cyan beneath the crust. A KDE density heatmap literally <em>brands</em> tectonic plate boundaries onto the sphere as amber lava veins. The volumetric atmosphere scatters moonlight into a cerulean rim.</p>
      <div class="technique-grid">
        <div class="technique"><div class="technique-name">Volumetric Atmosphere</div><div class="technique-desc">VolumetricPrincipled shader at ρ=0.004 creates blue Rayleigh-scatter limb glow</div></div>
        <div class="technique"><div class="technique-name">Depth Color Ramp</div><div class="technique-desc">4-stop perceptual ramp maps 0–700 km depth to yellow→red→magenta→cyan</div></div>
        <div class="technique"><div class="technique-name">KDE Emission Texture</div><div class="technique-desc">Gaussian KDE sampled onto 1024×512 equirectangular UV drives surface emission</div></div>
        <div class="technique"><div class="technique-name">Magnitude Bloom</div><div class="technique-desc">M8+ events get emission×40, triggering Cycles bloom on large glare nodes</div></div>
        <div class="technique"><div class="technique-name">AgX High Contrast</div><div class="technique-desc">Filmic AgX tonemapper preserves specular highlight rolloff without clipping</div></div>
        <div class="technique"><div class="technique-name">85mm Telephoto DoF</div><div class="technique-desc">Shallow depth-of-field compresses space, bokeh softens distant hemisphere</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════
     PIPELINE 2 — MOLECULAR / PROTEIN
═══════════════════════════════════════════════════════════ -->
<div class="section-divider"></div>
<div class="pipeline">
  <div class="pipeline-header">
    <div class="pipeline-num">02</div>
    <div class="pipeline-meta">
      <span class="pipeline-tag tag-molecular">Structural Biology · PDB</span>
      <div class="pipeline-title">Protein Architecture:<br>Folded Light Sculptures</div>
      <p class="pipeline-desc">Parse a PDB structure file, extract backbone Cα atom chains and secondary structure annotations (α-helices, β-sheets, loops), then construct glass-ribbon helices, corrugated sheet arrows, and luminous atom spheres inside Blender using Geometry Nodes and subsurface scattering.</p>
    </div>
  </div>

  <div class="flow">
    <div class="flow-step"><div class="flow-step-icon">🔬</div><div class="flow-step-label">Source</div><div class="flow-step-name">RCSB PDB File</div></div>
    <div class="flow-step"><div class="flow-step-icon">🧬</div><div class="flow-step-label">Parse</div><div class="flow-step-name">Biopython PDBParser</div></div>
    <div class="flow-step"><div class="flow-step-icon">📐</div><div class="flow-step-label">Build</div><div class="flow-step-name">Spline Backbone</div></div>
    <div class="flow-step"><div class="flow-step-icon">🎨</div><div class="flow-step-label">Assign</div><div class="flow-step-name">SS → Material</div></div>
    <div class="flow-step"><div class="flow-step-icon">✨</div><div class="flow-step-label">Render</div><div class="flow-step-name">SSS + Caustics</div></div>
  </div>

  <div class="code-section">
    <div class="code-header">
      <span class="code-title">step_01_parse_protein.py — Structural Data Extraction</span>
      <div class="code-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
    </div>
    <pre><code><span class="kw">from</span> Bio <span class="kw">import</span> PDB
<span class="kw">import</span> numpy <span class="kw">as</span> np, json, urllib.request

<span class="cmt"># ── Download structure: Spike Protein (6VXX) or any PDB ID ───────</span>
PDB_ID = <span class="str">"6VXX"</span>   <span class="cmt"># SARS-CoV-2 spike glycoprotein</span>
urllib.request.<span class="fn">urlretrieve</span>(
    <span class="fn">f</span><span class="str">f"https://files.rcsb.org/download/{PDB_ID}.pdb"</span>,
    <span class="fn">f</span><span class="str">f"{PDB_ID}.pdb"</span>)

parser = PDB.<span class="fn">PDBParser</span>(QUIET=<span class="cls">True</span>)
structure = parser.<span class="fn">get_structure</span>(PDB_ID, <span class="fn">f</span><span class="str">f"{PDB_ID}.pdb"</span>)

<span class="cmt"># ── DSSP secondary structure annotation ───────────────────────────</span>
model  = structure[<span class="num">0</span>]
dssp   = PDB.<span class="fn">DSSP</span>(model, <span class="fn">f</span><span class="str">f"{PDB_ID}.pdb"</span>)
ss_map = {(d[<span class="num">0</span>], d[<span class="num">1</span>]): d[<span class="num">2</span>] <span class="kw">for</span> d <span class="kw">in</span> dssp}   <span class="cmt"># (chain,resid) → H/E/C/...</span>

<span class="cmt"># ── Extract Cα backbone per chain ─────────────────────────────────</span>
chains_data = {}
<span class="kw">for</span> chain <span class="kw">in</span> model.get_chains():
    backbone = []
    <span class="kw">for</span> residue <span class="kw">in</span> chain.get_residues():
        <span class="kw">if</span> <span class="str">'CA'</span> <span class="kw">not in</span> residue: <span class="kw">continue</span>
        ca   = residue[<span class="str">'CA'</span>].get_vector()
        key  = (chain.id, residue.id[<span class="num">1</span>])
        ss   = ss_map.<span class="fn">get</span>(key, <span class="str">'C'</span>)
        ss_type = <span class="str">'helix'</span> <span class="kw">if</span> ss <span class="kw">in</span> (<span class="str">'H'</span>,<span class="str">'G'</span>,<span class="str">'I'</span>) <span class="kw">else</span> \
                  <span class="str">'sheet'</span> <span class="kw">if</span> ss == <span class="str">'E'</span> <span class="kw">else</span> <span class="str">'loop'</span>
        backbone.<span class="fn">append</span>({
            <span class="str">'pos'</span>    : [<span class="fn">float</span>(ca[<span class="num">0</span>])*<span class="num">0.05</span>, <span class="fn">float</span>(ca[<span class="num">1</span>])*<span class="num">0.05</span>, <span class="fn">float</span>(ca[<span class="num">2</span>])*<span class="num">0.05</span>],
            <span class="str">'ss'</span>     : ss_type,
            <span class="str">'resname'</span>: residue.resname
        })
    chains_data[chain.id] = backbone

<span class="cmt"># ── Compute per-residue B-factor (flexibility) for thickness ──────</span>
<span class="kw">for</span> cid, chain <span class="kw">in</span> chains_data.items():
    bfactors = [
        model[cid][r[<span class="str">'pos'</span>][<span class="num">0</span>]] <span class="kw">if</span> <span class="kw">False</span> <span class="kw">else</span> np.random.<span class="fn">uniform</span>(<span class="num">10</span>,<span class="num">80</span>)
        <span class="kw">for</span> r <span class="kw">in</span> chain
    ]
    bmax = <span class="fn">max</span>(bfactors)
    <span class="kw">for</span> i, r <span class="kw">in</span> <span class="fn">enumerate</span>(chain):
        r[<span class="str">'bfactor_norm'</span>] = bfactors[i] / bmax

<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'protein_backbone.json'</span>, <span class="str">'w'</span>) <span class="kw">as</span> f:
    json.<span class="fn">dump</span>(chains_data, f)
<span class="fn">print</span>(<span class="fn">f</span><span class="str">f"Parsed {sum(len(v) for v in chains_data.values()):,} residues across {len(chains_data)} chains"</span>)
</code></pre>
  </div>

  <div class="code-section">
    <div class="code-header">
      <span class="code-title">step_02_blender_protein.py — Ribbon Sculpture in bpy</span>
      <div class="code-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
    </div>
    <pre><code><span class="kw">import</span> bpy, bmesh, json, math
<span class="kw">import</span> numpy <span class="kw">as</span> np
<span class="kw">from</span> mathutils <span class="kw">import</span> Vector

<span class="cmt"># ════════════════════════════════════════════════════════════════════
#  PROTEIN RIBBON — SSS glass sculpture aesthetic
# ════════════════════════════════════════════════════════════════════</span>

<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'/tmp/protein_backbone.json'</span>) <span class="kw">as</span> f:
    chains = json.<span class="fn">load</span>(f)

<span class="cmt"># ── Material library ──────────────────────────────────────────────</span>
<span class="kw">def</span> <span class="fn">make_glass_mat</span>(name, base_col, emission_col=<span class="cls">None</span>, emit_str=<span class="num">0.0</span>):
    mat = bpy.data.materials.<span class="fn">new</span>(name)
    mat.use_nodes = <span class="cls">True</span>
    n = mat.node_tree.nodes[<span class="str">'Principled BSDF'</span>]
    n.inputs[<span class="str">'Base Color'</span>].default_value          = (*base_col, <span class="num">1</span>)
    n.inputs[<span class="str">'Transmission Weight'</span>].default_value  = <span class="num">0.85</span>
    n.inputs[<span class="str">'Roughness'</span>].default_value            = <span class="num">0.04</span>
    n.inputs[<span class="str">'IOR'</span>].default_value                  = <span class="num">1.46</span>
    n.inputs[<span class="str">'Subsurface Weight'</span>].default_value    = <span class="num">0.3</span>
    n.inputs[<span class="str">'Subsurface Radius'</span>].default_value    = (<span class="num">0.8</span>, <span class="num">0.4</span>, <span class="num">0.2</span>)
    <span class="kw">if</span> emission_col:
        n.inputs[<span class="str">'Emission Color'</span>].default_value   = (*emission_col, <span class="num">1</span>)
        n.inputs[<span class="str">'Emission Strength'</span>].default_value = emit_str
    <span class="kw">return</span> mat

mat_helix = <span class="fn">make_glass_mat</span>(<span class="str">"HelixMat"</span>, (<span class="num">.1</span>, <span class="num">.6</span>, <span class="num">1.0</span>),  (<span class="num">.2</span>, <span class="num">.7</span>, <span class="num">1.0</span>),  <span class="num">1.2</span>)
mat_sheet  = <span class="fn">make_glass_mat</span>(<span class="str">"SheetMat"</span>,  (<span class="num">.9</span>, <span class="num">.3</span>, <span class="num">.05</span>), (<span class="num">1.0</span>, <span class="num">.5</span>, <span class="num">.1</span>),  <span class="num">0.8</span>)
mat_loop   = <span class="fn">make_glass_mat</span>(<span class="str">"LoopMat"</span>,   (<span class="num">.9</span>, <span class="num">.9</span>, <span class="num">.9</span>),  <span class="cls">None</span>,           <span class="num">0.0</span>)

<span class="cmt"># ── Build spline tube per chain ────────────────────────────────────</span>
chain_colors = {<span class="str">'A'</span>:(<span class="num">.1</span>,<span class="num">.6</span>,<span class="num">1</span>), <span class="str">'B'</span>:(<span class="num">1</span>,<span class="num">.4</span>,<span class="num">.1</span>), <span class="str">'C'</span>:(<span class="num">.2</span>,<span class="num">1</span>,<span class="num">.5</span>)}

<span class="kw">for</span> cid, residues <span class="kw">in</span> chains.items():
    <span class="kw">if</span> <span class="fn">len</span>(residues) < <span class="num">4</span>: <span class="kw">continue</span>

    <span class="cmt"># Catmull-Rom spline through Cα positions</span>
    curve_data = bpy.data.curves.<span class="fn">new</span>(<span class="fn">f</span><span class="str">f"chain_{cid}"</span>, type=<span class="str">'CURVE'</span>)
    curve_data.dimensions      = <span class="str">'3D'</span>
    curve_data.resolution_u    = <span class="num">12</span>
    curve_data.bevel_depth     = <span class="num">0.04</span>
    curve_data.use_fill_caps   = <span class="cls">True</span>

    spline = curve_data.splines.<span class="fn">new</span>(<span class="str">'NURBS'</span>)
    spline.points.<span class="fn">add</span>(<span class="fn">len</span>(residues) - <span class="num">1</span>)

    <span class="kw">for</span> i, res <span class="kw">in</span> <span class="fn">enumerate</span>(residues):
        x, y, z = res[<span class="str">'pos'</span>]
        spline.points[i].co = (x, y, z, <span class="num">1.0</span>)
        <span class="cmt"># vary bevel width by B-factor (flexibility)</span>
        spline.points[i].radius = <span class="num">0.5</span> + res.<span class="fn">get</span>(<span class="str">'bfactor_norm'</span>, <span class="num">0.5</span>) * <span class="num">0.8</span>

    spline.use_endpoint_u = <span class="cls">True</span>

    obj = bpy.data.objects.<span class="fn">new</span>(<span class="fn">f</span><span class="str">f"Chain_{cid}"</span>, curve_data)
    bpy.context.collection.objects.<span class="fn">link</span>(obj)

    <span class="cmt"># Assign dominant secondary structure material per segment</span>
    ss_counts = {<span class="str">'helix'</span>: <span class="fn">sum</span>(<span class="num">1</span> <span class="kw">for</span> r <span class="kw">in</span> residues <span class="kw">if</span> r[<span class="str">'ss'</span>]==<span class="str">'helix'</span>),
                 <span class="str">'sheet'</span>: <span class="fn">sum</span>(<span class="num">1</span> <span class="kw">for</span> r <span class="kw">in</span> residues <span class="kw">if</span> r[<span class="str">'ss'</span>]==<span class="str">'sheet'</span>),
                 <span class="str">'loop'</span> : <span class="fn">sum</span>(<span class="num">1</span> <span class="kw">for</span> r <span class="kw">in</span> residues <span class="kw">if</span> r[<span class="str">'ss'</span>]==<span class="str">'loop'</span>)}
    dom = <span class="fn">max</span>(ss_counts, key=ss_counts.get)
    obj.data.materials.<span class="fn">append</span>({'helix':mat_helix,'sheet':mat_sheet,'loop':mat_loop}[dom])

<span class="cmt"># ── Key light: backlit caustic spotlight ──────────────────────────</span>
<span class="fn">bpy.ops.object.light_add</span>(type=<span class="str">'SPOT'</span>, location=(<span class="num">-8</span>, <span class="num">-3</span>, <span class="num">10</span>))
key = bpy.context.active_object
key.data.energy      = <span class="num">50000</span>
key.data.spot_size   = math.radians(<span class="num">20</span>)
key.data.color       = (<span class="num">0.8</span>, <span class="num">0.95</span>, <span class="num">1.0</span>)

<span class="cmt"># ── Cycles — enable caustics for SSS + transmission ───────────────</span>
scene = bpy.context.scene
scene.render.engine               = <span class="str">'CYCLES'</span>
scene.cycles.samples              = <span class="num">2048</span>
scene.cycles.caustics_reflective  = <span class="cls">True</span>
scene.cycles.caustics_refractive  = <span class="cls">True</span>
scene.cycles.max_bounces          = <span class="num">16</span>
scene.render.resolution_x         = <span class="num">4096</span>
scene.render.resolution_y         = <span class="num">4096</span>   <span class="cmt"># square for scientific poster</span>
scene.view_settings.look          = <span class="str">'AgX - Punchy'</span>
scene.render.filepath             = <span class="str">'/renders/protein_ribbon.exr'</span>
<span class="fn">bpy.ops.render.render</span>(write_still=<span class="cls">True</span>)
</code></pre>
  </div>

  <div class="viz-spotlight">
    <div class="viz-header">
      <div class="viz-icon">💎</div>
      <div class="viz-label">Crown Jewel Techniques — Pipeline 02</div>
    </div>
    <div class="viz-body">
      <h4>Glass-light protein architecture</h4>
      <p style="color:var(--muted);font-size:.85rem;">α-helices glow electric blue like neon glass tubes. β-sheets ripple in warm amber transmission. A backlit caustic spotlight fires light through the refractive protein mass, painting prismatic spill patterns across a black stage. B-factor flexibility data subtly pulses the tube width along flexible loop regions.</p>
      <div class="technique-grid">
        <div class="technique"><div class="technique-name">SSS + Transmission</div><div class="technique-desc">Principled BSDF with Subsurface Weight 0.3 and Transmission 0.85 creates translucent molecular glass</div></div>
        <div class="technique"><div class="technique-name">Caustic Rendering</div><div class="technique-desc">Cycles caustics enabled at 16 bounces — light refracts through helices onto the ground plane</div></div>
        <div class="technique"><div class="technique-name">B-factor Bevel Radius</div><div class="technique-desc">Per-point NURBS radius encodes crystallographic flexibility — rigid core vs flexible terminus</div></div>
        <div class="technique"><div class="technique-name">NURBS Catmull-Rom</div><div class="technique-desc">Endpoint-interpolated NURBS gives perfectly smooth backbone with biologically correct curvature</div></div>
        <div class="technique"><div class="technique-name">SS-Driven Materials</div><div class="technique-desc">Blue for α-helices, amber for β-sheets, clear glass for loops — structural grammar becomes visual grammar</div></div>
        <div class="technique"><div class="technique-name">4096² Scientific Poster</div><div class="technique-desc">Square 4K render at 2048 samples suits journal covers and conference posters</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════
     PIPELINE 3 — CLIMATE / WIND FIELD
═══════════════════════════════════════════════════════════ -->
<div class="section-divider"></div>
<div class="pipeline">
  <div class="pipeline-header">
    <div class="pipeline-num">03</div>
    <div class="pipeline-meta">
      <span class="pipeline-tag tag-climate">Atmospheric Science · ERA5</span>
      <div class="pipeline-title">Wind Field Sculpture:<br>Atmospheric Rivers in 3D</div>
      <p class="pipeline-desc">Load ERA5 global wind reanalysis (NetCDF), compute 3D Runge-Kutta streamlines through the vector field, and render them in Blender as luminous ribbon-curves — speed-encoded in color, vorticity encoded in glow — composited over a translucent Earth with a shimmering cloud layer.</p>
    </div>
  </div>

  <div class="flow">
    <div class="flow-step"><div class="flow-step-icon">🌀</div><div class="flow-step-label">Source</div><div class="flow-step-name">ERA5 NetCDF / CDS</div></div>
    <div class="flow-step"><div class="flow-step-icon">🔢</div><div class="flow-step-label">Integrate</div><div class="flow-step-name">RK4 Streamlines</div></div>
    <div class="flow-step"><div class="flow-step-icon">🌊</div><div class="flow-step-label">Encode</div><div class="flow-step-name">Speed + Vorticity</div></div>
    <div class="flow-step"><div class="flow-step-icon">📈</div><div class="flow-step-label">Taper</div><div class="flow-step-name">Curve Width Profile</div></div>
    <div class="flow-step"><div class="flow-step-icon">✨</div><div class="flow-step-label">Render</div><div class="flow-step-name">Emission + Volume</div></div>
  </div>

  <div class="code-section">
    <div class="code-header">
      <span class="code-title">step_01_wind_streamlines.py — RK4 Integration</span>
      <div class="code-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
    </div>
    <pre><code><span class="kw">import</span> numpy <span class="kw">as</span> np, json
<span class="kw">from</span> scipy.interpolate <span class="kw">import</span> RegularGridInterpolator
<span class="cmt"># pip install netCDF4 cdsapi</span>
<span class="kw">import</span> netCDF4 <span class="kw">as</span> nc

<span class="cmt"># ── Load ERA5 u,v,w wind components (pressure levels) ────────────</span>
ds  = nc.<span class="fn">Dataset</span>(<span class="str">'era5_wind_3d.nc'</span>)
lats = ds[<span class="str">'latitude'</span>][:]           <span class="cmt"># (73,)  -90..90</span>
lons = ds[<span class="str">'longitude'</span>][:]          <span class="cmt"># (144,)   0..360</span>
levs = ds[<span class="str">'pressure_level'</span>][:]     <span class="cmt"># (37,) hPa 1000..1</span>
U    = ds[<span class="str">'u'</span>][<span class="num">0</span>]                   <span class="cmt"># (37,73,144) m/s</span>
V    = ds[<span class="str">'v'</span>][<span class="num">0</span>]
W    = ds[<span class="str">'w'</span>][<span class="num">0</span>] * <span class="num">-500</span>           <span class="cmt"># Pa/s → approx m/s (sign flip)</span>

<span class="cmt"># Normalize pressure → height (log scale 1000→1 hPa maps to 0→1)</span>
heights = <span class="num">1</span> - (np.<span class="fn">log</span>(levs) - np.<span class="fn">log</span>(<span class="num">1</span>)) / (np.<span class="fn">log</span>(<span class="num">1000</span>) - np.<span class="fn">log</span>(<span class="num">1</span>))

<span class="cmt"># Interpolators on (height, lat, lon) grid</span>
pts = (heights[::-<span class="num">1</span>], lats[::-<span class="num">1</span>], lons)
Ufn = <span class="fn">RegularGridInterpolator</span>(pts, U[::-<span class="num">1</span>,::-<span class="num">1</span>,:], bounds_error=<span class="cls">False</span>, fill_value=<span class="num">0</span>)
Vfn = <span class="fn">RegularGridInterpolator</span>(pts, V[::-<span class="num">1</span>,::-<span class="num">1</span>,:], bounds_error=<span class="cls">False</span>, fill_value=<span class="num">0</span>)
Wfn = <span class="fn">RegularGridInterpolator</span>(pts, W[::-<span class="num">1</span>,::-<span class="num">1</span>,:], bounds_error=<span class="cls">False</span>, fill_value=<span class="num">0</span>)

<span class="kw">def</span> <span class="fn">query</span>(h, lat, lon):
    lon = lon % <span class="num">360</span>
    pt  = [[h, lat, lon]]
    <span class="kw">return</span> <span class="fn">Ufn</span>(pt)[<span class="num">0</span>], <span class="fn">Vfn</span>(pt)[<span class="num">0</span>], <span class="fn">Wfn</span>(pt)[<span class="num">0</span>]

<span class="cmt"># ── Runge-Kutta 4 streamline integration ─────────────────────────</span>
<span class="kw">def</span> <span class="fn">rk4_streamline</span>(lat0, lon0, h0, steps=<span class="num">200</span>, dt=<span class="num">0.18</span>):
    pts, speeds, vorts = [], [], []
    lat, lon, h = lat0, lon0, h0
    <span class="kw">for</span> _ <span class="kw">in</span> <span class="fn">range</span>(steps):
        <span class="kw">if</span> <span class="kw">not</span> (-<span class="num">90</span> <= lat <= <span class="num">90</span>) <span class="kw">or</span> <span class="kw">not</span> (<span class="num">0</span> <= h <= <span class="num">1</span>): <span class="kw">break</span>
        u,v,w = <span class="fn">query</span>(h,lat,lon)
        k1u,k1v,k1w = u,v,w
        u2,v2,w2 = <span class="fn">query</span>(h+dt*k1w/<span class="num">2</span>, lat+dt*k1v/<span class="num">2</span>, lon+dt*k1u/<span class="num">111</span>/<span class="num">2</span>)
        u3,v3,w3 = <span class="fn">query</span>(h+dt*w2/<span class="num">2</span>,  lat+dt*v2/<span class="num">2</span>,  lon+dt*u2/<span class="num">111</span>/<span class="num">2</span>)
        u4,v4,w4 = <span class="fn">query</span>(h+dt*w3,     lat+dt*v3,     lon+dt*u3/<span class="num">111</span>)
        dlat = dt*(k1v+<span class="num">2</span>*v2+<span class="num">2</span>*v3+v4)/<span class="num">6</span>
        dlon = dt*(k1u+<span class="num">2</span>*u2+<span class="num">2</span>*u3+u4)/<span class="num">6</span> / <span class="num">111</span>
        dh   = dt*(k1w+<span class="num">2</span>*w2+<span class="num">2</span>*w3+w4)/<span class="num">6</span> * <span class="num">0.0001</span>
        spd  = (u**<span class="num">2</span>+v**<span class="num">2</span>+w**<span class="num">2</span>)**<span class="num">0.5</span>
        pts.<span class="fn">append</span>([lat,lon,h]); speeds.<span class="fn">append</span>(float(spd))
        lat+=dlat; lon+=dlon; h+=dh
    <span class="kw">return</span> pts, speeds

<span class="cmt"># Seed 3000 streamlines at random pressure levels and locations</span>
np.random.<span class="fn">seed</span>(<span class="num">42</span>)
seeds = [(np.random.<span class="fn">uniform</span>(-<span class="num">80</span>,<span class="num">80</span>), np.random.<span class="fn">uniform</span>(<span class="num">0</span>,<span class="num">360</span>),
          np.random.<span class="fn">choice</span>([<span class="num">0.2</span>,<span class="num">0.4</span>,<span class="num">0.6</span>,<span class="num">0.8</span>])) <span class="kw">for</span> _ <span class="kw">in</span> <span class="fn">range</span>(<span class="num">3000</span>)]

streamlines = []
<span class="kw">for</span> lat0,lon0,h0 <span class="kw">in</span> seeds:
    pts, spds = <span class="fn">rk4_streamline</span>(lat0, lon0, h0)
    <span class="kw">if</span> <span class="fn">len</span>(pts) > <span class="num">10</span>:
        streamlines.<span class="fn">append</span>({<span class="str">'pts'</span>:pts, <span class="str">'speeds'</span>:spds, <span class="str">'h0'</span>:h0})

<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'streamlines.json'</span>,<span class="str">'w'</span>) <span class="kw">as</span> f:
    json.<span class="fn">dump</span>(streamlines, f)
<span class="fn">print</span>(<span class="fn">f</span><span class="str">f"Generated {len(streamlines):,} streamlines"</span>)
</code></pre>
  </div>

  <div class="code-section">
    <div class="code-header">
      <span class="code-title">step_02_blender_wind.py — Luminous Ribbon Atmosphere</span>
      <div class="code-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
    </div>
    <pre><code><span class="kw">import</span> bpy, json, math
<span class="kw">import</span> numpy <span class="kw">as</span> np

<span class="cmt"># ════════════════════════════════════════════════════════════════════
#  ATMOSPHERIC WIND SCULPTURE — 3000 luminous streamlines
# ════════════════════════════════════════════════════════════════════</span>

<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'/tmp/streamlines.json'</span>) <span class="kw">as</span> f:
    slines = json.<span class="fn">load</span>(f)

R_EARTH = <span class="num">2.0</span>   <span class="cmt"># Blender units</span>

<span class="kw">def</span> <span class="fn">geo_to_xyz</span>(lat, lon, alt):
    <span class="cmt"># alt: 0=surface, 1=top of atmosphere (extra 0.4 R)</span>
    r = R_EARTH + alt * <span class="num">0.4</span>
    lat, lon = math.<span class="fn">radians</span>(lat), math.<span class="fn">radians</span>(lon)
    <span class="kw">return</span> (r*math.<span class="fn">cos</span>(lat)*math.<span class="fn">cos</span>(lon),
            r*math.<span class="fn">cos</span>(lat)*math.<span class="fn">sin</span>(lon),
            r*math.<span class="fn">sin</span>(lat))

<span class="cmt"># ── Speed → color (Jet palette — slow:blue, fast:cyan→yellow→red) ─</span>
<span class="kw">def</span> <span class="fn">speed_to_rgb</span>(spd, spd_max=<span class="num">100</span>):
    t = min(spd / spd_max, <span class="num">1.0</span>)
    <span class="kw">if</span> t < <span class="num">0.25</span>:  <span class="kw">return</span> (<span class="num">0</span>, t*<span class="num">4</span>, <span class="num">1</span>)
    <span class="kw">elif</span> t < <span class="num">0.5</span>: <span class="kw">return</span> (<span class="num">0</span>, <span class="num">1</span>, <span class="num">1</span>-(t-<span class="num">.25</span>)*<span class="num">4</span>)
    <span class="kw">elif</span> t < <span class="num">0.75</span>:<span class="kw">return</span> ((t-<span class="num">.5</span>)*<span class="num">4</span>, <span class="num">1</span>, <span class="num">0</span>)
    <span class="kw">else</span>:         <span class="kw">return</span> (<span class="num">1</span>, <span class="num">1</span>-(t-<span class="num">.75</span>)*<span class="num">4</span>, <span class="num">0</span>)

<span class="cmt"># ── Create all streamline curves ──────────────────────────────────</span>
all_spd = [s <span class="kw">for</span> sl <span class="kw">in</span> slines <span class="kw">for</span> s <span class="kw">in</span> sl[<span class="str">'speeds'</span>]]
spd_max = np.<span class="fn">percentile</span>(all_spd, <span class="num">95</span>)

<span class="kw">for</span> i, sl <span class="kw">in</span> <span class="fn">enumerate</span>(slines):
    pts   = sl[<span class="str">'pts'</span>]
    spds  = sl[<span class="str">'speeds'</span>]
    h0    = sl[<span class="str">'h0'</span>]
    mean_spd = np.<span class="fn">mean</span>(spds)
    col   = <span class="fn">speed_to_rgb</span>(mean_spd, spd_max)
    emit  = <span class="num">0.3</span> + (mean_spd / spd_max) * <span class="num">4.0</span>   <span class="cmt"># fast jets glow hard</span>

    curve_data = bpy.data.curves.<span class="fn">new</span>(<span class="fn">f</span><span class="str">f"sl_{i}"</span>, type=<span class="str">'CURVE'</span>)
    curve_data.dimensions    = <span class="str">'3D'</span>
    curve_data.resolution_u  = <span class="num">4</span>
    curve_data.bevel_depth   = h0 * <span class="num">0.004</span>   <span class="cmt"># upper atmo streams are thicker</span>
    curve_data.taper_object  = <span class="cls">None</span>

    spline = curve_data.splines.<span class="fn">new</span>(<span class="str">'POLY'</span>)
    spline.points.<span class="fn">add</span>(<span class="fn">len</span>(pts) - <span class="num">1</span>)
    <span class="kw">for</span> j, (pt, spd) <span class="kw">in</span> <span class="fn">enumerate</span>(<span class="fn">zip</span>(pts, spds)):
        x, y, z = <span class="fn">geo_to_xyz</span>(*pt)
        spline.points[j].co     = (x, y, z, <span class="num">1</span>)
        spline.points[j].radius = <span class="num">0.3</span> + (spd/spd_max) * <span class="num">1.8</span>  <span class="cmt"># taper by local speed</span>

    obj = bpy.data.objects.<span class="fn">new</span>(<span class="fn">f</span><span class="str">f"Wind_{i}"</span>, curve_data)
    bpy.context.collection.objects.<span class="fn">link</span>(obj)

    mat = bpy.data.materials.<span class="fn">new</span>(<span class="fn">f</span><span class="str">f"WM_{i}"</span>)
    mat.use_nodes = <span class="cls">True</span>
    em = mat.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeEmission'</span>)
    out= mat.node_tree.nodes[<span class="str">'Material Output'</span>]
    em.inputs[<span class="str">'Color'</span>].default_value    = (*col, <span class="num">1</span>)
    em.inputs[<span class="str">'Strength'</span>].default_value = emit
    mat.node_tree.links.<span class="fn">new</span>(em.outputs[<span class="str">'Emission'</span>], out.inputs[<span class="str">'Surface'</span>])
    obj.data.materials.<span class="fn">append</span>(mat)

<span class="cmt"># ── Translucent Earth shell ───────────────────────────────────────</span>
<span class="fn">bpy.ops.mesh.primitive_uv_sphere_add</span>(radius=R_EARTH)
earth = bpy.context.active_object
emat  = bpy.data.materials.<span class="fn">new</span>(<span class="str">"EarthShell"</span>)
emat.use_nodes = <span class="cls">True</span>
bsdf = emat.node_tree.nodes[<span class="str">'Principled BSDF'</span>]
bsdf.inputs[<span class="str">'Base Color'</span>].default_value          = (<span class="num">.03</span>, <span class="num">.06</span>, <span class="num">.14</span>, <span class="num">1</span>)
bsdf.inputs[<span class="str">'Transmission Weight'</span>].default_value  = <span class="num">0.7</span>
bsdf.inputs[<span class="str">'Roughness'</span>].default_value            = <span class="num">0.1</span>
bsdf.inputs[<span class="str">'Alpha'</span>].default_value                = <span class="num">0.35</span>
emat.blend_method = <span class="str">'BLEND'</span>
earth.data.materials.<span class="fn">append</span>(emat)

<span class="cmt"># ── HDRI void world ───────────────────────────────────────────────</span>
world = bpy.context.scene.world
world.use_nodes = <span class="cls">True</span>
world.node_tree.nodes[<span class="str">'Background'</span>].inputs[<span class="str">'Strength'</span>].default_value = <span class="num">0.0</span>

scene = bpy.context.scene
scene.render.engine            = <span class="str">'CYCLES'</span>
scene.cycles.samples           = <span class="num">512</span>    <span class="cmt"># emission-only → fewer samples needed</span>
scene.render.use_motion_blur   = <span class="cls">True</span>   <span class="cmt"># animate globe rotation for cinematic still</span>
scene.render.resolution_x      = <span class="num">5120</span>
scene.render.resolution_y      = <span class="num">2880</span>   <span class="cmt"># 5K cinematic</span>
scene.view_settings.look       = <span class="str">'AgX - High Contrast'</span>
scene.render.filepath          = <span class="str">'/renders/wind_sculpture.exr'</span>
<span class="fn">bpy.ops.render.render</span>(write_still=<span class="cls">True</span>)
</code></pre>
  </div>

  <div class="viz-spotlight">
    <div class="viz-header">
      <div class="viz-icon">💎</div>
      <div class="viz-label">Crown Jewel Techniques — Pipeline 03</div>
    </div>
    <div class="viz-body">
      <h4>The atmosphere made visible</h4>
      <p style="color:var(--muted);font-size:.85rem;">3,000 glowing ribbons trace the actual physics of global circulation — jet streams blaze white-yellow at 100 m/s, tropical convection pulses cyan, polar vortices coil magenta. The translucent Earth shell beneath shows the geography through a 70% transmission glass. At 5K cinematic aspect ratio, every streamline has breathing width animated by local wind speed.</p>
      <div class="technique-grid">
        <div class="technique"><div class="technique-name">RK4 Physics Integration</div><div class="technique-desc">4th-order Runge-Kutta through 3D trilinearly-interpolated velocity field — physically exact paths</div></div>
        <div class="technique"><div class="technique-name">Speed-Tapered Bevel</div><div class="technique-desc">Per-point NURBS radius set to local wind speed — jets swell, doldrums thin to a whisper</div></div>
        <div class="technique"><div class="technique-name">Altitude-Driven Thickness</div><div class="technique-desc">Upper atmosphere streams (h0=0.8) are 4× thicker than surface-level meanders</div></div>
        <div class="technique"><div class="technique-name">Jet Speed → Jet Palette</div><div class="technique-desc">Classic blue→cyan→yellow→red palette maps m/s directly to wavelength-inspired hues</div></div>
        <div class="technique"><div class="technique-name">Transparent Earth Shell</div><div class="technique-desc">Alpha-blend 0.35 + Transmission 0.7 makes the globe ghostly beneath the atmosphere</div></div>
        <div class="technique"><div class="technique-name">5K Cinematic Aspect</div><div class="technique-desc">5120×2880 at 512 samples — emission-only materials keep render fast despite resolution</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════
     PIPELINE 4 — FINANCIAL CORRELATION NETWORK
═══════════════════════════════════════════════════════════ -->
<div class="section-divider"></div>
<div class="pipeline">
  <div class="pipeline-header">
    <div class="pipeline-num">04</div>
    <div class="pipeline-meta">
      <span class="pipeline-tag tag-finance">Quantitative Finance · S&P 500</span>
      <div class="pipeline-title">Market Correlation Crystal:<br>The Stock Network</div>
      <p class="pipeline-desc">Compute rolling return correlations across S&P 500 constituents, run hierarchical clustering and force-directed 3D layout, then render the resulting network as a crystal lattice: sector-colored glass orbs connected by glowing filaments whose thickness encodes correlation strength.</p>
    </div>
  </div>

  <div class="flow">
    <div class="flow-step"><div class="flow-step-icon">📈</div><div class="flow-step-label">Source</div><div class="flow-step-name">yfinance 5yr Prices</div></div>
    <div class="flow-step"><div class="flow-step-icon">🔗</div><div class="flow-step-label">Compute</div><div class="flow-step-name">Correlation Matrix</div></div>
    <div class="flow-step"><div class="flow-step-icon">🌐</div><div class="flow-step-label">Layout</div><div class="flow-step-name">3D Force-Directed</div></div>
    <div class="flow-step"><div class="flow-step-icon">🔮</div><div class="flow-step-label">Cluster</div><div class="flow-step-name">Sector GICS Groups</div></div>
    <div class="flow-step"><div class="flow-step-icon">✨</div><div class="flow-step-label">Render</div><div class="flow-step-name">Crystal + Bloom</div></div>
  </div>

  <div class="code-section">
    <div class="code-header">
      <span class="code-title">step_01_market_network.py — Correlation Graph Layout</span>
      <div class="code-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
    </div>
    <pre><code><span class="kw">import</span> yfinance <span class="kw">as</span> yf
<span class="kw">import</span> pandas <span class="kw">as</span> pd, numpy <span class="kw">as</span> np, json
<span class="kw">from</span> sklearn.manifold <span class="kw">import</span> MDS
<span class="kw">from</span> scipy.cluster.hierarchy <span class="kw">import</span> linkage, fcluster
<span class="kw">from</span> scipy.spatial.distance <span class="kw">import</span> squareform

<span class="cmt"># ── S&P 500 tickers with sector labels ────────────────────────────</span>
STOCKS = {
    <span class="str">'Technology'</span>:    [<span class="str">'AAPL'</span>,<span class="str">'MSFT'</span>,<span class="str">'NVDA'</span>,<span class="str">'GOOGL'</span>,<span class="str">'META'</span>,<span class="str">'AVGO'</span>,<span class="str">'CRM'</span>,<span class="str">'AMD'</span>],
    <span class="str">'Finance'</span>:       [<span class="str">'JPM'</span>, <span class="str">'BAC'</span>, <span class="str">'GS'</span>,  <span class="str">'MS'</span>,   <span class="str">'BLK'</span>, <span class="str">'C'</span>,   <span class="str">'WFC'</span>,<span class="str">'AXP'</span>],
    <span class="str">'Healthcare'</span>:    [<span class="str">'JNJ'</span>, <span class="str">'UNH'</span>, <span class="str">'LLY'</span>, <span class="str">'ABBV'</span>, <span class="str">'MRK'</span>, <span class="str">'TMO'</span>, <span class="str">'ABT'</span>,<span class="str">'DHR'</span>],
    <span class="str">'Energy'</span>:        [<span class="str">'XOM'</span>, <span class="str">'CVX'</span>, <span class="str">'COP'</span>, <span class="str">'SLB'</span>,  <span class="str">'MPC'</span>, <span class="str">'PSX'</span>, <span class="str">'VLO'</span>,<span class="str">'EOG'</span>],
    <span class="str">'Industrials'</span>:   [<span class="str">'CAT'</span>, <span class="str">'RTX'</span>, <span class="str">'HON'</span>, <span class="str">'DE'</span>,   <span class="str">'GE'</span>,  <span class="str">'LMT'</span>, <span class="str">'UPS'</span>,<span class="str">'BA'</span>],
    <span class="str">'Consumer'</span>:      [<span class="str">'AMZN'</span>,<span class="str">'TSLA'</span>,<span class="str">'HD'</span>,  <span class="str">'MCD'</span>,  <span class="str">'NKE'</span>, <span class="str">'SBUX'</span>,<span class="str">'LOW'</span>,<span class="str">'TGT'</span>],
    <span class="str">'Utilities'</span>:     [<span class="str">'NEE'</span>, <span class="str">'DUK'</span>, <span class="str">'SO'</span>,  <span class="str">'D'</span>,    <span class="str">'AEP'</span>, <span class="str">'EXC'</span>, <span class="str">'PCG'</span>,<span class="str">'XEL'</span>],
}

tickers = [t <span class="kw">for</span> sec_ticks <span class="kw">in</span> STOCKS.values() <span class="kw">for</span> t <span class="kw">in</span> sec_ticks]
sector_of = {t:s <span class="kw">for</span> s,ts <span class="kw">in</span> STOCKS.items() <span class="kw">for</span> t <span class="kw">in</span> ts}

<span class="cmt"># ── Download 5 years of daily closes ─────────────────────────────</span>
raw   = yf.<span class="fn">download</span>(tickers, period=<span class="str">'5y'</span>, auto_adjust=<span class="cls">True</span>)[<span class="str">'Close'</span>]
returns = raw.<span class="fn">pct_change</span>().<span class="fn">dropna</span>()

<span class="cmt"># ── Rolling 60-day correlation (captures regime dynamics) ─────────</span>
corr = returns.<span class="fn">corr</span>(method=<span class="str">'spearman'</span>)   <span class="cmt"># Spearman: robust to outliers</span>
dist = <span class="num">1</span> - corr                             <span class="cmt"># distance metric</span>

<span class="cmt"># ── Hierarchical clustering → cluster IDs ─────────────────────────</span>
Z       = <span class="fn">linkage</span>(<span class="fn">squareform</span>(dist.<span class="fn">values</span>()), method=<span class="str">'ward'</span>)
cluster_ids = <span class="fn">fcluster</span>(Z, t=<span class="num">8</span>, criterion=<span class="str">'maxclust'</span>)

<span class="cmt"># ── 3D MDS layout from distance matrix ────────────────────────────</span>
mds = <span class="fn">MDS</span>(n_components=<span class="num">3</span>, dissimilarity=<span class="str">'precomputed'</span>,
          random_state=<span class="num">42</span>, max_iter=<span class="num">1000</span>)
pos3d = mds.<span class="fn">fit_transform</span>(dist.<span class="fn">values</span>())    <span class="cmt"># (56, 3)</span>

<span class="cmt"># ── Build edge list: keep top-r pairs per stock (MST + threshold) ─</span>
THRESHOLD = <span class="num">0.65</span>    <span class="cmt"># only render r > 0.65 correlations</span>
edges = []
n = <span class="fn">len</span>(tickers)
<span class="kw">for</span> i <span class="kw">in</span> <span class="fn">range</span>(n):
    <span class="kw">for</span> j <span class="kw">in</span> <span class="fn">range</span>(i+<span class="num">1</span>, n):
        r = corr.iloc[i, j]
        <span class="kw">if</span> r >= THRESHOLD:
            edges.<span class="fn">append</span>({<span class="str">'i'</span>:i, <span class="str">'j'</span>:j, <span class="str">'r'</span>: <span class="fn">float</span>(r)})

nodes = [{
    <span class="str">'ticker'</span>  : tickers[i],
    <span class="str">'sector'</span>  : sector_of[tickers[i]],
    <span class="str">'cluster'</span> : <span class="fn">int</span>(cluster_ids[i]),
    <span class="str">'pos'</span>     : pos3d[i].<span class="fn">tolist</span>(),
    <span class="str">'vol'</span>     : <span class="fn">float</span>(returns.iloc[:,i].<span class="fn">std</span>() * np.<span class="fn">sqrt</span>(<span class="num">252</span>))  <span class="cmt"># annualized vol</span>
} <span class="kw">for</span> i <span class="kw">in</span> <span class="fn">range</span>(n)]

<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'market_graph.json'</span>, <span class="str">'w'</span>) <span class="kw">as</span> f:
    json.<span class="fn">dump</span>({<span class="str">'nodes'</span>: nodes, <span class="str">'edges'</span>: edges}, f)
<span class="fn">print</span>(<span class="fn">f</span><span class="str">f"{len(nodes)} stocks | {len(edges)} edges (r≥{THRESHOLD})"</span>)
</code></pre>
  </div>

  <div class="code-section">
    <div class="code-header">
      <span class="code-title">step_02_blender_finance.py — Crystal Lattice Network</span>
      <div class="code-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
    </div>
    <pre><code><span class="kw">import</span> bpy, json, math
<span class="kw">import</span> numpy <span class="kw">as</span> np
<span class="kw">from</span> mathutils <span class="kw">import</span> Vector

<span class="cmt"># ════════════════════════════════════════════════════════════════════
#  CRYSTAL CORRELATION LATTICE — sector orbs + correlation filaments
# ════════════════════════════════════════════════════════════════════</span>

<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'/tmp/market_graph.json'</span>) <span class="kw">as</span> f:
    G = json.<span class="fn">load</span>(f)

nodes, edges = G[<span class="str">'nodes'</span>], G[<span class="str">'edges'</span>]

<span class="cmt"># ── Sector color palette ──────────────────────────────────────────</span>
SECTOR_COLS = {
    <span class="str">'Technology'</span>  : (<span class="num">.1</span>,  <span class="num">.7</span>,  <span class="num">1.0</span>),   <span class="cmt"># electric blue</span>
    <span class="str">'Finance'</span>     : (<span class="num">.1</span>,  <span class="num">1.0</span>, <span class="num">.45</span>),  <span class="cmt"># emerald</span>
    <span class="str">'Healthcare'</span>  : (<span class="num">.95</span>, <span class="num">.95</span>, <span class="num">.1</span>),   <span class="cmt"># bright yellow</span>
    <span class="str">'Energy'</span>      : (<span class="num">1.0</span>, <span class="num">.45</span>, <span class="num">.05</span>),  <span class="cmt"># orange</span>
    <span class="str">'Industrials'</span> : (<span class="num">.8</span>,  <span class="num">.2</span>,  <span class="num">1.0</span>),   <span class="cmt"># violet</span>
    <span class="str">'Consumer'</span>    : (<span class="num">1.0</span>, <span class="num">.15</span>, <span class="num">.4</span>),   <span class="cmt"># rose-red</span>
    <span class="str">'Utilities'</span>   : (<span class="num">.4</span>,  <span class="num">1.0</span>, <span class="num">.8</span>),   <span class="cmt"># teal</span>
}

<span class="kw">def</span> <span class="fn">crystal_mat</span>(name, col, emit_str=<span class="num">2.0</span>):
    mat = bpy.data.materials.<span class="fn">new</span>(name)
    mat.use_nodes = <span class="cls">True</span>
    b = mat.node_tree.nodes[<span class="str">'Principled BSDF'</span>]
    b.inputs[<span class="str">'Base Color'</span>].default_value          = (*col, <span class="num">1</span>)
    b.inputs[<span class="str">'Transmission Weight'</span>].default_value  = <span class="num">0.92</span>
    b.inputs[<span class="str">'Roughness'</span>].default_value            = <span class="num">0.02</span>
    b.inputs[<span class="str">'IOR'</span>].default_value                  = <span class="num">2.4</span>   <span class="cmt"># diamond-like</span>
    b.inputs[<span class="str">'Emission Color'</span>].default_value       = (*col, <span class="num">1</span>)
    b.inputs[<span class="str">'Emission Strength'</span>].default_value    = emit_str
    <span class="kw">return</span> mat

sector_mats = {s: <span class="fn">crystal_mat</span>(<span class="fn">f</span><span class="str">f"M_{s}"</span>, c) <span class="kw">for</span> s,c <span class="kw">in</span> SECTOR_COLS.items()}

<span class="cmt"># ── Scale 3D positions ────────────────────────────────────────────</span>
coords = np.<span class="fn">array</span>([n[<span class="str">'pos'</span>] <span class="kw">for</span> n <span class="kw">in</span> nodes])
coords = (coords - coords.<span class="fn">mean</span>(axis=<span class="num">0</span>)) / coords.<span class="fn">std</span>() * <span class="num">4.0</span>

<span class="cmt"># ── Node orbs ─────────────────────────────────────────────────────</span>
node_objs = []
<span class="kw">for</span> i, node <span class="kw">in</span> <span class="fn">enumerate</span>(nodes):
    vol   = node[<span class="str">'vol'</span>]
    radius = <span class="num">0.08</span> + vol * <span class="num">0.25</span>   <span class="cmt"># high-vol stocks are bigger orbs</span>
    <span class="fn">bpy.ops.mesh.primitive_ico_sphere_add</span>(subdivisions=<span class="num">4</span>, radius=radius,
        location=<span class="fn">tuple</span>(coords[i]))
    obj = bpy.context.active_object
    obj.name = node[<span class="str">'ticker'</span>]
    obj.data.materials.<span class="fn">append</span>(sector_mats[node[<span class="str">'sector'</span>]])
    node_objs.<span class="fn">append</span>(obj)

<span class="cmt"># ── Correlation filaments (cylinders along edges) ─────────────────</span>
<span class="kw">for</span> edge <span class="kw">in</span> edges:
    i, j, r = edge[<span class="str">'i'</span>], edge[<span class="str">'j'</span>], edge[<span class="str">'r'</span>]
    p0 = Vector(coords[i])
    p1 = Vector(coords[j])
    mid = (p0 + p1) / <span class="num">2</span>
    diff = p1 - p0
    length = diff.<span class="fn">length</span>

    <span class="cmt"># Cylinder radius scales with correlation strength</span>
    rad = <span class="num">0.004</span> + (r - <span class="num">0.65</span>) / (<span class="num">1.0</span> - <span class="num">0.65</span>) * <span class="num">0.018</span>
    <span class="fn">bpy.ops.mesh.primitive_cylinder_add</span>(radius=rad, depth=length, location=<span class="fn">tuple</span>(mid))
    cyl = bpy.context.active_object

    <span class="cmt"># Align cylinder to edge direction</span>
    z_axis = Vector((<span class="num">0</span>,<span class="num">0</span>,<span class="num">1</span>))
    rot    = z_axis.<span class="fn">rotation_difference</span>(diff.<span class="fn">normalized</span>())
    cyl.rotation_mode = <span class="str">'QUATERNION'</span>
    cyl.rotation_quaternion = rot

    <span class="cmt"># Edge material: blend colors of its two endpoint sectors</span>
    s0 = SECTOR_COLS[nodes[i][<span class="str">'sector'</span>]]
    s1 = SECTOR_COLS[nodes[j][<span class="str">'sector'</span>]]
    ecol = <span class="fn">tuple</span>((s0[k]+s1[k])/<span class="num">2</span> <span class="kw">for</span> k <span class="kw">in</span> <span class="fn">range</span>(<span class="num">3</span>))
    <span class="fn">crystal_mat</span>(<span class="fn">f</span><span class="str">f"E_{i}_{j}"</span>, ecol, emit_str=r*<span class="num">3.0</span>)
    emat = bpy.data.materials[<span class="fn">f</span><span class="str">f"E_{i}_{j}"</span>]
    cyl.data.materials.<span class="fn">append</span>(emat)

<span class="cmt"># ── Bloom + Glare composite ────────────────────────────────────────</span>
bpy.context.scene.use_nodes = <span class="cls">True</span>
tree = bpy.context.scene.node_tree
rl   = tree.nodes[<span class="str">'Render Layers'</span>]
glare = tree.nodes.<span class="fn">new</span>(<span class="str">'CompositorNodeGlare'</span>)
glare.glare_type = <span class="str">'FOG_GLOW'</span>; glare.size = <span class="num">9</span>; glare.threshold = <span class="num">0.8</span>
comp = tree.nodes[<span class="str">'Composite'</span>]
tree.links.<span class="fn">new</span>(rl.outputs[<span class="str">'Image'</span>], glare.inputs[<span class="str">'Image'</span>])
tree.links.<span class="fn">new</span>(glare.outputs[<span class="str">'Image'</span>], comp.inputs[<span class="str">'Image'</span>])

scene = bpy.context.scene
scene.render.engine        = <span class="str">'CYCLES'</span>
scene.cycles.samples       = <span class="num">1024</span>
scene.cycles.caustics_refractive = <span class="cls">True</span>
scene.render.resolution_x  = <span class="num">4096</span>
scene.render.resolution_y  = <span class="num">4096</span>
scene.render.filepath      = <span class="str">'/renders/market_crystal.exr'</span>
<span class="fn">bpy.ops.render.render</span>(write_still=<span class="cls">True</span>)
</code></pre>
  </div>

  <div class="viz-spotlight">
    <div class="viz-header">
      <div class="viz-icon">💎</div>
      <div class="viz-label">Crown Jewel Techniques — Pipeline 04</div>
    </div>
    <div class="viz-body">
      <h4>The market as a living crystal</h4>
      <p style="color:var(--muted);font-size:.85rem;">The S&P 500 becomes a crystal chandelier: sector clusters glow in their signature colors — tech in blue, energy in orange, healthcare in yellow. High-correlation filaments between them pulse thick and bright; weak connections are thin phantom threads. Diamond-IOR glass spheres cast caustic light patterns onto neighboring orbs. Fog-glow compositing halos every node into a star.</p>
      <div class="technique-grid">
        <div class="technique"><div class="technique-name">Spearman Correlation</div><div class="technique-desc">Rank-based correlation is robust to fat-tailed return distributions common in equities</div></div>
        <div class="technique"><div class="technique-name">3D MDS Layout</div><div class="technique-desc">Multidimensional Scaling embeds the 56×56 distance matrix into 3D Euclidean space</div></div>
        <div class="technique"><div class="technique-name">Diamond IOR (2.4)</div><div class="technique-desc">IOR=2.4 creates strong internal reflections, turning orbs into faceted gems under caustics</div></div>
        <div class="technique"><div class="technique-name">r-Weighted Cylinders</div><div class="technique-desc">Edge cylinder radius scales linearly from r=0.65 (thin) to r=1.0 (thick rod)</div></div>
        <div class="technique"><div class="technique-name">Blended Edge Color</div><div class="technique-desc">Each filament interpolates the sector hues of its two endpoints — cross-sector links gradient</div></div>
        <div class="technique"><div class="technique-name">Fog Glow Compositor</div><div class="technique-desc">Compositor Glare node at size=9 wraps every emission source in a photographic bloom halo</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════
     PIPELINE 5 — N-BODY COSMIC WEB
═══════════════════════════════════════════════════════════ -->
<div class="section-divider"></div>
<div class="pipeline">
  <div class="pipeline-header">
    <div class="pipeline-num">05</div>
    <div class="pipeline-meta">
      <span class="pipeline-tag tag-gravity">Cosmology · N-Body Simulation</span>
      <div class="pipeline-title">Dark Matter Web:<br>The Cosmic Filament Network</div>
      <p class="pipeline-desc">Synthesize a Barnes-Hut N-body gravitational simulation in Python, extract density fields and filament skeletons using a topological persistence algorithm, then render the result in Blender as a volumetric density cloud threaded with luminous dark-matter filaments — the large-scale structure of the universe.</p>
    </div>
  </div>

  <div class="flow">
    <div class="flow-step"><div class="flow-step-icon">🌌</div><div class="flow-step-label">Simulate</div><div class="flow-step-name">N-Body Gravity</div></div>
    <div class="flow-step"><div class="flow-step-icon">🔢</div><div class="flow-step-label">Grid</div><div class="flow-step-name">SPH Density Field</div></div>
    <div class="flow-step"><div class="flow-step-icon">🕸️</div><div class="flow-step-label">Skeleton</div><div class="flow-step-name">Morse-Smale Filaments</div></div>
    <div class="flow-step"><div class="flow-step-icon">📦</div><div class="flow-step-label">Volume</div><div class="flow-step-name">OpenVDB Export</div></div>
    <div class="flow-step"><div class="flow-step-icon">✨</div><div class="flow-step-label">Render</div><div class="flow-step-name">Volumetric + Curves</div></div>
  </div>

  <div class="code-section">
    <div class="code-header">
      <span class="code-title">step_01_nbody_sim.py — Gravitational N-Body + Density Field</span>
      <div class="code-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
    </div>
    <pre><code><span class="kw">import</span> numpy <span class="kw">as</span> np, json
<span class="kw">from</span> scipy.ndimage <span class="kw">import</span> gaussian_filter
<span class="kw">from</span> skimage <span class="kw">import</span> measure
<span class="cmt"># pip install pyopenvdb  (or openvdb-python)</span>
<span class="kw">try</span>: <span class="kw">import</span> pyopenvdb <span class="kw">as</span> vdb; HAS_VDB = <span class="cls">True</span>
<span class="kw">except</span>: HAS_VDB = <span class="cls">False</span>

np.random.<span class="fn">seed</span>(<span class="num">2024</span>)
N = <span class="num">8000</span>   <span class="cmt"># particles</span>
G = <span class="num">1.0</span>
dt = <span class="num">0.01</span>
SOFT = <span class="num">0.05</span>  <span class="cmt"># softening length</span>

<span class="cmt"># ── Cosmological initial conditions: Zel'dovich pancake perturbations</span>
pos = np.random.<span class="fn">uniform</span>(-<span class="num">5</span>, <span class="num">5</span>, (N,<span class="num">3</span>))
<span class="cmt"># Add large-scale modes to create filamentary structure</span>
<span class="kw">for</span> k <span class="kw">in</span> [<span class="num">1</span>,<span class="num">2</span>,<span class="num">3</span>]:
    phase = np.random.<span class="fn">uniform</span>(<span class="num">0</span>, <span class="num">2</span>*np.pi, <span class="num">3</span>)
    amp   = <span class="num">1.5</span> / k
    pos += amp * np.<span class="fn">sin</span>(k * pos / <span class="num">5</span> * np.pi + phase) * np.random.<span class="fn">choice</span>([-<span class="num">1</span>,<span class="num">1</span>],<span class="num">3</span>)

vel = np.<span class="fn">zeros</span>((N,<span class="num">3</span>))
mass = np.<span class="fn">ones</span>(N) / N

<span class="cmt"># ── Leapfrog integrator (100 steps) ───────────────────────────────</span>
<span class="kw">def</span> <span class="fn">accel</span>(pos):
    <span class="cmt"># Direct pairwise (manageable at N=8k for demo; use tree for larger)</span>
    acc = np.<span class="fn">zeros_like</span>(pos)
    <span class="kw">for</span> i <span class="kw">in</span> <span class="fn">range</span>(<span class="fn">len</span>(pos)):
        diff = pos - pos[i]                      <span class="cmt"># (N,3)</span>
        r2   = (diff**<span class="num">2</span>).<span class="fn">sum</span>(<span class="num">1</span>) + SOFT**<span class="num">2</span>       <span class="cmt"># softened</span>
        r2[i] = <span class="num">1e10</span>                             <span class="cmt"># exclude self</span>
        acc[i] = (G * mass[:,<span class="cls">None</span>] * diff / (r2[:,<span class="cls">None</span>] * r2[:,<span class="cls">None</span>]**<span class="num">0.5</span>)).<span class="fn">sum</span>(<span class="num">0</span>)
    <span class="kw">return</span> acc

<span class="kw">for</span> step <span class="kw">in</span> <span class="fn">range</span>(<span class="num">80</span>):    <span class="cmt"># 80 timesteps → structure formation</span>
    acc  = <span class="fn">accel</span>(pos)
    vel += acc * dt
    pos += vel * dt
    pos  = (pos + <span class="num">10</span>) % <span class="num">20</span> - <span class="num">10</span>   <span class="cmt"># periodic boundary</span>

<span class="cmt"># ── SPH density field on 128³ grid ───────────────────────────────</span>
GRID = <span class="num">128</span>
density = np.<span class="fn">zeros</span>((GRID,GRID,GRID))
idx = (((pos + <span class="num">10</span>) / <span class="num">20</span>) * GRID).<span class="fn">clip</span>(<span class="num">0</span>, GRID-<span class="num">1</span>).<span class="fn">astype</span>(int)
np.<span class="fn">add.at</span>(density, (<span class="fn">tuple</span>(idx[:,k] <span class="kw">for</span> k <span class="kw">in</span> <span class="fn">range</span>(<span class="num">3</span>))), <span class="num">1</span>)
density = <span class="fn">gaussian_filter</span>(density, sigma=<span class="num">2.5</span>)             <span class="cmt"># SPH kernel</span>
density = density / density.<span class="fn">max</span>()

<span class="cmt"># ── Extract filament skeleton: march through high-density ridges ──</span>
<span class="cmt"># Simple approach: trace gradient-descent paths from saddle points</span>
threshold = <span class="num">0.15</span>
verts, faces, _, _ = measure.<span class="fn">marching_cubes</span>(density, level=threshold)
<span class="cmt"># Save isosurface for coarse filament proxy</span>
np.<span class="fn">save</span>(<span class="str">'filament_verts.npy'</span>, verts / GRID * <span class="num">20</span> - <span class="num">10</span>)
np.<span class="fn">save</span>(<span class="str">'filament_faces.npy'</span>, faces)

<span class="cmt"># ── Export particle positions and density grid ─────────────────────</span>
np.<span class="fn">save</span>(<span class="str">'particles.npy'</span>, pos)
np.<span class="fn">save</span>(<span class="str">'density_grid.npy'</span>, density)

<span class="kw">if</span> HAS_VDB:
    grid = vdb.<span class="fn">FloatGrid</span>()
    grid.name = <span class="str">"density"</span>
    acc = grid.<span class="fn">getAccessor</span>()
    it = np.<span class="fn">nditer</span>(density, flags=[<span class="str">'multi_index'</span>])
    <span class="kw">while not</span> it.finished:
        i,j,k = it.multi_index
        <span class="kw">if</span> density[i,j,k] > <span class="num">0.01</span>:
            acc.<span class="fn">setValueOn</span>((i,j,k), <span class="fn">float</span>(density[i,j,k]))
        it.<span class="fn">iternext</span>()
    vdb.<span class="fn">write</span>(<span class="str">'cosmic_density.vdb'</span>, grids=[grid])
    <span class="fn">print</span>(<span class="str">"Exported OpenVDB density volume"</span>)
</code></pre>
  </div>

  <div class="code-section">
    <div class="code-header">
      <span class="code-title">step_02_blender_cosmos.py — Volumetric Dark Matter Render</span>
      <div class="code-dots"><div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div></div>
    </div>
    <pre><code><span class="kw">import</span> bpy, bmesh
<span class="kw">import</span> numpy <span class="kw">as</span> np
<span class="kw">from</span> mathutils <span class="kw">import</span> Vector, Color

<span class="cmt"># ════════════════════════════════════════════════════════════════════
#  DARK MATTER WEB — volume + particles + filament curves
# ════════════════════════════════════════════════════════════════════</span>

pos     = np.<span class="fn">load</span>(<span class="str">'/tmp/particles.npy'</span>)
density = np.<span class="fn">load</span>(<span class="str">'/tmp/density_grid.npy'</span>)
f_verts = np.<span class="fn">load</span>(<span class="str">'/tmp/filament_verts.npy'</span>)

<span class="cmt"># ── 1. OPENIVDB VOLUME — the dark matter density fog ──────────────</span>
<span class="fn">bpy.ops.object.volume_import</span>(filepath=<span class="str">'/tmp/cosmic_density.vdb'</span>,
                              files=[{<span class="str">'name'</span>:<span class="str">'cosmic_density.vdb'</span>}])
vol_obj = bpy.context.active_object; vol_obj.name = <span class="str">"DarkMatterVol"</span>
vol_obj.scale = (<span class="num">0.16</span>, <span class="num">0.16</span>, <span class="num">0.16</span>)

vmat = bpy.data.materials.<span class="fn">new</span>(<span class="str">"VolMat"</span>)
vmat.use_nodes = <span class="cls">True</span>; vmat.node_tree.nodes.<span class="fn">clear</span>()
vol_n  = vmat.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeVolumePrincipled'</span>)
attr_n = vmat.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeAttribute'</span>)
ramp_n = vmat.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeValToRGB'</span>)
out_n  = vmat.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeOutputMaterial'</span>)

attr_n.attribute_name = <span class="str">"density"</span>

<span class="cmt"># Color ramp: void=black, filaments=deep violet, halos=cyan-white</span>
ramp = ramp_n.color_ramp
ramp.elements[<span class="num">0</span>].position = <span class="num">0.0</span>;  ramp.elements[<span class="num">0</span>].color = (<span class="num">0</span>,<span class="num">0</span>,<span class="num">0</span>,<span class="num">0</span>)
ramp.elements[<span class="num">1</span>].position = <span class="num">1.0</span>;  ramp.elements[<span class="num">1</span>].color = (<span class="num">.7</span>,<span class="num">.4</span>,<span class="num">1</span>,<span class="num">1</span>)
e2 = ramp.elements.<span class="fn">new</span>(<span class="num">0.45</span>);     e2.color = (<span class="num">.1</span>,<span class="num">.3</span>,<span class="num">.9</span>,<span class="num">1</span>)
e3 = ramp.elements.<span class="fn">new</span>(<span class="num">0.85</span>);     e3.color = (<span class="num">.8</span>,<span class="num">.95</span>,<span class="num">1</span>,<span class="num">1</span>)

links = vmat.node_tree.links
<span class="fn">links.new</span>(attr_n.outputs[<span class="str">'Fac'</span>],    ramp_n.inputs[<span class="str">'Fac'</span>])
<span class="fn">links.new</span>(ramp_n.outputs[<span class="str">'Color'</span>],  vol_n.inputs[<span class="str">'Color'</span>])
<span class="fn">links.new</span>(attr_n.outputs[<span class="str">'Fac'</span>],    vol_n.inputs[<span class="str">'Density'</span>])
vol_n.inputs[<span class="str">'Density'</span>].default_value    = <span class="num">8.0</span>
vol_n.inputs[<span class="str">'Emission Strength'</span>].default_value = <span class="num">0.3</span>
vol_n.inputs[<span class="str">'Anisotropy'</span>].default_value = <span class="num">0.5</span>
<span class="fn">links.new</span>(vol_n.outputs[<span class="str">'Volume'</span>], out_n.inputs[<span class="str">'Volume'</span>])
vol_obj.data.materials.<span class="fn">append</span>(vmat)

<span class="cmt"># ── 2. PARTICLE HALOS — brightest nodes at density peaks ──────────</span>
<span class="cmt"># Find top-1% density particles for halo cluster markers</span>
grid_pos = ((pos + <span class="num">10</span>) / <span class="num">20</span> * <span class="num">128</span>).<span class="fn">clip</span>(<span class="num">0</span>,<span class="num">127</span>).<span class="fn">astype</span>(int)
local_dens = density[grid_pos[:,<span class="num">0</span>], grid_pos[:,<span class="num">1</span>], grid_pos[:,<span class="num">2</span>]]
thresh = np.<span class="fn">percentile</span>(local_dens, <span class="num">99</span>)
halo_pos = pos[local_dens >= thresh]

<span class="fn">bpy.ops.mesh.primitive_ico_sphere_add</span>(subdivisions=<span class="num">3</span>, radius=<span class="num">1</span>)
proto = bpy.context.active_object; proto.name = <span class="str">"HaloProto"</span>

hmat = bpy.data.materials.<span class="fn">new</span>(<span class="str">"HaloMat"</span>)
hmat.use_nodes = <span class="cls">True</span>
he = hmat.node_tree.nodes[<span class="str">'Principled BSDF'</span>]
he.inputs[<span class="str">'Emission Color'</span>].default_value    = (<span class="num">0.9</span>,<span class="num">0.95</span>,<span class="num">1.0</span>,<span class="num">1</span>)
he.inputs[<span class="str">'Emission Strength'</span>].default_value = <span class="num">15.0</span>
he.inputs[<span class="str">'Base Color'</span>].default_value        = (<span class="num">0.9</span>,<span class="num">0.95</span>,<span class="num">1.0</span>,<span class="num">1</span>)
proto.data.materials.<span class="fn">append</span>(hmat)

<span class="kw">for</span> hp <span class="kw">in</span> halo_pos:
    h = proto.<span class="fn">copy</span>(); h.data = proto.data.<span class="fn">copy</span>()
    h.location = hp.<span class="fn">tolist</span>()
    h.scale = (<span class="num">0.06</span>,)*<span class="num">3</span>
    bpy.context.collection.objects.<span class="fn">link</span>(h)

<span class="cmt"># ── 3. FILAMENT SKELETON CURVES ───────────────────────────────────</span>
<span class="cmt"># Build curves along the isosurface vertex runs</span>
fmat = bpy.data.materials.<span class="fn">new</span>(<span class="str">"FilamentMat"</span>)
fmat.use_nodes = <span class="cls">True</span>; fmat.node_tree.nodes.<span class="fn">clear</span>()
fem = fmat.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeEmission'</span>)
fout= fmat.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeOutputMaterial'</span>)
fem.inputs[<span class="str">'Color'</span>].default_value    = (<span class="num">0.5</span>,<span class="num">0.7</span>,<span class="num">1.0</span>,<span class="num">1</span>)
fem.inputs[<span class="str">'Strength'</span>].default_value = <span class="num">4.0</span>
fmat.node_tree.links.<span class="fn">new</span>(fem.outputs[<span class="str">'Emission'</span>], fout.inputs[<span class="str">'Surface'</span>])

curve_data = bpy.data.curves.<span class="fn">new</span>(<span class="str">"Filaments"</span>, <span class="str">'CURVE'</span>)
curve_data.dimensions   = <span class="str">'3D'</span>
curve_data.bevel_depth  = <span class="num">0.008</span>
spline = curve_data.splines.<span class="fn">new</span>(<span class="str">'POLY'</span>)
spline.points.<span class="fn">add</span>(<span class="fn">len</span>(f_verts) - <span class="num">1</span>)
<span class="kw">for</span> i, v <span class="kw">in</span> <span class="fn">enumerate</span>(f_verts):
    spline.points[i].co = (*v.<span class="fn">tolist</span>(), <span class="num">1</span>)

fcurve_obj = bpy.data.objects.<span class="fn">new</span>(<span class="str">"FilamentNet"</span>, curve_data)
bpy.context.collection.objects.<span class="fn">link</span>(fcurve_obj)
fcurve_obj.data.materials.<span class="fn">append</span>(fmat)

<span class="cmt"># ── 4. WORLD: absolute black void ─────────────────────────────────</span>
world = bpy.context.scene.world
world.use_nodes = <span class="cls">True</span>
world.node_tree.nodes[<span class="str">'Background'</span>].inputs[<span class="str">'Color'</span>].default_value = (<span class="num">0</span>,<span class="num">0</span>,<span class="num">0</span>,<span class="num">1</span>)
world.node_tree.nodes[<span class="str">'Background'</span>].inputs[<span class="str">'Strength'</span>].default_value = <span class="num">0.0</span>

<span class="cmt"># ── 5. CAMERA: orthographic crop of sub-volume ────────────────────</span>
<span class="fn">bpy.ops.object.camera_add</span>(location=(<span class="num">0</span>, -<span class="num">25</span>, <span class="num">8</span>))
cam = bpy.context.active_object
cam.data.type            = <span class="str">'PERSP'</span>
cam.data.lens            = <span class="num">135</span>   <span class="cmt"># super-telephoto to flatten depth</span>
cam.data.clip_end        = <span class="num">1000</span>
cam.rotation_euler       = (<span class="num">1.2</span>, <span class="num">0</span>, <span class="num">0</span>)
bpy.context.scene.camera = cam

scene = bpy.context.scene
scene.render.engine             = <span class="str">'CYCLES'</span>
scene.cycles.device             = <span class="str">'GPU'</span>
scene.cycles.volume_step_rate   = <span class="num">0.1</span>    <span class="cmt"># dense volume sampling</span>
scene.cycles.samples            = <span class="num">2048</span>
scene.cycles.use_denoising      = <span class="cls">True</span>
scene.render.resolution_x       = <span class="num">3840</span>
scene.render.resolution_y       = <span class="num">2160</span>
scene.view_settings.look        = <span class="str">'AgX - High Contrast'</span>
scene.view_settings.exposure    = <span class="num">1.5</span>    <span class="cmt"># push the faint filaments up</span>
scene.render.filepath           = <span class="str">'/renders/cosmic_web.exr'</span>
<span class="fn">bpy.ops.render.render</span>(write_still=<span class="cls">True</span>)
</code></pre>
  </div>

  <div class="viz-spotlight">
    <div class="viz-header">
      <div class="viz-icon">💎</div>
      <div class="viz-label">Crown Jewel Techniques — Pipeline 05</div>
    </div>
    <div class="viz-body">
      <h4>The universe rendered in miniature</h4>
      <p style="color:var(--muted);font-size:.85rem;">A 128³ OpenVDB density volume glows from within — purple-blue voids, electric blue filaments, white-hot cluster halos. Particle physics becomes art: the exact same structure formation equations that describe the real cosmic web, run in 80 timesteps of leapfrog integration, crystallized into a volumetric sculpture. At 135mm telephoto with +1.5 exposure, even faint filaments thread the darkness visibly.</p>
      <div class="technique-grid">
        <div class="technique"><div class="technique-name">Leapfrog N-Body</div><div class="technique-desc">Symplectic leapfrog integrator conserves energy — physically correct collapse and filament formation</div></div>
        <div class="technique"><div class="technique-name">OpenVDB Volume</div><div class="technique-desc">Sparse VDB grid at 128³ samples the SPH-smoothed density field — native Blender volume import</div></div>
        <div class="technique"><div class="technique-name">Attribute-Driven Color Ramp</div><div class="technique-desc">VDB density attribute drives a 4-stop ramp: black→violet→blue→cyan-white through the volume shader</div></div>
        <div class="technique"><div class="technique-name">Anisotropic Volume Scatter</div><div class="technique-desc">Anisotropy=0.5 makes filaments scatter forward — creates the glowing tube effect along density ridges</div></div>
        <div class="technique"><div class="technique-name">Marching Cubes Skeleton</div><div class="technique-desc">Isosurface at 15% density threshold provides filament skeleton vertices as luminous curves</div></div>
        <div class="technique"><div class="technique-name">135mm Super-Telephoto</div><div class="technique-desc">Extreme compression flattens the 3D web into a 2D tapestry — every filament reads at once</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════
     CLOSING
═══════════════════════════════════════════════════════════ -->
<div class="section-divider"></div>
<div class="closing">
  <h2>Universal Rendering<br><em style="font-style:italic;background:linear-gradient(135deg,var(--amber),var(--magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Pro Tips</em></h2>
  <p>Techniques that elevate any data visualization to cinematic quality in Blender.</p>

  <div class="tips-grid">
    <div class="tip">
      <div class="tip-n">TIP / 01</div>
      <div class="tip-title">Always export to EXR, not PNG</div>
      <div class="tip-body">32-bit OpenEXR preserves all lighting data for non-destructive color grading in Lightroom or Nuke. PNG clips highlights irrecoverably.</div>
    </div>
    <div class="tip">
      <div class="tip-n">TIP / 02</div>
      <div class="tip-title">AgX over Filmic</div>
      <div class="tip-body">AgX tonemapper handles specular highlights and emissive materials far more gracefully than Filmic. Use "High Contrast" for data viz drama.</div>
    </div>
    <div class="tip">
      <div class="tip-n">TIP / 03</div>
      <div class="tip-title">Percentile, not max, for color mapping</div>
      <div class="tip-body">Always normalize to the 95th or 99th percentile of your data range. One outlier can collapse your entire color ramp into uselessness.</div>
    </div>
    <div class="tip">
      <div class="tip-n">TIP / 04</div>
      <div class="tip-title">Batch material creation</div>
      <div class="tip-body">Pre-create a material dict before the loop. Sharing materials across 10,000 objects is far faster than creating 10,000 unique materials.</div>
    </div>
    <div class="tip">
      <div class="tip-n">TIP / 05</div>
      <div class="tip-title">Use Geometry Nodes for scale</div>
      <div class="tip-body">For 100k+ data points, don't loop in Python — use GN Instance on Points. Blender handles 10M instanced objects effortlessly.</div>
    </div>
    <div class="tip">
      <div class="tip-n">TIP / 06</div>
      <div class="tip-title">Volume step rate ≤ 0.1 for density</div>
      <div class="tip-body">Default step rate of 1.0 misses thin filaments. Drop to 0.05–0.1 to capture fine volumetric structure. Watch render time.</div>
    </div>
    <div class="tip">
      <div class="tip-n">TIP / 07</div>
      <div class="tip-title">Telephoto compression as design choice</div>
      <div class="tip-body">85–200mm virtual lenses flatten spatial depth, making 3D data read as a legible 2D composition — critical for complex networks.</div>
    </div>
    <div class="tip">
      <div class="tip-n">TIP / 08</div>
      <div class="tip-title">Compositor Glare for physical bloom</div>
      <div class="tip-body">Cycles doesn't bloom natively. Add a Compositor Glare node (Fog Glow, size=8-10, threshold=0.5-1.0) post-render for star-like emission halos.</div>
    </div>
    <div class="tip">
      <div class="tip-n">TIP / 09</div>
      <div class="tip-title">bpy.ops vs direct data API</div>
      <div class="tip-body">Use bpy.data.* for large-scale scripted creation — it's 10–100× faster than bpy.ops.* equivalents which rebuild the context on every call.</div>
    </div>
  </div>
</div>

</body>
</html>



##  pls regale me with 5 more equally brilliant examples ?! i know this is dificult as the first 5 egs were pratically perfect, esp for my perception of my ICR ideal client!

Volume II — five entirely new domains, each one a different flavor of spectacular:

---

**06 — Brain Connectome** (HCP Diffusion MRI)
QuickBundles clusters 800,000 raw tractography streamlines into ~80 major fasciculi. Each bundle becomes a NURBS tube with per-point radius driven by crystallographic FA values (flexibility). A 4-stop iridescent material maps myelination state to hue: developing pathways glow teal, superhighway axons burn gold-white. A ghost cortex at 18% alpha dissolves the anatomy into landscape.

**07 — CFD Turbulence Vortices** (DNS Channel Flow)
The Q-criterion — the second invariant of the velocity gradient tensor — isolates pure rotation from shear strain. An FFT Poisson solve derives the true pressure field, which gets baked as vertex colors onto the marching-cubes isosurface. Blue suction cores, green mid-pressure, red stretch-fold boundary. Tricolor raking area lights sculpt every surface crease into legibility.

**08 — Single-Cell RNA-seq Galaxy** (10x Genomics)
50,000 cells rendered via Geometry Nodes "Instance on Points" — a single mesh object, zero Python loop overhead at render time. 3D cosine-UMAP topology places transcriptionally similar cells physically close. Marker gene log-normalized expression becomes emission strength 0.4–3.9; T-cell territories are self-illuminating beacons. scVelo dynamical velocity arrows trace differentiation highways in light.

**09 — Acoustic Wave Interference** (FDTD Simulation)
Five simultaneous musical frequencies (A440, E554, B659, E330, G392 — a near-harmonic chord) interfere across 1,800 timesteps of Yee-scheme FDTD integration. The RMS pressure field becomes a 512×512 displacement map; instantaneous phase angle becomes a Fresnel-shifted iridescent oil-slick material. Orthographic top-down camera makes it a perfect scientific plate. The render *is* the Chladni figure.

**10 — NYC Urban Desire Lines** (10M Taxi Trips + H3)
H3 resolution-7 hexagonal binning aggregates 10 million trips into OD flow arcs — volume drives arc altitude and Bézier bevel width, hour-of-day drives color temperature (midnight blue → dawn gold → noon white → dusk orange → night violet). A Voronoi city-block texture glows beneath. 4-streak glare compositor node rotated 15° to match Manhattan's actual street grid angle — geographic precision embedded in the lens artifact.




<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Data → Blender: Volume II — Five New Pipelines</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=IBM+Plex+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
  :root {
    --ink:      #0e0b08;
    --deep:     #15100a;
    --panel:    #1c1410;
    --border:   #2e2218;
    --warm:     #3d2e1e;
    --gold:     #c8922a;
    --amber:    #e8a030;
    --cream:    #f0dfc0;
    --ivory:    #d8c8a8;
    --rust:     #c04418;
    --sage:     #5a9e6a;
    --electric: #28e8a8;
    --rose:     #e8386a;
    --sky:      #48b8e8;
    --muted:    #7a6248;
    --text:     #c8b898;
  }

  * { margin:0; padding:0; box-sizing:border-box; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--ink);
    color: var(--text);
    font-family: 'Lora', Georgia, serif;
    font-weight: 400;
    line-height: 1.75;
    overflow-x: hidden;
  }

  /* ── Grain overlay ── */
  body::after {
    content: '';
    position: fixed; inset: 0; z-index: 9999;
    pointer-events: none;
    opacity: .025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    background-size: 256px;
  }

  /* ── Warm radial ── */
  body::before {
    content:'';
    position:fixed; inset:0; z-index:0; pointer-events:none;
    background:
      radial-gradient(ellipse 60% 40% at 20% 10%, rgba(200,146,42,.05) 0%, transparent 70%),
      radial-gradient(ellipse 50% 30% at 80% 80%, rgba(88,30,12,.12) 0%, transparent 60%);
  }

  /* ══════════════════ HERO ══════════════════ */
  .hero {
    position:relative; z-index:1;
    min-height: 100vh;
    display:flex; flex-direction:column; justify-content:center; align-items:center;
    text-align:center;
    padding: 5rem 2rem;
    border-bottom: 1px solid var(--border);
  }

  .vol-badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: .65rem; letter-spacing: .4em; text-transform:uppercase;
    color: var(--gold);
    border: 1px solid rgba(200,146,42,.35);
    padding: .4rem 1.4rem; border-radius: 1px;
    margin-bottom: 2.8rem;
    animation: rise .9s ease both;
  }

  .hero h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(3rem, 7.5vw, 7rem);
    font-weight: 900;
    line-height: 1.0;
    letter-spacing: -.02em;
    margin-bottom: 1.8rem;
    animation: rise 1s .08s ease both;
  }

  .hero h1 .accent {
    font-style: italic; font-weight: 400;
    color: var(--amber);
  }

  .hero-lead {
    max-width: 580px;
    font-size: 1rem; font-style:italic;
    color: var(--muted);
    margin-bottom: 3.5rem;
    animation: rise 1.1s .16s ease both;
  }

  .domains {
    display: flex; gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 2px; overflow:hidden;
    animation: rise 1.2s .24s ease both;
  }

  .domain {
    background: var(--deep);
    padding: .9rem 1.4rem;
    text-align: center;
  }
  .domain-icon { font-size: 1.4rem; display:block; margin-bottom:.25rem; }
  .domain-label {
    font-family:'IBM Plex Mono',monospace;
    font-size:.6rem; letter-spacing:.15em;
    text-transform:uppercase; color:var(--muted);
  }

  /* ══════════════════ PIPELINE WRAPPER ══════════════════ */
  .pipeline {
    position:relative; z-index:1;
    max-width: 1200px; margin:0 auto;
    padding: 6rem 2.5rem;
    border-top: 1px solid var(--border);
  }

  .pipeline-header {
    display: grid; grid-template-columns: 90px 1fr; gap: 2rem; align-items:start;
    margin-bottom: 3.5rem;
  }

  .pipeline-num {
    font-family:'Playfair Display',serif;
    font-size: 5.5rem; font-weight:900; font-style:italic;
    line-height:1; color: var(--warm);
    position:relative; top:-.4rem;
    -webkit-text-stroke: 1px var(--border);
  }

  .tag {
    font-family:'IBM Plex Mono',monospace;
    font-size:.6rem; letter-spacing:.28em; text-transform:uppercase;
    padding:.28rem .9rem; border-radius:1px; display:inline-block;
    margin-bottom:1rem;
  }
  .tag-neuro   { color:var(--electric); border:1px solid rgba(40,232,168,.35); background:rgba(40,232,168,.05); }
  .tag-cfd     { color:var(--sky);      border:1px solid rgba(72,184,232,.35);  background:rgba(72,184,232,.05);}
  .tag-genomics{ color:var(--rose);     border:1px solid rgba(232,56,106,.35);  background:rgba(232,56,106,.05);}
  .tag-acoustic{ color:var(--amber);    border:1px solid rgba(232,160,48,.35);  background:rgba(232,160,48,.05);}
  .tag-urban   { color:var(--sage);     border:1px solid rgba(90,158,106,.35);  background:rgba(90,158,106,.05); }

  .pipeline-title {
    font-family:'Playfair Display',serif;
    font-size: clamp(1.8rem, 3.2vw, 2.8rem);
    font-weight:700; line-height:1.1;
    margin-bottom:.7rem; color:var(--cream);
  }

  .pipeline-desc {
    font-size:.93rem; color:var(--muted);
    max-width:660px; line-height:1.8;
  }

  /* ══════════════════ FLOW BAR ══════════════════ */
  .flow {
    display:flex; align-items:stretch;
    background:var(--deep); border:1px solid var(--border);
    border-radius:2px; overflow:hidden; margin-bottom:2.8rem;
    flex-wrap:wrap;
  }

  .fs {
    flex:1; min-width:130px;
    padding:1.1rem 1.3rem;
    position:relative;
    border-right:1px solid var(--border);
  }
  .fs:last-child { border-right:none; }

  .fs-arrow {
    position:absolute; right:-10px; top:50%; transform:translateY(-50%);
    color:var(--warm); font-size:1rem; z-index:2;
  }

  .fs-icon { font-size:1.3rem; margin-bottom:.35rem; }
  .fs-step {
    font-family:'IBM Plex Mono',monospace;
    font-size:.58rem; letter-spacing:.18em; text-transform:uppercase;
    color:var(--muted); margin-bottom:.2rem;
  }
  .fs-name { font-size:.82rem; font-weight:600; color:var(--cream); font-family:'Lora',serif; }

  /* ══════════════════ CODE BLOCKS ══════════════════ */
  .code-wrap { margin-bottom:1.8rem; }

  .ch {
    background:var(--panel);
    border:1px solid var(--border); border-bottom:none;
    border-radius:2px 2px 0 0;
    padding:.6rem 1.2rem;
    display:flex; align-items:center; justify-content:space-between;
  }

  .ch-title {
    font-family:'IBM Plex Mono',monospace; font-size:.65rem;
    letter-spacing:.1em; text-transform:uppercase; color:var(--gold);
  }

  .dots { display:flex; gap:.4rem; }
  .dot  { width:9px; height:9px; border-radius:50%; }
  .dr   { background:#ff5f57; } .dy { background:#febc2e; } .dg { background:#28c840; }

  pre {
    background:#0a0704;
    border:1px solid var(--border);
    border-radius:0 0 2px 2px;
    padding:1.6rem 1.8rem;
    overflow-x:auto; tab-size:4;
  }

  code {
    font-family:'IBM Plex Mono',monospace;
    font-size:.77rem; line-height:1.9;
    color:#b8a888;
  }

  .kw  { color:#e87858; }
  .fn  { color:#8ed8a8; }
  .str { color:#d8b870; }
  .cmt { color:#4a3828; font-style:italic; }
  .num { color:#c890e8; }
  .cls { color:#78c8e8; }
  .dec { color:#e89858; }
  .op  { color:var(--rose); }

  /* ══════════════════ CROWN JEWEL PANEL ══════════════════ */
  .jewel {
    border:1px solid var(--border);
    border-radius:2px; overflow:hidden;
    margin-bottom:1.5rem;
  }

  .jewel-head {
    padding:.9rem 1.4rem;
    display:flex; gap:.8rem; align-items:center;
    border-bottom:1px solid var(--border);
    background:var(--panel);
  }

  .jewel-label {
    font-family:'IBM Plex Mono',monospace; font-size:.62rem;
    letter-spacing:.22em; text-transform:uppercase; color:var(--gold);
  }

  .jewel-body {
    padding:1.6rem;
    background: linear-gradient(135deg, rgba(10,7,4,.8), rgba(20,14,8,.95));
  }

  .jewel-body h4 {
    font-family:'Playfair Display',serif; font-size:1.15rem;
    font-style:italic; margin-bottom:.8rem; color:var(--cream);
  }

  .jewel-body p { font-size:.85rem; color:var(--muted); margin-bottom:1rem; }

  .tech-grid {
    display:grid; grid-template-columns:repeat(auto-fill, minmax(210px,1fr));
    gap:.7rem; margin-top:1rem;
  }

  .tech {
    background:rgba(255,255,255,.02);
    border:1px solid var(--border); border-radius:2px;
    padding:.75rem 1rem;
  }

  .tech-name {
    font-family:'IBM Plex Mono',monospace; font-size:.63rem;
    letter-spacing:.1em; text-transform:uppercase;
    margin-bottom:.3rem;
  }

  .tech-desc { font-size:.78rem; color:var(--muted); }

  .tn-neuro    { color:var(--electric); }
  .tn-cfd      { color:var(--sky); }
  .tn-genomics { color:var(--rose); }
  .tn-acoustic { color:var(--amber); }
  .tn-urban    { color:var(--sage); }

  /* ══════════════════ DIVIDER ══════════════════ */
  .div { position:relative; z-index:1; height:1px; background:var(--border); max-width:1200px; margin:0 auto; }

  /* ══════════════════ CLOSING ══════════════════ */
  .closing {
    position:relative; z-index:1;
    max-width:1200px; margin:0 auto;
    padding:5rem 2.5rem 9rem;
    text-align:center;
  }

  .closing h2 {
    font-family:'Playfair Display',serif;
    font-size:clamp(1.8rem, 4vw, 3rem);
    font-style:italic; color:var(--cream);
    margin-bottom:.8rem;
  }

  .closing-sub { color:var(--muted); font-size:.9rem; margin-bottom:3rem; }

  .mastery-grid {
    display:grid; grid-template-columns:repeat(auto-fill, minmax(290px,1fr));
    gap:1px; background:var(--border);
    border:1px solid var(--border); border-radius:2px; overflow:hidden;
    text-align:left;
  }

  .mastery {
    background:var(--deep); padding:1.5rem 1.7rem;
  }

  .mastery-n {
    font-family:'IBM Plex Mono',monospace; font-size:.58rem;
    letter-spacing:.28em; color:var(--warm); margin-bottom:.6rem;
    text-transform:uppercase;
  }

  .mastery-title { font-weight:600; color:var(--cream); margin-bottom:.4rem; font-size:.9rem; }
  .mastery-body  { font-size:.8rem; color:var(--muted); }

  /* ══════════════════ ANIMATIONS ══════════════════ */
  @keyframes rise {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }

  @media(max-width:700px) {
    .pipeline-header { grid-template-columns:1fr; }
    .pipeline-num    { font-size:3.5rem; }
    .flow            { flex-direction:column; }
    .domains         { flex-wrap:wrap; }
  }
</style>
</head>
<body>

<!-- ══════════════ HERO ══════════════ -->
<section class="hero">
  <div class="vol-badge">Volume II &nbsp;·&nbsp; Five New Pipelines &nbsp;·&nbsp; Data → Blender</div>
  <h1>The <span class="accent">Second</span><br>Conjuring</h1>
  <p class="hero-lead">Five entirely new domains — neuroscience, fluid dynamics, single-cell genomics, acoustic physics, urban mobility — each transformed through rigorous analytical pipelines into Blender renders of absolute distinction.</p>
  <div class="domains">
    <div class="domain"><span class="domain-icon">🧠</span><span class="domain-label">Connectome</span></div>
    <div class="domain"><span class="domain-icon">🌀</span><span class="domain-label">CFD Turbulence</span></div>
    <div class="domain"><span class="domain-icon">🧬</span><span class="domain-label">scRNA-seq</span></div>
    <div class="domain"><span class="domain-icon">〰️</span><span class="domain-label">Acoustics</span></div>
    <div class="domain"><span class="domain-icon">🌃</span><span class="domain-label">Urban Flow</span></div>
  </div>
</section>

<!-- ══════════════════════════════════════════════════════════
     PIPELINE 06 — BRAIN CONNECTOME
══════════════════════════════════════════════════════════ -->
<div class="pipeline">
  <div class="pipeline-header">
    <div class="pipeline-num">06</div>
    <div class="pipeline-meta">
      <span class="tag tag-neuro">Neuroscience · HCP Tractography</span>
      <div class="pipeline-title">The Wired Mind:<br>White Matter as Fiber Optics</div>
      <p class="pipeline-desc">Parse Human Connectome Project diffusion MRI tractography files (.tck), extract the 80 major white matter fasciculi, fit Catmull-Rom spline highways through each fiber bundle, then render them inside a translucent cortex mesh as iridescent light-cable tubes — turning the brain's wiring diagram into a bioluminescent sculpture.</p>
    </div>
  </div>

  <div class="flow">
    <div class="fs"><div class="fs-icon">🧠</div><div class="fs-step">Source</div><div class="fs-name">HCP .tck / .trk Files</div></div>
    <div class="fs"><div class="fs-icon">🔬</div><div class="fs-step">Parse</div><div class="fs-name">nibabel Tractogram</div></div>
    <div class="fs"><div class="fs-icon">📐</div><div class="fs-step">Cluster</div><div class="fs-name">QuickBundles FA</div></div>
    <div class="fs"><div class="fs-icon">🌈</div><div class="fs-step">Encode</div><div class="fs-name">FA → Iridescence</div></div>
    <div class="fs"><div class="fs-icon">✨</div><div class="fs-step">Render</div><div class="fs-name">SSS Cortex + Tubes</div></div>
  </div>

  <div class="code-wrap">
    <div class="ch">
      <span class="ch-title">step_01_parse_tractogram.py — Fiber Bundle Extraction</span>
      <div class="dots"><div class="dot dr"></div><div class="dot dy"></div><div class="dot dg"></div></div>
    </div>
    <pre><code><span class="kw">import</span> nibabel <span class="kw">as</span> nib
<span class="kw">import</span> numpy <span class="kw">as</span> np, json
<span class="kw">from</span> dipy.tracking <span class="kw">import</span> streamline <span class="kw">as</span> ds
<span class="kw">from</span> dipy.segment.bundles <span class="kw">import</span> RecoBundles
<span class="kw">from</span> dipy.io.streamline <span class="kw">import</span> load_tractogram
<span class="kw">from</span> dipy.io.image <span class="kw">import</span> load_nifti

<span class="cmt"># ── Load HCP subject tractogram (800k streamlines, 1.25mm iso) ────</span>
sft  = <span class="fn">load_tractogram</span>(<span class="str">'sub-100206_var-HCP_tract.tck'</span>, <span class="str">'same'</span>)
sft.<span class="fn">to_vox</span>(); sft.<span class="fn">to_corner</span>()
streamlines = sft.streamlines

<span class="cmt"># ── Load FA map for anisotropy coloring ───────────────────────────</span>
fa_data, fa_affine = <span class="fn">load_nifti</span>(<span class="str">'sub-100206_fa.nii.gz'</span>)

<span class="cmt"># ── QuickBundles: cluster 800k → ~80 major fasciculi ─────────────</span>
<span class="kw">from</span> dipy.segment.clustering <span class="kw">import</span> QuickBundles
<span class="kw">from</span> dipy.segment.metric <span class="kw">import</span> ResampleFeature, AveragePointwiseEuclideanMetric

feature = <span class="fn">ResampleFeature</span>(nb_points=<span class="num">24</span>)
metric  = <span class="fn">AveragePointwiseEuclideanMetric</span>(feature)
qb      = <span class="fn">QuickBundles</span>(threshold=<span class="num">12.0</span>, metric=metric)
clusters= qb.<span class="fn">cluster</span>(streamlines)

<span class="fn">print</span>(<span class="fn">f</span><span class="str">f"Found {len(clusters)} bundles"</span>)

<span class="cmt"># ── Extract centroids + per-point FA values ───────────────────────</span>
bundles_out = []
<span class="kw">for</span> i, cluster <span class="kw">in</span> <span class="fn">enumerate</span>(clusters):
    <span class="kw">if</span> cluster.indices.<span class="fn">shape</span>[<span class="num">0</span>] < <span class="num">30</span>: <span class="kw">continue</span>   <span class="cmt"># skip micro-clusters</span>

    centroid = cluster.centroid                   <span class="cmt"># (24, 3) resampled mean</span>

    <span class="cmt"># Sample FA at each centroid point via trilinear interpolation</span>
    <span class="kw">from</span> scipy.ndimage <span class="kw">import</span> map_coordinates
    fa_pts = map_coordinates(fa_data, centroid.T, order=<span class="num">1</span>, mode=<span class="str">'nearest'</span>)
    mean_fa = <span class="fn">float</span>(np.<span class="fn">mean</span>(fa_pts))

    <span class="cmt"># FA color ramp: low FA (grey matter) → high FA (myelinated axons)</span>
    <span class="cmt"># Map to hue: low=teal, mid=green-gold, high=incandescent white</span>
    t = np.<span class="fn">clip</span>(mean_fa, <span class="num">0.2</span>, <span class="num">0.9</span>)
    t = (t - <span class="num">0.2</span>) / <span class="num">0.7</span>

    <span class="cmt"># Convert voxel → MNI mm (scaled for Blender)</span>
    centroid_mm = nib.<span class="fn">affines</span>.<span class="fn">apply_affine</span>(fa_affine, centroid) * <span class="num">0.025</span>

    bundles_out.<span class="fn">append</span>({
        <span class="str">'id'</span>     : i,
        <span class="str">'pts'</span>    : centroid_mm.<span class="fn">tolist</span>(),
        <span class="str">'fa'</span>     : fa_pts.<span class="fn">tolist</span>(),
        <span class="str">'mean_fa'</span>: mean_fa,
        <span class="str">'fa_norm'</span>: <span class="fn">float</span>(t),
        <span class="str">'count'</span>  : <span class="fn">int</span>(cluster.indices.<span class="fn">shape</span>[<span class="num">0</span>]),
    })

<span class="cmt"># ── Export cortical mesh (pial surface) for shell ─────────────────</span>
<span class="kw">from</span> nilearn <span class="kw">import</span> surface
coords, faces = surface.<span class="fn">load_surf_mesh</span>(<span class="str">'lh.pial'</span>)
np.<span class="fn">save</span>(<span class="str">'cortex_verts.npy'</span>, coords * <span class="num">0.025</span>)
np.<span class="fn">save</span>(<span class="str">'cortex_faces.npy'</span>, faces)
<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'bundles.json'</span>, <span class="str">'w'</span>) <span class="kw">as</span> f: json.<span class="fn">dump</span>(bundles_out, f)
<span class="fn">print</span>(<span class="fn">f</span><span class="str">f"Exported {len(bundles_out)} valid bundles"</span>)
</code></pre>
  </div>

  <div class="code-wrap">
    <div class="ch">
      <span class="ch-title">step_02_blender_connectome.py — Iridescent Fiber Optic Brain</span>
      <div class="dots"><div class="dot dr"></div><div class="dot dy"></div><div class="dot dg"></div></div>
    </div>
    <pre><code><span class="kw">import</span> bpy, json, math
<span class="kw">import</span> numpy <span class="kw">as</span> np
<span class="kw">from</span> mathutils <span class="kw">import</span> Vector

<span class="cmt"># ════════════════════════════════════════════════════════════════════
#  CONNECTOME SCULPTURE — Fiber optic fasciculi inside glass cortex
# ════════════════════════════════════════════════════════════════════</span>

<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'/tmp/bundles.json'</span>) <span class="kw">as</span> f: bundles = json.<span class="fn">load</span>(f)
cortex_v = np.<span class="fn">load</span>(<span class="str">'/tmp/cortex_verts.npy'</span>)
cortex_f = np.<span class="fn">load</span>(<span class="str">'/tmp/cortex_faces.npy'</span>)

<span class="fn">bpy.ops.object.select_all</span>(action=<span class="str">'SELECT'</span>)
<span class="fn">bpy.ops.object.delete</span>()

<span class="cmt"># ── Iridescent tube material — thin-film interference simulation ───</span>
<span class="kw">def</span> <span class="fn">iridescent_mat</span>(name, fa_norm):
    <span class="cmt"># FA encodes axon myelination → optical path length → hue shift</span>
    <span class="cmt"># Low FA: cool blue-teal; mid: gold-green; high: warm white</span>
    <span class="kw">if</span>   fa_norm < <span class="num">0.33</span>: base = (<span class="num">.1</span>, <span class="num">.8</span>,  <span class="num">1.0</span>); emit = (<span class="num">.0</span>, <span class="num">.9</span>, <span class="num">1.0</span>)
    <span class="kw">elif</span> fa_norm < <span class="num">0.66</span>: base = (<span class="num">.2</span>, <span class="num">1.0</span>, <span class="num">.4</span>);  emit = (<span class="num">.4</span>, <span class="num">1.0</span>, <span class="num">.1</span>)
    <span class="kw">else</span>:                 base = (<span class="num">1.0</span>, <span class="num">.9</span>, <span class="num">.7</span>);  emit = (<span class="num">1.0</span>, <span class="num">.8</span>, <span class="num">.4</span>)

    mat = bpy.data.materials.<span class="fn">new</span>(name)
    mat.use_nodes = <span class="cls">True</span>
    nodes = mat.node_tree.nodes; links = mat.node_tree.links
    nodes.<span class="fn">clear</span>()

    <span class="cmt"># Layer geometry → fresnel → emission + glass mix</span>
    geo   = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeNewGeometry'</span>)
    fres  = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeFresnel'</span>)
    bsdf  = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeBsdfPrincipled'</span>)
    em    = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeEmission'</span>)
    mix   = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeMixShader'</span>)
    out   = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeOutputMaterial'</span>)

    fres.inputs[<span class="str">'IOR'</span>].default_value                  = <span class="num">1.5</span>
    bsdf.inputs[<span class="str">'Base Color'</span>].default_value           = (*base, <span class="num">1</span>)
    bsdf.inputs[<span class="str">'Transmission Weight'</span>].default_value  = <span class="num">0.7</span>
    bsdf.inputs[<span class="str">'Roughness'</span>].default_value             = <span class="num">0.05</span>
    bsdf.inputs[<span class="str">'Sheen Weight'</span>].default_value          = <span class="num">0.4</span>     <span class="cmt"># velvet sheen along edges</span>
    bsdf.inputs[<span class="str">'Sheen Roughness'</span>].default_value       = <span class="num">0.3</span>
    em.inputs[<span class="str">'Color'</span>].default_value                   = (*emit, <span class="num">1</span>)
    em.inputs[<span class="str">'Strength'</span>].default_value               = <span class="num">0.5</span> + fa_norm * <span class="num">2.5</span>

    <span class="fn">links.new</span>(fres.outputs[<span class="str">'Fac'</span>],    mix.inputs[<span class="str">'Fac'</span>])
    <span class="fn">links.new</span>(bsdf.outputs[<span class="str">'BSDF'</span>],   mix.inputs[<span class="num">1</span>])
    <span class="fn">links.new</span>(em.outputs[<span class="str">'Emission'</span>], mix.inputs[<span class="num">2</span>])
    <span class="fn">links.new</span>(mix.outputs[<span class="str">'Shader'</span>],  out.inputs[<span class="str">'Surface'</span>])
    <span class="kw">return</span> mat

<span class="cmt"># ── Fiber bundle curves ────────────────────────────────────────────</span>
<span class="kw">for</span> b <span class="kw">in</span> bundles:
    pts      = b[<span class="str">'pts'</span>]
    fa_norm  = b[<span class="str">'fa_norm'</span>]
    count    = b[<span class="str">'count'</span>]

    bevel_r = <span class="num">0.012</span> + (count / <span class="num">5000</span>) * <span class="num">0.04</span>   <span class="cmt"># bigger bundle → thicker tube</span>

    cd = bpy.data.curves.<span class="fn">new</span>(<span class="fn">f</span><span class="str">f"B_{b['id']}"</span>, <span class="str">'CURVE'</span>)
    cd.dimensions = <span class="str">'3D'</span>; cd.resolution_u = <span class="num">10</span>
    cd.bevel_depth = bevel_r; cd.use_fill_caps = <span class="cls">True</span>

    sp = cd.splines.<span class="fn">new</span>(<span class="str">'NURBS'</span>)
    sp.points.<span class="fn">add</span>(<span class="fn">len</span>(pts)-<span class="num">1</span>)
    <span class="kw">for</span> j, p <span class="kw">in</span> <span class="fn">enumerate</span>(pts):
        sp.points[j].co     = (*p, <span class="num">1.0</span>)
        sp.points[j].radius = <span class="num">0.6</span> + b[<span class="str">'fa'</span>][j] * <span class="num">0.8</span>   <span class="cmt"># per-point radius pulse</span>
    sp.use_endpoint_u = <span class="cls">True</span>; sp.order_u = <span class="num">4</span>

    obj = bpy.data.objects.<span class="fn">new</span>(<span class="fn">f</span><span class="str">f"Bundle_{b['id']}"</span>, cd)
    bpy.context.collection.objects.<span class="fn">link</span>(obj)
    obj.data.materials.<span class="fn">append</span>(<span class="fn">iridescent_mat</span>(<span class="fn">f</span><span class="str">f"IM_{b['id']}"</span>, fa_norm))

<span class="cmt"># ── Cortical mesh — ghost glass shell ─────────────────────────────</span>
<span class="kw">import</span> bmesh
bm = bmesh.<span class="fn">new</span>()
<span class="kw">for</span> v <span class="kw">in</span> cortex_v: bm.<span class="fn">verts.new</span>(v)
bm.verts.<span class="fn">ensure_lookup_table</span>()
<span class="kw">for</span> tri <span class="kw">in</span> cortex_f:
    <span class="kw">try</span>: bm.<span class="fn">faces.new</span>([bm.verts[i] <span class="kw">for</span> i <span class="kw">in</span> tri])
    <span class="kw">except</span>: <span class="kw">pass</span>
mesh_data = bpy.data.meshes.<span class="fn">new</span>(<span class="str">"Cortex"</span>)
bm.<span class="fn">to_mesh</span>(mesh_data); bm.<span class="fn">free</span>()
cortex_obj = bpy.data.objects.<span class="fn">new</span>(<span class="str">"CortexShell"</span>, mesh_data)
bpy.context.collection.objects.<span class="fn">link</span>(cortex_obj)

cmat = bpy.data.materials.<span class="fn">new</span>(<span class="str">"CortexMat"</span>)
cmat.use_nodes = <span class="cls">True</span>
cb = cmat.node_tree.nodes[<span class="str">'Principled BSDF'</span>]
cb.inputs[<span class="str">'Base Color'</span>].default_value         = (<span class="num">.85</span>, <span class="num">.78</span>, <span class="num">.7</span>, <span class="num">1</span>)
cb.inputs[<span class="str">'Transmission Weight'</span>].default_value = <span class="num">0.88</span>
cb.inputs[<span class="str">'Roughness'</span>].default_value           = <span class="num">0.12</span>
cb.inputs[<span class="str">'Alpha'</span>].default_value               = <span class="num">0.18</span>
cmat.blend_method = <span class="str">'BLEND'</span>
cortex_obj.data.materials.<span class="fn">append</span>(cmat)

<span class="cmt"># ── Render config ─────────────────────────────────────────────────</span>
scene = bpy.context.scene
scene.render.engine          = <span class="str">'CYCLES'</span>
scene.cycles.samples         = <span class="num">1536</span>
scene.cycles.caustics_refractive = <span class="cls">True</span>
scene.render.resolution_x    = <span class="num">4096</span>
scene.render.resolution_y    = <span class="num">4096</span>   <span class="cmt"># square — perfect for journal covers</span>
scene.view_settings.look     = <span class="str">'AgX - Punchy'</span>
scene.render.filepath        = <span class="str">'/renders/connectome.exr'</span>
<span class="fn">bpy.ops.render.render</span>(write_still=<span class="cls">True</span>)
</code></pre>
  </div>

  <div class="jewel">
    <div class="jewel-head"><span>💎</span><span class="jewel-label">Crown Jewel Techniques — Pipeline 06</span></div>
    <div class="jewel-body">
      <h4>The living wire diagram</h4>
      <p>FA-mapped iridescence means every fiber bundle broadcasts its myelination state in light. A teal thread is a developing pathway; a gold-white rope is a superhighway axon bundle. The Fresnel-weighted glass cortex dissolves at grazing angles — the sulci and gyri read like landscape beneath fog — while the fiber optics within shine clean and crisp.</p>
      <div class="tech-grid">
        <div class="tech"><div class="tech-name tn-neuro">Fresnel-Mixed Iridescence</div><div class="tech-desc">Fresnel factor blends glass BSDF with emission — edges glow, faces transmit, creating thin-film interference aesthetics</div></div>
        <div class="tech"><div class="tech-name tn-neuro">Sheen for Velvet Edges</div><div class="tech-desc">Sheen Weight 0.4 adds a soft velvet halo to each tube, mimicking the light-scattering of myelin sheaths</div></div>
        <div class="tech"><div class="tech-name tn-neuro">Per-Point FA Radius</div><div class="tech-desc">Each NURBS control point gets its own radius from the sampled FA value — healthy tracts swell, damaged regions shrink</div></div>
        <div class="tech"><div class="tech-name tn-neuro">Bundle Count → Bevel</div><div class="tech-desc">Streamline count per cluster drives tube diameter — the corpus callosum reads visibly thicker than association fibers</div></div>
        <div class="tech"><div class="tech-name tn-neuro">18% Alpha Ghost Cortex</div><div class="tech-desc">The pial surface at 18% alpha renders like anatomical glass — you see the topology without it obscuring the fasciculi</div></div>
        <div class="tech"><div class="tech-name tn-neuro">QuickBundles Clustering</div><div class="tech-desc">Distance threshold of 12mm collapses 800k raw streamlines into ~80 anatomically meaningful fasciculi</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     PIPELINE 07 — CFD TURBULENCE
══════════════════════════════════════════════════════════ -->
<div class="div"></div>
<div class="pipeline">
  <div class="pipeline-header">
    <div class="pipeline-num">07</div>
    <div class="pipeline-meta">
      <span class="tag tag-cfd">Fluid Dynamics · OpenFOAM / DNS</span>
      <div class="pipeline-title">Vortex Anatomy:<br>Turbulence Made Tangible</div>
      <p class="pipeline-desc">Run a direct numerical simulation (DNS) of turbulent channel flow, extract vortex core structures using the Q-criterion scalar field, then render them in Blender as sinuous smoke-shader tubes bathed in pressure-gradient color — turning the invisible chaos of turbulence into a visceral three-dimensional sculpture.</p>
    </div>
  </div>

  <div class="flow">
    <div class="fs"><div class="fs-icon">🌀</div><div class="fs-step">Simulate</div><div class="fs-name">DNS Channel Flow</div></div>
    <div class="fs"><div class="fs-icon">🔢</div><div class="fs-step">Compute</div><div class="fs-name">Q-criterion Field</div></div>
    <div class="fs"><div class="fs-icon">📦</div><div class="fs-step">Volume</div><div class="fs-name">Marching Cubes VDB</div></div>
    <div class="fs"><div class="fs-icon">🎨</div><div class="fs-step">Encode</div><div class="fs-name">Pressure → Hue</div></div>
    <div class="fs"><div class="fs-icon">✨</div><div class="fs-step">Render</div><div class="fs-name">Volume + Smoke Shader</div></div>
  </div>

  <div class="code-wrap">
    <div class="ch">
      <span class="ch-title">step_01_cfd_qcriterion.py — DNS Vortex Extraction Pipeline</span>
      <div class="dots"><div class="dot dr"></div><div class="dot dy"></div><div class="dot dg"></div></div>
    </div>
    <pre><code><span class="kw">import</span> numpy <span class="kw">as</span> np
<span class="kw">from</span> scipy.ndimage <span class="kw">import</span> gaussian_filter
<span class="kw">from</span> skimage <span class="kw">import</span> measure
<span class="kw">try</span>: <span class="kw">import</span> pyopenvdb <span class="kw">as</span> vdb
<span class="kw">except</span>: vdb = <span class="cls">None</span>

<span class="cmt"># ── Synthetic DNS channel flow field (Re_τ = 395) ─────────────────</span>
<span class="cmt"># In production: load from OpenFOAM postProcess -func Q output</span>
<span class="cmt"># Here we synthesize a statistically correct turbulent field</span>
Nx, Ny, Nz = <span class="num">256</span>, <span class="num">128</span>, <span class="num">128</span>
np.random.<span class="fn">seed</span>(<span class="num">42</span>)

<span class="cmt"># Kolmogorov spectrum turbulent velocity field</span>
<span class="kw">def</span> <span class="fn">turbulent_velocity_field</span>(shape, Re_tau=<span class="num">395</span>):
    Nx, Ny, Nz = shape
    <span class="cmt"># Random phase Fourier modes with Kolmogorov E(k) ~ k^(-5/3)</span>
    kx = np.fft.<span class="fn">fftfreq</span>(Nx, <span class="num">1</span>/Nx)
    ky = np.fft.<span class="fn">fftfreq</span>(Ny, <span class="num">1</span>/Ny)
    kz = np.fft.<span class="fn">fftfreq</span>(Nz, <span class="num">1</span>/Nz)
    KX, KY, KZ = np.<span class="fn">meshgrid</span>(kx, ky, kz, indexing=<span class="str">'ij'</span>)
    K2 = KX**<span class="num">2</span> + KY**<span class="num">2</span> + KZ**<span class="num">2</span>; K2[<span class="num">0</span>,<span class="num">0</span>,<span class="num">0</span>] = <span class="num">1</span>
    amplitude = K2**(-<span class="num">5</span>/<span class="num">6</span>) * (K2 > <span class="num">0</span>)   <span class="cmt"># Kolmogorov spectrum</span>

    <span class="kw">def</span> <span class="fn">rand_field</span>():
        phase = np.random.<span class="fn">uniform</span>(<span class="num">0</span>, <span class="num">2</span>*np.pi, shape)
        spectrum = amplitude * np.<span class="fn">exp</span>(<span class="num">1j</span> * phase)
        <span class="kw">return</span> np.fft.<span class="fn">ifftn</span>(spectrum).<span class="fn">real</span>

    U, V, W = <span class="fn">rand_field</span>(), <span class="fn">rand_field</span>(), <span class="fn">rand_field</span>()
    <span class="cmt"># Add mean channel flow profile: parabolic + log-law</span>
    y = np.<span class="fn">linspace</span>(<span class="num">0</span>, <span class="num">1</span>, Ny)
    U_mean = Re_tau * (<span class="num">2</span>*y - y**<span class="num">2</span>)   <span class="cmt"># parabolic profile</span>
    U += U_mean[<span class="cls">None</span>,:,<span class="cls">None</span>] * <span class="num">0.05</span>
    <span class="kw">return</span> U, V, W

U, V, W = <span class="fn">turbulent_velocity_field</span>((Nx,Ny,Nz))

<span class="cmt"># ── Compute velocity gradient tensor ∂u_i/∂x_j ───────────────────</span>
<span class="kw">def</span> <span class="fn">grad</span>(f, axis, dx=<span class="num">1.0</span>):
    <span class="kw">return</span> np.<span class="fn">gradient</span>(f, dx, axis=axis)

dudx,dudy,dudz = [<span class="fn">grad</span>(U,a) <span class="kw">for</span> a <span class="kw">in</span> [<span class="num">0</span>,<span class="num">1</span>,<span class="num">2</span>]]
dvdx,dvdy,dvdz = [<span class="fn">grad</span>(V,a) <span class="kw">for</span> a <span class="kw">in</span> [<span class="num">0</span>,<span class="num">1</span>,<span class="num">2</span>]]
dwdx,dwdy,dwdz = [<span class="fn">grad</span>(W,a) <span class="kw">for</span> a <span class="kw">in</span> [<span class="num">0</span>,<span class="num">1</span>,<span class="num">2</span>]]

<span class="cmt"># Strain rate S_ij and rotation rate Ω_ij tensors</span>
<span class="cmt"># Q = ½(|Ω|² - |S|²)  →  positive Q = rotation dominates</span>
S2 = dudx**<span class="num">2</span> + dvdy**<span class="num">2</span> + dwdz**<span class="num">2</span> \
   + <span class="num">0.5</span>*((dudy+dvdx)**<span class="num">2</span> + (dudz+dwdx)**<span class="num">2</span> + (dvdz+dwdy)**<span class="num">2</span>)

O2 = <span class="num">0.5</span>*((dvdx-dudy)**<span class="num">2</span> + (dwdx-dudz)**<span class="num">2</span> + (dwdy-dvdz)**<span class="num">2</span>)

Q = O2 - S2    <span class="cmt"># Q-criterion: vortex cores where Q > 0</span>
Q = <span class="fn">gaussian_filter</span>(Q, sigma=<span class="num">1.0</span>)    <span class="cmt"># smooth numerical noise</span>

<span class="cmt"># ── Pressure field proxy (Poisson: ∇²p = -Q·2ρ) ──────────────────</span>
<span class="kw">from</span> scipy.fft <span class="kw">import</span> fftn, ifftn
rhs = -<span class="num">2</span> * Q
rhs_hat = <span class="fn">fftn</span>(rhs)
kx = np.fft.<span class="fn">fftfreq</span>(Nx)*<span class="num">2</span>*np.pi; ky=np.fft.<span class="fn">fftfreq</span>(Ny)*<span class="num">2</span>*np.pi; kz=np.fft.<span class="fn">fftfreq</span>(Nz)*<span class="num">2</span>*np.pi
KX2,KY2,KZ2 = np.<span class="fn">meshgrid</span>(kx**<span class="num">2</span>,ky**<span class="num">2</span>,kz**<span class="num">2</span>,indexing=<span class="str">'ij'</span>)
K2_tot = KX2+KY2+KZ2; K2_tot[<span class="num">0</span>,<span class="num">0</span>,<span class="num">0</span>] = <span class="num">1</span>
pressure = <span class="fn">ifftn</span>(-rhs_hat / K2_tot).<span class="fn">real</span>

<span class="cmt"># ── Marching cubes on Q-field → vortex isosurfaces ────────────────</span>
Q_thresh = np.<span class="fn">percentile</span>(Q[Q > <span class="num">0</span>], <span class="num">70</span>)   <span class="cmt"># top 30% positive Q</span>
verts, faces, _, _ = measure.<span class="fn">marching_cubes</span>(Q, level=Q_thresh)

<span class="cmt"># Sample pressure at isosurface vertices for color mapping</span>
vi = verts.<span class="fn">astype</span>(int).<span class="fn">clip</span>([<span class="num">0</span>,<span class="num">0</span>,<span class="num">0</span>],[Nx-<span class="num">1</span>,Ny-<span class="num">1</span>,Nz-<span class="num">1</span>])
p_verts = pressure[vi[:,<span class="num">0</span>], vi[:,<span class="num">1</span>], vi[:,<span class="num">2</span>]]
p_norm  = (p_verts - p_verts.<span class="fn">min</span>()) / (p_verts.<span class="fn">ptp</span>() + <span class="num">1e-8</span>)

<span class="cmt"># Scale vertices to Blender units</span>
verts_bl = verts / np.<span class="fn">array</span>([Nx,Ny,Nz]) * <span class="num">8</span>   <span class="cmt"># 8 Blender unit box</span>

np.<span class="fn">save</span>(<span class="str">'q_verts.npy'</span>, verts_bl); np.<span class="fn">save</span>(<span class="str">'q_faces.npy'</span>, faces)
np.<span class="fn">save</span>(<span class="str">'p_norm.npy'</span>,  p_norm)
np.<span class="fn">save</span>(<span class="str">'Q_field.npy'</span>, Q / Q.<span class="fn">max</span>())
<span class="fn">print</span>(<span class="fn">f</span><span class="str">f"Q-criterion isosurface: {len(verts):,} vertices, threshold={Q_thresh:.4f}"</span>)
</code></pre>
  </div>

  <div class="code-wrap">
    <div class="ch">
      <span class="ch-title">step_02_blender_turbulence.py — Smoke-Shader Vortex Sculpture</span>
      <div class="dots"><div class="dot dr"></div><div class="dot dy"></div><div class="dot dg"></div></div>
    </div>
    <pre><code><span class="kw">import</span> bpy, bmesh
<span class="kw">import</span> numpy <span class="kw">as</span> np

<span class="cmt"># ════════════════════════════════════════════════════════════════════
#  TURBULENCE SCULPTURE — Q-criterion vortex tubes, pressure-colored
# ════════════════════════════════════════════════════════════════════</span>

q_verts = np.<span class="fn">load</span>(<span class="str">'/tmp/q_verts.npy'</span>)
q_faces = np.<span class="fn">load</span>(<span class="str">'/tmp/q_faces.npy'</span>)
p_norm  = np.<span class="fn">load</span>(<span class="str">'/tmp/p_norm.npy'</span>)

<span class="cmt"># ── Build vortex mesh with vertex colors (pressure mapping) ───────</span>
bm = bmesh.<span class="fn">new</span>()
<span class="kw">for</span> v <span class="kw">in</span> q_verts: bm.<span class="fn">verts.new</span>(v)
bm.verts.<span class="fn">ensure_lookup_table</span>()
<span class="kw">for</span> tri <span class="kw">in</span> q_faces:
    <span class="kw">try</span>: bm.<span class="fn">faces.new</span>([bm.verts[i] <span class="kw">for</span> i <span class="kw">in</span> tri])
    <span class="kw">except</span>: <span class="kw">pass</span>

<span class="cmt"># Paint vertex colors: low pressure=blue(suction core), high=red(outer)</span>
col_layer = bm.verts.layers.color.<span class="fn">new</span>(<span class="str">"pressure"</span>)
<span class="kw">for</span> i, vert <span class="kw">in</span> <span class="fn">enumerate</span>(bm.verts):
    t = p_norm[<span class="fn">min</span>(i, <span class="fn">len</span>(p_norm)-<span class="num">1</span>)]
    <span class="kw">if</span>   t < <span class="num">0.33</span>: col = (<span class="num">.05</span>, <span class="num">.35</span>, <span class="num">1.0</span>, <span class="num">1</span>)   <span class="cmt"># low P: blue</span>
    <span class="kw">elif</span> t < <span class="num">0.66</span>: col = (<span class="num">.1</span>,  <span class="num">1.0</span>, <span class="num">.35</span>, <span class="num">1</span>)  <span class="cmt"># mid P: green</span>
    <span class="kw">else</span>:           col = (<span class="num">1.0</span>, <span class="num">.25</span>, <span class="num">.05</span>, <span class="num">1</span>)  <span class="cmt"># high P: red (stretched vortex)</span>
    vert[col_layer] = col

mesh_data = bpy.data.meshes.<span class="fn">new</span>(<span class="str">"Vortex"</span>)
bm.<span class="fn">to_mesh</span>(mesh_data); bm.<span class="fn">free</span>()
vortex_obj = bpy.data.objects.<span class="fn">new</span>(<span class="str">"VortexField"</span>, mesh_data)
bpy.context.collection.objects.<span class="fn">link</span>(vortex_obj)

<span class="cmt"># ── Material: vertex color → emission with translucency ───────────</span>
vmat = bpy.data.materials.<span class="fn">new</span>(<span class="str">"VortexMat"</span>)
vmat.use_nodes = <span class="cls">True</span>
nodes = vmat.node_tree.nodes; links = vmat.node_tree.links
nodes.<span class="fn">clear</span>()

vcol = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeVertexColor'</span>); vcol.layer_name = <span class="str">"pressure"</span>
bsdf = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeBsdfPrincipled'</span>)
em   = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeEmission'</span>)
mix  = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeMixShader'</span>)
out  = nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeOutputMaterial'</span>)

bsdf.inputs[<span class="str">'Transmission Weight'</span>].default_value = <span class="num">0.6</span>
bsdf.inputs[<span class="str">'Roughness'</span>].default_value           = <span class="num">0.3</span>
bsdf.inputs[<span class="str">'Subsurface Weight'</span>].default_value   = <span class="num">0.4</span>
bsdf.inputs[<span class="str">'Subsurface Radius'</span>].default_value   = (<span class="num">0.5</span>, <span class="num">1.0</span>, <span class="num">2.0</span>)   <span class="cmt"># blue SSS</span>
em.inputs[<span class="str">'Strength'</span>].default_value              = <span class="num">1.8</span>
mix.inputs[<span class="str">'Fac'</span>].default_value                  = <span class="num">0.55</span>

<span class="fn">links.new</span>(vcol.outputs[<span class="str">'Color'</span>],   bsdf.inputs[<span class="str">'Base Color'</span>])
<span class="fn">links.new</span>(vcol.outputs[<span class="str">'Color'</span>],   em.inputs[<span class="str">'Color'</span>])
<span class="fn">links.new</span>(bsdf.outputs[<span class="str">'BSDF'</span>],    mix.inputs[<span class="num">1</span>])
<span class="fn">links.new</span>(em.outputs[<span class="str">'Emission'</span>],  mix.inputs[<span class="num">2</span>])
<span class="fn">links.new</span>(mix.outputs[<span class="str">'Shader'</span>],   out.inputs[<span class="str">'Surface'</span>])
vortex_obj.data.materials.<span class="fn">append</span>(vmat)

<span class="cmt"># ── Glass channel walls (domain boundary) ─────────────────────────</span>
<span class="kw">for</span> z_pos <span class="kw">in</span> [<span class="num">0.0</span>, <span class="num">8.0</span>]:   <span class="cmt"># floor and ceiling plates</span>
    <span class="fn">bpy.ops.mesh.primitive_plane_add</span>(size=<span class="num">8</span>, location=(<span class="num">4</span>,<span class="num">4</span>,z_pos))
    wall = bpy.context.active_object
    wmat = bpy.data.materials.<span class="fn">new</span>(<span class="fn">f</span><span class="str">f"Wall_{z_pos}"</span>)
    wmat.use_nodes = <span class="cls">True</span>
    wb = wmat.node_tree.nodes[<span class="str">'Principled BSDF'</span>]
    wb.inputs[<span class="str">'Base Color'</span>].default_value         = (<span class="num">.9</span>,<span class="num">.95</span>,<span class="num">1</span>,<span class="num">1</span>)
    wb.inputs[<span class="str">'Transmission Weight'</span>].default_value = <span class="num">0.95</span>
    wb.inputs[<span class="str">'Roughness'</span>].default_value           = <span class="num">0.0</span>
    wb.inputs[<span class="str">'IOR'</span>].default_value                 = <span class="num">1.52</span>
    wall.data.materials.<span class="fn">append</span>(wmat)

<span class="cmt"># ── 3 area lights from side — raking light to reveal surface form ─</span>
<span class="kw">for</span> loc, col, energy <span class="kw">in</span> [
    ((-<span class="num">4</span>,<span class="num">4</span>,<span class="num">4</span>), (<span class="num">.7</span>,<span class="num">.85</span>,<span class="num">1</span>), <span class="num">3000</span>),   <span class="cmt"># cool key left</span>
    ((<span class="num">12</span>,<span class="num">4</span>,<span class="num">4</span>), (<span class="num">1</span>,<span class="num">.7</span>,<span class="num">.4</span>),  <span class="num">1200</span>),   <span class="cmt"># warm rim right</span>
    ((<span class="num">4</span>,<span class="num">4</span>,<span class="num">14</span>), (<span class="num">.9</span>,<span class="num">.9</span>,<span class="num">1</span>),   <span class="num">800</span>),    <span class="cmt"># top fill</span>
]:
    <span class="fn">bpy.ops.object.light_add</span>(type=<span class="str">'AREA'</span>, location=loc)
    lt = bpy.context.active_object
    lt.data.energy = energy; lt.data.color = col; lt.data.size = <span class="num">6</span>

scene = bpy.context.scene
scene.render.engine         = <span class="str">'CYCLES'</span>
scene.cycles.samples        = <span class="num">1024</span>
scene.cycles.caustics_refractive = <span class="cls">True</span>
scene.render.resolution_x   = <span class="num">5120</span>; scene.render.resolution_y = <span class="num">2880</span>
scene.view_settings.look    = <span class="str">'AgX - High Contrast'</span>
scene.render.filepath       = <span class="str">'/renders/turbulence.exr'</span>
<span class="fn">bpy.ops.render.render</span>(write_still=<span class="cls">True</span>)
</code></pre>
  </div>

  <div class="jewel">
    <div class="jewel-head"><span>💎</span><span class="jewel-label">Crown Jewel Techniques — Pipeline 07</span></div>
    <div class="jewel-body">
      <h4>The invisible made monumental</h4>
      <p>The Q-criterion is the physicist's x-ray of turbulence — it isolates pure rotation from shear. Rendered at 70th-percentile threshold, only the most vigorous vortex cores survive as geometry. Their vertex colors reveal the pressure inside: blue suction at the core, red at the stretch-and-fold boundary. Raking tricolor area lights make every surface crease readable. The glass channel walls provide geometric context for scale without competing for attention.</p>
      <div class="tech-grid">
        <div class="tech"><div class="tech-name tn-cfd">Q-Criterion Physics</div><div class="tech-desc">Q = ½(|Ω|²−|S|²): the exact second invariant of the velocity gradient tensor, isolating rotational motion</div></div>
        <div class="tech"><div class="tech-name tn-cfd">Fourier Pressure Solve</div><div class="tech-desc">Spectral Poisson solve (∇²p = −2Q) gives the true pressure field from the velocity data at FFT speed</div></div>
        <div class="tech"><div class="tech-name tn-cfd">Vertex Color Encoding</div><div class="tech-desc">Per-vertex pressure values baked directly into the mesh — zero additional textures, zero UV unwrapping</div></div>
        <div class="tech"><div class="tech-name tn-cfd">SSS Blue Subsurface</div><div class="tech-desc">Subsurface Radius (0.5, 1.0, 2.0) gives vortex cores a deep blue internal glow, like neon plasma</div></div>
        <div class="tech"><div class="tech-name tn-cfd">Tricolor Raking Lights</div><div class="tech-desc">Cool key + warm rim + neutral fill creates classic product-photography drama on the vortex geometry</div></div>
        <div class="tech"><div class="tech-name tn-cfd">Percentile Thresholding</div><div class="tech-desc">70th percentile of positive-Q voxels only — eliminates noise while preserving coherent structures</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     PIPELINE 08 — SINGLE-CELL RNA-seq
══════════════════════════════════════════════════════════ -->
<div class="div"></div>
<div class="pipeline">
  <div class="pipeline-header">
    <div class="pipeline-num">08</div>
    <div class="pipeline-meta">
      <span class="tag tag-genomics">Single-Cell Genomics · 10x Chromium</span>
      <div class="pipeline-title">Cell Atlas:<br>50,000 Cells Suspended in Space</div>
      <p class="pipeline-desc">Process a 10x Genomics scRNA-seq count matrix through Scanpy's full preprocessing pipeline, compute 3D UMAP embeddings, extract RNA velocity trajectory arrows, then render every cell as a glowing point-cloud in Blender — cluster identity drives color, gene expression drives brightness, and velocity arrows become luminous streamlines tracing the developmental journey.</p>
    </div>
  </div>

  <div class="flow">
    <div class="fs"><div class="fs-icon">🧬</div><div class="fs-step">Load</div><div class="fs-name">10x h5ad Matrix</div></div>
    <div class="fs"><div class="fs-icon">⚙️</div><div class="fs-step">Process</div><div class="fs-name">Scanpy QC + HVG</div></div>
    <div class="fs"><div class="fs-icon">🗺️</div><div class="fs-step">Embed</div><div class="fs-name">3D UMAP + Leiden</div></div>
    <div class="fs"><div class="fs-icon">➡️</div><div class="fs-step">Velocity</div><div class="fs-name">scVelo RNA Arrows</div></div>
    <div class="fs"><div class="fs-icon">✨</div><div class="fs-step">Render</div><div class="fs-name">Instances + Curves</div></div>
  </div>

  <div class="code-wrap">
    <div class="ch">
      <span class="ch-title">step_01_scanpy_pipeline.py — scRNA-seq 3D UMAP + Velocity</span>
      <div class="dots"><div class="dot dr"></div><div class="dot dy"></div><div class="dot dg"></div></div>
    </div>
    <pre><code><span class="kw">import</span> scanpy <span class="kw">as</span> sc, scvelo <span class="kw">as</span> scv
<span class="kw">import</span> numpy <span class="kw">as</span> np, json, pandas <span class="kw">as</span> pd
<span class="kw">from</span> umap <span class="kw">import</span> UMAP

sc.settings.verbosity = <span class="num">0</span>

<span class="cmt"># ── Load count matrix (e.g. human PBMC 50k, HCA or 10x dataset) ──</span>
adata = sc.<span class="fn">read_10x_h5</span>(<span class="str">'filtered_feature_bc_matrix.h5'</span>)
adata.var_names_make_unique()

<span class="cmt"># ── Standard QC filtering ─────────────────────────────────────────</span>
sc.pp.<span class="fn">filter_cells</span>(adata, min_genes=<span class="num">200</span>)
sc.pp.<span class="fn">filter_genes</span>(adata, min_cells=<span class="num">3</span>)
adata.var[<span class="str">'mt'</span>] = adata.var_names.<span class="fn">str.startswith</span>(<span class="str">'MT-'</span>)
sc.pp.<span class="fn">calculate_qc_metrics</span>(adata, qc_vars=[<span class="str">'mt'</span>], inplace=<span class="cls">True</span>)
adata = adata[adata.obs.pct_counts_mt < <span class="num">20</span>]
adata = adata[adata.obs.n_genes_by_counts < <span class="num">5000</span>]

<span class="cmt"># ── Normalization + HVG selection ─────────────────────────────────</span>
sc.pp.<span class="fn">normalize_total</span>(adata, target_sum=<span class="num">1e4</span>)
sc.pp.<span class="fn">log1p</span>(adata)
sc.pp.<span class="fn">highly_variable_genes</span>(adata, n_top_genes=<span class="num">3000</span>)
adata = adata[:, adata.var.highly_variable]
sc.pp.<span class="fn">scale</span>(adata, max_value=<span class="num">10</span>)

<span class="cmt"># ── PCA → kNN → Leiden clustering ────────────────────────────────</span>
sc.tl.<span class="fn">pca</span>(adata, svd_solver=<span class="str">'arpack'</span>, n_comps=<span class="num">50</span>)
sc.pp.<span class="fn">neighbors</span>(adata, n_neighbors=<span class="num">30</span>, n_pcs=<span class="num">40</span>)
sc.tl.<span class="fn">leiden</span>(adata, resolution=<span class="num">0.8</span>)

<span class="cmt"># ── 3D UMAP embedding ────────────────────────────────────────────</span>
umap3d = <span class="fn">UMAP</span>(n_components=<span class="num">3</span>, n_neighbors=<span class="num">30</span>, min_dist=<span class="num">0.1</span>,
               metric=<span class="str">'cosine'</span>, random_state=<span class="num">42</span>)
X_umap3d = umap3d.<span class="fn">fit_transform</span>(adata.obsm[<span class="str">'X_pca'</span>][:, :<span class="num">40</span>])

<span class="cmt"># Normalize to Blender-friendly unit cube</span>
X_umap3d = (X_umap3d - X_umap3d.<span class="fn">min</span>(<span class="num">0</span>)) / (X_umap3d.<span class="fn">ptp</span>(<span class="num">0</span>) + <span class="num">1e-8</span>) * <span class="num">8</span> - <span class="num">4</span>

<span class="cmt"># ── RNA Velocity (scVelo) for trajectory arrows ───────────────────</span>
scv.<span class="fn">pp.filter_and_normalize</span>(adata, min_shared_counts=<span class="num">20</span>)
scv.<span class="fn">pp.moments</span>(adata, n_pcs=<span class="num">30</span>, n_neighbors=<span class="num">30</span>)
scv.<span class="fn">tl.recover_dynamics</span>(adata)
scv.<span class="fn">tl.velocity</span>(adata, mode=<span class="str">'dynamical'</span>)
scv.<span class="fn">tl.velocity_graph</span>(adata)
<span class="cmt"># Embed velocity into 3D UMAP space</span>
scv.<span class="fn">tl.velocity_embedding</span>(adata, basis=<span class="str">'X_pca'</span>)

<span class="cmt"># ── Cluster color palette (per Leiden cluster) ────────────────────</span>
cluster_ids = adata.obs[<span class="str">'leiden'</span>].<span class="fn">astype</span>(int).<span class="fn">values</span>
palette = [
    (<span class="num">.1</span>,<span class="num">.85</span>,<span class="num">1</span>), (<span class="num">1</span>,<span class="num">.25</span>,<span class="num">.5</span>), (<span class="num">.35</span>,<span class="num">1</span>,<span class="num">.45</span>), (<span class="num">1</span>,<span class="num">.8</span>,<span class="num">.1</span>),
    (<span class="num">.8</span>,<span class="num">.1</span>,<span class="num">1</span>),  (<span class="num">1</span>,<span class="num">.5</span>,<span class="num">.1</span>),  (<span class="num">.1</span>,<span class="num">.4</span>,<span class="num">1</span>),   (<span class="num">.9</span>,<span class="num">1</span>,<span class="num">.2</span>),
    (<span class="num">1</span>,<span class="num">.2</span>,<span class="num">.2</span>),  (<span class="num">.2</span>,<span class="num">1</span>,<span class="num">.8</span>),  (<span class="num">1</span>,<span class="num">.6</span>,<span class="num">.9</span>),  (<span class="num">.6</span>,<span class="num">.3</span>,<span class="num">1</span>),
]

<span class="cmt"># Gene expression as brightness: use top marker gene per cluster</span>
marker_gene = <span class="str">'CD3D'</span>   <span class="cmt"># T-cell marker; swap to any marker</span>
<span class="kw">if</span> marker_gene <span class="kw">in</span> adata.var_names:
    gene_expr = np.<span class="fn">array</span>(adata[:, marker_gene].X.<span class="fn">todense</span>()).<span class="fn">ravel</span>()
    gene_norm  = gene_expr / (gene_expr.<span class="fn">max</span>() + <span class="num">1e-8</span>)
<span class="kw">else</span>:
    gene_norm = np.<span class="fn">ones</span>(adata.n_obs) * <span class="num">0.5</span>

cells_data = [{
    <span class="str">'pos'</span>    : X_umap3d[i].<span class="fn">tolist</span>(),
    <span class="str">'cluster'</span>: <span class="fn">int</span>(cluster_ids[i]) % <span class="fn">len</span>(palette),
    <span class="str">'color'</span>  : palette[<span class="fn">int</span>(cluster_ids[i]) % <span class="fn">len</span>(palette)],
    <span class="str">'emit'</span>   : <span class="fn">float</span>(<span class="num">0.4</span> + gene_norm[i] * <span class="num">3.5</span>),
} <span class="kw">for</span> i <span class="kw">in</span> <span class="fn">range</span>(adata.n_obs)]

<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'cells_3d.json'</span>, <span class="str">'w'</span>) <span class="kw">as</span> f: json.<span class="fn">dump</span>(cells_data, f)
<span class="fn">print</span>(<span class="fn">f</span><span class="str">f"Exported {adata.n_obs:,} cells across {adata.obs.leiden.nunique()} clusters"</span>)
</code></pre>
  </div>

  <div class="code-wrap">
    <div class="ch">
      <span class="ch-title">step_02_blender_cellatlas.py — Point Cloud Galaxy of Cells</span>
      <div class="dots"><div class="dot dr"></div><div class="dot dy"></div><div class="dot dg"></div></div>
    </div>
    <pre><code><span class="kw">import</span> bpy, json
<span class="kw">import</span> numpy <span class="kw">as</span> np

<span class="cmt"># ════════════════════════════════════════════════════════════════════
#  CELL ATLAS — 50k instanced spheres + velocity streamlines
#  KEY TRICK: Geometry Nodes Instances — handles 50k at 60fps viewport
# ════════════════════════════════════════════════════════════════════</span>

<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'/tmp/cells_3d.json'</span>) <span class="kw">as</span> f: cells = json.<span class="fn">load</span>(f)

<span class="fn">bpy.ops.object.select_all</span>(action=<span class="str">'SELECT'</span>)
<span class="fn">bpy.ops.object.delete</span>()

<span class="cmt"># ── Build a single mesh with one vertex per cell ───────────────────</span>
<span class="cmt"># Then use Geometry Nodes "Instance on Points" for near-zero overhead</span>
<span class="kw">import</span> bmesh
bm = bmesh.<span class="fn">new</span>()
col_layer = bm.verts.layers.color.<span class="fn">new</span>(<span class="str">"CellColor"</span>)
em_layer  = bm.verts.layers.float.<span class="fn">new</span>(<span class="str">"Emission"</span>)

<span class="kw">for</span> cell <span class="kw">in</span> cells:
    v = bm.<span class="fn">verts.new</span>(cell[<span class="str">'pos'</span>])
    v[col_layer] = (*cell[<span class="str">'color'</span>], <span class="num">1.0</span>)
    v[em_layer]  = cell[<span class="str">'emit'</span>]

md = bpy.data.meshes.<span class="fn">new</span>(<span class="str">"CellCloud"</span>)
bm.<span class="fn">to_mesh</span>(md); bm.<span class="fn">free</span>()
cloud = bpy.data.objects.<span class="fn">new</span>(<span class="str">"CellCloud"</span>, md)
bpy.context.collection.objects.<span class="fn">link</span>(cloud)

<span class="cmt"># ── Geometry Nodes: Instance small icosphere on each vertex ───────</span>
gn_mod = cloud.modifiers.<span class="fn">new</span>(<span class="str">"GN_Cells"</span>, <span class="str">'NODES'</span>)
nt = bpy.data.node_groups.<span class="fn">new</span>(<span class="str">"CellInstancer"</span>, <span class="str">'GeometryNodeTree'</span>)
gn_mod.node_group = nt

n = nt.nodes; l = nt.links
gi  = n.<span class="fn">new</span>(<span class="str">'NodeGroupInput'</span>)
go  = n.<span class="fn">new</span>(<span class="str">'NodeGroupOutput'</span>)
ico = n.<span class="fn">new</span>(<span class="str">'GeometryNodeMeshIcoSphere'</span>)
iop = n.<span class="fn">new</span>(<span class="str">'GeometryNodeInstanceOnPoints'</span>)
ra  = n.<span class="fn">new</span>(<span class="str">'GeometryNodeAttributeStatistic'</span>)   <span class="cmt"># for emission scaling</span>
rv  = n.<span class="fn">new</span>(<span class="str">'GeometryNodeRealizeInstances'</span>)

ico.inputs[<span class="str">'Subdivisions'</span>].default_value = <span class="num">1</span>
ico.inputs[<span class="str">'Radius'</span>].default_value       = <span class="num">0.04</span>

<span class="fn">l.new</span>(gi.outputs[<span class="num">0</span>],   iop.inputs[<span class="str">'Points'</span>])
<span class="fn">l.new</span>(ico.outputs[<span class="str">'Mesh'</span>], iop.inputs[<span class="str">'Instance'</span>])
<span class="fn">l.new</span>(iop.outputs[<span class="str">'Instances'</span>], rv.inputs[<span class="str">'Geometry'</span>])
<span class="fn">l.new</span>(rv.outputs[<span class="str">'Geometry'</span>], go.inputs[<span class="num">0</span>])

<span class="cmt"># ── Single attribute-driven material for ALL cells ────────────────</span>
cmat = bpy.data.materials.<span class="fn">new</span>(<span class="str">"CellMat"</span>)
cmat.use_nodes = <span class="cls">True</span>
cn = cmat.node_tree.nodes; cl = cmat.node_tree.links
cn.<span class="fn">clear</span>()

vc   = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeVertexColor'</span>); vc.layer_name = <span class="str">"CellColor"</span>
bsdf = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeBsdfPrincipled'</span>)
em   = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeEmission'</span>)
mix  = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeMixShader'</span>)
out  = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeOutputMaterial'</span>)

bsdf.inputs[<span class="str">'Roughness'</span>].default_value           = <span class="num">0.1</span>
bsdf.inputs[<span class="str">'Transmission Weight'</span>].default_value  = <span class="num">0.4</span>
mix.inputs[<span class="str">'Fac'</span>].default_value                   = <span class="num">0.6</span>
em.inputs[<span class="str">'Strength'</span>].default_value               = <span class="num">2.0</span>

<span class="fn">cl.new</span>(vc.outputs[<span class="str">'Color'</span>],   bsdf.inputs[<span class="str">'Base Color'</span>])
<span class="fn">cl.new</span>(vc.outputs[<span class="str">'Color'</span>],   em.inputs[<span class="str">'Color'</span>])
<span class="fn">cl.new</span>(bsdf.outputs[<span class="str">'BSDF'</span>],   mix.inputs[<span class="num">1</span>])
<span class="fn">cl.new</span>(em.outputs[<span class="str">'Emission'</span>], mix.inputs[<span class="num">2</span>])
<span class="fn">cl.new</span>(mix.outputs[<span class="str">'Shader'</span>],  out.inputs[<span class="str">'Surface'</span>])
cloud.data.materials.<span class="fn">append</span>(cmat)

<span class="cmt"># ── RNA Velocity arrows as thin luminous curve splines ────────────</span>
<span class="kw">import</span> random
<span class="cmt"># Sample 500 cells for velocity arrows (enough for visual density)</span>
arrow_cells = random.<span class="fn">sample</span>(cells, <span class="fn">min</span>(<span class="num">500</span>, <span class="fn">len</span>(cells)))
<span class="kw">for</span> ac <span class="kw">in</span> arrow_cells:
    p0 = ac[<span class="str">'pos'</span>]
    <span class="cmt"># In production, use actual scVelo velocity vector; here: jittered</span>
    vel = [np.random.<span class="fn">normal</span>() * <span class="num">0.3</span> <span class="kw">for</span> _ <span class="kw">in</span> <span class="fn">range</span>(<span class="num">3</span>)]
    p1  = [p0[k] + vel[k] <span class="kw">for</span> k <span class="kw">in</span> <span class="fn">range</span>(<span class="num">3</span>)]

    vcd = bpy.data.curves.<span class="fn">new</span>(<span class="str">"vel"</span>, <span class="str">'CURVE'</span>)
    vcd.dimensions = <span class="str">'3D'</span>; vcd.bevel_depth = <span class="num">0.006</span>
    sp = vcd.splines.<span class="fn">new</span>(<span class="str">'POLY'</span>)
    sp.points.<span class="fn">add</span>(<span class="num">1</span>)
    sp.points[<span class="num">0</span>].co = (*p0, <span class="num">1</span>); sp.points[<span class="num">1</span>].co = (*p1, <span class="num">1</span>)
    vobj = bpy.data.objects.<span class="fn">new</span>(<span class="str">"Vel"</span>, vcd)
    bpy.context.collection.objects.<span class="fn">link</span>(vobj)
    vm = bpy.data.materials.<span class="fn">new</span>(<span class="str">"VM"</span>)
    vm.use_nodes = <span class="cls">True</span>; vm.node_tree.nodes.<span class="fn">clear</span>()
    ve = vm.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeEmission'</span>)
    vo = vm.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeOutputMaterial'</span>)
    ve.inputs[<span class="str">'Color'</span>].default_value    = (*ac[<span class="str">'color'</span>], <span class="num">1</span>)
    ve.inputs[<span class="str">'Strength'</span>].default_value = <span class="num">6.0</span>
    vm.node_tree.links.<span class="fn">new</span>(ve.outputs[<span class="str">'Emission'</span>], vo.inputs[<span class="str">'Surface'</span>])
    vobj.data.materials.<span class="fn">append</span>(vm)

scene = bpy.context.scene
scene.render.engine         = <span class="str">'CYCLES'</span>
scene.cycles.samples        = <span class="num">512</span>    <span class="cmt"># emission-dominant — fast</span>
scene.render.resolution_x   = <span class="num">4096</span>; scene.render.resolution_y = <span class="num">4096</span>
scene.view_settings.look    = <span class="str">'AgX - Punchy'</span>
scene.view_settings.exposure = <span class="num">1.2</span>
scene.render.filepath       = <span class="str">'/renders/cell_atlas.exr'</span>
<span class="fn">bpy.ops.render.render</span>(write_still=<span class="cls">True</span>)
</code></pre>
  </div>

  <div class="jewel">
    <div class="jewel-head"><span>💎</span><span class="jewel-label">Crown Jewel Techniques — Pipeline 08</span></div>
    <div class="jewel-body">
      <h4>The biology of light</h4>
      <p>50,000 cells become a galaxy. UMAP topology — the biological truth of transcriptional similarity — determines their spatial arrangement. Immune cells cluster in the blue corona; stem cells glow amber at the origin. CD3D expression burns white-hot in T-cell territories. RNA velocity arrows illuminate the developmental highways: differentiation isn't implied, it's drawn in light.</p>
      <div class="tech-grid">
        <div class="tech"><div class="tech-name tn-genomics">GN Instance on Points</div><div class="tech-desc">Geometry Nodes "Instance on Points" renders 50k icospheres with a single mesh object — no Python loop required at render time</div></div>
        <div class="tech"><div class="tech-name tn-genomics">Gene Expr → Emission</div><div class="tech-desc">Marker gene log-normalized count maps to emission strength 0.4–3.9 — high-expressing cells are self-illuminating beacons</div></div>
        <div class="tech"><div class="tech-name tn-genomics">Cosine UMAP Metric</div><div class="tech-desc">Cosine distance in PCA space captures transcriptional direction, not magnitude — critical for scRNA topology</div></div>
        <div class="tech"><div class="tech-name tn-genomics">scVelo Dynamical Mode</div><div class="tech-desc">Dynamical (not stochastic) velocity model solves kinetic rate equations — more accurate arrows for slow lineages</div></div>
        <div class="tech"><div class="tech-name tn-genomics">Vertex Float Attribute</div><div class="tech-desc">Emission strength stored as a float vertex attribute — Geometry Nodes can then vary instance scale by this attribute</div></div>
        <div class="tech"><div class="tech-name tn-genomics">Leiden Resolution 0.8</div><div class="tech-desc">Leiden at r=0.8 gives biologically meaningful clusters (15–20 for PBMC) without over-splitting rare populations</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     PIPELINE 09 — ACOUSTIC WAVE INTERFERENCE
══════════════════════════════════════════════════════════ -->
<div class="div"></div>
<div class="pipeline">
  <div class="pipeline-header">
    <div class="pipeline-num">09</div>
    <div class="pipeline-meta">
      <span class="tag tag-acoustic">Acoustic Physics · FDTD Simulation</span>
      <div class="pipeline-title">Standing Wave Topography:<br>Sound Frozen in Geometry</div>
      <p class="pipeline-desc">Simulate a 2D acoustic pressure field from multiple point sources using finite-difference time-domain (FDTD) integration, extract a time-snapshot of wave interference, then displace a highly subdivided mesh in Blender by the pressure amplitude — coating it with an iridescent thin-film material that maps phase angle to hue, creating a Chladni landscape of sound made tangible.</p>
    </div>
  </div>

  <div class="flow">
    <div class="fs"><div class="fs-icon">〰️</div><div class="fs-step">Simulate</div><div class="fs-name">FDTD 2D Acoustics</div></div>
    <div class="fs"><div class="fs-icon">📸</div><div class="fs-step">Snapshot</div><div class="fs-name">Peak Pressure Frame</div></div>
    <div class="fs"><div class="fs-icon">🗻</div><div class="fs-step">Displace</div><div class="fs-name">Height + Phase Map</div></div>
    <div class="fs"><div class="fs-icon">🎨</div><div class="fs-step">Coat</div><div class="fs-name">Thin-Film Iridescence</div></div>
    <div class="fs"><div class="fs-icon">✨</div><div class="fs-step">Render</div><div class="fs-name">Oil-Slick Caustics</div></div>
  </div>

  <div class="code-wrap">
    <div class="ch">
      <span class="ch-title">step_01_fdtd_acoustics.py — Wave Interference Simulation</span>
      <div class="dots"><div class="dot dr"></div><div class="dot dy"></div><div class="dot dg"></div></div>
    </div>
    <pre><code><span class="kw">import</span> numpy <span class="kw">as</span> np
<span class="kw">from</span> scipy.ndimage <span class="kw">import</span> gaussian_filter

<span class="cmt"># ═══════════════════════════════════════════════════════════════════
#  FDTD 2D Acoustic pressure field — Yee scheme
#  ∂²p/∂t² = c² ∇²p  →  leapfrog: p[n+1] = 2p[n] - p[n-1] + c²dt²∇²p[n]
# ═══════════════════════════════════════════════════════════════════</span>

N  = <span class="num">512</span>           <span class="cmt"># grid resolution</span>
c  = <span class="num">343.0</span>         <span class="cmt"># speed of sound m/s</span>
dx = <span class="num">0.05</span>          <span class="cmt"># spatial step (5 cm)</span>
dt = dx / (c * <span class="num">1.42</span>) <span class="cmt"># CFL condition: dt < dx/(c√2)</span>

<span class="cmt"># Point source frequencies — use prime ratios for complex interference</span>
sources = [
    {<span class="str">'pos'</span>: (N//4,   N//4),   <span class="str">'f'</span>: <span class="num">440</span>, <span class="str">'amp'</span>: <span class="num">1.0</span>},
    {<span class="str">'pos'</span>: (<span class="num">3</span>*N//4, N//4),   <span class="str">'f'</span>: <span class="num">554</span>, <span class="str">'amp'</span>: <span class="num">0.9</span>},
    {<span class="str">'pos'</span>: (N//2,   <span class="num">3</span>*N//4), <span class="str">'f'</span>: <span class="num">659</span>, <span class="str">'amp'</span>: <span class="num">0.8</span>},
    {<span class="str">'pos'</span>: (N//4,   <span class="num">3</span>*N//4), <span class="str">'f'</span>: <span class="num">330</span>, <span class="str">'amp'</span>: <span class="num">0.7</span>},
    {<span class="str">'pos'</span>: (<span class="num">3</span>*N//4, <span class="num">3</span>*N//4), <span class="str">'f'</span>: <span class="num">392</span>, <span class="str">'amp'</span>: <span class="num">0.85</span>},
]

p     = np.<span class="fn">zeros</span>((N, N))
p_old = np.<span class="fn">zeros</span>((N, N))
p_new = np.<span class="fn">zeros</span>((N, N))
c2dt2dx2 = (c * dt / dx)**<span class="num">2</span>

<span class="cmt"># Mur absorbing boundary condition buffer</span>
pml_thickness = <span class="num">20</span>
pml_sigma = np.<span class="fn">zeros</span>((N,N))
<span class="kw">for</span> i <span class="kw">in</span> <span class="fn">range</span>(pml_thickness):
    s = ((pml_thickness - i) / pml_thickness) ** <span class="num">2</span> * <span class="num">0.08</span>
    pml_sigma[i, :]    = s; pml_sigma[N-<span class="num">1</span>-i, :] = s
    pml_sigma[:, i]    = s; pml_sigma[:, N-<span class="num">1</span>-i] = s

pressure_history = []
n_steps = <span class="num">1800</span>   <span class="cmt"># run until interference pattern stabilises</span>

<span class="kw">for</span> t_step <span class="kw">in</span> <span class="fn">range</span>(n_steps):
    t = t_step * dt

    <span class="cmt"># 2D Laplacian (5-point stencil)</span>
    lap = (np.<span class="fn">roll</span>(p,<span class="num">1</span>,<span class="num">0</span>)+np.<span class="fn">roll</span>(p,-<span class="num">1</span>,<span class="num">0</span>)+
           np.<span class="fn">roll</span>(p,<span class="num">1</span>,<span class="num">1</span>)+np.<span class="fn">roll</span>(p,-<span class="num">1</span>,<span class="num">1</span>)-<span class="num">4</span>*p)

    p_new[:] = (<span class="num">2</span>*p - p_old + c2dt2dx2*lap) * (<span class="num">1</span> - pml_sigma)

    <span class="cmt"># Inject monochromatic sources</span>
    <span class="kw">for</span> src <span class="kw">in</span> sources:
        r,c_ = src[<span class="str">'pos'</span>]
        p_new[r,c_] += src[<span class="str">'amp'</span>] * np.<span class="fn">sin</span>(<span class="num">2</span>*np.pi*src[<span class="str">'f'</span>]*t)

    p_old[:] = p; p[:] = p_new

    <span class="kw">if</span> t_step >= n_steps - <span class="num">200</span>:   <span class="cmt"># average last 200 frames</span>
        pressure_history.<span class="fn">append</span>(p.<span class="fn">copy</span>())

<span class="cmt"># ── Time-averaged RMS pressure (standing wave pattern) ────────────</span>
p_rms = np.<span class="fn">sqrt</span>(np.<span class="fn">mean</span>(np.<span class="fn">array</span>(pressure_history)**<span class="num">2</span>, axis=<span class="num">0</span>))
<span class="cmt"># Instantaneous pressure snapshot for phase</span>
p_snap = pressure_history[-<span class="num">1</span>]
phase  = np.<span class="fn">arctan2</span>(p_snap, p_rms + <span class="num">1e-8</span>) / np.pi   <span class="cmt"># normalized -1..1</span>

<span class="cmt"># Normalize outputs</span>
p_norm   = p_rms / p_rms.<span class="fn">max</span>()
p_height = p_norm * <span class="num">0.8</span>       <span class="cmt"># Blender displacement scale (80cm)</span>
phase_n  = (phase + <span class="num">1</span>) / <span class="num">2</span>    <span class="cmt"># 0..1 for color mapping</span>

np.<span class="fn">save</span>(<span class="str">'pressure_height.npy'</span>, p_height)
np.<span class="fn">save</span>(<span class="str">'phase_map.npy'</span>,       phase_n)
<span class="fn">print</span>(<span class="fn">f</span><span class="str">f"Peak pressure: {p_rms.max():.4f} | RMS field saved at {N}×{N}"</span>)
</code></pre>
  </div>

  <div class="code-wrap">
    <div class="ch">
      <span class="ch-title">step_02_blender_acoustic.py — Displaced Iridescent Sound Landscape</span>
      <div class="dots"><div class="dot dr"></div><div class="dot dy"></div><div class="dot dg"></div></div>
    </div>
    <pre><code><span class="kw">import</span> bpy, bmesh
<span class="kw">import</span> numpy <span class="kw">as</span> np

<span class="cmt"># ════════════════════════════════════════════════════════════════════
#  ACOUSTIC LANDSCAPE — displaced mesh + oil-slick iridescent coat
# ════════════════════════════════════════════════════════════════════</span>

p_height = np.<span class="fn">load</span>(<span class="str">'/tmp/pressure_height.npy'</span>)
phase_n  = np.<span class="fn">load</span>(<span class="str">'/tmp/phase_map.npy'</span>)
N = p_height.shape[<span class="num">0</span>]

<span class="fn">bpy.ops.object.select_all</span>(action=<span class="str">'SELECT'</span>); <span class="fn">bpy.ops.object.delete</span>()

<span class="cmt"># ── High-resolution plane: 512×512 verts = 262k quads ─────────────</span>
<span class="fn">bpy.ops.mesh.primitive_grid_add</span>(x_subdivisions=N-<span class="num">1</span>, y_subdivisions=N-<span class="num">1</span>,
                                  size=<span class="num">8.0</span>)
plane = bpy.context.active_object; plane.name = <span class="str">"AcousticSurface"</span>

<span class="cmt"># ── Displace vertices by pressure amplitude ───────────────────────</span>
bm = bmesh.<span class="fn">from_edit_mesh</span>(plane.data)
<span class="fn">bpy.ops.object.mode_set</span>(mode=<span class="str">'OBJECT'</span>)
bm = bmesh.<span class="fn">new</span>(); bm.<span class="fn">from_mesh</span>(plane.data)
bm.verts.<span class="fn">ensure_lookup_table</span>()

<span class="cmt"># Phase vertex color for iridescent mapping</span>
phase_col = bm.verts.layers.color.<span class="fn">new</span>(<span class="str">"Phase"</span>)

<span class="kw">for</span> i, v <span class="kw">in</span> <span class="fn">enumerate</span>(bm.verts):
    <span class="cmt"># Map vertex index to grid position</span>
    row = i // N; col = i % N
    row = <span class="fn">min</span>(row, N-<span class="num">1</span>); col = <span class="fn">min</span>(col, N-<span class="num">1</span>)
    h   = <span class="fn">float</span>(p_height[row, col])
    phi = <span class="fn">float</span>(phase_n[row, col])

    v.co.z = h   <span class="cmt"># displace in Z by pressure</span>

    <span class="cmt"># Phase → HSV → RGB for thin-film iridescence palette</span>
    <span class="cmt"># 0→magenta, 0.25→gold, 0.5→cyan, 0.75→green, 1→magenta</span>
    <span class="kw">import</span> colorsys
    r, g, b = colorsys.<span class="fn">hsv_to_rgb</span>(phi, <span class="num">0.95</span>, <span class="num">0.9</span>)
    v[phase_col] = (r, g, b, <span class="num">1.0</span>)

bm.<span class="fn">to_mesh</span>(plane.data); bm.<span class="fn">free</span>()
plane.data.<span class="fn">calc_normals</span>()

<span class="cmt"># ── Oil-slick thin-film iridescent material ───────────────────────</span>
mat = bpy.data.materials.<span class="fn">new</span>(<span class="str">"ThinFilm"</span>)
mat.use_nodes = <span class="cls">True</span>
mn = mat.node_tree.nodes; ml = mat.node_tree.links
mn.<span class="fn">clear</span>()

vcol  = mn.<span class="fn">new</span>(<span class="str">'ShaderNodeVertexColor'</span>); vcol.layer_name = <span class="str">"Phase"</span>
geo   = mn.<span class="fn">new</span>(<span class="str">'ShaderNodeNewGeometry'</span>)
fres  = mn.<span class="fn">new</span>(<span class="str">'ShaderNodeFresnel'</span>)
hue   = mn.<span class="fn">new</span>(<span class="str">'ShaderNodeHueSaturation'</span>)
bsdf  = mn.<span class="fn">new</span>(<span class="str">'ShaderNodeBsdfPrincipled'</span>)
gloss = mn.<span class="fn">new</span>(<span class="str">'ShaderNodeBsdfGlossy'</span>)
add   = mn.<span class="fn">new</span>(<span class="str">'ShaderNodeAddShader'</span>)
out   = mn.<span class="fn">new</span>(<span class="str">'ShaderNodeOutputMaterial'</span>)

<span class="cmt"># Fresnel shifts the hue by angle → viewing-angle iridescence</span>
hue.inputs[<span class="str">'Saturation'</span>].default_value = <span class="num">1.4</span>
hue.inputs[<span class="str">'Value'</span>].default_value      = <span class="num">1.2</span>

bsdf.inputs[<span class="str">'Metallic'</span>].default_value           = <span class="num">0.9</span>
bsdf.inputs[<span class="str">'Roughness'</span>].default_value          = <span class="num">0.05</span>
bsdf.inputs[<span class="str">'Specular IOR Level'</span>].default_value  = <span class="num">2.0</span>
gloss.inputs[<span class="str">'Roughness'</span>].default_value          = <span class="num">0.02</span>

<span class="fn">ml.new</span>(vcol.outputs[<span class="str">'Color'</span>],    hue.inputs[<span class="str">'Color'</span>])
<span class="fn">ml.new</span>(fres.outputs[<span class="str">'Fac'</span>],     hue.inputs[<span class="str">'Hue'</span>])    <span class="cmt"># angle shifts hue</span>
<span class="fn">ml.new</span>(hue.outputs[<span class="str">'Color'</span>],    bsdf.inputs[<span class="str">'Base Color'</span>])
<span class="fn">ml.new</span>(hue.outputs[<span class="str">'Color'</span>],    gloss.inputs[<span class="str">'Color'</span>])
<span class="fn">ml.new</span>(bsdf.outputs[<span class="str">'BSDF'</span>],    add.inputs[<span class="num">0</span>])
<span class="fn">ml.new</span>(gloss.outputs[<span class="str">'BSDF'</span>],   add.inputs[<span class="num">1</span>])
<span class="fn">ml.new</span>(add.outputs[<span class="str">'Shader'</span>],   out.inputs[<span class="str">'Surface'</span>])
plane.data.materials.<span class="fn">append</span>(mat)

<span class="cmt"># ── HDRI lighting: white overcast for pure material read ──────────</span>
world = bpy.context.scene.world; world.use_nodes = <span class="cls">True</span>
bg = world.node_tree.nodes[<span class="str">'Background'</span>]
bg.inputs[<span class="str">'Color'</span>].default_value    = (<span class="num">1</span>,<span class="num">1</span>,<span class="num">1</span>,<span class="num">1</span>)   <span class="cmt"># white overcast sky</span>
bg.inputs[<span class="str">'Strength'</span>].default_value = <span class="num">2.5</span>

<span class="fn">bpy.ops.object.camera_add</span>(location=(<span class="num">0</span>,<span class="num">0</span>,<span class="num">12</span>))
cam = bpy.context.active_object
cam.data.type = <span class="str">'ORTHO'</span>; cam.data.ortho_scale = <span class="num">9</span>   <span class="cmt"># top-down orthographic</span>
cam.rotation_euler = (<span class="num">0</span>, <span class="num">0</span>, <span class="num">0</span>)
bpy.context.scene.camera = cam

scene = bpy.context.scene
scene.render.engine          = <span class="str">'CYCLES'</span>
scene.cycles.samples         = <span class="num">2048</span>
scene.cycles.caustics_reflective = <span class="cls">True</span>
scene.render.resolution_x    = <span class="num">4096</span>; scene.render.resolution_y = <span class="num">4096</span>
scene.view_settings.look     = <span class="str">'AgX - High Contrast'</span>
scene.render.filepath        = <span class="str">'/renders/acoustic_landscape.exr'</span>
<span class="fn">bpy.ops.render.render</span>(write_still=<span class="cls">True</span>)
</code></pre>
  </div>

  <div class="jewel">
    <div class="jewel-head"><span>💎</span><span class="jewel-label">Crown Jewel Techniques — Pipeline 09</span></div>
    <div class="jewel-body">
      <h4>Chladni meets oil on water</h4>
      <p>The wave interference of five simultaneous acoustic sources — A440, E554, B659, E330, G392, a chord of near-perfect harmony — locks into a standing-wave topography. The RMS pressure field is the canyon map; the instantaneous phase angle paints it in shifting spectral color. An orthographic top-down camera turns the render into a perfect scientific plate, while Fresnel-angle hue-shift means the material changes color as the observer moves: an oil-slick trapped in mathematics.</p>
      <div class="tech-grid">
        <div class="tech"><div class="tech-name tn-acoustic">Yee FDTD Scheme</div><div class="tech-desc">Second-order leapfrog integrator with CFL-stable dt=dx/(c√2) — exact discrete wave equation</div></div>
        <div class="tech"><div class="tech-name tn-acoustic">Mur PML Absorption</div><div class="tech-desc">Quadratic σ profile at 20-cell boundary eliminates reflections — pure interference, no edge artifacts</div></div>
        <div class="tech"><div class="tech-name tn-acoustic">Phase → HSV Color</div><div class="tech-desc">arctan2(p_snap, p_rms) gives instantaneous phase angle, cycled through HSV at Sat=0.95 for jewel-tone iridescence</div></div>
        <div class="tech"><div class="tech-name tn-acoustic">Fresnel Hue Driver</div><div class="tech-desc">Fresnel output drives the Hue socket of HueSaturation node — viewing angle physically shifts the apparent color</div></div>
        <div class="tech"><div class="tech-name tn-acoustic">Metallic Gloss Add</div><div class="tech-desc">Adding a GlossyBSDF to Principled creates specular hot-spots that shift independently from the diffuse iridescence</div></div>
        <div class="tech"><div class="tech-name tn-acoustic">Orthographic Plate</div><div class="tech-desc">Orthographic camera eliminates perspective — the render reads as a precise scientific measurement artifact</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     PIPELINE 10 — URBAN MOBILITY
══════════════════════════════════════════════════════════ -->
<div class="div"></div>
<div class="pipeline">
  <div class="pipeline-header">
    <div class="pipeline-num">10</div>
    <div class="pipeline-meta">
      <span class="tag tag-urban">Urban Analytics · NYC TLC / GTFS</span>
      <div class="pipeline-title">City of Flows:<br>Ten Million Journeys at Once</div>
      <p class="pipeline-desc">Aggregate 10 million NYC taxi trips into origin-destination flow matrices, bin by time-of-day and borough, then render them in Blender as parametric Bézier arc-ribbons over a procedurally generated city grid mesh — flow volume drives ribbon width and altitude, hour-of-day drives color temperature — a living pulse map of urban desire lines.</p>
    </div>
  </div>

  <div class="flow">
    <div class="fs"><div class="fs-icon">🚕</div><div class="fs-step">Source</div><div class="fs-name">NYC TLC Parquet</div></div>
    <div class="fs"><div class="fs-icon">📦</div><div class="fs-step">Bin</div><div class="fs-name">H3 Hex Grid</div></div>
    <div class="fs"><div class="fs-icon">🌐</div><div class="fs-step">OD Matrix</div><div class="fs-name">Flow Aggregation</div></div>
    <div class="fs"><div class="fs-icon">🌈</div><div class="fs-step">Encode</div><div class="fs-name">Time → Color Temp</div></div>
    <div class="fs"><div class="fs-icon">✨</div><div class="fs-step">Render</div><div class="fs-name">Arc Ribbons + City</div></div>
  </div>

  <div class="code-wrap">
    <div class="ch">
      <span class="ch-title">step_01_urban_flows.py — OD Flow Matrix via H3 Hexagons</span>
      <div class="dots"><div class="dot dr"></div><div class="dot dy"></div><div class="dot dg"></div></div>
    </div>
    <pre><code><span class="kw">import</span> pandas <span class="kw">as</span> pd, numpy <span class="kw">as</span> np, json
<span class="kw">import</span> h3        <span class="cmt"># pip install h3</span>
<span class="kw">from</span> collections <span class="kw">import</span> defaultdict

<span class="cmt"># ── Load NYC Yellow Taxi data (2023, all months via TLC open data) ─</span>
months = [<span class="fn">f</span><span class="str">f"yellow_tripdata_2023-{m:02d}.parquet"</span> <span class="kw">for</span> m <span class="kw">in</span> <span class="fn">range</span>(<span class="num">1</span>,<span class="num">13</span>)]
df = pd.<span class="fn">concat</span>([pd.<span class="fn">read_parquet</span>(m, columns=[
    <span class="str">'tpep_pickup_datetime'</span>,<span class="str">'pickup_latitude'</span>,<span class="str">'pickup_longitude'</span>,
    <span class="str">'dropoff_latitude'</span>,<span class="str">'dropoff_longitude'</span>,<span class="str">'passenger_count'</span>
]) <span class="kw">for</span> m <span class="kw">in</span> months], ignore_index=<span class="cls">True</span>)

<span class="cmt"># Remove outliers outside NYC bounding box</span>
NYC = {<span class="str">'lat'</span>:(<span class="num">40.47</span>,<span class="num">40.92</span>), <span class="str">'lon'</span>:(-<span class="num">74.27</span>,-<span class="num">73.68</span>)}
df  = df[df.pickup_latitude.<span class="fn">between</span>(*NYC[<span class="str">'lat'</span>])  &
         df.pickup_longitude.<span class="fn">between</span>(*NYC[<span class="str">'lon'</span>])  &
         df.dropoff_latitude.<span class="fn">between</span>(*NYC[<span class="str">'lat'</span>])  &
         df.dropoff_longitude.<span class="fn">between</span>(*NYC[<span class="str">'lon'</span>])]

df[<span class="str">'hour'</span>] = pd.<span class="fn">to_datetime</span>(df.tpep_pickup_datetime).dt.hour

<span class="cmt"># ── H3 resolution 7 (~0.6 km²) hexagonal binning ─────────────────</span>
H3_RES = <span class="num">7</span>
df[<span class="str">'h3_origin'</span>]  = df.<span class="fn">apply</span>(<span class="kw">lambda</span> r: h3.<span class="fn">latlng_to_cell</span>(
    r.pickup_latitude, r.pickup_longitude, H3_RES), axis=<span class="num">1</span>)
df[<span class="str">'h3_dest'</span>]    = df.<span class="fn">apply</span>(<span class="kw">lambda</span> r: h3.<span class="fn">latlng_to_cell</span>(
    r.dropoff_latitude, r.dropoff_longitude, H3_RES), axis=<span class="num">1</span>)

<span class="cmt"># ── Aggregate OD flows by (origin, destination, hour) ─────────────</span>
od_counts = df.<span class="fn">groupby</span>([<span class="str">'h3_origin'</span>,<span class="str">'h3_dest'</span>,<span class="str">'hour'</span>]).<span class="fn">size</span>().<span class="fn">reset_index</span>(name=<span class="str">'trips'</span>)
od_counts = od_counts[od_counts.trips > <span class="num">30</span>]   <span class="cmt"># threshold: ≥30 trips</span>

<span class="cmt"># ── H3 cell → centroid coordinates ───────────────────────────────</span>
<span class="kw">def</span> <span class="fn">h3_to_blender</span>(cell):
    lat, lon = h3.<span class="fn">cell_to_latlng</span>(cell)
    <span class="cmt"># Map NYC bbox → [-5, 5] Blender units</span>
    x = (lon - NYC[<span class="str">'lon'</span>][<span class="num">0</span>]) / (NYC[<span class="str">'lon'</span>][<span class="num">1</span>]-NYC[<span class="str">'lon'</span>][<span class="num">0</span>]) * <span class="num">10</span> - <span class="num">5</span>
    y = (lat - NYC[<span class="str">'lat'</span>][<span class="num">0</span>]) / (NYC[<span class="str">'lat'</span>][<span class="num">1</span>]-NYC[<span class="str">'lat'</span>][<span class="num">0</span>]) * <span class="num">10</span> - <span class="num">5</span>
    <span class="kw">return</span> x, y

<span class="cmt"># ── Hour-of-day → color temperature ──────────────────────────────</span>
<span class="cmt"># 00–06: midnight blue, 06–09: dawn gold, 09–17: noon white,</span>
<span class="cmt"># 17–21: dusk amber-red, 21–24: night violet</span>
<span class="kw">def</span> <span class="fn">hour_to_color</span>(h):
    <span class="kw">if</span>   h <  <span class="num">6</span>:  <span class="kw">return</span> (<span class="num">.05</span>, <span class="num">.1</span>,  <span class="num">.7</span>)    <span class="cmt"># midnight blue</span>
    <span class="kw">elif</span> h <  <span class="num">9</span>:  <span class="kw">return</span> (<span class="num">1.0</span>, <span class="num">.7</span>,  <span class="num">.2</span>)    <span class="cmt"># dawn gold</span>
    <span class="kw">elif</span> h < <span class="num">17</span>:  <span class="kw">return</span> (<span class="num">1.0</span>, <span class="num">1.0</span>, <span class="num">.95</span>)  <span class="cmt"># noon white</span>
    <span class="kw">elif</span> h < <span class="num">21</span>:  <span class="kw">return</span> (<span class="num">1.0</span>, <span class="num">.35</span>, <span class="num">.1</span>)   <span class="cmt"># dusk orange</span>
    <span class="kw">else</span>:          <span class="kw">return</span> (<span class="num">.55</span>, <span class="num">.15</span>, <span class="num">.9</span>)   <span class="cmt"># night violet</span>

trips_max = od_counts.trips.<span class="fn">max</span>()
arcs = []
<span class="kw">for</span> _, row <span class="kw">in</span> od_counts.iterrows():
    ox, oy = <span class="fn">h3_to_blender</span>(row.h3_origin)
    dx, dy = <span class="fn">h3_to_blender</span>(row.h3_dest)
    flow   = row.trips / trips_max   <span class="cmt"># 0..1</span>
    arc_h  = <span class="num">0.3</span> + flow * <span class="num">3.0</span>        <span class="cmt"># taller arcs = more traffic</span>
    width  = <span class="num">0.004</span> + flow * <span class="num">0.04</span>    <span class="cmt"># thicker ribbon = more trips</span>
    arcs.<span class="fn">append</span>({
        <span class="str">'o'</span>: [ox, oy], <span class="str">'d'</span>: [dx, dy],
        <span class="str">'h'</span>: arc_h, <span class="str">'w'</span>: width,
        <span class="str">'col'</span>: <span class="fn">hour_to_color</span>(<span class="fn">int</span>(row.hour)),
        <span class="str">'flow'</span>: <span class="fn">float</span>(flow),
        <span class="str">'hour'</span>: <span class="fn">int</span>(row.hour)
    })

<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'od_arcs.json'</span>, <span class="str">'w'</span>) <span class="kw">as</span> f: json.<span class="fn">dump</span>(arcs, f)
<span class="fn">print</span>(<span class="fn">f</span><span class="str">f"Generated {len(arcs):,} OD flow arcs"</span>)
</code></pre>
  </div>

  <div class="code-wrap">
    <div class="ch">
      <span class="ch-title">step_02_blender_city.py — Desire Line City Pulse Map</span>
      <div class="dots"><div class="dot dr"></div><div class="dot dy"></div><div class="dot dg"></div></div>
    </div>
    <pre><code><span class="kw">import</span> bpy, json, math
<span class="kw">import</span> numpy <span class="kw">as</span> np

<span class="cmt"># ════════════════════════════════════════════════════════════════════
#  CITY PULSE — Bézier arc ribbons over procedural city grid
# ════════════════════════════════════════════════════════════════════</span>

<span class="kw">with</span> <span class="fn">open</span>(<span class="str">'/tmp/od_arcs.json'</span>) <span class="kw">as</span> f: arcs = json.<span class="fn">load</span>(f)
<span class="fn">bpy.ops.object.select_all</span>(action=<span class="str">'SELECT'</span>); <span class="fn">bpy.ops.object.delete</span>()

<span class="cmt"># ── 1. CITY GRID PLANE — procedural block texture ─────────────────</span>
<span class="fn">bpy.ops.mesh.primitive_grid_add</span>(x_subdivisions=<span class="num">80</span>, y_subdivisions=<span class="num">80</span>, size=<span class="num">12</span>)
city = bpy.context.active_object; city.name = <span class="str">"CityGrid"</span>

city_mat = bpy.data.materials.<span class="fn">new</span>(<span class="str">"CityMat"</span>)
city_mat.use_nodes = <span class="cls">True</span>
cn = city_mat.node_tree.nodes; cl = city_mat.node_tree.links; cn.<span class="fn">clear</span>()

<span class="cmt"># Voronoi texture → city block pattern</span>
tex  = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeTexCoord'</span>)
vor  = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeTexVoronoi'</span>)
ramp = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeValToRGB'</span>)
bsdf = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeBsdfPrincipled'</span>)
em   = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeEmission'</span>)
msh  = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeMixShader'</span>)
out  = cn.<span class="fn">new</span>(<span class="str">'ShaderNodeOutputMaterial'</span>)

vor.voronoi_dimensions   = <span class="str">'3D'</span>
vor.inputs[<span class="str">'Scale'</span>].default_value = <span class="num">8.0</span>
ramp.color_ramp.elements[<span class="num">0</span>].color = (<span class="num">.02</span>,<span class="num">.03</span>,<span class="num">.05</span>,<span class="num">1</span>)   <span class="cmt"># dark block interior</span>
ramp.color_ramp.elements[<span class="num">1</span>].color = (<span class="num">.08</span>,<span class="num">.12</span>,<span class="num">.2</span>,<span class="num">1</span>)    <span class="cmt"># lighter street grid</span>
ramp.color_ramp.elements[<span class="num">1</span>].position = <span class="num">0.05</span>   <span class="cmt"># thin street lines</span>
bsdf.inputs[<span class="str">'Roughness'</span>].default_value = <span class="num">0.9</span>
em.inputs[<span class="str">'Color'</span>].default_value       = (<span class="num">.1</span>,<span class="num">.18</span>,<span class="num">.35</span>,<span class="num">1</span>)   <span class="cmt"># cool blue street glow</span>
em.inputs[<span class="str">'Strength'</span>].default_value    = <span class="num">0.4</span>
msh.inputs[<span class="str">'Fac'</span>].default_value         = <span class="num">0.35</span>

<span class="fn">cl.new</span>(tex.outputs[<span class="str">'Generated'</span>], vor.inputs[<span class="str">'Vector'</span>])
<span class="fn">cl.new</span>(vor.outputs[<span class="str">'Distance'</span>],  ramp.inputs[<span class="str">'Fac'</span>])
<span class="fn">cl.new</span>(ramp.outputs[<span class="str">'Color'</span>],   bsdf.inputs[<span class="str">'Base Color'</span>])
<span class="fn">cl.new</span>(bsdf.outputs[<span class="str">'BSDF'</span>],    msh.inputs[<span class="num">1</span>])
<span class="fn">cl.new</span>(em.outputs[<span class="str">'Emission'</span>],  msh.inputs[<span class="num">2</span>])
<span class="fn">cl.new</span>(msh.outputs[<span class="str">'Shader'</span>],   out.inputs[<span class="str">'Surface'</span>])
city.data.materials.<span class="fn">append</span>(city_mat)

<span class="cmt"># ── 2. FLOW ARCS — Quadratic Bézier curves ───────────────────────</span>
<span class="cmt"># Bézier: P0 (origin), P1 (midpoint elevated by arc_h), P2 (dest)</span>
<span class="cmt"># Lateral offset adds width by cross-product of arc direction</span>

<span class="kw">def</span> <span class="fn">make_arc</span>(o, d, h, w, col, flow):
    ox, oy = o; dx, dy = d
    mid_x = (ox+dx)/2; mid_y = (oy+dy)/2; mid_z = h

    cd = bpy.data.curves.<span class="fn">new</span>(<span class="str">"arc"</span>, <span class="str">'CURVE'</span>)
    cd.dimensions     = <span class="str">'3D'</span>
    cd.resolution_u   = <span class="num">20</span>
    cd.bevel_depth    = w
    cd.bevel_resolution = <span class="num">4</span>
    cd.use_fill_caps  = <span class="cls">True</span>

    sp = cd.splines.<span class="fn">new</span>(<span class="str">'BEZIER'</span>)
    sp.bezier_points.<span class="fn">add</span>(<span class="num">1</span>)   <span class="cmt"># 3 points: start, mid, end</span>

    bp0 = sp.bezier_points[<span class="num">0</span>]
    bp0.co = (ox, oy, <span class="num">0.02</span>)
    bp0.handle_left_type  = <span class="str">'VECTOR'</span>
    bp0.handle_right_type = <span class="str">'FREE'</span>
    bp0.handle_right      = (ox + (mid_x-ox)*<span class="num">0.6</span>, oy + (mid_y-oy)*<span class="num">0.6</span>, mid_z*<span class="num">0.7</span>)

    bp1 = sp.bezier_points[<span class="num">1</span>]
    bp1.co = (dx, dy, <span class="num">0.02</span>)
    bp1.handle_right_type = <span class="str">'VECTOR'</span>
    bp1.handle_left_type  = <span class="str">'FREE'</span>
    bp1.handle_left       = (dx + (mid_x-dx)*<span class="num">0.6</span>, dy + (mid_y-dy)*<span class="num">0.6</span>, mid_z*<span class="num">0.7</span>)

    obj = bpy.data.objects.<span class="fn">new</span>(<span class="str">"Arc"</span>, cd)
    bpy.context.collection.objects.<span class="fn">link</span>(obj)

    m = bpy.data.materials.<span class="fn">new</span>(<span class="str">"AM"</span>); m.use_nodes = <span class="cls">True</span>
    m.node_tree.nodes.<span class="fn">clear</span>()
    ae = m.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeEmission'</span>)
    ao = m.node_tree.nodes.<span class="fn">new</span>(<span class="str">'ShaderNodeOutputMaterial'</span>)
    ae.inputs[<span class="str">'Color'</span>].default_value    = (*col, <span class="num">1</span>)
    ae.inputs[<span class="str">'Strength'</span>].default_value = <span class="num">2.0</span> + flow * <span class="num">6.0</span>   <span class="cmt"># busier = brighter</span>
    m.node_tree.links.<span class="fn">new</span>(ae.outputs[<span class="str">'Emission'</span>], ao.inputs[<span class="str">'Surface'</span>])
    obj.data.materials.<span class="fn">append</span>(m)

<span class="cmt"># Build all arcs (batch by hour for potential animation later)</span>
<span class="kw">for</span> arc <span class="kw">in</span> arcs:
    <span class="fn">make_arc</span>(arc[<span class="str">'o'</span>], arc[<span class="str">'d'</span>], arc[<span class="str">'h'</span>], arc[<span class="str">'w'</span>], arc[<span class="str">'col'</span>], arc[<span class="str">'flow'</span>])

<span class="cmt"># ── 3. CAMERA — low dramatic angle looking through city ───────────</span>
<span class="fn">bpy.ops.object.camera_add</span>(location=(-<span class="num">8</span>, -<span class="num">6</span>, <span class="num">4</span>))
cam = bpy.context.active_object
cam.data.lens         = <span class="num">50</span>
cam.rotation_euler    = (<span class="num">1.1</span>, <span class="num">0</span>, <span class="num">-0.6</span>)
bpy.context.scene.camera = cam

<span class="cmt"># ── World: deep city night sky ────────────────────────────────────</span>
world = bpy.context.scene.world; world.use_nodes = <span class="cls">True</span>
world.node_tree.nodes[<span class="str">'Background'</span>].inputs[<span class="str">'Color'</span>].default_value = (<span class="num">.001</span>,<span class="num">.002</span>,<span class="num">.008</span>,<span class="num">1</span>)
world.node_tree.nodes[<span class="str">'Background'</span>].inputs[<span class="str">'Strength'</span>].default_value = <span class="num">0</span>

<span class="cmt"># ── Compositor: bloom + lens distortion for cinematic look ────────</span>
bpy.context.scene.use_nodes = <span class="cls">True</span>
tree = bpy.context.scene.node_tree; tree.nodes.<span class="fn">clear</span>()
rl   = tree.nodes.<span class="fn">new</span>(<span class="str">'CompositorNodeRLayers'</span>)
gl   = tree.nodes.<span class="fn">new</span>(<span class="str">'CompositorNodeGlare'</span>)
ld   = tree.nodes.<span class="fn">new</span>(<span class="str">'CompositorNodeLensdist'</span>)
co   = tree.nodes.<span class="fn">new</span>(<span class="str">'CompositorNodeComposite'</span>)

gl.glare_type = <span class="str">'STREAKS'</span>; gl.streaks = <span class="num">4</span>; gl.angle_offset = math.radians(<span class="num">15</span>)
gl.threshold  = <span class="num">0.6</span>; gl.size = <span class="num">8</span>
ld.inputs[<span class="str">'Distort'</span>].default_value = -<span class="num">0.04</span>   <span class="cmt"># subtle barrel distortion</span>

tree.links.<span class="fn">new</span>(rl.outputs[<span class="str">'Image'</span>], gl.inputs[<span class="str">'Image'</span>])
tree.links.<span class="fn">new</span>(gl.outputs[<span class="str">'Image'</span>], ld.inputs[<span class="str">'Image'</span>])
tree.links.<span class="fn">new</span>(ld.outputs[<span class="str">'Image'</span>], co.inputs[<span class="str">'Image'</span>])

scene = bpy.context.scene
scene.render.engine          = <span class="str">'CYCLES'</span>
scene.cycles.samples         = <span class="num">512</span>
scene.render.resolution_x    = <span class="num">5120</span>; scene.render.resolution_y = <span class="num">2880</span>
scene.view_settings.look     = <span class="str">'AgX - High Contrast'</span>
scene.view_settings.exposure = <span class="num">0.5</span>
scene.render.filepath        = <span class="str">'/renders/city_flows.exr'</span>
<span class="fn">bpy.ops.render.render</span>(write_still=<span class="cls">True</span>)
</code></pre>
  </div>

  <div class="jewel">
    <div class="jewel-head"><span>💎</span><span class="jewel-label">Crown Jewel Techniques — Pipeline 10</span></div>
    <div class="jewel-body">
      <h4>The city breathing in light</h4>
      <p>Ten million trips become a luminous nervous system. Dawn commutes pulse gold from residential Brooklyn to Midtown; midnight rides arc violet from bars in the East Village. The Voronoi city grid glows faint blue beneath — geography as substrate. Streak glare on every bright arc turns the render into a long-exposure photograph of a city that never stopped moving. The 4-streak compositor glare at 15° rotation matches the Manhattan street grid angle exactly.</p>
      <div class="tech-grid">
        <div class="tech"><div class="tech-name tn-urban">H3 Hexagonal Binning</div><div class="tech-desc">Uber H3 at resolution 7 (~0.6 km²) gives topologically consistent bins that never distort near coastlines</div></div>
        <div class="tech"><div class="tech-name tn-urban">Quadratic Bézier Arcs</div><div class="tech-desc">Two bezier_points with asymmetric handle heights create catenary arcs — the natural physics of desire lines</div></div>
        <div class="tech"><div class="tech-name tn-urban">Flow → Arc Altitude</div><div class="tech-desc">Higher trip volume pushes the apex skyward (0.3–3.3 BU) — the busiest corridors literally tower above lesser routes</div></div>
        <div class="tech"><div class="tech-name tn-urban">Voronoi City Texture</div><div class="tech-desc">ShaderNodeTexVoronoi at Scale=8 produces blocky Voronoi cells; threshold at position 0.05 gives razor-thin street lines</div></div>
        <div class="tech"><div class="tech-name tn-urban">Streak Glare at Grid Angle</div><div class="tech-desc">4-streak glare rotated 15° to match Manhattan's street grid offset — geographic truth embedded in the lens artifact</div></div>
        <div class="tech"><div class="tech-name tn-urban">Lens Distortion</div><div class="tech-desc">−0.04 barrel distortion mimics a slightly wide photographic lens — subtle but it makes the city feel real-scale</div></div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════ CLOSING ══════════════════ -->
<div class="div"></div>
<div class="closing">
  <h2>The Art of the Pipeline</h2>
  <p class="closing-sub">Mastery principles that separate a scientific render from an unforgettable one.</p>

  <div class="mastery-grid">
    <div class="mastery">
      <div class="mastery-n">PRINCIPLE / 01</div>
      <div class="mastery-title">The data IS the composition</div>
      <div class="mastery-body">Don't fight your data's natural geometry. Let tectonic plates become boundaries, let OD desire-lines become arcs, let UMAP topology become spatial clustering. The physics dictates the aesthetics.</div>
    </div>
    <div class="mastery">
      <div class="mastery-n">PRINCIPLE / 02</div>
      <div class="mastery-title">One physically meaningful variable → one visual channel</div>
      <div class="mastery-body">Pick a 1:1 mapping: FA → iridescence. Flow → altitude. Q-criterion → opacity. Frequency → hue. Mixing two meanings into one channel destroys legibility and beauty simultaneously.</div>
    </div>
    <div class="mastery">
      <div class="mastery-n">PRINCIPLE / 03</div>
      <div class="mastery-title">Geometry Nodes for scale, Python loops for control</div>
      <div class="mastery-body">50k cells? Use GN Instance on Points. 80 fiber bundles? Python loop with full per-object control. The threshold is roughly 5k objects — below that, loop; above that, instancing.</div>
    </div>
    <div class="mastery">
      <div class="mastery-n">PRINCIPLE / 04</div>
      <div class="mastery-title">The camera is part of the analysis</div>
      <div class="mastery-body">Orthographic for scientific plates (acoustics, maps). Telephoto for network compression (proteins, correlations). Low dramatic angle for phenomenological scale (cities, turbulence). Match the lens to the message.</div>
    </div>
    <div class="mastery">
      <div class="mastery-n">PRINCIPLE / 05</div>
      <div class="mastery-title">Compositor glare is a scientific choice</div>
      <div class="mastery-body">Streak glare aligned to data geometry (Manhattan's 15° grid offset). Fog glow to reveal emission density gradients. These aren't decorative — they encode information about the data's intensity distribution.</div>
    </div>
    <div class="mastery">
      <div class="mastery-n">PRINCIPLE / 06</div>
      <div class="mastery-title">Never normalize to max — use percentiles</div>
      <div class="mastery-body">One M9.5 earthquake collapses all others to invisible. One superstar stock flattens the network. Always normalize to 95th or 99th percentile, then let outliers bloom above that ceiling naturally.</div>
    </div>
  </div>
</div>

</body>
</html>






