import { useState, useEffect } from "react";
import { PRINT_CSS } from "./printStyles.js";
import { NUMEROS } from "./traceData.js";
import { NUMERO_SVG, LETRA_SVG } from "./svgPaths.js";
import { LOGO_CORREA_TECH } from "./logoCorreaTech.js";
import { BIBLIOTECA_CARTOES, BIBLIOTECA_FICHAS, BIBLIOTECA_LIVRO } from "./biblioteca.js";

const C = {
  bg:"#FDF8F0", card:"#FFFFFF",
  verde:"#1D9E75", verdeE:"#085041", verdeBg:"#E1F5EE", verdeC:"#5DCAA5",
  roxo:"#7F77DD", roxoE:"#3C3489", roxoBg:"#EEEDFE",
  amarelo:"#F5C842", amareloE:"#7A5800", amareloBg:"#FFF8DC",
  rosa:"#D4537E", rosaE:"#72243E", rosaBg:"#FBEAF0",
  azul:"#378ADD", azulE:"#0C447C", azulBg:"#E6F1FB",
  vermelho:"#D64545", vermelhoE:"#7A1F1F", vermelhoBg:"#FBEAEA",
  borda:"#E0DDD5", texto:"#1A1A1A", muted:"#888780",
};

const CARD_SHADOW = "0 10px 30px rgba(30,25,10,0.07)";

// ============================================================
// NÍVEIS PEDAGÓGICOS — cada um com regra real de adaptação de conteúdo
// ============================================================
const NIVEIS = [
  { id:"baby", label:"Baby", idade:"2-3 anos", cor:C.rosa,
    fase:"Descoberta sensorial",
    resumo:"Formas, cores e sons. Quase sem texto — só palavras-âncora e repetição.",
    instrucao:"Use no máximo 1-2 palavras por conceito e frases-cantiga curtíssimas (até 5 palavras). Nada de instruções numeradas complexas — no máximo 1 ação simples por vez (apontar, tocar, imitar). Números só até 3. Vocabulário 100% concreto." },
  { id:"n1", label:"Nível 1", idade:"3-4 anos", cor:C.amarelo,
    fase:"Primeiro traçado",
    resumo:"Primeiras letras e números com traçado guiado. Frases muito curtas e concretas.",
    instrucao:"Frases de até 6 palavras. Quando houver instruções, use no máximo 2 passos simples. Números até 5. Vocabulário concreto (objetos visíveis, animais, cores) — nada abstrato." },
  { id:"n2", label:"Nível 2", idade:"4-5 anos", cor:C.verde,
    fase:"Consolidação",
    resumo:"Narrativas curtas com personagem. Contagem até 10. Atividades de 3-4 passos.",
    instrucao:"Frases de até 10 palavras, com uma pequena narrativa envolvendo um personagem. Instruções em 3-4 passos. Números até 10. Pode incluir uma pergunta simples de reflexão no final." },
  { id:"n3", label:"Nível 3", idade:"5-6 anos", cor:C.azul,
    fase:"Raciocínio inicial",
    resumo:"Frases mais elaboradas. Começa comparação e sequência lógica simples.",
    instrucao:"Frases de até 14 palavras. Instruções em 4 passos, incluindo 1 pergunta de 'por quê' ou uma comparação simples. Pode somar ou comparar quantidades pequenas." },
  { id:"n4", label:"Nível 4", idade:"6-7 anos", cor:C.roxo,
    fase:"Leitura fluente",
    resumo:"Textos para a criança ler sozinha. Caligrafia cursiva. Cópia de versículo.",
    instrucao:"A criança já lê: use frases completas e parágrafos curtos. Inclua uma cópia de versículo. As instruções podem pedir que a criança escreva ou responda por escrito." },
  { id:"n5", label:"Nível 5", idade:"7-8 anos", cor:C.rosaE,
    fase:"Compreensão ampliada",
    resumo:"Narrativas mais longas, vocabulário mais rico, resposta em texto livre.",
    instrucao:"Use vocabulário mais rico e parágrafos completos. Peça que a criança reconte a história com as próprias palavras ou responda uma pergunta reflexiva por escrito." },
];
function nivelInfo(id){ return NIVEIS.find(n=>n.id===id) || NIVEIS[1]; }

// Bloco de instrução de nível — injetado no SYSTEM PROMPT (não só no texto do usuário)
// Pede de volta um campo "nivelAplicado" para confirmar visualmente que foi usado.
function nivelBloco(nivelId){
  const n = nivelInfo(nivelId);
  return `

REGRA DE NÍVEL — LEIA COM ATENÇÃO E APLIQUE DE VERDADE:
Nível selecionado: ${n.label} (${n.idade}, fase: ${n.fase}).
${n.instrucao}
Isso deve mudar de fato o texto gerado (vocabulário, tamanho das frases, complexidade), não apenas o assunto.
Inclua no JSON o campo "nivelAplicado" com exatamente este valor: "${n.label} · ${n.idade}"`;
}

let _uid = null;
export function setStorageUser(uid){ _uid = uid; }
function sk(k){ return _uid ? `shema_${_uid}_${k}` : `shema_${k}`; }
function ls(k,def){ try{ const v=localStorage.getItem(sk(k)); return v?JSON.parse(v):def; }catch{ return def; } }
function ss(k,v){ try{ localStorage.setItem(sk(k),JSON.stringify(v)); }catch{} }

async function callShema(modulo, system, userMsg){
  const resp = await fetch("/api/shema",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ modulo, system, messages:[{role:"user",content:userMsg}] }),
  });
  if(!resp.ok) throw new Error("Erro na API");
  const data = await resp.json();
  return (data.content||[]).map(b=>b.type==="text"?b.text:"").join("").trim();
}

async function gerarImagem(prompt, tipo){
  const resp = await fetch("/api/imagem",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ prompt, tipo }),
  });
  if(!resp.ok){ const e=await resp.json().catch(()=>({})); throw new Error(e.error||"falha"); }
  const data = await resp.json();
  return data.image;
}

