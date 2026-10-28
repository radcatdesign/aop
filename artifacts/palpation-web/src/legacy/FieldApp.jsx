import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, CircleDollarSign, Clock, CreditCard, Delete, Hand, LayoutDashboard, Lock, MapPin, PenLine, PersonStanding, RotateCcw, ShieldCheck, Tablet, X } from 'lucide-react';
import './field.css';

const VISITS = [
  { id: 'v1', clientId: 'c1', time: '9:00 AM', name: 'Rosa Delgado', service: 'Deep tissue', duration: 60, location: 'Client home, Plano', price: 110, referral: 'Dr. Okonkwo', color: '#438773' },
  { id: 'v2', clientId: 'c2', time: '11:00 AM', name: 'Trevor Books', service: 'Sports', duration: 90, location: 'TrainHaus gym, Frisco', price: 150, color: '#ad9365' },
  { id: 'v3', clientId: 'c3', time: '1:30 PM', name: 'Aisha Carter', service: 'Prenatal', duration: 60, location: 'Client home, Allen', price: 120, referral: 'Dr. Reyes', color: '#7c91a5' },
  { id: 'v4', clientId: 'c6', time: '3:30 PM', name: 'Grant Whitman', service: 'Swedish', duration: 60, location: 'Pop-up event, The Star', price: 100, color: '#9083a0' },
];
const INITIAL_RECORDS = Object.fromEntries(VISITS.map(v => [v.id, { checkedIn: false, paid: false, tip: .15, signature: '', findings: v.id === 'v1' ? [{ id: 'field-f1', regionId: 'muscle.upper_trapezius.R', label: 'Right upper trapezius', side: 'R', sev: 'mod', note: 'Hypertonicity, upper trap', view: 'posterior', ts: Date.now() }] : [] }]));
const STEPS = [{ id: 'chart', title: 'Assessment', icon: PersonStanding }, { id: 'consent', title: 'Consent', icon: PenLine }, { id: 'pay', title: 'Payment', icon: CreditCard }];
const dollars = value => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const initials = name => name.split(' ').map(word => word[0]).slice(0, 2).join('');

function SignaturePad({ saved, onSave }) {
  const ref = useRef(null);
  const strokes = useRef([]);
  const drawing = useRef(false);
  const [inked, setInked] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    const redraw = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio; canvas.height = rect.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio); ctx.strokeStyle = '#24352e'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const stroke of strokes.current) {
        ctx.beginPath(); stroke.forEach(([x, y], i) => i ? ctx.lineTo(x * rect.width, y * rect.height) : ctx.moveTo(x * rect.width, y * rect.height)); ctx.stroke();
      }
    };
    const observer = new ResizeObserver(redraw); observer.observe(canvas); redraw();
    return () => observer.disconnect();
  }, []);
  const point = event => { const rect = ref.current.getBoundingClientRect(); return [(event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height]; };
  const begin = event => { drawing.current = true; strokes.current.push([point(event)]); event.currentTarget.setPointerCapture(event.pointerId); };
  const move = event => {
    if (!drawing.current) return;
    const stroke = strokes.current.at(-1), last = stroke.at(-1), next = point(event), canvas = ref.current, rect = canvas.getBoundingClientRect(), ctx = canvas.getContext('2d');
    ctx.beginPath(); ctx.moveTo(last[0] * rect.width, last[1] * rect.height); ctx.lineTo(next[0] * rect.width, next[1] * rect.height); ctx.stroke(); stroke.push(next); setInked(true);
  };
  const clear = () => { strokes.current = []; const canvas = ref.current, ctx = canvas.getContext('2d'); ctx.save(); ctx.resetTransform(); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore(); setInked(false); };
  return <>
    {saved && <div className="field-notice"><CheckCircle2 size={17} /> A signature is saved for this visit. Drawing again will replace it.</div>}
    <div className="field-signature"><canvas ref={ref} aria-label="Draw a demo signature" onPointerDown={begin} onPointerMove={move} onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }} />{!inked && <span><PenLine size={20} />Sign here with a finger or stylus</span>}</div>
    <div className="field-form-actions"><button className="field-btn" onClick={clear}><RotateCcw size={16} />Clear signature</button><button className="field-btn primary" disabled={!inked && !saved} onClick={() => onSave(inked ? ref.current.toDataURL('image/png') : saved)}>Save & continue <ArrowRight size={16} /></button></div>
  </>;
}

