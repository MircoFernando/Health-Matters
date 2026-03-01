// ═══════════════════════════════════════════════════════════════════════════════
// ManagerDashboard.jsx
//
// Self-contained Manager Dashboard — single file, zero external UI dependencies.
// Runs as one React component; no routing, no shadcn, no Tailwind required.
//
// STACK:  React (useState, useRef) · Inline CSS-in-JS · Google Fonts via @import
//
// PAGES (switched via `page` state in root component):
//   overview  → KPIs, recent referrals, team health snapshot, quick actions
//   team      → Team member cards with referral counts
//   referral  → Referral list + create form + detail modal
//   budget    → Spend overview (sample data, wire to backend later)
//   profile   → Personal details + notification preferences
//
// SAMPLE DATA:
//   All data is hardcoded for now. When the backend is confirmed, replace
//   REFERRALS and TEAM constants with API calls and pass data via props or
//   a context/state management solution.
//
// Will need to check about routers if we want to link to specific referral/team member pages from the overview KPIs and recent referrals list. We could either:
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useRef } from "react";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
// Injected into a <style> tag in the root component.
// Plus Jakarta Sans  — primary UI font
// JetBrains Mono     — referral IDs and monospaced values
const FONT = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');`;

// ─── Design tokens ────────────────────────────────────────────────────────────
// Central colour/spacing constants used throughout inline styles.
// Change values here to retheme the whole dashboard.
const T = {
  sidebar:   "#0d1117",           // Sidebar background (very dark navy)
  sidebarB:  "#161b22",           // Sidebar secondary surface (user dropdown)
  accent:    "#4f46e5",           // Primary indigo accent
  accentL:   "#818cf8",           // Lighter accent for gradients
  accentBg:  "rgba(79,70,229,0.14)", // Translucent accent for nav active state
  surface:   "#ffffff",           // Card / panel background
  bg:        "#f4f6fb",           // Page background
  border:    "#e5e9f0",           // Dividers and card borders
  text:      "#0f172a",           // Primary text
  muted:     "#64748b",           // Secondary / label text
  faint:     "#94a3b8",           // Placeholder / meta text
  green:     "#10b981",           // Completed / success
  amber:     "#f59e0b",           // Warning / pending
  red:       "#ef4444",           // Danger / cancelled
  purple:    "#8b5cf6",           // In-progress
};

// ─── Inline SVG icon renderer ─────────────────────────────────────────────────
// All icons are single-path SVGs so there are no icon library dependencies.
// Usage: <Ic d={ICONS.home} size={16} />
const Ic = ({ d, size = 16, stroke = "currentColor", sw = 1.75, fill = "none" }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke={stroke} strokeWidth={sw}
    strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d={d} />
  </svg>
);

// SVG path data for every icon used in the dashboard
const ICONS = {
  home:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  team:     "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  referral: "M22 12h-4l-3 9L9 3l-3 9H2",
  budget:   "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  profile:  "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z",
  bell:     "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  plus:     "M12 5v14 M5 12h14",
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12a3 3 0 100-6 3 3 0 000 6",
  arrow:    "M19 12H5 M12 5l-7 7 7 7",
  upload:   "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  file:     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M14 2v6h6",
  clip:     "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  x:        "M18 6L6 18 M6 6l12 12",
  check:    "M20 6L9 17l-5-5",
  info:     "M12 2a10 10 0 100 20A10 10 0 0012 2z M12 16v-4 M12 8h.01",
  logout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  chevD:    "M6 9l6 6 6-6",
  chevU:    "M18 15l-6-6-6 6",
  trend:    "M23 6l-9.5 9.5-5-5L1 18",
  users:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2",
  clock:    "M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  chart:    "M18 20V10 M12 20V4 M6 20v-6",
};

// ─── Sample referral data ─────────────────────────────────────────────────────
// TODO: Replace with GET /api/manager/referrals when backend is confirmed.
// Shape must match: { id, patient, dob, empId, email, phone, service,
//                     status, date, reason, attachment }
const REFERRALS = [
  { id:"REF-2026-001", patient:"John Smith",    dob:"1985-03-12", empId:"EMP-1042", email:"j.smith@uni.ac.uk",    phone:"07700 900 111", service:"Physiotherapy",   status:"Pending",     date:"2026-02-24", reason:"Lower back pain following manual handling incident on site.", attachment:null },
  { id:"REF-2026-002", patient:"Emma Johnson",  dob:"1990-07-22", empId:"EMP-2103", email:"e.johnson@uni.ac.uk",  phone:"07700 900 222", service:"Occupational Therapy", status:"Assigned",    date:"2026-02-23", reason:"Post-surgery return-to-work assessment required after knee replacement.", attachment:"pre_op_assessment.pdf" },
  { id:"REF-2026-003", patient:"Michael Brown", dob:"1978-11-05", empId:"EMP-0887", email:"m.brown@uni.ac.uk",    phone:"07700 900 333", service:"Psychology",   status:"In Progress", date:"2026-02-22", reason:"Work-related stress and anxiety significantly affecting performance.", attachment:null },
  { id:"REF-2026-004", patient:"Sarah Davis",   dob:"1995-01-30", empId:"EMP-3310", email:"s.davis@uni.ac.uk",    phone:"07700 900 444", service:"Ergonomic Assessment",    status:"Completed",   date:"2026-02-21", reason:"Display screen equipment workstation review.", attachment:"ergo_checklist.docx" },
  { id:"REF-2026-005", patient:"Robert Wilson", dob:"1982-09-14", empId:"EMP-1765", email:"r.wilson@uni.ac.uk",   phone:"07700 900 555", service:"Health Surveillance", status:"Assigned",    date:"2026-02-20", reason:"Annual health check — noise-exposed employee per regulations.", attachment:null },
];

// ─── Sample team data ─────────────────────────────────────────────────────────
// TODO: Replace with GET /api/manager/team when backend is confirmed.
// Scoped to the logged-in manager's direct reports only (MGR-020).
const TEAM = [
  { id:"EMP-1042", name:"John Smith",    role:"Lab Technician",      dept:"Sciences",    status:"Active",   referrals:1, lastCheck:"2026-01-15", avatar:"JS" },
  { id:"EMP-2103", name:"Emma Johnson",  role:"Senior Researcher",   dept:"Engineering", status:"On Leave", referrals:1, lastCheck:"2025-11-20", avatar:"EJ" },
  { id:"EMP-0887", name:"Michael Brown", role:"Facilities Manager",  dept:"Operations",  status:"Active",   referrals:1, lastCheck:"2026-02-01", avatar:"MB" },
  { id:"EMP-3310", name:"Sarah Davis",   role:"Administrative Lead", dept:"Admin",       status:"Active",   referrals:0, lastCheck:"2025-12-10", avatar:"SD" },
  { id:"EMP-1765", name:"Robert Wilson", role:"Maintenance Tech",    dept:"Facilities",  status:"Active",   referrals:1, lastCheck:"2026-01-28", avatar:"RW" },
  { id:"EMP-4421", name:"Priya Kapoor",  role:"Data Analyst",        dept:"IT",          status:"Active",   referrals:0, lastCheck:"2026-02-10", avatar:"PK" },
];

