import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { BASE, HI, LO, SAMPLE, SAMPLE_DRIVERS, SAMPLE_GAP, money } from '../lib/content';
import { alt } from '../lib/motion';
import Logomark from './Logomark';

const DWELL = 3500;
const GAP_PCT = Math.round((SAMPLE_GAP / SAMPLE.quote) * 100);
// Price scale for the Decide scene.
const MIN = 95, MAX = 150;
const pos = (v: number) => ((v - MIN) / (MAX - MIN)) * 100 + '%';

/* ---------- one small animated scene per step ---------- */

/** The Genessence mark on a white tile: shows Genessence doing the work in every scene. */
function LogoTile({ size = 'md', className = '', style }: { size?: 'sm' | 'md' | 'lg'; className?: string; style?: CSSProperties }) {
  return (
    <span className={`scn-lt ${size} ${className}`} style={style}>
      <Logomark className="scn-logo" />
    </span>
  );
}

function DataScene() {
  const src = [
    { icon: 'database', label: 'ERP', x: '-120px', y: '-56px' },
    { icon: 'request_quote', label: 'Quotes', x: '120px', y: '-56px' },
    { icon: 'trending_up', label: 'Market', x: '-120px', y: '56px' },
    { icon: 'precision_manufacturing', label: 'CAD', x: '120px', y: '56px' }
  ];
  return (
    <div className="scn scn-data">
      {src.map((s, i) => (
        <span key={s.label} className="scn-src" style={{ '--tx': s.x, '--ty': s.y, animationDelay: i * 0.18 + 's' } as CSSProperties}>
          <span className="ms" aria-hidden="true">{s.icon}</span>{s.label}
        </span>
      ))}
      <LogoTile size="lg" className="scn-hub" />
    </div>
  );
}

