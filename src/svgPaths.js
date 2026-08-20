// SVGs dos números 0-10 — traçado pontilhado guia + setas de ordem/direção
// Redesenhado (v5): geometria própria de cada algarismo, testada visualmente
// número a número antes de entrar no app. Cada número é UM traçado (ou dois,
// quando a escrita real levanta a caneta — como no 4, 7 e 10), sem contorno
// sólido por cima: o pontilhado É o cartão.
export const NUMERO_SVG = {
  0: {
    tracejado: "M 60,18 C 40,18 28,36 28,60 C 28,84 40,102 60,102 C 80,102 92,84 92,60 C 92,36 80,18 60,18 Z",
    setas: [{ x:60, y:18, num:1 }],
  },
  1: {
    tracejado: "M 42,34 L 60,18 L 60,102",
    setas: [{ x:42, y:34, num:1 }, { x:60, y:18, num:2 }],
  },
  2: {
    tracejado: "M 32,42 C 32,26 46,16 60,16 C 76,16 90,26 90,42 C 90,56 78,66 66,76 C 56,84 44,92 34,100 L 92,100",
    setas: [{ x:32, y:42, num:1 }, { x:34, y:100, num:2 }],
  },
  3: {
    tracejado: "M 34,26 C 34,16 46,12 60,12 C 76,12 90,20 90,34 C 90,46 78,52 64,54 C 78,56 92,64 92,80 C 92,96 78,104 60,104 C 46,104 34,98 32,88",
    setas: [{ x:34, y:26, num:1 }, { x:64, y:54, num:2 }],
  },
  4: {
    tracejado: "M 66,16 L 28,72 L 92,72 M 66,16 L 66,104",
    setas: [{ x:66, y:16, num:1 }, { x:28, y:72, num:2 }, { x:66, y:44, num:3 }],
  },
  5: {
    tracejado: "M 84,18 L 36,18 L 32,52 C 46,42 68,42 80,54 C 92,66 90,88 74,98 C 60,106 40,102 30,90",
    setas: [{ x:84, y:18, num:1 }, { x:36, y:18, num:2 }, { x:60, y:54, num:3 }],
  },
  6: {
    tracejado: "M 82,24 C 58,12 32,32 28,60 C 24,88 42,106 64,102 C 84,98 92,78 82,64 C 72,50 50,52 42,66 C 36,76 38,88 48,96",
    setas: [{ x:82, y:24, num:1 }, { x:42, y:66, num:2 }],
  },
  7: {
    tracejado: "M 26,24 L 92,24 L 50,104",
    setas: [{ x:26, y:24, num:1 }, { x:92, y:24, num:2 }],
  },
  8: {
    tracejado: "M 60,16 C 46,16 36,24 36,34 C 36,44 46,52 60,52 C 74,52 84,44 84,34 C 84,24 74,16 60,16 Z M 60,52 C 42,52 28,62 28,78 C 28,96 42,106 60,106 C 78,106 92,96 92,78 C 92,62 78,52 60,52 Z",
    setas: [{ x:60, y:16, num:1 }, { x:60, y:52, num:2 }],
  },
  9: {
    tracejado: "M 84,50 C 84,32 72,18 58,18 C 44,18 30,30 30,46 C 30,60 44,70 58,66 C 68,63 76,57 82,51 L 48,104",
    setas: [{ x:84, y:50, num:1 }, { x:60, y:80, num:2 }],
  },
  10: {
    tracejado: "M 18,36 L 30,22 L 30,102 M 77,22 C 60,22 50,38 50,62 C 50,86 60,102 77,102 C 94,102 104,86 104,62 C 104,38 94,22 77,22 Z",
    setas: [{ x:18, y:36, num:1 }, { x:77, y:22, num:2 }],
  },
};

// Vogais — traçado real (padrão Montessori: vogais vermelhas). Consoantes ainda
// não têm path próprio; o cartão cai de volta pro glifo grande até serem desenhadas.
export const LETRA_SVG = {
  A: {
    tracejado: "M 60,16 L 28,104 M 60,16 L 92,104 M 40,68 L 80,68",
    setas: [{ x:50, y:22, num:1 }, { x:70, y:22, num:2 }, { x:40, y:68, num:3 }],
  },
  E: {
    tracejado: "M 30,18 L 30,102 M 30,18 L 86,18 M 30,60 L 72,60 M 30,102 L 86,102",
    setas: [{ x:30, y:18, num:1 }, { x:45, y:18, num:2 }, { x:45, y:60, num:3 }, { x:45, y:102, num:4 }],
  },
  I: {
    tracejado: "M 60,18 L 60,102",
    setas: [{ x:60, y:18, num:1 }],
  },
  O: {
    tracejado: "M 60,18 C 40,18 28,36 28,60 C 28,84 40,102 60,102 C 80,102 92,84 92,60 C 92,36 80,18 60,18 Z",
    setas: [{ x:60, y:18, num:1 }],
  },
  U: {
    tracejado: "M 32,18 L 32,66 C 32,90 46,104 60,104 C 74,104 88,90 88,66 L 88,18",
    setas: [{ x:32, y:18, num:1 }],
  },
};