// Available options for the referral create form dropdowns
const SERVICES  = ["Physiotherapy","Occupational Therapy","Psychology","Ergonomic Assessment","Health Surveillance","Counselling","Dietetics","CBT"];
const URGENCIES = ["Low","Medium","High","Urgent"];

// ─── Badge colour maps ────────────────────────────────────────────────────────
// Used by StatusBadge and UrgBadge to map a string value to bg/fg/dot colours
const STATUS_M = {
  Pending:       { bg:"#fef3c7", fg:"#92400e", dot:"#f59e0b" },
  Assigned:      { bg:"#dbeafe", fg:"#1d4ed8", dot:"#3b82f6" },
  "In Progress": { bg:"#ede9fe", fg:"#5b21b6", dot:"#8b5cf6" },
  Completed:     { bg:"#d1fae5", fg:"#065f46", dot:"#10b981" },
  Cancelled:     { bg:"#fee2e2", fg:"#991b1b", dot:"#ef4444" },
};
const URG_M = {
  Low:    { bg:"#dcfce7", fg:"#166534" },
  Medium: { bg:"#fef9c3", fg:"#854d0e" },
  High:   { bg:"#fee2e2", fg:"#991b1b" },
  Urgent: { bg:"#fce7f3", fg:"#9d174d" },
};

// Deterministic avatar background colour — same initials always get same colour
const AVATAR_COLORS = ["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#0284c7","#be185d"];
const avatarColor = (str) => AVATAR_COLORS[(str.charCodeAt(0) + str.charCodeAt(1)) % AVATAR_COLORS.length];


// ═══════════════════════════════════════════════════════════════════════════════
// SHARED MICRO-COMPONENTS
// Small, stateless building blocks used across multiple pages.
// ═══════════════════════════════════════════════════════════════════════════════

// Coloured pill showing referral status (Pending / Assigned / etc.)
const StatusBadge = ({ status }) => {
  const m = STATUS_M[status] || STATUS_M.Pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, color:m.fg, background:m.bg }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:m.dot }} />
      {status}
    </span>
  );
};


// Circular avatar with initials — colour derived from initials string
const Avatar = ({ initials, size = 34 }) => (
  <div style={{
    width:size, height:size, borderRadius:"50%",
    background:avatarColor(initials),
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:size * 0.35, fontWeight:700, color:"#fff",
    flexShrink:0, letterSpacing:"-0.02em",
  }}>
    {initials}
  </div>
);

// White rounded card with subtle shadow — base container for all sections
const Card = ({ children, style = {} }) => (
  <div style={{
    background:T.surface, borderRadius:14,
    border:`1px solid ${T.border}`,
    boxShadow:"0 1px 8px rgba(0,0,0,0.05)",
    ...style,
  }}>
    {children}
  </div>
);

// Page-level heading with optional subtitle
const SectionHead = ({ title, sub }) => (
  <div style={{ marginBottom:24 }}>
    <h2 style={{ margin:0, fontSize:22, fontWeight:800, color:T.text }}>{title}</h2>
    {sub && <p style={{ margin:"4px 0 0", fontSize:13, color:T.muted }}>{sub}</p>}
  </div>
);

