import { emitBeta } from './betaBridge.js';
import React, { useReducer, useState, useMemo, useEffect, useRef, useId, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Menu, ChevronDown, ChevronsUpDown, ArrowUpRight, Sun, Calendar, Users, ClipboardList, Receipt, MessageSquare, Wallet, BarChart3, Settings,
  Lock, Unlock, Plus, Check, X, ChevronRight, Clock, AlertTriangle, ShieldCheck, Search,
  Download, CircleDollarSign, Hand, BellRing, ArrowLeft, FileText, Send, CheckCircle2,
  CircleDot, GraduationCap, Stethoscope, PersonStanding, FolderOpen, Upload, PenLine, Mic,
  Building2, FileSpreadsheet, Percent, Workflow, CreditCard, CalendarDays, MapPin, Delete, Sparkles, Tablet, Pencil, Copy, Trash2, Ban, LogIn, RotateCcw, CalendarCheck, RefreshCw, Link2, ArrowUp, ArrowDown, ArrowUpDown, Minus, Undo2, LocateFixed, Archive, ArchiveRestore, Paperclip, Image as ImageIcon, File as FileIcon, MoreVertical, MessageSquareX, Mail,
} from "lucide-react";

import Dashboard from './Dashboard.jsx';
import FieldApp, { FieldLauncher } from './FieldApp.jsx';
import './styles.css';

/* ------------------------------------------------------------------ */
/*  Art of Palpation — Office Solutions                                */
/*  A working prototype of the practice operating system.              */
/* ------------------------------------------------------------------ */



/* ----------------------------- seed data ----------------------------- */
const COLORS = ["#14554a", "#b88a32", "#5b7d97", "#9a6a16", "#7a5a8e", "#2c6b3e"];
const money = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = (n) => "$" + Math.round(n).toLocaleString("en-US");
const initials = (n) => n.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
const todayISO = "2026-06-16";

const seed = {
  practice: { name: "Art of Palpation — Plano", city: "Plano, TX", plan: { base: 50, perProvider: 5 } },
  providers: [
    { id: "p1", name: "Dana Reyes", role: "LMT", color: COLORS[0], type: "W2", pay: "Hourly + commission", rate: 22, commission: 0.4, pin: "1004", license: "MT128840", licenseDays: 58, ceHours: 8, ceNeeded: 12, clockedIn: true, clockInAt: "8:52 AM" },
    { id: "p2", name: "Marcus Hill", role: "LMT", color: COLORS[1], type: "1099", pay: "Commission", rate: 0, commission: 0.55, pin: "2231", license: "MT093312", licenseDays: 142, ceHours: 0, ceNeeded: 12, clockedIn: true, clockInAt: "9:40 AM" },
    { id: "p3", name: "Priya Nair", role: "Acupuncturist", color: COLORS[2], type: "1099", pay: "Flat-rate + commission", rate: 0, commission: 0.5, pin: "7782", license: "AC55021", licenseDays: 210, ceHours: 14, ceNeeded: 15, clockedIn: false, clockInAt: null },
  ],
  clients: [
    { id: "c1", name: "Rosa Delgado", phone: "(972) 555-0142", email: "rosa.delgado@example.com", modality: "Deep Tissue", since: "2024", type: "patient", referral: "Dr. A. Okonkwo · Orthopedics", intake: true, consent: true, balance: 0, plan: "Chronic R-shoulder tension. 6-visit plan, reassess fascia mobility at visit 4.", flags: ["Latex sensitivity"] },
    { id: "c2", name: "Trevor Books", phone: "(469) 555-0188", email: "trevor.books@example.com", modality: "Sports", since: "2025", type: "client", referral: null, intake: true, consent: true, balance: 95, plan: "Pre-event maintenance, hamstring + calf focus. Bi-weekly.", flags: [] },
    { id: "c3", name: "Aisha Carter", phone: "(214) 555-0119", email: "aisha.carter@example.com", modality: "Acupuncture", since: "2025", type: "patient", referral: "Dr. M. Reyes · Neurology", intake: true, consent: false, balance: 0, plan: "Migraine management. Weekly x4, then reassess frequency.", flags: ["Pregnant — 2nd trimester"] },
    { id: "c4", name: "Leon Whitfield", phone: "(972) 555-0177", email: "leon.whitfield@example.com", modality: "Swedish", since: "2023", type: "client", referral: null, intake: true, consent: true, balance: 0, plan: "General stress / sleep. Monthly relaxation.", flags: [] },
    { id: "c5", name: "Mina Okafor", phone: "(469) 555-0203", modality: "Deep Tissue", since: "2026", type: "client", referral: null, intake: false, consent: false, balance: 0, plan: "New client — intake pending.", flags: [] },
    { id: "c6", name: "Grant Whitman", phone: "(214) 555-0166", email: "grant.whitman@example.com", modality: "Sports", since: "2024", type: "client", referral: null, intake: true, consent: true, balance: 0, plan: "Marathon training block. Weekly lower-body.", flags: ["High blood pressure"] },
  ],
  appts: [
    { id: "a1", clientId: "c1", providerId: "p1", time: "09:00", end: "09:60", svc: "Deep Tissue 60", price: 110, room: "Room 2", status: "done", hasNote: true },
    { id: "a2", clientId: "c2", providerId: "p2", time: "10:00", end: "10:90", svc: "Sports 90", price: 150, room: "Room 1", status: "done", hasNote: false },
    { id: "a3", clientId: "c6", providerId: "p1", time: "11:30", end: "12:30", svc: "Swedish 60", price: 100, room: "Room 2", status: "booked", hasNote: false },
    { id: "a4", clientId: "c3", providerId: "p3", time: "13:00", end: "13:50", svc: "Acupuncture", price: 95, room: "Room 4", status: "booked", hasNote: false },
    { id: "a5", clientId: "c4", providerId: "p2", time: "15:00", end: "15:60", svc: "Swedish 60", price: 100, room: "Room 1", status: "booked", hasNote: false },
    { id: "a6", clientId: "c5", providerId: "p1", time: "16:30", end: "17:30", svc: "Deep Tissue 60", price: 110, room: "Room 2", status: "cxl", hasNote: false },
  ],
  notes: [
    { id: "n1", apptId: "a1", clientId: "c1", providerId: "p1", date: todayISO, modality: "Deep Tissue", s: "Reports R-shoulder tension after long work week, 5/10 at rest, 7/10 with overhead reach.", o: "Hypertonicity in upper trap and levator scapulae R>L. Limited GH abduction ~140°.", a: "Myofascial restriction consistent with postural strain. Improving vs last visit.", p: "Continue deep tissue + MFR. Home: doorway pec stretch 2x/day. Reassess visit 4.", locked: true, lockedAt: "Jun 16, 2026 · 10:04 AM" },
    { id: "n2", apptId: null, clientId: "c6", providerId: "p1", date: "2026-06-09", modality: "Sports", s: "Mid-training-block soreness, quads/calves. No acute pain.", o: "Moderate DOMS bilateral quads. Calf restriction R.", a: "Normal training load response.", p: "Flush + sports protocol. Hydration reminder.", locked: true, lockedAt: "Jun 09, 2026 · 4:22 PM" },
  ],
  invoices: [
    { id: "i1", apptId: "a1", clientId: "c1", providerId: "p1", date: todayISO, svc: "Deep Tissue 60", amount: 110, tip: 22, status: "paid", paidAt: "10:02 AM" },
    { id: "i2", apptId: "a2", clientId: "c2", providerId: "p2", date: todayISO, svc: "Sports 90", amount: 150, tip: 0, status: "due", paidAt: null },
    { id: "i3", apptId: null, clientId: "c4", providerId: "p2", date: "2026-06-14", svc: "Swedish 60", amount: 100, tip: 18, status: "paid", paidAt: "Jun 14" },
    { id: "i4", apptId: null, clientId: "c2", providerId: "p1", date: "2026-06-12", svc: "Deep Tissue 60", amount: 110, tip: 20, status: "paid", paidAt: "Jun 12" },
    { id: "i5", apptId: null, clientId: "c1", providerId: "p1", date: "2026-05-18", svc: "Oncology session (hospital bill)", amount: 135, tip: 0, status: "due", paidAt: null },
    { id: "i6", apptId: null, clientId: "c3", providerId: "p3", date: "2026-06-02", svc: "Acupuncture", amount: 95, tip: 0, status: "due", paidAt: null },
  ],
  threads: [
    { id: "t1", with: "c1", kind: "client", name: "Rosa Delgado", msgs: [
      { from: "client", text: "Hi Dana — should I keep icing the shoulder before our next session?", t: "Mon 4:12 PM" },
      { from: "me", text: "Heat is better pre-session to loosen things up. Save ice for after if it flares. See you Thursday!", t: "Mon 4:30 PM" },
    ]},
    { id: "t2", with: "c3", kind: "client", name: "Aisha Carter", msgs: [
      { from: "client", text: "Can I move my Tuesday appointment to the afternoon?", t: "Today 8:15 AM" },
    ]},
    { id: "t3", with: "p2", kind: "provider", name: "Marcus Hill", msgs: [
      { from: "provider", text: "Room 1 mic'd up for the 90-min — all good. Heading to lunch after.", t: "Today 11:35 AM" },
    ]},
  ],
  revenueHistory: [
    { m: "Jan", rev: 9800, target: 14850 }, { m: "Feb", rev: 11200, target: 14850 },
    { m: "Mar", rev: 12450, target: 14850 }, { m: "Apr", rev: 13900, target: 14850 },
    { m: "May", rev: 15600, target: 14850 }, { m: "Jun", rev: 8900, target: 14850 },
  ],
  utilByRoom: [
    { room: "Room 1", util: 82 }, { room: "Room 2", util: 91 },
    { room: "Room 3", util: 64 }, { room: "Room 4", util: 71 },
  ],
  cxlHistory: [
    { m: "Feb", cxl: 6 }, { m: "Mar", cxl: 4 }, { m: "Apr", cxl: 5 }, { m: "May", cxl: 3 }, { m: "Jun", cxl: 2 },
  ],
  payrollLog: [
    { id: "pl0", text: "Payroll run for pay period May 16–31 finalized", who: "Owner", t: "Jun 02, 2026 · 9:14 AM" },
  ],
  docs: [
    { id: "d1", clientId: "c1", name: "Referral_Okonkwo.pdf", kind: "Prescription", tier: 3, date: "Jun 10", by: "Dr. A. Okonkwo" },
    { id: "d2", clientId: "c1", name: "Intake_signed.pdf", kind: "Intake form", tier: 2, date: "Jun 11", by: null },
    { id: "d3", clientId: "c3", name: "Neuro_consult.pdf", kind: "Physician notes", tier: 3, date: "Jun 09", by: "Dr. M. Reyes" },
    { id: "d4", clientId: "c6", name: "Consent_signed.pdf", kind: "Consent", tier: 2, date: "Jun 12", by: null },
  ],
  courses: [
    { id: "ce1", title: "Human Trafficking Prevention", provider: "TDLR-approved", hours: 1, mode: "Online", required: true },
    { id: "ce2", title: "Oncology Massage Fundamentals", provider: "S4OM", hours: 6, mode: "In-person", required: false },
    { id: "ce3", title: "Ethics & Professional Boundaries", provider: "NCBTMB", hours: 3, mode: "Online", required: false },
    { id: "ce4", title: "Myofascial Release · Level 2", provider: "AOP Academy", hours: 8, mode: "In-person", required: false },
  ],
  catalog: [
    { id: "k1", name: "Deep Tissue 60", type: "service", price: 110, duration: 60, category: "Massage", taxable: false, active: true },
    { id: "k2", name: "Deep Tissue 90", type: "service", price: 160, duration: 90, category: "Massage", taxable: false, active: true },
    { id: "k3", name: "Sports 90", type: "service", price: 150, duration: 90, category: "Massage", taxable: false, active: true },
    { id: "k4", name: "Swedish 60", type: "service", price: 100, duration: 60, category: "Massage", taxable: false, active: true },
    { id: "k5", name: "Prenatal 60", type: "service", price: 120, duration: 60, category: "Massage", taxable: false, active: true },
    { id: "k6", name: "Myofascial Release 60", type: "service", price: 120, duration: 60, category: "Massage", taxable: false, active: true },
    { id: "k7", name: "Acupuncture", type: "service", price: 95, duration: 50, category: "Acupuncture", taxable: false, active: true },
    { id: "k8", name: "Oncology session (hospital)", type: "service", price: 135, duration: 60, category: "Clinical", taxable: false, active: true },
    { id: "k9", name: "Arnica recovery cream", type: "product", price: 24, duration: null, category: "Retail", taxable: true, active: true },
    { id: "k10", name: "Foam roller", type: "product", price: 38, duration: null, category: "Retail", taxable: true, active: true },
    { id: "k11", name: "Heat pack", type: "product", price: 18, duration: null, category: "Retail", taxable: true, active: true },
    { id: "k12", name: "Gift card — $100", type: "product", price: 100, duration: null, category: "Gift", taxable: false, active: true },
  ],
  invoiceSettings: { prefix: "INV", dueDays: 14, taxRate: 8.25, note: "Thank you for trusting us with your care." },
  findings: {
    c1: [
      { id: "f1", regionId: "muscle.upper_trapezius.R", label: "Right upper trapezius", side: "R", sev: "mod", note: "Hypertonicity; TrP referral toward scapula.", view: "posterior", ts: Date.now() - 86400000 * 9 },
      { id: "f2", regionId: "surface.posterior_neck.midline", label: "Posterior neck", side: "midline", sev: "mild", note: "Reduced R cervical rotation ~15°.", view: "posterior", ts: Date.now() - 86400000 * 9 },
      { id: "f3", regionId: "muscle.upper_trapezius.R", label: "Right upper trapezius", side: "R", sev: "mild", note: "Tone improved; TrP less reactive.", pain: 3, view: "posterior", ts: Date.now() - 86400000 * 2 },
    ],
  },
  payables: [
    { id: "ap1", vendor: "Suite rent — Plano", amount: 2400, due: "Jul 01", status: "upcoming" },
    { id: "ap2", vendor: "Linens & supplies", amount: 318, due: "Jun 24", status: "upcoming" },
    { id: "ap3", vendor: "Stripe processing (May)", amount: 212, due: "Jun 03", status: "paid" },
  ],
};

/* ----------------------------- reducer ----------------------------- */
function reducer(state, action) {
  switch (action.type) {
    case "COMPLETE_APPT": {
      const ap = state.appts.find((a) => a.id === action.id);
      if (!ap || (ap.status !== "booked" && ap.status !== "arrived")) return state;
      const inv = { id: "i" + Date.now(), apptId: ap.id, clientId: ap.clientId, providerId: ap.providerId, date: todayISO, svc: ap.svc, amount: ap.price, tip: 0, status: "due", paidAt: null };
      return {
        ...state,
        appts: state.appts.map((a) => (a.id === action.id ? { ...a, status: "done" } : a)),
        invoices: [inv, ...state.invoices],
      };
    }
    case "CANCEL_APPT":
      return { ...state, appts: state.appts.map((a) => (a.id === action.id ? { ...a, status: "cxl" } : a)) };
    case "ADD_APPT":
      return { ...state, appts: [...state.appts, { ...action.appt, id: "a" + Date.now(), status: "booked", hasNote: false }] };
    case "UPDATE_APPT":
      return { ...state, appts: state.appts.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)) };
    case "SET_STATUS":
      return { ...state, appts: state.appts.map((a) => (a.id === action.id ? { ...a, status: action.status } : a)) };
    case "SAVE_NOTE": {
      const exists = state.notes.find((n) => n.id === action.note.id);
      // Autosave is never an unlock mechanism. A locked record can only be
      // changed after UNLOCK_NOTE has explicitly cleared its lock.
      if (exists?.locked) return state;
      const note = { ...action.note, locked: false, lockedAt: null };
      const notes = exists ? state.notes.map((n) => (n.id === note.id ? note : n)) : [note, ...state.notes];
      const appts = note.apptId
        ? state.appts.map((a) => (a.id === note.apptId ? { ...a, hasNote: true } : a))
        : state.appts;
      return { ...state, notes, appts };
    }
    case "LOCK_NOTE":
      return { ...state, notes: state.notes.map((n) => (n.id === action.id ? { ...n, locked: true, lockedAt: action.at } : n)) };
    case "UNLOCK_NOTE":
      return { ...state, notes: state.notes.map((n) => (n.id === action.id ? { ...n, locked: false, lockedAt: null } : n)) };
    case "PAY_INVOICE":
      return { ...state, invoices: state.invoices.map((i) => (i.id === action.id ? { ...i, status: "paid", paidAt: action.at, tip: action.tip ?? i.tip } : i)) };
    case "SEND_MSG":
      return { ...state, threads: state.threads.map((t) => (t.id === action.id ? { ...t, msgs: [...t.msgs, { id: "m" + Date.now(), from: "me", text: action.text, t: "Just now", files: action.files || [] }] } : t)) };
    case "DELETE_MSG":
      return { ...state, threads: state.threads.map((t) => (t.id === action.id ? { ...t, msgs: t.msgs.filter((m, i) => !(i === action.idx && m.from === "me")) } : t)) };
    case "DELETE_THREAD":
      return { ...state, threads: state.threads.filter((t) => t.id !== action.id) };
    case "TOGGLE_CLOCK":
      return { ...state, providers: state.providers.map((p) => (p.id === action.id ? { ...p, clockedIn: !p.clockedIn, clockInAt: !p.clockedIn ? action.at : null } : p)) };
    case "RUN_PAYROLL":
      return { ...state, payrollLog: [{ id: "pl" + Date.now(), text: action.text, who: "Owner", t: action.at }, ...state.payrollLog] };
    case "ADD_DOC":
      return { ...state, docs: [action.doc, ...state.docs] };
    case "SIGN_CONSENT":
      return { ...state, clients: state.clients.map((c) => (c.id === action.id ? { ...c, consent: true } : c)) };
    case "ENROLL_CE":
      return { ...state, providers: state.providers.map((p) => (p.id === action.providerId ? { ...p, ceHours: Math.min(p.ceNeeded, p.ceHours + action.hours) } : p)) };
    case "ADD_CLIENT":
      return { ...state, clients: [...state.clients, { ...action.client, id: "c" + Date.now() }] };
    case "UPDATE_CLIENT":
      return { ...state, clients: state.clients.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)) };
    case "ARCHIVE_CLIENT":
      return { ...state, clients: state.clients.map((c) => (c.id === action.id ? { ...c, archived: true } : c)) };
    case "RESTORE_CLIENT":
      return { ...state, clients: state.clients.map((c) => (c.id === action.id ? { ...c, archived: false } : c)) };
    case "REMOVE_CLIENT":
      return { ...state, clients: state.clients.filter((c) => c.id !== action.id), appts: state.appts.filter((a) => a.clientId !== action.id), docs: state.docs.filter((d) => d.clientId !== action.id), threads: state.threads.filter((t) => t.refId !== action.id) };
    case "ADD_INVOICE":
      return { ...state, invoices: [{ ...action.inv, id: "i" + Date.now() }, ...state.invoices] };
    case "UPDATE_INVOICE":
      return { ...state, invoices: state.invoices.map((i) => (i.id === action.id ? { ...i, ...action.patch } : i)) };
    case "VOID_INVOICE":
      return { ...state, invoices: state.invoices.map((i) => (i.id === action.id ? { ...i, status: "void" } : i)) };
    case "ADD_THREAD":
      return { ...state, threads: [{ ...action.thread, id: action.thread.id || "t" + Date.now() }, ...state.threads] };
    case "UPDATE_PRACTICE":
      return { ...state, practice: { ...state.practice, ...action.patch } };
    case "ADD_PROVIDER":
      return { ...state, providers: [...state.providers, { ...action.provider, id: "p" + Date.now() }] };
    case "UPDATE_PROVIDER":
      return { ...state, providers: state.providers.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)) };
    case "REMOVE_PROVIDER":
      return { ...state, providers: state.providers.filter((p) => p.id !== action.id) };
    case "UPDATE_DOC":
      return { ...state, docs: state.docs.map((d) => (d.id === action.id ? { ...d, ...action.patch } : d)) };
    case "REMOVE_DOC":
      return { ...state, docs: state.docs.filter((d) => d.id !== action.id) };
    case "ADD_PAYABLE":
      return { ...state, payables: [{ ...action.payable, id: "ap" + Date.now() }, ...state.payables] };
    case "SET_FINDINGS":
      return { ...state, findings: { ...(state.findings || {}), [action.clientId]: action.findings } };
    case "ADD_ITEM":
      return { ...state, catalog: [...(state.catalog || []), { ...action.item, id: "k" + Date.now() }] };
    case "UPDATE_ITEM":
      return { ...state, catalog: (state.catalog || []).map((it) => (it.id === action.id ? { ...it, ...action.patch } : it)) };
    case "REMOVE_ITEM":
      return { ...state, catalog: (state.catalog || []).filter((it) => it.id !== action.id) };
    case "UPDATE_INVOICE_SETTINGS":
      return { ...state, invoiceSettings: { ...(state.invoiceSettings || {}), ...action.patch } };
    case "REMOVE_INVOICE":
      return { ...state, invoices: state.invoices.filter((i) => i.id !== action.id) };
    case "UPDATE_PAYABLE":
      return { ...state, payables: state.payables.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)) };
    case "REMOVE_PAYABLE":
      return { ...state, payables: state.payables.filter((p) => p.id !== action.id) };
    case "PAY_PAYABLE":
      return { ...state, payables: state.payables.map((p) => (p.id === action.id ? { ...p, status: "paid" } : p)) };
    default:
      return state;
  }
}

