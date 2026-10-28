import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowRight, CalendarDays, Check, ChevronDown, ChevronRight, CircleDollarSign, ClipboardList, Clock, FileText, MoreHorizontal, Plus, ShieldCheck, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const formatMoney = (n) => '$' + Math.round(n).toLocaleString('en-US');
const initials = (name) => name.split(' ').map(part => part[0]).slice(0, 2).join('');
const timeLabel = (value) => { const [h, m] = value.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')}`; };
const statuses = { booked: 'Upcoming', arrived: 'Checked in', done: 'Completed', cxl: 'Cancelled', noshow: 'No-show' };

function Metric({ label, value, icon: Icon, children, progress }) {
  return <div className="metric">
    <div className="metric-label">{label}<Icon size={17} strokeWidth={1.6} /></div>
    <div className="metric-value">{value}</div>
    <div className="metric-description">{children}</div>
    {progress !== undefined && <div className="metric-progress"><span style={{ width: `${progress}%` }} /></div>}
  </div>;
}

export default function Dashboard({ state, prov, client, go, dueNotes, dueInvoices, setApptFocus, setNewAppt, date }) {
  const [tab, setTab] = useState('all');
  const [provider, setProvider] = useState('all');
  const active = state.appts.filter(a => !['cxl', 'noshow'].includes(a.status));
  const done = active.filter(a => a.status === 'done').length;
  const upcoming = active.filter(a => ['booked', 'arrived'].includes(a.status)).sort((a, b) => a.time.localeCompare(b.time));
  const paid = state.invoices.filter(i => i.date === date && i.status === 'paid').reduce((sum, i) => sum + i.amount + i.tip, 0);
  const outstanding = state.invoices.filter(i => i.status === 'due').reduce((sum, i) => sum + i.amount, 0);
  const activeProviders = state.providers.filter(p => p.clockedIn);
  const consentDue = [...new Set(active.map(a => a.clientId))].filter(id => !client(id)?.consent).length;
  const renewals = state.providers.filter(p => p.licenseDays <= 60);
  const items = [
    ...(dueNotes ? [{ title: `${dueNotes} note${dueNotes === 1 ? '' : 's'} ready to finish`, description: 'Complete documentation for recent visits.', icon: ClipboardList, target: 'soap', badge: 'Clinical', tone: 'amber' }] : []),
    ...(dueInvoices ? [{ title: `${formatMoney(outstanding)} in unpaid invoices`, description: `${dueInvoices} invoices awaiting payment.`, icon: FileText, target: 'invoicing', badge: 'Billing', tone: 'blue' }] : []),
    ...(consentDue ? [{ title: `${consentDue} consent form${consentDue === 1 ? '' : 's'} needed`, description: 'Review before the next appointment.', icon: ShieldCheck, target: 'clients', badge: 'Front office', tone: 'rose' }] : []),
    ...renewals.map(p => ({ title: 'License renewal coming up', description: `${p.name} · ${p.licenseDays} days remaining`, icon: ShieldCheck, target: 'settings', badge: 'Practice', tone: 'neutral' })),
  ];
  const rows = useMemo(() => state.appts.filter(a => provider === 'all' || a.providerId === provider).filter(a => tab === 'all' || (tab === 'upcoming' ? ['booked', 'arrived'].includes(a.status) : a.status === 'done')).sort((a, b) => a.time.localeCompare(b.time)), [state.appts, provider, tab]);
  const openAppt = (id) => { go('schedule'); setApptFocus(id); };
  const currentMonth = state.revenueHistory.at(-1);
  const priorMonth = state.revenueHistory.at(-2);

  return <div className="dashboard">
    <div className="page-heading">
      <div><div className="eyebrow">YOUR PRACTICE AT A GLANCE</div><h1>A little clarity for your day<span className="heading-dot">.</span></h1><p>You have {upcoming.length} upcoming appointments. Let’s make it a good day.</p></div>
      <button className="btn pri" onClick={() => setNewAppt(true)}><Plus size={16} /> New appointment</button>
    </div>

    <div className="overview-meta"><div className="row" style={{ gap: 8 }}><CalendarDays size={15} />{new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}<span className="today-tag">Today</span></div><span className="demo-note">Sample workspace</span></div>

    <section className="metrics-panel" aria-label="Practice overview">
      <Metric label="Revenue collected" value={formatMoney(paid)} icon={CircleDollarSign}><span className="positive"><ArrowDownLeft size={13} /> Payments received</span><span>Includes tips today</span></Metric>
      <Metric label="Appointments" value={<>{active.length}<small> / today</small></>} icon={CalendarDays}><span><b>{done} completed</b> · {upcoming.length} upcoming</span><span>{state.appts.filter(a => a.status === 'cxl').length} cancelled</span></Metric>
      <Metric label="Visit completion" value={<>{Math.round(done / Math.max(active.length, 1) * 100)}<small>%</small></>} icon={Check} progress={done / Math.max(active.length, 1) * 100}><span>{done} of {active.length} scheduled visits complete</span></Metric>
      <Metric label="Team on the clock" value={<>{activeProviders.length}<small> / {state.providers.length}</small></>} icon={Users}><span className="team-mini">{activeProviders.map(p => <i key={p.id} style={{ '--avatar-color': p.color }}>{initials(p.name)}</i>)}<span>Ready to care</span></span></Metric>
    </section>

    <div className="dashboard-columns">
      <div className="dashboard-primary">
        <section className="card schedule-panel">
          <div className="panel-heading"><div><h2>Today’s schedule <span className="count-badge">{state.appts.length}</span></h2><p>A clear view of who’s coming in.</p></div><button className="text-button" onClick={() => go('schedule')}>View calendar<ArrowUpRight size={15} /></button></div>
          <div className="schedule-toolbar">
            <div className="line-tabs" role="tablist" aria-label="Appointment status">{[['all', 'All appointments'], ['upcoming', 'Upcoming'], ['done', 'Completed']].map(([id, label]) => <button role="tab" aria-selected={tab === id} key={id} onClick={() => setTab(id)}>{label}</button>)}</div>
            <label className="provider-filter"><Users size={14} /><select aria-label="Filter schedule by provider" value={provider} onChange={e => setProvider(e.target.value)}><option value="all">All providers</option>{state.providers.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select><ChevronDown size={13} /></label>
          </div>
          <div className="agenda-list">
            {rows.map(a => {
              const c = client(a.clientId), p = prov(a.providerId);
              const next = a.id === upcoming[0]?.id;
              return <div className={`agenda-row ${a.status === 'cxl' ? 'is-cancelled' : ''} ${next ? 'is-next' : ''}`} key={a.id}>
                <div className="agenda-time">{timeLabel(a.time)}<span>{Number(a.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}</span></div>
                <div className="agenda-rule"><span style={{ background: p.color }} /></div>
                <button className="agenda-client" onClick={() => openAppt(a.id)} aria-label={`Open appointment for ${c.name}`}>
                  <span className="soft-avatar" style={{ '--avatar-color': p.color }}>{initials(c.name)}</span>
                  <span><strong>{c.name}{next && <em>UP NEXT</em>}</strong><small>{a.svc} <span>·</span> {a.room}</small></span>
                </button>
                <div className="agenda-provider">{p.name}<small>{p.role}</small></div>
                <span className={`status-tag status-${a.status}`}><i />{statuses[a.status]}</span>
                <button className="agenda-open" onClick={() => openAppt(a.id)} aria-label={`View ${c.name}'s appointment`}><ChevronRight size={17} /></button>
              </div>;
            })}
            {!rows.length && <div className="empty"><CalendarDays size={28} /><p>No appointments in this view.</p><button className="btn sm" onClick={() => { setTab('all'); setProvider('all'); }}>Clear filters</button></div>}
          </div>
          <div className="panel-footer"><span><Clock size={13} /> All times in practice local time</span><button className="text-button" onClick={() => setNewAppt(true)}><Plus size={14} />Add appointment</button></div>
        </section>

        <section className="card revenue-panel">
          <div className="panel-heading"><div><h2>Practice performance</h2><p>A little perspective on your progress.</p></div><button className="text-button" onClick={() => go('reports')}>Reports<ArrowUpRight size={15} /></button></div>
          <div className="revenue-summary"><div><div className="eyebrow">JUNE REVENUE TO DATE</div><strong>{formatMoney(currentMonth.rev)}</strong><span>of {formatMoney(currentMonth.target)} monthly target</span></div><div className="chart-legend"><i />Revenue <i className="target-dot" />Target</div></div>
          <div className="dashboard-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={state.revenueHistory} margin={{ top: 12, right: 20, left: -14, bottom: 0 }}><defs><linearGradient id="dashboard-revenue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#18846a" stopOpacity={0.13} /><stop offset="100%" stopColor="#18846a" stopOpacity={0.01} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#edf0ee" strokeDasharray="3 4" /><XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#82908b' }} dy={8} /><YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#82908b' }} tickFormatter={n => `$${n / 1000}k`} ticks={[0, 5000, 10000, 15000, 20000]} domain={[0, 20000]} /><Tooltip formatter={(value, name) => [formatMoney(value), name === 'rev' ? 'Revenue' : 'Target']} contentStyle={{ borderRadius: 10, border: '1px solid #e6eae7', fontSize: 12 }} /><Area type="monotone" dataKey="target" stroke="#bacac2" strokeDasharray="4 4" fill="none" strokeWidth={1.4} /><Area type="monotone" dataKey="rev" stroke="#20846c" strokeWidth={2.4} fill="url(#dashboard-revenue-fill)" activeDot={{ r: 5, stroke: '#fff', strokeWidth: 3 }} /></AreaChart></ResponsiveContainer></div>
          <div className="panel-footer"><span>Previous month closed at {formatMoney(priorMonth.rev)}.</span><span>June is in progress</span></div>
        </section>
      </div>

      <aside className="dashboard-secondary">
        <section className="card attention-panel">
          <div className="panel-heading"><div><h2>Needs your attention <span className="count-badge amber-count">{items.length}</span></h2><p>A few things to keep moving.</p></div></div>
          <div className="attention-items">{items.map((item, i) => <button className="attention-item" onClick={() => go(item.target)} key={i}><span className={`task-icon ${item.tone}`}><item.icon size={17} strokeWidth={1.7} /></span><span className="attention-copy"><strong>{item.title}</strong><small>{item.description}</small><span className="task-category">{item.badge}<ChevronRight size={12} /></span></span></button>)}{!items.length && <div className="empty"><Check size={24} /><p>You’re all caught up.</p></div>}</div>
          <div className="attention-footer"><span className="live-dot" />Your workspace, up to date.</div>
        </section>

        <section className="card team-panel">
          <div className="panel-heading"><div><h2>Your team</h2><p>Good care starts with your people.</p></div><button className="iconbtn" aria-label="Manage team" onClick={() => go('payroll')}><MoreHorizontal size={17} /></button></div>
          {state.providers.map(p => <button key={p.id} className="team-person" onClick={() => go('payroll')}><span className="soft-avatar" style={{ '--avatar-color': p.color }}>{initials(p.name)}<i className={p.clockedIn ? 'online' : ''} /></span><span><strong>{p.name}</strong><small>{p.role}</small></span><span className={`team-status ${p.clockedIn ? 'clocked' : ''}`}>{p.clockedIn ? 'Clocked in' : 'Off duty'}</span></button>)}
          <button className="team-footer text-button" onClick={() => go('payroll')}>Manage time & payroll <ArrowRight size={14} /></button>
        </section>

        <section className="quick-panel"><span className="quick-mark"><ClipboardList size={22} strokeWidth={1.5} /></span><h2>Less admin. More care.</h2><p>Keep your notes, charts, and client history together in one place.</p><button className="text-button" onClick={() => go('soap')}>Open clinical workspace <ArrowRight size={14} /></button><div className="quick-decoration" aria-hidden="true" /></section>
      </aside>
    </div>
    <footer className="dashboard-footer"><span>Art of Palpation <span>·</span> Thoughtfully organized.</span><span>Office Solutions</span></footer>
  </div>;
}
