# Shema.AI — Deploy na Vercel

## 1. Criar repositório
```
cd shema-app
git init
git add .
git commit -m "feat: Shema.AI v1.0 — MVP completo"
git remote add origin https://github.com/Correa-Tech1/shema-ai.git
git push -u origin main
```

## 2. Variáveis de ambiente na Vercel
Adicionar em Settings → Environment Variables:

| Variável | Valor |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key do Supabase |
| `ANTHROPIC_API_KEY` | Sua chave da Anthropic |

## 3. Supabase
- Criar novo projeto Supabase dedicado ao Shema.AI (não reaproveitar o do COSMO ou JACKBOY — cada produto com sua própria base)
- Habilitar Email Auth em Authentication → Providers
- Confirmar email: opcional — pode desabilitar em Auth → Settings

## 4. Modelos Claude usados
| Módulo | Modelo | Motivo |
|---|---|---|
| Cartões Montessori | claude-haiku-4-5 | JSON curto, tarefa estruturada |
| Prompt de ilustração | claude-haiku-4-5 | Output pequeno e objetivo |
| Fichas de atividade | claude-sonnet-4-6 | HTML criativo, texto formatado |
| Livros Correa Books | claude-sonnet-4-6 | Narrativa longa, coerência |

## 5. Deploy automático
Após conectar GitHub → Vercel, cada `git push` faz deploy automático.