export function FieldLauncher({ onOpen }) {
  return <div className="field-launcher">
    <div className="field-launch-copy"><span className="field-icon"><Tablet size={25} /></span><div className="field-eyebrow">YOUR WORKSPACE, ON THE GO</div><h2>Good care goes with you.</h2><p>A focused workspace for home visits, events, and everything in between. Your familiar tools, with a little more room to tap.</p><button className="field-btn primary" onClick={onOpen}>Open field app <ArrowUpRightIcon /></button><span className="field-launch-note">Full-screen experience · Sample visit data</span></div>
    <div className="field-launch-preview"><div className="field-preview-top"><Hand size={17} /><strong>Art of Palpation</strong><span>FIELD APP</span></div><div className="field-eyebrow">NEXT ON YOUR SCHEDULE</div><div className="field-preview-client"><span className="field-avatar">RD</span><div><strong>Rosa Delgado</strong><small>9:00 AM · Deep tissue, 60 min</small></div></div><div className="field-location"><MapPin size={15} /> Client home, Plano</div><div className="field-preview-steps">{STEPS.map(step => <div key={step.id}><step.icon size={21} /><strong>{step.title}</strong></div>)}</div><div className="field-preview-footer"><span className="field-status-dot" />One visit. Everything you need.</div></div>
  </div>;
}
function ArrowUpRightIcon() { return <ArrowRight size={17} style={{ transform: 'rotate(-45deg)' }} />; }

