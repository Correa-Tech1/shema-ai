// Shema.AI API — v3 otimizada
// Roteamento cirúrgico: Haiku para tudo, exceto livro (que precisa de coerência longa)
// Custo estimado por operação: cartão R$0.005, ficha R$0.02, ilustra R$0.005, livro R$0.15

const MODELS = {
  montessori: "claude-haiku-4-5",
  fichas:     "claude-haiku-4-5",   // Haiku basta com prompt certo
  ilustra:    "claude-haiku-4-5",
  livros:     "claude-sonnet-4-6",  // Livro precisa de coerência narrativa
};

const MAX_TOKENS = {
  montessori: 380,
  fichas:     1500,
  ilustra:    480,
  livros:     2100,
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "ANTHROPIC_API_KEY não configurada." });

  try {
    const { modulo, system, messages } = req.body || {};
    const model  = MODELS[modulo]     || "claude-haiku-4-5";
    const tokens = MAX_TOKENS[modulo] || 500;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: tokens, system, messages }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: "Falha na IA", detail });
    }

    const data = await response.json();
    return res.status(200).json({ content: data.content, model });
  } catch (e) {
    return res.status(500).json({ error: "Erro interno", detail: String(e) });
  }
}
