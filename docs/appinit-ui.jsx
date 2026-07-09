import { useState, useEffect } from "react";

// ── DESIGN TOKENS ─────────────────────────────────────────────────
const T = {
  bg:       "#05070F",
  bgCard:   "#0B0F1A",
  bgHover:  "#0F1422",
  border:   "#151C2E",
  borderLt: "#1E2840",
  green:    "#00D97E",
  greenDim: "#00D97E22",
  blue:     "#3B82F6",
  blueDim:  "#3B82F622",
  orange:   "#F97316",
  orangeDim:"#F9731622",
  red:      "#EF4444",
  redDim:   "#EF444422",
  yellow:   "#FBBF24",
  text:     "#E2E8F0",
  textSub:  "#64748B",
  textMid:  "#94A3B8",
  white:    "#FFFFFF",
};

// ── MOCK DATA ──────────────────────────────────────────────────────
const REPOS = [
  { id:1, name:"design-system",   role:"source",  components:24, synced:24, stale:0,  health:"A", lastSync:"2h ago",  client:"Internal",      lang:"React" },
  { id:2, name:"client-acme",     role:"consumer",components:18, synced:14, stale:4,  health:"B", lastSync:"3d ago",  client:"Acme Corp",     lang:"Next.js" },
  { id:3, name:"client-finova",   role:"consumer",components:22, synced:22, stale:0,  health:"A", lastSync:"1h ago",  client:"Finova Inc",    lang:"Next.js" },
  { id:4, name:"client-healthco", role:"consumer",components:16, synced:9,  stale:7,  health:"C", lastSync:"12d ago", client:"HealthCo",      lang:"React" },
  { id:5, name:"client-shoprise", role:"consumer",components:20, synced:18, stale:2,  health:"B", lastSync:"5d ago",  client:"ShopRise",      lang:"Next.js" },
  { id:6, name:"client-edunext",  role:"consumer",components:14, synced:14, stale:0,  health:"A", lastSync:"30m ago", client:"EduNext",       lang:"React" },
  { id:7, name:"client-buildfast",role:"consumer",components:19, synced:7,  stale:12, health:"D", lastSync:"21d ago", client:"BuildFast",     lang:"Vite" },
  { id:8, name:"client-paylink",  role:"consumer",components:21, synced:21, stale:0,  health:"A", lastSync:"4h ago",  client:"PayLink",       lang:"Next.js" },
];

const COMPONENTS = [
  { id:1, name:"Button",       version:"2.4.1", prevVer:"2.3.0", affected:7, category:"UI",    status:"pending",  updatedAt:"2h ago",   breaking:false },
  { id:2, name:"AuthForm",     version:"1.8.0", prevVer:"1.7.2", affected:5, category:"Auth",  status:"pending",  updatedAt:"1d ago",   breaking:true  },
  { id:3, name:"DataTable",    version:"3.1.0", prevVer:"3.0.5", affected:6, category:"UI",    status:"synced",   updatedAt:"3d ago",   breaking:false },
  { id:4, name:"Navigation",   version:"1.5.2", prevVer:"1.5.1", affected:7, category:"Layout",status:"synced",   updatedAt:"5d ago",   breaking:false },
  { id:5, name:"Modal",        version:"2.0.0", prevVer:"1.9.3", affected:4, category:"UI",    status:"conflict", updatedAt:"6h ago",   breaking:true  },
  { id:6, name:"Toast",        version:"1.3.1", prevVer:"1.3.0", affected:3, category:"UI",    status:"pending",  updatedAt:"12h ago",  breaking:false },
  { id:7, name:"FileUpload",   version:"2.1.0", prevVer:"2.0.2", affected:2, category:"Input", status:"pending",  updatedAt:"2d ago",   breaking:false },
  { id:8, name:"StripeCheckout",version:"4.0.0",prevVer:"3.2.1", affected:4, category:"Payments",status:"pending",updatedAt:"8h ago",  breaking:true  },
];

const VULNS = [
  { id:1, pkg:"lodash",        cve:"CVE-2025-1234", severity:"Critical", repos:6, patched:"4.17.22", current:"4.17.20", age:"3d" },
  { id:2, pkg:"next",          cve:"CVE-2025-5678", severity:"High",     repos:4, patched:"15.2.1",  current:"15.1.0",  age:"7d" },
  { id:3, pkg:"axios",         cve:"CVE-2025-9012", severity:"Medium",   repos:7, patched:"1.7.4",   current:"1.6.8",   age:"14d"},
  { id:4, pkg:"jsonwebtoken",  cve:"CVE-2025-3456", severity:"High",     repos:3, patched:"9.0.3",   current:"9.0.1",   age:"5d" },
  { id:5, pkg:"sharp",         cve:"CVE-2025-7890", severity:"Low",      repos:2, patched:"0.33.5",  current:"0.33.2",  age:"21d"},
];