function AnalyseScene() {
  const max = Math.max(...SAMPLE_DRIVERS.map((d) => d.v));
  return (
    <div className="scn scn-analyse">
      <LogoTile className="scn-an-logo" />
      <div className="scn-an-rows">
        {SAMPLE_DRIVERS.map((d, i) => (
          <div key={d.k} className="scn-row">
            <span>{d.k}</span>
            <span className="scn-tr"><span style={{ width: (d.v / max) * 100 + '%', background: d.c, animationDelay: 0.15 + i * 0.18 + 's' }} /></span>
            <b className="num" style={{ animationDelay: 0.35 + i * 0.18 + 's' }}>{money(d.v)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function DecideScene() {
  return (
    <div className="scn scn-decide">
      <div className="scn-scale">
        <span className="scn-band" style={{ left: pos(LO), width: `calc(${pos(HI)} - ${pos(LO)})` }} />
        <span className="scn-q" style={{ left: pos(SAMPLE.quote > MAX ? MAX : SAMPLE.quote) }}><em>Quote</em><b className="num">{money(SAMPLE.quote)}</b></span>
        <span className="scn-t" style={{ left: pos(BASE) }}><LogoTile size="sm" /><b className="num">{money(BASE)}</b><em>Fair target</em></span>
      </div>
      <div className="scn-axis"><span className="num">{money(MIN)}</span><span className="num">{money(MAX)}</span></div>
    </div>
  );
}

function ActScene() {
  const nodes = [
    { icon: 'request_quote', label: 'RFQ sent' },
    { icon: 'handshake', label: 'Negotiated' },
    { icon: 'receipt_long', label: 'PO to ERP' }
  ];
  return (
    <div className="scn scn-act">
      <span className="scn-line"><span /></span>
      <span className="scn-node lead"><LogoTile />Sourcing360</span>
      {nodes.map((n, i) => (
        <span key={n.label} className="scn-node" style={{ animationDelay: 0.2 + i * 0.6 + 's' }}>
          <span className="ms" aria-hidden="true">{n.icon}</span>
          <i className="ms scn-ok" aria-hidden="true" style={{ animationDelay: 0.5 + i * 0.6 + 's' }}>check</i>
          {n.label}
        </span>
      ))}
    </div>
  );
}

function SaveScene() {
  return (
    <div className="scn scn-save">
      <div className="scn-cmp">
        <span>Before</span>
        <span className="scn-tr scn-tr-big"><span className="was" /></span>
        <b className="num">{money(SAMPLE.quote)}</b>
      </div>
      <div className="scn-cmp">
        <LogoTile size="sm" />
        <span className="scn-tr scn-tr-big"><span className="now" style={{ '--w': (BASE / SAMPLE.quote) * 100 + '%' } as CSSProperties} /></span>
        <b className="num price">{money(BASE)}</b>
      </div>
      <div className="scn-badges">
        <span className="price">−{GAP_PCT}% price</span>
        <span className="time">Weeks → hours</span>
      </div>
    </div>
  );
}

const STEPS: { icon: string; name: string; line: string; scene: () => ReactNode }[] = [
  { icon: 'database', name: 'Data', line: 'ERP, quotes, market prices and CAD in one place.', scene: DataScene },
  { icon: 'insights', name: 'Analyse', line: 'Every part broken into what it really costs.', scene: AnalyseScene },
  { icon: 'my_location', name: 'Decide', line: 'A fair target price you can defend.', scene: DecideScene },
  { icon: 'send', name: 'Act', line: 'RFQs, negotiation and orders run in Sourcing360.', scene: ActScene },
  { icon: 'savings', name: 'Save', line: 'Pay the right price, decided in hours.', scene: SaveScene }
];

/** Architecture as a five-step stepper; each step plays its own short animated scene. */
export default function Architecture({ seen, still }: { seen: boolean; still: boolean }) {
  const [step, setStep] = useState(0);
  const [tick, setTick] = useState(0);
  const [hold, setHold] = useState(false);
  const [manual, setManual] = useState(false);

  const running = seen && !still && !hold && !manual;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      setStep((s) => (s + 1) % STEPS.length);
      setTick((n) => n + 1);
    }, DWELL);
    return () => clearTimeout(t);
  }, [running, tick]);

  const pick = (i: number) => {
    setManual(true);
    setStep(i);
    setTick((n) => n + 1);
  };

  const cur = STEPS[step];
  const Scene = cur.scene;

  return (
    <section className="sec dark" id="platform" data-sec="platform" data-nav="platform">
      <div className="dark-grid" />
      <div className="wrap" style={{ position: 'relative' }}>
        <div className="sec-head" style={{ marginBottom: 28 }}>
          <div className="eyebrow rv" data-rv="platform">Architecture</div>
          <h2 className="h2 rv d1" data-rv="platform">From data to savings in five steps.</h2>
        </div>

        <div className="stp rv d2" data-rv="platform" onMouseEnter={() => setHold(true)} onMouseLeave={() => { setHold(false); setTick((n) => n + 1); }}>
          <div className="stp-row" style={{ '--sf': (step / (STEPS.length - 1)) * 100 + '%' } as CSSProperties}>
            {STEPS.map((s, i) => (
              <button key={s.name} type="button" className={'stp-i ' + (i === step ? 'on' : i < step ? 'done' : '')} onClick={() => pick(i)} aria-pressed={i === step}>
                <span className="ms" aria-hidden="true">{s.icon}</span>
                <span className="stp-n">{s.name}</span>
              </button>
            ))}
          </div>

          <div className="stp-panel">
            <div className="stp-scene" key={step + '-' + tick}>
              <Scene />
            </div>
            <div className={'stp-copy ' + alt(tick)}>
              <span className="stp-k num">0{step + 1} / 0{STEPS.length}</span>
              <h3 className="stp-t">{cur.name}</h3>
              <p className="stp-p">{cur.line}</p>
              {running && <span className="stp-bar" aria-hidden="true"><span key={tick} style={{ animationDuration: DWELL + 'ms' }} /></span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
