const { useState, useEffect, useRef } = React;

// ——— small util ———
function useTypewriter(text, speed = 24, start = true){
  const [out, setOut] = useState("");
  useEffect(()=>{
    if(!start){ setOut(""); return; }
    let i=0; setOut("");
    const id = setInterval(()=>{
      i++; setOut(text.slice(0,i));
      if(i>=text.length) clearInterval(id);
    }, speed);
    return ()=>clearInterval(id);
  },[text,start,speed]);
  return out;
}

function useInView(ref, threshold=0.2){
  const [seen,setSeen] = useState(false);
  useEffect(()=>{
    if(!ref.current||seen) return;
    const io = new IntersectionObserver((es)=>{
      es.forEach(e=>{ if(e.isIntersecting){ setSeen(true); io.disconnect(); }});
    },{threshold});
    io.observe(ref.current);
    return ()=>io.disconnect();
  },[ref,seen,threshold]);
  return seen;
}

// ——— NAV ———
function Nav(){
  return (
    <nav className="top">
      <div className="container nav-inner">
        <a href="#" className="brand">
          <span className="brand-mark"></span>
          Incubest
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#ai">AI</a>
          <a href="#passport">Passport</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="nav-cta">
          <a href="Login.html" className="btn btn-ghost" style={{padding:"8px 14px"}}>Log in</a>
          <a href="Register.html" className="btn btn-primary">Get started <span style={{fontFamily:'JetBrains Mono, monospace'}}>↗</span></a>
        </div>
      </div>
    </nav>
  );
}

// ——— HERO ———
function Hero(){
  const heroRef = useRef(null);
  const [mouse, setMouse] = useState({x: 0.7, y: 0.4});
  useEffect(()=>{
    const onMove = (e)=>{
      const r = heroRef.current?.getBoundingClientRect();
      if(!r) return;
      setMouse({x:(e.clientX-r.left)/r.width, y:(e.clientY-r.top)/r.height});
    };
    window.addEventListener('mousemove', onMove);
    return ()=>window.removeEventListener('mousemove', onMove);
  },[]);

  return (
    <header ref={heroRef} className="hero">
      <div className="spot" style={{left:`calc(${mouse.x*100}% - 280px)`, top:`calc(${mouse.y*100}% - 280px)`}}></div>
      <div className="container hero-grid">
        <div>
          <div className="pill"><span className="dot"></span> India's first AI-powered incubator OS</div>
          <h1>
            The <em>operating system</em> for incubators that actually <span className="strike">work</span>.
          </h1>
          <p className="lead">
            Manage programs, track startups, generate grantor reports, and let AI surface what matters — all in one place. Built for AIM, RKVY, DST, and every incubator in between.
          </p>
          <div className="hero-ctas">
            <a href="Register.html" className="btn btn-primary" style={{padding:"14px 22px",fontSize:15}}>Get started free <span className="mono">→</span></a>
            <a href="#features" className="btn btn-ghost" style={{padding:"14px 22px",fontSize:15}}>See how it works</a>
          </div>
          <div className="hero-meta">// FREE FOR 2 MONTHS · NO CREDIT CARD REQUIRED</div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="num">42<span style={{color:'#B5E300'}}>+</span></div><div className="lbl">Programs supported</div></div>
            <div className="hero-stat"><div className="num">1.2k</div><div className="lbl">Startups tracked</div></div>
            <div className="hero-stat"><div className="num">23%</div><div className="lbl">Avg. revenue lift</div></div>
          </div>
        </div>
        <AIPanel/>
      </div>
    </header>
  );
}

// ——— LIVE REPORTS DASHBOARD ———
const REPORT_STREAM = [
  {co:"NovaTech AI",  sec:"SaaS",     met:"Revenue", val:"₹84L",  delta:"+18%", status:"good"},
  {co:"GreenLeaf",    sec:"AgriTech", met:"MRR",     val:"₹42L",  delta:"+40%", status:"hot"},
  {co:"Beacon Labs",  sec:"DeepTech", met:"Burn",    val:"₹12L",  delta:"-8%",  status:"good"},
  {co:"Kavach Health",sec:"HealthTech",met:"Users",  val:"24,800",delta:"+62%", status:"hot"},
  {co:"Praan Energy", sec:"CleanTech",met:"Pilots",  val:"7",     delta:"+3",   status:"good"},
  {co:"Mira Robotics",sec:"Robotics", met:"Revenue", val:"₹0",    delta:"—",    status:"warn"},
  {co:"Lotus Fintech",sec:"FinTech",  met:"GMV",     val:"₹2.1Cr",delta:"+27%", status:"good"},
  {co:"Saanjh Edu",   sec:"EdTech",   met:"DAU",     val:"11,200",delta:"+15%", status:"good"},
  {co:"Anvaya Bio",   sec:"BioTech",  met:"Trials",  val:"3",     delta:"+1",   status:"good"},
];