const SYNC_PROPOSALS = [
  { id:1, component:"Button 2.4.1",      repo:"client-acme",     status:"open",   prUrl:"#", createdAt:"2h ago",  breaking:false },
  { id:2, component:"Button 2.4.1",      repo:"client-healthco", status:"open",   prUrl:"#", createdAt:"2h ago",  breaking:false },
  { id:3, component:"AuthForm 1.8.0",    repo:"client-acme",     status:"open",   prUrl:"#", createdAt:"1d ago",  breaking:true  },
  { id:4, component:"AuthForm 1.8.0",    repo:"client-shoprise", status:"open",   prUrl:"#", createdAt:"1d ago",  breaking:true  },
  { id:5, component:"Modal 2.0.0",       repo:"client-buildfast",status:"conflict",prUrl:"#",createdAt:"6h ago",  breaking:true  },
  { id:6, component:"Toast 1.3.1",       repo:"client-healthco", status:"merged", prUrl:"#", createdAt:"5d ago",  breaking:false },
  { id:7, component:"Button 2.4.1",      repo:"client-buildfast",status:"open",   prUrl:"#", createdAt:"2h ago",  breaking:false },
  { id:8, component:"FileUpload 2.1.0",  repo:"client-paylink",  status:"open",   prUrl:"#", createdAt:"2d ago",  breaking:false },
];

const ACTIVITY = [
  { id:1, type:"sync",     msg:"Button 2.4.1 PR opened in client-acme",           time:"2h ago",   icon:"🔀" },
  { id:2, type:"sync",     msg:"Button 2.4.1 PR opened in client-healthco",       time:"2h ago",   icon:"🔀" },
  { id:3, type:"cve",      msg:"Critical CVE detected: lodash in 6 repos",        time:"3h ago",   icon:"🔴" },
  { id:4, type:"publish",  msg:"Button 2.4.1 published to registry",              time:"4h ago",   icon:"📦" },
  { id:5, type:"merge",    msg:"DataTable 3.1.0 merged in client-finova",         time:"1d ago",   icon:"✅" },
  { id:6, type:"publish",  msg:"AuthForm 1.8.0 published — BREAKING CHANGE",     time:"1d ago",   icon:"⚠️" },
  { id:7, type:"cve",      msg:"High CVE: next 15.1.0 in 4 repos",               time:"7d ago",   icon:"🟠" },
  { id:8, type:"merge",    msg:"Navigation 1.5.2 merged in all 7 repos",         time:"5d ago",   icon:"✅" },
];

// ── HELPERS ───────────────────────────────────────────────────────
const healthColor = h => ({ A:T.green, B:T.blue, C:T.yellow, D:T.orange, F:T.red }[h] || T.textSub);
const sevColor = s => ({ Critical:T.red, High:T.orange, Medium:T.yellow, Low:T.textSub }[s]);
const statusColor = s => ({ open:T.blue, merged:T.green, conflict:T.red, synced:T.green, pending:T.yellow }[s] || T.textSub);
const Badge = ({ text, color }) => (
  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, border:`1px solid ${color}44`, background:`${color}18`, color, letterSpacing:"0.06em", fontWeight:600 }}>
    {text}
  </span>
);
const Dot = ({ color }) => <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block", marginRight:6, flexShrink:0 }} />;

// ── LAYOUT COMPONENTS ─────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"dashboard",   label:"Dashboard",   icon:"◈" },
  { id:"repos",       label:"Repositories",icon:"⬡" },
  { id:"registry",    label:"Registry",    icon:"◎" },
  { id:"syncs",       label:"Sync PRs",    icon:"🔀" },
  { id:"security",    label:"Security",    icon:"◆" },
  { id:"settings",    label:"Settings",    icon:"⚙" },
];