// KPI tile — coloured left border, large number, emoji icon, optional sub-label
const StatTile = ({ label, value, icon, color, sub }) => (
  <Card style={{ padding:"18px 20px", borderLeft:`4px solid ${color}` }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <p style={{ margin:0, fontSize:10.5, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
        <p style={{ margin:"6px 0 2px", fontSize:32, fontWeight:800, color:T.text, lineHeight:1 }}>{value}</p>
        {sub && <p style={{ margin:0, fontSize:11, color:T.faint }}>{sub}</p>}
      </div>
      <span style={{ fontSize:22 }}>{icon}</span>
    </div>
  </Card>
);

// ─── Toast notification ───────────────────────────────────────────────────────
// Slides up from the bottom-right. Triggered by setToast() in root component.
// Auto-dismissed by a timeout in whichever handler calls setToast().
const Toast = ({ msg, onClose }) => (
  <div style={{
    position:"fixed", bottom:28, right:28, zIndex:9999,
    background:T.accent, color:"#fff", borderRadius:10,
    padding:"12px 18px", fontSize:13, fontWeight:600,
    display:"flex", alignItems:"center", gap:10,
    boxShadow:"0 8px 30px rgba(79,70,229,0.4)",
    fontFamily:"'Plus Jakarta Sans',sans-serif",
    animation:"toastSlide 0.2s ease",
  }}>
    <Ic d={ICONS.check} size={15} />
    {msg}
    <button onClick={onClose} style={{ marginLeft:6, background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", borderRadius:5, padding:"1px 7px", cursor:"pointer", fontSize:13 }}>
      ×
    </button>
  </div>
);


// ═══════════════════════════════════════════════════════════════════════════════
// PAGE: Overview
// Shows KPIs, recent referrals, anonymised team health chart,
// quick-action buttons, and an SLA warning if a referral is overdue.
// ═══════════════════════════════════════════════════════════════════════════════
const OverviewPage = ({ referrals, onNavigate }) => {
  // Derive counts from the live referrals array
  const pending   = referrals.filter(r => r.status === "Pending").length;
  const active    = referrals.filter(r => ["Assigned","In Progress"].includes(r.status)).length;
  const completed = referrals.filter(r => r.status === "Completed").length;

  // Show the 3 most recently submitted referrals in the summary card
  const recent = [...referrals].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  return (
    <div style={{ padding:"32px 28px 60px", maxWidth:1060, margin:"0 auto" }}>

      {/* Greeting + date */}
      <SectionHead
        title="Welcome back"
        // TODO: Replace "Manager" with user?.firstName from Clerk once integrated
        sub={new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
      />

      {/* ── KPI strip ──────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
        <StatTile label="Team Members"     value={TEAM.length} icon="👥" color={T.accent} sub="Direct reports" />
        <StatTile label="Pending Referrals" value={pending}    icon="⏳" color={T.amber}  sub="Awaiting assignment" />
        <StatTile label="Active Referrals"  value={active}     icon="🔄" color={T.purple} sub="In progress" />
        <StatTile label="Completed"         value={completed}  icon="✅" color={T.green}  sub="This period" />
      </div>

      {/* ── Two-column body ─────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:20 }}>

        {/* Recent referrals — last 3 by date */}
        <Card>
          <div style={{ padding:"18px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>Recent Referrals</h3>
            <button onClick={() => onNavigate("referral")}
              style={{ background:"none", border:"none", color:T.accent, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              View all →
            </button>
          </div>
          {recent.map(r => (
            <div key={r.id} style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:14 }}>
              <Avatar initials={r.patient.split(" ").map(w => w[0]).join("")} size={36} />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.text }}>{r.patient}</p>
                <p style={{ margin:"2px 0 0", fontSize:11.5, color:T.muted }}>{r.service}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </Card>

        {/* Team health snapshot — anonymised aggregate, GDPR-safe (MGR-009) */}
        <Card>
          <div style={{ padding:"18px 20px", borderBottom:`1px solid ${T.border}` }}>
            <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>Team Health Snapshot</h3>
            <p style={{ margin:"3px 0 0", fontSize:11, color:T.faint }}>Anonymised aggregated data</p>
          </div>
          <div style={{ padding:"18px 20px" }}>
            {/* Service breakdown bars — no individual data shown */}
            {[
              { label:"Physiotherapy",        pct:40, color:"#6366f1" },
              { label:"Psychology",           pct:25, color:"#8b5cf6" },
              { label:"Occupational Therapy", pct:20, color:"#06b6d4" },
              { label:"Other Services",       pct:15, color:"#10b981" },
            ].map(({ label, pct, color }) => (
              <div key={label} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:12, color:T.muted, fontWeight:500 }}>{label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:T.text }}>{pct}%</span>
                </div>
                <div style={{ height:6, background:"#f1f5f9", borderRadius:3 }}>
                  <div style={{ height:6, width:`${pct}%`, background:color, borderRadius:3, transition:"width 0.5s ease" }} />
                </div>
              </div>
            ))}
            <p style={{ margin:"12px 0 0", fontSize:11, color:T.faint, fontStyle:"italic" }}>
              Data refreshed nightly · Individual records not shown
            </p>
          </div>
        </Card>

        {/* Quick action grid — navigates to other pages */}
        <Card style={{ padding:"18px 20px" }}>
          <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:T.text }}>Quick Actions</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              { label:"New Referral",  icon:ICONS.referral, action:() => onNavigate("referral"), color:T.accent   },
              { label:"View Team",     icon:ICONS.team,     action:() => onNavigate("team"),     color:"#0891b2"  },
              { label:"My Profile",    icon:ICONS.profile,  action:() => onNavigate("profile"),  color:T.green    },
              { label:"Budget",        icon:ICONS.budget,   action:() => onNavigate("budget"),   color:T.amber    },
            ].map(({ label, icon, action, color }) => (
              <button key={label} onClick={action}
                style={{ display:"flex", alignItems:"center", gap:9, padding:"11px 14px", borderRadius:10, border:`1.5px solid ${T.border}`, background:T.surface, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12.5, fontWeight:600, color:T.text, transition:"all 0.14s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}>
                <Ic d={icon} size={14} stroke={color} />{label}
              </button>
            ))}
          </div>
        </Card>

        {/* SLA reminder card — warns if a referral is near/past the 5-day threshold (MGR-015) */}
        <Card style={{ padding:"18px 20px", borderLeft:`4px solid ${T.amber}`, background:"#fffbeb" }}>
          <h3 style={{ margin:"0 0 8px", fontSize:13.5, fontWeight:700, color:"#92400e" }}>⚠ SLA Reminder</h3>
          <p style={{ margin:0, fontSize:12.5, color:"#78350f", lineHeight:1.7 }}>
            <strong>REF-2026-001</strong> (John Smith) has been pending for <strong>4 days</strong>.
            Standard SLA is 5 days. Please follow up with the admin team to ensure timely assignment.
          </p>
          <button onClick={() => onNavigate("referral")}
            style={{ marginTop:12, padding:"7px 14px", background:"#f59e0b", border:"none", borderRadius:8, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            View Referral →
          </button>
        </Card>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════════
// PAGE: Team
// Grid of team member cards showing name, role, dept, status, open referrals,
// and last health check date. Scoped to the manager's team only (MGR-020).
// ═══════════════════════════════════════════════════════════════════════════════
const TeamPage = ({ onNavigate }) => {
  const [search, setSearch] = useState("");

  // Filter team list by name or department as the user types
  const filtered = TEAM.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding:"32px 28px 60px", maxWidth:1060, margin:"0 auto" }}>

      {/* Header + "New Referral" shortcut */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24 }}>
        <SectionHead title="My Team" sub="View team members and their health referral status" />
        <button onClick={() => onNavigate("referral")}
          style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:9, border:"none", background:T.accent, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:"0 4px 14px rgba(79,70,229,0.35)" }}>
          <Ic d={ICONS.plus} size={14} /> New Referral
        </button>
      </div>

      {/* Search bar */}
      <Card style={{ padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:9 }}>
        <Ic d={ICONS.search} size={15} stroke={T.faint} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or department…"
          style={{ border:"none", outline:"none", fontSize:13, color:T.text, flex:1, fontFamily:"'Plus Jakarta Sans',sans-serif", background:"transparent" }}
        />
      </Card>

      {/* Team member cards — responsive auto-fill grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
        {filtered.map(m => (
          <Card key={m.id} style={{ padding:"18px 20px" }}>

            {/* Avatar + name + status badge */}
            <div style={{ display:"flex", alignItems:"flex-start", gap:13, marginBottom:14 }}>
              <Avatar initials={m.avatar} size={42} />
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:14, fontWeight:700, color:T.text }}>{m.name}</p>
                <p style={{ margin:"2px 0 0", fontSize:12, color:T.muted }}>{m.role}</p>
                <p style={{ margin:"2px 0 0", fontSize:11, color:T.faint }}>{m.dept} · {m.id}</p>
              </div>
              {/* Green = Active, Amber = On Leave */}
              <span style={{ padding:"2px 9px", borderRadius:20, fontSize:10.5, fontWeight:700, color:m.status==="Active"?"#065f46":"#92400e", background:m.status==="Active"?"#d1fae5":"#fef3c7" }}>
                {m.status}
              </span>
            </div>

            {/* Stats: open referrals + last health check date */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div style={{ background:T.bg, borderRadius:8, padding:"8px 12px" }}>
                <p style={{ margin:0, fontSize:10, color:T.faint, fontWeight:600, textTransform:"uppercase" }}>Open Referrals</p>
                {/* Red/green count to surface team members who need attention */}
                <p style={{ margin:"3px 0 0", fontSize:18, fontWeight:800, color:m.referrals > 0 ? T.accent : T.green }}>{m.referrals}</p>
              </div>
              <div style={{ background:T.bg, borderRadius:8, padding:"8px 12px" }}>
                <p style={{ margin:0, fontSize:10, color:T.faint, fontWeight:600, textTransform:"uppercase" }}>Last Check</p>
                <p style={{ margin:"3px 0 0", fontSize:11.5, fontWeight:600, color:T.text }}>
                  {new Date(m.lastCheck).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════════
// PAGE: Budget
// Stub page with sample data — not a Manager MoSCoW requirement.
// TODO: Remove or wire to a real Finance API if requirements change.
// ═══════════════════════════════════════════════════════════════════════════════
const BudgetPage = () => (
  <div style={{ padding:"32px 28px 60px", maxWidth:1060, margin:"0 auto" }}>
    <SectionHead title="Budget" sub="Departmental occupational health spend overview" />

    {/* Top-line KPIs */}
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:24 }}>
      <StatTile label="Annual Budget" value="£24,000" icon="💰" color={T.green}  sub="FY 2025–26"         />
      <StatTile label="Spent to Date" value="£11,340" icon="📊" color={T.accent} sub="47.3% utilised"     />
      <StatTile label="Remaining"     value="£12,660" icon="📉" color={T.amber}  sub="Available this FY"  />
    </div>

    {/* Per-service spend bars */}
    <Card style={{ padding:24 }}>
      <h3 style={{ margin:"0 0 18px", fontSize:14, fontWeight:700, color:T.text }}>Spend by Service (YTD)</h3>
      {[
        { label:"Physiotherapy",        spend:4200, budget:7000, color:"#6366f1" },
        { label:"Psychology",           spend:3100, budget:6000, color:"#8b5cf6" },
        { label:"Occupational Therapy", spend:2400, budget:5000, color:"#06b6d4" },
        { label:"Health Surveillance",  spend:1640, budget:3000, color:"#10b981" },
        { label:"Other",                spend:0,    budget:3000, color:"#94a3b8" },
      ].map(({ label, spend, budget, color }) => (
        <div key={label} style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{label}</span>
            <span style={{ fontSize:12, color:T.muted }}>£{spend.toLocaleString()} / £{budget.toLocaleString()}</span>
          </div>
          <div style={{ height:8, background:"#f1f5f9", borderRadius:4 }}>
            <div style={{ height:8, width:`${Math.round(spend / budget * 100)}%`, background:color, borderRadius:4 }} />
          </div>
        </div>
      ))}
    </Card>
  </div>
);


// ═══════════════════════════════════════════════════════════════════════════════
// PAGE: Profile
// Editable personal details form + notification preference toggles.
// TODO: Replace static name with user?.firstName + user?.lastName from Clerk.
// TODO: Wire Save button to PUT /api/manager/profile when backend confirmed.
// ═══════════════════════════════════════════════════════════════════════════════
const ProfilePage = () => {
  // Form state — all fields editable except what Clerk manages (name/email)
  const [form, setForm] = useState({
    name:           "Manager",         // TODO: user?.fullName from Clerk
    email:          "testemail",   // TODO: user?.primaryEmailAddress from Clerk
    phone:          "+44 7700 900 042",
    dept:           "Operations",
    title:          "Senior Manager",
    notify_inapp:   true,
    notify_email:   false,
    notify_sms:     false,
  });
  const [saved, setSaved] = useState(false);

  // Generic field updater — handles both text inputs and checkboxes
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div style={{ padding:"32px 28px 60px", maxWidth:680, margin:"0 auto" }}>
      <SectionHead title="My Profile" sub="Update your personal information and notification preferences" />

      {/* Personal details card */}
      <Card style={{ padding:28, marginBottom:20 }}>
        {/* Avatar + name header */}
        <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:24, paddingBottom:20, borderBottom:`1px solid ${T.border}` }}>
          <Avatar initials="MH" size={60} />
          {/* TODO: Replace "MH" initials with dynamic value from Clerk user data */}
          <div>
            <p style={{ margin:0, fontSize:18, fontWeight:800, color:T.text }}>Manager </p>
            <p style={{ margin:"3px 0 0", fontSize:13, color:T.accent, fontWeight:600 }}>Manager</p>
            <p style={{ margin:"2px 0 0", fontSize:12, color:T.faint }}>University Health CRM</p>
          </div>
        </div>

        {/* Editable field grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {[
            ["Full Name",  "name",  "text" ],
            ["Email",      "email", "email"],
            ["Phone",      "phone", "text" ],
            ["Department", "dept",  "text" ],
            ["Job Title",  "title", "text" ],
          ].map(([label, key, type]) => (
            <div key={key} style={{ gridColumn: key === "email" || key === "title" ? "span 2" : "span 1" }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.muted, marginBottom:5 }}>{label}</label>
              <input
                type={type} value={form[key]} onChange={set(key)}
                style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${T.border}`, borderRadius:9, fontSize:13, color:T.text, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", boxSizing:"border-box" }}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Notification preferences card — toggle switches (MGR-016) */}
      <Card style={{ padding:24, marginBottom:20 }}>
        <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:T.text }}>Notification Preferences</h3>
        {[
          ["notify_inapp", "In-App Notifications",  "Real-time alerts in the dashboard"],
          ["notify_email", "Email Notifications",   "Updates sent to your email address"],
          ["notify_sms",   "SMS Notifications",     "Text message alerts for urgent items"],
        ].map(([key, label, sub]) => (
          <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${T.border}` }}>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:600, color:T.text }}>{label}</p>
              <p style={{ margin:"2px 0 0", fontSize:11.5, color:T.faint }}>{sub}</p>
            </div>
            {/* Toggle switch — click the track to flip the boolean */}
            <div onClick={() => setForm(f => ({ ...f, [key]:!f[key] }))}
              style={{ width:42, height:24, borderRadius:12, background:form[key] ? T.accent : "#e2e8f0", cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
              <div style={{ position:"absolute", top:3, left:form[key] ? 20 : 3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
            </div>
          </div>
        ))}
      </Card>

      {/* Save button — shows a tick confirmation on click */}
      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button onClick={() => setSaved(true)}
          style={{ padding:"10px 24px", borderRadius:9, border:"none", background:T.accent, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
          {saved ? "✓ Saved" : "Save Changes"}
          {/* TODO: POST /api/manager/profile with form state when backend confirmed */}
        </button>
      </div>
    </div>
  );
};


// ═══════════════════════════════════════════════════════════════════════════════
// PAGE: Referral Management
// Three sub-views switched by local `view` state:
//   "list"   — ReferralList   (MGR-005: view all referrals)
//   "create" — CreateForm     (MGR-001/002/003: submit new referral)
//   modal    — DetailModal    (MGR-006: view full referral details)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Detail modal (MGR-006) ───────────────────────────────────────────────────
// Opens over the list when the user clicks "View" on a row.
// Clicking outside the modal or pressing × closes it.
const DetailModal = ({ ref: r, onClose }) => (
  // Backdrop — clicking outside the white card closes the modal
  <div
    style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div style={{ background:T.surface, borderRadius:16, width:"100%", maxWidth:520, boxShadow:"0 25px 60px rgba(0,0,0,0.25)", overflow:"hidden", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* Dark gradient header with referral ID */}
      <div style={{ background:"linear-gradient(135deg,#0d1117,#1e1b4b)", padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.45)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Referral ID</p>
          <h2 style={{ margin:"3px 0 0", fontSize:19, fontWeight:800, color:"#fff", fontFamily:"'JetBrains Mono',monospace" }}>{r.id}</h2>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <StatusBadge status={r.status} />
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", width:28, height:28, borderRadius:7, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
      </div>

      {/* Referral fields grid */}
      <div style={{ padding:24 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:18 }}>
          {[
            ["Patient",        r.patient],
            ["Employee ID",    r.empId],
            ["Service",        r.service],
            ["Date Submitted", new Date(r.date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })],
            ["Email",          r.email],
          ].map(([l, v]) => (
            <div key={l}>
              <p style={{ margin:0, fontSize:10, color:T.faint, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{l}</p>
              <p style={{ margin:"3px 0 0", fontSize:13, fontWeight:600, color:T.text }}>{v}</p>
            </div>
          ))}
        </div>

        <div style={{ height:1, background:T.border, marginBottom:16 }} />

        {/* Referral reason — free text */}
        <p style={{ margin:"0 0 6px", fontSize:10, color:T.faint, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>Referral Reason</p>
        <p style={{ margin:"0 0 16px", fontSize:13, color:"#334155", lineHeight:1.65 }}>{r.reason}</p>

        {/* Attachment chip — only shown if a file was uploaded */}
        {r.attachment && (
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 13px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8 }}>
            <Ic d={ICONS.clip} size={13} stroke={T.accent} />
            <span style={{ fontSize:12.5, color:T.accent, fontWeight:600 }}>{r.attachment}</span>
          </div>
        )}

        {/* Close button */}
        <div style={{ marginTop:20, display:"flex", justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ padding:"9px 20px", borderRadius:9, border:`1.5px solid ${T.border}`, background:T.surface, color:T.muted, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Create referral form (MGR-001, MGR-002, MGR-003) ────────────────────────
// Three card sections: Patient Info · Referral Details · Supporting Documents
// Validates required fields before calling onSubmit.
const CreateForm = ({ onBack, onSubmit }) => {
  // All form field values in one state object
  const [f, setF]         = useState({ fullName:"", dob:"", empId:"", phone:"", email:"", reason:"", service:"", prefDate:"" });
  const [files, setFiles] = useState([]);   // Uploaded file list (client-side only for now)
  const [errs, setErrs]   = useState({});   // Validation error messages
  const [drag, setDrag]   = useState(false); // Drop zone highlight state
  const fRef              = useRef();        // Hidden <input type="file"> ref

  // Generic updater for text/select fields
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  // Returns an object of field-level error messages; empty object = valid
  const validate = () => {
    const e = {};
    if (!f.fullName.trim()) e.fullName = "Required";
    if (!f.dob)             e.dob      = "Required";
    if (!f.email.trim())    e.email    = "Required";
    if (!f.reason.trim())   e.reason   = "Required";
    if (!f.service)         e.service  = "Required";
    return e;
  };

  // On submit: validate → show errors or build referral object and hand off to parent
  const submit = () => {
    const e = validate();
    setErrs(e);
    if (Object.keys(e).length) return;
    onSubmit({
      id:         `REF-2026-${Math.floor(100 + Math.random() * 900)}`,
      // TODO: Server should assign the real ID; this is a client-side placeholder
      patient:    f.fullName,
      dob:        f.dob,
      empId:      f.empId || "—",
      email:      f.email,
      phone:      f.phone,
      service:    f.service,
      status:     "Pending",
      date:       new Date().toISOString().slice(0, 10),
      reason:     f.reason,
      attachment: files[0]?.name || null,
    });
  };

  // Helper: returns style props for a text/date input, with error highlight
  const inp = (k, extra = {}) => ({
    value:    f[k],
    onChange: set(k),
    style: {
      width:"100%", padding:"10px 12px",
      border:`1.5px solid ${errs[k] ? "#fca5a5" : T.border}`,
      borderRadius:9, fontSize:13, color:T.text,
      fontFamily:"'Plus Jakarta Sans',sans-serif",
      outline:"none", boxSizing:"border-box",
      boxShadow: errs[k] ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
      ...extra,
    },
    onFocus: e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px rgba(79,70,229,0.12)`; },
    onBlur:  e => { e.target.style.borderColor = errs[k] ? "#fca5a5" : T.border; e.target.style.boxShadow = errs[k] ? "0 0 0 3px rgba(239,68,68,0.1)" : "none"; },
  });

  // Same for <select> — adds the custom chevron arrow via backgroundImage
  const selStyle = k => ({
    ...inp(k).style,
    appearance:"none",
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center",
    paddingRight:36, cursor:"pointer",
  });

  // Small label above a field with optional required asterisk
  const FLabel = ({ l, req }) => (
    <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.muted, marginBottom:5 }}>
      {l}{req && <span style={{ color:"#ef4444", marginLeft:2 }}>*</span>}
    </label>
  );

  // Inline error message below a field
  const Err = ({ k }) => errs[k]
    ? <p style={{ margin:"4px 0 0", fontSize:11, color:"#dc2626" }}>⚠ {errs[k]}</p>
    : null;

  // Section card with icon header — wraps a group of related fields
  const Sect = ({ title, icon, children }) => (
    <Card style={{ padding:24, marginBottom:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:14, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ width:30, height:30, borderRadius:8, background:"#ede9fe", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Ic d={icon} size={14} stroke={T.accent} />
        </div>
        <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:T.text }}>{title}</h3>
      </div>
      {children}
    </Card>
  );

  return (
    <div style={{ padding:"32px 28px 60px", maxWidth:740, margin:"0 auto" }}>

      {/* Back link */}
      <button onClick={onBack}
        style={{ display:"inline-flex", alignItems:"center", gap:7, background:"none", border:"none", color:T.accent, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", padding:0, marginBottom:20 }}>
        <Ic d={ICONS.arrow} size={14} stroke={T.accent} /> Back to Referrals
      </button>

      <div style={{ marginBottom:26 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:T.text }}>Create Referral</h1>
        <p style={{ margin:"5px 0 0", fontSize:13.5, color:T.muted }}>Complete all required fields to submit a patient referral</p>
      </div>

      {/* ── Section 1: Patient / Employee Information ───────────────────── */}
      <Sect title="Patient Information" icon={ICONS.profile}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div><FLabel l="Full Name" req /><input {...inp("fullName")} placeholder="e.g. John Smith" /><Err k="fullName" /></div>
          <div><FLabel l="Date of Birth" req /><input type="date" {...inp("dob")} /><Err k="dob" /></div>
          <div><FLabel l="Employee ID" /><input {...inp("empId")} placeholder="EMP-0000" /></div>
          <div><FLabel l="Contact Number" /><input {...inp("phone")} placeholder="+44 7700 900 000" /></div>
          <div style={{ gridColumn:"span 2" }}>
            <FLabel l="Email Address" req />
            <input type="email" {...inp("email")} placeholder="employee@university.ac.uk" />
            <Err k="email" />
          </div>
        </div>
      </Sect>

      {/* ── Section 2: Referral Details ─────────────────────────────────── */}
      <Sect title="Referral Details" icon={ICONS.referral}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

          {/* Reason textarea — spans full width */}
          <div style={{ gridColumn:"span 2" }}>
            <FLabel l="Referral Reason" req />
            <textarea
              value={f.reason} onChange={set("reason")} rows={5}
              placeholder="Please provide detailed information about the reason for this referral…"
              style={{ ...inp("reason").style, resize:"vertical", lineHeight:1.65 }}
              onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px rgba(79,70,229,0.12)`; }}
              onBlur={e  => { e.target.style.borderColor = errs.reason ? "#fca5a5" : T.border; e.target.style.boxShadow = errs.reason ? "0 0 0 3px rgba(239,68,68,0.1)" : "none"; }}
            />
            <Err k="reason" />
          </div>

          {/* Service type dropdown (MGR-001) */}
          <div>
            <FLabel l="Service Type" req />
            <select value={f.service} onChange={set("service")} style={selStyle("service")}
              onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px rgba(79,70,229,0.12)`; }}
              onBlur={e  => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}>
              <option value="">Select service type…</option>
              {SERVICES.map(s => <option key={s}>{s}</option>)}
            </select>
            <Err k="service" />
          </div>

          {/* Optional preferred appointment date */}
          <div style={{ gridColumn:"span 2" }}>
            <FLabel l="Preferred Appointment Date" />
            <input type="date" {...inp("prefDate")} />
          </div>
        </div>
      </Sect>

      {/* ── Section 3: Supporting Documents (MGR-002) ───────────────────── */}
      <Sect title="Upload Supporting Documents" icon={ICONS.upload}>
        {/* Drag-and-drop zone — also opens a native file picker on click */}
        <div
          className="upload-zone"
          onDragOver={e  => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); setFiles(p => [...p, ...Array.from(e.dataTransfer.files)].slice(0, 3)); }}
          onClick={() => fRef.current?.click()}
          style={{ border:`2px dashed ${drag ? T.accent : "#cbd5e1"}`, borderRadius:12, background:drag ? "#f0f0ff" : "#fafafa", padding:"36px 20px", textAlign:"center", cursor:"pointer", transition:"all 0.15s" }}
        >
          <div style={{ width:42, height:42, borderRadius:12, background:"#ede9fe", margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Ic d={ICONS.upload} size={20} stroke={T.accent} />
          </div>
          <p style={{ margin:"0 0 4px", fontSize:13.5, fontWeight:600, color:T.text }}>Click to upload or drag and drop</p>
          <p style={{ margin:0, fontSize:12, color:T.faint }}>PDF, DOC, DOCX, or images (max 10MB)</p>
          {/* Hidden native file input */}
          <input ref={fRef} type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg" style={{ display:"none" }}
            onChange={e => setFiles(p => [...p, ...Array.from(e.target.files)].slice(0, 3))} />
        </div>

        {/* List of selected files with remove button */}
        {files.length > 0 && (
          <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:7 }}>
            {files.map((fi, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 13px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8 }}>
                <Ic d={ICONS.clip} size={13} stroke={T.accent} />
                <span style={{ flex:1, fontSize:12.5, color:"#334155", fontWeight:500 }}>{fi.name}</span>
                <span style={{ fontSize:11, color:T.faint }}>{(fi.size / 1024).toFixed(0)} KB</span>
                <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} style={{ background:"none", border:"none", cursor:"pointer", padding:2 }}>
                  <Ic d={ICONS.x} size={13} stroke={T.faint} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Sect>

      {/* Form actions */}
      <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginBottom:16 }}>
        <button onClick={onBack}
          style={{ padding:"10px 22px", borderRadius:9, border:`1.5px solid ${T.border}`, background:T.surface, color:T.muted, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
          Cancel
        </button>
        <button onClick={submit}
          style={{ padding:"10px 22px", borderRadius:9, border:"none", background:`linear-gradient(135deg,${T.accent},${T.accentL})`, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:"0 4px 14px rgba(79,70,229,0.35)" }}>
          Submit Referral
        </button>
      </div>

      {/* GDPR notice */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"12px 16px", background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:9 }}>
        <Ic d={ICONS.info} size={14} stroke="#3b82f6" />
        <p style={{ margin:0, fontSize:11.5, color:"#1e40af", lineHeight:1.6 }}>
          <strong>*</strong> indicates required field. All patient information is handled in accordance with GDPR and healthcare data protection regulations.
        </p>
      </div>
    </div>
  );
};

