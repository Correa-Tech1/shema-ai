import { useState, useEffect } from "react";
import { supabase, supabaseReady } from "./supabaseClient.js";
import Shema, { setStorageUser } from "./Shema.jsx";

const V = { verde: "#1D9E75", verdeE: "#085041", roxo: "#7F77DD", amarelo: "#F5C842", amareloE: "#7A5800", bg: "#FDF8F0", };

export default function AuthGate() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [splash, setSplash] = useState(true);
  const [mode, setMode] = useState("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!supabaseReady) { setChecking(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) setStorageUser(data.session.user.id);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setStorageUser(s ? s.user.id : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit() {
    if (!email.trim() || !password || busy) return;
    setBusy(true); setError(null); setInfo(null);
    try {
      if (mode === "criar") {
        const { error: e } = await supabase.auth.signUp({ email: email.trim(), password });
        if (e) throw e;
        const { data } = await supabase.auth.getSession();
        if (!data.session) setInfo("Conta criada! Verifique seu email se necessário.");
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (e) throw e;
      }
    } catch (e) {
      const msg = String(e?.message || e);
      if (/invalid login/i.test(msg)) setError("Email ou senha incorretos.");
      else if (/already registered/i.test(msg)) setError("Esse email já tem conta. Tente entrar.");
      else if (/password.*6/i.test(msg)) setError("Senha precisa ter ao menos 6 caracteres.");
      else setError("Não consegui agora. Tente novamente.");
    } finally { setBusy(false); }
  }

  async function signOut() {
    if (supabaseReady) await supabase.auth.signOut();
    setStorageUser(null); setSession(null);
  }

  // ── SPLASH ──
  if (splash) return (
    <div style={{ minHeight:"100vh", background:V.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <svg width="80" height="80" viewBox="0 0 68 68">
        <rect width="68" height="68" rx="18" fill={V.verde}/>
        <rect x="4" y="4" width="60" height="60" rx="14" fill={V.verdeE}/>
        <text x="34" y="24" textAnchor="middle" fontFamily="Georgia,serif" fontSize="11" fill={V.verde} letterSpacing="2">שְׁמַע</text>
        <text x="34" y="47" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="bold" fill={V.amarelo}>S</text>
        <rect x="20" y="53" width="28" height="3" rx="1.5" fill={V.amarelo} opacity=".4"/>
      </svg>
      <div style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, letterSpacing:2 }}>
        <span style={{color:V.verdeE}}>SH</span><span style={{color:V.verde}}>E</span><span style={{color:V.roxo}}>M</span><span style={{color:V.amareloE}}>A</span><span style={{color:"#ccc"}}>.</span><span style={{color:V.roxo,fontSize:18}}>AI</span>
      </div>
      <div style={{ fontSize:11, color:"#aaa", letterSpacing:3, fontFamily:"Georgia,serif" }}>שְׁמַע</div>
      <div style={{ fontSize:11, color:"#B4B2A9", fontStyle:"italic", marginTop:4 }}>Correa Tech</div>
    </div>
  );

  const shell = (children) => (
    <div style={{ minHeight:"100vh", background:V.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"system-ui,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:360, textAlign:"center" }}>
        <svg width="60" height="60" viewBox="0 0 68 68" style={{marginBottom:12}}>
          <rect width="68" height="68" rx="18" fill={V.verde}/>
          <rect x="4" y="4" width="60" height="60" rx="14" fill={V.verdeE}/>
          <text x="34" y="24" textAnchor="middle" fontFamily="Georgia,serif" fontSize="11" fill={V.verde} letterSpacing="2">שְׁמַע</text>
          <text x="34" y="47" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="bold" fill={V.amarelo}>S</text>
        </svg>
        <div style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, marginBottom:20, letterSpacing:1 }}>
          <span style={{color:V.verdeE}}>SH</span><span style={{color:V.verde}}>E</span><span style={{color:V.roxo}}>M</span><span style={{color:V.amareloE}}>A</span><span style={{color:"#ccc"}}>.</span><span style={{color:V.roxo,fontSize:16}}>AI</span>
        </div>
        {children}
      </div>
    </div>
  );

  const inp = { width:"100%", background:"#fff", border:"1.5px solid #E0DDD5", borderRadius:12, padding:"11px 14px", fontSize:14, color:"#1A1A1A", outline:"none", fontFamily:"inherit", marginTop:10, boxSizing:"border-box" };
  const btn = { width:"100%", marginTop:14, background:V.amarelo, color:V.amareloE, border:"none", borderRadius:12, padding:12, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" };
  const lnk = { background:"none", border:"none", color:V.verde, fontSize:12.5, cursor:"pointer", marginTop:14, fontFamily:"inherit" };

  if (!supabaseReady) return shell(
    <div style={{textAlign:"left",background:"#fff",borderRadius:12,padding:16,border:"1px solid #E0DDD5",fontSize:12,lineHeight:1.7}}>
      <div style={{color:"#A32D2D",fontWeight:700,marginBottom:8}}>Variáveis de ambiente não encontradas</div>
      <div style={{color:"#888"}}>Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.</div>
    </div>
  );

  if (checking) return shell(<div style={{color:"#888",fontSize:13}}>Verificando sessão...</div>);

  if (session) return <Shema onSignOut={signOut} userEmail={session.user.email} userId={session.user.id} />;

  return shell(
    <div>
      <div style={{fontSize:16,color:"#1A1A1A",marginBottom:6,fontWeight:600}}>
        {mode === "criar" ? "Criar sua conta" : "Bem-vinda, família ✦"}
      </div>
      <div style={{fontSize:13,color:"#888",marginBottom:4,lineHeight:1.6}}>
        {mode === "criar" ? "Crie sua conta para começar a gerar materiais." : "Entre com seu email e senha."}
      </div>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" style={inp} autoFocus />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") handleSubmit(); }} placeholder="senha (mín. 6 caracteres)" style={inp} />
      {error && <div style={{color:"#A32D2D",fontSize:12,marginTop:8}}>{error}</div>}
      {info  && <div style={{color:V.verde,fontSize:12,marginTop:8,lineHeight:1.5}}>{info}</div>}
      <button onClick={handleSubmit} disabled={busy||!email.trim()||!password} style={{...btn, opacity: busy||!email.trim()||!password ? 0.5:1}}>
        {busy ? "Aguarde..." : mode==="criar" ? "Criar conta" : "Entrar"}
      </button>
      <div><button onClick={()=>{setMode(mode==="criar"?"entrar":"criar");setError(null);setInfo(null);}} style={lnk}>
        {mode==="criar" ? "Já tenho conta — entrar" : "Primeira vez? Criar conta"}
      </button></div>
    </div>
  );
}