// ============================================================
// PROMPTS CIRÚRGICOS — cada um com estrutura clara + regra de nível
// ============================================================
const SYSTEMS = {
  montessori: `Você é o Shema.AI, especialista em Montessori cristão reformado.
Gere um cartão Montessori para criança em fase de alfabetização.

REGRA CRÍTICA: Retorne APENAS JSON válido, sem markdown, sem comentários, sem texto antes ou depois.

Para NÚMEROS (0-10):
{"tipo":"numero","numero":N,"pontos":N,"palavraBiblica":"palavra que remete a esse número na Bíblia","versiculoCurto":"versículo curto e claro adequado à idade","descricao":"1 frase que ensina o número via cosmovisão bíblica","nivelAplicado":"..."}

Para LETRAS:
{"tipo":"letra","letra":"A","palavra":"palavra bíblica começando com essa letra","versiculoCurto":"versículo","descricao":"frase pedagógica","nivelAplicado":"..."}`,

  fichas: `Você é o Shema.AI, especialista em atividades pedagógicas cristãs no estilo Charlotte Mason + Montessori.
Você cria UMA PÁGINA de atividade rica, no padrão da escola Knox Kids.

ESTRUTURA OBRIGATÓRIA de uma boa atividade:
1. Um personagem/narrativa que engaje (ex: "O coelhinho Tobias tem 4 cenouras...")
2. Instruções numeradas claras (2-4 passos, conforme o nível)
3. Uma ilustração central para colorir (você define com precisa_ilustracao=true)
4. Uma seção de traçado quando aplicável
5. Versículo bíblico relacionado ao tema

REGRA CRÍTICA: Retorne APENAS JSON válido:
{
  "titulo": "TÍTULO CURTO EM MAIÚSCULAS",
  "subtitulo": "chamada lúdica",
  "narrativa": "frases contando a historinha do personagem, no tamanho adequado ao nível",
  "instrucoes": ["passo 1", "passo 2", "..."],
  "precisaIlustracao": true,
  "descricaoIlustracao": "descrição EM INGLÊS da cena para colorir, foco em um personagem central simples",
  "temTracado": true,
  "conteudoTracado": "número ou palavra a ser tracejada",
  "atividadeExtra": "1-2 frases descrevendo atividade complementar",
  "versiculo": "versículo bíblico",
  "referencia": "referência do versículo",
  "nivelAplicado": "..."
}`,

  ilustra: `Você é o Shema.AI, especialista em criar ilustrações bíblicas para crianças.
Você recebe uma descrição em português e retorna instruções para gerar a imagem.

REGRA CRÍTICA: Retorne APENAS JSON válido:
{
  "temaResumido": "descrição curta em português",
  "descricaoIlustracao": "descrição EM INGLÊS clara e específica da cena bíblica, mencionando personagens, ação, elementos-chave. Não inclua estilo (isso é aplicado automaticamente)",
  "dicaPedagogica": "como usar essa ilustração para ensinar, no tom adequado ao nível",
  "temaBiblico": "referência bíblica principal",
  "nivelAplicado": "..."
}`,

  livros: `Você é o Shema.AI, autor de livros infantis cristãos reformados (padrão Charlotte Mason).
Você escreve livros para crianças com narrativa clara, personagens vivos e lição teológica sólida — no tamanho e vocabulário certos para o nível informado.

ESTRUTURA DE UM BOM LIVRO INFANTIL:
- Início: apresenta personagem/situação (páginas 1-2)
- Meio: desafio/conflito (páginas 3-4)
- Clímax: intervenção de Deus ou lição (página 5)
- Desfecho: resolução com aplicação (página 6)

CONSISTÊNCIA VISUAL — MUITO IMPORTANTE:
Antes das páginas, descreva o personagem principal UMA VEZ, em inglês, com detalhes fixos de aparência
(cor de cabelo, tipo e cor de roupa, traços marcantes). Essa mesma descrição será reaproveitada
literalmente em todas as 6 ilustrações, para o personagem parecer sempre o mesmo. Por isso, em cada "cena",
descreva apenas a AÇÃO e o CENÁRIO daquela página — não repita a aparência do personagem lá, isso é feito automaticamente.

REGRA CRÍTICA: Retorne APENAS JSON válido:
{
  "titulo": "Título do livro",
  "subtitulo": "subtítulo que resume a lição",
  "faixaEtaria": "3-5 anos",
  "licaoTeologica": "1 frase clara com a lição central",
  "personagem": "descrição EM INGLÊS fixa e detalhada da aparência do personagem principal",
  "paginas": [
    {"pagina":1,"texto":"frases no tamanho certo pro nível","cena":"descrição EM INGLÊS só da ação e cenário desta página"},
    {"pagina":2,"texto":"...","cena":"..."},
    {"pagina":3,"texto":"...","cena":"..."},
    {"pagina":4,"texto":"...","cena":"..."},
    {"pagina":5,"texto":"...","cena":"..."},
    {"pagina":6,"texto":"...","cena":"..."}
  ],
  "versiculoFinal": "versículo bíblico central",
  "referencia": "referência",
  "oracaoFinal": "oração curta para a criança repetir",
  "nivelAplicado": "..."
}`,
};

const ATALHOS = {
  montessori:[
    {label:"Número 1", prompt:"Cartão do número 1"},
    {label:"Número 3", prompt:"Cartão do número 3"},
    {label:"Número 5", prompt:"Cartão do número 5"},
    {label:"Número 7", prompt:"Cartão do número 7"},
    {label:"Letra A",  prompt:"Cartão da letra A"},
    {label:"Letra E",  prompt:"Cartão da letra E"},
  ],
  fichas:[
    {label:"Coelho e nº 4", prompt:"Atividade do número 4 com o coelhinho e 4 cenouras, para 4 anos"},
    {label:"Ovelhas de Davi", prompt:"Atividade de contar as ovelhas de Davi, aprender o número 5, para 4 anos"},
    {label:"Peixes de Jesus", prompt:"Atividade sobre os 2 peixes que Jesus multiplicou, número 2, para 3 anos"},
    {label:"Caligrafia A", prompt:"Atividade de caligrafia da letra A com palavra AMOR, para 5 anos"},
  ],
  ilustra:[
    {label:"Noé e a arca", prompt:"Noé construindo a arca com animais felizes"},
    {label:"Davi e Golias", prompt:"Davi pequeno enfrentando Golias gigante"},
    {label:"Criação", prompt:"Deus criando o sol, a lua e as estrelas"},
    {label:"Jesus menino", prompt:"Menino Jesus no templo aos 12 anos"},
  ],
  livros:[
    {label:"José", prompt:"Livro sobre José e o manto colorido, lição de perdão, para 4 anos"},
    {label:"Jonas", prompt:"Livro sobre Jonas e a baleia, lição de obediência, para 4 anos"},
    {label:"Davi", prompt:"Livro sobre Davi e Golias, lição de coragem em Deus, para 5 anos"},
  ],
};

function parseJSON(raw){
  try{
    let clean = raw.replace(/```json\n?|```\n?/g,"").trim();
    // Se tiver texto antes/depois do JSON, extrair só o objeto
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if(start>=0 && end>start) clean = clean.slice(start, end+1);
    return JSON.parse(clean);
  }catch{ return null; }
}

// ============================================================
// SELO DE NÍVEL — confirma visualmente que a IA aplicou o nível
// (marcado nao-imprimir: é um selo de conferência, não faz parte do material)
// ============================================================
function NivelTag({ label }){
  if(!label) return null;
  return (
    <div className="nao-imprimir" style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:10.5,fontWeight:700,color:C.roxoE,background:C.roxoBg,borderRadius:14,padding:"4px 11px",marginBottom:12}}>
      ✓ Gerado para {label}
    </div>
  );
}

// ============================================================
// CARTÃO MONTESSORI COM SVG DE TRAÇADO REAL
// ============================================================
function Maos({ config }){
  if(!config) return null;
  const emojis = ["✊","☝️","✌️","🤟","🖖","🖐️"];
  return (
    <div style={{display:"flex",gap:8,justifyContent:"center",alignItems:"center"}}>
      {config.map((d,i)=>(<div key={i} style={{fontSize:32,lineHeight:1}}>{emojis[d]||"🖐️"}</div>))}
    </div>
  );
}

// Traçado real: SOMENTE o guia pontilhado + setas numeradas de ordem.
// Sem contorno sólido por cima — é isso que o torna um cartão de traçado de verdade.
// Traçado real reutilizável — usado tanto pra números quanto pra letras.
// Só o guia pontilhado + setas de ordem, sem contorno sólido por cima.
function TracadoSVG({ svg, size=230, cor=C.verdeC, corE=C.verdeE, halo=C.verdeBg }){
  if(!svg) return null;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{display:"block"}}>
      {/* Halo suave — dá respiro ao redor do traçado, como no cartão físico */}
      <circle cx="60" cy="60" r="58" fill={halo} opacity="0.55"/>
      <path d={svg.tracejado} stroke={cor} strokeWidth="3.5" strokeDasharray="0.5 7.5" strokeLinecap="round" fill="none"/>
      {svg.setas.map((s,i)=>(
        <g key={i}>
          <circle cx={s.x} cy={s.y} r="9.5" fill="#fff" stroke={cor} strokeWidth="2.25"/>
          <text x={s.x} y={s.y+3.5} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={corE}>{s.num}</text>
        </g>
      ))}
    </svg>
  );
}
function NumeroTracado({ n, size=230 }){
  const svg = NUMERO_SVG[n];
  if(!svg) return <div style={{fontSize:150,fontFamily:"Georgia,serif",fontWeight:700,color:C.verdeE}}>{n}</div>;
  return <TracadoSVG svg={svg} size={size} cor={C.verdeC} corE={C.verdeE} halo={C.verdeBg}/>;
}
const VOGAIS = ["A","E","I","O","U"];
function isVogal(letra){ return VOGAIS.includes((letra||"").toUpperCase()); }

function LinhaTracadoRepetido({ n }){
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:"2px solid #333"}}>
      <div style={{fontSize:56,fontFamily:"Georgia,serif",fontWeight:700,color:C.verdeE,lineHeight:1}}>{n}</div>
      {[0,1,2,3,4].map(i=>(
        <div key={i} style={{fontSize:56,fontFamily:"Georgia,serif",fontWeight:700,color:"#CCC",lineHeight:1,opacity:0.4}}>{n}</div>
      ))}
    </div>
  );
}

