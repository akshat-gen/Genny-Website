import { useState, type FormEvent } from 'react';
import { DemoRequestError, SPEND_OPTIONS, submitDemoRequest, validateDemoRequest, type DemoErrors } from '../lib/demoForm';

type FormState = 'idle' | 'sending' | 'done';

export default function DemoCta() {
  const [form, setForm] = useState<FormState>('idle');
  const [errors, setErrors] = useState<DemoErrors>({});
  const [failure, setFailure] = useState('');
  const [who, setWho] = useState('');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form === 'sending') return;
    const f = new FormData(e.currentTarget);
    const val = (k: string) => String(f.get(k) ?? '').trim();
    const data = { name: val('name'), email: val('email'), company: val('company'), spend: val('spend'), website: val('website') };

    const er = validateDemoRequest(data);
    setFailure('');
    if (Object.keys(er).length) { setErrors(er); return; }

    setErrors({});
    setForm('sending');
    try {
      await submitDemoRequest(data);
      setWho(data.name.split(/\s+/)[0]);
      setForm('done');
    } catch (err) {
      setForm('idle');
      if (err instanceof DemoRequestError && Object.keys(err.errors).length) setErrors(err.errors);
      else setFailure(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const reset = () => { setForm('idle'); setErrors({}); setWho(''); setFailure(''); };
  const sending = form === 'sending';

  const field = (id: 'name' | 'email' | 'company', label: string, type: string, placeholder: string, autoComplete: string) => (
    <div>
      <label className="fl" htmlFor={'demo-' + id}>{label}</label>
      <input
        className={'inp ' + (errors[id] ? 'bad' : '')}
        id={'demo-' + id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!errors[id]}
        aria-describedby={errors[id] ? `demo-${id}-err` : undefined}
      />
      {errors[id] && <div className="ferr" id={`demo-${id}-err`}><span className="ms" aria-hidden="true">error</span>{errors[id]}</div>}
    </div>
  );

  return (
    <section className="sec cta" id="demo" data-sec="demo" data-nav="demo">
      <div className="grid-bg" style={{ opacity: 0.6 }} />
      <div className="wrap center" style={{ position: 'relative' }}>
        <div className="eyebrow rv" data-rv="demo">Accelerate Sourcing Impact</div>
        <h2 className="h2 rv d1" data-rv="demo">Every sourcing decision should begin with intelligence.</h2>
        <p className="lead rv d2" data-rv="demo">Join mid-market and enterprise industrial leaders modernizing their procurement operations. Schedule a live architectural demonstration with your BOM files.</p>
        <div className="form-card rv d3" data-rv="demo" style={{ width: '100%' }}>
          {form === 'done' ? (
            <div className="ok-box" role="status">
              <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <circle className="ok-c" cx="32" cy="32" r="28" strokeWidth="2.5" />
                <path className="ok-k" d="M20 33 L28 41 L44 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h4>Review Scheduled{who ? ', ' + who : ''}</h4>
              <p>Our engineering procurement team will reach out with the secure NDA portal.</p>
              <button type="button" className="link-btn" onClick={reset}>Schedule another review</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="hp" aria-hidden="true">
                <label htmlFor="demo-website">Website</label>
                <input id="demo-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="frow">
                {field('name', 'Full Name', 'text', 'Sarah Jenkins', 'name')}
                {field('email', 'Work Email', 'email', 's.jenkins@company.com', 'email')}
              </div>
              <div className="frow">
                {field('company', 'Company', 'text', 'Apex Manufacturing', 'organization')}
                <div>
                  <label className="fl" htmlFor="demo-spend">Annual Direct Spend</label>
                  <select className="inp" id="demo-spend" name="spend">
                    {SPEND_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              {failure && <div className="ferr ferr-form" role="alert"><span className="ms" aria-hidden="true">error</span>{failure}</div>}
              <button type="submit" className="btn btn-p sub" disabled={sending}>
                {sending
                  ? <><span className="spinner" /><span>Scheduling…</span></>
                  : <><span>Book a Demo Call</span><span className="ms" aria-hidden="true">calendar_month</span></>}
              </button>
              <p className="fnote">No credit card required. Defensible modeling using your test BOM under reciprocal NDA.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