export default function FieldApp({ Assessment, onClose }) {
  const [screen, setScreen] = useState('home');
  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [activeId, setActiveId] = useState('v1');
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [success, setSuccess] = useState(false);
  const scrollRef = useRef(null);
  const appRef = useRef(null);
  const unlockTimer = useRef(null);
  const active = VISITS.find(visit => visit.id === activeId);
  const record = records[activeId];
  const next = VISITS.find(visit => !records[visit.id].checkedIn && !records[visit.id].paid);
  const completed = VISITS.filter(visit => records[visit.id].paid).length;
  const collected = VISITS.reduce((sum, visit) => sum + (records[visit.id].paid ? visit.price * (1 + records[visit.id].tip) : 0), 0);
  const total = active.price * (1 + record.tip);
  const update = patch => setRecords(previous => ({ ...previous, [activeId]: { ...previous[activeId], ...patch } }));
  const navigate = destination => { setScreen(destination); setSuccess(false); scrollRef.current?.scrollTo({ top: 0 }); };
  const checkIn = visit => { setActiveId(visit.id); setRecords(previous => ({ ...previous, [visit.id]: { ...previous[visit.id], checkedIn: true } })); navigate('chart'); };
  useEffect(() => { const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = overflow; clearTimeout(unlockTimer.current); }; }, []);
  useEffect(() => {
    const root = appRef.current;
    const scope = () => root.querySelector('.field-lock') || root.querySelector('.field-success-card') || root;
    const elements = () => [...scope().querySelectorAll('button:not(:disabled), select, input:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length && !el.closest('[inert]'));
    elements()[0]?.focus({ preventScroll: true });
    const trap = event => {
      if (event.key !== 'Tab') return;
      const available = elements(), first = available[0], last = available.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    root.addEventListener('keydown', trap);
    return () => root.removeEventListener('keydown', trap);
  }, [locked, success]);
  const digit = value => { if (pin.length === 4) return; const nextPin = pin + value; setPin(nextPin); if (nextPin.length === 4) unlockTimer.current = setTimeout(() => { setLocked(false); setPin(''); }, 150); };
  useEffect(() => {
    if (!locked) return;
    const handle = event => { if (/^[0-9]$/.test(event.key)) { event.preventDefault(); digit(event.key); } else if (event.key === 'Backspace') setPin(value => value.slice(0, -1)); };
    window.addEventListener('keydown', handle); return () => window.removeEventListener('keydown', handle);
  }, [locked, pin]);
  const lock = () => { setSuccess(false); setPin(''); setLocked(true); };
  const VisitRow = ({ visit }) => <div className={`field-visit-row ${records[visit.id].paid ? 'finished' : ''}`}><div className="field-visit-time">{visit.time.split(' ')[0]}<small>{visit.time.split(' ')[1]}</small></div><span className="field-avatar" style={{ '--field-avatar': visit.color }}>{initials(visit.name)}</span><div className="field-visit-copy"><strong>{visit.name}</strong><small>{visit.service} · {visit.duration} min</small><span><MapPin size={12} />{visit.location}</span></div><span className={`field-badge ${records[visit.id].paid || records[visit.id].checkedIn ? 'green' : ''}`}>{records[visit.id].paid ? 'Completed' : records[visit.id].checkedIn ? 'Checked in' : 'Upcoming'}</span><button className="field-icon-button" aria-label={`Open visit for ${visit.name}`} onClick={() => { setActiveId(visit.id); navigate('chart'); }}><ChevronRight size={20} /></button></div>;

  return <div ref={appRef} className="field-app" role="dialog" aria-modal="true" aria-label="Field app">
    <div className="field-shell" inert={locked || success}>
      <aside className="field-sidebar">
        <div className="field-brand"><span><Hand size={22} /></span><div><strong>Art of Palpation</strong><small>FIELD APP</small></div></div>
        <div className="field-practice"><MapPin size={17} /><span>Plano practice<small>Mobile care workspace</small></span></div>
        <div className="field-nav-label">WORKSPACE</div>
        <nav aria-label="Field navigation"><button className={screen === 'home' ? 'active' : ''} onClick={() => navigate('home')}><LayoutDashboard size={18} />Overview</button><button className={screen === 'schedule' ? 'active' : ''} onClick={() => navigate('schedule')}><CalendarDays size={18} />Today’s visits<span>{VISITS.length}</span></button></nav>
        <div className="field-nav-label">CURRENT VISIT</div>
        <nav aria-label="Visit workflow">{STEPS.map(step => <button key={step.id} className={screen === step.id ? 'active' : ''} onClick={() => navigate(step.id)}><step.icon size={18} />{step.title}{(step.id === 'consent' && record.signature || step.id === 'pay' && record.paid) && <Check size={14} />}</button>)}</nav>
        <div className="field-sidebar-note"><ShieldCheck size={21} /><strong>A moment between visits.</strong><p>Lock your screen when you step away.</p><button onClick={lock}>Lock field app <ArrowRight size={14} /></button></div>
        <div className="field-profile"><span className="field-avatar">DR<i /></span><div><strong>Dana Reyes</strong><small>Licensed massage therapist</small></div></div>
        <button className="field-back-workspace" onClick={onClose}><ArrowLeft size={16} />Back to office</button>
      </aside>
      <div className="field-main">
        <header className="field-topbar"><div className="field-breadcrumb">Field app<ChevronRight size={14} /><strong>{screen === 'home' ? 'Overview' : screen === 'schedule' ? 'Today’s visits' : STEPS.find(step => step.id === screen)?.title}</strong></div><div className="field-header-right"><span className="field-on-shift"><i />On shift</span><button className="field-icon-button" aria-label="Lock field app" onClick={lock}><Lock size={17} /></button><button className="field-icon-button field-close" aria-label="Exit field app" onClick={onClose}><X size={18} /></button></div></header>
        <main ref={scrollRef} className="field-content">
          {screen === 'home' && <>
            <div className="field-page-heading"><div><div className="field-eyebrow">A GOOD DAY OF CARE STARTS HERE</div><h1>You’re ready for the day, Dana<span>.</span></h1><p>Your visits, your tools, and a little room to focus.</p></div><div className="field-date"><CalendarDays size={17} /><span>Tuesday, June 16<small>2026 · Sample schedule</small></span></div></div>
            <div className="field-stats"><div><span><CalendarDays size={17} />Today’s visits</span><strong>{VISITS.length}<small>scheduled</small></strong></div><div><span><CheckCircle2 size={17} />Visits completed</span><strong>{completed}<small>of {VISITS.length} visits</small></strong></div><div><span><CircleDollarSign size={17} />Collected today</span><strong>{dollars(collected)}<small>including tips</small></strong></div></div>
            <div className="field-home-grid"><div>
              <section className="field-next-card"><div className="field-next-eyebrow"><span className="field-status-dot" />{next ? 'NEXT ON YOUR SCHEDULE' : 'YOUR SCHEDULE'}<span>{next?.time || 'All checked in'}</span></div>{next ? <><div className="field-next-client"><span className="field-avatar large" style={{ '--field-avatar': next.color }}>{initials(next.name)}</span><div><h2>{next.name}</h2><p>{next.service} <span>·</span> {next.duration} minutes</p></div></div><div className="field-next-details"><span><MapPin size={17} />{next.location}</span>{next.referral && <span><ShieldCheck size={17} />Referred by {next.referral}</span>}</div><div className="field-next-actions"><button className="field-btn primary" onClick={() => checkIn(next)}>Check in & start visit <ArrowRight size={16} /></button><button className="field-btn" onClick={() => navigate('schedule')}>View schedule</button></div></> : <><h2>A little breathing room.</h2><p>Every visit has been checked in. Open your schedule to continue a visit.</p><button className="field-btn primary" onClick={() => navigate('schedule')}>View your visits <ArrowRight size={16} /></button></>}</section>
              <div className="field-section-heading"><h2>Your visit essentials</h2><span>For {active.name}</span></div><div className="field-essentials">{STEPS.map((step, i) => <button key={step.id} onClick={() => navigate(step.id)}><span className={`field-essential-icon tone-${i}`}><step.icon size={23} /></span><strong>{step.title}<ArrowRight size={15} /></strong><small>{['Map findings with precision.', 'Review, sign, and continue.', 'A simple finish to each visit.'][i]}</small></button>)}</div>
              <div className="field-care-note"><Hand size={23} /><div><strong>Less admin. More presence.</strong><p>Everything you need for a visit, together in one place.</p></div></div>
            </div><section className="field-card field-agenda"><div className="field-card-heading"><div><h2>Your day ahead</h2><p>Four visits. One clear view.</p></div><span className="field-count">{VISITS.length}</span></div>{VISITS.map(visit => <VisitRow key={visit.id} visit={visit} />)}<button className="field-agenda-footer" onClick={() => navigate('schedule')}>Open full schedule <ArrowRight size={15} /></button></section></div>
          </>}
          {screen === 'schedule' && <><div className="field-page-heading"><div><div className="field-eyebrow">MAKE SPACE FOR GOOD CARE</div><h1>Today’s visits<span>.</span></h1><p>Tuesday, June 16 · Plano and surrounding areas</p></div><span className="field-date"><CalendarDays size={17} />{VISITS.length} scheduled visits</span></div><div className="field-schedule-cards">{VISITS.map((visit, index) => <section key={visit.id} className="field-card field-schedule-card"><div className="field-schedule-card-top"><span className="field-eyebrow">VISIT {String(index + 1).padStart(2, '0')}</span><span className={`field-badge ${records[visit.id].paid || records[visit.id].checkedIn ? 'green' : ''}`}>{records[visit.id].paid ? 'Completed' : records[visit.id].checkedIn ? 'Checked in' : 'Upcoming'}</span></div><div className="field-next-client"><span className="field-avatar" style={{ '--field-avatar': visit.color }}>{initials(visit.name)}</span><div><h2>{visit.name}</h2><p>{visit.service} · {visit.duration} min</p></div></div><div className="field-schedule-meta"><span><Clock size={16} />{visit.time}</span><span><MapPin size={16} />{visit.location}</span>{visit.referral && <span><ShieldCheck size={16} />{visit.referral}</span>}</div><button className={`field-btn ${records[visit.id].checkedIn ? '' : 'primary'}`} onClick={() => records[visit.id].checkedIn ? (setActiveId(visit.id), navigate('chart')) : checkIn(visit)}>{records[visit.id].checkedIn ? 'Open visit' : 'Check in & start'}<ArrowRight size={16} /></button></section>)}</div></>}
          {STEPS.some(step => step.id === screen) && <>
            <div className="field-visit-context"><span className="field-avatar" style={{ '--field-avatar': active.color }}>{initials(active.name)}</span><div><label htmlFor="field-client">CURRENT VISIT</label><select id="field-client" value={activeId} onChange={event => { setActiveId(event.target.value); setSuccess(false); }}>{VISITS.map(visit => <option value={visit.id} key={visit.id}>{visit.name}</option>)}</select><small>{active.service} · {active.duration} min · {active.time}</small></div><span className="field-context-location"><MapPin size={16} />{active.location}</span><span className={`field-badge ${record.checkedIn ? 'green' : ''}`}>{record.paid ? 'Completed' : record.checkedIn ? 'Checked in' : 'Upcoming'}</span></div>
            <nav className="field-step-tabs" aria-label="Visit steps">{STEPS.map((step, i) => <button key={step.id} aria-current={screen === step.id ? 'step' : undefined} onClick={() => navigate(step.id)}><span>{i + 1}</span>{step.title}{(step.id === 'consent' && record.signature || step.id === 'pay' && record.paid) && <Check size={14} />}</button>)}</nav>
          </>}
          {screen === 'chart' && <><div className="field-page-heading compact"><div><h1>Body assessment</h1><p>A clearer picture of what you feel.</p></div><button className="field-btn primary" onClick={() => navigate('consent')}>Continue to consent <ArrowRight size={16} /></button></div><div className="field-assessment"><Assessment key={activeId} client={{ id: active.clientId, name: active.name, type: active.referral ? 'patient' : 'client', referral: active.referral }} findings={record.findings} onChange={findings => update({ findings })} initialView="posterior" compact /></div></>}
          {screen === 'consent' && <><div className="field-page-heading compact"><div><h1>Consent, with clarity.</h1><p>Take a moment to review the plan together.</p></div></div><div className="field-form-layout"><section className="field-card field-form-card"><span className="field-icon"><PenLine size={24} /></span><h2>Informed consent</h2><p>{active.name}, please review the treatment plan and proposed techniques for your {active.service.toLowerCase()} session. Signing confirms you consent to today’s treatment and understand the findings discussed.</p><div className="field-form-label">Client signature<span>Demo form</span></div><SignaturePad key={activeId} saved={record.signature} onSave={signature => { update({ signature }); navigate('pay'); }} /></section><aside className="field-card field-visit-summary"><h2>Visit summary</h2><div><span>Client</span><strong>{active.name}</strong></div><div><span>Treatment</span><strong>{active.service}</strong></div><div><span>Duration</span><strong>{active.duration} minutes</strong></div><div><span>Findings recorded</span><strong>{record.findings.length}</strong></div><div className="field-summary-note"><ShieldCheck size={19} /><p>Review the assessment together before continuing.</p></div></aside></div></>}
          {screen === 'pay' && <><div className="field-page-heading compact"><div><h1>A simple finish to your visit.</h1><p>Review the total and choose a tip.</p></div><span className="field-badge">Demo payment</span></div><div className="field-form-layout"><section className="field-card field-payment-card"><div className="field-payment-service"><span className="field-icon"><CreditCard size={23} /></span><div><h2>{active.service}</h2><p>{active.duration} minutes · {active.name}</p></div></div><div className="field-payment-amount">{dollars(active.price)}</div><div className="field-form-label">Add a little thank-you<span>Optional</span></div><div className="field-tips">{[0, .15, .18, .2].map(tip => <button key={tip} aria-pressed={record.tip === tip} disabled={record.paid} onClick={() => update({ tip })}><strong>{tip === 0 ? 'No tip' : `${Math.round(tip * 100)}%`}</strong><small>{tip === 0 ? '—' : dollars(active.price * tip)}</small></button>)}</div><div className="field-payment-line"><span>Session</span><span>{dollars(active.price)}</span></div><div className="field-payment-line"><span>Tip</span><span>{dollars(active.price * record.tip)}</span></div><div className="field-payment-total"><span>Total</span><strong>{dollars(total)}</strong></div><button className="field-btn primary field-full" disabled={record.paid} onClick={() => { update({ paid: true, checkedIn: true }); setSuccess(true); }}><CreditCard size={18} />{record.paid ? 'Payment recorded' : `Simulate payment · ${dollars(total)}`}</button><p className="field-demo-caption">Demo only. No card is charged and no receipt is sent.</p></section><aside className="field-card field-visit-summary"><h2>Visit checklist</h2>{[['Assessment', `${record.findings.length} finding${record.findings.length === 1 ? "" : "s"} recorded`, record.findings.length > 0], ['Consent', record.signature ? 'Signature saved' : 'Signature not recorded', !!record.signature], ['Payment', record.paid ? 'Demo payment recorded' : 'Ready when you are', record.paid]].map(([title, subtitle, done]) => <div className="field-checklist-row" key={title}><span className={done ? 'is-done' : ''}>{done ? <CheckCircle2 size={19} /> : <span className="field-empty-check" />}</span><span><strong>{title}</strong><small>{subtitle}</small></span></div>)}<button className="field-btn field-full" onClick={() => navigate('consent')}>Review consent <ArrowRight size={16} /></button></aside></div></>}
          <footer className="field-footer"><span>Art of Palpation <i>·</i> Care, wherever you are.</span><span>Demo workspace</span></footer>
        </main>
        <nav className="field-mobile-nav" aria-label="Field mobile navigation"><button className={screen === 'home' ? 'active' : ''} onClick={() => navigate('home')}><LayoutDashboard size={20} />Overview</button><button className={screen === 'schedule' ? 'active' : ''} onClick={() => navigate('schedule')}><CalendarDays size={20} />Visits</button>{STEPS.map(step => <button key={step.id} className={screen === step.id ? 'active' : ''} onClick={() => navigate(step.id)}><step.icon size={20} />{step.title}</button>)}</nav>
      </div>
    </div>
    {locked && <div className="field-lock"><button className="field-btn field-lock-exit" onClick={onClose}><ArrowLeft size={16} />Back to office</button><div className="field-lock-card"><span className="field-lock-mark"><Hand size={29} /></span><div className="field-eyebrow">ART OF PALPATION · FIELD APP</div><h1>A moment to focus.</h1><p>Welcome back, Dana.<br />Enter your PIN to start your day.</p><div className="field-pin-dots" aria-label={`${pin.length} of 4 PIN digits entered`}>{[0, 1, 2, 3].map(i => <span key={i} className={pin.length > i ? 'filled' : ''} />)}</div><div className="field-keypad">{['1','2','3','4','5','6','7','8','9'].map(value => <button key={value} onClick={() => digit(value)}>{value}</button>)}<span /><button onClick={() => digit('0')}>0</button><button aria-label="Delete PIN digit" onClick={() => setPin(value => value.slice(0, -1))}><Delete size={22} /></button></div><div className="field-lock-note"><Lock size={13} />Demo access · enter any 4 digits</div></div><div className="field-lock-footer">Your practice. A little closer.</div></div>}
    {success && <div className="field-success-overlay"><section className="field-success-card" role="alertdialog" aria-label="Demo payment complete"><span className="field-success-icon"><Check size={30} /></span><div className="field-eyebrow">ALL SET</div><h2>Payment recorded.</h2><strong>{dollars(total)}</strong><p>{active.name}’s demo payment is complete.<br />No actual charge was made.</p><button autoFocus className="field-btn primary field-full" onClick={() => navigate('home')}>Back to overview <ArrowRight size={16} /></button></section></div>}
  </div>;
}