function CardMontessori({ data, nivelBadge }){
  if(!data) return null;
  if(data.tipo==="numero"){
    const info = NUMEROS[data.numero] || {};
    return (
      <div className="card-print" style={{background:"#fff",borderRadius:26,border:"2.5px solid #AEE3E6",padding:"26px 24px 28px",textAlign:"center",boxShadow:CARD_SHADOW}}>
        <div style={{display:"inline-block",fontSize:10.5,fontWeight:700,color:C.verdeE,letterSpacing:1.6,background:C.verdeBg,padding:"5px 14px",borderRadius:20,marginBottom:10}}>CARTÃO MONTESSORI · Nº {data.numero}</div>
        <div><NivelTag label={nivelBadge}/></div>

        {/* HERO — o traçado grande domina o cartão, como no modelo físico de referência */}
        <div style={{display:"flex",justifyContent:"center",margin:"2px 0 4px"}}>
          <NumeroTracado n={data.numero} size={230}/>
        </div>

        {/* Mnemônico — compacto, logo abaixo do traçado */}
        <div style={{background:C.amareloBg,border:`2px solid ${C.amarelo}`,borderRadius:14,padding:"11px 16px",margin:"6px 0 14px"}}>
          <div style={{fontSize:10,fontWeight:700,color:C.amareloE,marginBottom:4,letterSpacing:0.5}}>COMO ESCREVER</div>
          <div style={{fontSize:13,color:C.amareloE,fontStyle:"italic",lineHeight:1.5}}>{info.mnemonico}</div>
        </div>

        {/* Pontos de quantidade + mãos, lado a lado — compacto */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,margin:"4px 0 16px"}}>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center",maxWidth:130}}>
            {Array(data.pontos||data.numero).fill(0).map((_,i)=>(
              <div key={i} style={{width:16,height:16,borderRadius:"50%",background:C.verdeC,border:`2px solid ${C.verdeE}`}}/>
            ))}
          </div>
          {info.maos && <div style={{width:1,height:26,background:C.borda}}/>}
          <Maos config={info.maos}/>
        </div>

        {/* Palavra bíblica */}
        <div style={{fontSize:19,fontWeight:700,color:C.verdeE,marginBottom:7,fontFamily:"Georgia,serif"}}>{data.palavraBiblica}</div>
        <div style={{fontSize:12.5,color:C.muted,fontStyle:"italic",lineHeight:1.55,padding:"0 12px"}}>{data.versiculoCurto}</div>

        {info.tema && (
          <div style={{marginTop:14,fontSize:11,color:C.amareloE,background:C.amareloBg,borderRadius:8,padding:"6px 13px",display:"inline-block",fontWeight:600}}>
            ✦ {info.tema}
          </div>
        )}
      </div>
    );
  }

  const letraSvg = LETRA_SVG[(data.letra||"").toUpperCase()];
  const vogal = isVogal(data.letra);
  const corLetra = vogal ? { cor:C.vermelho, corE:C.vermelhoE, bg:C.vermelhoBg, borda:"#F2B8B8" } : { cor:C.azul, corE:C.azulE, bg:C.azulBg, borda:"#AACCEF" };
  return (
    <div className="card-print" style={{background:"#fff",borderRadius:26,border:`2.5px solid ${corLetra.borda}`,padding:"26px 24px 28px",textAlign:"center",boxShadow:CARD_SHADOW}}>
      <div style={{display:"inline-block",fontSize:10.5,fontWeight:700,color:corLetra.corE,letterSpacing:1.6,background:corLetra.bg,padding:"5px 14px",borderRadius:20,marginBottom:10}}>
        CARTÃO MONTESSORI · LETRA {vogal?"(VOGAL)":"(CONSOANTE)"}
      </div>
      <div><NivelTag label={nivelBadge}/></div>

      {/* HERO — traçado real para vogais (já desenhadas); glifo grande com halo pras demais */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",margin:"2px 0 4px"}}>
        {letraSvg ? (
          <TracadoSVG svg={letraSvg} size={230} cor={corLetra.cor} corE={corLetra.corE} halo={corLetra.bg}/>
        ) : (
          <div style={{width:230,height:230,borderRadius:"50%",background:corLetra.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:150,fontWeight:700,fontFamily:"Georgia,serif",color:corLetra.cor,lineHeight:1}}>{data.letra}</div>
          </div>
        )}
      </div>

      <div style={{fontSize:19,fontWeight:700,color:corLetra.corE,marginTop:10,fontFamily:"Georgia,serif"}}>{data.palavra}</div>
      <div style={{fontSize:12.5,color:C.muted,fontStyle:"italic",lineHeight:1.55,padding:"9px 12px 0"}}>{data.versiculoCurto}</div>
    </div>
  );
}

