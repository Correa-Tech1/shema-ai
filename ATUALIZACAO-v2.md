# Shema.AI v2.0 — O que mudou

## Novidades desta atualização

### 1. Impressão limpa ✅
Agora ao clicar em "Imprimir", só o material sai — não a tela toda.
Cada peça (cartão, atividade, ilustração, livro) imprime isolada em A4.

### 2. Versão desktop ✅
Em telas grandes (PC), o app usa sidebar lateral.
Em celular, mantém a navegação embaixo. Detecta automaticamente.

### 3. Cartão Montessori enriquecido ✅
Agora o cartão traz, como o material da Knox Kids:
- O número grande
- O versinho mnemônico ("Reto pra cima, bracinho pro lado...")
- Os pontos de quantidade
- A representação em mãos (dedos)
- O tema bíblico do número
- Versículo relacionado

### 4. Geração REAL de imagem ✅
Conectamos a API de imagem da OpenAI (GPT Image 1 Mini).
- Nas Ilustrações: gera a imagem de verdade, não só o prompt
- Nas Atividades: gera figura para colorir
- Nos Livros: ilustra cada página individualmente
Custo: ~$0.005 por imagem (mais barato disponível).

### 5. Níveis Knox Kids ✅
Agora você escolhe o nível do aluno (Baby, 1, 2, 3, 4, 5).
A IA adapta o material à idade e ao estágio pedagógico.

---

## IMPORTANTE — Nova variável de ambiente

Esta versão precisa de UMA nova variável na Vercel:

| Variável | Valor |
|---|---|
| `OPENAI_API_KEY` | sua chave da OpenAI (sk-...) |

### Como adicionar:
1. Acesse vercel.com → projeto shema-ai
2. Settings → Environment Variables
3. Adicione:
   - Key: `OPENAI_API_KEY`
   - Value: sua chave OpenAI
4. Clique em "Save"
5. Vá em Deployments → clique nos "..." do último → "Redeploy"

Sem essa variável, a geração de imagem não funciona (mas o resto sim).

### Proteger gastos de imagem:
No platform.openai.com → Settings → Limits → coloque limite de $5/mês.
A $0.005 por imagem, isso dá 1000 imagens/mês com folga.

---

## Deploy da atualização

```bash
cd Desktop\shema-app
git add .
git commit -m "feat: v2 - impressao limpa, desktop, cartao rico, imagem real, niveis"
git push
```

A Vercel publica automaticamente. Depois adicione a OPENAI_API_KEY e faça redeploy.
