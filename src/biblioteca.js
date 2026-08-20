// ============================================================
// BIBLIOTECA DE REFERÊNCIA — materiais prontos, curados à mão
// Zero custo de API: renderizados com os mesmos componentes do app.
// Servem também como exemplo vivo de cada nível pedagógico.
// ============================================================

// Cartões Montessori — números 1 a 5 e letra A
// (mnemônico/tema/mãos vêm de traceData.js; aqui só o que a IA normalmente gera)
export const BIBLIOTECA_CARTOES = [
  { tipo:"numero", numero:1, pontos:1, nivel:"n1",
    palavraBiblica:"Deus", versiculoCurto:"Ouve, Israel: o Senhor nosso Deus é o único Senhor. — Dt 6:4" },
  { tipo:"numero", numero:2, pontos:2, nivel:"n1",
    palavraBiblica:"Tábuas", versiculoCurto:"Moisés desceu do monte com as duas tábuas da aliança. — Êx 34:29" },
  { tipo:"numero", numero:3, pontos:3, nivel:"n2",
    palavraBiblica:"Trindade", versiculoCurto:"Batizando-os em nome do Pai, do Filho e do Espírito Santo. — Mt 28:19" },
  { tipo:"numero", numero:4, pontos:4, nivel:"n2",
    palavraBiblica:"Evangelhos", versiculoCurto:"Mateus, Marcos, Lucas e João contaram a vida de Jesus." },
  { tipo:"numero", numero:5, pontos:5, nivel:"n2",
    palavraBiblica:"Pães", versiculoCurto:"Jesus multiplicou cinco pães para alimentar a multidão. — Jo 6:9" },
  { tipo:"letra", letra:"A", nivel:"n1",
    palavra:"Amor", versiculoCurto:"Deus é amor. — 1 João 4:8" },
  { tipo:"letra", letra:"O", nivel:"n1",
    palavra:"Oração", versiculoCurto:"Orai sem cessar. — 1 Tessalonicenses 5:17" },
];

// Atividades completas (fichas) — padrão Knox Kids
export const BIBLIOTECA_FICHAS = [
  {
    id:"ovelhas-davi",
    nivel:"n2",
    titulo:"AS 5 OVELHAS DE DAVI",
    subtitulo:"Contando as ovelhinhas do nosso amigo pastor",
    narrativa:"Davi era um menino pastor que cuidava de ovelhas branquinhas e fofas no campo. Hoje ele quer contar quantas ovelhas tem: será que são 5? Vamos ajudar Davi a contar e aprender o número 5!",
    instrucoes:[
      "Observe a ilustração com as 5 ovelhas ao redor de Davi",
      "Aponte e conte cada ovelha em voz alta: 1, 2, 3, 4, 5",
      "Circule ou pinte de branco cada ovelha conforme conta",
      "Trace o número 5 no espaço pontilhado abaixo",
    ],
    precisaIlustracao:true,
    descricaoIlustracao:"a young shepherd boy sitting with 5 fluffy sheep around him, gentle hills in the background",
    temTracado:true,
    conteudoTracado:"5",
    atividadeExtra:"Use seus dedos para contar: levante 5 dedos enquanto diz 'Deus cuida de minhas ovelhas assim como cuida de mim!' Faça com a criança várias vezes para fixar a quantidade.",
    versiculo:"O Senhor é meu pastor e nada me faltará.",
    referencia:"Salmo 23:1",
  },
  {
    id:"peixes-jesus",
    nivel:"n1",
    titulo:"OS DOIS PEIXES DE JESUS",
    subtitulo:"Contando a multiplicação do menino generoso",
    narrativa:"Um menino tinha só dois peixinhos e cinco pães. Ele deu tudo para Jesus. Jesus abençoou, e a comida foi suficiente para milhares de pessoas! Vamos contar os dois peixes e aprender o número 2.",
    instrucoes:[
      "Observe os 2 peixinhos na cesta do menino",
      "Aponte e conte em voz alta: 1, 2",
      "Pinte os peixinhos de azul",
      "Trace o número 2 no espaço pontilhado abaixo",
    ],
    precisaIlustracao:true,
    descricaoIlustracao:"a small basket with 2 fish and 5 loaves of bread, simple and joyful",
    temTracado:true,
    conteudoTracado:"2",
    atividadeExtra:"Fale com a criança: 'Deus faz muito com pouco, quando oferecemos o que temos!' Peça que ela conte 2 objetos da casa, como 2 sapatos ou 2 mãozinhas.",
    versiculo:"Jesus pegou os pães e os peixes, deu graças, e os repartiu.",
    referencia:"João 6:11",
  },
];

// Livro Correa Books — texto já validado
export const BIBLIOTECA_LIVRO = {
  id:"davi-gigante",
  nivel:"baby",
  titulo:"Davi e o Gigante",
  subtitulo:"Quando confiamos em Deus, somos corajosos",
  faixaEtaria:"2-3 anos",
  licaoTeologica:"A coragem verdadeira vem de confiar em Deus, não no nosso próprio tamanho ou força.",
  personagem:"a small child-like shepherd boy with curly reddish-brown hair, warm brown and mustard-yellow tunic, rosy cheeks, gentle smile",
  paginas:[
    { pagina:1, texto:"Davi era um menino pequeno. Ele cuidava das ovelhinhas no campo. Davi amava muito Deus.", cena:"the boy sitting in a green field with a wooden shepherd's staff, surrounded by 4 fluffy sheep, sunny sky" },
    { pagina:2, texto:"Um dia, Davi foi ver seus irmãos. Eles eram soldados! Davi levou pão e queijo para eles.", cena:"the boy carrying a basket of bread toward three young soldiers with spears and shields, grassy hill" },
    { pagina:3, texto:"Lá estava Golias! Um gigante muito, muito grande. Ele gritava muito alto e assustava todos.", cena:"a large shouting giant soldier with a spear, small frightened soldiers huddled in the distance" },
    { pagina:4, texto:"Os soldados estavam com medo. Mas Davi disse: 'Eu não tenho medo! Deus está comigo!'", cena:"the boy speaking confidently to two worried soldiers, warm golden light" },
    { pagina:5, texto:"Davi pegou uma pedrinha. Ele confiou em Deus com todo seu coração. Whoosh! A pedra foi longe e Golias caiu!", cena:"the boy swinging a small sling, a stone flying through the air toward the falling giant" },
    { pagina:6, texto:"Todos ficaram felizes! Davi aprendeu que Deus nos dá coragem. Quando você tem medo, pode falar com Deus. Ele está sempre perto de você!", cena:"the boy celebrating joyfully with soldiers cheering around him, warm sunset light" },
  ],
  versiculoFinal:"Não tema, porque eu sou contigo.",
  referencia:"Isaías 41:10",
  oracaoFinal:"Senhor Deus, quando eu tiver medo, me lembro que você está comigo. Obrigado por me dar coragem. Amém!",
};