function Sidebar({ page, setPage }) {
  return (
    <div style={{ width:220, background:T.bgCard, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", flexShrink:0, height:"100vh", position:"sticky", top:0 }}>
      {/* Logo */}
      <div style={{ padding:"20px 20px 12px", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ fontSize:20, fontWeight:800, letterSpacing:"-0.03em", color:T.green, fontFamily:"'JetBrains Mono', monospace" }}>@appinit</div>
        <div style={{ fontSize:10, color:T.textSub, marginTop:2, letterSpacing:"0.08em" }}>AGENCY PORTFOLIO OS</div>
      </div>
      {/* Org picker */}
      <div style={{ margin:"12px 12px 8px", background:T.bg, border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 12px", cursor:"pointer" }}>
        <div style={{ fontSize:11, color:T.textSub, letterSpacing:"0.06em", marginBottom:2 }}>ORGANIZATION</div>
        <div style={{ fontSize:13, color:T.text, fontWeight:600 }}>Studio Alpha ↓</div>
      </div>
      {/* Nav */}
      <nav style={{ flex:1, padding:"4px 8px", overflow:"auto" }}>
        {NAV_ITEMS.map(item => (
          <div key={item.id} onClick={() => setPage(item.id)}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:7, cursor:"pointer", marginBottom:2,
              background: page === item.id ? `${T.green}18` : "transparent",
              border: page === item.id ? `1px solid ${T.green}30` : "1px solid transparent",
              color: page === item.id ? T.green : T.textSub,
              fontSize:13, fontWeight: page === item.id ? 600 : 400,
              transition:"all 0.15s",
            }}>
            <span style={{ fontSize:14 }}>{item.icon}</span>
            {item.label}
            {item.id === "syncs" && <span style={{ marginLeft:"auto", background:T.orange, color:"#fff", fontSize:9, padding:"1px 6px", borderRadius:10, fontWeight:700 }}>8</span>}
            {item.id === "security" && <span style={{ marginLeft:"auto", background:T.red, color:"#fff", fontSize:9, padding:"1px 6px", borderRadius:10, fontWeight:700 }}>2</span>}
          </div>
        ))}
      </nav>
      {/* User */}
      <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:30, height:30, borderRadius:"50%", background:`${T.green}30`, border:`1px solid ${T.green}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:T.green, fontWeight:700 }}>YO</div>
        <div>
          <div style={{ fontSize:12, color:T.text, fontWeight:600 }}>You</div>
          <div style={{ fontSize:10, color:T.textSub }}>Owner</div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ title, subtitle, actions }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 28px", borderBottom:`1px solid ${T.border}`, background:T.bg }}>
      <div>
        <h1 style={{ fontSize:18, fontWeight:700, color:T.text, margin:0, letterSpacing:"-0.01em" }}>{title}</h1>
        {subtitle && <p style={{ fontSize:12, color:T.textSub, margin:"2px 0 0" }}>{subtitle}</p>}
      </div>
      <div style={{ display:"flex", gap:8 }}>{actions}</div>
    </div>
  );
}

function Btn({ label, primary, small, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: primary ? T.green : "transparent",
      color: primary ? T.bg : T.textMid,
      border: primary ? "none" : `1px solid ${T.border}`,
      borderRadius:7, padding: small ? "5px 12px" : "8px 16px",
      fontSize: small ? 11 : 12, fontWeight:600, cursor:"pointer",
      letterSpacing:"0.03em", fontFamily:"inherit",
    }}>{label}</button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:10, ...style }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, color = T.green, icon }) {
  return (
    <Card style={{ padding:"18px 20px", flex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ fontSize:11, color:T.textSub, letterSpacing:"0.08em", marginBottom:8 }}>{label}</div>
        {icon && <span style={{ fontSize:18 }}>{icon}</span>}
      </div>
      <div style={{ fontSize:28, fontWeight:800, color, letterSpacing:"-0.03em", lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:T.textSub, marginTop:6 }}>{sub}</div>}
    </Card>
  );
}

// ── PAGES ─────────────────────────────────────────────────────────

function DashboardPage() {
  const totalRepos = REPOS.length;
  const staleCount = REPOS.reduce((a, r) => a + r.stale, 0);
  const openPRs = SYNC_PROPOSALS.filter(s => s.status === "open").length;
  const critCVEs = VULNS.filter(v => v.severity === "Critical").length;

  return (
    <div style={{ flex:1, overflow:"auto", background:T.bg }}>
      <TopBar title="Dashboard" subtitle="Studio Alpha · 8 repositories connected" actions={[<Btn key="r" label="Refresh" />, <Btn key="s" label="Run Full Scan" primary />]} />
      <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          <StatCard label="REPOSITORIES" value={totalRepos} sub="1 source · 7 consumers" color={T.green} icon="⬡" />
          <StatCard label="OPEN SYNC PRs" value={openPRs} sub="Awaiting your approval" color={T.orange} icon="🔀" />
          <StatCard label="STALE COMPONENTS" value={staleCount} sub="Across all repos" color={T.yellow} icon="◎" />
          <StatCard label="CRITICAL CVEs" value={critCVEs} sub="Needs immediate action" color={T.red} icon="◆" />
        </div>

        {/* Portfolio health + activity */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16 }}>
          {/* Repo health */}
          <Card>
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:600, color:T.text }}>Portfolio Health</span>
              <Badge text="8 repos" color={T.textSub} />
            </div>
            <div style={{ padding:"8px 0" }}>
              {REPOS.map(r => (
                <div key={r.id} style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 60px 60px", padding:"10px 18px", alignItems:"center", borderBottom:`1px solid ${T.border}22` }}>
                  <div>
                    <div style={{ fontSize:13, color:T.text, fontWeight:500 }}>{r.name}</div>
                    <div style={{ fontSize:10, color:T.textSub }}>{r.client} · {r.lang}</div>
                  </div>
                  <div style={{ fontSize:12, color:T.textSub }}>{r.synced}/{r.components} synced</div>
                  <div>
                    {r.stale > 0
                      ? <Badge text={`${r.stale} stale`} color={T.orange} />
                      : <Badge text="All synced" color={T.green} />}
                  </div>
                  <div style={{ fontSize:20, fontWeight:800, color:healthColor(r.health) }}>{r.health}</div>
                  <div style={{ fontSize:10, color:T.textSub }}>{r.lastSync}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity feed */}
          <Card>
            <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}` }}>
              <span style={{ fontSize:13, fontWeight:600, color:T.text }}>Recent Activity</span>
            </div>
            <div style={{ padding:"8px 0" }}>
              {ACTIVITY.map(a => (
                <div key={a.id} style={{ display:"flex", gap:10, padding:"10px 16px", borderBottom:`1px solid ${T.border}22`, alignItems:"flex-start" }}>
                  <span style={{ fontSize:14, flexShrink:0 }}>{a.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11, color:T.textMid, lineHeight:1.5 }}>{a.msg}</div>
                    <div style={{ fontSize:10, color:T.textSub, marginTop:2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReposPage() {
  const [search, setSearch] = useState("");
  const filtered = REPOS.filter(r => r.name.includes(search) || r.client.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ flex:1, overflow:"auto", background:T.bg }}>
      <TopBar title="Repositories" subtitle="All connected GitHub repos in your org" actions={[<Btn key="a" label="+ Connect Repo" primary />]} />
      <div style={{ padding:"24px 28px" }}>
        {/* Search */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search repos or clients..."
          style={{ width:"100%", background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:8, padding:"10px 14px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none", marginBottom:16 }} />

        <Card>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 120px 80px 90px 80px 80px", padding:"10px 18px", borderBottom:`1px solid ${T.border}`, fontSize:10, color:T.textSub, letterSpacing:"0.1em", fontWeight:600 }}>
            <span>REPOSITORY</span><span>ROLE</span><span>COMPONENTS</span><span>HEALTH</span><span>LAST SYNC</span><span>CVEs</span><span>ACTION</span>
          </div>
          {filtered.map(r => (
            <div key={r.id} style={{ display:"grid", gridTemplateColumns:"1fr 100px 120px 80px 90px 80px 80px", padding:"14px 18px", borderBottom:`1px solid ${T.border}22`, alignItems:"center" }}>
              <div>
                <div style={{ fontSize:13, color:T.text, fontWeight:600 }}>{r.name}</div>
                <div style={{ fontSize:11, color:T.textSub }}>{r.client} · {r.lang}</div>
              </div>
              <Badge text={r.role} color={r.role==="source" ? T.green : T.blue} />
              <div style={{ fontSize:12, color:T.textMid }}>
                <span style={{ color:T.green }}>{r.synced}</span>/{r.components}
                {r.stale > 0 && <span style={{ color:T.orange, marginLeft:6 }}>+{r.stale} stale</span>}
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:healthColor(r.health) }}>{r.health}</div>
              <div style={{ fontSize:11, color:T.textSub }}>{r.lastSync}</div>
              <div style={{ fontSize:11, color:T.textSub }}>—</div>
              <Btn label="View" small />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function RegistryPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? COMPONENTS : COMPONENTS.filter(c => c.status === filter);
  return (
    <div style={{ flex:1, overflow:"auto", background:T.bg }}>
      <TopBar title="Component Registry" subtitle="Your private component library" actions={[<Btn key="p" label="+ Publish Component" primary />]} />
      <div style={{ padding:"24px 28px" }}>
        {/* Filters */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {["all","pending","synced","conflict"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter===f ? `${T.green}18` : T.bgCard,
              border:`1px solid ${filter===f ? T.green+"40" : T.border}`,
              color: filter===f ? T.green : T.textSub,
              borderRadius:6, padding:"6px 14px", fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.06em", fontWeight:600,
            }}>{f.toUpperCase()} {f==="all" ? `(${COMPONENTS.length})` : `(${COMPONENTS.filter(c=>c.status===f).length})`}</button>
          ))}
        </div>

        <Card>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 100px 80px 80px 100px 100px", padding:"10px 18px", borderBottom:`1px solid ${T.border}`, fontSize:10, color:T.textSub, letterSpacing:"0.1em", fontWeight:600 }}>
            <span>COMPONENT</span><span>VERSION</span><span>PREV</span><span>CATEGORY</span><span>REPOS</span><span>STATUS</span><span>UPDATED</span>
          </div>
          {filtered.map(c => (
            <div key={c.id} style={{ display:"grid", gridTemplateColumns:"1fr 100px 100px 80px 80px 100px 100px", padding:"14px 18px", borderBottom:`1px solid ${T.border}22`, alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:6, background:`${T.green}15`, border:`1px solid ${T.green}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:T.green, fontWeight:700 }}>
                  {c.name[0]}
                </div>
                <div>
                  <div style={{ fontSize:13, color:T.text, fontWeight:600 }}>{c.name}</div>
                  {c.breaking && <Badge text="BREAKING" color={T.red} />}
                </div>
              </div>
              <div style={{ fontSize:12, color:T.green, fontFamily:"monospace" }}>v{c.version}</div>
              <div style={{ fontSize:11, color:T.textSub, fontFamily:"monospace" }}>v{c.prevVer}</div>
              <Badge text={c.category} color={T.blue} />
              <div style={{ fontSize:13, color:T.textMid, fontWeight:600 }}>{c.affected}</div>
              <Badge text={c.status} color={statusColor(c.status)} />
              <div style={{ fontSize:11, color:T.textSub }}>{c.updatedAt}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function SyncsPage() {
  const [selected, setSelected] = useState([]);
  const open = SYNC_PROPOSALS.filter(s => s.status === "open");
  const rest = SYNC_PROPOSALS.filter(s => s.status !== "open");
  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s, id]);
  const allSelected = open.every(s => selected.includes(s.id));

  return (
    <div style={{ flex:1, overflow:"auto", background:T.bg }}>
      <TopBar title="Sync PRs" subtitle="Automated pull requests generated by AppInit" actions={[
        selected.length > 0 && <Btn key="r" label={`Reject ${selected.length}`} />,
        selected.length > 0 && <Btn key="a" label={`Approve ${selected.length} PRs`} primary />,
      ].filter(Boolean)} />
      <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Pending PRs */}
        <div>
          <div style={{ fontSize:12, color:T.textSub, letterSpacing:"0.1em", marginBottom:10, fontWeight:600 }}>
            OPEN SYNC PRs ({open.length})
          </div>
          <Card>
            {/* Select all */}
            <div style={{ display:"grid", gridTemplateColumns:"40px 1fr 140px 100px 80px 120px", padding:"10px 18px", borderBottom:`1px solid ${T.border}`, fontSize:10, color:T.textSub, letterSpacing:"0.1em", fontWeight:600 }}>
              <input type="checkbox" checked={allSelected} onChange={() => allSelected ? setSelected([]) : setSelected(open.map(s=>s.id))}
                style={{ cursor:"pointer", accentColor:T.green }} />
              <span>COMPONENT UPDATE</span><span>TARGET REPO</span><span>BREAKING</span><span>STATUS</span><span>ACTIONS</span>
            </div>
            {open.map(s => (
              <div key={s.id} style={{ display:"grid", gridTemplateColumns:"40px 1fr 140px 100px 80px 120px", padding:"14px 18px", borderBottom:`1px solid ${T.border}22`, alignItems:"center",
                background: selected.includes(s.id) ? `${T.blue}08` : "transparent" }}>
                <input type="checkbox" checked={selected.includes(s.id)} onChange={()=>toggle(s.id)} style={{ cursor:"pointer", accentColor:T.green }} />
                <div>
                  <div style={{ fontSize:13, color:T.text, fontWeight:600, fontFamily:"monospace" }}>{s.component}</div>
                  <div style={{ fontSize:10, color:T.textSub }}>{s.createdAt}</div>
                </div>
                <div style={{ fontSize:12, color:T.textMid }}>{s.repo}</div>
                <div>{s.breaking ? <Badge text="BREAKING" color={T.red} /> : <Badge text="safe" color={T.green} />}</div>
                <Badge text={s.status} color={statusColor(s.status)} />
                <div style={{ display:"flex", gap:6 }}>
                  <Btn label="View PR" small />
                  <Btn label="✓" small primary />
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* History */}
        <div>
          <div style={{ fontSize:12, color:T.textSub, letterSpacing:"0.1em", marginBottom:10, fontWeight:600 }}>HISTORY</div>
          <Card>
            {rest.map(s => (
              <div key={s.id} style={{ display:"grid", gridTemplateColumns:"40px 1fr 140px 100px 80px 120px", padding:"12px 18px", borderBottom:`1px solid ${T.border}22`, alignItems:"center", opacity:0.65 }}>
                <span />
                <div style={{ fontSize:13, color:T.text, fontFamily:"monospace" }}>{s.component}</div>
                <div style={{ fontSize:12, color:T.textMid }}>{s.repo}</div>
                <div>{s.breaking ? <Badge text="BREAKING" color={T.red} /> : <Badge text="safe" color={T.green} />}</div>
                <Badge text={s.status} color={statusColor(s.status)} />
                <Btn label="View PR" small />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function SecurityPage() {
  return (
    <div style={{ flex:1, overflow:"auto", background:T.bg }}>
      <TopBar title="Security" subtitle="CVE monitoring across your entire portfolio" actions={[<Btn key="s" label="Run CVE Scan" primary />]} />
      <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Summary */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          <StatCard label="CRITICAL" value={VULNS.filter(v=>v.severity==="Critical").length} sub="Immediate action needed" color={T.red} />
          <StatCard label="HIGH" value={VULNS.filter(v=>v.severity==="High").length} sub="Fix within 7 days" color={T.orange} />
          <StatCard label="MEDIUM" value={VULNS.filter(v=>v.severity==="Medium").length} sub="Fix within 30 days" color={T.yellow} />
          <StatCard label="LOW" value={VULNS.filter(v=>v.severity==="Low").length} sub="Monitor" color={T.textSub} />
        </div>

        {/* CVE Table */}
        <Card>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:600, color:T.text }}>Active Vulnerabilities</span>
            <Btn label="Generate Patch PRs for All" primary />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"140px 160px 100px 60px 100px 120px 100px", padding:"10px 18px", borderBottom:`1px solid ${T.border}`, fontSize:10, color:T.textSub, letterSpacing:"0.1em", fontWeight:600 }}>
            <span>PACKAGE</span><span>CVE ID</span><span>SEVERITY</span><span>REPOS</span><span>PATCHED</span><span>CURRENT</span><span>ACTION</span>
          </div>
          {VULNS.map(v => (
            <div key={v.id} style={{ display:"grid", gridTemplateColumns:"140px 160px 100px 60px 100px 120px 100px", padding:"14px 18px", borderBottom:`1px solid ${T.border}22`, alignItems:"center" }}>
              <div style={{ fontSize:13, color:T.text, fontWeight:600, fontFamily:"monospace" }}>{v.pkg}</div>
              <div style={{ fontSize:11, color:T.textSub, fontFamily:"monospace" }}>{v.cve}</div>
              <div><Dot color={sevColor(v.severity)} /><span style={{ fontSize:12, color:sevColor(v.severity) }}>{v.severity}</span></div>
              <div style={{ fontSize:13, color:T.textMid, fontWeight:700 }}>{v.repos}</div>
              <div style={{ fontSize:12, color:T.green, fontFamily:"monospace" }}>{v.patched}</div>
              <div style={{ fontSize:12, color:T.orange, fontFamily:"monospace" }}>{v.current}</div>
              <Btn label="Patch PRs" small primary />
            </div>
          ))}
        </Card>

        {/* Repo exposure */}
        <Card>
          <div style={{ padding:"14px 18px", borderBottom:`1px solid ${T.border}` }}>
            <span style={{ fontSize:13, fontWeight:600, color:T.text }}>Exposure by Repository</span>
          </div>
          {REPOS.filter(r=>r.role==="consumer").map(r => {
            const score = r.health;
            return (
              <div key={r.id} style={{ display:"flex", alignItems:"center", padding:"12px 18px", borderBottom:`1px solid ${T.border}22`, gap:16 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:T.text, fontWeight:500 }}>{r.name}</div>
                  <div style={{ fontSize:10, color:T.textSub }}>{r.client}</div>
                </div>
                <div style={{ width:180, height:4, background:T.border, borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(5-["A","B","C","D","F"].indexOf(score))*20}%`, background:healthColor(score), borderRadius:2 }} />
                </div>
                <div style={{ fontSize:18, fontWeight:800, color:healthColor(score), width:28, textAlign:"center" }}>{score}</div>
                <Btn label="View Details" small />
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function SettingsPage() {
  const [tab, setTab] = useState("org");
  const tabs = [["org","Organization"],["github","GitHub App"],["notifications","Notifications"],["billing","Billing"],["team","Team"]];
  return (
    <div style={{ flex:1, overflow:"auto", background:T.bg }}>
      <TopBar title="Settings" subtitle="Configure your organization and integrations" />
      <div style={{ display:"flex", borderBottom:`1px solid ${T.border}`, padding:"0 28px" }}>
        {tabs.map(([id,label]) => (
          <button key={id} onClick={()=>setTab(id)} style={{
            background:"none", border:"none", padding:"12px 16px", fontSize:12, fontFamily:"inherit", cursor:"pointer", letterSpacing:"0.06em",
            color: tab===id ? T.green : T.textSub,
            borderBottom: tab===id ? `2px solid ${T.green}` : "2px solid transparent",
          }}>{label.toUpperCase()}</button>
        ))}
      </div>
      <div style={{ padding:"28px" }}>
        {tab === "org" && (
          <div style={{ maxWidth:520, display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ fontSize:13, color:T.textSub, marginBottom:4 }}>Organization details and preferences.</div>
            {[["Organization Name","Studio Alpha"],["Slug","studio-alpha"],["Default Branch","main"],["Component Detection","Import path + file hash"]].map(([label,val])=>(
              <div key={label}>
                <div style={{ fontSize:11, color:T.textSub, letterSpacing:"0.08em", marginBottom:6, fontWeight:600 }}>{label.toUpperCase()}</div>
                <input defaultValue={val} style={{ width:"100%", background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:7, padding:"9px 12px", color:T.text, fontSize:13, fontFamily:"inherit", outline:"none" }} />
              </div>
            ))}
            <Btn label="Save Changes" primary />
          </div>
        )}
        {tab === "github" && (
          <div style={{ maxWidth:520 }}>
            <Card style={{ padding:"20px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ width:40, height:40, borderRadius:8, background:`${T.green}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>⬡</div>
                <div>
                  <div style={{ fontSize:14, color:T.text, fontWeight:600 }}>GitHub App Connected</div>
                  <div style={{ fontSize:11, color:T.green }}>✓ studio-alpha · 8 repos accessible</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {["Repository contents (read/write)","Pull requests (write)","Webhooks (read)","Metadata (read)"].map(p=>(
                  <div key={p} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:T.textMid }}>
                    <span style={{ color:T.green }}>✓</span> {p}
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14, display:"flex", gap:8 }}>
                <Btn label="Reconfigure App" />
                <Btn label="Disconnect" />
              </div>
            </Card>
          </div>
        )}
        {tab === "notifications" && (
          <div style={{ maxWidth:520, display:"flex", flexDirection:"column", gap:12 }}>
            {[
              ["Sync PR opened","Notify when AppInit opens a PR","Slack","Email"],
              ["Breaking change detected","Alert on breaking component updates","Slack","Email"],
              ["Critical CVE found","Alert on critical vulnerabilities","Slack","Email"],
              ["Weekly digest","Summary of portfolio health","—","Email"],
            ].map(([title,sub,c1,c2])=>(
              <Card key={title} style={{ padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:13, color:T.text, fontWeight:500 }}>{title}</div>
                  <div style={{ fontSize:11, color:T.textSub }}>{sub}</div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {[c1,c2].filter(x=>x!=="—").map(ch=>(
                    <Badge key={ch} text={ch} color={T.green} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
        {tab === "billing" && (
          <div style={{ maxWidth:520 }}>
            <Card style={{ padding:"20px", marginBottom:16 }}>
              <div style={{ fontSize:11, color:T.textSub, letterSpacing:"0.08em", marginBottom:4 }}>CURRENT PLAN</div>
              <div style={{ fontSize:24, fontWeight:800, color:T.green, letterSpacing:"-0.02em" }}>Agency</div>
              <div style={{ fontSize:13, color:T.textSub, marginBottom:16 }}>$199/month · Renews July 25, 2026</div>
              {[["Repositories","8 / 25 used"],["Components","47 / unlimited"],["Sync PRs this month","23"],["AI Credits","12 / 50 used"]].map(([k,v])=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${T.border}`, fontSize:12 }}>
                  <span style={{ color:T.textSub }}>{k}</span>
                  <span style={{ color:T.text }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:16, display:"flex", gap:8 }}>
                <Btn label="Upgrade to Studio" primary />
                <Btn label="Manage Billing" />
              </div>
            </Card>
          </div>
        )}
        {tab === "team" && (
          <div style={{ maxWidth:520 }}>
            {[
              { name:"You (Owner)", email:"you@studio.co", role:"Owner",  avatar:"YO" },
              { name:"Sarah Chen",  email:"sarah@studio.co",role:"Admin",  avatar:"SC" },
              { name:"Dev Patel",   email:"dev@studio.co",  role:"Member", avatar:"DP" },
              { name:"Maria K.",    email:"maria@studio.co",role:"Member", avatar:"MK" },
            ].map(m => (
              <Card key={m.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 18px", marginBottom:8 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:`${T.green}20`, border:`1px solid ${T.green}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:T.green, fontWeight:700 }}>{m.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:T.text, fontWeight:500 }}>{m.name}</div>
                  <div style={{ fontSize:11, color:T.textSub }}>{m.email}</div>
                </div>
                <Badge text={m.role} color={m.role==="Owner" ? T.green : m.role==="Admin" ? T.blue : T.textSub} />
              </Card>
            ))}
            <Btn label="+ Invite Teammate" primary />
          </div>
        )}
      </div>
    </div>
  );
}

// ── APP ROOT ───────────────────────────────────────────────────────
export default function AppInit() {
  const [page, setPage] = useState("dashboard");
  const [onboarding, setOnboarding] = useState(true);
  const [onboardStep, setOnboardStep] = useState(0);

  const ONBOARD_STEPS = [
    { title:"Connect your GitHub org", desc:"Install the AppInit GitHub App on your organization. We'll request read/write access to repos and pull requests only.", icon:"⬡", action:"Install GitHub App →" },
    { title:"Select repos to monitor", desc:"Choose which repos are component sources and which are consumers. AppInit will scan them and build the initial component map.", icon:"◈", action:"Select Repositories →" },
    { title:"Configure alerts", desc:"Set up Slack and email notifications so your team is alerted when components drift or CVEs are detected.", icon:"◆", action:"Connect Slack →" },
    { title:"You're live 🎉", desc:"AppInit is now monitoring your portfolio. Open the dashboard to see your portfolio health and pending sync PRs.", icon:"✅", action:"Go to Dashboard →" },
  ];

  if (onboarding) {
    const step = ONBOARD_STEPS[onboardStep];
    return (
      <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'JetBrains Mono', 'Fira Code', monospace" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>
        <div style={{ maxWidth:520, width:"100%", padding:"0 24px" }}>
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ fontSize:28, fontWeight:800, color:T.green, letterSpacing:"-0.03em" }}>@appinit</div>
            <div style={{ fontSize:11, color:T.textSub, marginTop:4, letterSpacing:"0.1em" }}>AGENCY PORTFOLIO OS</div>
          </div>
          {/* Progress */}
          <div style={{ display:"flex", gap:6, marginBottom:32 }}>
            {ONBOARD_STEPS.map((_,i) => (
              <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= onboardStep ? T.green : T.border }} />
            ))}
          </div>
          {/* Step card */}
          <Card style={{ padding:"32px" }}>
            <div style={{ fontSize:40, marginBottom:16, textAlign:"center" }}>{step.icon}</div>
            <div style={{ fontSize:11, color:T.textSub, letterSpacing:"0.1em", textAlign:"center", marginBottom:8 }}>STEP {onboardStep+1} OF {ONBOARD_STEPS.length}</div>
            <div style={{ fontSize:20, fontWeight:700, color:T.text, textAlign:"center", marginBottom:12, letterSpacing:"-0.01em" }}>{step.title}</div>
            <div style={{ fontSize:13, color:T.textSub, textAlign:"center", lineHeight:1.7, marginBottom:28 }}>{step.desc}</div>
            <button
              onClick={() => onboardStep < ONBOARD_STEPS.length-1 ? setOnboardStep(s=>s+1) : setOnboarding(false)}
              style={{ width:"100%", background:T.green, color:T.bg, border:"none", borderRadius:8, padding:"13px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", letterSpacing:"0.04em" }}>
              {step.action}
            </button>
            {onboardStep > 0 && (
              <button onClick={()=>setOnboardStep(s=>s-1)} style={{ width:"100%", background:"transparent", color:T.textSub, border:"none", marginTop:10, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
            )}
          </Card>
        </div>
      </div>
    );
  }

  const pages = { dashboard:<DashboardPage />, repos:<ReposPage />, registry:<RegistryPage />, syncs:<SyncsPage />, security:<SecurityPage />, settings:<SettingsPage /> };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:T.bg, fontFamily:"'JetBrains Mono', 'Fira Code', monospace", fontSize:13, color:T.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#1E2840;border-radius:2px;} button,input{font-family:inherit;} input::placeholder{color:#475569;}`}</style>
      <Sidebar page={page} setPage={setPage} />
      {pages[page] || <DashboardPage />}
    </div>
  );
}