// ─── Referral list (MGR-005) ──────────────────────────────────────────────────
// Shows a searchable, filterable table of all referrals with a "View" action.
// The list also shows 4 stat tiles and surfaces to the parent via onNew/onView.
const ReferralList = ({ referrals, onNew, onView }) => {
  const [search, setSearch]   = useState("");
  const [fStatus, setFStatus] = useState("All");
  const [fSvc, setFSvc]       = useState("All");

  // Apply search text + status + service filters
  const filtered = referrals
    .filter(r => !search || r.patient.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()))
    .filter(r => fStatus === "All" || r.status === fStatus)
    .filter(r => fSvc   === "All" || r.service === fSvc);

  // Helper to count referrals by status for the stat tiles
  const cnt = s => referrals.filter(r => r.status === s).length;

  return (
    <div style={{ padding:"32px 28px 60px", maxWidth:1100, margin:"0 auto" }}>

      {/* Header + New Referral button */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24 }}>
        <SectionHead title="Referral Management" sub="View and manage referrals for your team" />
        <button onClick={onNew}
          style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 18px", borderRadius:9, border:"none", background:T.accent, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:"0 4px 14px rgba(79,70,229,0.35)" }}>
          <Ic d={ICONS.plus} size={14} /> New Referral
        </button>
      </div>

      {/* ── Status summary tiles ─────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        {[
          ["Pending",     cnt("Pending"),       "⏳", T.amber  ],
          ["Assigned",    cnt("Assigned"),       "📋", "#3b82f6"],
          ["In Progress", cnt("In Progress"),   "🔄", T.purple ],
          ["Completed",   cnt("Completed"),     "✅", T.green  ],
        ].map(([l, v, ic, c]) => (
          <StatTile key={l} label={l} value={v} icon={ic} color={c} />
        ))}
      </div>

      {/* ── Table card ───────────────────────────────────────────────────── */}
      <Card style={{ overflow:"hidden" }}>

        {/* Filter bar: search + status dropdown + service dropdown */}
        <div style={{ padding:"13px 18px", borderBottom:`1px solid ${T.border}`, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          {/* Search input */}
          <div style={{ flex:1, minWidth:200, display:"flex", alignItems:"center", gap:8, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:9, padding:"8px 12px" }}>
            <Ic d={ICONS.search} size={14} stroke={T.faint} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or referral ID…"
              style={{ border:"none", outline:"none", background:"transparent", fontSize:13, color:T.text, width:"100%", fontFamily:"'Plus Jakarta Sans',sans-serif" }} />
          </div>

          {/* Status and service filter dropdowns */}
          {[
            ["fStatus", fStatus, setFStatus, ["All", ...Object.keys(STATUS_M)], "All Statuses"],
            ["fSvc",    fSvc,    setFSvc,    ["All", ...SERVICES],              "All Services" ],
          ].map(([k, v, sv, opts, ph]) => (
            <select key={k} value={v} onChange={e => sv(e.target.value)}
              style={{ padding:"8px 12px", border:`1.5px solid ${T.border}`, borderRadius:9, fontSize:13, color:T.text, background:T.surface, outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif", cursor:"pointer" }}>
              <option value="All">{ph}</option>
              {opts.filter(o => o !== "All").map(o => <option key={o}>{o}</option>)}
            </select>
          ))}
        </div>

        {/* Referral table */}
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:T.bg, borderBottom:`2px solid ${T.border}` }}>
                {["Referral ID","Patient","Date","Service Type","Status","Actions"].map(h => (
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:10.5, fontWeight:700, color:T.faint, letterSpacing:"0.07em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding:"48px 20px", textAlign:"center", color:T.faint, fontSize:14 }}>
                    No referrals match your filters.
                  </td>
                </tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id}
                  style={{ borderBottom:`1px solid ${T.border}`, background:i % 2 === 0 ? T.surface : "#fbfcfd", cursor:"default" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? T.surface : "#fbfcfd"}>

                  {/* Referral ID in monospace */}
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11.5, color:T.accent, fontWeight:600 }}>{r.id}</span>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:T.text, whiteSpace:"nowrap" }}>{r.patient}</td>
                  <td style={{ padding:"12px 16px", fontSize:12, color:T.muted, whiteSpace:"nowrap" }}>
                    {new Date(r.date).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:12.5, color:"#334155" }}>{r.service}</td>
                  <td style={{ padding:"12px 16px" }}><StatusBadge status={r.status} /></td>
                  <td style={{ padding:"12px 16px" }}>

                    {/* View button — opens DetailModal (MGR-006) */}
                    <button onClick={() => onView(r)}
                      style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:7, border:"1px solid #bfdbfe", background:"#eff6ff", color:"#3b82f6", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#dbeafe"}
                      onMouseLeave={e => e.currentTarget.style.background = "#eff6ff"}>
                      <Ic d={ICONS.eye} size={12} stroke="#3b82f6" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Result count footer */}
        <div style={{ padding:"11px 18px", borderTop:`1px solid ${T.border}`, fontSize:12, color:T.faint }}>
          Showing {filtered.length} of {referrals.length} referral{referrals.length !== 1 ? "s" : ""}
        </div>
      </Card>
    </div>
  );
};

