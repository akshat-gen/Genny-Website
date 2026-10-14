import { useState, type CSSProperties } from 'react';
import { NODES } from '../lib/content';
import Logomark from './Logomark';

const LINES = [
  { x1: 112, y1: 98, x2: 260, y2: 260 },
  { x1: 408, y1: 98, x2: 260, y2: 260 },
  { x1: 112, y1: 422, x2: 260, y2: 260 },
  { x1: 408, y1: 422, x2: 260, y2: 260 }
];

const PACKETS = [
  { r: 3.5, x: 112, y: 98, delay: '0s' },
  { r: 3.5, x: 408, y: 98, delay: '.8s' },
  { r: 3.5, x: 112, y: 422, delay: '1.6s' },
  { r: 3.5, x: 408, y: 422, delay: '2.4s' },
  { r: 2.5, x: 112, y: 98, delay: '1.9s' },
  { r: 2.5, x: 408, y: 422, delay: '.5s' }
];

export default function Hero({ still }: { still: boolean }) {
  const [hover, setHover] = useState(-1);

  return (
    <section className="sec hero" data-sec="hero" data-nav="hero">
      <div className="grid-bg" />
      <div className="wrap">
        <div className="hero-g">
          <div>
            <h1 className="h1">
              <span className="ln"><span className="ln-i">Every sourcing</span></span>
              <span className="ln"><span className="ln-i">decision,</span></span>
              <span className="ln"><span className="ln-i"><span className="acc">in one place.</span></span></span>
            </h1>
            <p className="hero-p rv d3" data-rv="hero">Sourcing360 connects your suppliers, quotes and spend, so you can see what to buy, from whom, and at what price.</p>
            <div className="hero-cta rv d4" data-rv="hero">
              <a className="btn btn-p" href="#demo">Request a Demo<span className="ms" aria-hidden="true">arrow_forward</span></a>
              <a className="btn btn-g" href="#platform">Explore the Platform</a>
            </div>
            <div className="trust rv d5" data-rv="hero">
              <span><span className="ms" aria-hidden="true">check_circle</span>ISO 27001 Certified</span>
              <span><span className="ms" aria-hidden="true">verified</span>ERP Agnostic (SAP/Oracle)</span>
              <span><span className="ms" aria-hidden="true">lock</span>SOC-2 Type II</span>
            </div>
          </div>

          <div className="rv d2" data-rv="hero">
            <div className="viz">
              <svg viewBox="0 0 520 520" fill="none" aria-hidden="true">
                <circle cx="260" cy="260" r="244" stroke="#D5DBE1" strokeWidth="6" strokeDasharray="1 20.3" className="spin-r" />
                <circle cx="260" cy="260" r="222" stroke="#D5DBE1" strokeWidth="1" strokeDasharray="3 5" className="spin" />
                <circle cx="260" cy="260" r="168" stroke="#D5DBE1" strokeWidth="1" />
                <circle cx="260" cy="260" r="112" stroke="rgba(0,169,206,.45)" strokeWidth="1" />
                <path d="M260 10v40M260 470v40M10 260h40M470 260h40" stroke="#c4c6cf" strokeWidth="1" />
                <path d="M260 92v16M260 412v16M92 260h16M412 260h16" stroke="#00A9CE" strokeWidth="1.5" />
                <circle cx="260" cy="260" r="168" stroke="#00A9CE" strokeWidth="2" strokeDasharray="40 1016" strokeLinecap="round" className="spin" />
                {LINES.map((l, i) => (
                  <line key={i} {...l} className={'conn ' + (hover === i ? 'hot' : '')} />
                ))}
                {PACKETS.map((p, i) => (
                  <circle key={i} r={p.r} className="pkt" style={{ '--x0': p.x + 'px', '--y0': p.y + 'px', animationDelay: p.delay } as CSSProperties} />
                ))}
              </svg>
              <span className="coord" style={{ left: '51%', top: '1%' }}>N 000.0°</span>
              <span className="coord" style={{ right: '0%', top: '51%' }}>E 090.0°</span>
              <div className="halo" />
              <div className="halo h2x" />
              <div className="core">
                <Logomark tone="dark" className="core-logo" />
                <span className="core-a">GENESSENCE</span>
                <span className="core-b">Sourcing360</span>
              </div>
              {NODES.map((nd, i) => (
                <div key={nd.label} className="node" style={{ left: nd.left, top: nd.top }}>
                  <div className={still ? '' : nd.bob}>
                    <div className={'chip ' + (hover === i ? 'hot' : '')} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)}>
                      <span className="ms" aria-hidden="true">{nd.icon}</span>{nd.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