function AIPanel(){
  const ref = useRef(null);
  const seen = useInView(ref);
  const [reports, setReports] = useState([]);
  const [received, setReceived] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [compliance, setCompliance] = useState(0);
  const [aiPhase, setAiPhase] = useState(0); // 0 idle, 1 thinking, 2 insight ready
  const idxRef = useRef(0);

  // Stream reports one at a time
  useEffect(()=>{
    if(!seen) return;
    const tick = ()=>{
      const item = REPORT_STREAM[idxRef.current % REPORT_STREAM.length];
      idxRef.current += 1;
      setReports(prev => [{...item, id:idxRef.current, t:Date.now()}, ...prev].slice(0,4));
      setReceived(r => r+1);
    };
    tick(); // immediate
    const id = setInterval(tick, 1600);
    return ()=>clearInterval(id);
  },[seen]);

  // Animate counters
  useEffect(()=>{
    if(!seen) return;
    const target = {rev:23, comp:89};
    const start = performance.now();
    const dur = 1800;
    let raf;
    const step = (now)=>{
      const p = Math.min(1,(now-start)/dur);
      const e = 1 - Math.pow(1-p, 3);
      setRevenue(target.rev*e);
      setCompliance(target.comp*e);
      if(p<1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return ()=>cancelAnimationFrame(raf);
  },[seen]);

  // AI processing cycle
  useEffect(()=>{
    if(!seen) return;
    const cycle = ()=>{
      setAiPhase(1);
      setTimeout(()=>setAiPhase(2), 2200);
      setTimeout(()=>setAiPhase(0), 5500);
    };
    const t = setTimeout(cycle, 2400);
    const id = setInterval(cycle, 7500);
    return ()=>{clearTimeout(t);clearInterval(id)};
  },[seen]);

  const insights = [
    "GreenLeaf growing 40% MoM — flag for Series A readiness review.",
    "NovaTech revenue jumped 18% — driven by enterprise deals.",
    "Kavach Health user growth outpacing cohort by 3.2x.",
    "Mira Robotics: zero revenue · recommend mentor intro.",
  ];
  const aiInsight = insights[(idxRef.current-1) % insights.length] || insights[0];

  return (
    <div ref={ref} style={{position:'relative'}}>
      <div className="floaty f1">
        <div className="ic">↑</div>
        <div><div className="l">Reports today</div><div className="v">{received} synced</div></div>
      </div>
      <div className="floaty f2">
        <div className="ic" style={{background:'#D4FF3A',color:'#0b0b0b'}}>AI</div>
        <div><div className="l">Live insight</div><div className="v">processing…</div></div>
      </div>

      <div className="ai-panel">
        <div className="ai-head">
          <div className="title">
            <div className="ai-mark">IB</div>
            Live Portfolio · <span className="mono" style={{color:'#9a9a92',fontSize:11,letterSpacing:'.08em'}}>Q1 2026</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,fontFamily:'JetBrains Mono, monospace',fontSize:11,color:'#9a9a92'}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#D4FF3A',boxShadow:'0 0 0 0 rgba(212,255,58,.6)',animation:'pulse 1.6s infinite'}}></span>
            LIVE
          </div>
        </div>

        {/* counters */}
        <div className="card-stats" style={{borderRadius:14,overflow:'hidden',background:'#ffffff10',marginBottom:12}}>
          <div className="card-stat" style={{background:'#ffffff06',color:'#fff'}}>
            <span className="v good" style={{color:'#D4FF3A'}}>+{revenue.toFixed(1)}%</span>
            <span className="l" style={{color:'#9a9a92'}}>Revenue Growth</span>
          </div>
          <div className="card-stat" style={{background:'#ffffff06',color:'#fff'}}>
            <span className="v" style={{color:'#fff'}}>{Math.round(compliance)}%</span>
            <span className="l" style={{color:'#9a9a92'}}>Report Compliance</span>
          </div>
        </div>

        {/* Streaming reports */}
        <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:188,overflow:'hidden',position:'relative'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontFamily:'JetBrains Mono, monospace',fontSize:10.5,color:'#9a9a92',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:2}}>
            <span>Incoming reports</span>
            <span>{received} / 42 synced</span>
          </div>
          {reports.map(r=>(
            <div key={r.id} className="rpt-row">
              <div className="rpt-co">
                <span className={`rpt-dot ${r.status}`}></span>
                <span style={{fontSize:13,color:'#fff'}}>{r.co}</span>
                <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:10,color:'#7a7a72',letterSpacing:'.04em'}}>· {r.sec}</span>
              </div>
              <div className="rpt-met">
                <span style={{fontFamily:'JetBrains Mono, monospace',fontSize:10.5,color:'#9a9a92'}}>{r.met}</span>
                <span style={{fontSize:13,fontWeight:500,color:'#fff'}}>{r.val}</span>
                <span className={`rpt-delta ${r.status}`}>{r.delta}</span>
              </div>
            </div>
          ))}
        </div>

        {/* AI strip */}
        <div className={`ai-strip ${aiPhase>0?'on':''}`}>
          {aiPhase===0 && (
            <><span className="ai-pulse"></span><span className="mono" style={{color:'#9a9a92',fontSize:11.5,letterSpacing:'.06em'}}>AI watching · idle</span></>
          )}
          {aiPhase===1 && (
            <><span className="spinner" style={{width:11,height:11,borderTopColor:'#D4FF3A'}}></span>
            <span className="mono" style={{color:'#cfcfc8',fontSize:11.5}}>Analyzing 42 reports…</span></>
          )}
          {aiPhase===2 && (
            <><span style={{color:'#D4FF3A',fontFamily:'JetBrains Mono, monospace',fontSize:13,fontWeight:600}}>★</span>
            <span style={{color:'#e9e7e0',fontSize:12.5,lineHeight:1.4}}>{aiInsight}</span></>
          )}
        </div>
      </div>
    </div>
  );
}