// ─── Referral Management root ─────────────────────────────────────────────────
// Owns the `view` state ("list" | "create") and the `viewing` modal state.
// Receives referrals + setReferrals from the root so new submissions persist.
const ReferralManagement = ({ referrals, setReferrals, setToast }) => {
  const [view, setView]       = useState("list");
  const [viewing, setViewing] = useState(null); // Referral object shown in modal

  // Called when CreateForm submits — prepend new referral and show toast
  const handleSubmit = nr => {
    setReferrals(rs => [nr, ...rs]);
    setView("list");
    setToast(`Referral ${nr.id} submitted successfully`);
    // TODO: POST /api/manager/referrals with nr payload when backend confirmed
  };

  return (
    <>
      {view === "list"   && <ReferralList referrals={referrals} onNew={() => setView("create")} onView={setViewing} />}
      {view === "create" && <CreateForm onBack={() => setView("list")} onSubmit={handleSubmit} />}
      {viewing           && <DetailModal ref={viewing} onClose={() => setViewing(null)} />}
    </>
  );
};


// ═══════════════════════════════════════════════════════════════════════════════
// ROOT: ManagerDashboard
// The single exported component. Owns:
//   - `page` state — which page is active in the sidebar
//   - `referrals` state — shared between Overview and Referral Management
//   - `toast` state — passed down to any page that needs to trigger a notification
//   - `userOpen` state — sidebar user card dropdown
// ═══════════════════════════════════════════════════════════════════════════════