/* ----------------------------- helpers ----------------------------- */
const fmtTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(Math.min(m, 59)).padStart(2, "0")} ${ap}`;
};
const NAV = [
  { id: "today", label: "Today", icon: Sun, group: "Overview" },
  { id: "reports", label: "Reports", icon: BarChart3, group: "Overview" },
  { id: "schedule", label: "Schedule", icon: Calendar, group: "Front office" },
  { id: "clients", label: "Clients", icon: Users, group: "Front office" },
  { id: "messages", label: "Messages", icon: MessageSquare, group: "Front office" },
  { id: "soap", label: "SOAP Notes", icon: ClipboardList, group: "Clinical" },
  { id: "charting", label: "Charting", icon: PersonStanding, group: "Clinical" },
  { id: "documents", label: "Documents", icon: FolderOpen, group: "Clinical" },
  { id: "payments", label: "Payments", icon: Receipt, group: "Billing" },
  { id: "invoicing", label: "Invoicing", icon: FileText, group: "Billing" },
  { id: "payroll", label: "Payroll", icon: Wallet, group: "Billing" },
  { id: "academy", label: "Academy", icon: GraduationCap, group: "Practice" },
  { id: "settings", label: "Settings", icon: Settings, group: "Practice" },
  { id: "flows", label: "Flows", icon: Workflow, group: "Tools" },
  { id: "kiosk", label: "Field App", icon: Tablet, group: "Tools" },
];
const NAV_GROUPS = ["Overview", "Front office", "Clinical", "Billing", "Practice", "Tools"];
const MOBILE_TABS = ["today", "schedule", "clients", "soap", "charting"];

/* ----------------------------- App ----------------------------- */
/**
 * @typedef {{ onReportFlowStep?: (report: { flowId: string, flowName: string, nodeId: string, nodeLabel: string, kind: "issue" | "feedback" }) => void, isAdmin?: boolean, onOpenAdmin?: () => void }} LegacyAppProps
 */
/** @param {LegacyAppProps} [props] */
export default function App(props = {}) {
  const { onReportFlowStep, isAdmin = false, onOpenAdmin } = props;
  const [state, rawDispatch] = useReducer(reducer, seed);
  const [view, setView] = useState("today");
  const viewRef = useRef(view);
  viewRef.current = view;
  const dispatch = useCallback((action) => {
    if (action && action.type === "LOCK_NOTE") emitBeta("assessment_saved", viewRef.current);
    if (action && action.type === "PAY_INVOICE") emitBeta("checkout_demo", viewRef.current);
    rawDispatch(action);
  }, []);
  useEffect(() => { emitBeta("screen_view", view); }, [view]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTrigger = useRef(null);
  useEffect(() => {
    const handle = (event) => { if ((event.metaKey || event.ctrlKey) && event.key === "k") { event.preventDefault(); setSearchOpen(value => !value); } };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);
  const [selClient, setSelClient] = useState(null);
  const [selNote, setSelNote] = useState(null);
  const [selThread, setSelThread] = useState(state.threads[0].id);
  const [keypad, setKeypad] = useState(null); // provider id to clock toggle
  const [newAppt, setNewAppt] = useState(false);
  const [payModal, setPayModal] = useState(null); // invoice id
  const [kioskOpen, setKioskOpen] = useState(false);
  const [flows, setFlows] = useState(() => JSON.parse(JSON.stringify(FLOWS)));
  const [flowNotes, setFlowNotes] = useState({});
  const [apptFocus, setApptFocus] = useState(null);
  const [chartFocus, setChartFocus] = useState(null);
  const [cal, setCal] = useState({ detail: false, google: { connected: false }, outlook: { connected: false }, apple: { connected: false } });

  const prov = (id) => state.providers.find((p) => p.id === id);
  const client = (id) => state.clients.find((c) => c.id === id);

  const dueNotes = state.appts.filter((a) => a.status === "done" && !state.notes.some((n) => n.apptId === a.id && n.locked)).length;
  const dueInvoices = state.invoices.filter((i) => i.status === "due").length;
  const newMsgs = state.threads.filter((t) => t.msgs.length && t.msgs[t.msgs.length - 1].from !== "me").length;

  const badges = { soap: dueNotes, payments: dueInvoices, messages: newMsgs };
  const title = NAV.find((n) => n.id === view)?.label;

  const go = (v) => { setMobileOpen(false); setView(v); setSelClient(null); setSelNote(null); setApptFocus(null); setChartFocus(null); window.scrollTo(0, 0); };

  return (
    <div className="aop">

      <div className="shell" inert={kioskOpen}>
        {/* sidebar */}
        {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
        <aside className={`side ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Main navigation">
          <div className="brand">
            <div className="mark"><Hand size={20} /></div>
            <div>
              <div className="wt serif">Art of Palpation</div>
              <div className="ws">Office Solutions</div>
            </div>
          </div>
          <button className="practice-switcher" onClick={() => go('settings')}><span className="practice-icon"><Building2 size={17} /></span><span><strong>Plano practice</strong><small>Your workspace</small></span><ChevronsUpDown size={14} /></button>
          <nav className="nav" aria-label="Workspace">
            {NAV_GROUPS.map((g) => (
              <div key={g}>
                <div className="nav-group-label">{g}</div>
                {NAV.filter((n) => n.group === g).map((n) => (
                  <button key={n.id} className={view === n.id ? "on" : ""} aria-current={view === n.id ? 'page' : undefined} onClick={() => go(n.id)}>
                    <n.icon size={17} /> {n.label}
                    {badges[n.id] > 0 && <span className="badge">{badges[n.id]}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom"><span className="workspace-demo"><span className="live-dot" />Demo workspace</span><button className="sidebar-user" onClick={() => go('settings')}><span className="owner-avatar">OW</span><span><strong>Practice owner</strong><small>Workspace administrator</small></span><ChevronsUpDown size={14} /></button></div>
        </aside>

        {/* main */}
        <div className="main">
          <header className="topbar">
            <button className="iconbtn mobile-menu" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(v => !v)}><Menu size={19} /></button>
            <div className="topbar-breadcrumb"><span>Workspace</span><ChevronRight size={13} /><strong>{title}</strong></div>
            <div className="spacer" />
            <button ref={searchTrigger} aria-label="Search workspace" className="workspace-search" onClick={() => { setSearchQuery(''); setSearchOpen(true); }}><Search size={16} /><span>Search anything...</span><kbd>⌘ K</kbd></button>
            <div className="topbar-divider" />
            <button className="notification-button" aria-label={`Open messages, ${newMsgs} unread conversations`} onClick={() => go('messages')}><BellRing size={18} />{newMsgs > 0 && <i />}</button>
            {isAdmin && typeof onOpenAdmin === "function" && <button className="btn ghost sm" onClick={onOpenAdmin}><Users size={14} /> Admin / Manage users</button>}
            {!kioskOpen && <button className="btn ghost sm" onClick={() => setKioskOpen(true)}><Tablet size={15} /> Kiosk Mode</button>}
            <button className="owner-avatar topbar-owner" aria-label="Open account settings" onClick={() => go('settings')}>OW</button>
          </header>

          <main className="content" id="main-content">
            {view !== 'today' && <div className="section-page-heading"><div className="eyebrow">{NAV.find(n => n.id === view)?.group}</div><h1>{title}</h1><p>{({ schedule: 'Make room for a well-planned day.', clients: 'Every client. Every detail. In one place.', soap: 'Thoughtful documentation for better continuity of care.', charting: 'A clearer picture of every assessment.', documents: 'Keep important records close at hand.', payments: 'A simple view of payments and balances.', invoicing: 'Keep your practice finances organized.', messages: 'Keep the conversation going.', reports: 'Understand how your practice is doing.', payroll: 'Take care of the people behind the care.', settings: 'Your practice, set up your way.', academy: 'Keep learning. Keep growing.', flows: 'A little guidance for the work ahead.', kiosk: 'Bring your workspace to the point of care.' })[view]}</p></div>}
            {view === "today" && <Dashboard {...{ state, dispatch, prov, client, go, dueNotes, dueInvoices, setApptFocus, setNewAppt }} date={todayISO} />}
            {view === "schedule" && <Schedule {...{ state, dispatch, prov, client, setNewAppt, cal, setCal, apptFocus, clearApptFocus: () => setApptFocus(null) }} />}
            {view === "clients" && !selClient && <Clients {...{ state, dispatch, setSelClient }} />}
            {view === "clients" && selClient && <ClientDetail {...{ state, dispatch, prov, client, id: selClient, back: () => setSelClient(null), openNote: (n) => { setSelNote(n); setView("soap"); }, setNewAppt, openPay: setPayModal, go, setSelThread, setApptFocus, setChartFocus }} />}
            {view === "soap" && !selNote && <SoapList {...{ state, prov, client, open: setSelNote }} />}
            {view === "soap" && selNote && <SoapEditor {...{ note: selNote, state, dispatch, prov, client, back: () => setSelNote(null) }} />}
            {view === "payments" && <Payments {...{ state, dispatch, client, prov, openPay: setPayModal, go, setSelClient, setApptFocus }} />}
            {view === "messages" && <Messages {...{ state, dispatch, selThread, setSelThread }} />}
            {view === "payroll" && <Payroll {...{ state, dispatch, prov, setKeypad }} />}
            {view === "flows" && <Flows flows={flows} setFlows={setFlows} flowNotes={flowNotes} setFlowNotes={setFlowNotes} onReportFlowStep={onReportFlowStep} />}
            {view === "kiosk" && <FieldLauncher onOpen={() => setKioskOpen(true)} />}
            {view === "charting" && <Charting {...{ state, dispatch, client, chartFocus, clearChartFocus: () => setChartFocus(null) }} />}
            {view === "documents" && <Documents {...{ state, dispatch, client, go, setSelClient }} />}
            {view === "invoicing" && <Invoicing {...{ state, dispatch, client, prov, openPay: setPayModal, go, setSelClient, setApptFocus }} />}
            {view === "academy" && <Academy {...{ state, dispatch, prov }} />}
            {view === "reports" && <Reports {...{ state }} />}
            {view === "settings" && <SettingsView {...{ state, dispatch }} />}
          </main>
        </div>
      </div>

      {searchOpen && <Modal title="Search your workspace" onClose={() => { setSearchOpen(false); searchTrigger.current?.focus(); }}>
        <div className="command-search"><Search size={18} /><input aria-label="Search pages and clients" data-autofocus autoFocus placeholder="Search pages and clients…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
        <div className="command-results"><div className="eyebrow">PAGES</div>{NAV.filter(n => `${n.label} ${n.group}`.toLowerCase().includes(searchQuery.toLowerCase())).map(n => <button key={n.id} onClick={() => { go(n.id); setSearchOpen(false); }}><n.icon size={17} /><span>{n.label}</span><small>{n.group}</small><ChevronRight size={14} /></button>)}
        <div className="eyebrow">CLIENTS</div>{state.clients.filter(c => !c.archived && `${c.name} ${c.email || ''}`.toLowerCase().includes(searchQuery.toLowerCase())).map(c => <button key={c.id} onClick={() => { go('clients'); setSelClient(c.id); setSearchOpen(false); }}><Users size={17} /><span>{c.name}</span><ChevronRight size={14} /></button>)}
        {!NAV.some(n => `${n.label} ${n.group}`.toLowerCase().includes(searchQuery.toLowerCase())) && !state.clients.some(c => !c.archived && `${c.name} ${c.email || ''}`.toLowerCase().includes(searchQuery.toLowerCase())) && <div className="empty">No results for “{searchQuery}”. Try a client name or a page.</div>}
        </div>
      </Modal>}

      {/* mobile tab bar */}
      <nav className="tabbar" inert={kioskOpen}>
        {MOBILE_TABS.map((id) => NAV.find((n) => n.id === id)).map((n) => (
          <button key={n.id} className={view === n.id ? "on" : ""} aria-current={view === n.id ? 'page' : undefined} onClick={() => go(n.id)}>
            <n.icon size={19} /> {n.label.split(" ")[0]}
          </button>
        ))}
      </nav>

      {keypad && <Keypad provider={prov(keypad)} onClose={() => setKeypad(null)} onSuccess={(at) => { dispatch({ type: "TOGGLE_CLOCK", id: keypad, at }); setKeypad(null); }} />}
      {newAppt && <NewApptModal {...{ state, prov, client, onClose: () => setNewAppt(false), onSave: (a) => { dispatch({ type: "ADD_APPT", appt: a }); setNewAppt(false); },
        initial: typeof newAppt === "object" && newAppt.clientId ? { clientId: newAppt.clientId, providerId: state.providers[0].id, time: "14:00", svc: "Deep Tissue 60", price: 110, room: "Room 2" } : undefined }} />}
      {payModal && <PayModal {...{ inv: state.invoices.find((i) => i.id === payModal), client, onClose: () => setPayModal(null), onPay: (tip) => { dispatch({ type: "PAY_INVOICE", id: payModal, at: "Just now", tip }); setPayModal(null); } }} />}
      {kioskOpen && <FieldApp Assessment={BodyAssessment} onClose={() => setKioskOpen(false)} />}
    </div>
  );
}

/* ----------------------------- Today ----------------------------- */
function Kpi({ label, icon: Ico, val, delta, up }) {
  return (
    <div className="card kpi">
      <div className="lab"><Ico size={14} /> {label}</div>
      <div className="val serif">{val}</div>
      <div className={`delta ${up ? "up" : "muted"}`}>{delta}</div>
    </div>
  );
}

/* ----------------------------- DataTable (sortable + filterable) ----------------------------- */
function DataTable({ columns, rows, search, searchPlaceholder, filters, defaultSort, onRowClick, footer, empty }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState(defaultSort || null);
  const [fv, setFv] = useState({});
  const val = (c, r) => (c.sortVal ? c.sortVal(r) : c.filterVal ? c.filterVal(r) : r[c.key]);
  const text = (c, r) => (c.filterVal ? c.filterVal(r) : c.sortVal ? c.sortVal(r) : r[c.key]);
  let data = rows;
  if (search && q.trim()) { const s = q.toLowerCase(); data = data.filter((r) => columns.some((c) => { const v = text(c, r); return v != null && String(v).toLowerCase().includes(s); })); }
  (filters || []).forEach((f) => { const v = fv[f.key]; if (v && v !== "all") data = data.filter((r) => f.test(r, v)); });
  if (sort) {
    const col = columns.find((c) => c.key === sort.key);
    if (col) data = data.slice().sort((a, b) => {
      const va = val(col, a), vb = val(col, b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va ?? "").localeCompare(String(vb ?? ""), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }
  const toggle = (key) => setSort((s) => (!s || s.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));
  const dirty = q || Object.values(fv).some((v) => v && v !== "all");
  const hasBar = search || (filters && filters.length);
  return (
    <>
      {hasBar && (
        <div className="row" style={{ gap: 8, padding: "12px 16px 6px", flexWrap: "wrap", alignItems: "center" }}>
          {search && <div className="searchbar" style={{ maxWidth: 240 }}><Search size={15} color="var(--muted-2)" /><input placeholder={searchPlaceholder || "Search"} value={q} onChange={(e) => setQ(e.target.value)} /></div>}
          {(filters || []).map((f) => (
            <select key={f.key} className="sel" style={{ maxWidth: 170 }} value={fv[f.key] || "all"} onChange={(e) => setFv({ ...fv, [f.key]: e.target.value })}>
              <option value="all">{f.label}: all</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          {dirty && <button className="btn ghost sm" onClick={() => { setQ(""); setFv({}); }}>Clear</button>}
          <span className="tiny" style={{ marginLeft: "auto" }}>{data.length} of {rows.length}</span>
        </div>
      )}
      <table className="tbl">
        <thead><tr>
          {columns.map((c) => {
            const on = sort && sort.key === c.key; const sortable = c.sortable !== false && c.label;
            return (
              <th key={c.key} className={c.align === "num" ? "num" : ""} onClick={sortable ? () => toggle(c.key) : undefined} style={sortable ? { cursor: "pointer", userSelect: "none" } : {}}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                  {c.label}{sortable && <span style={{ display: "inline-flex", opacity: on ? 1 : 0.35 }}>{on ? (sort.dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} />}</span>}
                </span>
              </th>
            );
          })}
        </tr></thead>
        <tbody>
          {data.map((r, i) => (
            <tr key={r.id || i} className={onRowClick ? "click" : ""} onClick={onRowClick ? () => onRowClick(r) : undefined}>
              {columns.map((c) => <td key={c.key} className={c.align === "num" ? "num" : ""}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={columns.length} className="muted" style={{ padding: 18, textAlign: "center" }}>{empty || "Nothing matches these filters."}</td></tr>}
          {footer}
        </tbody>
      </table>
    </>
  );
}

/* ----------------------------- Schedule ----------------------------- */
const APPT_STATUS = {
  booked: { label: "Booked", bg: "var(--sage)", fg: "#0E3D35" },
  arrived: { label: "Checked in", bg: "#F6ECD4", fg: "#9A6A16" },
  done: { label: "Completed", bg: "#E4EFE5", fg: "#2C6B3E" },
  noshow: { label: "No-show", bg: "#F6E3E1", fg: "#A23C37" },
  cxl: { label: "Cancelled", bg: "#EFEFEE", fg: "#5F6F6A" },
};
const apptPill = (s) => <span style={{ fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: 20, background: APPT_STATUS[s].bg, color: APPT_STATUS[s].fg, whiteSpace: "nowrap" }}>{APPT_STATUS[s].label}</span>;

const invNum = (inv, state) => `${(state.invoiceSettings && state.invoiceSettings.prefix) || "INV"}-` + String(inv.id).replace(/^i/, "").toUpperCase().slice(-6).padStart(4, "0");

/* iCalendar export — imports into Google, Outlook, and Apple */
const ics_pad = (n) => String(n).padStart(2, "0");
const ics_mins = (svc) => { const m = String(svc).match(/(\d{2,3})\s*$/); return m ? +m[1] : 60; };
const ics_add = (hhmm, mins) => { let [h, m] = hhmm.split(":").map(Number); let t = h * 60 + m + mins; return ics_pad(Math.floor(t / 60) % 24) + ":" + ics_pad(t % 60); };
const ics_esc = (s) => String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
function buildICS(appts, { detail, prov, client, dateISO }) {
  const dt = (hhmm) => dateISO.replace(/-/g, "") + "T" + hhmm.replace(":", "") + "00";
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AOP Office Solutions//Schedule//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  appts.forEach((a) => {
    const c = client(a.clientId), p = prov(a.providerId);
    const end = ics_add(a.time, ics_mins(a.svc));
    const summary = detail ? `${c.name} — ${a.svc}` : `Appointment · ${a.room}`;
    const desc = detail ? `Client: ${c.name}\nService: ${a.svc}\nProvider: ${p.name}\nStatus: ${APPT_STATUS[a.status] ? APPT_STATUS[a.status].label : a.status}` : `Provider: ${p.name}`;
    out.push("BEGIN:VEVENT", `UID:aop-${a.id}@artofpalpation`, `DTSTAMP:${stamp}`, `DTSTART:${dt(a.time)}`, `DTEND:${dt(end)}`,
      `SUMMARY:${ics_esc(summary)}`, `LOCATION:${ics_esc(a.room)}`, `DESCRIPTION:${ics_esc(desc)}`, `STATUS:${a.status === "cxl" ? "CANCELLED" : "CONFIRMED"}`, "END:VEVENT");
  });
  out.push("END:VCALENDAR");
  return out.join("\r\n");
}
function downloadFile(name, text, mime) {
  const blob = new Blob([text], { type: mime || "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Schedule({ state, dispatch, prov, client, setNewAppt, cal, setCal, apptFocus, clearApptFocus }) {
  const [tab, setTab] = useState("appts"); // appts | sync
  const [filter, setFilter] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [selAppt, setSelAppt] = useState(apptFocus || null);
  const [editId, setEditId] = useState(null);

  const list = state.appts
    .filter((a) => filter === "all" || a.providerId === filter)
    .filter((a) => statusF === "all" || a.status === statusF)
    .slice().sort((a, b) => a.time.localeCompare(b.time));
  const active = state.appts.filter((a) => a.status !== "cxl" && a.status !== "noshow");
  const count = (s) => state.appts.filter((a) => a.status === s).length;
  const sel = selAppt ? state.appts.find((a) => a.id === selAppt) : null;
  const editing = editId ? state.appts.find((a) => a.id === editId) : null;

  if (sel) {
    return (
      <>
        <ApptDetail appt={sel} dispatch={dispatch} prov={prov} client={client} onBack={() => { setSelAppt(null); if (clearApptFocus) clearApptFocus(); }} onEdit={() => setEditId(sel.id)} />
        {editing && <NewApptModal
          state={state} prov={prov} client={client}
          title="Edit appointment" cta="Save changes"
          initial={{ clientId: editing.clientId, providerId: editing.providerId, time: editing.time, svc: editing.svc, price: editing.price, room: editing.room }}
          onClose={() => setEditId(null)}
          onSave={(patch) => { dispatch({ type: "UPDATE_APPT", id: editId, patch }); setEditId(null); }}
        />}
      </>
    );
  }

  const tabs = (
    <div className="row" style={{ gap: 6, marginBottom: 16 }}>
      <button className={"btn sm" + (tab === "appts" ? " pri" : "")} onClick={() => setTab("appts")}><Calendar size={13} /> Appointments</button>
      <button className={"btn sm" + (tab === "sync" ? " pri" : "")} onClick={() => setTab("sync")}><CalendarCheck size={13} /> Calendar sync</button>
    </div>
  );
  if (tab === "sync") return (<>{tabs}<CalendarSync {...{ state, prov, client, cal, setCal }} /></>);

  return (
    <>
      {tabs}
      <div className="row" style={{ gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select className="sel" style={{ maxWidth: 180 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All providers</option>
          {state.providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="sel" style={{ maxWidth: 160 }} value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="booked">Booked</option>
          <option value="arrived">Checked in</option>
          <option value="done">Completed</option>
          <option value="noshow">No-show</option>
          <option value="cxl">Cancelled</option>
        </select>
        <div className="spacer" />
        <button className="btn" onClick={() => downloadFile("aop-schedule.ics", buildICS(state.appts, { detail: false, prov, client, dateISO: todayISO }), "text/calendar")}><CalendarCheck size={15} /> Export .ics</button>
        <button className="btn pri" onClick={() => setNewAppt(true)}><Plus size={15} /> New appointment</button>
      </div>

      <div className="grid kpis" style={{ marginBottom: 16 }}>
        <Kpi label="Booked" icon={Calendar} val={String(count("booked"))} delta="awaiting arrival" />
        <Kpi label="Checked in" icon={LogIn} val={String(count("arrived"))} delta="in the building" />
        <Kpi label="Completed" icon={Check} val={String(count("done"))} delta="today" up />
        <Kpi label="Expected revenue" icon={CircleDollarSign} val={money0(active.reduce((s, a) => s + a.price, 0))} delta={`${active.length} active visits`} />
      </div>

      <div className="card">
        <div className="sec-h"><h3>Tuesday, June 16, 2026</h3><span className="tiny">{list.length} shown</span></div>
        <div>
          {list.map((a) => {
            const p = prov(a.providerId), c = client(a.clientId);
            return (
              <div className="appt" key={a.id} style={{ cursor: "pointer" }} onClick={() => setSelAppt(a.id)}>
                <span className="time">{fmtTime(a.time)}</span>
                <div className="avatar" style={{ background: p.color, width: 32, height: 32, fontSize: 12 }}>{initials(c.name)}</div>
                <div className="meta">
                  <div className="nm">{c.name} <span className="muted" style={{ fontWeight: 400 }}>· {money0(a.price)}</span></div>
                  <div className="det">{a.svc} · {p.name} · {a.room}</div>
                </div>
                <div className="row" style={{ gap: 10, alignItems: "center" }}>{apptPill(a.status)}<ChevronRight size={16} color="var(--muted-2)" /></div>
              </div>
            );
          })}
          {list.length === 0 && <div className="muted" style={{ padding: "18px 4px", fontSize: 13.5 }}>No appointments match these filters.</div>}
        </div>
      </div>
    </>
  );
}

function ApptDetail({ appt, dispatch, prov, client, onBack, onEdit }) {
  const a = appt, p = prov(a.providerId), c = client(a.clientId);
  const Row = ({ k, v, last }) => (
    <div className="row" style={{ justifyContent: "space-between", padding: "9px 0", borderBottom: last ? "none" : "1px solid var(--border)" }}>
      <span className="muted" style={{ fontSize: 13 }}>{k}</span><span style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
  return (
    <>
      <div className="row" style={{ gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn ghost sm" onClick={onBack}><ArrowLeft size={14} /> Schedule</button>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
        {apptPill(a.status)}
        <button className="btn" style={{ marginLeft: "auto" }} onClick={() => downloadFile(`appt-${a.id}.ics`, buildICS([a], { detail: true, prov, client, dateISO: todayISO }), "text/calendar")}><CalendarCheck size={14} /> Add to calendar</button>
        <button className="btn" onClick={onEdit}><Pencil size={14} /> Edit</button>
      </div>

      <div className="two" style={{ alignItems: "start" }}>
        <section className="card pad">
          <div className="tiny" style={{ marginBottom: 10 }}>Appointment</div>
          <Row k="Time" v={fmtTime(a.time)} />
          <Row k="Service" v={a.svc} />
          <Row k="Provider" v={`${p.name} · ${p.role}`} />
          <Row k="Room" v={a.room} />
          <Row k="Price" v={money0(a.price)} />
          <Row k="Documentation" v={a.hasNote ? "SOAP note on file" : "No note yet"} last />
        </section>
        <section className="card pad">
          <div className="tiny" style={{ marginBottom: 10 }}>Client</div>
          <Row k="Name" v={c.name} />
          <Row k="Phone" v={c.phone} />
          <Row k="Type" v={c.type === "patient" ? "Patient (doctor-referred)" : "Client (walk-in)"} />
          {c.referral && <Row k="Referring MD" v={c.referral} />}
          <Row k="Intake" v={c.intake ? "Complete" : "Pending"} />
          <Row k="Consent" v={c.consent ? "Signed" : "Not signed"} last={!(c.flags && c.flags.length)} />
          {c.flags && c.flags.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Flags</div>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>{c.flags.map((f) => <span key={f} style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 16, background: "#F6E3E1", color: "#A23C37" }}>{f}</span>)}</div>
            </div>
          )}
        </section>
      </div>

      {c.plan && (
        <section className="card pad" style={{ marginTop: 16 }}>
          <div className="tiny" style={{ marginBottom: 8 }}>Treatment plan</div>
          <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{c.plan}</div>
        </section>
      )}

      <section className="card pad" style={{ marginTop: 16 }}>
        <div className="tiny" style={{ marginBottom: 12 }}>Manage status</div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {a.status === "booked" && <>
            <button className="btn" onClick={() => dispatch({ type: "SET_STATUS", id: a.id, status: "arrived" })}><LogIn size={14} /> Check in</button>
            <button className="btn pri" onClick={() => dispatch({ type: "COMPLETE_APPT", id: a.id })}><Check size={14} /> Complete visit</button>
            <button className="btn" onClick={() => dispatch({ type: "SET_STATUS", id: a.id, status: "noshow" })}><Ban size={14} /> No-show</button>
            <button className="btn" style={{ color: "var(--rose)" }} onClick={() => dispatch({ type: "SET_STATUS", id: a.id, status: "cxl" })}><X size={14} /> Cancel</button>
          </>}
          {a.status === "arrived" && <>
            <button className="btn pri" onClick={() => dispatch({ type: "COMPLETE_APPT", id: a.id })}><Check size={14} /> Complete visit</button>
            <button className="btn" onClick={() => dispatch({ type: "SET_STATUS", id: a.id, status: "noshow" })}><Ban size={14} /> No-show</button>
          </>}
          {(a.status === "noshow" || a.status === "cxl") &&
            <button className="btn" onClick={() => dispatch({ type: "SET_STATUS", id: a.id, status: "booked" })}><RotateCcw size={14} /> Rebook</button>}
          {a.status === "done" && <span className="muted" style={{ fontSize: 13 }}>Visit completed — invoice generated. Use Edit to reschedule if needed.</span>}
        </div>
      </section>
    </>
  );
}

function NewApptModal({ state, prov, client, onClose, onSave, initial, title, cta }) {
  const active = state.clients.filter((c) => !c.archived);
  const [f, setF] = useState(initial || { clientId: (active[0] || state.clients[0]).id, providerId: state.providers[0].id, time: "14:00", svc: "Deep Tissue 60", price: 110, room: "Room 2" });
  const up = (k, v) => setF({ ...f, [k]: v });
  return (
    <Modal title={title || "New appointment"} onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn pri" onClick={() => onSave(f)}>{cta || "Book appointment"}</button>
    </>}>
      <div className="field"><label>Client</label>
        <select className="sel" value={f.clientId} onChange={(e) => up("clientId", e.target.value)}>{state.clients.filter((c) => !c.archived).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="field"><label>Provider</label>
        <select className="sel" value={f.providerId} onChange={(e) => up("providerId", e.target.value)}>{state.providers.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.role}</option>)}</select></div>
      <div className="row" style={{ gap: 12 }}>
        <div className="field" style={{ flex: 1 }}><label>Time</label><input className="inp" type="time" value={f.time} onChange={(e) => up("time", e.target.value)} /></div>
        <div className="field" style={{ flex: 1 }}><label>Room</label>
          <select className="sel" value={f.room} onChange={(e) => up("room", e.target.value)}>{["Room 1", "Room 2", "Room 3", "Room 4"].map((r) => <option key={r}>{r}</option>)}</select></div>
      </div>
      <div className="row" style={{ gap: 12 }}>
        <div className="field" style={{ flex: 2 }}><label>Service</label>
          <select className="sel" value={(state.catalog || []).some((k) => k.type === "service" && k.active !== false && k.name === f.svc) ? f.svc : "custom"} onChange={(e) => { if (e.target.value === "custom") { up("svc", ""); return; } const k = (state.catalog || []).find((x) => x.name === e.target.value); setF({ ...f, svc: k.name, price: k.price }); }}>
            {(state.catalog || []).filter((k) => k.type === "service" && k.active !== false).map((k) => <option key={k.id} value={k.name}>{k.name} — {money(k.price)}{k.duration ? ` · ${k.duration} min` : ""}</option>)}
            <option value="custom">Custom service…</option>
          </select>
          {!(state.catalog || []).some((k) => k.type === "service" && k.active !== false && k.name === f.svc) && <input className="inp" style={{ marginTop: 6 }} placeholder="Describe the service" value={f.svc} onChange={(e) => up("svc", e.target.value)} />}
        </div>
        <div className="field" style={{ flex: 1 }}><label>Price</label><input className="inp" type="number" value={f.price} onChange={(e) => up("price", Number(e.target.value))} /></div>
      </div>
    </Modal>
  );
}

/* ----------------------------- Clients ----------------------------- */
function ClientModal({ initial, title, cta, onClose, onSave }) {
  const [f, setF] = useState(initial ? { ...initial } : { name: "", phone: "", email: "", type: "client", referral: "", modality: "Deep Tissue", since: String(new Date().getFullYear()), intake: false, consent: false, balance: 0, plan: "", flags: [] });
  const [flagsText, setFlagsText] = useState(((initial && initial.flags) || []).join(", "));
  const up = (k, v) => setF({ ...f, [k]: v });
  const save = () => { if (!f.name.trim()) return; onSave({ ...f, referral: f.type === "patient" ? (f.referral || "") : null, flags: flagsText.split(",").map((x) => x.trim()).filter(Boolean) }); };
  return (
    <Modal title={title} onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" onClick={save} disabled={!f.name.trim()}>{cta}</button></>}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>Full name</label><input className="inp" value={f.name} onChange={(e) => up("name", e.target.value)} /></div>
        <div className="field"><label>Phone</label><input className="inp" value={f.phone} onChange={(e) => up("phone", e.target.value)} /></div>
        <div className="field" style={{ gridColumn: "1 / -1" }}><label>Email (for receipts & reminders)</label><input className="inp" type="email" value={f.email || ""} onChange={(e) => up("email", e.target.value)} placeholder="name@example.com" /></div>
        <div className="field"><label>Type</label><select className="sel" value={f.type} onChange={(e) => up("type", e.target.value)}><option value="client">Client (walk-in)</option><option value="patient">Patient (doctor-referred)</option></select></div>
        <div className="field"><label>Preferred modality</label><select className="sel" value={f.modality} onChange={(e) => up("modality", e.target.value)}>{["Deep Tissue", "Sports", "Swedish", "Acupuncture", "Prenatal", "Myofascial"].map((m) => <option key={m}>{m}</option>)}</select></div>
        {f.type === "patient" && <div className="field" style={{ gridColumn: "1 / -1" }}><label>Referring physician</label><input className="inp" value={f.referral || ""} onChange={(e) => up("referral", e.target.value)} placeholder="Dr. name · specialty" /></div>}
        <div className="field" style={{ gridColumn: "1 / -1" }}><label>Treatment plan</label><textarea className="ta" value={f.plan || ""} onChange={(e) => up("plan", e.target.value)} style={{ minHeight: 56 }} /></div>
        <div className="field" style={{ gridColumn: "1 / -1" }}><label>Flags / contraindications (comma-separated)</label><input className="inp" value={flagsText} onChange={(e) => setFlagsText(e.target.value)} placeholder="e.g. Latex sensitivity" /></div>
        <label className="row" style={{ gap: 8, fontSize: 13, cursor: "pointer" }}><input type="checkbox" checked={!!f.intake} onChange={(e) => up("intake", e.target.checked)} /> Intake complete</label>
        <label className="row" style={{ gap: 8, fontSize: 13, cursor: "pointer" }}><input type="checkbox" checked={!!f.consent} onChange={(e) => up("consent", e.target.checked)} /> Consent signed</label>
      </div>
    </Modal>
  );
}

function Kebab({ items }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null), menuRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if ((btnRef.current && btnRef.current.contains(e.target)) || (menuRef.current && menuRef.current.contains(e.target))) return; setOpen(false); };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onDown); window.addEventListener("scroll", onScroll, true); window.addEventListener("resize", onScroll);
    return () => { document.removeEventListener("mousedown", onDown); window.removeEventListener("scroll", onScroll, true); window.removeEventListener("resize", onScroll); };
  }, [open]);
  const toggle = (e) => { e.stopPropagation(); const r = btnRef.current.getBoundingClientRect(); setPos({ top: r.bottom + 4, left: Math.max(8, Math.min(window.innerWidth - 200, r.right - 192)) }); setOpen((o) => !o); };
  return (
    <>
      <button ref={btnRef} className="iconbtn" title="More actions" onClick={toggle} style={{ width: 30, height: 30 }}><MoreVertical size={15} /></button>
      {open && (
        <div ref={menuRef} onClick={(e) => e.stopPropagation()} style={{ position: "fixed", top: pos.top, left: pos.left, width: 192, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, boxShadow: "0 12px 28px rgba(0,0,0,.14)", padding: 6, zIndex: 300 }}>
          {items.map((it, i) => it === "sep" ? <div key={i} style={{ height: 1, background: "var(--border)", margin: "4px 0" }} /> : (
            <button key={i} disabled={it.disabled} title={it.title} onClick={() => { if (it.disabled) return; setOpen(false); it.onClick(); }}
              style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", background: "none", border: "none", padding: "8px 10px", borderRadius: 7, fontFamily: "inherit", fontSize: 13, color: it.danger ? "var(--rose)" : "var(--ink)", cursor: it.disabled ? "not-allowed" : "pointer", opacity: it.disabled ? .45 : 1 }}
              onMouseEnter={(e) => { if (!it.disabled) e.currentTarget.style.background = "var(--sage)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}>
              {it.icon}{it.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function ConfirmModal({ title, body, confirm, danger, onClose, onConfirm }) {
  return (
    <Modal title={title} onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" style={danger ? { background: "var(--rose)" } : {}} onClick={onConfirm}>{confirm}</button></>}>
      <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{body}</div>
    </Modal>
  );
}

function Clients({ state, dispatch, setSelClient }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const hasRecords = (id) => state.notes.some((n) => n.clientId === id) || state.invoices.some((i) => i.clientId === id);
  const rows = state.clients.filter((c) => showArchived || !c.archived);
  const archivedCount = state.clients.filter((c) => c.archived).length;
  const modalities = [...new Set(state.clients.map((c) => c.modality))];
  const stop = (e) => e.stopPropagation();
  return (
    <>
      <div className="row" style={{ marginBottom: 14, alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div className="muted" style={{ fontSize: 13.5 }}>{rows.length} clients · {state.clients.filter((c) => c.type === "patient" && !c.archived).length} doctor-referred patients</div>
        {archivedCount > 0 && <label className="row" style={{ gap: 6, fontSize: 12.5, cursor: "pointer" }}><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Show archived ({archivedCount})</label>}
        <button className="btn pri" style={{ marginLeft: "auto" }} onClick={() => setAdding(true)}><Plus size={15} /> New client</button>
      </div>
      <div className="card">
        <DataTable
          rows={rows} search searchPlaceholder="Search clients" onRowClick={(c) => setSelClient(c.id)} defaultSort={{ key: "name", dir: "asc" }}
          filters={[
            { key: "type", label: "Type", options: [{ value: "patient", label: "Patient" }, { value: "client", label: "Client" }], test: (c, v) => c.type === v },
            { key: "modality", label: "Modality", options: modalities.map((m) => ({ value: m, label: m })), test: (c, v) => c.modality === v },
            { key: "intake", label: "Intake", options: [{ value: "done", label: "Complete" }, { value: "pending", label: "Pending" }], test: (c, v) => (v === "done") === !!c.intake },
            { key: "consent", label: "Consent", options: [{ value: "signed", label: "Signed" }, { value: "needed", label: "Needed" }], test: (c, v) => (v === "signed") === !!c.consent },
            { key: "balance", label: "Balance", options: [{ value: "owing", label: "Owes balance" }, { value: "clear", label: "Clear" }], test: (c, v) => (v === "owing") === !!c.balance },
          ]}
          columns={[
            { key: "name", label: "Client", filterVal: (c) => `${c.name} ${c.phone}`, sortVal: (c) => c.name, render: (c) => (<div className="row" style={{ gap: 10 }}><div className="avatar" style={{ background: c.archived ? "var(--muted-2)" : "var(--pine-soft)", width: 30, height: 30, fontSize: 11 }}>{initials(c.name)}</div><div><div style={{ fontWeight: 600 }}>{c.name} {c.archived && <span className="pill cxl" style={{ marginLeft: 6 }}>Archived</span>}</div><div className="muted" style={{ fontSize: 12 }}>{c.phone} · since {c.since}</div></div></div>) },
            { key: "type", label: "Type", render: (c) => c.type === "patient" ? <span className="pill c1099">Patient</span> : <span className="pill w2">Client</span> },
            { key: "modality", label: "Preferred modality" },
            { key: "intake", label: "Intake", sortVal: (c) => (c.intake ? 1 : 0), render: (c) => c.intake ? <span className="pill done">Complete</span> : <span className="pill due">Pending</span> },
            { key: "consent", label: "Consent", sortVal: (c) => (c.consent ? 1 : 0), render: (c) => c.consent ? <span className="pill done">Signed</span> : <span className="pill due">Needed</span> },
            { key: "balance", label: "Balance", align: "num", sortVal: (c) => c.balance || 0, render: (c) => c.balance ? <span style={{ color: "var(--rose)", fontWeight: 600 }}>{money0(c.balance)}</span> : <span className="muted">—</span> },
            { key: "act", label: "", sortable: false, render: (c) => (
              <div className="row" style={{ gap: 6, justifyContent: "flex-end", alignItems: "center" }} onClick={stop}>
                <Kebab items={[
                  { label: "Edit client", icon: <Pencil size={14} />, onClick: () => setEditing(c) },
                  c.archived ? { label: "Restore", icon: <ArchiveRestore size={14} />, onClick: () => dispatch({ type: "RESTORE_CLIENT", id: c.id }) }
                             : { label: "Archive", icon: <Archive size={14} />, onClick: () => dispatch({ type: "ARCHIVE_CLIENT", id: c.id }) },
                  "sep",
                  { label: "Delete client", icon: <Trash2 size={14} />, danger: true, disabled: hasRecords(c.id), title: hasRecords(c.id) ? "Has clinical or billing records — archive instead" : "Delete", onClick: () => setConfirm(c) },
                ]} />
                <ChevronRight size={16} color="var(--muted-2)" />
              </div>) },
          ]}
        />
      </div>
      {adding && <ClientModal title="New client" cta="Add client" onClose={() => setAdding(false)} onSave={(c) => { dispatch({ type: "ADD_CLIENT", client: c }); setAdding(false); }} />}
      {editing && <ClientModal title="Edit client" cta="Save changes" initial={editing} onClose={() => setEditing(null)} onSave={(patch) => { dispatch({ type: "UPDATE_CLIENT", id: editing.id, patch }); setEditing(null); }} />}
      {confirm && <ConfirmModal danger title={`Delete ${confirm.name}?`} confirm="Delete client" onClose={() => setConfirm(null)}
        body={<>This permanently removes the client record along with their appointments, documents, and conversations. This can’t be undone. If they have SOAP notes or invoices, use <b>Archive</b> instead so records stay retained.</>}
        onConfirm={() => { dispatch({ type: "REMOVE_CLIENT", id: confirm.id }); setConfirm(null); }} />}
    </>
  );
}

function ClientDetail({ state, dispatch, prov, client, id, back, openNote, setNewAppt, openPay, go, setSelThread, setApptFocus, setChartFocus }) {
  const c = client(id);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [invoicing, setInvoicing] = useState(false);
  if (!c) return <div className="empty">This client no longer exists.<div style={{ marginTop: 10 }}><button className="btn" onClick={back}><ArrowLeft size={14} /> Back to clients</button></div></div>;
  const hasRecords = state.notes.some((n) => n.clientId === id) || state.invoices.some((i) => i.clientId === id);
  const fnd = ((state.findings && state.findings[id]) || []).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const sevCount = fnd.reduce((acc, f) => { acc[f.sev] = (acc[f.sev] || 0) + 1; return acc; }, {});
  const sessions = Object.entries(fnd.reduce((acc, f) => { const d = new Date(f.ts || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); (acc[d] = acc[d] || []).push(f); return acc; }, {}));
  const notes = state.notes.filter((n) => n.clientId === id);
  const invs = state.invoices.filter((i) => i.clientId === id);
  const appts = state.appts.filter((a) => a.clientId === id).slice().sort((a, b) => a.time.localeCompare(b.time));
  const message = () => {
    const existing = state.threads.find((t) => t.refId === id || t.name === c.name);
    if (existing) setSelThread(existing.id);
    else { const tid = "t" + Date.now(); dispatch({ type: "ADD_THREAD", thread: { id: tid, name: c.name, kind: "client", refId: id, msgs: [] } }); setSelThread(tid); }
    go("messages");
  };
  return (
    <>
      <div className="row" style={{ gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <div className="crumb" style={{ marginBottom: 0 }}><button onClick={back}><ArrowLeft size={15} /> Clients</button><ChevronRight size={13} /><span style={{ color: "var(--ink)", fontWeight: 600 }}>{c.name}</span></div>
        <div className="row" style={{ gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
          <button className="btn" onClick={message}><MessageSquare size={14} /> Message</button>
          <button className="btn" onClick={() => setInvoicing(true)}><Receipt size={14} /> New invoice</button>
          <button className="btn" onClick={() => setNewAppt({ clientId: id })}><Calendar size={14} /> Book appointment</button>
          <Kebab items={[
            { label: "Edit client", icon: <Pencil size={14} />, onClick: () => setEditing(true) },
            c.archived ? { label: "Restore", icon: <ArchiveRestore size={14} />, onClick: () => dispatch({ type: "RESTORE_CLIENT", id }) }
                       : { label: "Archive", icon: <Archive size={14} />, onClick: () => dispatch({ type: "ARCHIVE_CLIENT", id }) },
            "sep",
            { label: "Delete client", icon: <Trash2 size={14} />, danger: true, disabled: hasRecords, title: hasRecords ? "Has clinical or billing records — archive instead" : "Delete client", onClick: () => setConfirm(true) },
          ]} />
        </div>
      </div>
      {c.archived && <div className="alert" style={{ marginBottom: 14 }}><div className="ico warn"><Archive size={16} /></div><div><div className="tx">This client is archived</div><div className="sx">Hidden from booking and lists. Restore to make them active again — records are retained either way.</div></div></div>}
      <div className="two">
        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          <section className="card pad">
            <div className="row" style={{ gap: 14, marginBottom: 14 }}>
              <div className="avatar" style={{ background: "var(--pine)", width: 52, height: 52, fontSize: 18 }}>{initials(c.name)}</div>
              <div><div className="serif" style={{ fontSize: 22, fontWeight: 600 }}>{c.name}</div><div className="muted" style={{ fontSize: 13 }}>{c.phone}{c.email ? ` · ${c.email}` : ""} · client since {c.since}</div></div>
            </div>
            {c.flags && c.flags.length > 0 && <div style={{ marginBottom: 12 }}>{c.flags.map((fl) => <span key={fl} className="pill cxl" style={{ marginRight: 6 }}><AlertTriangle size={11} /> {fl}</span>)}</div>}
            <div className="statline"><span className="muted">Type</span>{c.type === "patient" ? <span className="pill c1099">Patient · doctor-referred</span> : <span className="pill w2">Client · walk-in</span>}</div>
            {c.referral && <div className="statline"><span className="muted">Referring physician</span><span style={{ fontWeight: 600 }}>{c.referral}</span></div>}
            <div className="statline"><span className="muted">Preferred modality</span><span style={{ fontWeight: 600 }}>{c.modality}</span></div>
            <div className="statline"><span className="muted">Intake form</span>{c.intake ? <span className="pill done">Complete</span> : <span className="pill due">Pending</span>}</div>
            <div className="statline"><span className="muted">Consent on file</span>{c.consent ? <span className="pill done">Signed</span> : <span className="pill due">Needed</span>}</div>
            <div className="statline"><span className="muted">Account balance</span><span style={{ fontWeight: 600, color: c.balance ? "var(--rose)" : "var(--ink)" }}>{money(c.balance || 0)}</span></div>
          </section>
          <section className="card pad">
            <div className="tiny" style={{ marginBottom: 8 }}><FileText size={12} style={{ verticalAlign: -2, marginRight: 5 }} />Treatment plan</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{c.plan || <span className="muted">No plan on file yet.</span>}</div>
          </section>
          <section className="card">
            <div className="sec-h"><h3>Appointments</h3><span className="tiny">{appts.length}</span></div>
            {appts.length === 0 ? <div className="empty">No appointments yet.</div> : appts.map((a) => (
              <div className="appt" key={a.id} style={{ cursor: "pointer" }} onClick={() => { go("schedule"); setApptFocus(a.id); }}>
                <span className="time">{fmtTime(a.time)}</span>
                <div className="meta"><div className="nm">{a.svc}</div><div className="det">{prov(a.providerId).name} · {a.room}</div></div>
                {apptPill(a.status)}
              </div>
            ))}
          </section>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        <section className="card">
          <div className="sec-h"><h3>Charting</h3><button className="btn pri sm" onClick={() => { go("charting"); setChartFocus(id); }}><PersonStanding size={13} /> Open body assessment</button></div>
          {fnd.length === 0 ? <div className="empty">No findings charted yet — open the body assessment to start.</div> : (
            <div style={{ padding: "4px 18px 12px" }}>
              <div className="row" style={{ gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                <span className="pill">{fnd.length} finding{fnd.length === 1 ? "" : "s"}</span>
                {["severe", "mod", "mild"].map((k) => sevCount[k] ? <span key={k} className="pill" style={{ background: SEV[k].bg, color: SEV[k].c }}>{sevCount[k]} {SEV[k].t.toLowerCase()}</span> : null)}
                <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>{sessions.length} session{sessions.length === 1 ? "" : "s"} · last {sessions[0] && sessions[0][0]}</span>
              </div>
              {sessions.map(([d, list]) => (
                <div key={d} style={{ marginBottom: 8 }}>
                  <div className="tiny" style={{ margin: "8px 0 4px" }}>{d}</div>
                  {list.map((f) => (
                    <div key={f.id} className="row" style={{ gap: 8, padding: "7px 0", borderBottom: "1px dashed var(--border)", alignItems: "flex-start" }}>
                      <span className="pill" style={{ background: (SEV[f.sev] || SEV.mild).bg, color: (SEV[f.sev] || SEV.mild).c, flex: "0 0 auto" }}>{(SEV[f.sev] || SEV.mild).t}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{f.label}{f.side && f.side !== "midline" ? ` (${f.side})` : ""}{f.pain != null && <span className="muted" style={{ fontWeight: 400 }}> · pain {f.pain}/10</span>}</div>
                        {f.note && <div className="muted" style={{ fontSize: 12.5 }}>{f.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="card">
          <div className="sec-h"><h3>SOAP history</h3></div>
          {notes.length === 0 ? <div className="empty">No notes yet for this client.</div> :
            notes.map((n) => (
              <div className="appt" key={n.id} style={{ cursor: "pointer" }} onClick={() => openNote(n)}>
                <div className="meta"><div className="nm">{n.date} · {n.modality}</div><div className="det">{prov(n.providerId).name}</div></div>
                {n.locked ? <span className="pill locked"><Lock size={11} /> Locked</span> : <span className="pill draft">Draft</span>}
              </div>
            ))}
          <div className="sec-h" style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}><h3>Invoices</h3></div>
          {invs.length === 0 ? <div className="empty">No invoices.</div> : invs.map((i) => (
            <div className="appt" key={i.id}><div className="meta"><div className="nm">{i.svc}</div><div className="det">{i.date}</div></div><span className="num" style={{ fontWeight: 600 }}>{money0(i.amount)}</span>
              {i.status === "paid" ? <span className="pill paid">Paid</span> : i.status === "void" ? <span className="pill cxl">Void</span> : <button className="btn pri sm" onClick={() => openPay(i.id)}>Charge</button>}
            </div>
          ))}
        </section>
        </div>
      </div>
      {editing && <ClientModal title="Edit client" cta="Save changes" initial={c} onClose={() => setEditing(false)} onSave={(patch) => { dispatch({ type: "UPDATE_CLIENT", id, patch }); setEditing(false); }} />}
      {confirm && <ConfirmModal danger title={`Delete ${c.name}?`} confirm="Delete client" onClose={() => setConfirm(false)}
        body={<>This permanently removes the client record along with their appointments, documents, and conversations. This can’t be undone.</>}
        onConfirm={() => { dispatch({ type: "REMOVE_CLIENT", id }); setConfirm(false); back(); }} />}
      {invoicing && <InvoiceModal state={state} initial={{ clientId: id }} onClose={() => setInvoicing(false)} onSave={(inv) => { dispatch({ type: "ADD_INVOICE", inv }); setInvoicing(false); }} />}
    </>
  );
}

/* ----------------------------- SOAP ----------------------------- */
function SoapList({ state, prov, client, open }) {
  const [creating, setCreating] = useState(false);
  const [nf, setNf] = useState({ clientId: state.clients[0].id, providerId: state.providers[0].id, modality: "Deep Tissue" });
  const needNote = state.appts.filter((a) => a.status === "done" && !state.notes.some((n) => n.apptId === a.id));
  const drafts = needNote.map((a) => ({ id: "draft-" + a.id, apptId: a.id, clientId: a.clientId, providerId: a.providerId, date: todayISO, modality: a.svc, s: "", o: "", a: "", p: "", locked: false }));
  const all = [...drafts, ...state.notes];
  const create = () => { open({ id: "n" + Date.now(), apptId: null, clientId: nf.clientId, providerId: nf.providerId, date: todayISO, modality: nf.modality, s: "", o: "", a: "", p: "", locked: false }); setCreating(false); };
  return (
    <>
      <div className="row" style={{ marginBottom: 14, alignItems: "center" }}>
        <div className="muted" style={{ fontSize: 13.5 }}>{needNote.length} completed visit{needNote.length === 1 ? "" : "s"} still need{needNote.length === 1 ? "s" : ""} a note</div>
        <button className="btn pri" style={{ marginLeft: "auto" }} onClick={() => setCreating(true)}><Plus size={15} /> New note</button>
      </div>
      <div className="card">
        <DataTable rows={all} search searchPlaceholder="Search notes" onRowClick={open} defaultSort={{ key: "date", dir: "desc" }}
          filters={[
            { key: "status", label: "Status", options: [{ value: "locked", label: "Locked" }, { value: "draft", label: "Needs note" }], test: (n, v) => (v === "locked") === !!n.locked },
            { key: "prov", label: "Provider", options: state.providers.map((p) => ({ value: p.id, label: p.name })), test: (n, v) => n.providerId === v },
            { key: "modality", label: "Modality", options: [...new Set(all.map((n) => n.modality))].map((m) => ({ value: m, label: m })), test: (n, v) => n.modality === v },
          ]}
          columns={[
            { key: "date", label: "Date", align: "num" },
            { key: "client", label: "Client", sortVal: (n) => client(n.clientId).name, render: (n) => <span style={{ fontWeight: 600 }}>{client(n.clientId).name}</span> },
            { key: "provider", label: "Provider", sortVal: (n) => prov(n.providerId).name, render: (n) => prov(n.providerId).name },
            { key: "modality", label: "Modality" },
            { key: "locked", label: "Status", sortVal: (n) => (n.locked ? 1 : 0), render: (n) => n.locked ? <span className="pill locked"><Lock size={11} /> Locked</span> : <span className="pill draft">Needs note</span> },
            { key: "go", label: "", sortable: false, render: () => <ChevronRight size={16} color="var(--muted-2)" /> },
          ]} />
      </div>
      {creating && <Modal title="New SOAP note" onClose={() => setCreating(false)} footer={<><button className="btn" onClick={() => setCreating(false)}>Cancel</button><button className="btn pri" onClick={create}>Open editor</button></>}>
        <div className="field"><label>Client</label><select className="sel" value={nf.clientId} onChange={(e) => setNf({ ...nf, clientId: e.target.value })}>{state.clients.filter((c) => !c.archived).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="field" style={{ marginTop: 10 }}><label>Provider</label><select className="sel" value={nf.providerId} onChange={(e) => setNf({ ...nf, providerId: e.target.value })}>{state.providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="field" style={{ marginTop: 10 }}><label>Modality</label><select className="sel" value={nf.modality} onChange={(e) => setNf({ ...nf, modality: e.target.value })}>{["Deep Tissue", "Sports", "Swedish", "Acupuncture", "Prenatal", "Myofascial"].map((m) => <option key={m}>{m}</option>)}</select></div>
      </Modal>}
    </>
  );
}

const TEMPLATES = {
  "Deep Tissue": { s: "Client reports area of focus and pain level (0–10)…", o: "Palpable findings, ROM, tissue quality…", a: "Clinical impression of tissue state and progress…", p: "Treatment performed + home care + reassessment plan…" },
  default: { s: "Subjective — client's reported symptoms, pain level, goals for the session…", o: "Objective — palpation findings, range of motion, observable signs…", a: "Assessment — clinical impression and change since last visit…", p: "Plan — treatment delivered, home care, next-visit focus…" },
};

function SoapEditor({ note, state, dispatch, prov, client, back }) {
  const c = client(note.clientId), p = prov(note.providerId);
  const [draft, setDraft] = useState(() => ({ ...note, id: note.id.startsWith("draft-") ? "n" + Date.now() : note.id }));
  const [saved, setSaved] = useState(true);
  const firstRun = useRef(true);
  const saveTimer = useRef(null);
  const tmpl = TEMPLATES[draft.modality] || TEMPLATES.default;

  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    if (draft.locked) return;
    setSaved(false);
    saveTimer.current = setTimeout(() => {
      dispatch({ type: "SAVE_NOTE", note: draft });
      setSaved(true);
      saveTimer.current = null;
    }, 700);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = null;
    };
  }, [draft, dispatch]); // eslint-disable-line

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const lock = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    dispatch({ type: "SAVE_NOTE", note: draft });
    dispatch({ type: "LOCK_NOTE", id: draft.id, at: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " · " + new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) });
    back();
  };
  const unlock = () => {
    if (!window.confirm("Unlock this demo note for editing? Its lock will be cleared. This session does not maintain a revision history.")) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    dispatch({ type: "UNLOCK_NOTE", id: draft.id });
    setDraft((d) => ({ ...d, locked: false, lockedAt: null }));
    setSaved(true);
  };

  const fields = [["s", "S — Subjective"], ["o", "O — Objective"], ["a", "A — Assessment"], ["p", "P — Plan"]];

  return (
    <>
      <div className="crumb"><button onClick={back}><ArrowLeft size={15} /> SOAP notes</button><ChevronRight size={13} /><span style={{ color: "var(--ink)", fontWeight: 600 }}>{c.name}</span></div>
      <div className="card pad">
        <div className="row" style={{ marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div className="serif" style={{ fontSize: 20, fontWeight: 600 }}>{c.name} · {draft.modality}</div>
            <div className="muted" style={{ fontSize: 13 }}>{p.name} · {draft.date}</div>
          </div>
          <div className="spacer" />
          {draft.locked
            ? <span className="pill locked" style={{ padding: "7px 12px" }}><Lock size={13} /> Locked {draft.lockedAt}</span>
            : (saved ? <span className="savechip"><CheckCircle2 size={14} /> Auto-saved</span> : <span className="savechip muted" style={{ color: "var(--muted)" }}><Clock size={14} /> Saving…</span>)}
        </div>

        {c.flags.length > 0 && <div style={{ marginBottom: 14 }}>{c.flags.map((fl) => <span key={fl} className="pill cxl" style={{ marginRight: 6 }}><AlertTriangle size={11} /> {fl}</span>)}</div>}

        {fields.map(([k, label]) => (
          <div className="field" key={k}>
            <label>{label}</label>
            <textarea className="ta" disabled={draft.locked} placeholder={tmpl[k]} value={draft[k]} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}

        {!draft.locked &&
          <div className="row" style={{ gap: 10, marginTop: 4 }}>
            <div className="muted" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}><ShieldCheck size={14} /> Demo lock only. A protected, permanent audit record is not created.</div>
            <div className="spacer" />
            <button className="btn pri" onClick={lock} disabled={!draft.s && !draft.o}><Lock size={14} /> Lock note</button>
          </div>}
        {draft.locked &&
          <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 4 }}>
            <div className="muted" style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}><Lock size={13} /> This note is locked in this demo session only. Revision history is not stored.</div>
            <button className="btn sm" style={{ marginLeft: "auto" }} onClick={unlock}><Unlock size={14} /> Unlock note</button>
          </div>}
      </div>
    </>
  );
}

/* ----------------------------- Payments ----------------------------- */
function EmailReceiptModal({ inv, state, dispatch, client, onClose }) {
  const c = client(inv.clientId);
  const total = inv.amount + (inv.tip || 0);
  const num = invNum(inv, state);
  const isReceipt = inv.status === "paid";
  const [to, setTo] = useState(c.email || "");
  const [save, setSave] = useState(!c.email);
  const [subject, setSubject] = useState(`Your ${isReceipt ? "receipt" : "invoice"} from ${state.practice.name} — ${num}`);
  const [msg, setMsg] = useState(`Hi ${c.name.split(" ")[0]},\n\nThank you for visiting ${state.practice.name}. ${isReceipt ? `Your receipt for ${money(total)} is attached.` : `Your invoice for ${money(inv.amount)} is attached — you can pay online or at your next visit.`}\n\nWarmly,\n${state.practice.name}`);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);
  const summary = `${num} · ${inv.svc} ${money(inv.amount)}${inv.tip ? ` + tip ${money(inv.tip)}` : ""} · Total ${money(total)} · ${isReceipt ? `Paid ${inv.paidAt}` : "Balance due"}`;
  const send = () => {
    const at = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    dispatch({ type: "UPDATE_INVOICE", id: inv.id, patch: { receiptSentAt: at, receiptTo: to } });
    if (save && to !== c.email) dispatch({ type: "UPDATE_CLIENT", id: c.id, patch: { email: to } });
    onClose();
  };
  return (
    <Modal title={`Email ${isReceipt ? "receipt" : "invoice"} to ${c.name}`} onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn pri" disabled={!valid} onClick={send}><Mail size={14} /> Simulate send</button>
    </>}>
      <div className="field"><label>To</label><input className="inp" type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="client@example.com" /></div>
      {!valid && to.length > 0 && <div style={{ color: "var(--rose)", fontSize: 12, marginTop: 4 }}>Enter a valid email address.</div>}
      {(!c.email || to !== c.email) && valid && <label className="row" style={{ gap: 8, fontSize: 12.5, marginTop: 8, cursor: "pointer" }}><input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} /> Save this email to {c.name.split(" ")[0]}’s profile</label>}
      <div className="field" style={{ marginTop: 12 }}><label>Subject</label><input className="inp" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
      <div className="field" style={{ marginTop: 12 }}><label>Message</label><textarea className="ta" value={msg} onChange={(e) => setMsg(e.target.value)} style={{ minHeight: 120 }} /></div>
      <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--sage)", borderRadius: 10, fontSize: 12.5, display: "flex", alignItems: "center", gap: 8 }}><FileText size={14} color="var(--pine)" /><div><b>Attached:</b> {num}.pdf<div className="muted" style={{ fontSize: 12 }}>{summary}</div></div></div>
      <div className="muted" style={{ fontSize: 11.5, marginTop: 10, display: "flex", gap: 6, alignItems: "center" }}><ShieldCheck size={13} /> Demo only. No email is sent and no file is attached. Do not enter real patient information.</div>
    </Modal>
  );
}

function InvoiceDetail({ inv, state, dispatch, client, prov, openPay, onBack, onVoid, onEmail, go, setSelClient, setApptFocus }) {
  const c = client(inv.clientId), p = prov(inv.providerId);
  const [editing, setEditing] = useState(false);
  const [reminding, setReminding] = useState(false);
  const appt = inv.apptId ? state.appts.find((a) => a.id === inv.apptId) : null;
  const total = inv.amount + (inv.tip || 0);
  const num = invNum(inv, state);
  const pill = inv.status === "paid" ? <span className="pill paid"><Check size={11} /> Paid</span> : inv.status === "void" ? <span className="pill cxl">Void</span> : <span className="pill due">Due</span>;
  const paperText = () => [state.practice.name, state.practice.city, "", inv.status === "paid" ? "RECEIPT" : "INVOICE", `${num} · ${inv.date}`, `Bill to: ${c.name}${c.phone ? " · " + c.phone : ""}`, `Provider: ${p.name}`, "", ...((inv.items && inv.items.length ? inv.items : [{ name: inv.svc, qty: 1, price: inv.amount }]).map((it) => `${it.name}${it.qty > 1 ? ` x${it.qty}` : ""}   ${money(it.price * it.qty)}`)), inv.tax ? `Sales tax   ${money(inv.tax)}` : null, inv.tip ? `Tip   ${money(inv.tip)}` : null, `Total   ${money(total)}`, "", inv.status === "paid" ? `Paid ${inv.paidAt} · card on file (Stripe)` : inv.status === "void" ? "VOID" : `Balance due ${money(inv.amount)}`, inv.dnp ? "Do not submit to health plan — client paid in full." : null, "", "Thank you — Art of Palpation"].filter((x) => x !== null).join("\n");
  const timeline = [
    { t: inv.date, l: "Invoice created", s: appt ? `From completed visit · ${appt.svc}` : "Manual invoice" },
    ...(inv.status === "paid" ? [{ t: inv.paidAt, l: `Paid ${money(total)}`, s: "Card on file · Stripe" }, { t: inv.paidAt, l: "Receipt sent", s: "PHI-free email receipt" }] : []),
    ...((inv.reminders || []).map((r) => ({ t: r.at, l: `Payment reminder sent (${r.channel === "sms" ? "SMS" : "email"})`, s: `To ${r.to}` }))),
    ...(inv.receiptSentAt ? [{ t: inv.receiptSentAt, l: `${inv.status === "paid" ? "Receipt" : "Invoice"} emailed`, s: `To ${inv.receiptTo}` }] : []),
    ...(inv.status === "void" ? [{ t: "—", l: "Voided", s: "Removed from receivables" }] : []),
    ...(inv.status === "due" ? [{ t: "Now", l: "Awaiting payment", s: "Charge the card on file or collect in person" }] : []),
  ];
  const Row = ({ k, v, last }) => <div className="row" style={{ justifyContent: "space-between", padding: "9px 0", borderBottom: last ? "none" : "1px solid var(--border)", gap: 12 }}><span className="muted" style={{ fontSize: 13 }}>{k}</span><span style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{v}</span></div>;
  return (
    <>
      <div className="row" style={{ gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn ghost sm" onClick={onBack}><ArrowLeft size={14} /> Payments</button>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Invoice {num}</div>
        {pill}
        {inv.receiptSentAt && <span className="pill done"><Mail size={11} /> Emailed {inv.receiptSentAt}</span>}
        <div className="row" style={{ gap: 8, marginLeft: "auto", flexWrap: "wrap" }}>
          <button className="btn" onClick={() => downloadFile(`${num}-${inv.status === "paid" ? "receipt" : "invoice"}.txt`, paperText(), "text/plain")}><Download size={14} /> {inv.status === "paid" ? "Receipt" : "Invoice"}</button>
          {inv.status !== "void" && <button className="btn" onClick={onEmail}><Mail size={14} /> Email {inv.status === "paid" ? "receipt" : "invoice"}</button>}
          <button className="btn" onClick={() => { go("clients"); setSelClient(inv.clientId); }}><Users size={14} /> Open client</button>
          {inv.status === "due" && <button className="btn" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</button>}
          {inv.status === "due" && <button className="btn" onClick={() => setReminding(true)}><BellRing size={14} /> Send reminder</button>}
          {inv.status === "due" && <button className="btn" style={{ color: "var(--rose)" }} onClick={onVoid}><Ban size={14} /> Void</button>}
          {inv.status === "due" && <button className="btn pri" onClick={() => openPay(inv.id)}><CreditCard size={14} /> Charge {money(inv.amount)}</button>}
        </div>
      </div>

      <div className="two" style={{ alignItems: "start" }}>
        <section className="card pad">
          <div style={{ background: "#e9ece8", padding: 20, borderRadius: 10, display: "flex", justifyContent: "center" }}>
            <div style={{ background: "#fff", width: "100%", maxWidth: 520, boxShadow: "0 10px 30px rgba(0,0,0,.12)", padding: "40px 44px", fontFamily: "Georgia, 'Times New Roman', serif", color: "#222", position: "relative" }}>
              {inv.status === "void" && <div style={{ position: "absolute", top: 34, right: 30, transform: "rotate(-14deg)", border: "3px solid #A23C37", color: "#A23C37", padding: "4px 14px", fontWeight: 700, letterSpacing: 3, fontSize: 20, opacity: .8 }}>VOID</div>}
              <div style={{ fontSize: 18, fontWeight: 600 }}>{state.practice.name}</div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 22 }}>{state.practice.city}</div>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
                <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#888" }}>{inv.status === "paid" ? "Receipt" : "Invoice"}</div>
                <div style={{ textAlign: "right", fontSize: 12, color: "#666" }}>{num}<br />{inv.date}</div>
              </div>
              <div style={{ fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}><b>Bill to</b><br />{c.name}{c.phone ? <><br />{c.phone}</> : null}<br /><span style={{ color: "#666" }}>Provider: {p.name}</span></div>
              <div style={{ borderTop: "1px solid #ddd", borderBottom: "1px solid #ddd", padding: "10px 0", fontSize: 13.5 }}>
                {(inv.items && inv.items.length ? inv.items : [{ name: inv.svc, qty: 1, price: inv.amount }]).map((it, k) => (
                  <div key={k} className="row" style={{ justifyContent: "space-between", padding: "4px 0" }}><span>{it.name}{it.qty > 1 ? <span style={{ color: "#888" }}> × {it.qty}</span> : null}</span><span>{money(it.price * it.qty)}</span></div>
                ))}
                {inv.tax > 0 && <><div className="row" style={{ justifyContent: "space-between", padding: "4px 0", color: "#666" }}><span>Subtotal</span><span>{money(inv.subtotal != null ? inv.subtotal : inv.amount - inv.tax)}</span></div><div className="row" style={{ justifyContent: "space-between", padding: "4px 0", color: "#666" }}><span>Sales tax</span><span>{money(inv.tax)}</span></div></>}
                {inv.tip > 0 && <div className="row" style={{ justifyContent: "space-between", padding: "4px 0", color: "#666" }}><span>Gratuity</span><span>{money(inv.tip)}</span></div>}
              </div>
              <div className="row" style={{ justifyContent: "space-between", padding: "12px 0", fontSize: 16, fontWeight: 700 }}><span>Total</span><span>{money(total)}</span></div>
              <div style={{ fontSize: 12.5, color: "#444", marginTop: 6 }}>{inv.status === "paid" ? `Paid ${inv.paidAt} · card on file (Stripe)` : inv.status === "void" ? "This invoice has been voided." : `Balance due: ${money(inv.amount)}`}</div>
              {inv.dnp && <div style={{ fontSize: 11.5, color: "#666", marginTop: 8 }}>Do not submit to health plan — client paid in full.</div>}
              {state.invoiceSettings && state.invoiceSettings.note && <div style={{ marginTop: 22, fontSize: 12.5, color: "#555", fontStyle: "italic" }}>{state.invoiceSettings.note}</div>}
              <div style={{ marginTop: 16, fontSize: 11, color: "#999" }}>Receipts and invoices contain no clinical detail.</div>
            </div>
          </div>
        </section>

        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          <section className="card pad">
            <div className="tiny" style={{ marginBottom: 8 }}>Payment details</div>
            <Row k="Invoice" v={num} />
            <Row k="Date" v={inv.date} />
            {inv.due && <Row k="Due date" v={inv.due} />}
            <Row k="Client" v={<button className="btn ghost sm" onClick={() => { go("clients"); setSelClient(inv.clientId); }}>{c.name} <ChevronRight size={13} /></button>} />
            <Row k="Provider" v={`${p.name} · ${p.role}`} />
            <Row k={inv.items && inv.items.length > 1 ? "Items" : "Service"} v={inv.items && inv.items.length ? <span style={{ textAlign: "right" }}>{inv.items.map((it, k) => <div key={k}>{it.name}{it.qty > 1 ? ` × ${it.qty}` : ""}</div>)}</span> : inv.svc} />
            {inv.tax > 0 && <Row k="Subtotal" v={money(inv.subtotal != null ? inv.subtotal : inv.amount - inv.tax)} />}
            {inv.tax > 0 && <Row k="Sales tax" v={money(inv.tax)} />}
            <Row k="Amount" v={money(inv.amount)} />
            <Row k="Tip" v={inv.tip ? money(inv.tip) : "—"} />
            <Row k="Total" v={<span style={{ color: "var(--pine)" }}>{money(total)}</span>} />
            <Row k="Status" v={pill} />
            <Row k="Paid" v={inv.paidAt || "—"} />
            <Row k="Method" v={inv.status === "paid" ? "Card on file · Stripe" : "—"} />
            <Row k="Linked visit" last v={appt ? <button className="btn ghost sm" onClick={() => { go("schedule"); setApptFocus(appt.id); }}>{fmtTime(appt.time)} · {appt.svc} <ChevronRight size={13} /></button> : "Manual invoice"} />
          </section>
          <section className="card pad">
            <div className="tiny" style={{ marginBottom: 8 }}>Billing options</div>
            <label className="row" style={{ gap: 10, alignItems: "flex-start", cursor: inv.status === "void" ? "default" : "pointer", opacity: inv.status === "void" ? .5 : 1 }}>
              <input type="checkbox" checked={!!inv.dnp} disabled={inv.status === "void"} onChange={(e) => dispatch({ type: "UPDATE_INVOICE", id: inv.id, patch: { dnp: e.target.checked } })} style={{ marginTop: 3 }} />
              <div><div style={{ fontSize: 13.5, fontWeight: 600 }}>Do not submit to health plan</div><div className="muted" style={{ fontSize: 12.5 }}>Required when a client pays out of pocket in full and asks that this service not be disclosed to their plan (45 CFR 164.522). Enforced in claim submission.</div></div>
            </label>
          </section>
          <section className="card pad">
            <div className="tiny" style={{ marginBottom: 10 }}>Activity</div>
            {timeline.map((e, i) => (
              <div key={i} className="row" style={{ gap: 10, alignItems: "flex-start", paddingBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === timeline.length - 1 ? "var(--pine)" : "var(--pine-soft)", marginTop: 4, flex: "0 0 auto" }} />
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{e.l}</div><div className="muted" style={{ fontSize: 12 }}>{e.t} · {e.s}</div></div>
              </div>
            ))}
          </section>
        </div>
      </div>
      {editing && <InvoiceModal state={state} edit initial={inv} onClose={() => setEditing(false)} onSave={(patch) => { dispatch({ type: "UPDATE_INVOICE", id: inv.id, patch }); setEditing(false); }} />}
      {reminding && <ReminderModal invoices={[inv]} state={state} dispatch={dispatch} client={client} onClose={() => setReminding(false)} />}
    </>
  );
}


function ItemModal({ initial, type, onClose, onSave }) {
  const [f, setF] = useState(initial ? { ...initial } : { name: "", type: type || "service", price: "", duration: 60, category: type === "product" ? "Retail" : "Massage", taxable: type === "product", active: true });
  const ok = f.name.trim() && Number(f.price) >= 0 && f.price !== "";
  const up = (k, v) => setF({ ...f, [k]: v });
  return (
    <Modal title={initial ? `Edit ${f.type}` : `Add ${f.type}`} onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={!ok} onClick={() => onSave({ ...f, name: f.name.trim(), price: Number(f.price), duration: f.type === "service" ? Number(f.duration) || 0 : null })}>{initial ? "Save changes" : `Add ${f.type}`}</button></>}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field" style={{ gridColumn: "1 / -1" }}><label>Name</label><input className="inp" value={f.name} onChange={(e) => up("name", e.target.value)} placeholder={f.type === "service" ? "e.g. Deep Tissue 60" : "e.g. Arnica cream"} /></div>
        <div className="field"><label>Type</label><select className="sel" value={f.type} onChange={(e) => up("type", e.target.value)}><option value="service">Service</option><option value="product">Product</option></select></div>
        <div className="field"><label>Category</label><input className="inp" value={f.category || ""} onChange={(e) => up("category", e.target.value)} /></div>
        <div className="field"><label>Price ($)</label><input className="inp" type="number" min="0" step="0.01" value={f.price} onChange={(e) => up("price", e.target.value)} /></div>
        {f.type === "service" && <div className="field"><label>Duration (min)</label><input className="inp" type="number" min="0" step="5" value={f.duration || ""} onChange={(e) => up("duration", e.target.value)} /></div>}
        <label className="row" style={{ gap: 8, fontSize: 13, cursor: "pointer", gridColumn: "1 / -1" }}><input type="checkbox" checked={!!f.taxable} onChange={(e) => up("taxable", e.target.checked)} /> Taxable (sales tax applies at the invoice rate)</label>
      </div>
    </Modal>
  );
}

function InvoiceModal({ state, initial, edit, onClose, onSave }) {
  const active = state.clients.filter((c) => !c.archived);
  const catalog = (state.catalog || []).filter((it) => it.active !== false);
  const services = catalog.filter((it) => it.type === "service"), products = catalog.filter((it) => it.type === "product");
  const settings = state.invoiceSettings || { dueDays: 14, taxRate: 0 };
  const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const fromCatalog = (c) => ({ catalogId: c.id, name: c.name, qty: 1, price: c.price, taxable: !!c.taxable });
  const initItems = initial && initial.items && initial.items.length ? initial.items.map((x) => ({ ...x }))
    : initial && initial.svc ? [{ catalogId: null, name: initial.svc, qty: 1, price: initial.amount || 0, taxable: false, custom: true }]
    : [catalog[0] ? fromCatalog(catalog[0]) : { catalogId: null, name: "", qty: 1, price: 0, taxable: false, custom: true }];
  const [items, setItems] = useState(initItems);
  const [clientId, setClientId] = useState((initial && initial.clientId) || (active[0] || state.clients[0]).id);
  const [providerId, setProviderId] = useState((initial && initial.providerId) || state.providers[0].id);
  const [due, setDue] = useState((initial && initial.due) || (!edit ? addDays(todayISO, Number(settings.dueDays) || 14) : ""));
  const locked = initial && initial.clientId ? state.clients.find((c) => c.id === initial.clientId) : null;
  const pick = (idx, val) => setItems(items.map((it, i) => { if (i !== idx) return it; if (val === "custom") return { catalogId: null, name: "", qty: it.qty, price: 0, taxable: false, custom: true }; const c = catalog.find((x) => x.id === val); return c ? { ...fromCatalog(c), qty: it.qty } : it; }));
  const upd = (idx, patch) => setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const rate = (Number(settings.taxRate) || 0) / 100;
  const line = (it) => (Number(it.price) || 0) * (Number(it.qty) || 0);
  const subtotal = items.reduce((s, it) => s + line(it), 0);
  const tax = items.reduce((s, it) => s + (it.taxable ? line(it) * rate : 0), 0);
  const total = subtotal + tax;
  const ok = items.length > 0 && items.every((it) => it.name.trim() && Number(it.qty) > 0) && total > 0;
  const summary = items.length === 1 ? `${items[0].name}${Number(items[0].qty) > 1 ? ` ×${items[0].qty}` : ""}` : `${items[0].name} +${items.length - 1} more`;
  const save = () => {
    const clean = items.map((it) => ({ catalogId: it.catalogId || null, name: it.name.trim(), qty: Number(it.qty), price: Number(it.price), taxable: !!it.taxable }));
    const base = { items: clean, svc: summary, subtotal: +subtotal.toFixed(2), tax: +tax.toFixed(2), amount: +total.toFixed(2), providerId, due: due || null };
    onSave(edit ? base : { apptId: null, clientId, date: todayISO, tip: 0, status: "due", paidAt: null, ...base });
  };
  return (
    <Modal title={edit ? "Edit invoice" : locked ? `New invoice — ${locked.name}` : "New invoice"} onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={!ok} onClick={save}><Receipt size={14} /> {edit ? "Save changes" : `Create invoice · ${money(total)}`}</button></>}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div className="field"><label>Client</label><select className="sel" value={clientId} disabled={!!locked} onChange={(e) => setClientId(e.target.value)}>{(locked ? [locked] : active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="field"><label>Provider</label><select className="sel" value={providerId} onChange={(e) => setProviderId(e.target.value)}>{state.providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="field"><label>Due date</label><input className="inp" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
      </div>
      <div className="tiny" style={{ marginBottom: 8 }}>Line items</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 110px 90px 32px", gap: 8, fontSize: 11, color: "var(--muted)", padding: "0 0 4px" }}><span>Service / product</span><span>Qty</span><span>Price</span><span style={{ textAlign: "right" }}>Line</span><span /></div>
      {items.map((it, idx) => (
        <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 70px 110px 90px 32px", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <div>
            <select className="sel" value={it.catalogId || (it.custom || !it.catalogId ? "custom" : "")} onChange={(e) => pick(idx, e.target.value)}>
              {services.length > 0 && <optgroup label="Services">{services.map((c) => <option key={c.id} value={c.id}>{c.name} — {money(c.price)}{c.duration ? ` · ${c.duration} min` : ""}</option>)}</optgroup>}
              {products.length > 0 && <optgroup label="Products">{products.map((c) => <option key={c.id} value={c.id}>{c.name} — {money(c.price)}</option>)}</optgroup>}
              <option value="custom">Custom item…</option>
            </select>
            {!it.catalogId && <input className="inp" style={{ marginTop: 6 }} placeholder="Describe the custom item" value={it.name} onChange={(e) => upd(idx, { name: e.target.value })} />}
          </div>
          <input className="inp" type="number" min="1" value={it.qty} onChange={(e) => upd(idx, { qty: e.target.value })} />
          <input className="inp" type="number" min="0" step="0.01" value={it.price} onChange={(e) => upd(idx, { price: e.target.value })} />
          <div style={{ textAlign: "right", fontWeight: 600, fontSize: 13 }}>{money(line(it))}{it.taxable && <div className="muted" style={{ fontSize: 10.5, fontWeight: 400 }}>+tax</div>}</div>
          <button className="iconbtn" title="Remove line" disabled={items.length === 1} style={{ width: 28, height: 28, opacity: items.length === 1 ? .35 : 1 }} onClick={() => setItems(items.filter((_, i) => i !== idx))}><X size={14} /></button>
        </div>
      ))}
      <button className="btn ghost sm" onClick={() => setItems([...items, catalog[0] ? fromCatalog(catalog[0]) : { catalogId: null, name: "", qty: 1, price: 0, taxable: false, custom: true }])}><Plus size={13} /> Add line</button>
      <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 10, fontSize: 13 }}>
        <div className="row" style={{ justifyContent: "space-between", padding: "3px 0" }}><span className="muted">Subtotal</span><span>{money(subtotal)}</span></div>
        {tax > 0 && <div className="row" style={{ justifyContent: "space-between", padding: "3px 0" }}><span className="muted">Sales tax ({settings.taxRate}%)</span><span>{money(tax)}</span></div>}
        <div className="row" style={{ justifyContent: "space-between", padding: "6px 0 0", fontWeight: 700, fontSize: 15 }}><span>Total</span><span style={{ color: "var(--pine)" }}>{money(total)}</span></div>
      </div>
      {catalog.length === 0 && <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>No services or products yet — add them under Invoicing › Settings.</div>}
    </Modal>
  );
}

function ReminderModal({ invoices, state, dispatch, client, onClose }) {
  const [channel, setChannel] = useState("email");
  const [msg, setMsg] = useState(`Hi {first},\n\nA friendly reminder that you have an outstanding balance of {amount} with ${state.practice.name}. You can pay online, by phone, or at your next visit.\n\nThank you,\n${state.practice.name}`);
  const smsText = `${state.practice.name}: you have an account notice waiting. Log in to view, or call us. Reply STOP to opt out.`;
  const groups = Object.values(invoices.reduce((acc, i) => { const g = acc[i.clientId] || (acc[i.clientId] = { c: client(i.clientId), items: [], total: 0 }); g.items.push(i); g.total += i.amount; return acc; }, {}));
  const contact = (c) => (channel === "email" ? c.email : c.phone);
  const sendable = groups.filter((g) => contact(g.c));
  const send = () => {
    const at = new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    sendable.forEach((g) => g.items.forEach((i) => dispatch({ type: "UPDATE_INVOICE", id: i.id, patch: { reminders: [...(i.reminders || []), { at, to: contact(g.c), channel }], lastReminderAt: at } })));
    onClose();
  };
  return (
    <Modal title={invoices.length === 1 ? "Send payment reminder" : `Send payment reminders (${groups.length} client${groups.length === 1 ? "" : "s"})`} onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={!sendable.length} onClick={send}><BellRing size={14} /> Send {sendable.length} reminder{sendable.length === 1 ? "" : "s"}</button></>}>
      <div className="row" style={{ gap: 6, marginBottom: 12 }}>
        <button className={"btn sm" + (channel === "email" ? " pri" : "")} onClick={() => setChannel("email")}><Mail size={13} /> Email</button>
        <button className={"btn sm" + (channel === "sms" ? " pri" : "")} onClick={() => setChannel("sms")}><MessageSquare size={13} /> SMS</button>
      </div>
      {channel === "email"
        ? <div className="field"><label>Message <span className="muted">— {"{first}"} and {"{amount}"} fill per client</span></label><textarea className="ta" value={msg} onChange={(e) => setMsg(e.target.value)} style={{ minHeight: 120 }} /></div>
        : <div><div className="tiny" style={{ marginBottom: 6 }}>SMS (content-free by policy)</div><div style={{ padding: "10px 12px", background: "var(--sage)", borderRadius: 10, fontSize: 13 }}>{smsText}</div><div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Texts never include amounts, services, or account detail — they can land on a shared lock screen. The balance is shown after login.</div></div>}
      <div className="tiny" style={{ margin: "14px 0 6px" }}>Recipients</div>
      {groups.map((g) => (
        <div key={g.c.id} className="row" style={{ gap: 10, padding: "8px 0", borderBottom: "1px dashed var(--border)", alignItems: "center" }}>
          <div className="avatar" style={{ background: "var(--pine-soft)", width: 28, height: 28, fontSize: 10.5 }}>{initials(g.c.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{g.c.name}</div><div className="muted" style={{ fontSize: 12 }}>{contact(g.c) || <span style={{ color: "var(--rose)" }}>No {channel === "email" ? "email" : "phone"} on file — skipped</span>}</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, fontSize: 13 }}>{money0(g.total)}</div><div className="muted" style={{ fontSize: 11.5 }}>{g.items.length} invoice{g.items.length === 1 ? "" : "s"}</div></div>
        </div>
      ))}
    </Modal>
  );
}

function PayableModal({ initial, onClose, onSave }) {
  const CATS = ["Rent", "Supplies", "Software", "Processing fees", "Utilities", "Insurance", "Other"];
  const [f, setF] = useState(initial ? { category: "Other", notes: "", ...initial } : { vendor: "", amount: "", due: "", category: "Other", notes: "" });
  const ok = f.vendor.trim() && Number(f.amount) > 0;
  return (
    <Modal title={initial ? "Edit bill" : "Add bill"} onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={!ok} onClick={() => onSave({ vendor: f.vendor.trim(), amount: Number(f.amount), due: f.due || "Upcoming", category: f.category, notes: f.notes })}>{initial ? "Save changes" : "Add to payables"}</button></>}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field" style={{ gridColumn: "1 / -1" }}><label>Vendor</label><input className="inp" value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} /></div>
        <div className="field"><label>Amount ($)</label><input className="inp" type="number" min="0" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
        <div className="field"><label>Due</label><input className="inp" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} placeholder="e.g. Oct 01" /></div>
        <div className="field"><label>Category</label><select className="sel" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="field" style={{ gridColumn: "1 / -1" }}><label>Notes</label><input className="inp" value={f.notes || ""} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Optional" /></div>
      </div>
    </Modal>
  );
}

function Invoicing({ state, dispatch, client, prov, openPay, go, setSelClient, setApptFocus }) {
  const [tab, setTab] = useState("ar");
  const [showClosed, setShowClosed] = useState(false);
  const [selInv, setSelInv] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [voidId, setVoidId] = useState(null);
  const [delInv, setDelInv] = useState(null);
  const [remind, setRemind] = useState(null);
  const [emailInv, setEmailInv] = useState(null);
  const [payEdit, setPayEdit] = useState(null);
  const [delPay, setDelPay] = useState(null);
  const [itemEdit, setItemEdit] = useState(null);
  const [delItem, setDelItem] = useState(null);
  const is0 = state.invoiceSettings || {};
  const [sf, setSf] = useState({ prefix: is0.prefix || "INV", dueDays: is0.dueDays != null ? is0.dueDays : 14, taxRate: is0.taxRate != null ? is0.taxRate : 0, note: is0.note || "" });
  const [sfSaved, setSfSaved] = useState(null);

  const parse = (d) => new Date(d + "T00:00:00");
  const TODAY = parse(todayISO);
  const age = (i) => Math.max(0, Math.round((TODAY - parse(i.date)) / 86400000));
  const bucket = (a) => (a <= 30 ? "0–30" : a <= 60 ? "31–60" : "60+");
  const withAge = state.invoices.map((i) => ({ ...i, age: age(i) }));
  const due = withAge.filter((i) => i.status === "due");
  const rows = showClosed ? withAge : due;
  const arTotal = due.reduce((s, i) => s + i.amount, 0);
  const overdue = due.filter((i) => i.age > 30).reduce((s, i) => s + i.amount, 0);
  const apUpcoming = state.payables.filter((p) => p.status === "upcoming").reduce((s, p) => s + p.amount, 0);
  const inv = selInv ? state.invoices.find((i) => i.id === selInv) : null;
  const numOf = (i) => invNum(i, state);
  const exportCSV = () => downloadFile(`aop-receivables-${todayISO}.csv`, "Invoice,Client,Service,Amount,Date,Age (days),Status,Last reminder\n" + rows.map((i) => `${numOf(i)},${client(i.clientId).name},"${i.svc}",${i.amount},${i.date},${i.age},${i.status},${i.lastReminderAt || ""}`).join("\n"), "text/csv");
  const statusPill = (i) => i.status === "paid" ? <span className="pill paid"><Check size={11} /> Paid</span> : i.status === "void" ? <span className="pill cxl">Void</span> : i.age > 30 ? <span className="pill due">Overdue · {bucket(i.age)}</span> : <span className="pill done">Due · {bucket(i.age)}</span>;

  const modals = (
    <>
      {creating && <InvoiceModal state={state} onClose={() => setCreating(false)} onSave={(x) => { dispatch({ type: "ADD_INVOICE", inv: x }); setCreating(false); }} />}
      {editing && <InvoiceModal state={state} edit initial={editing} onClose={() => setEditing(null)} onSave={(patch) => { dispatch({ type: "UPDATE_INVOICE", id: editing.id, patch }); setEditing(null); }} />}
      {voidId && <ConfirmModal danger title="Void this invoice?" confirm="Void invoice" onClose={() => setVoidId(null)} body={<>The invoice will be marked void and removed from receivables. This can’t be undone.</>} onConfirm={() => { dispatch({ type: "VOID_INVOICE", id: voidId }); setVoidId(null); }} />}
      {delInv && <ConfirmModal danger title={`Delete ${numOf(delInv)} permanently?`} confirm="Delete invoice" onClose={() => setDelInv(null)} body={<>This voided invoice will be removed from the ledger entirely. Paid invoices can’t be deleted — they’re financial records.</>} onConfirm={() => { dispatch({ type: "REMOVE_INVOICE", id: delInv.id }); if (selInv === delInv.id) setSelInv(null); setDelInv(null); }} />}
      {remind && <ReminderModal invoices={remind} state={state} dispatch={dispatch} client={client} onClose={() => setRemind(null)} />}
      {emailInv && <EmailReceiptModal inv={state.invoices.find((i) => i.id === emailInv)} state={state} dispatch={dispatch} client={client} onClose={() => setEmailInv(null)} />}
      {payEdit && <PayableModal initial={payEdit === "new" ? null : payEdit} onClose={() => setPayEdit(null)} onSave={(p) => { if (payEdit === "new") dispatch({ type: "ADD_PAYABLE", payable: { ...p, status: "upcoming" } }); else dispatch({ type: "UPDATE_PAYABLE", id: payEdit.id, patch: p }); setPayEdit(null); }} />}
      {itemEdit && <ItemModal initial={typeof itemEdit === "object" ? itemEdit : null} type={typeof itemEdit === "string" ? itemEdit : undefined} onClose={() => setItemEdit(null)} onSave={(it) => { if (typeof itemEdit === "object") dispatch({ type: "UPDATE_ITEM", id: itemEdit.id, patch: it }); else dispatch({ type: "ADD_ITEM", item: it }); setItemEdit(null); }} />}
      {delItem && <ConfirmModal danger title={`Delete “${delItem.name}”?`} confirm="Delete" onClose={() => setDelItem(null)} body={<>It will be removed from the catalog. Existing invoices keep their line items. Prefer <b>Archive</b> if you might offer it again.</>} onConfirm={() => { dispatch({ type: "REMOVE_ITEM", id: delItem.id }); setDelItem(null); }} />}
      {delPay && <ConfirmModal danger title={`Delete bill from ${delPay.vendor}?`} confirm="Delete bill" onClose={() => setDelPay(null)} body={<>This removes the bill from payables. This can’t be undone.</>} onConfirm={() => { dispatch({ type: "REMOVE_PAYABLE", id: delPay.id }); setDelPay(null); }} />}
    </>
  );

  if (selInv && inv) return (<><InvoiceDetail inv={inv} state={state} dispatch={dispatch} client={client} prov={prov} openPay={openPay} onBack={() => setSelInv(null)} onVoid={() => setVoidId(inv.id)} onEmail={() => setEmailInv(inv.id)} go={go} setSelClient={setSelClient} setApptFocus={setApptFocus} />{modals}</>);

  const arMenu = (i) => [
    { label: "Open", icon: <FileText size={14} />, onClick: () => setSelInv(i.id) },
    ...(i.status === "due" ? [
      { label: "Edit", icon: <Pencil size={14} />, onClick: () => setEditing(i) },
      { label: "Send reminder", icon: <BellRing size={14} />, onClick: () => setRemind([i]) },
      { label: "Email invoice", icon: <Mail size={14} />, onClick: () => setEmailInv(i.id) },
      { label: "Collect payment", icon: <CreditCard size={14} />, onClick: () => openPay(i.id) },
      "sep",
      { label: "Void", icon: <Ban size={14} />, danger: true, onClick: () => setVoidId(i.id) },
    ] : i.status === "paid" ? [
      { label: "Email receipt", icon: <Mail size={14} />, onClick: () => setEmailInv(i.id) },
      "sep",
      { label: "Delete", icon: <Trash2 size={14} />, danger: true, disabled: true, title: "Paid invoices are financial records and can’t be deleted", onClick: () => {} },
    ] : [
      "sep",
      { label: "Delete permanently", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelInv(i) },
    ]),
  ];
  const apMenu = (p) => [
    { label: "Edit", icon: <Pencil size={14} />, onClick: () => setPayEdit(p) },
    ...(p.status !== "paid" ? [{ label: "Mark paid", icon: <Check size={14} />, onClick: () => dispatch({ type: "PAY_PAYABLE", id: p.id }) }] : [{ label: "Reopen", icon: <RotateCcw size={14} />, onClick: () => dispatch({ type: "UPDATE_PAYABLE", id: p.id, patch: { status: "upcoming" } }) }]),
    "sep",
    { label: "Delete", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelPay(p) },
  ];

  return (
    <>
      <div className="row" style={{ gap: 6, marginBottom: 16 }}>
        <button className={"btn sm" + (tab === "ar" ? " pri" : "")} onClick={() => setTab("ar")}><FileText size={13} /> Receivables</button>
        <button className={"btn sm" + (tab === "ap" ? " pri" : "")} onClick={() => setTab("ap")}><Building2 size={13} /> Payables</button>
        <button className={"btn sm" + (tab === "settings" ? " pri" : "")} onClick={() => setTab("settings")}><Settings size={13} /> Settings</button>
      </div>

      <div className="grid kpis" style={{ marginBottom: 16 }}>
        <Kpi label="Receivable (A/R)" icon={FileText} val={money0(arTotal)} delta={`${due.length} open invoice${due.length === 1 ? "" : "s"}`} />
        <Kpi label="Overdue (30+ days)" icon={AlertTriangle} val={money0(overdue)} delta={`${due.filter((i) => i.age > 30).length} invoice${due.filter((i) => i.age > 30).length === 1 ? "" : "s"}`} />
        <Kpi label="Payable (A/P)" icon={Building2} val={money0(apUpcoming)} delta="upcoming bills" />
        <Kpi label="Net position" icon={CircleDollarSign} val={money0(arTotal - apUpcoming)} delta="A/R minus A/P" up={arTotal - apUpcoming >= 0} />
      </div>

      {tab === "ar" ? (
        <div className="card">
          <div className="sec-h" style={{ flexWrap: "wrap", gap: 8 }}>
            <h3>Accounts receivable</h3>
            <div className="row" style={{ gap: 8, marginLeft: "auto", flexWrap: "wrap", alignItems: "center" }}>
              <label className="row" style={{ gap: 6, fontSize: 12.5, cursor: "pointer" }}><input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} /> Show paid & void</label>
              <button className="btn sm" onClick={exportCSV}><Download size={13} /> Export</button>
              <button className="btn sm" disabled={!due.length} onClick={() => setRemind(due)}><BellRing size={13} /> Send reminders ({due.length})</button>
              <button className="btn pri sm" onClick={() => setCreating(true)}><Plus size={13} /> New invoice</button>
            </div>
          </div>
          <DataTable rows={rows} search searchPlaceholder="Search invoices" defaultSort={{ key: "age", dir: "desc" }} onRowClick={(i) => setSelInv(i.id)} empty="Nothing outstanding — every invoice is paid."
            filters={[
              { key: "bucket", label: "Aging", options: [{ value: "0–30", label: "0–30 days" }, { value: "31–60", label: "31–60 days" }, { value: "60+", label: "60+ days" }], test: (i, v) => bucket(i.age) === v },
              { key: "rem", label: "Reminders", options: [{ value: "sent", label: "Reminded" }, { value: "none", label: "Never reminded" }], test: (i, v) => (v === "sent") === !!i.lastReminderAt },
              ...(showClosed ? [{ key: "status", label: "Status", options: [{ value: "due", label: "Due" }, { value: "paid", label: "Paid" }, { value: "void", label: "Void" }], test: (i, v) => i.status === v }] : []),
            ]}
            columns={[
              { key: "num", label: "Invoice", sortVal: (i) => i.id, render: (i) => <span className="muted" style={{ fontSize: 12 }}>{numOf(i)}</span> },
              { key: "client", label: "Client", sortVal: (i) => client(i.clientId).name, render: (i) => <span style={{ fontWeight: 600 }}>{client(i.clientId).name}</span> },
              { key: "svc", label: "Service", render: (i) => <span className="muted">{i.svc}</span> },
              { key: "amount", label: "Amount", align: "num", render: (i) => money0(i.amount) },
              { key: "date", label: "Date", align: "num" },
              { key: "age", label: "Age", align: "num", render: (i) => `${i.age}d` },
              { key: "status", label: "Status", sortVal: (i) => (i.status === "due" ? i.age : -1), render: (i) => statusPill(i) },
              { key: "lastReminderAt", label: "Reminded", render: (i) => i.lastReminderAt ? <span className="muted" style={{ fontSize: 12 }}>{i.lastReminderAt} · ×{(i.reminders || []).length}</span> : <span className="muted">—</span> },
              { key: "act", label: "", sortable: false, render: (i) => <div className="row" style={{ gap: 6, justifyContent: "flex-end", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>{i.status === "due" && <button className="btn pri sm" onClick={() => openPay(i.id)}>Collect</button>}<Kebab items={arMenu(i)} /><ChevronRight size={16} color="var(--muted-2)" /></div> },
            ]} />
        </div>
      ) : tab === "settings" ? (
        <div className="two" style={{ alignItems: "start", gridTemplateColumns: "1.6fr 1fr" }}>
          <div className="card">
            <div className="sec-h" style={{ flexWrap: "wrap", gap: 8 }}>
              <h3>Services & products</h3>
              <div className="row" style={{ gap: 8, marginLeft: "auto" }}>
                <button className="btn sm" onClick={() => setItemEdit("product")}><Plus size={13} /> Add product</button>
                <button className="btn pri sm" onClick={() => setItemEdit("service")}><Plus size={13} /> Add service</button>
              </div>
            </div>
            <DataTable rows={state.catalog || []} search searchPlaceholder="Search catalog" defaultSort={{ key: "type", dir: "asc" }} empty="No services or products yet."
              filters={[
                { key: "type", label: "Type", options: [{ value: "service", label: "Services" }, { value: "product", label: "Products" }], test: (it, v) => it.type === v },
                { key: "active", label: "Status", options: [{ value: "on", label: "Active" }, { value: "off", label: "Archived" }], test: (it, v) => (v === "on") === (it.active !== false) },
              ]}
              columns={[
                { key: "name", label: "Name", render: (it) => <span style={{ fontWeight: 600, opacity: it.active === false ? .55 : 1 }}>{it.name}{it.active === false && <span className="pill cxl" style={{ marginLeft: 6 }}>Archived</span>}</span> },
                { key: "type", label: "Type", render: (it) => <span className={`pill ${it.type === "service" ? "w2" : "c1099"}`}>{it.type === "service" ? "Service" : "Product"}</span> },
                { key: "category", label: "Category", render: (it) => <span className="muted">{it.category || "—"}</span> },
                { key: "price", label: "Price", align: "num", render: (it) => money(it.price) },
                { key: "duration", label: "Duration", align: "num", sortVal: (it) => it.duration || 0, render: (it) => it.type === "service" && it.duration ? `${it.duration} min` : <span className="muted">—</span> },
                { key: "taxable", label: "Tax", sortVal: (it) => (it.taxable ? 1 : 0), render: (it) => it.taxable ? <span className="pill">Taxable</span> : <span className="muted">—</span> },
                { key: "act", label: "", sortable: false, render: (it) => <div className="row" style={{ gap: 6, justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}><Kebab items={[
                  { label: "Edit", icon: <Pencil size={14} />, onClick: () => setItemEdit(it) },
                  it.active === false ? { label: "Restore", icon: <ArchiveRestore size={14} />, onClick: () => dispatch({ type: "UPDATE_ITEM", id: it.id, patch: { active: true } }) } : { label: "Archive", icon: <Archive size={14} />, onClick: () => dispatch({ type: "UPDATE_ITEM", id: it.id, patch: { active: false } }) },
                  "sep",
                  { label: "Delete", icon: <Trash2 size={14} />, danger: true, onClick: () => setDelItem(it) },
                ]} /></div> },
              ]} />
            <div className="muted" style={{ fontSize: 12, padding: "10px 18px 14px" }}>Archived items stay on existing invoices but disappear from the dropdowns. Services also populate the appointment booking form.</div>
          </div>
          <section className="card pad">
            <div className="tiny" style={{ marginBottom: 10 }}>Invoice defaults</div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field"><label>Number prefix</label><input className="inp" value={sf.prefix} onChange={(e) => setSf({ ...sf, prefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) })} /></div>
              <div className="field"><label>Payment terms (days)</label><input className="inp" type="number" min="0" value={sf.dueDays} onChange={(e) => setSf({ ...sf, dueDays: e.target.value })} /></div>
              <div className="field"><label>Sales tax rate (%)</label><input className="inp" type="number" min="0" step="0.01" value={sf.taxRate} onChange={(e) => setSf({ ...sf, taxRate: e.target.value })} /></div>
              <div className="field"><label>Preview</label><div className="inp" style={{ background: "var(--sage)", color: "var(--muted)" }}>{sf.prefix || "INV"}-0001</div></div>
              <div className="field" style={{ gridColumn: "1 / -1" }}><label>Receipt footer note</label><input className="inp" value={sf.note} onChange={(e) => setSf({ ...sf, note: e.target.value })} /></div>
            </div>
            <div className="row" style={{ gap: 10, marginTop: 14, alignItems: "center" }}>
              <button className="btn pri" onClick={() => { dispatch({ type: "UPDATE_INVOICE_SETTINGS", patch: { prefix: sf.prefix || "INV", dueDays: Number(sf.dueDays) || 0, taxRate: Number(sf.taxRate) || 0, note: sf.note } }); setSfSaved(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })); }}><Check size={14} /> Save defaults</button>
              {sfSaved && <span className="savechip"><CheckCircle2 size={14} /> Saved {sfSaved}</span>}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 12 }}>Tax applies only to items marked taxable — typically retail products, not massage services. Check your state rules before enabling.</div>
          </section>
        </div>
      ) : (
        <div className="card">
          <div className="sec-h"><h3>Accounts payable</h3><button className="btn pri sm" style={{ marginLeft: "auto" }} onClick={() => setPayEdit("new")}><Plus size={13} /> Add bill</button></div>
          <DataTable rows={state.payables} search searchPlaceholder="Search payables" defaultSort={{ key: "amount", dir: "desc" }}
            filters={[
              { key: "status", label: "Status", options: [{ value: "upcoming", label: "Upcoming" }, { value: "paid", label: "Paid" }], test: (p, v) => p.status === v },
              { key: "category", label: "Category", options: [...new Set(state.payables.map((p) => p.category || "Other"))].map((c) => ({ value: c, label: c })), test: (p, v) => (p.category || "Other") === v },
            ]}
            columns={[
              { key: "vendor", label: "Vendor", render: (p) => <span style={{ fontWeight: 600 }}>{p.vendor}{p.notes ? <div className="muted" style={{ fontSize: 12, fontWeight: 400 }}>{p.notes}</div> : null}</span> },
              { key: "category", label: "Category", render: (p) => <span className="pill">{p.category || "Other"}</span> },
              { key: "amount", label: "Amount", align: "num", render: (p) => money0(p.amount) },
              { key: "due", label: "Due", render: (p) => <span className="muted">{p.due}</span> },
              { key: "status", label: "Status", render: (p) => p.status === "paid" ? <span className="pill paid">Paid</span> : <span className="pill due">Upcoming</span> },
              { key: "act", label: "", sortable: false, render: (p) => <div className="row" style={{ gap: 6, justifyContent: "flex-end", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>{p.status !== "paid" && <button className="btn sm" onClick={() => dispatch({ type: "PAY_PAYABLE", id: p.id })}>Mark paid</button>}<Kebab items={apMenu(p)} /></div> },
            ]} />
        </div>
      )}
      {modals}
    </>
  );
}

function Payments({ state, dispatch, client, prov, openPay, go, setSelClient, setApptFocus }) {
  const [creating, setCreating] = useState(false);
  const [voidId, setVoidId] = useState(null);
  const [selInv, setSelInv] = useState(null);
  const [emailInv, setEmailInv] = useState(null);
  const inv = selInv ? state.invoices.find((i) => i.id === selInv) : null;
  const emailTarget = emailInv ? state.invoices.find((i) => i.id === emailInv) : null;
  const emailModal = emailTarget && <EmailReceiptModal inv={emailTarget} state={state} dispatch={dispatch} client={client} onClose={() => setEmailInv(null)} />;
  const voidModal = voidId && <ConfirmModal danger title="Void this invoice?" confirm="Void invoice" onClose={() => setVoidId(null)} body={<>The invoice will be marked void and removed from receivables. This can’t be undone.</>} onConfirm={() => { dispatch({ type: "VOID_INVOICE", id: voidId }); setVoidId(null); }} />;
  if (selInv && inv) return (<><InvoiceDetail inv={inv} state={state} dispatch={dispatch} client={client} prov={prov} openPay={openPay} onBack={() => setSelInv(null)} onVoid={() => setVoidId(inv.id)} onEmail={() => setEmailInv(inv.id)} go={go} setSelClient={setSelClient} setApptFocus={setApptFocus} />{voidModal}{emailModal}</>);
  const paid = state.invoices.filter((i) => i.status === "paid");
  const collected = paid.reduce((s, i) => s + i.amount + i.tip, 0);
  const outstanding = state.invoices.filter((i) => i.status === "due").reduce((s, i) => s + i.amount, 0);
  const tips = paid.reduce((s, i) => s + i.tip, 0);
  return (
    <>
      <div className="grid kpis" style={{ marginBottom: 16 }}>
        <Kpi label="Collected" icon={CircleDollarSign} val={money0(collected)} delta={`incl. ${money0(tips)} tips`} up />
        <Kpi label="Outstanding" icon={Receipt} val={money0(outstanding)} delta={`${state.invoices.filter((i) => i.status === "due").length} invoices`} />
        <Kpi label="Avg ticket" icon={BarChart3} val={money0(collected / Math.max(paid.length, 1))} delta="per paid visit" />
        <Kpi label="Processing" icon={ShieldCheck} val="Stripe" delta="Healthcare · PCI" />
      </div>
      <div className="card">
        <div className="sec-h"><h3>Invoices</h3><button className="btn pri sm" onClick={() => setCreating(true)}><Plus size={13} /> New invoice</button></div>
        <DataTable rows={state.invoices} search searchPlaceholder="Search invoices" defaultSort={{ key: "date", dir: "desc" }} onRowClick={(i) => setSelInv(i.id)}
          filters={[
            { key: "status", label: "Status", options: [{ value: "paid", label: "Paid" }, { value: "due", label: "Due" }, { value: "void", label: "Void" }], test: (i, v) => i.status === v },
            { key: "prov", label: "Provider", options: state.providers.map((p) => ({ value: p.id, label: p.name })), test: (i, v) => i.providerId === v },
            { key: "tip", label: "Tip", options: [{ value: "yes", label: "With tip" }, { value: "no", label: "No tip" }], test: (i, v) => (v === "yes") === !!i.tip },
          ]}
          columns={[
            { key: "date", label: "Date", align: "num" },
            { key: "client", label: "Client", sortVal: (i) => client(i.clientId).name, render: (i) => <span style={{ fontWeight: 600 }}>{client(i.clientId).name}</span> },
            { key: "svc", label: "Service" },
            { key: "provider", label: "Provider", sortVal: (i) => prov(i.providerId).name, render: (i) => <span className="muted">{prov(i.providerId).name}</span> },
            { key: "amount", label: "Amount", align: "num", render: (i) => money(i.amount) },
            { key: "tip", label: "Tip", align: "num", render: (i) => <span className="muted">{i.tip ? money(i.tip) : "—"}</span> },
            { key: "status", label: "Status", render: (i) => i.status === "paid" ? <span className="pill paid"><Check size={11} /> Paid</span> : i.status === "void" ? <span className="pill cxl">Void</span> : <span className="pill due">Due</span> },
            { key: "act", label: "", sortable: false, render: (i) => <div className="row" style={{ gap: 6, justifyContent: "flex-end", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>{i.status === "due" && <><button className="btn pri sm" onClick={() => openPay(i.id)}>Charge</button><button className="btn sm" title="Void invoice" style={{ color: "var(--rose)" }} onClick={() => setVoidId(i.id)}>Void</button></>}{i.status !== "void" && <button className="btn sm" title={`Email ${i.status === "paid" ? "receipt" : "invoice"}`} onClick={() => setEmailInv(i.id)}><Mail size={13} /></button>}<ChevronRight size={16} color="var(--muted-2)" /></div> },
          ]} />
      </div>
      {creating && <InvoiceModal state={state} onClose={() => setCreating(false)} onSave={(inv) => { dispatch({ type: "ADD_INVOICE", inv }); setCreating(false); }} />}
      {voidModal}
      {emailModal}
    </>
  );
}

function PayModal({ inv, client, onClose, onPay }) {
  const [tip, setTip] = useState(0);
  if (!inv) return null;
  return (
    <Modal title="Collect payment" onClose={onClose} footer={<>
      <button className="btn" onClick={onClose}>Cancel</button>
      <button className="btn pri" onClick={() => onPay(tip)}><CircleDollarSign size={15} /> Charge {money(inv.amount + tip)}</button>
    </>}>
      <div className="statline"><span className="muted">Client</span><span style={{ fontWeight: 600 }}>{client(inv.clientId).name}</span></div>
      <div className="statline"><span className="muted">Service</span><span>{inv.svc}</span></div>
      <div className="statline"><span className="muted">Amount</span><span className="num" style={{ fontWeight: 600 }}>{money(inv.amount)}</span></div>
      <div className="field" style={{ marginTop: 16 }}>
        <label>Add tip</label>
        <div className="row" style={{ gap: 8 }}>
          {[0, 0.15, 0.18, 0.2].map((pct) => (
            <button key={pct} className={`btn sm ${tip === Math.round(inv.amount * pct) ? "pri" : ""}`} onClick={() => setTip(Math.round(inv.amount * pct))}>{pct === 0 ? "None" : `${pct * 100}%`}</button>
          ))}
        </div>
      </div>
      <div className="muted" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}><ShieldCheck size={13} /> Processed via Stripe Healthcare. Receipt sent to client portal.</div>
    </Modal>
  );
}

/* ----------------------------- Messages ----------------------------- */
function Messages({ state, dispatch, selThread, setSelThread }) {
  const [text, setText] = useState("");
  const [creating, setCreating] = useState(false);
  const [pick, setPick] = useState("c:" + (state.clients.find((c) => !c.archived) || state.clients[0]).id);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingDel, setPendingDel] = useState(null);
  const [confirmThread, setConfirmThread] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const t = state.threads.find((x) => x.id === selThread) || state.threads[0];
  const fmtSize = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : b >= 1024 ? Math.round(b / 1024) + " KB" : b + " B");
  const addFiles = (list) => {
    Array.from(list || []).forEach((file) => {
      const meta = { id: "f" + Date.now() + Math.random().toString(36).slice(2, 6), name: file.name, size: file.size, type: file.type || "application/octet-stream", url: null };
      setPendingFiles((p) => [...p, meta]);
      if (file.size <= 8 * 1024 * 1024) { const r = new FileReader(); r.onload = () => setPendingFiles((p) => p.map((x) => (x.id === meta.id ? { ...x, url: r.result } : x))); r.readAsDataURL(file); }
    });
  };
  const send = () => { if ((!text.trim() && !pendingFiles.length) || !t) return; dispatch({ type: "SEND_MSG", id: t.id, text: text.trim(), files: pendingFiles }); setText(""); setPendingFiles([]); };
  const start = () => {
    const [kind, rid] = pick.split(":");
    const person = kind === "c" ? state.clients.find((x) => x.id === rid) : state.providers.find((x) => x.id === rid);
    if (!person) return;
    const existing = state.threads.find((th) => th.refId === rid || th.name === person.name);
    if (existing) setSelThread(existing.id);
    else { const tid = "t" + Date.now(); dispatch({ type: "ADD_THREAD", thread: { id: tid, name: person.name, kind: kind === "c" ? "client" : "provider", refId: rid, msgs: [] } }); setSelThread(tid); }
    setCreating(false);
  };
  const isImg = (f) => f.type && f.type.startsWith("image/") && f.url;
  const renderFiles = (files, me) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {files.map((f) => isImg(f)
        ? <img key={f.id} src={f.url} alt={f.name} title={f.name} onClick={() => setLightbox(f)} style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8, display: "block", cursor: "zoom-in", border: "1px solid rgba(0,0,0,.08)" }} />
        : <a key={f.id} href={f.url || undefined} download={f.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, background: me ? "rgba(255,255,255,.16)" : "#fff", color: "inherit", textDecoration: "none", fontSize: 12.5, border: me ? "none" : "1px solid var(--border)" }}><FileIcon size={14} />{f.name}<span style={{ opacity: .65, fontSize: 11 }}>{fmtSize(f.size)}</span><Download size={12} style={{ opacity: .7 }} /></a>)}
    </div>
  );

  return (
    <>
      <div className="card" style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: 460, overflow: "hidden" }}>
        <div style={{ borderRight: "1px solid var(--border)" }}>
          <div className="sec-h"><h3>Conversations</h3><button className="btn pri sm" onClick={() => setCreating(true)}><Plus size={13} /> New</button></div>
          {state.threads.map((th) => {
            const last = th.msgs[th.msgs.length - 1];
            const unread = last && last.from !== "me";
            const preview = last ? (last.text || (last.files && last.files.length ? `📎 ${last.files.length} attachment${last.files.length > 1 ? "s" : ""}` : "")) : "No messages yet";
            return (
              <button key={th.id} onClick={() => { setSelThread(th.id); setPendingDel(null); }} style={{ display: "block", width: "100%", textAlign: "left", border: "none", borderTop: "1px solid var(--border)", background: t && t.id === th.id ? "var(--sage)" : "#fff", padding: "12px 16px", cursor: "pointer" }}>
                <div className="row" style={{ gap: 8 }}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 10.5, background: th.kind === "provider" ? "var(--gold)" : "var(--pine-soft)" }}>{initials(th.name)}</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{th.name}</div>
                  {unread && <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "var(--amber)" }} />}
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{preview}</div>
              </button>
            );
          })}
          {state.threads.length === 0 && <div className="empty">No conversations yet.</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}>
          {t ? (
            <>
              <div className="sec-h" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 14 }}>
                <h3>{t.name} <span className="tiny" style={{ marginLeft: 6 }}>{t.kind === "provider" ? "Provider" : "Client"} · demo</span></h3>
                <button className="btn ghost sm" title="Delete conversation" style={{ color: "var(--rose)" }} onClick={() => setConfirmThread(true)}><Trash2 size={13} /> Delete</button>
              </div>
              <div style={{ flex: 1, padding: 18, display: "flex", flexDirection: "column", gap: 10, overflow: "auto", background: dragOver ? "var(--sage)" : "transparent", transition: "background .15s" }}>
                {dragOver && <div className="muted" style={{ textAlign: "center", fontSize: 13, padding: 8 }}>Drop files to attach</div>}
                {t.msgs.length === 0 && !dragOver && <div className="muted" style={{ fontSize: 13 }}>Demo conversation only. Messages and files stay in browser memory; no secure messaging service is connected.</div>}
                {t.msgs.map((m, i) => {
                  const me = m.from === "me";
                  return (
                    <div key={m.id || i} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "76%", display: "flex", gap: 6, alignItems: "flex-end", flexDirection: me ? "row-reverse" : "row" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ background: me ? "var(--pine)" : "var(--sage)", color: me ? "#fff" : "var(--ink)", padding: "9px 13px", borderRadius: 13, fontSize: 13.5, lineHeight: 1.45 }}>
                          {m.text}
                          {m.files && m.files.length > 0 && renderFiles(m.files, me)}
                        </div>
                        <div className="muted" style={{ fontSize: 11, marginTop: 3, textAlign: me ? "right" : "left" }}>{m.t}</div>
                      </div>
                      {me && <button className="iconbtn" title="Unsend message" onClick={() => setPendingDel(i)} style={{ width: 26, height: 26, opacity: .55, marginBottom: 18, flex: "0 0 auto" }}><MessageSquareX size={14} /></button>}
                    </div>
                  );
                })}
              </div>
              {pendingFiles.length > 0 && (
                <div className="row" style={{ gap: 6, padding: "10px 14px 0", flexWrap: "wrap" }}>
                  {pendingFiles.map((f) => (
                    <span key={f.id} className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--sage)", color: "var(--ink)" }}>
                      {f.type.startsWith("image/") ? <ImageIcon size={12} /> : <FileIcon size={12} />}{f.name}<span className="muted" style={{ fontSize: 11 }}>{fmtSize(f.size)}</span>
                      <button className="iconbtn" style={{ width: 18, height: 18 }} title="Remove attachment" onClick={() => setPendingFiles((p) => p.filter((x) => x.id !== f.id))}><X size={11} /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="row" style={{ gap: 8, padding: 14, borderTop: "1px solid var(--border)" }}>
                <input ref={fileRef} type="file" multiple style={{ display: "none" }} onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                <button className="btn" title="Attach files" onClick={() => fileRef.current && fileRef.current.click()}><Paperclip size={15} /></button>
                <input className="inp" placeholder="Write a sample message… or drop files here" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
                <button className="btn pri" disabled={!text.trim() && !pendingFiles.length} onClick={send}><Send size={15} /></button>
              </div>
            </>
          ) : <div className="empty" style={{ margin: "auto" }}>No conversations yet.</div>}
        </div>
      </div>
      {creating && <Modal title="New conversation" onClose={() => setCreating(false)} footer={<><button className="btn" onClick={() => setCreating(false)}>Cancel</button><button className="btn pri" onClick={start}>Open</button></>}>
        <div className="field"><label>Message</label>
          <select className="sel" value={pick} onChange={(e) => setPick(e.target.value)}>
            <optgroup label="Clients">{state.clients.filter((c) => !c.archived).map((c) => <option key={c.id} value={"c:" + c.id}>{c.name}</option>)}</optgroup>
            <optgroup label="Providers">{state.providers.map((p) => <option key={p.id} value={"p:" + p.id}>{p.name}</option>)}</optgroup>
          </select>
        </div>
      </Modal>}
      {confirmThread && t && <ConfirmModal danger title={`Delete conversation with ${t.name}?`} confirm="Delete conversation" onClose={() => setConfirmThread(false)}
        body={<>All messages and attachments in this thread will be removed from your view. This can’t be undone.</>}
        onConfirm={() => { dispatch({ type: "DELETE_THREAD", id: t.id }); setSelThread(null); setConfirmThread(false); }} />}
      {pendingDel !== null && t && t.msgs[pendingDel] && t.msgs[pendingDel].from === "me" && <ConfirmModal danger title="Unsend this message?" confirm="Unsend" onClose={() => setPendingDel(null)} body={<>Your message and any attachments will be removed from the conversation for both of you. Messages you receive can’t be deleted — they’re part of the client’s record.</>} onConfirm={() => { dispatch({ type: "DELETE_MSG", id: t.id, idx: pendingDel }); setPendingDel(null); }} />}
      {lightbox && <Modal title={lightbox.name} onClose={() => setLightbox(null)} footer={<><button className="btn" onClick={() => setLightbox(null)}>Close</button><a className="btn pri" href={lightbox.url} download={lightbox.name} style={{ textDecoration: "none" }}><Download size={14} /> Download</a></>}>
        <img src={lightbox.url} alt={lightbox.name} style={{ maxWidth: "100%", maxHeight: "60vh", display: "block", margin: "0 auto", borderRadius: 10 }} />
      </Modal>}
    </>
  );
}

/* ----------------------------- Payroll ----------------------------- */
function Payroll({ state, dispatch, prov, setKeypad }) {
  const rows = useMemo(() => state.providers.map((p) => {
    const paid = state.invoices.filter((i) => i.providerId === p.id && i.status === "paid");
    const grossServices = paid.reduce((s, i) => s + i.amount, 0);
    const tips = paid.reduce((s, i) => s + i.tip, 0);
    const hours = p.clockedIn ? 6.2 : 5.5;
    const hourly = p.type === "W2" ? p.rate * hours : 0;
    const commission = grossServices * p.commission;
    const gross = hourly + commission + tips;
    return { p, hours, hourly, commission, tips, gross, visits: paid.length };
  }), [state]);

  const total = rows.reduce((s, r) => s + r.gross, 0);
  const pd = new Date(todayISO + "T00:00:00"); const dayN = pd.getDate();
  const pStart = dayN <= 15 ? 1 : 16, pEnd = dayN <= 15 ? 15 : new Date(pd.getFullYear(), pd.getMonth() + 1, 0).getDate();
  const fmtD = (n) => new Date(pd.getFullYear(), pd.getMonth(), n).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const period = `${fmtD(pStart)} – ${fmtD(pEnd)}, ${pd.getFullYear()}`;
  const nProv = state.providers.length;
  const exportQB = () => {
    const iif = ["!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO", "!SPL\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO", "!ENDTRNS",
      ...rows.flatMap((r) => [`TRNS\tCHECK\t${todayISO}\tPayroll Expenses\t${r.p.name}\t${(-r.gross).toFixed(2)}\tPayroll ${period}`, `SPL\tCHECK\t${todayISO}\tChecking\t${r.p.name}\t${r.gross.toFixed(2)}\t${r.p.type}`, "ENDTRNS"])].join("\n");
    downloadFile(`aop-payroll-${todayISO}.iif`, iif, "text/plain");
    dispatch({ type: "RUN_PAYROLL", text: `Payroll exported to QuickBooks (IIF) — ${nProv} providers`, at: "Just now" });
  };

  const exportCSV = () => {
    const header = "Provider,Classification,Pay Type,Hours,Hourly Pay,Commission,Tips,Gross\n";
    const body = rows.map((r) => [r.p.name, r.p.type, r.p.pay, r.hours, r.hourly.toFixed(2), r.commission.toFixed(2), r.tips.toFixed(2), r.gross.toFixed(2)].join(",")).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `aop-payroll-${todayISO}.csv`; a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: "RUN_PAYROLL", text: `Payroll exported (CSV) for ${period} — ${nProv} providers`, at: "Just now" });
  };
  const runPayroll = () => dispatch({ type: "RUN_PAYROLL", text: `Payroll run finalized for ${period} — gross ${money0(total)} across ${nProv} providers`, at: "Just now" });

  return (
    <>
      <div className="row" style={{ marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
        <div><div className="tiny">Pay period</div><div style={{ fontWeight: 600, fontSize: 14 }}>{period}</div></div>
        <div className="spacer" />
        <button className="btn" onClick={exportCSV}><Download size={15} /> Export CSV</button>
        <button className="btn" onClick={exportQB}><Download size={15} /> QuickBooks (IIF)</button>
        <button className="btn pri" onClick={runPayroll}><Wallet size={15} /> Run payroll</button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 16 }}>
        {state.providers.map((p) => (
          <div key={p.id} className="card pad">
            <div className="row" style={{ gap: 10, marginBottom: 10 }}>
              <div className="avatar" style={{ background: p.color, width: 36, height: 36, fontSize: 13 }}>{initials(p.name)}</div>
              <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</div><div className="muted" style={{ fontSize: 12 }}>{p.role} · {p.pay}</div></div>
            </div>
            <div className="row" style={{ gap: 6, marginBottom: 10 }}>
              <span className={`pill ${p.type === "W2" ? "w2" : "c1099"}`}>{p.type === "W2" ? "W-2 Employee" : "1099 Contractor"}</span>
            </div>
            {p.clockedIn
              ? <button className="btn sm" style={{ width: "100%" }} onClick={() => setKeypad(p.id)}><Clock size={14} /> Clocked in {p.clockInAt} · clock out</button>
              : <button className="btn pri sm" style={{ width: "100%" }} onClick={() => setKeypad(p.id)}><Clock size={14} /> Clock in (PIN)</button>}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="sec-h"><h3>Period earnings</h3><span className="tiny">commission tied to collected payments</span></div>
        <DataTable rows={rows.map((r) => ({ ...r, id: r.p.id }))} defaultSort={{ key: "gross", dir: "desc" }}
          filters={[{ key: "cls", label: "Class", options: [{ value: "W2", label: "W-2" }, { value: "1099", label: "1099" }], test: (r, v) => r.p.type === v }]}
          columns={[
            { key: "name", label: "Provider", sortVal: (r) => r.p.name, render: (r) => <span style={{ fontWeight: 600 }}>{r.p.name}</span> },
            { key: "type", label: "Class", sortVal: (r) => r.p.type, render: (r) => <span className={`pill ${r.p.type === "W2" ? "w2" : "c1099"}`}>{r.p.type}</span> },
            { key: "hours", label: "Hours", align: "num", render: (r) => r.hours.toFixed(1) },
            { key: "hourly", label: "Hourly", align: "num", render: (r) => money0(r.hourly) },
            { key: "commission", label: "Commission", align: "num", render: (r) => <>{money0(r.commission)} <span className="muted" style={{ fontSize: 11 }}>({r.visits} visits)</span></> },
            { key: "tips", label: "Tips", align: "num", render: (r) => money0(r.tips) },
            { key: "gross", label: "Gross", align: "num", render: (r) => <span style={{ fontWeight: 700 }}>{money0(r.gross)}</span> },
          ]}
          footer={<tr><td colSpan={6} style={{ textAlign: "right", fontWeight: 600 }}>Total gross</td><td className="num" style={{ fontWeight: 700, color: "var(--pine)" }}>{money0(total)}</td></tr>} />
      </div>

      <div className="card">
        <div className="sec-h"><h3>Compliance log</h3><span className="tiny"><ShieldCheck size={12} style={{ verticalAlign: -2, marginRight: 4 }} />session-only demo history</span></div>
        {state.payrollLog.map((l) => (
          <div className="alert" key={l.id}><div className="ico ok"><Check size={15} /></div><div><div className="tx">{l.text}</div><div className="sx">{l.who} · {l.t}</div></div></div>
        ))}
      </div>
    </>
  );
}

function Keypad({ provider, onClose, onSuccess }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const press = (d) => {
    if (pin.length >= 4) return;
    const np = pin + d; setPin(np); setErr(false);
    if (np.length === 4) {
      if (np === provider.pin) setTimeout(() => onSuccess(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })), 180);
      else setTimeout(() => { setErr(true); setPin(""); }, 180);
    }
  };
  return (
    <Modal title={`${provider.clockedIn ? "Clock out" : "Clock in"} — ${provider.name}`} onClose={onClose}>
      <div className="muted" style={{ textAlign: "center", fontSize: 12.5, marginBottom: 4 }}>Enter your 4-digit PIN {err && <span style={{ color: "var(--rose)" }}>· incorrect, try again</span>}</div>
      <div className="pindots">{[0, 1, 2, 3].map((i) => <span key={i} className={pin.length > i ? "f" : ""} />)}</div>
      <div className="keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => <button key={d} onClick={() => press(String(d))}>{d}</button>)}
        <button onClick={() => setPin("")} style={{ fontSize: 13, color: "var(--muted)" }}>Clear</button>
        <button onClick={() => press("0")}>0</button>
        <button onClick={() => setPin(pin.slice(0, -1))} style={{ fontSize: 13, color: "var(--muted)" }}>←</button>
      </div>
    </Modal>
  );
}

/* ----------------------------- Reports ----------------------------- */
function Reports({ state }) {
  const [months, setMonths] = useState(6);
  const rev = state.revenueHistory.slice(-months);
  const cxl = state.cxlHistory.slice(-months);
  const exportCSV = () => downloadFile(`aop-report-${todayISO}.csv`, "Month,Revenue,Breakeven target\n" + state.revenueHistory.map((r) => `${r.m},${r.rev},${r.target}`).join("\n"), "text/csv");
  const compliance = useMemo(() => {
    const done = state.appts.filter((a) => a.status === "done");
    const locked = done.filter((a) => state.notes.some((n) => n.apptId === a.id && n.locked));
    return done.length ? Math.round((locked.length / done.length) * 100) : 100;
  }, [state]);

  const R = 52, C = 2 * Math.PI * R, off = C * (1 - compliance / 100);

  return (
    <>
      <div className="row" style={{ gap: 8, marginBottom: 14, alignItems: "center" }}>
        <span className="tiny">Period</span>
        {[3, 6, 12].map((m) => <button key={m} className={"btn sm" + (months === m ? " pri" : "")} onClick={() => setMonths(m)}>{m} mo</button>)}
        <button className="btn" style={{ marginLeft: "auto" }} onClick={exportCSV}><Download size={15} /> Export CSV</button>
      </div>
      <div className="two" style={{ marginBottom: 16 }}>
        <section className="card pad">
          <div className="tiny" style={{ marginBottom: 4 }}>Monthly revenue vs operating cost</div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Breakeven at {money0(14850)}/mo · 205 users target</div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={rev} margin={{ left: -16, right: 6, top: 6 }}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14554a" stopOpacity={0.25} /><stop offset="100%" stopColor="#14554a" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="#eef2ee" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 12, fill: "#5f6f6a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8a988f" }} axisLine={false} tickLine={false} tickFormatter={(v) => "$" + v / 1000 + "k"} />
              <Tooltip formatter={(v) => money0(v)} contentStyle={{ borderRadius: 10, border: "1px solid #e3e8e2", fontSize: 12 }} />
              <Area type="monotone" dataKey="rev" stroke="#14554a" strokeWidth={2.4} fill="url(#g)" />
              <Area type="monotone" dataKey="target" stroke="#b88a32" strokeWidth={1.4} strokeDasharray="5 4" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="legend"><span><i style={{ background: "#14554a" }} />Revenue</span><span><i style={{ background: "#b88a32" }} />Breakeven target</span></div>
        </section>

        <section className="card pad">
          <div className="tiny" style={{ marginBottom: 12 }}>SOAP documentation compliance</div>
          <div className="ring-wrap">
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r={R} fill="none" stroke="#eef2ee" strokeWidth="14" />
              <circle cx="64" cy="64" r={R} fill="none" stroke="#14554a" strokeWidth="14" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off} transform="rotate(-90 64 64)" />
              <text x="64" y="60" textAnchor="middle" fontSize="26" fontWeight="600" fill="#16211f" fontFamily="Fraunces, serif">{compliance}%</text>
              <text x="64" y="80" textAnchor="middle" fontSize="10" fill="#8a988f">locked</text>
            </svg>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600 }}>Completed visits documented</div>
              <div className="muted">Audit-ready, timestamped SOAP notes locked against completed appointments. Lock a pending note to raise this figure.</div>
            </div>
          </div>
        </section>
      </div>

      <div className="two">
        <section className="card pad">
          <div className="tiny" style={{ marginBottom: 12 }}>Room utilization</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={state.utilByRoom} margin={{ left: -20, right: 6 }}>
              <CartesianGrid stroke="#eef2ee" vertical={false} />
              <XAxis dataKey="room" tick={{ fontSize: 12, fill: "#5f6f6a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8a988f" }} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} />
              <Tooltip formatter={(v) => v + "%"} contentStyle={{ borderRadius: 10, border: "1px solid #e3e8e2", fontSize: 12 }} />
              <Bar dataKey="util" fill="#2c7264" radius={[6, 6, 0, 0]} barSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="card pad">
          <div className="tiny" style={{ marginBottom: 12 }}>Cancellations (trend down)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cxl} margin={{ left: -20, right: 6 }}>
              <CartesianGrid stroke="#eef2ee" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 12, fill: "#5f6f6a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#8a988f" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e3e8e2", fontSize: 12 }} />
              <Bar dataKey="cxl" fill="#b88a32" radius={[6, 6, 0, 0]} barSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </>
  );
}

/* ----------------------------- Settings ----------------------------- */
function ProviderModal({ initial, onClose, onSave }) {
  const [f, setF] = useState(initial ? { ...initial } : { name: "", role: "LMT", type: "W2", pay: "Hourly + commission", rate: 20, commission: 0.4, pin: "0000", license: "", licenseDays: 365, ceNeeded: 12 });
  const up = (k, v) => setF({ ...f, [k]: v });
  const ok = f.name.trim() && /^\d{4}$/.test(String(f.pin));
  return (
    <Modal title={initial ? "Edit provider" : "Add provider"} onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn pri" disabled={!ok} onClick={() => onSave({ ...f, rate: Number(f.rate) || 0, commission: Number(f.commission) || 0, licenseDays: Number(f.licenseDays) || 0, ceNeeded: Number(f.ceNeeded) || 0, pin: String(f.pin) })}>{initial ? "Save changes" : "Add provider"}</button></>}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label>Name</label><input className="inp" value={f.name} onChange={(e) => up("name", e.target.value)} /></div>
        <div className="field"><label>Role</label><input className="inp" value={f.role} onChange={(e) => up("role", e.target.value)} /></div>
        <div className="field"><label>Classification</label><select className="sel" value={f.type} onChange={(e) => up("type", e.target.value)}><option value="W2">W-2 employee</option><option value="1099">1099 contractor</option></select></div>
        <div className="field"><label>Pay structure</label><input className="inp" value={f.pay} onChange={(e) => up("pay", e.target.value)} /></div>
        <div className="field"><label>Hourly rate ($)</label><input className="inp" type="number" value={f.rate} onChange={(e) => up("rate", e.target.value)} /></div>
        <div className="field"><label>Commission (0–1)</label><input className="inp" type="number" step="0.05" value={f.commission} onChange={(e) => up("commission", e.target.value)} /></div>
        <div className="field"><label>Time-clock PIN (4 digits)</label><input className="inp" value={f.pin} maxLength={4} onChange={(e) => up("pin", e.target.value.replace(/\D/g, ""))} /></div>
        <div className="field"><label>License #</label><input className="inp" value={f.license} onChange={(e) => up("license", e.target.value)} /></div>
        <div className="field"><label>Days until license renewal</label><input className="inp" type="number" value={f.licenseDays} onChange={(e) => up("licenseDays", e.target.value)} /></div>
        <div className="field"><label>CE hours required</label><input className="inp" type="number" value={f.ceNeeded} onChange={(e) => up("ceNeeded", e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function SettingsView({ state, dispatch }) {
  const pr = state.practice;
  const [pf, setPf] = useState({ name: pr.name, city: pr.city, address: pr.address || "", phone: pr.phone || "", email: pr.email || "" });
  const [savedAt, setSavedAt] = useState(null);
  const [editP, setEditP] = useState(null);
  const [removeP, setRemoveP] = useState(null);
  const extra = Math.max(0, state.providers.length - 1);
  const monthly = pr.plan.base + extra * pr.plan.perProvider;
  const inUse = (pid) => state.appts.some((a) => a.providerId === pid) || state.invoices.some((i) => i.providerId === pid) || state.notes.some((n) => n.providerId === pid);
  const saveProfile = () => { dispatch({ type: "UPDATE_PRACTICE", patch: pf }); setSavedAt(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })); };
  return (
    <>
      <div className="two">
        <section className="card pad">
          <div className="serif" style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Practice profile</div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field" style={{ gridColumn: "1 / -1" }}><label>Practice name</label><input className="inp" value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })} /></div>
            <div className="field" style={{ gridColumn: "1 / -1" }}><label>Address</label><input className="inp" value={pf.address} onChange={(e) => setPf({ ...pf, address: e.target.value })} placeholder="Street address" /></div>
            <div className="field"><label>City, State</label><input className="inp" value={pf.city} onChange={(e) => setPf({ ...pf, city: e.target.value })} /></div>
            <div className="field"><label>Phone</label><input className="inp" value={pf.phone} onChange={(e) => setPf({ ...pf, phone: e.target.value })} /></div>
            <div className="field" style={{ gridColumn: "1 / -1" }}><label>Email</label><input className="inp" value={pf.email} onChange={(e) => setPf({ ...pf, email: e.target.value })} /></div>
          </div>
          <div className="row" style={{ gap: 10, marginTop: 14, alignItems: "center" }}>
            <button className="btn pri" onClick={saveProfile}><Check size={14} /> Save profile</button>
            {savedAt && <span className="savechip"><CheckCircle2 size={14} /> Saved {savedAt}</span>}
          </div>
        </section>
        <section className="card pad">
          <div className="serif" style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Your subscription</div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>Simple, transparent pricing. No tiers, no à la carte upsells, no revenue share.</div>
          <div className="statline"><span>Base subscription</span><span className="num">{money0(pr.plan.base)}/mo</span></div>
          <div className="statline"><span>Additional providers ({extra} × ${pr.plan.perProvider})</span><span className="num">{money0(extra * pr.plan.perProvider)}/mo</span></div>
          <div className="statline" style={{ fontWeight: 700, fontSize: 15, borderBottom: "none", paddingTop: 12 }}><span>Total</span><span className="serif num" style={{ color: "var(--pine)" }}>{money0(monthly)}/mo</span></div>
          <div className="divider" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["No tiers", "No upsells", "No revenue share", "No feature creep"].map((x) => <span key={x} className="pill done"><Check size={11} /> {x}</span>)}
          </div>
        </section>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="sec-h"><h3>Team</h3><button className="btn pri sm" onClick={() => setEditP("new")}><Plus size={13} /> Add provider</button></div>
        {state.providers.map((p) => (
          <div className="appt" key={p.id}>
            <div className="avatar" style={{ background: p.color, width: 34, height: 34, fontSize: 12 }}>{initials(p.name)}</div>
            <div className="meta">
              <div className="nm">{p.name} <span className={`pill ${p.type === "W2" ? "w2" : "c1099"}`} style={{ marginLeft: 6 }}>{p.type === "W2" ? "W-2" : "1099"}</span></div>
              <div className="det">{p.role} · {p.pay} · License {p.license || "—"} (renews in {p.licenseDays}d) · CE {p.ceHours}/{p.ceNeeded} · PIN {p.pin}</div>
            </div>
            <button className="btn sm" onClick={() => setEditP(p)}><Pencil size={13} /> Edit</button>
            <button className="btn sm" disabled={inUse(p.id)} title={inUse(p.id) ? "Has appointments, notes, or invoices — reassign first" : "Remove provider"} style={{ color: "var(--rose)" }} onClick={() => setRemoveP(p)}><Trash2 size={13} /></button>
          </div>
        ))}
        <div className="muted" style={{ fontSize: 12, padding: "10px 18px 14px" }}>Adding a provider updates the subscription automatically. Time-clock PINs are visible to owners only.</div>
      </div>

      <div className="card pad" style={{ marginTop: 16 }}>
        <div className="tiny" style={{ marginBottom: 12 }}>Included in every plan</div>
        {[
          [Calendar, "Scheduling & self-booking"],
          [Stethoscope, "SOAP documentation & templates"],
          [Receipt, "Payments via Stripe Healthcare"],
          [Wallet, "Integrated payroll (W-2 + 1099)"],
          [MessageSquare, "Secure messaging & client portal"],
          [GraduationCap, "License & CE auto-tracking"],
          [ShieldCheck, "Audit history preview (demo)"],
        ].map(([Ico, label], i) => (
          <div className="row" key={i} style={{ gap: 10, padding: "9px 0", borderBottom: i < 6 ? "1px dashed var(--border)" : "none" }}>
            <Ico size={17} color="var(--pine)" /><span style={{ fontSize: 13.5 }}>{label}</span><Check size={15} color="var(--pine-soft)" style={{ marginLeft: "auto" }} />
          </div>
        ))}
      </div>
      {editP && <ProviderModal initial={editP === "new" ? null : editP} onClose={() => setEditP(null)} onSave={(f) => {
        if (editP === "new") dispatch({ type: "ADD_PROVIDER", provider: { ...f, color: COLORS[state.providers.length % COLORS.length], clockedIn: false, clockInAt: null, ceHours: 0 } });
        else dispatch({ type: "UPDATE_PROVIDER", id: editP.id, patch: f });
        setEditP(null);
      }} />}
      {removeP && <ConfirmModal danger title={`Remove ${removeP.name} from the team?`} confirm="Remove provider" onClose={() => setRemoveP(null)} body={<>Their login, time-clock PIN, and license tracking will be removed and the subscription will update. This can’t be undone.</>} onConfirm={() => { dispatch({ type: "REMOVE_PROVIDER", id: removeP.id }); setRemoveP(null); }} />}
    </>
  );
}

/* ----------------------------- Charting (anatomical + e-sign) ----------------------------- */
const REGIONS = [
  { id: "head", label: "Head", shape: "ellipse", cx: 160, cy: 46, rx: 24, ry: 28 },
  { id: "neck", label: "Neck", shape: "rect", x: 150, y: 72, w: 20, h: 16 },
  { id: "shoulderR", label: "Shoulder (R)", shape: "ellipse", cx: 120, cy: 100, rx: 20, ry: 14 },
  { id: "shoulderL", label: "Shoulder (L)", shape: "ellipse", cx: 200, cy: 100, rx: 20, ry: 14 },
  { id: "chest", label: "Chest / Thorax", shape: "rect", x: 133, y: 94, w: 54, h: 48 },
  { id: "armR", label: "Arm (R)", shape: "rect", x: 100, y: 112, w: 18, h: 98 },
  { id: "armL", label: "Arm (L)", shape: "rect", x: 202, y: 112, w: 18, h: 98 },
  { id: "abdomen", label: "Abdomen", shape: "rect", x: 137, y: 144, w: 46, h: 56 },
  { id: "pelvis", label: "Pelvis / Hips", shape: "rect", x: 132, y: 200, w: 56, h: 34 },
  { id: "thighR", label: "Thigh (R)", shape: "rect", x: 134, y: 234, w: 22, h: 86 },
  { id: "thighL", label: "Thigh (L)", shape: "rect", x: 164, y: 234, w: 22, h: 86 },
  { id: "kneeR", label: "Knee (R)", shape: "ellipse", cx: 145, cy: 330, rx: 12, ry: 11 },
  { id: "kneeL", label: "Knee (L)", shape: "ellipse", cx: 175, cy: 330, rx: 12, ry: 11 },
  { id: "calfR", label: "Calf (R)", shape: "rect", x: 136, y: 342, w: 20, h: 82 },
  { id: "calfL", label: "Calf (L)", shape: "rect", x: 164, y: 342, w: 20, h: 82 },
];
const SEV = { mild: { c: "#B7A23A", bg: "#f6ecd4", t: "Mild" }, mod: { c: "#B07B1E", bg: "#f6ecd4", t: "Moderate" }, severe: { c: "#A23C37", bg: "#f6e3e1", t: "Severe" } };
const centroid = (r) => (r.shape === "ellipse" ? [r.cx, r.cy] : [r.x + r.w / 2, r.y + r.h / 2]);

function Charting({ state, dispatch, client, chartFocus, clearChartFocus }) {
  const [cid, setCid] = useState(chartFocus || (state.clients.find((c) => !c.archived) || state.clients[0]).id);
  const [signName, setSignName] = useState("");
  const [proposed, setProposed] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const c = client(cid);
  const mine = (state.findings && state.findings[cid]) || [];
  const setMine = (list) => dispatch({ type: "SET_FINDINGS", clientId: cid, findings: list });
  const dictate = (regionId) => {
    const r = ANATOMY.find((x) => x.id === (LEGACY_REGION_MAP[regionId] || regionId));
    setMine([...mine, { id: "f" + Date.now(), regionId: r ? r.id : regionId, label: r ? r.name : regionId, side: r ? r.side : "midline", sev: "mod", note: "Dictated — myofascial restriction, R levator scapulae; 6/10 with cervical rotation.", view: r && r.view !== "both" ? r.view : "anterior", ts: Date.now() }]);
  };

  return (
    <>
      <div className="row" style={{ gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select className="sel" style={{ maxWidth: 210 }} value={cid} onChange={(e) => { setCid(e.target.value); setReportSent(false); if (clearChartFocus) clearChartFocus(); }}>
          {state.clients.filter((cl) => !cl.archived).map((cl) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
        </select>
        <span className={`pill ${c.type === "patient" ? "c1099" : "w2"}`}>{c.type === "patient" ? "Patient · doctor-referred" : "Client · walk-in"}</span>
        {c.referral && <span className="muted" style={{ fontSize: 12.5 }}>Referring: {c.referral}</span>}
        <span className="pill" style={{ marginLeft: "auto" }}>{mine.length} finding{mine.length === 1 ? "" : "s"}</span>
      </div>

      <BodyAssessment findings={mine} onChange={setMine} client={c} onDictate={dictate} />

      <div className="two" style={{ marginTop: 16 }}>
        <section className="card pad">
          <div className="tiny" style={{ marginBottom: 8 }}><PenLine size={12} style={{ verticalAlign: -2, marginRight: 5 }} />Informed consent & proposed action</div>
          {c.consent
            ? <div className="alert" style={{ padding: 0, border: "none" }}><div className="ico ok"><CheckCircle2 size={16} /></div><div><div className="tx">Consent signed & on file</div><div className="sx">e-signature captured · versioned</div></div></div>
            : <>
                <div className="field" style={{ marginBottom: 8 }}><label>Type full name to e-sign</label><input className="inp" value={signName} onChange={(e) => setSignName(e.target.value)} placeholder={c.name} /></div>
                <button className="btn pri sm" disabled={!signName.trim()} onClick={() => dispatch({ type: "SIGN_CONSENT", id: cid })}><PenLine size={13} /> Sign informed consent</button>
              </>}
          <label className="row" style={{ gap: 8, marginTop: 12, fontSize: 13, cursor: "pointer" }}>
            <input type="checkbox" checked={proposed} onChange={(e) => setProposed(e.target.checked)} />
            Client approved proposed action (diagrams / videos)
          </label>
        </section>

        <section className="card pad">
          <div className="tiny" style={{ marginBottom: 8 }}><FileText size={12} style={{ verticalAlign: -2, marginRight: 5 }} />Monthly report to referring doctor</div>
          {c.type === "patient"
            ? (reportSent
                ? <div className="alert" style={{ padding: 0, border: "none" }}><div className="ico ok"><CheckCircle2 size={16} /></div><div><div className="tx">Report generated for {c.referral}</div><div className="sx">Findings, plan & progress compiled · downloaded and ready to send</div></div></div>
                : <>
                    <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>Auto-compiles this month’s findings, treatment plan and progress into a referral report for {c.referral}.</div>
                    <button className="btn pri sm" onClick={() => { const lines = [`Monthly progress report — ${c.name}`, `Referring physician: ${c.referral}`, `Prepared: ${todayISO}`, "", `Findings (${mine.length}):`, ...mine.map((f) => `- ${f.label} (${f.side}) · ${f.sev} · ${f.note}`), "", `Treatment plan: ${c.plan || "—"}`, "", "Prepared by Art of Palpation · AOP Office Solutions"]; downloadFile(`doctor-report-${c.name.replace(/\s+/g, "_")}-${todayISO}.txt`, lines.join("\n"), "text/plain"); setReportSent(true); }}><FileText size={13} /> Generate doctor report</button>
                  </>)
            : <div className="muted" style={{ fontSize: 12.5 }}>Walk-in client — no referring physician, so no doctor report is required.</div>}
        </section>
      </div>
    </>
  );
}

/* ----------------------------- Documents (vault) ----------------------------- */
function DocViewer({ d, client }) {
  const isPdf = d.url && /pdf/i.test(d.type || d.name);
  const isImg = d.url && /^image\//.test(d.type || "");
  if (isPdf) return <iframe title={d.name} src={d.url} style={{ width: "100%", height: "72vh", border: "none", borderRadius: 10, background: "#fff" }} />;
  if (isImg) return <div style={{ textAlign: "center", background: "#e9ece8", borderRadius: 10, padding: 16 }}><img src={d.url} alt={d.name} style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8 }} /></div>;
  const blurb = {
    "Prescription": "Referral for therapeutic massage evaluation and treatment. Frequency and duration per the attached treatment plan.",
    "Physician notes": "Consultation summary and clinical notes provided by the referring physician for coordination of care.",
    "Intake form": "Health history, current concerns, medications, and contact information as completed by the client.",
    "Consent": "Informed consent for treatment and the proposed plan of care, signed and dated by the client.",
    "Imaging": "Imaging report and impressions supplied by the ordering provider.",
    "Insurance card": "Insurance identification on file for billing and eligibility.",
  }[d.kind] || "Document on file.";
  return (
    <div style={{ background: "#e9ece8", padding: 24, borderRadius: 10, minHeight: "60vh", display: "flex", justifyContent: "center", overflow: "auto" }}>
      <div style={{ background: "#fff", width: "100%", maxWidth: 640, minHeight: 720, boxShadow: "0 10px 30px rgba(0,0,0,.12)", padding: "48px 56px", fontFamily: "Georgia, 'Times New Roman', serif", color: "#222" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#888", marginBottom: 18 }}>{d.kind}</div>
        <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 6 }}>{d.name.replace(/\.\w+$/, "").replace(/[_-]+/g, " ")}</div>
        <div style={{ fontSize: 13, color: "#666", marginBottom: 26 }}>{d.by ? `From ${d.by} · ` : ""}{d.date}</div>
        <div style={{ fontSize: 14.5, lineHeight: 1.75 }}>
          <p style={{ margin: "0 0 10px" }}><b>Client:</b> {client(d.clientId).name}</p>
          <p style={{ margin: "0 0 18px" }}>{blurb}</p>
          {[92, 100, 96, 88, 100, 74, 100, 60].map((w, i) => <div key={i} style={{ height: 10, width: `${w}%`, background: "#ececec", borderRadius: 3, marginBottom: 9 }} />)}
        </div>
        <div style={{ marginTop: 40, fontSize: 11, color: "#999" }}>Stored as Tier {d.tier} · {d.url ? "Original file attached" : "No file attached — showing the vault record. Use Re-upload to attach the original."}</div>
      </div>
    </div>
  );
}

function Documents({ state, dispatch, client, go, setSelClient }) {
  const [cid, setCid] = useState("all");
  const [kind, setKind] = useState("Prescription");
  const [selDoc, setSelDoc] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [reupTarget, setReupTarget] = useState(null);
  const upRef = useRef(null), reupRef = useRef(null);
  const KINDS = ["Prescription", "Physician notes", "Intake form", "Consent", "Imaging", "Insurance card"];
  const list = state.docs.filter((d) => cid === "all" || d.clientId === cid);
  const fmtSize = (b) => (b == null ? "—" : b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : b >= 1024 ? Math.round(b / 1024) + " KB" : b + " B");
  const readFile = (file) => new Promise((res) => { if (file.size > 8 * 1024 * 1024) return res(null); const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(null); r.readAsDataURL(file); });
  const upload = async (files) => {
    const target = cid === "all" ? (state.clients.find((c) => !c.archived) || state.clients[0]).id : cid;
    const t3 = kind === "Prescription" || kind === "Physician notes" || kind === "Imaging";
    for (const file of Array.from(files || [])) {
      const url = await readFile(file);
      dispatch({ type: "ADD_DOC", doc: { id: "d" + Date.now() + Math.random().toString(36).slice(2, 5), clientId: target, name: file.name, kind, tier: t3 ? 3 : 2, date: "Today", by: t3 ? (client(target).referral || "External provider") : null, size: file.size, type: file.type, url } });
    }
  };
  const reupload = async (file) => { if (!reupTarget || !file) return; const url = await readFile(file); dispatch({ type: "UPDATE_DOC", id: reupTarget, patch: { name: file.name, size: file.size, type: file.type, url, date: "Today" } }); setReupTarget(null); };
  const startReupload = (id) => { setReupTarget(id); setTimeout(() => reupRef.current && reupRef.current.click(), 0); };
  const download = (d) => {
    if (d.url) { const a = document.createElement("a"); a.href = d.url; a.download = d.name; document.body.appendChild(a); a.click(); a.remove(); }
    else downloadFile(d.name.replace(/\.pdf$/i, ".txt"), `${d.name}\nClient: ${client(d.clientId).name}\nType: ${d.kind}\nSource: ${d.by || "—"}\nTier: ${d.tier}\nDate: ${d.date}`, "text/plain");
  };
  const menu = (d, onDetail) => [
    ...(onDetail ? [] : [{ label: "Open", icon: <FileText size={14} />, onClick: () => setSelDoc(d.id) }]),
    { label: "Re-upload file", icon: <Upload size={14} />, onClick: () => startReupload(d.id) },
    { label: "Download", icon: <Download size={14} />, onClick: () => download(d) },
    "sep",
    { label: "Delete", icon: <Trash2 size={14} />, danger: true, onClick: () => setConfirmDel(d) },
  ];
  const tierPill = (d) => d.tier === 3 ? <span className="pill locked"><Lock size={11} /> Tier 3</span> : <span className="pill w2">Tier 2</span>;
  const hidden = (
    <>
      <input ref={upRef} type="file" multiple style={{ display: "none" }} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
      <input ref={reupRef} type="file" style={{ display: "none" }} onChange={(e) => { reupload(e.target.files[0]); e.target.value = ""; }} />
      {confirmDel && <ConfirmModal danger title={`Delete ${confirmDel.name}?`} confirm="Delete document" onClose={() => setConfirmDel(null)}
        body={<>This removes the document from the vault. Tier 3 clinical documents may be subject to retention rules — make sure a copy exists in the source system before deleting.</>}
        onConfirm={() => { dispatch({ type: "REMOVE_DOC", id: confirmDel.id }); if (selDoc === confirmDel.id) setSelDoc(null); setConfirmDel(null); }} />}
    </>
  );

  const doc = selDoc ? state.docs.find((d) => d.id === selDoc) : null;
  if (selDoc && doc) {
    const c = client(doc.clientId);
    return (
      <>
        <div className="row" style={{ gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn ghost sm" onClick={() => setSelDoc(null)}><ArrowLeft size={14} /> Documents</button>
          <div style={{ fontWeight: 700, fontSize: 15, display: "inline-flex", alignItems: "center", gap: 7 }}><FileText size={16} color="var(--muted-2)" />{doc.name}</div>
          {tierPill(doc)}<span className="pill">{doc.kind}</span>
          <div className="row" style={{ gap: 8, marginLeft: "auto" }}>
            <button className="btn" onClick={() => download(doc)}><Download size={14} /> Download</button>
            <button className="btn" onClick={() => { go("clients"); setSelClient(doc.clientId); }}><Users size={14} /> Open client</button>
            <Kebab items={menu(doc, true)} />
          </div>
        </div>
        <div className="two" style={{ gridTemplateColumns: "1fr 320px", alignItems: "start" }}>
          <section className="card pad"><DocViewer d={doc} client={client} /></section>
          <section className="card pad">
            <div className="tiny" style={{ marginBottom: 10 }}>Document details</div>
            <div className="statline"><span className="muted">Client</span><button className="btn ghost sm" onClick={() => { go("clients"); setSelClient(doc.clientId); }}>{c.name} <ChevronRight size={13} /></button></div>
            <div className="statline"><span className="muted">Type</span><span style={{ fontWeight: 600 }}>{doc.kind}</span></div>
            <div className="statline"><span className="muted">Source</span><span>{doc.by || "—"}</span></div>
            <div className="statline"><span className="muted">Tier</span>{tierPill(doc)}</div>
            <div className="statline"><span className="muted">Format</span><span>{doc.type || (doc.name.split(".").pop() || "").toUpperCase()}</span></div>
            <div className="statline"><span className="muted">Size</span><span>{fmtSize(doc.size)}</span></div>
            <div className="statline"><span className="muted">Uploaded</span><span>{doc.date}</span></div>
            <div className="statline" style={{ borderBottom: "none" }}><span className="muted">Original file</span>{doc.url ? <span className="pill done"><Check size={11} /> Attached</span> : <span className="pill due">Not attached</span>}</div>
            {!doc.url && <button className="btn" style={{ marginTop: 10, width: "100%" }} onClick={() => startReupload(doc.id)}><Upload size={14} /> Attach original file</button>}
            {doc.tier === 3 && <div className="alert" style={{ padding: 0, border: "none", marginTop: 14 }}><div className="ico ok"><ShieldCheck size={16} /></div><div><div className="tx">Segregated clinical document</div><div className="sx">No secondary use; excluded from exports and analytics.</div></div></div>}
          </section>
        </div>
        {hidden}
      </>
    );
  }

  return (
    <>
      <div className="row" style={{ gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select className="sel" style={{ maxWidth: 190 }} value={cid} onChange={(e) => setCid(e.target.value)}>
          <option value="all">All clients</option>
          {state.clients.filter((cl) => !cl.archived).map((cl) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
        </select>
        <select className="sel" style={{ maxWidth: 180 }} value={kind} onChange={(e) => setKind(e.target.value)}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
        <button className="btn pri" onClick={() => upRef.current && upRef.current.click()}><Upload size={15} /> Upload document</button>
        <span className="muted" style={{ fontSize: 12 }}>Tagged with the selected client and type</span>
      </div>
      <div className="card">
        <div className="sec-h"><h3>Document vault</h3><span className="tiny">{list.length} files</span></div>
        <DataTable rows={list} search searchPlaceholder="Search documents" defaultSort={{ key: "date", dir: "desc" }} onRowClick={(d) => setSelDoc(d.id)}
          filters={[
            { key: "kind", label: "Type", options: KINDS.map((k) => ({ value: k, label: k })), test: (d, v) => d.kind === v },
            { key: "tier", label: "Tier", options: [{ value: "3", label: "Tier 3 (clinical)" }, { value: "2", label: "Tier 2" }], test: (d, v) => String(d.tier) === v },
          ]}
          columns={[
            { key: "name", label: "File", render: (d) => <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600, whiteSpace: "nowrap" }}><FileText size={14} color="var(--muted-2)" style={{ flex: "0 0 auto" }} />{d.name}{!d.url && <span className="pill due" style={{ marginLeft: 6 }}>No file</span>}</span> },
            { key: "client", label: "Client", sortVal: (d) => client(d.clientId).name, render: (d) => client(d.clientId).name },
            { key: "kind", label: "Type" },
            { key: "by", label: "Source", render: (d) => <span className="muted">{d.by || "—"}</span> },
            { key: "tier", label: "Tier", render: (d) => tierPill(d) },
            { key: "size", label: "Size", align: "num", sortVal: (d) => d.size || 0, render: (d) => <span className="muted">{fmtSize(d.size)}</span> },
            { key: "date", label: "Date", align: "num" },
            { key: "act", label: "", sortable: false, render: (d) => <div className="row" style={{ gap: 6, justifyContent: "flex-end", alignItems: "center" }} onClick={(e) => e.stopPropagation()}><Kebab items={menu(d, false)} /><ChevronRight size={16} color="var(--muted-2)" /></div> },
          ]} />
      </div>
      <div className="card pad" style={{ marginTop: 16 }}>
        <div className="alert" style={{ padding: 0, border: "none" }}><div className="ico ok"><ShieldCheck size={16} /></div><div><div className="tx">Tier 3 = third-party clinical documents</div><div className="sx">Uploaded physician notes & prescriptions are segregated — no secondary use, excluded from exports & analytics.</div></div></div>
      </div>
      {hidden}
    </>
  );
}

/* ----------------------------- Invoicing (A/R + A/P) ----------------------------- */

/* ----------------------------- Academy (CEU) ----------------------------- */
function Academy({ state, dispatch, prov }) {
  const [pid, setPid] = useState(state.providers[0] ? state.providers[0].id : "p1");
  const [extHours, setExtHours] = useState("");
  const [enrolled, setEnrolled] = useState({});
  const enroll = (course) => { setEnrolled({ ...enrolled, [course.id]: true }); dispatch({ type: "ENROLL_CE", providerId: pid, hours: course.hours }); };
  return (
    <>
      <div className="row" style={{ marginBottom: 16, gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div className="tiny">Enroll as</div>
        <select className="sel" style={{ maxWidth: 220 }} value={pid} onChange={(e) => setPid(e.target.value)}>{state.providers.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.role}</option>)}</select>
        <div className="row" style={{ gap: 6, marginLeft: "auto", alignItems: "center" }}>
          <span className="tiny">Log external CE</span>
          <input className="inp" type="number" min="0.5" step="0.5" value={extHours} onChange={(e) => setExtHours(e.target.value)} style={{ width: 80 }} />
          <button className="btn sm" disabled={!Number(extHours)} onClick={() => { dispatch({ type: "ENROLL_CE", providerId: pid, hours: Number(extHours) }); setExtHours(""); }}><Plus size={13} /> Log hours</button>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 16 }}>
        {state.providers.map((p) => {
          const pct = Math.round((p.ceHours / p.ceNeeded) * 100);
          return (
            <div key={p.id} className="card pad">
              <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                <div className="avatar" style={{ background: p.color, width: 30, height: 30, fontSize: 11 }}>{initials(p.name)}</div>
                <div><div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div><div className="muted" style={{ fontSize: 11.5 }}>{p.ceHours} / {p.ceNeeded} CE hrs</div></div>
              </div>
              <div style={{ height: 8, background: "var(--sage)", borderRadius: 20, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: pct >= 100 ? "var(--pine-soft)" : "var(--gold)" }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="card">
        <div className="sec-h"><h3>CE course catalog</h3><span className="tiny">book & auto-log to license</span></div>
        {state.courses.map((c) => (
          <div className="appt" key={c.id}>
            <div className="avatar" style={{ background: "var(--pine)", width: 34, height: 34 }}><GraduationCap size={16} color="#fff" /></div>
            <div className="meta">
              <div className="nm">{c.title} {c.required && <span className="pill due" style={{ marginLeft: 6 }}>Required</span>}</div>
              <div className="det">{c.provider} · {c.hours} hr{c.hours > 1 ? "s" : ""} · {c.mode}</div>
            </div>
            {enrolled[c.id]
              ? <span className="pill done"><Check size={12} /> Scheduled</span>
              : <button className="btn pri sm" onClick={() => enroll(c)}>Enroll</button>}
          </div>
        ))}
      </div>
    </>
  );
}

/* ----------------------------- Flows (guided decision walkthroughs) ----------------------------- */
const FLOWS = [
  {
    id: "signin", cat: "Front office", name: "Sign in & roles",
    desc: "Credentials, MFA, and role-based routing to the right home.",
    start: "open",
    nodes: {
      open: { kind: "start", title: "Open AOP", desc: "On web or the field iPad.", next: "login" },
      login: { kind: "process", title: "Enter credentials", next: "mfaQ" },
      mfaQ: { kind: "decision", title: "MFA verified?", opts: [["Yes", "roleQ"], ["No / failed", "login"]] },
      roleQ: { kind: "decision", title: "Which role?", opts: [["Owner / admin", "dash"], ["Therapist", "dash"], ["Front desk", "deskDash"], ["Client", "portal"]] },
      dash: { kind: "process", title: "Land on the dashboard", desc: "Full clinical and operations access.", next: "ready" },
      deskDash: { kind: "process", title: "Land on the front-desk view", desc: "Scheduling and payments; clinical notes hidden.", next: "ready" },
      portal: { kind: "end", tone: "ok", title: "Client portal", desc: "Self-service booking, forms, and payments." },
      ready: { kind: "end", tone: "ok", title: "Signed in" },
    },
  },
  {
    id: "selfbook", cat: "Front office", name: "Client self-booking",
    desc: "The portal path: pick a slot, complete forms, add a card.",
    start: "land",
    nodes: {
      land: { kind: "start", title: "Open the booking link", desc: "From the practice site or a reminder.", next: "acctQ" },
      acctQ: { kind: "decision", title: "Returning client?", opts: [["Yes — sign in", "pick"], ["New — quick sign-up", "pick"]] },
      pick: { kind: "process", title: "Pick a service and time", desc: "Live availability shown.", next: "availQ" },
      availQ: { kind: "decision", title: "Preferred slot open?", opts: [["Yes", "forms"], ["No", "waitP"]] },
      waitP: { kind: "process", title: "Join the waitlist", desc: "Notified if a slot opens.", next: "forms" },
      forms: { kind: "process", title: "Complete intake and consent", desc: "Digital forms on their device.", next: "depositQ" },
      depositQ: { kind: "decision", title: "Add a card or deposit?", opts: [["Add card", "confirmed"], ["Skip for now", "confirmed"]] },
      confirmed: { kind: "end", tone: "ok", title: "Booking confirmed", desc: "Reminder scheduled by SMS or email." },
    },
  },
  {
    id: "schedule", cat: "Front office", name: "Scheduling & availability",
    desc: "Staff booking with the slot-availability and card-on-file gates.",
    start: "open",
    nodes: {
      open: { kind: "start", title: "Open the schedule", next: "create" },
      create: { kind: "process", title: "Create an appointment", desc: "Client, service, provider, room.", next: "slotQ" },
      slotQ: { kind: "decision", title: "Slot available?", opts: [["Yes", "cardQ"], ["No", "wl"]] },
      wl: { kind: "process", title: "Offer the waitlist", desc: "Auto-notify on a cancellation.", next: "create" },
      cardQ: { kind: "decision", title: "Card on file?", opts: [["Yes", "booked"], ["No — capture card", "booked"]] },
      booked: { kind: "process", title: "Booked, policy attached", desc: "Cancellation window set.", next: "remind" },
      remind: { kind: "process", title: "Send confirmation and reminders", desc: "Client-controlled channel.", next: "done" },
      done: { kind: "end", tone: "ok", title: "On the calendar" },
    },
  },
  {
    id: "noshow", cat: "Front office", name: "No-show & cancellation",
    desc: "Late-cancel window, no-show fee, and the rebound to rebooking.",
    start: "appt",
    nodes: {
      appt: { kind: "start", title: "Appointment time", desc: "Reminder already sent.", next: "showsQ" },
      showsQ: { kind: "decision", title: "Does the client arrive?", opts: [["Yes — on time", "kept"], ["Late cancel", "lateQ"], ["No-show", "feeQ"]] },
      kept: { kind: "end", tone: "ok", title: "Proceed to the visit" },
      lateQ: { kind: "decision", title: "Inside the cancellation window?", opts: [["Yes — waive", "rebook"], ["No — bill late fee", "fee"]] },
      feeQ: { kind: "decision", title: "Charge the no-show fee?", opts: [["Charge card on file", "fee"], ["Waive", "rebook"]] },
      fee: { kind: "process", title: "Charge the fee to the card on file", next: "rebook" },
      rebook: { kind: "decision", title: "Rebook now?", opts: [["Yes", "booked2"], ["No", "closed"]] },
      booked2: { kind: "process", title: "New appointment booked", next: "closed" },
      closed: { kind: "end", tone: "bad", title: "Slot closed out" },
    },
  },
  {
    id: "visit", cat: "Clinical", name: "Client visit — full journey",
    desc: "The spine: check-in through documentation, payment, and rebooking.",
    start: "booked",
    nodes: {
      booked: { kind: "start", title: "Booked appointment", desc: "Rosa Delgado · Deep Tissue 60 · Room 2.", next: "shows" },
      shows: { kind: "decision", title: "Does the client show up?", opts: [["Yes — checked in", "checkin"], ["No-show / late cancel", "noshow"]] },
      noshow: { kind: "process", title: "Mark no-show or cancel", desc: "Card was captured at booking.", next: "feeQ" },
      feeQ: { kind: "decision", title: "Charge a cancellation fee?", desc: "Under-24h cancel or no-show.", opts: [["Charge the fee", "feeCharged"], ["Waive it", "closedFree"]] },
      feeCharged: { kind: "end", tone: "bad", title: "Closed — fee charged", desc: "No-show fee billed to the card on file." },
      closedFree: { kind: "end", tone: "bad", title: "Closed — no charge", desc: "Slot released; no fee applied." },
      checkin: { kind: "process", title: "Check in", desc: "Client arrived and is roomed.", next: "gate" },
      gate: { kind: "decision", title: "Who is documenting? (role gate)", desc: "Front-desk role can't open clinical notes.", opts: [["Therapist", "soap"], ["Front desk only", "invoice"]] },
      soap: { kind: "process", title: "Discovery, body assessment & SOAP", desc: "Anatomical charting + medical dictation.", next: "lockQ" },
      lockQ: { kind: "decision", title: "Lock the note?", opts: [["Demo lock", "locked"], ["Keep as draft", "soap"]] },
      locked: { kind: "process", title: "Note locked in demo", desc: "Session-only preview; no permanent audit record.", next: "invoice" },
      invoice: { kind: "process", title: "Create invoice", desc: "Line items from the completed service.", next: "payType" },
      payType: { kind: "decision", title: "Self-pay or insurance?", opts: [["Self-pay", "tip"], ["Insurance", "dnp"]] },
      dnp: { kind: "decision", title: "Do-not-submit-to-plan flag?", desc: "Client paid out of pocket in full.", opts: [["Flag set — don't submit", "charge"], ["Submit to plan", "claim"]] },
      claim: { kind: "process", title: "Submit insurance claim", desc: "Goes to receivables / aging.", next: "receipt" },
      tip: { kind: "process", title: "Add tip", desc: "Optional tip on the card reader.", next: "charge" },
      charge: { kind: "process", title: "Charge via Stripe reader", next: "captured" },
      captured: { kind: "decision", title: "Payment captured?", opts: [["Yes", "receipt"], ["Declined — retry", "charge"]] },
      receipt: { kind: "process", title: "Receipt sent", desc: "Auto-emailed, PHI-free.", next: "rebookQ" },
      rebookQ: { kind: "decision", title: "Rebook the next visit?", desc: "Near the end of a plan, offer recurring.", opts: [["Yes", "rebooked"], ["No", "done"]] },
      rebooked: { kind: "process", title: "Recurring booked (weekly / monthly)", next: "done" },
      done: { kind: "end", tone: "ok", title: "Visit complete", desc: "Documented, paid, and rebooked." },
    },
  },
  {
    id: "intake", cat: "Clinical", name: "New patient intake",
    desc: "Doctor-referral split, Rx capture, slot check, and the consent gate.",
    start: "lead",
    nodes: {
      lead: { kind: "start", title: "New lead", desc: "Google search or physician referral.", next: "source" },
      source: { kind: "decision", title: "Referral source?", opts: [["Doctor referral → patient", "rx"], ["Walk-in / search → client", "book"]] },
      rx: { kind: "process", title: "Upload Rx & record referring MD", desc: "Stored Tier-3; sets up the monthly doctor report.", next: "book" },
      book: { kind: "process", title: "Create appointment", desc: "Web form or phone (9 of 10 call).", next: "avail" },
      avail: { kind: "decision", title: "Slot available?", opts: [["Yes", "bookedI"], ["No", "waitlist"]] },
      waitlist: { kind: "process", title: "Offer waitlist", next: "book" },
      bookedI: { kind: "process", title: "Booked · card on file", desc: "Cancellation policy attached.", next: "intakeQ" },
      intakeQ: { kind: "decision", title: "Intake & consent complete?", opts: [["Yes", "remind"], ["No", "forms"]] },
      forms: { kind: "process", title: "Send digital forms", next: "intakeQ" },
      remind: { kind: "process", title: "Send reminder (SMS / email)", next: "ready" },
      ready: { kind: "end", tone: "ok", title: "Ready for the visit" },
    },
  },
  {
    id: "soap", cat: "Clinical", name: "Documentation & SOAP",
    desc: "Role gate, charting, consent check, and the note-lock decision.",
    start: "checkin",
    nodes: {
      checkin: { kind: "start", title: "Client checked in", next: "gate" },
      gate: { kind: "decision", title: "Clinical access? (role)", opts: [["Therapist", "discovery"], ["Front desk — stop", "blocked"]] },
      blocked: { kind: "end", tone: "bad", title: "No clinical access", desc: "Front-desk role can't open notes." },
      discovery: { kind: "process", title: "Discovery & history", desc: "Dictation understands clinical terms.", next: "assess" },
      assess: { kind: "process", title: "Body assessment", desc: "Tap-to-chart anatomical findings.", next: "consentQ" },
      consentQ: { kind: "decision", title: "Consent & proposed action signed?", opts: [["Signed", "treat"], ["Not yet", "esign"]] },
      esign: { kind: "process", title: "Capture e-signatures", next: "treat" },
      treat: { kind: "process", title: "Treatment + pain-scale check-ins", next: "findings" },
      findings: { kind: "process", title: "Record findings & treatment plan", next: "lockQ" },
      lockQ: { kind: "decision", title: "Lock the note?", opts: [["Demo lock", "locked"], ["Keep as draft", "findings"]] },
      locked: { kind: "end", tone: "ok", title: "Note locked in demo" },
    },
  },
  {
    id: "consent", cat: "Clinical", name: "Consent & authorization",
    desc: "Minor guardian branch and authorizations beyond treatment.",
    start: "begin",
    nodes: {
      begin: { kind: "start", title: "Before treatment", next: "informed" },
      informed: { kind: "process", title: "Informed consent", desc: "Plan and techniques explained.", next: "minorQ" },
      minorQ: { kind: "decision", title: "Is the client a minor?", opts: [["Yes", "guardian"], ["No", "proposed"]] },
      guardian: { kind: "process", title: "Guardian consent captured", next: "proposed" },
      proposed: { kind: "process", title: "Proposed action approved", desc: "Diagrams / videos reviewed.", next: "authQ" },
      authQ: { kind: "decision", title: "Any use beyond treatment?", desc: "Photos, testimonial, marketing, research.", opts: [["Yes — capture authorization", "auth"], ["No", "signed"]] },
      auth: { kind: "process", title: "Structured authorization", desc: "Scoped, dated, revocable.", next: "signed" },
      signed: { kind: "end", tone: "ok", title: "Consent on file" },
    },
  },
  {
    id: "payment", cat: "Billing", name: "Payment & checkout",
    desc: "Self-pay vs. insurance, do-not-submit flag, capture retry, and AR.",
    start: "invoice",
    nodes: {
      invoice: { kind: "start", title: "Create invoice", next: "typeQ" },
      typeQ: { kind: "decision", title: "Self-pay or insurance?", opts: [["Self-pay", "tipQ"], ["Insurance", "claimFlow"]] },
      claimFlow: { kind: "process", title: "Route to insurance claim", desc: "See the Insurance claim flow.", next: "receipt" },
      tipQ: { kind: "decision", title: "Add a tip?", opts: [["Yes", "charge"], ["No tip", "charge"]] },
      charge: { kind: "process", title: "Charge via Stripe reader", next: "capturedQ" },
      capturedQ: { kind: "decision", title: "Payment captured?", opts: [["Yes", "dnpNote"], ["Declined — retry", "charge"]] },
      dnpNote: { kind: "decision", title: "Paid in full out of pocket?", desc: "Sets the do-not-submit-to-plan flag.", opts: [["Yes — flag it", "receipt"], ["No", "receipt"]] },
      receipt: { kind: "process", title: "Receipt sent", next: "arQ" },
      arQ: { kind: "decision", title: "Balance remaining?", opts: [["Yes — open invoice / AR", "ar"], ["No", "paid"]] },
      ar: { kind: "process", title: "Add to receivables aging", desc: "For hospital / oncology billing.", next: "paid" },
      paid: { kind: "end", tone: "ok", title: "Settled" },
    },
  },
  {
    id: "claim", cat: "Billing", name: "Insurance claim",
    desc: "Eligibility, submission, adjudication, appeal, and patient balance.",
    start: "verify",
    nodes: {
      verify: { kind: "start", title: "Verify eligibility", next: "coveredQ" },
      coveredQ: { kind: "decision", title: "Is massage covered?", desc: "PIP, workers' comp, or plan mandate.", opts: [["Covered", "submit"], ["Not covered", "selfpay"]] },
      selfpay: { kind: "end", tone: "bad", title: "Convert to self-pay" },
      submit: { kind: "process", title: "Submit the claim", desc: "With referring MD and codes.", next: "adjQ" },
      adjQ: { kind: "decision", title: "Adjudicated?", opts: [["Paid", "posted"], ["Denied", "denied"]] },
      denied: { kind: "decision", title: "Appeal or bill patient?", opts: [["Appeal", "submit"], ["Bill patient", "balance"]] },
      posted: { kind: "process", title: "Payment posted", desc: "Remittance reconciled.", next: "balanceQ" },
      balanceQ: { kind: "decision", title: "Patient balance left?", opts: [["Yes", "balance"], ["No", "done"]] },
      balance: { kind: "process", title: "Bill the patient balance", next: "done" },
      done: { kind: "end", tone: "ok", title: "Claim closed" },
    },
  },
  {
    id: "payroll", cat: "Practice ops", name: "Payroll run",
    desc: "Time-clock gate, W-2 vs. 1099, commission accrual, and tax export.",
    start: "open",
    nodes: {
      open: { kind: "start", title: "Open payroll", desc: "One running ledger — not a new spreadsheet.", next: "clocked" },
      clocked: { kind: "decision", title: "Provider clocked in?", opts: [["Yes", "classify"], ["No", "pin"]] },
      pin: { kind: "process", title: "PIN clock in / out", next: "clocked" },
      classify: { kind: "decision", title: "W-2 or 1099?", opts: [["W-2 employee", "accrue"], ["1099 contractor", "accrue"]] },
      accrue: { kind: "process", title: "Accrue commission on collected pay", next: "run" },
      run: { kind: "process", title: "Run payroll", next: "exp" },
      exp: { kind: "process", title: "Export CSV / quarterly tax", next: "donep" },
      donep: { kind: "end", tone: "ok", title: "Payroll complete" },
    },
  },
  {
    id: "compliance", cat: "Practice ops", name: "License & CE compliance",
    desc: "Renewal alerts, the CE-hours gate, and license renewal.",
    start: "dashC",
    nodes: {
      dashC: { kind: "start", title: "Compliance dashboard", next: "dueQ" },
      dueQ: { kind: "decision", title: "License or CE due soon?", opts: [["Yes", "alert"], ["No", "clear"]] },
      clear: { kind: "end", tone: "ok", title: "All current" },
      alert: { kind: "process", title: "Send 90 / 60 / 30-day alerts", next: "ceQ" },
      ceQ: { kind: "decision", title: "CE hours complete?", opts: [["Yes", "renew"], ["No", "book"]] },
      book: { kind: "process", title: "Book CE in Academy", desc: "Auto-logs hours to the license.", next: "ceQ" },
      renew: { kind: "process", title: "Renew license & file", next: "doneC" },
      doneC: { kind: "end", tone: "ok", title: "License renewed" },
    },
  },
  {
    id: "doctor", cat: "Practice ops", name: "Monthly doctor report",
    desc: "Patient-only branch, auto-compile from locked notes, review, send.",
    start: "startD",
    nodes: {
      startD: { kind: "start", title: "Month end for a patient", next: "patientQ" },
      patientQ: { kind: "decision", title: "Under a doctor's orders?", opts: [["Yes — patient", "compile"], ["No — walk-in client", "skip"]] },
      skip: { kind: "end", tone: "ok", title: "No report required" },
      compile: { kind: "process", title: "Compile findings, plan & progress", desc: "Auto-drafted from locked notes.", next: "reviewQ" },
      reviewQ: { kind: "decision", title: "Therapist review?", opts: [["Approve", "send"], ["Edit", "compile"]] },
      send: { kind: "process", title: "Send to the referring MD", next: "doneD" },
      doneD: { kind: "end", tone: "ok", title: "Report delivered" },
    },
  },
  {
    id: "coverage", cat: "Practice ops", name: "Coverage / substitute",
    desc: "Vacation handoff: scoped access, notes, and revoke on return.",
    start: "leave",
    nodes: {
      leave: { kind: "start", title: "Therapist going on leave", next: "subQ" },
      subQ: { kind: "decision", title: "Substitute available?", opts: [["Yes — assign", "grant"], ["No", "reassign"]] },
      reassign: { kind: "process", title: "Reassign or offer reschedule", desc: "Clients notified.", next: "doneCov" },
      grant: { kind: "process", title: "Grant scoped, time-boxed access", desc: "Schedule + records for covered clients.", next: "handoff" },
      handoff: { kind: "process", title: "Share handoff notes", next: "returnQ" },
      returnQ: { kind: "decision", title: "Back from leave?", opts: [["Yes — revoke access", "doneCov"], ["Still out", "handoff"]] },
      doneCov: { kind: "end", tone: "ok", title: "Coverage handled" },
    },
  },
];

const FLOW_CATS = ["Front office", "Clinical", "Billing", "Practice ops"];
function flowGuidance(flow, node) {
  const label = `${node.title || ""} ${node.desc || ""}`.toLowerCase();
  const focus = node.desc || node.title || "this step";
  const clinical = /soap|clinical|treat|assessment|chart|finding|patient|consent/.test(label);
  const scheduling = /appoint|book|schedule|slot|waitlist|availability|check.?in/.test(label);
  const billing = /invoice|payment|charge|payroll|claim|insurance|fee|balance|receipt/.test(label);
  const access = /role|access|login|sign.?in|credential|mfa|permission/.test(label);
  const compliance = /license|compliance|renew|authorization|audit|policy/.test(label);
  const domainCheck = clinical
    ? "Check that the information is relevant, accurate, current, and within the intended scope; verify any required consent or safety gate before proceeding."
    : scheduling
      ? "Check the requested service, date/time, provider and room, then confirm the slot and any required forms or policy gates."
      : billing
        ? "Check the service, amount, payment or payer route, and any required approval before recording or submitting a financial action."
        : access
          ? "Check the person's identity, verification status, intended role, and least-privilege access before continuing."
          : compliance
            ? "Check the applicable requirement, responsible person, due date, and supporting record; confirm the rule that applies rather than assuming."
            : `Review the details for “${focus}” against the current workflow and confirm any prerequisite, exception, or approval that applies.`;
  const defaults = node.kind === "decision" ? {
    why: `This decision determines the next route in ${flow.name}; choosing from verified information helps avoid skipping a required safeguard.`,
    check: `${domainCheck} Compare the actual situation with each available choice; if it is unclear, pause and verify before choosing.`,
    next: "Select the single branch that matches the verified situation. The selected choice determines which step opens next.",
    success: "The choice is supported by what was checked, the correct branch is selected, and no unresolved prerequisite has been treated as complete.",
  } : node.kind === "end" ? {
    why: `This is the workflow outcome for “${focus}”; checking closure prevents an unfinished handoff from appearing complete.`,
    check: `${domainCheck} Confirm the stated outcome and look for any remaining follow-up, exception, or handoff.`,
    next: "If the outcome is not actually reached, use the flow map or restart to return to the relevant step; otherwise finish here.",
    success: "The displayed outcome matches what happened, required follow-up is accounted for, and no open branch is left unaddressed.",
  } : node.kind === "start" ? {
    why: `This opening step establishes the context for ${flow.name} so later choices use the right starting point.`,
    check: `Confirm that “${focus}” is the intended starting situation, and identify the prerequisites or information needed before acting.`,
    next: "Gather only the information needed for the next step, then use Complete step & continue to advance.",
    success: "The correct workflow and starting context are confirmed, with prerequisites identified and no action assumed to have happened.",
  } : {
    why: `Completing “${focus}” moves ${flow.name} forward and helps keep the next action grounded in the current result.`,
    check: `${domainCheck} Review the result of “${focus}” and note anything incomplete or requiring a handoff.`,
    next: "Carry out the described action, verify its result, then use Complete step & continue. If a prerequisite is missing, pause instead of advancing.",
    success: "The action is complete, its result is checked, and the next step can proceed without an unresolved prerequisite.",
  };
  return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, node.guidance?.[key]?.trim() || value]));
}

function Flows({ flows, setFlows, flowNotes, setFlowNotes, onReportFlowStep }) {
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const [mode, setMode] = useState("list"); // list | run | edit
  // run state
  const [flowId, setFlowId] = useState(null);
  const [cur, setCur] = useState(null);
  const [trail, setTrail] = useState([]);
  const [flowComplete, setFlowComplete] = useState(false);
  // edit state
  const [draft, setDraft] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmFlow, setConfirmFlow] = useState(null);
  const [confirmNode, setConfirmNode] = useState(null);

  const flow = flows.find((f) => f.id === flowId);
  const node = flow ? flow.nodes[cur] : null;

  const begin = (f) => { setFlowId(f.id); setCur(f.start); setTrail([{ id: f.start }]); setFlowComplete(false); setMode("run"); };
  const go = (to, via) => { if (!to || !flow.nodes[to]) return; setTrail((t) => [...t, { id: to, via }]); setCur(to); setFlowComplete(false); };
  const restart = () => { setCur(flow.start); setTrail([{ id: flow.start }]); setFlowComplete(false); };

  // ---- manage ----
  const blankFlow = () => ({ id: "flow" + Date.now(), cat: "Front office", name: "Untitled flow", desc: "", start: "n1", nodes: { n1: { kind: "start", title: "Start", next: "" } } });
  const startNew = () => { setDraft(blankFlow()); setIsNew(true); setMode("edit"); };
  const startEdit = (f) => { setDraft(clone(f)); setIsNew(false); setMode("edit"); };
  const duplicate = (f) => setFlows((p) => [...p, { ...clone(f), id: "flow" + Date.now(), name: f.name + " (copy)" }]);
  const removeFlow = (id) => setFlows((p) => p.filter((f) => f.id !== id));
  const saveDraft = () => {
    const d = clone(draft);
    if (!d.name.trim()) d.name = "Untitled flow";
    setFlows((p) => (isNew ? [...p, d] : p.map((f) => (f.id === d.id ? d : f))));
    setMode("list"); setDraft(null);
  };

  // ---- draft editing helpers ----
  const nextId = (nodes) => { let i = 1; while (nodes["n" + i]) i++; return "n" + i; };
  const updMeta = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const updNode = (id, patch) => setDraft((d) => ({ ...d, nodes: { ...d.nodes, [id]: { ...d.nodes[id], ...patch } } }));
  const addNode = () => setDraft((d) => { const id = nextId(d.nodes); return { ...d, nodes: { ...d.nodes, [id]: { kind: "process", title: "New step", next: "" } } }; });
  const delNode = (id) => setDraft((d) => {
    const nodes = clone(d.nodes); delete nodes[id];
    Object.keys(nodes).forEach((k) => { const n = nodes[k]; if (n.next === id) n.next = ""; if (n.opts) n.opts = n.opts.map(([l, to]) => [l, to === id ? "" : to]); });
    const start = d.start === id ? (Object.keys(nodes)[0] || "") : d.start;
    return { ...d, nodes, start };
  });
  const setKind = (id, kind) => setDraft((d) => {
    const n = { ...d.nodes[id], kind };
    if (kind === "decision") { delete n.next; if (!n.opts) n.opts = [["Yes", ""], ["No", ""]]; }
    else if (kind === "end") { delete n.next; delete n.opts; if (!n.tone) n.tone = "ok"; }
    else { delete n.opts; delete n.tone; if (n.next === undefined) n.next = ""; }
    return { ...d, nodes: { ...d.nodes, [id]: n } };
  });
  const addOpt = (id) => setDraft((d) => ({ ...d, nodes: { ...d.nodes, [id]: { ...d.nodes[id], opts: [...(d.nodes[id].opts || []), ["Option", ""]] } } }));
  const updOpt = (id, i, field, val) => setDraft((d) => { const opts = clone(d.nodes[id].opts); opts[i][field === "label" ? 0 : 1] = val; return { ...d, nodes: { ...d.nodes, [id]: { ...d.nodes[id], opts } } }; });
  const delOpt = (id, i) => setDraft((d) => { const opts = clone(d.nodes[id].opts); opts.splice(i, 1); return { ...d, nodes: { ...d.nodes, [id]: { ...d.nodes[id], opts } } }; });

  const tone = { ok: { bg: "#e4efe5", fg: "#2c6b3e" }, bad: { bg: "var(--rose-bg)", fg: "var(--rose)" } };
  const kindDot = (k) => (k === "decision" ? "var(--gold)" : k === "end" ? "var(--pine-soft)" : "var(--pine)");

  /* ---------------- EDITOR ---------------- */
  if (mode === "edit" && draft) {
    const nodeOpts = Object.entries(draft.nodes);
    const targetSel = (val, onCh) => (
      <select className="sel" value={val || ""} onChange={(e) => onCh(e.target.value)} style={{ maxWidth: 200 }}>
        <option value="">— choose target —</option>
        {nodeOpts.map(([nid, n]) => <option key={nid} value={nid}>{n.title}</option>)}
      </select>
    );
    return (
      <>
        <div className="row" style={{ gap: 10, marginBottom: 16, alignItems: "center" }}>
          <button className="btn ghost sm" onClick={() => { setMode("list"); setDraft(null); }}><ArrowLeft size={14} /> Cancel</button>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{isNew ? "New flow" : "Edit flow"}</div>
          <button className="btn pri sm" style={{ marginLeft: "auto" }} onClick={saveDraft}><Check size={14} /> Save flow</button>
        </div>

        <section className="card pad" style={{ marginBottom: 16 }}>
          <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <div className="field"><label>Flow name</label><input className="inp" value={draft.name} onChange={(e) => updMeta("name", e.target.value)} /></div>
            <div className="field"><label>Category</label><select className="sel" value={draft.cat} onChange={(e) => updMeta("cat", e.target.value)}>{FLOW_CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="field" style={{ marginTop: 12 }}><label>Description</label><input className="inp" value={draft.desc} onChange={(e) => updMeta("desc", e.target.value)} /></div>
          <div className="field" style={{ marginTop: 12, maxWidth: 260 }}><label>Start step</label>
            <select className="sel" value={draft.start} onChange={(e) => updMeta("start", e.target.value)}>{nodeOpts.map(([nid, n]) => <option key={nid} value={nid}>{n.title}</option>)}</select>
          </div>
        </section>

        <div className="row" style={{ marginBottom: 12, alignItems: "center" }}>
          <div className="tiny">Steps ({nodeOpts.length})</div>
          <button className="btn pri sm" style={{ marginLeft: "auto" }} onClick={addNode}><Plus size={14} /> Add step</button>
        </div>

        {nodeOpts.map(([id, n]) => (
          <section className="card pad" key={id} style={{ marginBottom: 12 }}>
            <div className="row" style={{ gap: 10, alignItems: "center", marginBottom: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: kindDot(n.kind), flex: "0 0 auto" }} />
              <select className="sel" value={n.kind} onChange={(e) => setKind(id, e.target.value)} style={{ maxWidth: 130 }}>
                <option value="start">Start</option><option value="process">Step</option><option value="decision">Decision</option><option value="end">End</option>
              </select>
              <input className="inp" value={n.title} onChange={(e) => updNode(id, { title: e.target.value })} placeholder="Step title" style={{ flex: 1 }} />
              {draft.start === id && <span className="pill done">start</span>}
              <button className="trash" onClick={() => setConfirmNode(id)} title="Delete step" style={{ marginLeft: 4 }}><Trash2 size={16} /></button>
            </div>
            <input className="inp" value={n.desc || ""} onChange={(e) => updNode(id, { desc: e.target.value })} placeholder="Optional description" style={{ marginBottom: 10 }} />
            <details style={{ marginBottom: 12 }}>
              <summary className="tiny" style={{ cursor: "pointer", marginBottom: 8 }}>Step guidance (why, check, next, success)</summary>
              {[
                ["why", "Why it matters"],
                ["check", "What to check"],
                ["next", "Next action"],
                ["success", "What success looks like"],
              ].map(([key, label]) => (
                <div className="field" key={key} style={{ marginTop: 8 }}>
                  <label>{label}</label>
                  <textarea className="ta" rows={2} value={n.guidance?.[key] || ""} onChange={(e) => updNode(id, { guidance: { ...(n.guidance || {}), [key]: e.target.value } })} placeholder={`Generated guidance based on this ${n.kind} and its title/description`} />
                </div>
              ))}
            </details>

            {n.kind === "end" && (
              <div className="row" style={{ gap: 10, alignItems: "center" }}>
                <span className="tiny">Outcome</span>
                <select className="sel" value={n.tone || "ok"} onChange={(e) => updNode(id, { tone: e.target.value })} style={{ maxWidth: 180 }}>
                  <option value="ok">Complete (positive)</option><option value="bad">Ended (negative)</option>
                </select>
              </div>
            )}
            {(n.kind === "process" || n.kind === "start") && (
              <div className="row" style={{ gap: 10, alignItems: "center" }}>
                <span className="tiny">Continue to</span>{targetSel(n.next, (v) => updNode(id, { next: v }))}
              </div>
            )}
            {n.kind === "decision" && (
              <div>
                <div className="tiny" style={{ marginBottom: 8 }}>Branches</div>
                {(n.opts || []).map(([label, to], i) => (
                  <div className="row" key={i} style={{ gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <input className="inp" value={label} onChange={(e) => updOpt(id, i, "label", e.target.value)} placeholder="Choice" style={{ flex: 1 }} />
                    <ChevronRight size={14} color="var(--muted)" />
                    {targetSel(to, (v) => updOpt(id, i, "to", v))}
                    <button className="trash" onClick={() => delOpt(id, i)} style={{ width: 34, height: 34 }}><X size={15} /></button>
                  </div>
                ))}
                <button className="btn ghost sm" onClick={() => addOpt(id)}><Plus size={13} /> Add branch</button>
              </div>
            )}
          </section>
        ))}
        {confirmNode && draft.nodes[confirmNode] && <ConfirmModal danger title={`Delete step “${draft.nodes[confirmNode].title}”?`} confirm="Delete step" onClose={() => setConfirmNode(null)} body={<>Any branches pointing to this step will be cleared. This can’t be undone.</>} onConfirm={() => { delNode(confirmNode); setConfirmNode(null); }} />}
      </>
    );
  }

  /* ---------------- RUNNER ---------------- */
  if (mode === "run" && flow && node) {
    const visited = new Set(trail.map((t) => t.id));
    const validNext = node.next && flow.nodes[node.next];
    const guidance = flowGuidance(flow, node);
    const stepNoteKey = `${flow.id}:${cur}`;
    const reportStep = (kind) => {
      if (kind === "feedback" && !window.confirm("Your feedback opens the feedback form. Do not include patient names, clinical details, or other sensitive information.")) return;
      onReportFlowStep?.({ flowId: flow.id, flowName: flow.name, nodeId: cur, nodeLabel: node.title, kind });
    };
    return (
      <>
        <div className="row" style={{ gap: 10, marginBottom: 16, alignItems: "center" }}>
          <button className="btn ghost sm" onClick={() => setMode("list")}><ArrowLeft size={14} /> All flows</button>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{flow.name}</div>
          <span className="pill" style={{ marginLeft: 6 }}>{flow.cat}</span>
          <button className="btn ghost sm" style={{ marginLeft: "auto" }} onClick={() => startEdit(flow)}><Pencil size={13} /> Edit</button>
          <span className="pill">Step {trail.length}</span>
        </div>
        <div className="two" style={{ alignItems: "start" }}>
          <section className="card pad">
            <span className="pill" style={node.kind === "decision"
              ? { background: "var(--amber-bg)", color: "var(--amber)" }
              : node.kind === "end"
                ? { background: tone[node.tone || "ok"].bg, color: tone[node.tone || "ok"].fg }
                : {}}>
              {node.kind === "decision" ? "Decision" : node.kind === "end" ? (node.tone === "bad" ? "Ended" : "Done") : node.kind === "start" ? "Start" : "Step"}
            </span>
            <div className="serif" style={{ fontSize: node.kind === "end" ? 22 : 20, fontWeight: 600, margin: "12px 0 6px" }}>{node.title}</div>
            {node.desc && <div className="muted" style={{ fontSize: 13, marginBottom: 14 }}>{node.desc}</div>}
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 18, paddingTop: 16 }}>
              <div className="tiny" style={{ marginBottom: 10 }}>Step guidance</div>
              {[
                ["Why it matters", guidance.why],
                ["What to check", guidance.check],
                ["Next action", guidance.next],
                ["What success looks like", guidance.success],
              ].map(([label, text]) => (
                <div key={label} style={{ marginBottom: 11 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{label}</div>
                  <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.55 }}>{text}</div>
                </div>
              ))}
            </div>
            {node.kind === "decision" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                {(node.opts || []).map(([label, to], i) => (
                  <button key={i} className="btn" style={{ justifyContent: "space-between", width: "100%", opacity: to && flow.nodes[to] ? 1 : 0.45 }} disabled={!to || !flow.nodes[to]} onClick={() => go(to, label)}>{label}<ChevronRight size={15} /></button>
                ))}
              </div>
            )}
            {node.kind === "end" && (
              <div className="row" style={{ gap: 8, marginTop: 14 }}>
                <button className="btn pri sm" onClick={restart}>Run again</button>
                <button className="btn ghost sm" onClick={() => setMode("list")}>Choose another flow</button>
              </div>
            )}
            {(node.kind === "start" || node.kind === "process") && (
              <div style={{ marginTop: 14 }}>
                {flowComplete
                  ? <div className="row" style={{ gap: 8 }}><span className="pill done"><Check size={12} /> Step complete</span><button className="btn ghost sm" onClick={restart}>Run again</button></div>
                  : validNext
                    ? <button className="btn pri" onClick={() => go(node.next)}>Complete step &amp; continue <ChevronRight size={15} /></button>
                    : <><div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>No next step is configured. Complete this final step when its work is done.</div><button className="btn pri" onClick={() => setFlowComplete(true)}>Complete step <Check size={15} /></button></>}
              </div>
            )}
            <div className="field" style={{ marginTop: 12 }}>
              <label>Step note · session only</label>
              <textarea className="ta" rows={3} value={flowNotes[stepNoteKey] || ""} onChange={(e) => setFlowNotes((current) => ({ ...current, [stepNoteKey]: e.target.value }))} placeholder="Personal scratch note for this walkthrough…" />
              <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>Kept in this browser session across navigation and restart. Do not enter real patient or clinical details.</div>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 14, paddingTop: 12 }}>
              <div className="tiny" style={{ marginBottom: 8 }}>Help with this step</div>
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                <button className="btn ghost sm" disabled={!onReportFlowStep} onClick={() => reportStep("issue")}><AlertTriangle size={13} /> Report an issue</button>
                <button className="btn ghost sm" disabled={!onReportFlowStep} onClick={() => reportStep("feedback")}><MessageSquare size={13} /> Give feedback</button>
              </div>
              {!onReportFlowStep && <div className="muted" style={{ fontSize: 11.5, marginTop: 6 }}>Feedback is not connected in this workspace.</div>}
            </div>
          </section>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <section className="card pad">
              <div className="tiny" style={{ marginBottom: 12 }}>Your path</div>
              {trail.map((step, i) => {
                const n = flow.nodes[step.id]; const last = i === trail.length - 1;
                return (
                  <div key={i} className="row" style={{ gap: 10, alignItems: "flex-start", paddingBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: last ? "var(--pine)" : "var(--pine-soft)", marginTop: 4, flex: "0 0 auto" }} />
                    <div><div style={{ fontSize: 13, fontWeight: last ? 700 : 600, color: last ? "var(--ink)" : "var(--muted)" }}>{n ? n.title : step.id}</div>{step.via && <div style={{ fontSize: 11.5, color: "#9a6a16" }}>&rsaquo; {step.via}</div>}</div>
                  </div>
                );
              })}
            </section>
            <section className="card pad">
              <div className="tiny" style={{ marginBottom: 12 }}>Flow map · {Object.keys(flow.nodes).length} nodes</div>
              {Object.entries(flow.nodes).map(([id, n]) => {
                const done = visited.has(id); const isCur = id === cur;
                return (
                  <div key={id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "5px 0", opacity: done || isCur ? 1 : 0.5 }}>
                    <div style={{ width: 9, height: 9, borderRadius: "50%", marginTop: 5, flex: "0 0 auto", background: isCur ? "var(--gold)" : done ? kindDot(n.kind) : "var(--border)", boxShadow: isCur ? "0 0 0 4px rgba(184,138,50,.22)" : "none" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: isCur ? 700 : 500, color: "var(--ink)" }}>{n.title}{n.kind === "decision" && <span style={{ color: "var(--muted)", fontWeight: 500 }}> · decision</span>}</div>
                      {n.opts && n.opts.map(([label], k) => (<div key={k} style={{ fontSize: 11, color: "var(--muted)" }}>&rsaquo; {label}</div>))}
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        </div>
      </>
    );
  }

  /* ---------------- LIST / MANAGE ---------------- */
  const cats = [...FLOW_CATS, ...[...new Set(flows.map((f) => f.cat))].filter((c) => !FLOW_CATS.includes(c))];
  return (
    <>
      <div className="row" style={{ marginBottom: 16, alignItems: "center" }}>
        <div className="muted" style={{ fontSize: 13.5, maxWidth: 620 }}>Guided walkthroughs of every route on the map. Run one to step through its decisions, or build and edit your own.</div>
        <button className="btn pri" style={{ marginLeft: "auto" }} onClick={startNew}><Plus size={15} /> New flow</button>
      </div>
      {cats.map((cat) => {
        const list = flows.filter((f) => f.cat === cat);
        if (!list.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 22 }}>
            <div className="tiny" style={{ marginBottom: 10 }}>{cat}</div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {list.map((f) => {
                const steps = Object.keys(f.nodes).length;
                const dec = Object.values(f.nodes).filter((n) => n.kind === "decision").length;
                return (
                  <div key={f.id} className="card pad" style={{ display: "flex", flexDirection: "column" }}>
                    <div onClick={() => begin(f)} style={{ cursor: "pointer", flex: 1 }}>
                      <div className="row" style={{ gap: 10, marginBottom: 8 }}>
                        <div className="avatar" style={{ background: "var(--pine)", width: 30, height: 30 }}><Workflow size={15} color="#fff" /></div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{f.name}</div>
                      </div>
                      <div className="muted" style={{ fontSize: 12, marginBottom: 12, minHeight: 46 }}>{f.desc}</div>
                      <div className="row" style={{ gap: 6 }}><span className="pill">{steps} steps</span><span className="pill">{dec} decisions</span></div>
                    </div>
                    <div className="row" style={{ gap: 6, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                      <button className="btn ghost sm" onClick={() => begin(f)}>Run</button>
                      <button className="btn ghost sm" onClick={() => startEdit(f)} title="Edit"><Pencil size={13} /></button>
                      <button className="btn ghost sm" onClick={() => duplicate(f)} title="Duplicate"><Copy size={13} /></button>
                      <button className="btn ghost sm" style={{ marginLeft: "auto", color: "var(--rose)" }} onClick={() => setConfirmFlow(f)} title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {flows.length === 0 && <div className="muted" style={{ fontSize: 14 }}>No flows yet. Create one with “New flow”.</div>}
      {confirmFlow && <ConfirmModal danger title={`Delete flow “${confirmFlow.name}”?`} confirm="Delete flow" onClose={() => setConfirmFlow(null)} body={<>All {Object.keys(confirmFlow.nodes).length} steps in this flow will be removed. This can’t be undone.</>} onConfirm={() => { removeFlow(confirmFlow.id); setConfirmFlow(null); }} />}
    </>
  );
}

/* ----------------------------- Calendar sync ----------------------------- */
function CalendarSync({ state, prov, client, cal, setCal }) {
  const providers = [
    { id: "google", name: "Google Calendar", color: "#4285F4", account: "dana@artofpalpation.com", cals: ["Art of Palpation", "Personal"] },
    { id: "outlook", name: "Outlook / Microsoft 365", color: "#0F6CBD", account: "dana@artofpalpation.com", cals: ["Calendar", "Clinic"] },
    { id: "apple", name: "Apple Calendar (iCloud)", color: "#111111", account: "dana@icloud.com", cals: ["Work", "Home"] },
  ];
  const upd = (id, patch) => setCal((c) => ({ ...c, [id]: { ...c[id], ...patch } }));
  const now = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const connect = (pv) => upd(pv.id, { connected: true, account: pv.account, calendar: pv.cals[0], twoWay: true, last: "Just now" });
  const disconnect = (id) => upd(id, { connected: false, account: null, last: null });
  const feed = "Calendar subscriptions are not connected";
  
  const connectedCount = providers.filter((p) => cal[p.id] && cal[p.id].connected).length;

  return (
    <>
      <div className="row" style={{ marginBottom: 16, alignItems: "center" }}>
        <div className="muted" style={{ fontSize: 13.5, maxWidth: 620 }}>Keep the schedule in sync with the calendars your team already lives in. Connect an account for continuous two-way sync, or export an .ics that imports anywhere.</div>
        <span className="pill" style={{ marginLeft: "auto" }}>{connectedCount} connected</span>
      </div>

      <section className="card pad" style={{ marginBottom: 16 }}>
        <div className="tiny" style={{ marginBottom: 8 }}>What syncs to the calendar</div>
        <div className="row" style={{ gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <button className={"btn sm" + (!cal.detail ? " pri" : "")} onClick={() => setCal((c) => ({ ...c, detail: false }))}>Limited detail</button>
          <button className={"btn sm" + (cal.detail ? " pri" : "")} onClick={() => setCal((c) => ({ ...c, detail: true }))}>Full detail</button>
        </div>
        {cal.detail
          ? <div className="alert" style={{ padding: 0, border: "none" }}><div className="ico dang"><AlertTriangle size={16} /></div><div><div className="tx">Full detail sends PHI to a third party</div><div className="sx">Client names, services, and conditions would leave AOP for a calendar vendor that may not have a BAA. Use only where the account is covered.</div></div></div>
          : <div className="alert" style={{ padding: 0, border: "none" }}><div className="ico ok"><ShieldCheck size={16} /></div><div><div className="tx">Limited detail (recommended)</div><div className="sx">Events show only “Appointment · Room” and the provider — no client name, service, or condition leaves the system.</div></div></div>}
      </section>

      <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 16 }}>
        {providers.map((pv) => {
          const cs = cal[pv.id] || {};
          return (
            <div className="card pad" key={pv.id} style={{ display: "flex", flexDirection: "column" }}>
              <div className="row" style={{ gap: 10, marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: pv.color, display: "flex", alignItems: "center", justifyContent: "center" }}><CalendarDays size={19} color="#fff" /></div>
                <div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{pv.name}</div><div className="muted" style={{ fontSize: 11.5 }}>{cs.connected ? cs.account : "Not connected"}</div></div>
              </div>
              {cs.connected ? (
                <>
                  <div className="field" style={{ marginBottom: 8 }}><label>Calendar</label>
                    <select className="sel" value={cs.calendar} onChange={(e) => upd(pv.id, { calendar: e.target.value })}>{pv.cals.map((k) => <option key={k}>{k}</option>)}</select></div>
                  <label className="row" style={{ gap: 8, fontSize: 12.5, cursor: "pointer", marginBottom: 8 }}>
                    <input type="checkbox" checked={!!cs.twoWay} onChange={(e) => upd(pv.id, { twoWay: e.target.checked })} /> Two-way sync
                  </label>
                  <div className="muted" style={{ fontSize: 11.5, marginBottom: 10 }}>Last synced {cs.last}</div>
                  <div className="row" style={{ gap: 6, marginTop: "auto" }}>
                    <button className="btn sm" onClick={() => upd(pv.id, { last: "Just now · " + now() })}><RefreshCw size={13} /> Sync now</button>
                    <button className="btn ghost sm" style={{ marginLeft: "auto", color: "var(--rose)" }} onClick={() => disconnect(pv.id)}>Disconnect</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 12, minHeight: 34 }}>Connect to push appointments and pull availability automatically.</div>
                  <button className="btn pri sm" style={{ marginTop: "auto" }} onClick={() => connect(pv)}><Link2 size={13} /> Connect</button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="two">
        <section className="card pad">
          <div className="tiny" style={{ marginBottom: 8 }}>Export</div>
          <div className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>Download an iCalendar file of the current schedule and import it into any Google, Outlook, or Apple calendar.</div>
          <button className="btn pri" onClick={() => downloadFile("aop-schedule.ics", buildICS(state.appts, { detail: cal.detail, prov, client, dateISO: todayISO }), "text/calendar")}><CalendarCheck size={15} /> Download .ics ({state.appts.length} events)</button>
        </section>
        <section className="card pad">
          <div className="tiny" style={{ marginBottom: 8 }}>Subscribe feed</div>
          <div className="muted" style={{ fontSize: 12.5, marginBottom: 12 }}>A live subscription URL keeps calendars updated without re-importing. Available once the hosted backend is connected.</div>
          <div className="row" style={{ gap: 8 }}>
            <input className="inp" readOnly value={feed} style={{ flex: 1, fontSize: 12.5 }} onFocus={(e) => e.target.select()} />
            <button className="btn sm" disabled>Not connected</button>
          </div>
        </section>
      </div>
    </>
  );
}

/* ----------------------------- Body Assessment (detailed anatomy) ----------------------------- */

// ── SVG PATH DATA ──────────────────────────────────────────────────────────
// Original schematic dissection atlas, 400 × 900. These are charting regions,
// not diagnostic imagery. Deep windows intentionally expose overlapping anatomy.
// All paired source paths occupy the screen-left half. Only absolute M/L/Q/C/Z
// commands are used, so reflection produces a complete standalone catalog path.
// Row: [key, name, view, path, centroidX, centroidY, deep?, midline?].
const AOP_PATHS = {
  'Head / neck': [
    ['frontalis','Frontalis','anterior','M174 35 Q186 24 198 28 L198 55 Q184 51 172 58 Z',185,42],
    ['temporalis','Temporalis','anterior','M169 44 Q158 55 164 80 L175 73 L175 57 Z',168,62],
    ['masseter','Masseter','anterior','M166 79 L179 81 L183 104 Q169 102 166 90 Z',175,92],
    ['occipitalis','Occipitalis','posterior','M166 70 Q177 64 197 72 L197 96 Q176 103 169 93 Z',182,84],
    ['sternocleidomastoid','Sternocleidomastoid','anterior','M175 104 Q178 124 196 153 L186 157 Q171 135 169 112 Z',181,131],
    ['scalenes','Scalenes','anterior','M169 119 L179 146 L167 157 L158 151 Z',168,143,true],
    ['suboccipitals','Suboccipitals','posterior','M179 101 L197 99 L195 115 L182 119 Z',188,109,true],
    ['splenius_capitis','Splenius capitis','posterior','M172 107 L181 116 L192 144 L183 149 Q173 127 166 119 Z',178,129,true],
    ['levator_scapulae','Levator scapulae','posterior','M169 120 Q164 142 150 177 L161 184 Q174 151 180 139 Z',165,151,true],
  ],
  'Shoulder girdle': [
    ['upper_trapezius','Upper trapezius','posterior','M195 115 L196 171 Q163 172 118 179 Q132 157 163 150 Z',181,158],
    ['middle_trapezius','Middle trapezius','posterior','M196 174 L196 210 L151 198 L136 181 Z',181,190],
    ['lower_trapezius','Lower trapezius','posterior','M196 214 L194 299 Q178 281 163 215 L151 202 Z',185,242],
    ['rhomboid_minor','Rhomboid minor','posterior','M176 186 L163 181 L153 191 L174 201 Z',163,191,true],
    ['rhomboid_major','Rhomboid major','posterior','M173 205 L154 194 L149 224 L177 247 Z',163,218,true],
    ['deltoid_anterior','Deltoid — anterior','anterior','M124 164 Q102 166 99 190 L106 225 Q118 211 134 184 Z',116,189],
    ['deltoid_middle','Deltoid — middle','both','M99 177 Q88 187 88 210 L99 238 L105 219 Z',97,207],
    ['deltoid_posterior','Deltoid — posterior','posterior','M127 164 Q105 164 100 186 L109 224 Q121 210 135 187 Z',117,190],
    ['supraspinatus','Supraspinatus','posterior','M133 171 L153 174 L151 185 L124 190 Z',139,180,true],
    ['infraspinatus','Infraspinatus','posterior','M126 195 L149 190 L145 234 Q127 225 117 210 Z',134,211],
    ['teres_minor','Teres minor','posterior','M117 215 L143 237 L136 244 L114 226 Z',128,230],
    ['teres_major','Teres major','posterior','M115 231 L139 249 L130 263 L110 242 Z',125,247],
    ['subscapularis','Subscapularis','anterior','M126 198 L138 207 L135 236 L121 249 L116 221 Z',127,222,true],
    ['serratus_anterior','Serratus anterior','anterior','M140 241 L157 254 L148 261 L159 270 L147 276 L157 285 L144 292 L135 278 Z',146,272],
    ['pectoralis_major_clavicular','Pectoralis major — clavicular','anterior','M196 167 Q159 154 131 170 L138 188 Q167 186 196 184 Z',166,174],
    ['pectoralis_major_sternal','Pectoralis major — sternal','anterior','M196 188 L141 192 L138 237 Q165 253 196 242 Z',171,219],
    ['pectoralis_minor','Pectoralis minor','anterior','M141 198 L149 201 L173 232 L155 237 Z',155,219,true],
  ],
  'Arm / forearm / hand': [
    ['biceps_brachii','Biceps brachii','anterior','M106 228 Q126 221 121 251 L103 304 L88 316 Q85 288 96 260 Z',105,270],
    ['brachialis','Brachialis','anterior','M120 265 L113 301 L96 326 L89 320 L106 301 Z',106,304,true],
    ['triceps_long','Triceps — long head','posterior','M116 230 Q128 234 117 270 L100 313 L91 315 L101 269 Z',110,266],
    ['triceps_lateral','Triceps — lateral head','posterior','M95 234 L102 257 L89 303 L80 312 Q78 281 88 249 Z',90,273],
    ['triceps_medial','Triceps — medial head','posterior','M108 293 L101 323 L90 331 L86 318 Z',97,314,true],
    ['brachioradialis','Brachioradialis','anterior','M84 300 L91 316 Q83 344 70 378 L62 406 L57 400 Q59 359 71 330 Z',72,349],
    ['wrist_flexors','Wrist flexor group','anterior','M89 331 L98 337 Q88 375 66 430 L59 429 L67 396 Z',81,370],
    ['wrist_extensors','Wrist extensor group','posterior','M76 329 Q87 321 96 338 L80 381 L64 431 L54 427 L63 373 Z',75,375],
    ['pronator_teres','Pronator teres','anterior','M95 329 L98 340 L76 356 L70 347 Z',84,342],
    ['supinator','Supinator','posterior','M73 332 L84 337 L81 357 L65 363 L63 351 Z',73,349,true],
    ['thenar','Thenar eminence','anterior','M49 438 Q39 431 32 448 L27 462 Q38 467 46 454 Z',38,450],
    ['hypothenar','Hypothenar eminence','anterior','M57 436 L63 442 L55 473 L45 477 L46 462 Z',53,456],
  ],
  'Trunk': [
    ['rectus_abdominis','Rectus abdominis','anterior','M179 256 L196 252 L196 381 L186 397 L174 382 L178 359 L175 336 L179 312 L176 288 Z',188,323],
    ['external_obliques','External obliques','anterior','M145 288 L172 301 L171 352 L178 386 L153 401 Q142 371 142 335 Z',155,331],
    ['internal_obliques','Internal obliques','anterior','M146 354 L161 358 L173 381 L153 390 Z',157,373,true],
    ['transversus_abdominis','Transversus abdominis','anterior','M146 326 L169 327 L169 348 L145 345 Z',157,336,true],
    ['latissimus_dorsi','Latissimus dorsi','posterior','M130 267 L155 253 L176 289 L184 378 L154 399 Q139 357 140 309 Z',155,311],
    ['erector_spinae_cervical','Erector spinae — cervical','posterior','M187 120 L195 121 L196 165 L187 160 Z',191,142,true],
    ['erector_spinae_thoracic','Erector spinae — thoracic','posterior','M180 253 L190 270 L190 322 L181 321 L177 286 Z',184,288],
    ['erector_spinae_lumbar','Erector spinae — lumbar','posterior','M181 326 L190 328 L189 393 L180 403 L176 375 Z',183,361],
    ['quadratus_lumborum','Quadratus lumborum','posterior','M151 335 L173 339 L172 382 L155 388 Z',162,360,true],
    ['multifidus','Multifidus','posterior','M192 311 L197 318 L197 413 L187 419 L190 377 Z',194,367,true],
    ['intercostals','Intercostals','anterior','M159 245 L173 249 L171 286 L160 280 L165 273 L158 266 L165 260 L157 253 Z',166,264,true],
    ['diaphragm','Diaphragm','anterior','M159 294 Q177 279 200 288 Q223 279 241 294 L239 301 Q217 291 200 300 Q183 291 161 301 Z',200,294,true,true],
  ],
  'Hip / gluteal': [
    ['gluteus_maximus','Gluteus maximus','posterior','M151 423 Q169 404 193 429 L196 459 Q180 491 145 480 Q133 457 151 423 Z',169,453],
    ['gluteus_medius','Gluteus medius','posterior','M148 396 Q168 388 191 412 L186 423 Q160 414 143 437 L137 420 Z',161,409],
    ['gluteus_minimus','Gluteus minimus','posterior','M145 414 L161 412 L155 431 L143 441 L140 432 Z',150,424,true],
    ['piriformis','Piriformis','posterior','M187 433 L185 444 L151 449 L145 439 Z',167,441,true],
    ['tfl','Tensor fasciae latae (TFL)','anterior','M144 408 L155 408 L149 452 L139 465 L134 447 Z',143,435],
    ['iliopsoas','Iliopsoas','anterior','M183 389 L195 389 L193 430 L179 454 L166 436 L178 416 Z',185,418,true],
    ['adductor_longus','Adductor longus','anterior','M183 454 L194 466 L186 520 L170 509 Z',183,485],
    ['adductor_magnus','Adductor magnus','posterior','M182 490 L194 481 L189 556 L178 583 L172 567 Z',184,530,true],
    ['adductor_brevis','Adductor brevis','anterior','M186 463 L192 471 L187 490 L178 483 Z',185,477,true],
    ['gracilis','Gracilis','anterior','M193 487 L198 484 L189 582 L181 609 L177 599 Z',189,539],
    ['pectineus','Pectineus','anterior','M168 435 L182 448 L178 464 L162 449 Z',173,448],
    ['sartorius','Sartorius','anterior','M152 420 L159 425 Q166 488 180 532 L186 580 L179 606 L174 598 L178 576 Q164 505 152 455 Z',170,515],
  ],
  'Thigh': [
    ['rectus_femoris','Rectus femoris','anterior','M153 464 Q169 478 171 521 L172 565 L160 599 L149 579 L144 520 Z',158,532],
    ['vastus_lateralis','Vastus lateralis','anterior','M139 471 L146 486 L140 540 L149 582 L142 600 Q124 579 126 545 Z',136,544],
    ['vastus_medialis','Vastus medialis','anterior','M174 539 L178 572 L174 608 Q163 613 158 603 L171 577 Z',169,592],
    ['vastus_intermedius','Vastus intermedius','anterior','M153 510 L163 511 L164 554 L157 575 L151 551 Z',157,540,true],
    ['biceps_femoris','Biceps femoris','posterior','M143 486 L158 490 L155 532 L145 586 L139 612 L129 602 L132 550 Z',143,541],
    ['semitendinosus','Semitendinosus','posterior','M163 490 L174 487 L177 541 L169 592 L171 617 L163 620 L158 590 Z',167,548],
    ['semimembranosus','Semimembranosus','posterior','M177 498 L183 505 L180 556 L177 604 L171 607 L175 570 Z',178,563,true],
    ['it_band','Iliotibial band (fascia)','both','M132 453 L139 460 L129 540 L132 595 L141 618 L135 624 L124 600 L122 547 Z',127,559],
  ],
  'Leg / foot': [
    ['gastrocnemius_medial','Gastrocnemius — medial head','posterior','M162 635 Q183 639 180 680 Q176 713 160 740 L154 726 L154 677 Z',168,684],
    ['gastrocnemius_lateral','Gastrocnemius — lateral head','posterior','M140 635 Q129 648 133 683 Q136 707 150 726 L154 679 L151 641 Z',143,680],
    ['soleus','Soleus','posterior','M132 698 L148 731 L155 746 L168 730 L175 705 L172 749 L158 800 L151 803 L140 751 Z',153,757],
    ['tibialis_anterior','Tibialis anterior','anterior','M155 642 L166 647 L165 698 L156 764 L151 812 L144 813 L149 759 L147 691 Z',157,709],
    ['tibialis_posterior','Tibialis posterior','posterior','M155 743 L164 736 L163 770 L157 805 L153 823 L147 820 L151 782 Z',157,782,true],
    ['fibularis_longus','Fibularis longus (peroneal)','both','M134 641 L143 647 L140 703 L146 755 L138 770 L130 711 Z',137,695],
    ['fibularis_brevis','Fibularis brevis (peroneal)','both','M132 731 L139 765 L143 805 L135 812 L132 782 L127 753 Z',136,774],
    ['extensor_digitorum_longus','Extensor digitorum longus','anterior','M146 645 L151 651 L145 710 L151 758 L144 805 L139 810 L143 756 L138 710 Z',145,728],
    ['flexor_digitorum_longus','Flexor digitorum longus','posterior','M175 741 L181 719 L177 784 L169 819 L160 828 L158 821 L168 795 Z',173,780,true],
    ['plantar_fascia','Plantar fascia — plantar projection','posterior','M149 824 L162 825 L174 858 Q155 868 133 858 L140 844 Z',153,847],
    ['intrinsic_foot','Intrinsic foot muscles','anterior','M145 824 L162 825 L177 858 Q151 875 121 863 L128 850 Z',149,852],
  ],
};
const AOP_BONE_PATHS = [
  ['skull','Skull','anterior','M178 27 Q200 17 222 27 L231 53 L224 73 L213 77 L211 98 L189 98 L187 77 L176 73 L169 53 Z',200,53,false,true],
  ['occiput','Occiput','posterior','M169 57 Q200 39 231 57 L229 86 Q217 108 200 109 Q183 108 171 86 Z',200,81,false,true],
  ['mastoid','Mastoid process','both','M167 94 L176 92 L177 108 L169 113 Z',172,103],
  ['c7','C7 spinous process','posterior','M196 153 L204 153 L205 164 L195 164 Z',200,159,false,true],
  ['clavicle','Clavicle','anterior','M198 160 Q176 149 153 158 L127 160 L127 168 L155 165 Q177 157 197 168 Z',160,161],
  ['acromion','Acromion','both','M115 163 L128 160 L132 169 L120 177 L113 172 Z',122,167],
  ['coracoid','Coracoid process','anterior','M130 178 Q140 170 144 180 L140 187 L132 185 Z',138,180],
  ['scapular_spine','Scapular spine','posterior','M123 188 L155 181 L165 189 L161 196 L147 190 L126 197 Z',146,189],
  ['inferior_scapular_angle','Inferior scapular angle','posterior','M141 241 L153 247 L148 259 L140 253 Z',146,250],
  ['sternum','Sternum','anterior','M195 171 L205 171 L204 225 L200 244 L196 225 Z',200,203,false,true],
  ['ribs','Ribs','both','M155 207 Q175 205 191 219 L191 226 Q169 212 151 216 Z M148 223 Q173 220 191 235 L191 242 Q169 229 147 232 Z M145 241 Q170 236 190 251 L188 258 Q168 245 146 250 Z M148 259 Q169 255 183 268 L179 275 Q164 264 151 269 Z',166,243],
  ['cervical_spine','Cervical spine','posterior','M197 112 L203 112 L204 149 L196 149 Z',200,132,false,true],
  ['thoracic_spine','Thoracic spine','posterior','M197 169 L203 169 L204 291 L196 291 Z',200,233,false,true],
  ['lumbar_spine','Lumbar spine','posterior','M195 297 L205 297 L206 392 L194 392 Z',200,346,false,true],
  ['sacrum','Sacrum','posterior','M190 398 L210 398 L215 416 L200 446 L185 416 Z',200,418,false,true],
  ['coccyx','Coccyx','posterior','M197 449 L203 449 L202 463 L198 463 Z',200,455,false,true],
  ['iliac_crest','Iliac crest','both','M142 398 Q167 381 190 400 L187 409 Q166 393 144 409 Z',163,398],
  ['asis','ASIS','anterior','M142 408 L153 406 L156 418 L148 424 L139 417 Z',147,415],
  ['psis','PSIS','posterior','M177 405 L188 402 L190 413 L181 419 L175 414 Z',182,411],
  ['greater_trochanter','Greater trochanter','both','M135 445 L145 441 L152 452 L148 469 L137 469 L132 459 Z',141,455],
  ['ischial_tuberosity','Ischial tuberosity','posterior','M173 468 Q186 464 189 476 L186 486 L175 484 Z',181,476],
  ['humerus','Humerus','both','M109 191 Q125 186 126 202 L119 215 L96 310 L99 322 L87 331 L80 322 L87 310 L109 214 Q98 199 109 191 Z',105,260],
  ['radius','Radius','both','M81 336 L89 337 L73 384 L58 427 L48 429 L51 417 L65 381 Z',69,381],
  ['ulna','Ulna','both','M93 333 L101 333 L94 348 L78 388 L64 430 L59 426 L72 384 L88 346 Z',80,378],
  ['femur','Femur','both','M179 432 Q191 428 190 440 L181 449 L153 456 L152 474 L160 599 L170 610 L166 621 L154 617 L143 624 L136 615 L148 602 L140 475 L137 453 L146 444 L175 440 Z',151,528],
  ['tibia','Tibia','both','M146 636 L171 636 L171 650 L159 664 L160 788 L167 819 L155 827 L150 816 L151 665 L142 650 Z',155,728],
  ['fibula','Fibula','both','M133 644 L141 644 L141 658 L138 710 L143 812 L138 824 L132 819 L135 807 L131 710 Z',135,736],
  ['patella','Patella','anterior','M148 610 Q158 601 168 610 L170 623 L158 636 L146 623 Z',158,619],
  ['tibial_tuberosity','Tibial tuberosity','anterior','M152 643 L162 643 L164 654 L155 660 L150 653 Z',157,651],
  ['fibular_head','Fibular head','both','M132 639 L142 640 L144 650 L139 657 L130 652 Z',137,648],
  ['medial_malleolus','Medial malleolus','both','M165 811 L173 812 L175 828 L168 832 L162 825 Z',168,821],
  ['lateral_malleolus','Lateral malleolus','both','M132 816 L141 814 L144 831 L136 838 L129 830 Z',137,827],
  ['calcaneus','Calcaneus','posterior','M145 833 Q156 827 166 837 L167 852 Q155 862 142 852 Z',154,845],
  ['olecranon','Olecranon','posterior','M85 319 L96 318 L100 330 L89 341 L81 333 Z',90,329],
  ['medial_epicondyle','Medial epicondyle','both','M98 310 L106 314 L104 324 L96 325 L93 318 Z',100,317],
  ['lateral_epicondyle','Lateral epicondyle','both','M79 312 L87 309 L91 319 L84 326 L76 322 Z',83,317],
];
const AOP_SURFACE_PATHS = [
  ['head','Head','both','M176 26 Q200 12 224 26 L235 53 L229 86 Q217 115 200 116 Q183 115 171 86 L165 53 Z',200,66,false,true],
  ['anterior_neck','Anterior neck','anterior','M179 111 L221 111 L230 152 L200 162 L170 152 Z',200,136,false,true],
  ['posterior_neck','Posterior neck','posterior','M179 111 L221 111 L230 152 L200 166 L170 152 Z',200,139,false,true],
  ['chest','Chest','anterior','M145 162 L200 155 L255 162 L264 240 L242 263 L158 263 L136 240 Z',200,212,false,true],
  ['upper_abdomen','Upper abdomen','anterior','M153 266 L247 266 L255 327 L145 327 Z',200,297,false,true],
  ['lower_abdomen','Lower abdomen','anterior','M145 331 L255 331 L257 395 L200 426 L143 395 Z',200,368,false,true],
  ['upper_back','Upper back','posterior','M143 164 L200 156 L257 164 L263 233 L137 233 Z',200,195,false,true],
  ['mid_back','Mid back','posterior','M140 236 L260 236 L252 320 L148 320 Z',200,275,false,true],
  ['lumbar','Low back','posterior','M146 324 L254 324 L258 394 L200 416 L142 394 Z',200,363,false,true],
  ['shoulder','Shoulder','both','M122 159 L144 165 L129 215 L103 239 L88 208 Q86 173 122 159 Z',112,190],
  ['upper_arm','Upper arm','both','M102 230 L128 217 L116 279 L103 330 L78 325 L82 285 Z',103,274],
  ['forearm','Forearm','both','M80 332 L100 336 L82 386 L65 434 L48 430 L57 381 Z',76,377],
  ['hand','Hand','both','M47 434 L65 439 L60 466 L47 489 L34 487 L29 473 L18 470 L24 451 Z',44,460],
  ['hip','Pelvis / hip','both','M144 398 L180 408 L200 426 L220 408 L256 398 L265 455 L248 484 L212 477 L200 465 L188 477 L152 484 L135 455 Z',200,443,false,true],
  ['hip','Hip','both','M146 401 L177 409 L188 439 L179 476 L143 482 L133 454 Z',158,442],
  ['anterior_thigh','Anterior thigh','anterior','M140 486 L191 482 L190 547 L178 610 L133 613 L122 558 Z',158,548],
  ['posterior_thigh','Posterior thigh','posterior','M140 486 L191 482 L190 547 L178 610 L133 613 L122 558 Z',158,548],
  ['knee','Knee','both','M134 612 L177 612 L183 637 L168 655 L139 653 L126 636 Z',155,634],
  ['calf','Calf','posterior','M134 656 L180 656 Q191 700 174 755 L163 812 L140 812 L131 751 Q119 695 134 656 Z',156,728],
  ['shin','Shin','anterior','M134 656 L180 656 L177 725 L164 812 L140 812 L129 722 Z',155,732],
  ['foot','Foot','both','M139 816 L169 816 L174 842 L185 862 Q157 884 119 870 L114 859 L131 840 Z',150,853],
];
const AOP_SILHOUETTE = 'M200 18 Q170 17 163 47 L166 87 Q169 102 180 112 L174 138 Q164 150 124 157 Q91 157 85 187 L81 242 L73 292 L66 329 L53 376 L43 430 L27 443 L16 462 Q12 475 21 475 L30 462 L26 487 Q27 496 33 490 L38 470 L35 497 Q39 504 44 493 L49 472 L45 494 Q50 500 54 487 L61 466 L59 480 Q63 484 67 469 L71 447 L70 432 L90 390 L109 340 L118 299 L130 241 L142 265 L145 300 Q133 339 136 377 L132 421 L127 463 L121 530 Q116 570 126 612 L126 644 Q119 678 126 728 L136 789 L137 816 L128 839 L114 856 Q107 871 124 878 L157 880 L185 868 Q190 861 181 850 L174 825 L172 801 L180 746 Q190 695 184 661 L183 632 L192 560 L195 489 L200 466 L205 489 L208 560 L217 632 L216 661 Q210 695 220 746 L228 801 L226 825 L219 850 Q210 861 215 868 L243 880 L276 878 Q293 871 286 856 L272 839 L263 816 L264 789 L274 728 Q281 678 274 644 L274 612 Q284 570 279 530 L273 463 L268 421 L264 377 Q267 339 255 300 L258 265 L270 241 L282 299 L291 340 L310 390 L330 432 L329 447 L333 469 Q337 484 341 480 L339 466 L346 487 Q350 500 355 494 L351 472 L356 493 Q361 504 365 497 L362 470 L367 490 Q373 496 374 487 L370 462 L379 475 Q388 475 384 462 L373 443 L357 430 L347 376 L334 329 L327 292 L319 242 L315 187 Q309 157 276 157 Q236 150 226 138 L220 112 Q231 102 234 87 L237 47 Q230 17 200 18 Z';

// Female template proportions. The same mapping is applied to every SVG path
// and centroid, so all layers, selection labels, and findings stay registered.
// This is a selectable diagram template, never inferred from client information.
const AOP_FEMALE_PROFILE = [[0,.97],[110,.97],[175,.91],[245,.97],[330,.82],[375,.90],[425,1.16],[475,1.15],[550,1.08],[630,1],[900,1]];
const AOP_FEMALE_CHEST = 'M142 208 C135 222 135 245 153 255 C171 264 192 249 193 231 M258 208 C265 222 265 245 247 255 C229 264 208 249 207 231';
function aopFemalePoint(x, y) {
  const index = AOP_FEMALE_PROFILE.findIndex(([height]) => height >= y);
  const [y1, s1] = AOP_FEMALE_PROFILE[Math.max(0, index - 1)];
  const [y2, s2] = AOP_FEMALE_PROFILE[index < 0 ? AOP_FEMALE_PROFILE.length - 1 : index];
  const t = y2 === y1 ? 0 : Math.max(0, Math.min(1, (y - y1) / (y2 - y1)));
  const scale = s1 + (s2 - s1) * t;
  // Fade the torso adjustment before the forearms to keep the limbs straight.
  const weight = Math.max(0, Math.min(1, (105 - Math.abs(x - 200)) / 30));
  return [Number((200 + (x - 200) * (1 + (scale - 1) * weight)).toFixed(3)), y];
}
function aopFemalePath(path) {
  return path.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,
    (_, x, y) => aopFemalePoint(Number(x), Number(y)).join(' '));
}
const AOP_FEMALE_SILHOUETTE = aopFemalePath(AOP_SILHOUETTE);

// ── FULL REGION CATALOG ────────────────────────────────────────────────────
function aopMirrorPath(path) {
  let i = 0;
  return path.replace(/-?\d+(?:\.\d+)?/g, n => String(i++ % 2 ? Number(n) : 400 - Number(n)));
}
function aopCatalog(rows, group, layer) {
  return rows.flatMap(([key, name, view, path, x, y, deep = false, midline = false]) =>
    (midline ? ['midline'] : ['R', 'L']).map(side => {
      const mirror = side !== 'midline' && side === (view === 'posterior' ? 'R' : 'L');
      return Object.freeze({
        id: `${layer === 'skeletal' ? 'bone' : layer}.${key}.${side}`,
        name, group, side, layer, view, path: mirror ? aopMirrorPath(path) : path,
        centroid: Object.freeze([mirror ? 400 - x : x, y]), deep,
        // Internal rendering metadata permits <use> without duplicating geometry.
        shape: `${layer}-${key}-${midline ? 'center' : 'pair'}`, sourcePath: path,
      });
    })
  );
}
const ANATOMY = Object.freeze([
  ...aopCatalog(AOP_SURFACE_PATHS, 'Surface zones', 'surface'),
  ...Object.entries(AOP_PATHS).flatMap(([group, rows]) => aopCatalog(rows, group, 'muscle')),
  ...aopCatalog(AOP_BONE_PATHS, 'Skeletal landmarks', 'skeletal'),
]);
const LEGACY_REGION_MAP = Object.freeze({
  head: 'surface.head.midline', neck: 'surface.posterior_neck.midline',
  shoulderL: 'muscle.upper_trapezius.L', shoulderR: 'muscle.upper_trapezius.R',
  chest: 'surface.chest.midline', armL: 'surface.upper_arm.L', armR: 'surface.upper_arm.R',
  abdomen: 'surface.upper_abdomen.midline', pelvis: 'surface.hip.midline',
  thighL: 'surface.anterior_thigh.L', thighR: 'surface.anterior_thigh.R',
  kneeL: 'bone.patella.L', kneeR: 'bone.patella.R', calfL: 'surface.calf.L', calfR: 'surface.calf.R',
});

// ── STATELESS HELPERS / SHARED CONSTANTS ────────────────────────────────────
const AOP_BY_ID = new Map(ANATOMY.map(r => [r.id, r]));
const AOP_SHAPES = [...new Map(ANATOMY.map(r => [r.shape, r.sourcePath])).entries()];
const AOP_FEMALE_ANATOMY = Object.freeze(ANATOMY.map(r => Object.freeze({ ...r,
  path: aopFemalePath(r.path), sourcePath: aopFemalePath(r.sourcePath),
  centroid: Object.freeze(aopFemalePoint(...r.centroid)),
})));
const AOP_FEMALE_BY_ID = new Map(AOP_FEMALE_ANATOMY.map(r => [r.id, r]));
const AOP_FEMALE_SHAPES = AOP_SHAPES.map(([id, path]) => [id, aopFemalePath(path)]);
const AOP_LEVELS = {
  mild: { name: 'Mild', rank: 1, ink: '#8A7A1E', fill: '#F6ECD4' },
  mod: { name: 'Moderate', rank: 2, ink: '#9A6A16', fill: '#F3E3C6' },
  severe: { name: 'Severe', rank: 3, ink: '#A23C37', fill: '#F6E1DE' },
};
const AOP_QUICK = ['Hypertonicity', 'Trigger point', 'Restricted ROM', 'Tenderness', 'Adhesion', 'Spasm', 'Weakness', 'Referral pattern'];
const AOP_SIDE = { L: 'Patient left', R: 'Patient right', midline: 'Midline' };
const AOP_LAYERS = ['surface', 'muscle', 'skeletal'];
const AOP_DEFAULT_CAMERA = { k: 1, x: 0, y: 0 };
const AOP_EMPTY = [];
let aopSequence = 0;
function aopId() {
  return globalThis.crypto?.randomUUID?.() || `aop-${Date.now().toString(36)}-${++aopSequence}`;
}
function aopNormalize(f) {
  const regionId = LEGACY_REGION_MAP[f.regionId] || f.regionId;
  const r = AOP_BY_ID.get(regionId);
  return { ...f, regionId, side: r?.side || f.side,
    view: r && r.view !== 'both' ? r.view : f.view === 'posterior' ? 'posterior' : 'anterior' };
}
function aopPoint(r, view) {
  return [r.view === 'both' && view === 'posterior' ? 400 - r.centroid[0] : r.centroid[0], r.centroid[1]];
}
function aopTransform(r, view) {
  return r.side !== 'midline' && r.side === (view === 'posterior' ? 'R' : 'L') ? 'translate(400 0) scale(-1 1)' : undefined;
}
function aopClamp(c) {
  const k = Math.max(1, Math.min(4, c.k));
  return { k, x: Math.max(400 - 400 * k, Math.min(0, c.x)), y: Math.max(900 - 900 * k, Math.min(0, c.y)) };
}
function aopZoom(c, k, p = { x: 200, y: 450 }) {
  k = Math.max(1, Math.min(4, k));
  return aopClamp({ k, x: p.x - (p.x - c.x) * k / c.k, y: p.y - (p.y - c.y) * k / c.k });
}
function aopMatches(r, q) {
  return `${r.name} ${r.group} ${r.id} ${AOP_SIDE[r.side]}`.toLowerCase().includes(q);
}
function aopPinned(group, selectedId, advance = false) {
  const i = group.findIndex(f => f.id === selectedId);
  if (i >= 0) return group[(i + (advance ? 1 : 0)) % group.length];
  return group.reduce((worst, f) => !worst || (AOP_LEVELS[f.sev]?.rank || 1) >= (AOP_LEVELS[worst.sev]?.rank || 1) ? f : worst, null);
}
function aopTime(ts) {
  const d = new Date(ts);
  return Number.isFinite(d.getTime()) ? d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'Time unavailable';
}
function AopIconButton({ title, children, ...props }) {
  return <button type="button" className="aop-icon" aria-label={title} title={title} {...props}>{children}</button>;
}
function AopRegion({ region: r, uid, view, active, severity, match, dim, onSelect, onHover, onFocus }) {
  const fill = active ? 'var(--pine)' : severity ? AOP_LEVELS[severity]?.fill : r.layer === 'skeletal' ? '#F2E7CE' : r.layer === 'surface' ? '#E8F0EB' : '#BDD1C6';
  return <g data-region={r.id} role="button" tabIndex={0}
    aria-label={`${r.name}, ${AOP_SIDE[r.side]}, ${r.layer}${r.deep ? ', deep' : ''}${severity ? `, ${AOP_LEVELS[severity]?.name} finding` : ''}`}
    aria-pressed={active} className={`aop-region${match ? ' aop-match' : ''}${active ? ' aop-active' : ''}`}
    opacity={dim ? 0.25 : 1} onClick={e => { if (e.detail === 0) onSelect(r); }}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onSelect(r); } }}
    onFocus={() => onFocus(r)} onPointerEnter={() => onHover(r)} onPointerLeave={() => onHover(null)} onBlur={() => onHover(null)}>
    <title>{`${r.name} · ${AOP_SIDE[r.side]} · ${r.group}${r.deep ? ' · Deep' : ''}`}</title>
    <use href={`#${uid}-${r.shape}`} transform={aopTransform(r, view)} fill={fill}
      stroke={active ? 'var(--pine-deep)' : match ? 'var(--gold)' : r.layer === 'skeletal' ? '#B19C72' : '#6C9383'}
      strokeWidth={active || match ? 2 : 0.8} strokeDasharray={r.deep ? '3 2' : undefined} />
    {r.deep && <use href={`#${uid}-${r.shape}`} transform={aopTransform(r, view)} fill={`url(#${uid}-hatch)`} pointerEvents="none" />}
  </g>;
}

// ── SCOPED STYLES ──────────────────────────────────────────────────────────
const AOP_CSS = `
.aop-body{--pine:#14554A;--pine-deep:#0E3D35;--pine-soft:#2C7264;--gold:#B88A32;--gold-soft:#D6B25E;--sage:#E8F0EB;--paper:#F4F6F2;--ink:#16211F;--muted:#5F6F6A;--border:#E3E8E2;--rose:#A23C37;--target:44px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:var(--paper);border:1px solid var(--border);border-radius:22px;padding:24px;max-width:1440px;margin:auto;line-height:1.5;color-scheme:light}
.aop-body.aop-compact{--target:52px;padding:14px}
.aop-body *{box-sizing:border-box}
.aop-body button,.aop-body input,.aop-body textarea,.aop-body select{font:inherit;color:inherit}
.aop-body button,.aop-body select,.aop-body input:not([type=range]),.aop-body summary{min-height:var(--target)}
.aop-body button,.aop-body summary{cursor:pointer}
.aop-body button{min-width:var(--target);border:1px solid var(--border);border-radius:10px;background:#fff;padding:9px 13px;line-height:1.25}
.aop-body button:hover:not(:disabled){border-color:var(--pine-soft);background:var(--sage)}
.aop-body button:disabled{opacity:.45;cursor:not-allowed}
.aop-body button[aria-pressed=true],.aop-body .aop-primary{background:var(--pine);border-color:var(--pine);color:#fff}
.aop-body .aop-primary:hover:not(:disabled){background:var(--pine-deep);color:#fff}
.aop-body :focus-visible{outline:3px solid var(--gold);outline-offset:3px}
.aop-body .aop-region:focus-visible{outline:none;filter:none}
.aop-body .aop-region:focus-visible use{stroke:var(--gold);stroke-width:4}
.aop-body h2,.aop-body h3,.aop-body p{margin:0}
.aop-body h2{font-family:Fraunces,Georgia,serif;font-size:30px;font-weight:500;line-height:1.2}
.aop-body h3{font-size:16px}
.aop-body .aop-eyebrow{font-size:11px;letter-spacing:.13em;font-weight:700;text-transform:uppercase;color:var(--pine-soft)}
.aop-body .aop-muted{font-size:13px;color:var(--muted)}
.aop-body .aop-top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;flex-wrap:wrap}
.aop-body .aop-top h2{margin:5px 0 7px}
.aop-body .aop-client{text-align:right;max-width:340px;overflow-wrap:anywhere}
.aop-body .aop-layout{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(300px,1fr);gap:18px;align-items:start}
.aop-body .aop-card{background:white;border:1px solid var(--border);border-radius:16px;min-width:0;overflow:hidden}
.aop-body .aop-controls{padding:16px;border-bottom:1px solid var(--border);display:grid;gap:12px}
.aop-body .aop-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.aop-body .aop-between{justify-content:space-between}
.aop-body .aop-tabs{display:flex;gap:6px;flex-wrap:wrap}
.aop-body .aop-tabs button{text-transform:capitalize;font-size:13px}
.aop-body .aop-search{display:flex;align-items:center;gap:8px;border:1px solid var(--border);border-radius:10px;padding:0 10px}
.aop-body .aop-search input{border:0;background:transparent;min-width:0;width:100%;outline-offset:0}
.aop-body .aop-search .aop-icon{border:0;padding:0}
.aop-body .aop-results{max-height:220px;overflow:auto;display:grid;gap:5px;overscroll-behavior:contain}
.aop-body .aop-results button{text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:13px}
.aop-body .aop-results small{font-size:11px;text-transform:capitalize;white-space:nowrap}
.aop-body .aop-stage{position:relative;background:var(--paper);overflow:hidden}
.aop-body .aop-svg{display:block;width:100%;height:760px;max-height:78vh;min-height:450px;touch-action:none;user-select:none;-webkit-user-select:none}
.aop-body .aop-region{cursor:pointer}
.aop-body .aop-stage-top{position:absolute;z-index:1;top:12px;left:14px;right:14px;display:flex;justify-content:space-between;pointer-events:none;font-size:12px;color:var(--muted)}
.aop-body .aop-zoom{display:flex;gap:6px;align-items:center;justify-content:center;padding:12px;border-top:1px solid var(--border);flex-wrap:wrap}
.aop-body .aop-icon{display:inline-flex;align-items:center;justify-content:center;padding:10px}
.aop-body .aop-icon svg{width:18px;height:18px;flex-shrink:0}
.aop-body .aop-tooltip{position:absolute;bottom:12px;left:12px;right:12px;pointer-events:none;border:1px solid var(--border);border-radius:10px;background:#fff;padding:10px 13px;font-size:13px}
.aop-body .aop-note-line{padding:12px 16px;border-top:1px solid var(--border);font-size:12px;color:var(--muted)}
.aop-body .aop-inspector{padding:20px;display:grid;gap:16px}
.aop-body .aop-inspector h2{font-size:28px;overflow-wrap:anywhere}
.aop-body .aop-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}
.aop-body .aop-badge{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:6px;padding:3px 7px;font-size:11px;text-transform:capitalize;white-space:nowrap}
.aop-body .aop-deep{border-style:dashed;color:var(--pine)}
.aop-body .aop-label{font-size:12px;font-weight:650;display:block;margin-bottom:7px}
.aop-body fieldset{border:0;padding:0;margin:0;min-width:0}
.aop-body legend{padding:0}
.aop-body .aop-severity{display:flex;gap:6px}
.aop-body .aop-severity button{flex:1;padding:9px 6px;font-size:13px}
.aop-body .aop-severity button[aria-pressed=true]{outline:2px solid currentColor;outline-offset:-3px}
.aop-body textarea{resize:vertical;width:100%;min-height:106px;border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--paper)}
.aop-body select{border:1px solid var(--border);border-radius:9px;background:white;padding:8px;width:100%}
.aop-body .aop-chips{display:flex;flex-wrap:wrap;gap:6px}
.aop-body .aop-chips button{font-size:12px;padding:8px 10px}
.aop-body .aop-actions{display:grid;grid-template-columns:1fr auto;gap:8px}
.aop-body .aop-actions button{display:flex;gap:7px;align-items:center;justify-content:center}
.aop-body .aop-findings-head{padding:16px 20px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.aop-body .aop-findings{padding:0 14px 16px;max-height:430px;overflow:auto;overscroll-behavior:contain}
.aop-body .aop-findings h4{text-transform:uppercase;letter-spacing:.12em;font-size:10px;color:var(--muted);margin:15px 6px 9px}
.aop-body .aop-finding{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;border:1px solid var(--border);border-radius:12px;padding:9px;margin-bottom:8px}
.aop-body .aop-finding[data-selected=true]{border-color:var(--pine);background:var(--sage)}
.aop-body .aop-finding-main{text-align:left;border:0;background:transparent;overflow-wrap:anywhere;display:grid;gap:7px;padding:4px}
.aop-body .aop-finding-main strong{font-size:13px}
.aop-body .aop-finding-main .aop-finding-note{font-size:13px;white-space:pre-wrap}
.aop-body .aop-finding .aop-icon{align-self:start;color:var(--rose)}
.aop-body .aop-empty{padding:20px;font-size:13px;color:var(--muted)}
.aop-body .aop-status{font-size:12px;color:var(--pine);min-height:18px;margin-top:12px}
.aop-body .aop-dialog{border:1px solid var(--border);border-radius:16px;max-width:420px;width:calc(100% - 32px);padding:24px;color:var(--ink);background:#fff;font:inherit}
.aop-body .aop-dialog::backdrop{background:rgb(14 61 53 / .3)}
.aop-body .aop-dialog p{margin:12px 0 20px}
.aop-body .aop-danger{color:var(--rose)}
.aop-body .aop-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.aop-body details summary{display:flex;align-items:center;font-size:13px;color:var(--pine)}
.aop-body .aop-pin{cursor:pointer;filter:drop-shadow(0 1px 2px rgb(22 33 31 / .15))}
.aop-body .aop-pin:focus-visible circle{stroke:var(--gold);stroke-width:3}
@media(max-width:800px){.aop-body{padding:12px}.aop-body .aop-layout{grid-template-columns:minmax(0,1fr)}.aop-body .aop-top{align-items:flex-start}.aop-body .aop-client{text-align:left}.aop-body .aop-svg{height:650px;max-height:75vh}.aop-body .aop-inspector{padding:16px}.aop-body .aop-findings{max-height:360px}}
@media(prefers-reduced-motion:reduce){.aop-body *{scroll-behavior:auto}}
`;

// ── PANEL ─────────────────────────────────────────────────────────────────
function BodyAssessment({ findings = AOP_EMPTY, onChange, client, onDictate, initialView = 'anterior', initialBodyType = 'male', compact = false }) {
  const uid = `aop-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [view, setView] = useState(initialView === 'posterior' ? 'posterior' : 'anterior');
  const [bodyType, setBodyType] = useState(initialBodyType === 'female' ? 'female' : 'male');
  const atlas = bodyType === 'female' ? AOP_FEMALE_ANATOMY : ANATOMY;
  const atlasById = bodyType === 'female' ? AOP_FEMALE_BY_ID : AOP_BY_ID;
  const shapes = bodyType === 'female' ? AOP_FEMALE_SHAPES : AOP_SHAPES;
  const [layers, setLayers] = useState({ surface: true, muscle: true, skeletal: false });
  const [activeId, setActiveId] = useState(null);
  const [findingId, setFindingId] = useState(null);
  const [sev, setSev] = useState('mild');
  const [note, setNote] = useState('');
  const [pain, setPain] = useState('');
  const [query, setQuery] = useState('');
  const [onlyMatches, setOnlyMatches] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [camera, setCamera] = useState(AOP_DEFAULT_CAMERA);
  const [pixelScale, setPixelScale] = useState(1);
  const [status, setStatus] = useState('');
  const svgRef = useRef(null);
  const dialogRef = useRef(null);
  const clearRef = useRef(null);
  const cancelRef = useRef(null);
  const cameraRef = useRef(camera);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const lastTap = useRef(null);
  const suppressClick = useRef(false);
  const displayed = useMemo(() => findings.map(aopNormalize), [findings]);
  const findingsRef = useRef(displayed);
  // The host is the only source of truth, including when it declines an update.
  findingsRef.current = displayed;
  const active = atlasById.get(activeId);
  const q = query.trim().toLowerCase();
  const matches = useMemo(() => q ? atlas.filter(r => aopMatches(r, q)) : [], [q, atlas]);
  const visible = atlas.filter(r => (r.view === view || r.view === 'both') && (!q || !onlyMatches || aopMatches(r, q)));
  const severityByRegion = useMemo(() => {
    const map = new Map();
    for (const f of displayed) {
      const level = AOP_LEVELS[f.sev] ? f.sev : 'mild';
      if (!map.has(f.regionId) || AOP_LEVELS[level].rank > AOP_LEVELS[map.get(f.regionId)].rank) map.set(f.regionId, level);
    }
    return map;
  }, [displayed]);
  const pins = displayed.filter(f => f.view === view && atlasById.has(f.regionId));
  const pinGroups = useMemo(() => {
    const groups = new Map();
    for (const f of pins) groups.set(f.regionId, [...(groups.get(f.regionId) || []), f]);
    return [...groups.entries()];
  }, [displayed, view]);
  const activeVisible = active && (active.view === view || active.view === 'both') && layers[active.layer] && (!onlyMatches || !q || aopMatches(active, q));

  function moveCamera(next) {
    const value = aopClamp(next);
    cameraRef.current = value;
    setCamera(value);
  }
  function resetView() { moveCamera(AOP_DEFAULT_CAMERA); }
  function changeBodyType(next) {
    pointers.current.clear(); gesture.current = null; lastTap.current = null;
    setBodyType(next); setHovered(null); resetView();
    setStatus(`${next === 'female' ? 'Female' : 'Male'} diagram selected.`);
  }
  function changeView(next) {
    pointers.current.clear(); gesture.current = null; lastTap.current = null;
    setView(next); setHovered(null); resetView();
  }
  function zoomTo(r, nextView = view) {
    const [x, y] = aopPoint(r, nextView);
    moveCamera({ k: 3, x: 200 - x * 3, y: 450 - y * 3 });
  }
  function selectRegion(r, reveal = false) {
    setActiveId(r.id); setFindingId(null);
    if (r.id !== activeId) { setNote(''); setPain(''); }
    if (reveal) {
      const nextView = r.view === 'both' ? view : r.view;
      if (nextView !== view) changeView(nextView);
      setLayers(old => ({ ...old, [r.layer]: true }));
      zoomTo(r, nextView);
    }
    setStatus(`${r.name}, ${AOP_SIDE[r.side]} selected.`);
  }
  function chooseFinding(f) {
    const r = atlasById.get(f.regionId);
    if (r) {
      selectRegion(r);
      if (view !== f.view) changeView(f.view);
      setLayers(old => ({ ...old, [r.layer]: true }));
      zoomTo(r, f.view);
    }
    setFindingId(f.id);
    setStatus(`Selected finding: ${f.note || f.label}.`);
  }
  function commit(next) { onChange(next); }
  function addFinding(quick) {
    if (!active || typeof onChange !== 'function') return;
    const f = {
      id: aopId(), regionId: active.id, label: active.name, side: active.side, sev,
      note: quick ? `${quick}${note.trim() ? ` — ${note.trim()}` : ''}` : note.trim(),
      ...(pain === '' ? {} : { pain: Number(pain) }),
      view: active.view === 'both' ? view : active.view, ts: Date.now(),
    };
    commit([...findingsRef.current, f]);
    setFindingId(f.id); setNote(''); setPain('');
    setStatus(`${AOP_LEVELS[sev].name} finding added to ${active.name}, ${AOP_SIDE[active.side]}.`);
  }
  const delRef = useRef(null);
  const [pendingDel, setPendingDel] = useState(null);
  function removeFinding(id) {
    commit(findingsRef.current.filter(f => f.id !== id));
    if (findingId === id) setFindingId(null);
    setStatus('Finding deleted.');
  }
  function undoLast() {
    const last = findingsRef.current.reduce((a, f) => !a || (Number(f.ts) || 0) >= (Number(a.ts) || 0) ? f : a, null);
    if (last) { removeFinding(last.id); setStatus('Last finding removed.'); }
  }
  function svgPoint(clientX, clientY) {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const p = svgRef.current.createSVGPoint(); p.x = clientX; p.y = clientY;
    return p.matrixTransform(matrix.inverse());
  }
  function beginGesture() {
    const ps = [...pointers.current.values()];
    if (!ps.length) { gesture.current = null; return; }
    const a = ps[0].point, b = ps[1]?.point;
    gesture.current = {
      camera: cameraRef.current, center: b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : a,
      distance: b ? Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)) : 0,
    };
  }
  function pointerDown(e) {
    if (e.button !== 0 && e.pointerType !== 'touch') return;
    // preventDefault also prevents iOS text selection; focus is restored explicitly.
    e.preventDefault(); suppressClick.current = false;
    const element = e.target.closest?.('[data-region],[data-pin]');
    const regionId = element?.getAttribute('data-region');
    const pinId = element?.getAttribute('data-pin');
    pointers.current.set(e.pointerId, { point: svgPoint(e.clientX, e.clientY), startX: e.clientX, startY: e.clientY, regionId, pinId, moved: false });
    if (pointers.current.size > 1) for (const p of pointers.current.values()) p.moved = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    beginGesture();
  }
  function pointerMove(e) {
    const pointer = pointers.current.get(e.pointerId);
    if (!pointer) return;
    pointer.point = svgPoint(e.clientX, e.clientY);
    if (Math.hypot(e.clientX - pointer.startX, e.clientY - pointer.startY) > 6) pointer.moved = true;
    const ps = [...pointers.current.values()], g = gesture.current;
    if (!g || (!pointer.moved && ps.length === 1)) return;
    const a = ps[0].point, b = ps[1]?.point;
    const center = b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : a;
    const k = b && g.distance ? g.camera.k * Math.hypot(a.x - b.x, a.y - b.y) / g.distance : g.camera.k;
    const z = aopZoom(g.camera, k, g.center);
    moveCamera({ ...z, x: z.x + center.x - g.center.x, y: z.y + center.y - g.center.y });
  }
  function pointerEnd(e, cancelled = false) {
    const p = pointers.current.get(e.pointerId);
    if (!p) return;
    pointers.current.delete(e.pointerId);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    suppressClick.current = cancelled || p.moved;
    if (!cancelled && !p.moved && pointers.current.size === 0) {
      if (p.pinId) {
        const group = pinGroups.find(([id]) => id === p.pinId)?.[1] || [];
        const f = aopPinned(group, findingId, true);
        if (f) chooseFinding(f);
      } else if (p.regionId) {
        const r = atlasById.get(p.regionId);
        if (r) {
          const now = Date.now();
          selectRegion(r);
          if (lastTap.current?.id === r.id && now - lastTap.current.ts < 350) {
            zoomTo(r); lastTap.current = null;
          } else lastTap.current = { id: r.id, ts: now };
        }
      }
      svgRef.current?.focus({ preventScroll: true });
    }
    beginGesture();
  }
  function focusRegion(r) {
    setHovered(r);
    const c = cameraRef.current, [x, y] = aopPoint(r, view);
    if (x * c.k + c.x < 28 || x * c.k + c.x > 372 || y * c.k + c.y < 28 || y * c.k + c.y > 872) {
      moveCamera({ ...c, x: 200 - x * c.k, y: 450 - y * c.k });
    }
  }
  function svgKeyboard(e) {
    const c = cameraRef.current, step = e.shiftKey ? 60 : 20;
    const delta = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (delta) { e.preventDefault(); moveCamera({ ...c, x: c.x + delta[0], y: c.y + delta[1] }); }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); moveCamera(aopZoom(c, c.k + .25)); }
    else if (e.key === '-') { e.preventDefault(); moveCamera(aopZoom(c, c.k - .25)); }
    else if (e.key === 'Home') { e.preventDefault(); resetView(); }
  }
  useEffect(() => {
    const svg = svgRef.current;
    const onWheel = e => { e.preventDefault(); const delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1); moveCamera(aopZoom(cameraRef.current, cameraRef.current.k * Math.exp(-delta * .002), svgPoint(e.clientX, e.clientY))); };
    const resize = () => { const m = svg.getScreenCTM(); if (m) setPixelScale(Math.max(.1, Math.hypot(m.a, m.b))); };
    svg.addEventListener('wheel', onWheel, { passive: false });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
    observer?.observe(svg); resize();
    return () => { svg.removeEventListener('wheel', onWheel); observer?.disconnect(); };
  }, []);
  useEffect(() => {
    // Prevent unsaved text and selection carrying over when the host changes client.
    setActiveId(null); setFindingId(null); setNote(''); setPain(''); setSev('mild');
    setQuery(''); setHovered(null); setStatus('');
    pointers.current.clear(); gesture.current = null; lastTap.current = null;
    cameraRef.current = AOP_DEFAULT_CAMERA; setCamera(AOP_DEFAULT_CAMERA);
    dialogRef.current?.close();
  }, [client?.id]);
  useEffect(() => {
    if (findingId && !displayed.some(f => f.id === findingId)) setFindingId(null);
  }, [displayed, findingId]);
  const editable = typeof onChange === 'function';
  const matchCount = v => matches.filter(r => r.view === v || r.view === 'both').length;
  const pinScale = 1 / (camera.k * pixelScale);

  return <section className={`aop-body${compact ? ' aop-compact' : ''}`} aria-label="Body assessment">
    <style>{AOP_CSS}</style>
    <header className="aop-top">
      <div><div className="aop-eyebrow">AOP Office Solutions · Art of Palpation</div><h2>Body assessment</h2><p className="aop-muted">Map what you feel. Document with precision.</p></div>
      {client && <div className="aop-client"><div className="aop-eyebrow">{client.type === 'patient' ? 'Patient' : 'Client'}</div><strong>{client.name}</strong>{client.referral && <p className="aop-muted">Referral: {client.referral}</p>}</div>}
    </header>
    <div className="aop-layout">
      <div className="aop-card">
        <div className="aop-controls">
          <div className="aop-row aop-between">
            <div className="aop-tabs" role="group" aria-label="Anatomical view">{['anterior','posterior'].map(v => <button type="button" key={v} aria-pressed={view === v} onClick={() => changeView(v)}>{v}{q ? ` (${matchCount(v)})` : ''}</button>)}</div>
            <span className="aop-muted">Patient’s perspective</span>
          </div>
          <div className="aop-row aop-between"><span className="aop-muted">Diagram</span><div className="aop-tabs" role="group" aria-label="Body diagram template">{['male','female'].map(type => <button type="button" key={type} aria-pressed={bodyType === type} onClick={() => changeBodyType(type)}>{type === 'female' ? 'Female' : 'Male'}</button>)}</div></div>
          <div className="aop-tabs" role="group" aria-label="Anatomical layers">{AOP_LAYERS.map(layer => <button type="button" key={layer} aria-pressed={layers[layer]} onClick={() => setLayers(old => ({ ...old, [layer]: !old[layer] }))}>{layer === 'muscle' ? 'Muscles' : layer}</button>)}</div>
          <div className="aop-search"><Search size={18} aria-hidden="true" /><label className="aop-sr" htmlFor={`${uid}-search`}>Search structures across both views</label><input id={`${uid}-search`} type="search" autoComplete="off" value={query} placeholder="Search muscles, landmarks, regions…" onChange={e => setQuery(e.target.value)} />{query && <AopIconButton title="Clear search" onClick={() => setQuery('')}><X /></AopIconButton>}</div>
          {q ? <><div className="aop-row aop-between"><span className="aop-muted" role="status">{matches.length} matching structures</span><button type="button" aria-pressed={onlyMatches} onClick={() => setOnlyMatches(x => !x)}>Only matches</button></div><div className="aop-results" aria-label="Search results">{matches.map(r => <button type="button" key={r.id} aria-pressed={activeId === r.id} onClick={() => selectRegion(r, true)}><span>{r.name}{r.deep ? ' · Deep' : ''}</span><small>{AOP_SIDE[r.side]} · {r.view}</small></button>)}{!matches.length && <p className="aop-muted">No structures found. Try “trap”, “gastroc”, or “supinator”.</p>}</div></> : <details><summary>Browse all {atlas.length} structures</summary><div className="aop-results">{atlas.map(r => <button type="button" key={r.id} onClick={() => selectRegion(r, true)}><span>{r.name}{r.deep ? ' · Deep' : ''}</span><small>{AOP_SIDE[r.side]} · {r.view}</small></button>)}</div></details>}
        </div>
        <div className="aop-stage">
          <div className="aop-stage-top"><span>{bodyType.toUpperCase()} · {view.toUpperCase()}</span><span>{Math.round(camera.k * 100)}%</span></div>
          <svg ref={svgRef} className="aop-svg" viewBox="0 0 400 900" tabIndex={0} role="group"
            aria-label={`${bodyType} ${view} body map`} aria-describedby={`${uid}-help`}
            onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={e => pointerEnd(e)}
            onPointerCancel={e => pointerEnd(e, true)} onLostPointerCapture={e => { if (pointers.current.has(e.pointerId)) pointerEnd(e, true); }}
            onClickCapture={e => { if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); suppressClick.current = false; } }} onKeyDown={svgKeyboard}>
            <defs>
              {shapes.map(([id, path]) => <path id={`${uid}-${id}`} key={id} d={path} />)}
              <pattern id={`${uid}-hatch`} patternUnits="userSpaceOnUse" width="6" height="6"><path d="M0 6 L6 0" stroke="#577E70" strokeWidth=".7" opacity=".6" /></pattern>
            </defs>
            <g transform={`translate(${camera.x} ${camera.y}) scale(${camera.k})`}>
              {AOP_LAYERS.map(layer => <g key={layer} data-layer={layer} style={{ display: layers[layer] ? undefined : 'none' }}>
                {layer === 'surface' && <path data-silhouette={bodyType} d={bodyType === 'female' ? AOP_FEMALE_SILHOUETTE : AOP_SILHOUETTE} fill="#EDF1EA" stroke="#93A99D" strokeWidth="1.2" pointerEvents="none" />}
                {/* Enlarged strokes are behind all painted regions in each layer.
                    This prevents a neighbor's hit-slop from stealing an interior tap. */}
                <g aria-hidden="true">{visible.filter(r => r.layer === layer).map(r => <use key={r.id} data-region={r.id} href={`#${uid}-${r.shape}`} transform={aopTransform(r, view)} fill="none" stroke="transparent" strokeWidth="10" pointerEvents="stroke" />)}</g>
                {visible.filter(r => r.layer === layer).map(r => <AopRegion key={r.id} region={r} uid={uid} view={view} active={activeId === r.id} severity={severityByRegion.get(r.id)} match={!!q && aopMatches(r,q)} dim={!!q && !aopMatches(r,q)} onSelect={selectRegion} onHover={setHovered} onFocus={focusRegion} />)}
                {layer === 'surface' && bodyType === 'female' && view === 'anterior' && !onlyMatches && <path data-female-contours="true" d={aopFemalePath(AOP_FEMALE_CHEST)} fill="none" stroke="#93A99D" strokeWidth="1.2" pointerEvents="none" aria-hidden="true" />}
              </g>)}
              {activeVisible && (() => {
                const [x,y] = aopPoint(active, view), label = `${active.name} · ${active.side === 'midline' ? 'Midline' : active.side}`;
                const width = Math.min(300, label.length * 5.2 + 18), lx = Math.max(width/2+4, Math.min(396-width/2, x));
                return <g pointerEvents="none" aria-hidden="true"><rect x={lx-width/2} y={y-27} width={width} height={18} rx="5" fill="var(--pine)" /><text x={lx} y={y-14} textAnchor="middle" fontSize="9" fontFamily="Inter,system-ui,sans-serif" fill="white">{label}</text></g>;
              })()}
              {pinGroups.map(([regionId, group]) => {
                const r = atlasById.get(regionId), [x,y] = aopPoint(r, view);
                const selected = group.find(f => f.id === findingId), f = aopPinned(group, findingId);
                const level = AOP_LEVELS[f.sev] || AOP_LEVELS.mild;
                return <g className="aop-pin" key={regionId} data-pin={regionId} transform={`translate(${x} ${y}) scale(${pinScale})`} role="button" tabIndex={0}
                  aria-label={`${group.length} finding${group.length === 1 ? '' : 's'}: ${r.name}, ${AOP_SIDE[r.side]}. ${selected ? 'Selected: ' : ''}${f.note || level.name}. Activate to ${group.length > 1 ? 'cycle findings' : 'select'}.`}
                  aria-pressed={!!selected} onClick={e => { if (e.detail === 0) { chooseFinding(aopPinned(group, findingId, true)); } }}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); chooseFinding(aopPinned(group, findingId, true)); } }}>
                  <circle r={compact ? 26 : 22} fill="transparent" />
                  <circle r="10" fill={level.ink} stroke={selected ? 'var(--pine-deep)' : '#fff'} strokeWidth={selected ? 3 : 2} />
                  <text textAnchor="middle" y="3.5" fill="white" fontSize="10" fontWeight="700" pointerEvents="none">{group.length > 1 ? group.length : AOP_LEVELS[f.sev]?.name.charAt(0) || 'M'}</text>
                </g>;
              })}
            </g>
            <g pointerEvents="none" aria-hidden="true" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" fill="var(--pine)"><text x="63" y="132">{view === 'anterior' ? 'R' : 'L'}</text><text x="327" y="132">{view === 'anterior' ? 'L' : 'R'}</text></g>
          </svg>
          {hovered && <div className="aop-tooltip" role="tooltip"><strong>{hovered.name}</strong> · {AOP_SIDE[hovered.side]}<div className="aop-muted">{hovered.group}{hovered.deep ? ' · Deep structure' : ''}</div></div>}
        </div>
        <div className="aop-zoom">
          <AopIconButton title="Zoom out" disabled={camera.k <= 1} onClick={() => moveCamera(aopZoom(cameraRef.current, cameraRef.current.k-.25))}><Minus /></AopIconButton>
          <span className="aop-muted">{camera.k.toFixed(2)}×</span>
          <AopIconButton title="Zoom in" disabled={camera.k >= 4} onClick={() => moveCamera(aopZoom(cameraRef.current, cameraRef.current.k+.25))}><Plus /></AopIconButton>
          <AopIconButton title="Zoom to selected structure" disabled={!active} onClick={() => selectRegion(active,true)}><LocateFixed /></AopIconButton>
          <AopIconButton title="Reset view" onClick={resetView}><RotateCcw /></AopIconButton>
        </div>
        <p className="aop-note-line" id={`${uid}-help`}>Pinch or scroll to zoom · Drag to pan · Double-tap a region to focus. Keyboard: Tab to regions, Enter to select, arrows to pan, +/− to zoom, Home to reset.</p>
        <div className="aop-note-line">Hatching = deep dissection window · Pins: Mild / Moderate / Severe. Stacked pins show a count; activate again to cycle. Plantar fascia uses a labeled plantar projection.</div>
      </div>
      <aside className="aop-card" aria-label="Structure inspector and findings">
        <div className="aop-inspector">
          <div><div className="aop-eyebrow">Structure inspector</div><h2 style={{ marginTop: 7 }}>{active?.name || 'Select a structure'}</h2>{active ? <><p className="aop-muted" style={{ marginTop: 7 }}>{active.group}</p><div className="aop-meta"><span className="aop-badge">{AOP_SIDE[active.side]}</span><span className="aop-badge">{active.layer}</span>{active.deep && <span className="aop-badge aop-deep">Deep</span>}</div>{!activeVisible && <p className="aop-muted" style={{ marginTop: 8 }}>Selection retained. <button type="button" onClick={() => { setOnlyMatches(false); selectRegion(active,true); }}>Show structure</button></p>}</> : <p className="aop-muted" style={{ marginTop: 10 }}>Tap the body or search the atlas to begin a finding.</p>}</div>
          <fieldset disabled={!active || !editable}><legend className="aop-label">Severity</legend><div className="aop-severity">{Object.entries(AOP_LEVELS).map(([key,level]) => <button type="button" key={key} aria-pressed={sev === key} onClick={() => setSev(key)} style={{ color:level.ink, background:level.fill }}>{level.name}</button>)}</div></fieldset>
          <div><label className="aop-label" htmlFor={`${uid}-note`}>Clinical note</label><textarea id={`${uid}-note`} disabled={!active || !editable} value={note} onChange={e=>setNote(e.target.value)} placeholder="Describe tissue quality, location, and response…" /></div>
          <div><label className="aop-label" htmlFor={`${uid}-pain`}>Pain scale · optional</label><select id={`${uid}-pain`} disabled={!active || !editable} value={pain} onChange={e=>setPain(e.target.value)}><option value="">Not recorded</option>{Array.from({length:11},(_,i)=><option key={i} value={i}>{i}{i === 0 ? ' — no pain' : i === 10 ? ' — worst pain' : ''}</option>)}</select></div>
          <fieldset disabled={!active || !editable}><legend className="aop-label">Quick add · records one finding</legend><div className="aop-chips">{AOP_QUICK.map(chip=><button type="button" key={chip} onClick={()=>addFinding(chip)}>{chip}</button>)}</div></fieldset>
          <div className="aop-actions"><button type="button" className="aop-primary" disabled={!active || !editable} onClick={()=>addFinding()}><Plus size={17} aria-hidden="true" />Add finding</button><button type="button" disabled={!active || !onDictate} title={onDictate ? 'Dictate for selected structure' : 'Dictation is supplied by the host app'} onClick={()=>onDictate?.(active.id)}><Mic size={17} aria-hidden="true" />Dictate</button></div>
          {findingId && <p className="aop-muted">Selected finding is highlighted below. The editor adds a new finding.</p>}
        </div>
        <div className="aop-findings-head"><h3>Findings <span className="aop-muted">({displayed.length})</span></h3><div className="aop-row"><AopIconButton title="Undo last finding" disabled={!displayed.length || !editable} onClick={undoLast}><Undo2 /></AopIconButton><button type="button" ref={clearRef} className="aop-danger" disabled={!displayed.length || !editable} onClick={()=>{dialogRef.current.showModal();cancelRef.current?.focus();}}>Clear all</button></div></div>
        <div className="aop-findings" aria-label="Recorded findings">
          {!displayed.length && <p className="aop-empty">No findings yet. Select a structure, then add a note or a quick finding.</p>}
          {['anterior','posterior'].map(v=>{
            const group=displayed.filter(f=>f.view===v);
            return group.length ? <section key={v} aria-label={`${v} findings`}><h4>{v} · {group.length}</h4>{group.map(f=>{
              const r=atlasById.get(f.regionId), level=AOP_LEVELS[f.sev] || AOP_LEVELS.mild;
              return <article className="aop-finding" key={f.id} data-selected={findingId===f.id} data-finding-id={f.id}>
                <button type="button" className="aop-finding-main" aria-pressed={findingId===f.id} onClick={()=>chooseFinding(f)}><strong>{r?.name || f.label || f.regionId}</strong><span className="aop-row"><span className="aop-muted">{AOP_SIDE[r?.side || f.side] || 'Side unavailable'}</span><span className="aop-badge" style={{color:level.ink,background:level.fill,borderColor:level.fill}}>{level.name}</span>{f.pain !== undefined && <span className="aop-muted">Pain {f.pain}/10</span>}</span><span className="aop-finding-note">{f.note || 'No note recorded'}</span><span className="aop-muted">{aopTime(f.ts)}{!r ? ' · Unmapped region' : ''}</span></button>
                <AopIconButton title={`Delete finding: ${r?.name || f.label || f.regionId}, ${AOP_SIDE[f.side] || f.side}, ${f.note || 'no note'}`} disabled={!editable} onClick={()=>{ setPendingDel(f.id); if (delRef.current) delRef.current.showModal(); }}><Trash2 /></AopIconButton>
              </article>;
            })}</section> : null;
          })}
        </div>
      </aside>
    </div>
    <div className="aop-status" role="status" aria-live="polite">{status}</div>
    <dialog ref={dialogRef} className="aop-dialog" aria-labelledby={`${uid}-clear-title`} aria-describedby={`${uid}-clear-desc`} onClose={()=>clearRef.current?.focus()}>
      <h3 id={`${uid}-clear-title`}>Clear all findings?</h3><p id={`${uid}-clear-desc`}>This removes all {displayed.length} findings from this assessment. This action cannot be undone here.</p><div className="aop-row"><button type="button" ref={cancelRef} onClick={()=>dialogRef.current.close()}>Keep findings</button><button type="button" className="aop-danger" onClick={()=>{commit([]);setFindingId(null);setStatus('All findings cleared.');dialogRef.current.close();}}>Clear findings</button></div>
    </dialog>
    <dialog ref={delRef} className="aop-dialog" aria-labelledby={`${uid}-del-title`} onClose={()=>setPendingDel(null)}>
      <h3 id={`${uid}-del-title`}>Delete this finding?</h3><p>It will be removed from this assessment. This action cannot be undone here.</p><div className="aop-row"><button type="button" onClick={()=>delRef.current.close()}>Keep finding</button><button type="button" className="aop-danger" onClick={()=>{ if (pendingDel) removeFinding(pendingDel); delRef.current.close(); }}>Delete finding</button></div>
    </dialog>
  </section>;
}

/* ----------------------------- Modal shell ----------------------------- */
function Modal({ title, onClose, children, footer }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    const focusable = () => [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length);
    (dialog.querySelector('[data-autofocus]') || focusable()[0] || dialog).focus();
    const handle = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeRef.current(); }
      if (event.key === 'Tab') {
        const els = focusable(), first = els[0], last = els.at(-1);
        if (!first) { event.preventDefault(); return; }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    dialog.addEventListener('keydown', handle);
    return () => { dialog.removeEventListener('keydown', handle); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, []);
  return (
    <div className="scrim" onClick={onClose}>
      <div ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="mh"><h3 id={titleId}>{title}</h3><button className="iconbtn" aria-label="Close dialog" onClick={onClose}><X size={16} /></button></div>
        <div className="mb">{children}</div>
        {footer && <div className="mf">{footer}</div>}
      </div>
    </div>
  );
}