// ——— PROGRAMS ———
function Programs(){
  const items = [
    {b:"AIM",n:"Atal Innovation Mission",s:"Niti Aayog"},
    {b:"RKVY",n:"RAFTAAR",s:"Agriculture"},
    {b:"DST",n:"NIDHI",s:"Science & Tech"},
    {b:"DPIIT",n:"Recognized",s:"Govt of India"},
    {b:"BIRAC",n:"BioNEST",s:"Biotech"},
    {b:"TIDE",n:"TIDE 2.0",s:"MeitY"},
    {b:"+",n:"State programs",s:"All India"},
  ];
  return (
    <section className="programs">
      <div className="container">
        <div className="label"><span>Trusted by India's top programs</span></div>
        <div className="marquee">
          {items.map((it,i)=>(
            <div className="prg" key={i}>
              <div className="badge">{it.b}</div>
              <div>
                <div className="name">{it.n}</div>
                <div className="sub">{it.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ——— FEATURES ———
function Features(){
  const feats = [
    {ic:"PM",t:"Program Management",d:"Create AIM, RKVY, DST programs with verticals, cohorts, and custom reporting cycles."},
    {ic:"SO",t:"Startup Onboarding",d:"Add startups individually or via bulk CSV. Generate join links. Cross-incubator detection built-in."},
    {ic:"SR",t:"Smart Reports",d:"Configurable templates per program. Auto-sync metrics. Review with structured feedback."},
    {ic:"AI",t:"AI Chat",d:"Ask anything about your portfolio. Get insights, recommendations, and answers in seconds."},
    {ic:"GR",t:"Grantor Reports",d:"One-click PDFs for AIM, DST, RKVY. Data auto-aggregated from every startup in your cohort."},
    {ic:"SP",t:"Startup Passport",d:"Unique verified ID for every startup. Cross-incubator verification via DPIIT, CIN, PAN."},
    {ic:"MP",t:"Marketplace",d:"List your facilities. Startups across India can discover and request access in one click."},
    {ic:"FB",t:"Form Builder",d:"Investment forms, call-for-entries, due diligence. Drag-and-drop, like the docs you already know."},
  ];
  return (
    <section id="features" className="features">
      <div className="container">
        <div className="sect-head">
          <div>
            <div className="num">/ 02 — PLATFORM</div>
            <h2>Eight tools. <em>One</em> incubator OS.</h2>
          </div>
          <div className="right">Replace the 12 spreadsheets, 4 form tools, and 2 PDFs you currently juggle. Built specifically for the way Indian incubators actually run programs.</div>
        </div>
        <div className="feat-grid">
          {feats.map((f,i)=>(
            <div className="feat" key={i}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div className="ic">{f.ic}</div>
                <div className="idx">0{i+1}</div>
              </div>
              <div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
              <div className="arrow">↗</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ——— AI SECTION ———
function AISection(){
  const items = [
    {h:"Portfolio Intelligence",p:"AI reads every startup report and surfaces what needs your attention this week."},
    {h:"Predictive Insights",p:"Identify high-potential startups and at-risk ventures months before it shows up in metrics."},
    {h:"Smart Alerts",p:"Get notified when a startup misses reports, burns cash too fast, or stalls on milestones."},
    {h:"Auto Reports",p:"Generate AIM, DST, RKVY quarterly reports in one click. AI aggregates all the data."},
  ];
  return (
    <section id="ai" className="ai-sect">
      <div className="container">
        <div className="sect-head">
          <div>
            <div className="num" style={{color:'#bdbcb4'}}>/ 03 — INTELLIGENCE</div>
            <h2>AI that understands<br/>your <em>entire</em> incubator.</h2>
          </div>
          <div className="right">Not a chatbot bolted on. AI is woven through every screen — chat, alerts, insights, report generation. The more you use it, the sharper it gets.</div>
        </div>

        <div className="ai-grid">
          <div className="ai-left">
            <div className="ins">
              <div className="head"><span className="pulse"></span> AI Insight · 2 min ago</div>
              <div className="body">Your portfolio revenue grew <b>+23%</b> this quarter. Three startups — <b>NovaTech</b>, <b>GreenLeaf</b>, and <b>Beacon Labs</b> — contributed <b>60%</b> of that growth.</div>
            </div>
            <div className="ins">
              <div className="head warn"><span className="pulse"></span> Attention Needed · NovaTech</div>
              <div className="body">No reports submitted for <b>2 months</b>. Burn rate analysis suggests roughly <b>4 months runway</b> remaining. Consider reaching out this week.</div>
            </div>
            <div className="ins">
              <div className="head"><span className="pulse"></span> Opportunity · GreenLeaf Agri</div>
              <div className="body">Growing <b>40% MoM</b> with strong unit economics. Recommend Series A readiness review and intro to <b>3 matched investors</b>.</div>
            </div>
            <div className="ins">
              <div className="head"><span className="pulse"></span> Report Ready · AIM Q1</div>
              <div className="body"><b>AIM Q1 Quarterly Report</b> generated — 42 startups, all metrics aggregated. Ready to download as PDF.</div>
            </div>
          </div>

          <div className="ai-right">
            <div className="features-list">
              {items.map((it,i)=>(
                <div className="item" key={i}>
                  <div className="n">0{i+1}</div>
                  <div>
                    <h4>{it.h}</h4>
                    <p>{it.p}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="#" className="btn btn-lime" style={{marginTop:32,padding:"14px 22px",fontSize:15}}>Try AI Chat <span className="mono">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ——— PASSPORT ———
function Passport(){
  return (
    <section id="passport" className="passport">
      <div className="container">
        <div className="sect-head">
          <div>
            <div className="num">/ 04 — IDENTITY</div>
            <h2>One <em>identity</em>.<br/>Every incubator. All of India.</h2>
          </div>
          <div className="right">Every startup gets a unique verified Passport ID. Incubators verify history. Startups carry their track record across the entire ecosystem.</div>
        </div>

        <div className="pass-grid">
          <div>
            <div className="pass-card">
              <div className="pass-top">
                <div>
                  <div className="label">Incubest · Startup Passport</div>
                  <div className="id">IB-2026-MH-0042</div>
                </div>
                <div className="verified">● Verified</div>
              </div>
              <div className="pass-chip"></div>
              <div>
                <div className="pass-name">TechCorp Innovations</div>
                <div className="pass-meta">SaaS · B2B · Mumbai · DPIIT-Recognized</div>
                <div className="pass-stats">
                  <div className="pass-stat"><div className="v">2</div><div className="l">Incubators</div></div>
                  <div className="pass-stat"><div className="v">₹1.2 Cr</div><div className="l">Raised</div></div>
                  <div className="pass-stat"><div className="v">12</div><div className="l">Team</div></div>
                </div>
              </div>
            </div>
            <div className="pass-caption">Public passport page · incubest.in/p/IB-2026-MH-0042</div>
          </div>

          <div>
            <div className="pass-cols">
              <div className="pass-col">
                <h5>For Incubators</h5>
                <ul>
                  <li>Verify if a startup is incubated elsewhere</li>
                  <li>Detect duplicate applications via DPIIT, CIN, PAN</li>
                  <li>View complete incubation history</li>
                  <li>Reduce fraud and overlap in your programs</li>
                </ul>
              </div>
              <div className="pass-col">
                <h5>For Startups</h5>
                <ul>
                  <li>Verified identity across all incubators</li>
                  <li>Carry your track record everywhere</li>
                  <li>Access the AI business advisor 24/7</li>
                  <li>Submit reports from one dashboard</li>
                </ul>
              </div>
              <div className="pass-col">
                <h5>Pan-India Visibility</h5>
                <ul>
                  <li>Browse labs, coworking, and services</li>
                  <li>Request access to facilities nationwide</li>
                  <li>Connect with mentors and investors</li>
                </ul>
              </div>
              <div className="pass-col">
                <h5>Trusted Ecosystem</h5>
                <ul>
                  <li>DPIIT instant verification</li>
                  <li>CIN and PAN cross-checking</li>
                  <li>Founder email matching across networks</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ——— DIFFERENTIATORS ———
function Diffs(){
  const items = [
    {n:"01",t:"AI-first, not an afterthought",d:"Every feature is powered by AI. Chat, insights, report generation. Your co-pilot understands your portfolio.",cls:"lime"},
    {n:"02",t:"Cross-incubator verification",d:"Startup Passport gives every startup a verified identity. Detect overlaps. Share data across ecosystems.",cls:""},
    {n:"03",t:"One-click grantor reports",d:"AIM, DST, RKVY formats built-in. Data flows automatically from startup reports to grantor PDFs.",cls:"dark"},
    {n:"04",t:"Enterprise-grade security",d:"Role-based access, encrypted data, rate limiting, input sanitization. Your data stays yours.",cls:""},
    {n:"05",t:"Made for the Indian ecosystem",d:"DPIIT numbers, CIN, PAN matching. State-wise tracking. Rupee-first. Built by incubators, for incubators.",cls:"dark"},
    {n:"06",t:"Set up in under 5 minutes",d:"Register, onboard your first cohort, and let AI handle the rest. Zero training. Zero migration headaches.",cls:"lime"},
  ];
  return (
    <section className="diffs">
      <div className="container">
        <div className="sect-head">
          <div>
            <div className="num">/ 05 — WHAT MAKES US DIFFERENT</div>
            <h2>Six reasons<br/>incubators <em>switch</em>.</h2>
          </div>
          <div className="right">Most incubator software was built before AI was useful and before India had a national startup ecosystem. We started fresh.</div>
        </div>
        <div className="diff-grid">
          {items.map((it,i)=>(
            <div className={"diff "+it.cls} key={i}>
              <div className="num">/ {it.n}</div>
              <h4>{it.t}</h4>
              <p>{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ——— HOW ———
function How(){
  return (
    <section className="how">
      <div className="container">
        <div className="sect-head">
          <div>
            <div className="num">/ 06 — GETTING STARTED</div>
            <h2>From zero to AI-powered<br/>in <em>under 5 minutes</em>.</h2>
          </div>
          <div className="right">No demo calls required. No onboarding fees. Just register and start.</div>
        </div>
        <div className="steps">
          <div className="step-conn"></div>
          <div className="step">
            <div className="n">1</div>
            <h4>Register your incubator</h4>
            <p>Create an account and set up your first program — AIM, RKVY, DST or custom — in two clicks.</p>
          </div>
          <div className="step">
            <div className="n">2</div>
            <h4>Onboard your startups</h4>
            <p>Bulk upload via CSV, share join links, or add individually. Cross-incubator detection runs automatically.</p>
          </div>
          <div className="step">
            <div className="n">3</div>
            <h4>Let AI do the rest</h4>
            <p>Reports, insights, alerts, grantor PDFs — all automated. You focus on your founders.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ——— PRICING ———
function Pricing(){
  return (
    <section id="pricing" className="pricing">
      <div className="container">
        <div className="sect-head">
          <div>
            <div className="num" style={{color:'#bdbcb4'}}>/ 07 — PRICING</div>
            <h2>Start free.<br/>Scale when <em>you're</em> ready.</h2>
          </div>
          <div className="right">Two months free, all features included. No credit card. No hidden tiers. No per-startup fees.</div>
        </div>
        <div className="price-grid">
          <div className="plan">
            <h3>Free Trial</h3>
            <div className="price">
              <span className="amt">₹0</span>
              <span className="per">for 2 months</span>
            </div>
            <p style={{color:'#bdbcb4',fontSize:14,margin:0}}>Everything you need to run a full cohort. No commitment.</p>
            <ul>
              <li>All features included</li>
              <li>Unlimited startups</li>
              <li>AI chat and insights</li>
              <li>No credit card needed</li>
            </ul>
            <div className="cta"><a href="Register.html" className="btn btn-ghost" style={{borderColor:'#ffffff30',color:'#fff'}}>Start free trial</a></div>
          </div>
          <div className="plan pro">
            <div className="ribbon">Recommended</div>
            <h3>Pro</h3>
            <div className="price">
              <span className="amt">₹4,999</span>
              <span className="per">/ month · after trial</span>
            </div>
            <p style={{margin:0,fontSize:14}}>Unlock the full ecosystem — Passport, Marketplace, grantor PDFs, team management.</p>
            <ul>
              <li>Everything in Free</li>
              <li>Unlimited programs</li>
              <li>Startup Passport system</li>
              <li>Marketplace access</li>
              <li>Team management</li>
              <li>Grantor report PDFs</li>
              <li>Priority support</li>
            </ul>
            <div className="cta"><a href="Register.html" className="btn btn-primary">Get started</a></div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ——— FINAL CTA ———
function Final(){
  return (
    <section className="final">
      <div className="container">
        <h2>The only platform built<br/>to run your incubator at <em>any <span className="underline">scale</span></em>.</h2>
        <div className="cta-row">
          <a href="Register.html" className="btn btn-primary" style={{padding:"16px 28px",fontSize:16}}>Get started free <span className="mono">→</span></a>
          <a href="#" className="btn btn-ghost" style={{padding:"16px 28px",fontSize:16}}>Book a demo</a>
        </div>
      </div>
    </section>
  );
}

// ——— FOOTER ———
function Footer(){
  return (
    <footer>
      <div className="container">
        <div className="foot-top">
          <div className="col1">
            <a href="#" className="brand" style={{color:'#fff'}}>
              <span className="brand-mark"></span>
              Incubest
            </a>
            <p>The OS for Indian startup incubators. Built by incubators, for incubators.</p>
          </div>
          <div>
            <h6>Product</h6>
            <ul><li>Features</li><li>AI Insights</li><li>Pricing</li><li>Get Started</li></ul>
          </div>
          <div>
            <h6>For Incubators</h6>
            <ul><li>Program Management</li><li>Grantor Reports</li><li>Team Management</li><li>Impact Dashboard</li></ul>
          </div>
          <div>
            <h6>For Startups</h6>
            <ul><li>Startup Passport</li><li>Marketplace</li><li>AI Advisor</li><li>Milestone Tracking</li></ul>
          </div>
          <div>
            <h6>Company</h6>
            <ul><li>Privacy Policy</li><li>Terms of Service</li><li>Contact Us</li></ul>
          </div>
        </div>
        <div className="foot-bot">
          <div>© 2026 INCUBEST · ALL RIGHTS RESERVED</div>
          <div className="right">PROUDLY POWERED BY FOUNDATION OF AIC-AAU INCUBATOR (NEATEHUB)</div>
        </div>
      </div>
    </footer>
  );
}

function App(){
  return (
    <>
      <Nav/>
      <Hero/>
      <Programs/>
      <Features/>
      <AISection/>
      <Passport/>
      <Diffs/>
      <How/>
      <Pricing/>
      <Final/>
      <Footer/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