// Sidebar navigation items — key matches the `page` state values used in renderPage
const NAV = [
  { key:"overview", label:"Overview",           icon:ICONS.home     },
  { key:"team",     label:"Team",               icon:ICONS.team     },
  { key:"referral", label:"Referral Management",icon:ICONS.referral },
  { key:"budget",   label:"Budget",             icon:ICONS.budget   },
  { key:"profile",  label:"Profile",            icon:ICONS.profile  },
];

export default function ManagerDashboard() {
  const [page, setPage]             = useState("overview");
  const [userOpen, setUserOpen]     = useState(false);
  const [referrals, setReferrals]   = useState(REFERRALS);
  const [toast, setToast]           = useState(null);

  // Count pending referrals for the sidebar badge + notification bell dot
  const pendingCount = referrals.filter(r => r.status === "Pending").length;

  // Auto-dismiss toast after 4 seconds
  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      {/* ── Global styles ────────────────────────────────────────────────── */}
      {/* Injected once — resets, font import, nav hover states, animations */}
      <style>{`
        ${FONT}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .nav-btn { transition: all 0.15s ease !important; }
        .nav-btn:hover  { background: rgba(255,255,255,0.07) !important; color: #e2e8f0 !important; }
        .nav-btn.active { background: rgba(79,70,229,0.18) !important; color: #a5b4fc !important; }
        .upload-zone:hover { background: #f0f0ff !important; border-color: ${T.accent} !important; }
        @keyframes toastSlide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pageIn     { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
        .page-wrap { animation: pageIn 0.2s ease; }
        ::-webkit-scrollbar       { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside style={{ width:232, flexShrink:0, background:T.sidebar, display:"flex", flexDirection:"column", borderRight:"1px solid rgba(255,255,255,0.06)" }}>

          {/* Brand header */}
          <div style={{ padding:"18px 16px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,#4f46e5,#818cf8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>⚕</div>
              <div>
                <p style={{ color:"#f1f5f9", fontSize:12, fontWeight:800, lineHeight:1.1 }}>Manager Panel</p>
                <p style={{ color:"#475569", fontSize:9.5, marginTop:1 }}>University Health CRM</p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex:1, padding:"12px 8px", overflowY:"auto" }}>
            <p style={{ fontSize:9.5, fontWeight:700, color:"#334155", letterSpacing:"0.1em", textTransform:"uppercase", padding:"0 8px", marginBottom:7 }}>Menu</p>
            {NAV.map(({ key, label, icon }) => (
              <button key={key}
                className={`nav-btn${page === key ? " active" : ""}`}
                onClick={() => setPage(key)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, cursor:"pointer", border:"none", background:"none", width:"100%", textAlign:"left", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:page === key ? 700 : 500, color:page === key ? "#a5b4fc" : "#64748b", marginBottom:2 }}>
                <Ic d={icon} size={15} stroke={page === key ? "#a5b4fc" : "#64748b"} />
                <span style={{ flex:1 }}>{label}</span>
                {/* Pending count badge — only on Referral Management */}
                {key === "referral" && pendingCount > 0 && (
                  <span style={{ background:"rgba(79,70,229,0.25)", color:"#a5b4fc", fontSize:9.5, fontWeight:800, padding:"1px 6px", borderRadius:10 }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Online status dot */}
          <div style={{ padding:"8px 18px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 6px #4ade80" }} />
            <span style={{ fontSize:10.5, color:"#475569" }}>Online</span>
          </div>

          {/* User card with dropdown */}
          <div style={{ padding:"0 8px 12px" }}>
            <button onClick={() => setUserOpen(o => !o)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 10px", borderRadius:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", cursor:"pointer", transition:"background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
              <Avatar initials="MH" size={30} />
              {/* TODO: Replace "MH" / "Manager " with Clerk user data */}
              <div style={{ flex:1, textAlign:"left", minWidth:0 }}>
                <p style={{ fontSize:12.5, fontWeight:700, color:"#e2e8f0", lineHeight:1.2 }}>Manager </p>
                <p style={{ fontSize:10, color:"#6366f1" }}>Manager</p>
              </div>
              <Ic d={userOpen ? ICONS.chevU : ICONS.chevD} size={13} stroke="#475569" />
            </button>

            {/* Dropdown menu */}
            {userOpen && (
              <div style={{ background:T.sidebarB, border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, marginTop:6, overflow:"hidden" }}>
                <button onClick={() => { setPage("profile"); setUserOpen(false); }}
                  style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"10px 14px", background:"none", border:"none", color:"#94a3b8", fontSize:12.5, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  <Ic d={ICONS.profile} size={13} stroke="#94a3b8" /> View Profile
                </button>
                <div style={{ height:1, background:"rgba(255,255,255,0.05)" }} />
                <button style={{ width:"100%", display:"flex", alignItems:"center", gap:9, padding:"10px 14px", background:"none", border:"none", color:"#f87171", fontSize:12.5, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  <Ic d={ICONS.logout} size={13} stroke="#f87171" /> Sign Out
                  {/* TODO: Wire to Clerk signOut() when integrating auth */}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content area ───────────────────────────────────────────── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Sticky top bar */}
          <header style={{ height:54, flexShrink:0, background:T.surface, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", padding:"0 24px", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:T.accent }} />
              <h1 style={{ fontSize:14.5, fontWeight:700, color:T.text }}>
                {NAV.find(n => n.key === page)?.label}
              </h1>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              {/* Notification bell — red dot when there are pending referrals */}
              <div style={{ position:"relative" }}>
                <button style={{ width:34, height:34, borderRadius:9, background:T.bg, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                  <Ic d={ICONS.bell} size={15} stroke={T.muted} />
                </button>
                {pendingCount > 0 && (
                  <div style={{ position:"absolute", top:2, right:2, width:8, height:8, borderRadius:"50%", background:"#ef4444", border:"2px solid #fff" }} />
                )}
              </div>
              {/* Online status pill */}
              <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, background:"#f0fdf4", border:"1px solid #bbf7d0" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:T.green }} />
                <span style={{ fontSize:11.5, fontWeight:600, color:"#166534" }}>Online</span>
              </div>
              {/* User identity — top bar */}
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Avatar initials="MH" size={28} />
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:T.text, lineHeight:1.2 }}>Manager </p>
                  {/* TODO: Replace with Clerk user name */}
                  <p style={{ fontSize:9.5, color:T.accent }}>Manager</p>
                </div>
              </div>
            </div>
          </header>

          {/* Active page — key prop forces full remount when switching pages */}
          <main style={{ flex:1, overflowY:"auto", background:T.bg }}>
            <div key={page} className="page-wrap">
              {page === "overview" && <OverviewPage referrals={referrals} onNavigate={setPage} />}
              {page === "team"     && <TeamPage     onNavigate={setPage} />}
              {page === "referral" && <ReferralManagement referrals={referrals} setReferrals={setReferrals} setToast={showToast} />}
              {page === "budget"   && <BudgetPage />}
              {page === "profile"  && <ProfilePage />}
            </div>
          </main>
        </div>
      </div>

      {/* Global toast notification — rendered outside the layout flow */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}