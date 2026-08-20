-- Shema.AI — Supabase Setup
-- Execute no SQL Editor do Supabase

-- Habilitar RLS na tabela de auth (já existe por padrão)
-- Não precisamos de tabelas extras no MVP — tudo vai em localStorage por usuário.
-- Se quiser persistir histórico no Supabase no futuro, criar:

-- CREATE TABLE historico (
--   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
--   modulo text,
--   prompt text,
--   resultado text,
--   criado_em timestamptz DEFAULT now()
-- );
-- ALTER TABLE historico ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "user sees own" ON historico FOR ALL USING (auth.uid() = user_id);

SELECT 'Shema.AI — Auth ativo. MVP usa localStorage. Nenhuma tabela necessária por enquanto.' as status;
