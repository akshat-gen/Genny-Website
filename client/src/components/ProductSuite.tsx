import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { GROUPS, PRODUCTS, productPath, type GroupId } from '../lib/products';
import { alt } from '../lib/motion';
import ProductMock from './ProductMock';

const ORDER: GroupId[] = ['ops', 'cost', 'logistics', 'sustainability'];
const LIST = ORDER.flatMap((g) => PRODUCTS.filter((p) => p.group === g));
const DWELL = 3000;

/** Spotlight: a product list on the left, one product showcased at a time on the right. */
export default function ProductSuite({ seen, still }: { seen: boolean; still: boolean }) {
  const [idx, setIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [hold, setHold] = useState(false);
  const [barTick, setBarTick] = useState(0);
  // Once a visitor picks a product they are exploring: stop rotating for this visit.
  const [manual, setManual] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const listRef = useRef<HTMLElement>(null);
  const running = seen && inView && !still && !hold && !manual;

  // Only rotate while the section is on screen; restart the timer when it comes back.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      if (e.isIntersecting) setBarTick((n) => n + 1);
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // On narrow screens the list is a swipeable row: keep the active chip in view
  // (scrolls only the row, never the page).
  useEffect(() => {
    const list = listRef.current;
    const btn = list?.querySelector<HTMLElement>('.spot-i.on');
    if (!list || !btn || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: btn.offsetLeft - list.offsetLeft - 24, behavior: still ? 'auto' : 'smooth' });
  }, [idx, still]);

  // Auto-rotate; picking a product or resuming after a hover restarts the timer and bar.
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % LIST.length);
      setTick((n) => n + 1);
      setBarTick((n) => n + 1);
    }, DWELL);
    return () => clearTimeout(t);
  }, [running, barTick]);

  const pick = (i: number) => {
    setManual(true);
    setIdx(i);
    setTick((n) => n + 1);
    setBarTick((n) => n + 1);
  };
  const holdOn = () => setHold(true);
  const holdOff = () => {
    setHold(false);
    setBarTick((n) => n + 1);
  };

  const p = LIST[idx];
  const g = GROUPS[p.group];
  const anim = alt(tick);

  return (
    <section ref={sectionRef} className="sec" style={{ background: '#ffffff' }} id="suite" data-sec="suite" data-nav="suite">
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: 36 }}>
          <div className="eyebrow rv" data-rv="suite">Product Suite · Sourcing360</div>
          <h2 className="h2 rv d1" data-rv="suite">Ten modules. One platform.</h2>
        </div>

        <div
          className="spot rv d2"
          data-rv="suite"
          onMouseEnter={holdOn}
          onMouseLeave={holdOff}
          onFocus={holdOn}
          onBlur={holdOff}
        >
          <nav className="spot-list" aria-label="Products" ref={listRef}>
            {ORDER.map((gid) => (
              <div key={gid} className="spot-grp">
                <span className="spot-gt">{GROUPS[gid].title}</span>
                {LIST.map((item, i) => item.group === gid && (
                  <button
                    key={item.slug}
                    type="button"
                    className={'spot-i ' + (i === idx ? 'on' : '')}
                    onClick={() => pick(i)}
                    aria-pressed={i === idx}
                  >
                    <span className="ms" aria-hidden="true">{item.icon}</span>
                    <span className="spot-n">{item.name}</span>
                    {i === idx && <span className="spot-bar" aria-hidden="true"><span className={'stage-bar-i ' + (still || manual ? 'full' : alt(barTick, 'runA', 'runB'))} style={{ animationDuration: DWELL + 'ms', animationPlayState: running ? 'running' : 'paused' }} /></span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <article className="spot-show">
            <div className={'spot-head ' + anim}>
              <span className="spot-k"><span className="ms" aria-hidden="true">{g.icon}</span>{g.title}</span>
              <span className="spot-c num">{String(idx + 1).padStart(2, '0')} / {LIST.length}</span>
            </div>
            <h3 className={'spot-t ' + anim}>{p.name}</h3>
            <p className={'spot-tag ' + anim}>{p.tagline}</p>
            <div className={'spot-viz ' + anim} key={p.slug}>
              <ProductMock slug={p.slug} />
            </div>
            <Link className="btn btn-p spot-cta" to={productPath(p.slug)}>
              Explore {p.name}<span className="ms" aria-hidden="true">arrow_forward</span>
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}
