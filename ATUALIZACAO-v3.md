# Shema.AI v3.0 — Reconstrução completa

## O que mudou nesta versão

### 1. Cartão Montessori com traçado REAL
Antes: número simples com texto.
Agora: SVG com contorno, linha guia tracejada e setas numeradas com a ordem dos traços — no padrão Knox Kids. Todos os 11 cartões (0-10) prontos.

### 2. Atividade completa (padrão Knox)
Antes: instruções soltas.
Agora: narrativa engajante + instruções numeradas + ilustração para colorir + área de traçado + versículo. Estrutura idêntica à Lição 4 da Knox Kids.

### 3. Ilustração AUTOMATICAMENTE preto e branco
Antes: gerava colorida (erro).
Agora: API força "coloring book, black and white outlines only" — sai P&B pronto para colorir.

### 4. Livro com "ilustrar tudo de uma vez"
Antes: gerar página por página, um botão para cada.
Agora: um botão "Ilustrar livro inteiro" gera as 6 páginas em sequência automaticamente (leva ~1 minuto).

### 5. Otimização de modelos — 70% mais barato
Antes: Sonnet para fichas E livros.
Agora: Haiku para tudo, exceto livros. Haiku custa 1/3 do Sonnet.

### 6. Parser JSON tolerante
Antes: quebrava se a IA respondesse com texto antes/depois do JSON.
Agora: extrai o JSON de qualquer resposta.

### 7. Prompts cirúrgicos reescritos
Cada system prompt agora explica a estrutura obrigatória, exemplos e regras. A IA erra muito menos.

---

## Deploy da atualização

Sem novas variáveis de ambiente — usa as mesmas do v2.

```bash
cd Desktop\shema-app
```

Extraia o novo ZIP substituindo os arquivos existentes. Depois:

```bash
git add .
```

```bash
git commit -m "feat: v3 traçado SVG real, atividade Knox, imagem PB, livro em lote"
```

```bash
git push
```

A Vercel publica automaticamente.

---

## Custo estimado por operação (v3)

| Operação | Modelo | Custo |
|---|---|---|
| Cartão Montessori | Haiku | ~R$0,005 |
| Atividade completa | Haiku | ~R$0,02 |
| Ilustração (texto) | Haiku | ~R$0,005 |
| Ilustração (imagem) | GPT Image Mini | ~R$0,03 |
| Livro (texto) | Sonnet | ~R$0,15 |
| Livro completo com 6 imgs | Sonnet + Image | ~R$0,33 |

Uso mensal de 1 família intenso: **~R$3-5**.