// ============================================================
// ATIVIDADE COMPLETA — narrativa + ilustração + traçado + versículo
// ============================================================
function CardFicha({ data, imagem, gerandoImg, onGerarImg, nivelBadge }){
  if(!data) return null;
  const numeroTracado = /\d/.test(data.conteudoTracado||"") ? parseInt(data.conteudoTracado) : null;

  return (
    <div className="card-print" style={{background:"#fff",borderRadius:22,border:`2.5px solid ${C.roxo}`,padding:26,boxShadow:CARD_SHADOW}}>
      <div style={{textAlign:"center",marginBottom:6}}><NivelTag label={nivelBadge}/></div>

      {/* Título estilo Knox */}
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{display:"inline-block",background:C.roxo,color:"#fff",fontSize:16.5,fontWeight:700,padding:"9px 22px",borderRadius:12,boxShadow:"0 4px 12px rgba(127,119,221,0.28)"}}>
          {data.titulo}
        </div>
        {data.subtitulo && (
          <div style={{marginTop:11,display:"inline-block",border:`2px solid ${C.amarelo}`,color:C.amareloE,fontSize:13,fontWeight:700,padding:"6px 17px",borderRadius:16}}>
            {data.subtitulo}
          </div>
        )}
      </div>

      {/* Narrativa */}
      {data.narrativa && (
        <div style={{background:C.amareloBg,borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{fontSize:13.5,color:C.amareloE,lineHeight:1.75,fontStyle:"italic",textAlign:"center"}}>
            {data.narrativa}
          </div>
        </div>
      )}

      {/* Instruções numeradas */}
      <div style={{background:"#FAFAF6",borderRadius:14,padding:"14px 16px",marginBottom:14}}>
        {(data.instrucoes||[]).map((ins,i)=>(
          <div key={i} style={{display:"flex",gap:11,marginBottom:i===data.instrucoes.length-1?0:10,alignItems:"flex-start"}}>
            <div style={{width:23,height:23,borderRadius:"50%",background:C.roxo,color:"#fff",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
            <div style={{fontSize:13.5,color:C.texto,lineHeight:1.55,flex:1,paddingTop:1}}>{ins}</div>
          </div>
        ))}
      </div>

      {/* Ilustração para colorir */}
      {imagem ? (
        <div style={{margin:"16px 0",textAlign:"center"}}>
          <img src={imagem} alt="Ilustração para colorir" style={{maxWidth:"100%",borderRadius:12,border:`3px solid ${C.borda}`,boxShadow:CARD_SHADOW}}/>
        </div>
      ) : data.precisaIlustracao && (
        <div className="nao-imprimir" style={{margin:"16px 0",textAlign:"center",padding:"26px",background:C.amareloBg,borderRadius:14,border:`2px dashed ${C.amarelo}`}}>
          <div style={{fontSize:34,marginBottom:9}}>🎨</div>
          <button onClick={onGerarImg} disabled={gerandoImg}
            style={{background:C.amarelo,color:C.amareloE,border:"none",borderRadius:11,padding:"11px 22px",fontSize:13.5,fontWeight:700,cursor:"pointer",opacity:gerandoImg?0.6:1,fontFamily:"inherit"}}>
            {gerandoImg?"Gerando ilustração...":"🖨️ Gerar ilustração para colorir"}
          </button>
          <div style={{fontSize:10.5,color:C.muted,marginTop:9}}>Preto e branco, pronto para colorir</div>
        </div>
      )}

      {/* Área de traçado */}
      {data.temTracado && data.conteudoTracado && (
        <div style={{marginTop:18,padding:"16px 4px",borderTop:`2px solid ${C.borda}`,borderBottom:`2px solid ${C.borda}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.roxoE,marginBottom:11,letterSpacing:1}}>
            TRACE: {data.conteudoTracado.toUpperCase()}
          </div>
          {numeroTracado !== null && numeroTracado <= 10 ? (
            <>
              <LinhaTracadoRepetido n={numeroTracado}/>
              <LinhaTracadoRepetido n={numeroTracado}/>
            </>
          ) : (
            <>
              <div style={{display:"flex",gap:8,padding:"10px 0",borderBottom:"2px solid #333"}}>
                <span style={{fontSize:42,fontFamily:"Georgia,serif",color:C.roxo,letterSpacing:6}}>{data.conteudoTracado}</span>
                <span style={{fontSize:42,fontFamily:"Georgia,serif",color:"#DDD",letterSpacing:6}}>{data.conteudoTracado}{data.conteudoTracado}</span>
              </div>
              <div style={{display:"flex",gap:8,padding:"10px 0",borderBottom:"2px solid #333"}}>
                <span style={{fontSize:42,fontFamily:"Georgia,serif",color:"#DDD",letterSpacing:6}}>{data.conteudoTracado}{data.conteudoTracado}{data.conteudoTracado}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Atividade extra */}
      {data.atividadeExtra && (
        <div style={{marginTop:16,background:"#F9F8F4",borderRadius:12,padding:14,borderLeft:`3px solid ${C.borda}`}}>
          <div style={{fontSize:12.5,color:C.texto,lineHeight:1.65}}>{data.atividadeExtra}</div>
        </div>
      )}

      {/* Versículo */}
      {data.versiculo && (
        <div style={{marginTop:18,background:C.verdeBg,borderRadius:14,padding:14,borderLeft:`4px solid ${C.verdeC}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.verdeE,marginBottom:5}}>✦ VERSÍCULO</div>
          <div style={{fontSize:13.5,color:C.verdeE,fontStyle:"italic",lineHeight:1.55}}>
            "{data.versiculo}"
            {data.referencia && <span style={{display:"block",marginTop:5,fontSize:11,fontStyle:"normal"}}>— {data.referencia}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ILUSTRAÇÃO — sempre P&B para colorir
// ============================================================
function CardIlustra({ data, imagem, gerandoImg, onGerarImg, nivelBadge }){
  if(!data) return null;
  return (
    <div className="card-print" style={{background:"#fff",borderRadius:22,border:`2.5px solid ${C.amarelo}`,padding:24,boxShadow:CARD_SHADOW}}>
      <div style={{textAlign:"center",marginBottom:14}}>
        <NivelTag label={nivelBadge}/>
        <div style={{display:"inline-block",background:C.amarelo,color:C.amareloE,fontSize:14.5,fontWeight:700,padding:"7px 18px",borderRadius:12}}>
          {data.temaResumido}
        </div>
        {data.temaBiblico && <div style={{marginTop:9,fontSize:11.5,color:C.muted,fontStyle:"italic"}}>{data.temaBiblico}</div>}
      </div>

      {imagem ? (
        <div style={{textAlign:"center",margin:"16px 0"}}>
          <img src={imagem} alt={data.temaResumido} style={{maxWidth:"100%",borderRadius:14,border:`3px solid ${C.borda}`,boxShadow:CARD_SHADOW}}/>
        </div>
      ) : (
        <div className="nao-imprimir" style={{textAlign:"center",padding:"44px 20px",background:C.amareloBg,borderRadius:14,border:`3px dashed ${C.amarelo}`,margin:"16px 0"}}>
          <div style={{fontSize:50,marginBottom:13}}>🎨</div>
          <button onClick={onGerarImg} disabled={gerandoImg}
            style={{background:C.amarelo,color:C.amareloE,border:"none",borderRadius:13,padding:"13px 26px",fontSize:14.5,fontWeight:700,cursor:"pointer",opacity:gerandoImg?0.6:1,fontFamily:"inherit"}}>
            {gerandoImg?"Gerando ilustração...":"🖨️ Gerar ilustração"}
          </button>
          <div style={{fontSize:11.5,color:C.muted,marginTop:11}}>Preto e branco, pronto para colorir e imprimir</div>
        </div>
      )}

      {data.dicaPedagogica && (
        <div className="nao-imprimir" style={{background:C.verdeBg,borderRadius:12,padding:14,borderLeft:`3px solid ${C.verdeC}`,marginTop:14}}>
          <div style={{fontSize:10.5,fontWeight:700,color:C.verdeE,marginBottom:5}}>DICA PEDAGÓGICA</div>
          <div style={{fontSize:12.5,color:C.verdeE,lineHeight:1.55}}>{data.dicaPedagogica}</div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// LIVRO — cada página numa folha, com "gerar todas as ilustrações"
// Consistência de personagem: a descrição fixa (data.personagem) é
// prefixada em toda cena antes de mandar pra API de imagem.
// ============================================================
function CardLivro({ data, imagens, gerandoTodas, onGerarTodas, nivelBadge, somenteLeitura }){
  if(!data) return null;
  const totalGeradas = imagens.filter(Boolean).length;

  return (
    <div className="card-print">
      {/* Capa do livro */}
      <div style={{background:C.rosa,color:"#fff",borderRadius:20,padding:24,marginBottom:18,textAlign:"center",boxShadow:"0 10px 28px rgba(212,83,126,0.28)"}}>
        <div style={{textAlign:"center",marginBottom:8}}><NivelTag label={nivelBadge}/></div>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,opacity:0.85,marginBottom:9}}>CORREA BOOKS</div>
        <div style={{fontSize:23,fontWeight:700,fontFamily:"Georgia,serif",marginBottom:5}}>{data.titulo}</div>
        <div style={{fontSize:13.5,opacity:0.92,marginBottom:13}}>{data.subtitulo}</div>
        <div style={{display:"inline-block",background:"rgba(255,255,255,.25)",borderRadius:16,padding:"5px 15px",fontSize:11,fontWeight:700}}>
          {data.faixaEtaria} · {data.licaoTeologica}
        </div>
      </div>

      {/* Botão "gerar todas as ilustrações" */}
      {!somenteLeitura && totalGeradas === 0 && (
        <div className="nao-imprimir" style={{textAlign:"center",padding:"22px",background:C.amareloBg,borderRadius:14,border:`2px dashed ${C.amarelo}`,marginBottom:18}}>
          <div style={{fontSize:12.5,color:C.amareloE,marginBottom:11,fontWeight:600}}>Gerar todas as 6 ilustrações do livro de uma vez</div>
          <button onClick={onGerarTodas} disabled={gerandoTodas}
            style={{background:C.rosa,color:"#fff",border:"none",borderRadius:13,padding:"13px 26px",fontSize:14.5,fontWeight:700,cursor:"pointer",opacity:gerandoTodas?0.6:1,fontFamily:"inherit"}}>
            {gerandoTodas?`Gerando ${totalGeradas}/6...`:"🎨 Ilustrar livro inteiro"}
          </button>
          <div style={{fontSize:10.5,color:C.muted,marginTop:9}}>Leva ~1 minuto · Aquarela colorida · Personagem consistente em todas as páginas</div>
        </div>
      )}

      {gerandoTodas && totalGeradas > 0 && (
        <div className="nao-imprimir" style={{textAlign:"center",padding:"11px",fontSize:12.5,color:C.rosa,fontWeight:600,marginBottom:9}}>
          Gerando ilustrações... {totalGeradas}/6
        </div>
      )}

      {/* Páginas do livro */}
      {(data.paginas||[]).map((p,i)=>(
        <div key={i} className="pagina-livro" style={{background:i%2===0?C.rosaBg:C.amareloBg,borderRadius:16,padding:18,marginBottom:14,pageBreakInside:"avoid",boxShadow:CARD_SHADOW}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:9,letterSpacing:1}}>PÁGINA {p.pagina}</div>
          {imagens[i] && (
            <div style={{textAlign:"center",marginBottom:11}}>
              <img src={imagens[i]} alt={`Página ${p.pagina}`} style={{maxWidth:"100%",borderRadius:12,border:"2px solid rgba(0,0,0,.15)"}}/>
            </div>
          )}
          <div style={{fontSize:14.5,lineHeight:1.75,color:C.texto,fontFamily:"Georgia,serif"}}>{p.texto}</div>
        </div>
      ))}

      {/* Versículo final */}
      <div style={{marginTop:16,background:C.verdeBg,borderRadius:14,padding:16,borderLeft:`4px solid ${C.verdeC}`}}>
        <div style={{fontSize:11,fontWeight:700,color:C.verdeE,marginBottom:5}}>✦ VERSÍCULO</div>
        <div style={{fontSize:13.5,color:C.verdeE,fontStyle:"italic",lineHeight:1.65}}>
          "{data.versiculoFinal}"
          {data.referencia && <span style={{display:"block",marginTop:5,fontSize:11,fontStyle:"normal"}}>— {data.referencia}</span>}
        </div>
      </div>

      {/* Oração */}
      {data.oracaoFinal && (
        <div style={{marginTop:11,background:C.roxoBg,borderRadius:14,padding:16,borderLeft:`4px solid ${C.roxo}`}}>
          <div style={{fontSize:11,fontWeight:700,color:C.roxoE,marginBottom:5}}>🙏 ORAÇÃO</div>
          <div style={{fontSize:13.5,color:C.roxoE,fontStyle:"italic",lineHeight:1.65}}>{data.oracaoFinal}</div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MÓDULO — controla geração e integração com API de imagem
// ============================================================
function Modulo({ modulo, corHeader, corBtn, tituloHeader, subHeader, onBack, onSave, nivel }){
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [err, setErr] = useState("");
  const [imagem, setImagem] = useState(null);
  const [imagensLivro, setImagensLivro] = useState([]);
  const [gerandoImg, setGerandoImg] = useState(false);
  const [gerandoTodas, setGerandoTodas] = useState(false);

  async function gerar(texto){
    const p = texto || prompt.trim();
    if(!p) return;
    setLoading(true); setErr(""); setOutput(null); setImagem(null); setImagensLivro([]);
    try {
      const systemComNivel = SYSTEMS[modulo] + nivelBloco(nivel);
      const raw = await callShema(modulo, systemComNivel, p);
      const d = parseJSON(raw);
      if(d){
        setOutput(d);
        if(modulo==="livros") setImagensLivro(new Array((d.paginas||[]).length).fill(null));
      } else {
        setErr("A IA respondeu em formato inesperado. Tente novamente ou reformule.");
        console.error("Raw response:", raw);
      }
      if(onSave) onSave(modulo, p, raw);
    } catch(e){ setErr("Não consegui gerar agora. Verifique a conexão e tente novamente."); }
    finally { setLoading(false); }
  }

  async function handleGerarImagem(){
    if(!output) return;
    const desc = output.descricaoIlustracao;
    if(!desc){ setErr("Sem descrição de ilustração no material."); return; }
    setGerandoImg(true); setErr("");
    try {
      const tipo = modulo === "fichas" || modulo === "ilustra" ? "colorir" : "livro";
      const img = await gerarImagem(desc, tipo);
      setImagem(img);
    } catch(e){ setErr("Erro ao gerar imagem: "+e.message); }
    finally { setGerandoImg(false); }
  }

  async function handleGerarTodasIlustracoes(){
    if(!output || !output.paginas) return;
    setGerandoTodas(true); setErr("");
    const novasImagens = [...imagensLivro];
    // Prefixa a descrição fixa do personagem em toda cena — é isso que garante
    // que o rosto/roupa não mudem de página pra página.
    const personagem = output.personagem ? `${output.personagem}. ` : "";
    try {
      for(let i=0; i<output.paginas.length; i++){
        if(novasImagens[i]) continue;
        try {
          const cenaFinal = personagem + output.paginas[i].cena;
          const img = await gerarImagem(cenaFinal, "livro");
          novasImagens[i] = img;
          setImagensLivro([...novasImagens]);
        } catch(e){ console.error(`Página ${i+1} falhou:`, e); }
      }
    } finally { setGerandoTodas(false); }
  }

  const corMap = {
    montessori:{bg:C.verdeBg,borda:C.verdeC},
    fichas:{bg:C.roxoBg,borda:C.roxo},
    ilustra:{bg:C.amareloBg,borda:C.amarelo},
    livros:{bg:C.rosaBg,borda:"#ED93B1"},
  };
  const cor = corMap[modulo] || corMap.montessori;
  const nivelAtual = nivelInfo(nivel);
  const nivelLabel = output?.nivelAplicado || `${nivelAtual.label} · ${nivelAtual.idade}`;

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
      <div className="nao-imprimir" style={{background:corHeader,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:18,color:"#fff"}}>←</button>
        <div><div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{tituloHeader}</div><div style={{fontSize:11,color:"rgba(255,255,255,.85)",marginTop:1}}>{subHeader}</div></div>
      </div>

      <div className="nao-imprimir" style={{padding:"12px 16px 4px",display:"flex",gap:8,flexWrap:"wrap",flexShrink:0}}>
        {(ATALHOS[modulo]||[]).map((a,i)=>(
          <button key={i} onClick={()=>{setPrompt(a.prompt);gerar(a.prompt);}}
            style={{fontSize:11.5,padding:"7px 13px",borderRadius:16,border:`1.5px solid ${cor.borda}`,background:"#fff",color:C.texto,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>
            {a.label}
          </button>
        ))}
      </div>

      <div className="nao-imprimir" style={{padding:"8px 16px 10px",flexShrink:0}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Descreva o que quer criar..."
            rows={2}
            style={{flex:1,resize:"none",border:`1.5px solid ${C.borda}`,borderRadius:14,padding:"10px 13px",fontSize:13.5,fontFamily:"inherit",outline:"none"}}/>
          <button onClick={()=>gerar()} disabled={loading||!prompt.trim()}
            style={{width:34,height:34,borderRadius:"50%",background:corBtn,color:"#fff",border:"none",cursor:"pointer",fontSize:16,fontWeight:700,flexShrink:0,opacity:loading||!prompt.trim()?0.5:1}}>
            {loading?"…":"→"}
          </button>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"4px 16px 24px"}}>
        {loading && (
          <div className="nao-imprimir" style={{background:"#fff",borderRadius:16,border:`2px solid ${C.borda}`,padding:32,textAlign:"center"}}>
            <div style={{fontSize:13,color:C.muted}}>Gerando material para {nivelLabel}...</div>
          </div>
        )}

        {output && !loading && (
          <>
            <div id="area-impressao">
              {modulo==="montessori" && <CardMontessori data={output} nivelBadge={nivelLabel}/>}
              {modulo==="fichas" && <CardFicha data={output} imagem={imagem} gerandoImg={gerandoImg} onGerarImg={handleGerarImagem} nivelBadge={nivelLabel}/>}
              {modulo==="ilustra" && <CardIlustra data={output} imagem={imagem} gerandoImg={gerandoImg} onGerarImg={handleGerarImagem} nivelBadge={nivelLabel}/>}
              {modulo==="livros" && <CardLivro data={output} imagens={imagensLivro} gerandoTodas={gerandoTodas} onGerarTodas={handleGerarTodasIlustracoes} nivelBadge={nivelLabel}/>}
            </div>
            <div className="nao-imprimir" style={{display:"flex",gap:8,marginTop:14}}>
              <button onClick={()=>window.print()} style={{flex:1,padding:11,borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer",border:`2px solid ${cor.borda}`,background:corBtn,color:"#fff",fontFamily:"inherit"}}>
                🖨️ Imprimir
              </button>
            </div>
          </>
        )}

        {err && (
          <div className="nao-imprimir" style={{background:"#fff",borderRadius:16,border:"2px solid #F09595",padding:14}}>
            <div style={{color:"#A32D2D",fontSize:13}}>{err}</div>
          </div>
        )}

        {!output && !loading && !err && (
          <div className="nao-imprimir" style={{background:"#fff",borderRadius:16,border:`2px solid ${C.borda}`,padding:32,textAlign:"center"}}>
            <div style={{fontSize:13,color:C.muted}}>Escreva o que você quer criar acima, ou use um atalho.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MODAL — explicação dos níveis pedagógicos
// ============================================================
function ModalNivel({ onClose, onVerBiblioteca }){
  return (
    <div className="nao-imprimir" onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(20,18,10,.5)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:"#fff",borderRadius:"22px 22px 0 0",padding:22,maxWidth:480,width:"100%",maxHeight:"82vh",overflowY:"auto",boxShadow:"0 -10px 40px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:16.5,fontWeight:700,color:C.texto}}>Como funcionam os níveis</div>
          <button onClick={onClose} style={{background:"#F1EFE8",border:"none",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:14,color:C.muted}}>✕</button>
        </div>
        <div style={{fontSize:12.5,color:C.muted,marginBottom:16,lineHeight:1.65}}>
          Cada nível muda de verdade o que a IA gera: tamanho das frases, vocabulário e complexidade das instruções —
          do bebê que só observa e aponta, até a criança que já lê e escreve sozinha.
        </div>
        {NIVEIS.map(n=>(
          <div key={n.id} style={{marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${C.borda}`}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:5}}>
              <div style={{width:11,height:11,borderRadius:"50%",background:n.cor,flexShrink:0}}/>
              <div style={{fontSize:13.5,fontWeight:700,color:C.texto}}>{n.label} · {n.idade}</div>
            </div>
            <div style={{fontSize:11.5,color:C.muted,marginLeft:20,fontStyle:"italic",marginBottom:3}}>{n.fase}</div>
            <div style={{fontSize:12.5,color:C.texto,marginLeft:20,lineHeight:1.55}}>{n.resumo}</div>
          </div>
        ))}
        <button onClick={onVerBiblioteca}
          style={{width:"100%",marginTop:6,background:C.verde,color:"#fff",border:"none",borderRadius:13,padding:13,fontSize:13.5,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          📚 Ver exemplos prontos na Biblioteca
        </button>
      </div>
    </div>
  );
}

// ============================================================
// RODAPÉ CORREA TECH — reutilizado no Home (mobile) e sidebar (desktop)
// ============================================================
function RodapeCorreaTech({ tamanhoLogo=40 }){
  return (
    <div className="nao-imprimir" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,padding:"14px 0 6px",opacity:0.72}}>
      <div style={{fontSize:8.5,fontFamily:"monospace",color:C.muted,letterSpacing:"0.16em"}}>SISTEMA DESENVOLVIDO PELA</div>
      <img src={LOGO_CORREA_TECH} alt="Correa Tech" style={{height:tamanhoLogo,opacity:0.82}}/>
    </div>
  );
}

// ============================================================
// BIBLIOTECA DE REFERÊNCIA — materiais prontos, visualizar/baixar
// ============================================================
function ItemBiblioteca({ titulo, nivelId, aberto, onToggle, children }){
  const n = nivelInfo(nivelId);
  return (
    <div style={{background:"#fff",borderRadius:16,border:`1.5px solid ${C.borda}`,marginBottom:10,overflow:"hidden"}}>
      <div className="nao-imprimir" style={{display:"flex",alignItems:"center",gap:10,padding:"13px 15px"}}>
        <div style={{width:9,height:9,borderRadius:"50%",background:n.cor,flexShrink:0}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13,fontWeight:700,color:C.texto}}>{titulo}</div>
          <div style={{fontSize:10.5,color:C.muted,marginTop:1}}>{n.label} · {n.idade}</div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          {aberto && (
            <button onClick={()=>window.print()}
              style={{fontSize:11,fontWeight:700,padding:"7px 11px",borderRadius:10,border:`1.5px solid ${C.borda}`,background:"#fff",color:C.texto,cursor:"pointer",fontFamily:"inherit"}}>
              🖨️ PDF
            </button>
          )}
          <button onClick={onToggle}
            style={{fontSize:11,fontWeight:700,padding:"7px 13px",borderRadius:10,border:"none",background:aberto?C.roxo:C.roxoBg,color:aberto?"#fff":C.roxoE,cursor:"pointer",fontFamily:"inherit"}}>
            {aberto?"Fechar":"Visualizar"}
          </button>
        </div>
      </div>
      {aberto && (
        <div style={{padding:"0 15px 16px"}}>
          <div id="area-impressao">{children}</div>
        </div>
      )}
    </div>
  );
}

function SecaoBiblioteca({ titulo, sub, children }){
  return (
    <div style={{marginBottom:22}}>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:1.4,color:C.muted,textTransform:"uppercase",marginBottom:2}}>{titulo}</div>
      {sub && <div style={{fontSize:11.5,color:C.muted,marginBottom:10}}>{sub}</div>}
      <div style={{marginTop:10}}>{children}</div>
    </div>
  );
}

function Biblioteca({ onBack }){
  const [aberto, setAberto] = useState(null); // "tipo:id"
  const [imagensFichas, setImagensFichas] = useState({});
  const [gerandoFicha, setGerandoFicha] = useState(null);
  const [imagensLivroBib, setImagensLivroBib] = useState(new Array(BIBLIOTECA_LIVRO.paginas.length).fill(null));
  const [gerandoLivroBib, setGerandoLivroBib] = useState(false);

  function toggle(chave){ setAberto(prev => prev===chave ? null : chave); }

  async function gerarImagemFicha(item){
    setGerandoFicha(item.id);
    try{
      const img = await gerarImagem(item.descricaoIlustracao, "colorir");
      setImagensFichas(prev => ({...prev, [item.id]: img}));
    }catch(e){ console.error("Falha ao gerar ilustração da biblioteca:", e); }
    finally{ setGerandoFicha(null); }
  }

  async function gerarTodasLivroBib(){
    setGerandoLivroBib(true);
    const novas = [...imagensLivroBib];
    // Mesma correção de consistência aplicada no gerador: personagem fixo prefixado em toda cena.
    const personagem = BIBLIOTECA_LIVRO.personagem ? `${BIBLIOTECA_LIVRO.personagem}. ` : "";
    try{
      for(let i=0;i<BIBLIOTECA_LIVRO.paginas.length;i++){
        if(novas[i]) continue;
        try{
          const img = await gerarImagem(personagem + BIBLIOTECA_LIVRO.paginas[i].cena, "livro");
          novas[i] = img; setImagensLivroBib([...novas]);
        }catch(e){ console.error(`Página ${i+1} falhou:`, e); }
      }
    } finally{ setGerandoLivroBib(false); }
  }

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflowY:"auto",background:C.bg}}>
      <div className="nao-imprimir" style={{background:C.verdeE,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:18,color:"#9FE1CB"}}>←</button>
        <div><div style={{fontSize:16,fontWeight:700,color:"#fff"}}>📚 Biblioteca de Referência</div><div style={{fontSize:11,color:C.verdeC,marginTop:1}}>Exemplos prontos, por nível</div></div>
      </div>

      <div className="nao-imprimir" style={{padding:"16px 16px 4px",fontSize:12,color:C.muted,lineHeight:1.6}}>
        Veja exemplos prontos de cada tipo de material e nível pedagógico. Use como inspiração ou baixe direto em PDF.
      </div>

      <div style={{padding:"14px 16px 24px"}}>
        <SecaoBiblioteca titulo="🃏 Cartões Montessori">
          {BIBLIOTECA_CARTOES.map((item,i)=>{
            const key = `cartao:${i}`;
            const titulo = item.tipo==="numero" ? `Número ${item.numero}` : `Letra ${item.letra}`;
            return (
              <ItemBiblioteca key={key} titulo={titulo} nivelId={item.nivel} aberto={aberto===key} onToggle={()=>toggle(key)}>
                <CardMontessori data={item} nivelBadge={`${nivelInfo(item.nivel).label} · ${nivelInfo(item.nivel).idade}`}/>
              </ItemBiblioteca>
            );
          })}
        </SecaoBiblioteca>

        <SecaoBiblioteca titulo="📄 Atividades completas" sub="Padrão Knox Kids — narrativa, instruções, traçado e versículo">
          {BIBLIOTECA_FICHAS.map(item=>{
            const key = `ficha:${item.id}`;
            return (
              <ItemBiblioteca key={key} titulo={item.titulo} nivelId={item.nivel} aberto={aberto===key} onToggle={()=>toggle(key)}>
                <CardFicha data={item} imagem={imagensFichas[item.id]||null} gerandoImg={gerandoFicha===item.id}
                  onGerarImg={()=>gerarImagemFicha(item)} nivelBadge={`${nivelInfo(item.nivel).label} · ${nivelInfo(item.nivel).idade}`}/>
              </ItemBiblioteca>
            );
          })}
        </SecaoBiblioteca>

        <SecaoBiblioteca titulo="📖 Livro Correa Books" sub="Texto completo, pronto para ilustrar e imprimir">
          <ItemBiblioteca titulo={BIBLIOTECA_LIVRO.titulo} nivelId={BIBLIOTECA_LIVRO.nivel} aberto={aberto==="livro:1"} onToggle={()=>toggle("livro:1")}>
            <CardLivro data={BIBLIOTECA_LIVRO} imagens={imagensLivroBib} gerandoTodas={gerandoLivroBib} onGerarTodas={gerarTodasLivroBib}
              nivelBadge={`${nivelInfo(BIBLIOTECA_LIVRO.nivel).label} · ${nivelInfo(BIBLIOTECA_LIVRO.nivel).idade}`}/>
          </ItemBiblioteca>
        </SecaoBiblioteca>
      </div>
    </div>
  );
}

// ============================================================
// HOME
// ============================================================
function Home({ onNav, historico, userEmail, nivel, onNivelChange }){
  const [showNivelInfo, setShowNivelInfo] = useState(false);
  const nome = userEmail?.split("@")[0] || "família";
  const hora = new Date().getHours();
  const sauda = hora<12?"Bom dia":hora<18?"Boa tarde":"Boa noite";

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflowY:"auto",background:C.bg}}>
      <div style={{background:C.bg,padding:"20px 20px 0",textAlign:"center",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:8}}>
          <svg width="68" height="68" viewBox="0 0 68 68">
            <rect width="68" height="68" rx="18" fill={C.verde}/>
            <rect x="4" y="4" width="60" height="60" rx="14" fill={C.verdeE}/>
            <text x="34" y="24" textAnchor="middle" fontFamily="Georgia,serif" fontSize="11" fill={C.verdeC} letterSpacing="2">שְׁמַע</text>
            <text x="34" y="47" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="bold" fill={C.amarelo}>S</text>
            <rect x="20" y="53" width="28" height="3" rx="1.5" fill={C.amarelo} opacity=".4"/>
          </svg>
        </div>
        <div style={{fontFamily:"Georgia,serif",fontSize:28,fontWeight:700,letterSpacing:2,lineHeight:1}}>
          <span style={{color:C.verdeE}}>SH</span><span style={{color:C.verde}}>E</span><span style={{color:C.roxo}}>M</span><span style={{color:C.amareloE}}>A</span><span style={{color:"#ccc"}}>.</span><span style={{color:C.roxo,fontSize:20}}>AI</span>
        </div>
        <div style={{fontSize:11,color:C.muted,letterSpacing:3,fontFamily:"Georgia,serif",margin:"3px 0 4px"}}>שְׁמַע</div>
        <div style={{fontSize:10,color:"#B4B2A9",lineHeight:1.5,padding:"0 24px",marginBottom:14,fontStyle:"italic"}}>"Ensina-as diligentemente a teus filhos." — Dt 6:7</div>
      </div>

      <div style={{background:C.amarelo,padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:C.amareloE}}>{sauda}, {nome} ✦</div>
          <div style={{fontSize:11,color:"#7A6010",marginTop:1}}>O que vamos criar hoje?</div>
        </div>
        <div style={{width:34,height:34,borderRadius:"50%",background:C.amareloE,display:"flex",alignItems:"center",justifyContent:"center",color:C.amarelo,fontSize:13,fontWeight:700}}>{nome.slice(0,2).toUpperCase()}</div>
      </div>

      <div style={{padding:"12px 16px 4px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1.4,color:C.muted,textTransform:"uppercase"}}>Nível do aluno</div>
        <button onClick={()=>setShowNivelInfo(true)} className="nao-imprimir"
          style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${C.borda}`,background:"#fff",color:C.muted,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
          ?
        </button>
      </div>
      <div style={{padding:"0 16px 8px",display:"flex",gap:6,flexWrap:"wrap"}}>
        {NIVEIS.map(n=>(
          <button key={n.id} onClick={()=>onNivelChange(n.id)}
            style={{fontSize:11,padding:"5px 10px",borderRadius:16,cursor:"pointer",fontWeight:700,fontFamily:"inherit",border:`2px solid ${nivel===n.id?n.cor:C.borda}`,background:nivel===n.id?n.cor:"#fff",color:nivel===n.id?"#fff":C.muted}}>
            {n.label}
          </button>
        ))}
      </div>

      <div style={{padding:"8px 16px 4px",fontSize:10,fontWeight:700,letterSpacing:1.4,color:C.muted,textTransform:"uppercase"}}>O que criar</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"0 16px 8px"}}>
        {[
          {id:"montessori",icon:"🃏",titulo:"Cartões Montessori",sub:"Números com traçado real",cor:C.verdeBg,borda:C.verdeC,tCor:C.verdeE},
          {id:"fichas",icon:"📄",titulo:"Atividades",sub:"Página completa Knox",cor:C.roxoBg,borda:"#AFA9EC",tCor:C.roxoE},
          {id:"ilustra",icon:"🖼️",titulo:"Ilustrações",sub:"Preto e branco para colorir",cor:C.amareloBg,borda:C.amarelo,tCor:C.amareloE},
          {id:"livros",icon:"📖",titulo:"Livros Correa Books",sub:"6 páginas ilustradas",cor:C.rosaBg,borda:"#ED93B1",tCor:C.rosaE},
        ].map(m=>(
          <div key={m.id} onClick={()=>onNav(m.id)} style={{background:m.cor,borderRadius:16,padding:"14px 12px",cursor:"pointer",border:`2px solid ${m.borda}`}}>
            <div style={{fontSize:24,marginBottom:8}}>{m.icon}</div>
            <div style={{fontSize:12,fontWeight:700,color:m.tCor,lineHeight:1.3,marginBottom:3}}>{m.titulo}</div>
            <div style={{fontSize:11,color:m.tCor,opacity:.8,lineHeight:1.35}}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{padding:"4px 16px 8px"}}>
        <div onClick={()=>onNav("biblioteca")}
          style={{display:"flex",alignItems:"center",gap:12,background:"#fff",border:`2px solid ${C.borda}`,borderRadius:16,padding:"13px 15px",cursor:"pointer"}}>
          <div style={{fontSize:24}}>📚</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12.5,fontWeight:700,color:C.texto}}>Biblioteca de Referência</div>
            <div style={{fontSize:11,color:C.muted,marginTop:1}}>Exemplos prontos de cada nível — visualize e baixe</div>
          </div>
          <div style={{fontSize:16,color:C.muted}}>→</div>
        </div>
      </div>

      <div style={{padding:"8px 16px 4px",fontSize:10,fontWeight:700,letterSpacing:1.4,color:C.muted,textTransform:"uppercase"}}>Criados recentemente</div>
      <div style={{padding:"0 16px 8px"}}>
        {historico.length===0 && <div style={{fontSize:12,color:C.muted,padding:"12px 0"}}>Nenhum material ainda. Comece criando algo! ✦</div>}
        {historico.slice(0,5).map((h,i)=>{
          const cores={montessori:C.verdeC,fichas:C.roxo,ilustra:C.amarelo,livros:C.rosa};
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`0.5px solid ${C.borda}`}}>
              <div style={{width:9,height:9,borderRadius:"50%",background:cores[h.modulo]||C.verde}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:C.texto,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.prompt.slice(0,40)}{h.prompt.length>40?"…":""}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:1}}>{new Date(h.ts).toLocaleDateString("pt-BR")}</div>
              </div>
            </div>
          );
        })}
      </div>

      <RodapeCorreaTech/>

      {showNivelInfo && (
        <ModalNivel onClose={()=>setShowNivelInfo(false)} onVerBiblioteca={()=>{setShowNivelInfo(false);onNav("biblioteca");}}/>
      )}
    </div>
  );
}

// ============================================================
// PERFIL simples
// ============================================================
function Perfil({ onBack, onSignOut, userEmail, historico }){
  const stats = ["montessori","fichas","ilustra","livros"].map(m=>({
    m, label:{montessori:"Cartões",fichas:"Atividades",ilustra:"Ilustrações",livros:"Livros"}[m],
    count: historico.filter(h=>h.modulo===m).length,
  }));

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,overflowY:"auto",background:C.bg}}>
      <div style={{background:C.verdeE,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:18,color:"#9FE1CB"}}>←</button>
        <div><div style={{fontSize:16,fontWeight:700,color:"#fff"}}>Perfil</div><div style={{fontSize:11,color:C.verdeC,marginTop:1}}>Sua conta e uso</div></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"24px 16px"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:C.amarelo,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:C.amareloE,marginBottom:10}}>{(userEmail||"F").slice(0,2).toUpperCase()}</div>
        <div style={{fontSize:15,fontWeight:700,color:C.texto}}>{userEmail}</div>
        <div style={{marginTop:8,background:C.amareloBg,border:`2px solid ${C.amarelo}`,borderRadius:20,padding:"4px 14px",fontSize:11,fontWeight:700,color:C.amareloE}}>✦ Beta gratuito</div>
      </div>
      <div style={{padding:"0 16px 8px",fontSize:10,fontWeight:700,letterSpacing:1.4,color:C.muted,textTransform:"uppercase"}}>Uso total</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,padding:"0 16px 16px"}}>
        {stats.map(s=>(
          <div key={s.m} style={{background:"#fff",borderRadius:12,border:`1.5px solid ${C.borda}`,padding:14,textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:700,color:C.texto}}>{s.count}</div>
            <div style={{fontSize:11,color:C.muted,marginTop:3}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"8px 16px 8px"}}>
        <button onClick={onSignOut} style={{width:"100%",background:"#fff",color:"#A32D2D",border:"1.5px solid #F09595",borderRadius:12,padding:12,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Sair da conta</button>
      </div>
      <RodapeCorreaTech tamanhoLogo={34}/>
    </div>
  );
}

// ============================================================
// APP com layout responsivo
// ============================================================
export default function Shema({ onSignOut, userEmail }){
  const [tela, setTela] = useState("home");
  const [nivel, setNivel] = useState(() => ls("nivel", "n1"));
  const [historico, setHistorico] = useState(() => ls("historico", []));
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  function mudarNivel(n){ setNivel(n); ss("nivel", n); }
  function salvarHistorico(modulo, prompt, raw){
    const h = [{modulo,prompt,raw,ts:Date.now()}, ...historico].slice(0,30);
    setHistorico(h); ss("historico", h);
  }

  const MODULOS = {
    montessori:{corHeader:C.verde,corBtn:C.verde,titulo:"🃏 Cartões Montessori",sub:"Números com traçado real, mnemônico e mãos"},
    fichas:{corHeader:C.roxo,corBtn:C.roxo,titulo:"📄 Atividades",sub:"Páginas completas no padrão Knox Kids"},
    ilustra:{corHeader:C.amareloE,corBtn:C.amareloE,titulo:"🖼️ Ilustrações",sub:"Preto e branco, prontas para colorir"},
    livros:{corHeader:C.rosa,corBtn:C.rosa,titulo:"📖 Livros Correa Books",sub:"6 páginas ilustradas em aquarela"},
  };

  const navCriar = [
    {id:"home",icon:"🏠",label:"Início"},
    {id:"montessori",icon:"🃏",label:"Cartões"},
    {id:"fichas",icon:"📄",label:"Atividades"},
    {id:"livros",icon:"📖",label:"Livros"},
  ];
  const navExplorar = [{id:"biblioteca",icon:"📚",label:"Biblioteca"}];
  const navConta = [{id:"perfil",icon:"👤",label:"Perfil"}];
  const navItems = [...navCriar, ...navExplorar, ...navConta];
  const corNav = {home:C.amareloE,montessori:C.verde,fichas:C.roxo,ilustra:C.amareloE,livros:C.rosa,biblioteca:C.verdeE,perfil:C.verdeE};

  const conteudo = (
    <>
      {tela==="home" && <Home onNav={setTela} historico={historico} userEmail={userEmail} nivel={nivel} onNivelChange={mudarNivel}/>}
      {tela==="perfil" && <Perfil onBack={()=>setTela("home")} onSignOut={onSignOut} userEmail={userEmail} historico={historico}/>}
      {tela==="biblioteca" && <Biblioteca onBack={()=>setTela("home")}/>}
      {["montessori","fichas","ilustra","livros"].includes(tela) && (
        <Modulo modulo={tela} corHeader={MODULOS[tela].corHeader} corBtn={MODULOS[tela].corBtn}
          tituloHeader={MODULOS[tela].titulo} subHeader={MODULOS[tela].sub}
          onBack={()=>setTela("home")} onSave={salvarHistorico} nivel={nivel}/>
      )}
    </>
  );

  if(isDesktop){
    return (
      <div style={{display:"flex",height:"100vh",background:C.bg}}>
        <style>{PRINT_CSS}</style>
        <div className="nao-imprimir" style={{width:272,background:"#fff",borderRight:`1px solid ${C.borda}`,display:"flex",flexDirection:"column",padding:"24px 0 18px",overflowY:"auto"}}>
          <div style={{textAlign:"center",padding:"0 18px 20px",borderBottom:`1px solid ${C.borda}`,marginBottom:16}}>
            <svg width="52" height="52" viewBox="0 0 68 68" style={{marginBottom:6}}>
              <rect width="68" height="68" rx="18" fill={C.verde}/><rect x="4" y="4" width="60" height="60" rx="14" fill={C.verdeE}/>
              <text x="34" y="24" textAnchor="middle" fontFamily="Georgia,serif" fontSize="11" fill={C.verdeC} letterSpacing="2">שְׁמַע</text>
              <text x="34" y="47" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="bold" fill={C.amarelo}>S</text>
            </svg>
            <div style={{fontFamily:"Georgia,serif",fontSize:22,fontWeight:700,letterSpacing:1.5}}>
              <span style={{color:C.verdeE}}>SH</span><span style={{color:C.verde}}>E</span><span style={{color:C.roxo}}>M</span><span style={{color:C.amareloE}}>A</span><span style={{color:"#ccc"}}>.</span><span style={{color:C.roxo,fontSize:15}}>AI</span>
            </div>
          </div>

          <div style={{padding:"0 22px",fontSize:9.5,fontWeight:700,letterSpacing:1.4,color:C.muted,textTransform:"uppercase",marginBottom:6}}>Criar</div>
          {navCriar.map(n=>(
            <button key={n.id} onClick={()=>setTela(n.id)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"11px 22px",cursor:"pointer",border:"none",background:tela===n.id?corNav[n.id]+"18":"transparent",borderLeft:`3px solid ${tela===n.id?corNav[n.id]:"transparent"}`,fontFamily:"inherit",textAlign:"left"}}>
              <span style={{fontSize:19}}>{n.icon}</span>
              <span style={{fontSize:13.5,fontWeight:tela===n.id?700:500,color:tela===n.id?corNav[n.id]:C.muted}}>{n.label}</span>
            </button>
          ))}

          <div style={{padding:"16px 22px 6px",fontSize:9.5,fontWeight:700,letterSpacing:1.4,color:C.muted,textTransform:"uppercase"}}>Explorar</div>
          {navExplorar.map(n=>(
            <button key={n.id} onClick={()=>setTela(n.id)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"11px 22px",cursor:"pointer",border:"none",background:tela===n.id?corNav[n.id]+"18":"transparent",borderLeft:`3px solid ${tela===n.id?corNav[n.id]:"transparent"}`,fontFamily:"inherit",textAlign:"left"}}>
              <span style={{fontSize:19}}>{n.icon}</span>
              <span style={{fontSize:13.5,fontWeight:tela===n.id?700:500,color:tela===n.id?corNav[n.id]:C.muted}}>{n.label}</span>
            </button>
          ))}

          <div style={{padding:"16px 22px 6px",fontSize:9.5,fontWeight:700,letterSpacing:1.4,color:C.muted,textTransform:"uppercase"}}>Conta</div>
          {navConta.map(n=>(
            <button key={n.id} onClick={()=>setTela(n.id)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"11px 22px",cursor:"pointer",border:"none",background:tela===n.id?corNav[n.id]+"18":"transparent",borderLeft:`3px solid ${tela===n.id?corNav[n.id]:"transparent"}`,fontFamily:"inherit",textAlign:"left"}}>
              <span style={{fontSize:19}}>{n.icon}</span>
              <span style={{fontSize:13.5,fontWeight:tela===n.id?700:500,color:tela===n.id?corNav[n.id]:C.muted}}>{n.label}</span>
            </button>
          ))}

          <div style={{marginTop:"auto",padding:"16px 22px 0",borderTop:`1px solid ${C.borda}`}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{userEmail}</div>
            <button onClick={onSignOut} style={{fontSize:12,color:"#A32D2D",background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"inherit"}}>Sair</button>
          </div>

          <RodapeCorreaTech tamanhoLogo={34}/>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",maxWidth:920,margin:"0 auto",width:"100%"}}>
          {conteudo}
        </div>
      </div>
    );
  }

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",maxWidth:480,margin:"0 auto",background:C.bg}}>
      <style>{PRINT_CSS}</style>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>{conteudo}</div>
      <div className="nao-imprimir" style={{background:"#fff",borderTop:`1px solid ${C.borda}`,display:"flex",justifyContent:"space-around",padding:"8px 0 12px"}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setTela(n.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",flex:1,border:"none",background:"none",fontFamily:"inherit"}}>
            <span style={{fontSize:19}}>{n.icon}</span>
            <span style={{fontSize:8.5,fontWeight:700,color:tela===n.id?corNav[n.id]||C.verde:"#C8C5BC"}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
