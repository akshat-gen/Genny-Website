import type { ReactNode } from 'react';

function Industry({ d, title, text, foot, children }: { d: string; title: string; text: string; foot: string; children: ReactNode }) {
  return (
    <div className={'cell rv ' + d} data-rv="industries">
      <div className="ind">
        <div>
          <div className="schem"><svg viewBox="0 0 120 70" fill="none" aria-hidden="true">{children}</svg></div>
          <h3 className="h3">{title}</h3>
          <p>{text}</p>
        </div>
        <span className="ind-f">{foot}</span>
      </div>
    </div>
  );
}

export default function Industries() {
  return (
    <section className="sec s-grey" id="industries" data-sec="industries" data-nav="industries">
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow rv" data-rv="industries">Sector Specialization</div>
          <h2 className="h2 rv d1" data-rv="industries">Built for Complex Industrial Domains</h2>
          <p className="lead rv d2" data-rv="industries">Domain-specific manufacturing models calibrated for specialized materials, stamping pressures, and tolerances.</p>
        </div>
        <div className="inds">
          <Industry d="d2" title="Automotive & EV" text="Tier-1 chassis, stamping, battery trays & powertrain assemblies." foot="PPAP Level 3 Ready">
            <rect className="dr dr-i" x="10" y="20" width="100" height="30" rx="2" strokeWidth="1.2" />
            <g className="sl">
              <circle className="sp" cx="30" cy="50" r="12" strokeDasharray="3 2" strokeWidth="1.2" fill="#F2F4F6" />
              <circle className="sp" cx="90" cy="50" r="12" strokeDasharray="3 2" strokeWidth="1.2" fill="#F2F4F6" />
            </g>
            <line className="ac dr dr-i" x1="20" y1="35" x2="100" y2="35" strokeWidth="1" />
            <line className="ac" x1="60" y1="20" x2="60" y2="50" strokeWidth="1" />
          </Industry>
          <Industry d="d3" title="Industrial Mfg" text="Custom fabricated sub-assemblies, weldments & CNC tooling." foot="ISO 9001 Benchmarking">
            <circle className="dr dr-i" cx="60" cy="35" r="24" strokeWidth="1.2" />
            <g className="sp">
              <circle cx="60" cy="35" r="12" strokeDasharray="2 2" strokeWidth="1" />
              <circle cx="60" cy="18" r="3" fill="#00677f" stroke="none" />
              <circle cx="60" cy="52" r="3" fill="#00677f" stroke="none" />
              <circle cx="43" cy="35" r="3" fill="#00677f" stroke="none" />
              <circle cx="77" cy="35" r="3" fill="#00677f" stroke="none" />
            </g>
          </Industry>
          <Industry d="d4" title="Heavy Machinery" text="Hydraulic cylinders, large castings & high-stress alloy weldments." foot="Fatigue & Tare Models">
            <rect className="dr dr-i" x="15" y="25" width="60" height="20" strokeWidth="1.2" />
            <g className="sl" style={{ transformBox: 'fill-box' }}>
              <rect x="75" y="30" width="35" height="10" fill="#00677f" fillOpacity=".2" strokeWidth="1.2" />
              <circle cx="110" cy="35" r="4" strokeWidth="1.2" fill="#F2F4F6" />
            </g>
            <line className="ac" x1="25" y1="20" x2="25" y2="50" strokeWidth="1.2" />
          </Industry>
          <Industry d="d5" title="Electronics" text="Connectors, enclosure stampings, wire harnesses & passives." foot="IPC-A-610 Compliant">
            <rect className="dr dr-i" x="25" y="15" width="70" height="40" rx="3" strokeWidth="1.2" />
            <line className="ac" x1="35" y1="15" x2="35" y2="55" strokeWidth="1" />
            <line className="ac" x1="85" y1="15" x2="85" y2="55" strokeWidth="1" />
            <g fill="#001026" stroke="none">
              <circle cx="50" cy="28" r="2.5" /><circle cx="60" cy="28" r="2.5" /><circle cx="70" cy="28" r="2.5" />
              <circle cx="50" cy="42" r="2.5" /><circle cx="60" cy="42" r="2.5" /><circle cx="70" cy="42" r="2.5" />
            </g>
          </Industry>
          <Industry d="d6" title="FMCG Packaging" text="Packaging resins, multi-cavity tooling & high-speed packaging." foot="Resin Index Corridors">
            <path className="dr dr-i" d="M30 15 L90 15 L80 55 L40 55 Z" strokeWidth="1.2" />
            <line className="ac" x1="30" y1="25" x2="90" y2="25" strokeDasharray="2 2" strokeWidth="1" />
            <line className="ac" x1="60" y1="15" x2="60" y2="55" strokeWidth="1" />
          </Industry>
        </div>
      </div>
    </section>
  );
}
