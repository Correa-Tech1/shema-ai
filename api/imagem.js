// API de imagem OpenAI — v3 com prompts otimizados por tipo
// tipo: "colorir" (preto e branco) ou "colorida" (livro/ilustração)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "OPENAI_API_KEY não configurada." });

  try {
    const { prompt, tipo, size } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Prompt vazio." });

    // Reforço automático do estilo conforme tipo
    let promptFinal = prompt;
    if (tipo === "colorir") {
      promptFinal = `Black and white coloring book page for children, thick clean outlines only, absolutely no colors, no shading, no gray tones, pure white background, simple cartoon style, perfect for kids to color with pencils. Subject: ${prompt}. IMPORTANT: only black outlines on white, no fills, no colors whatsoever.`;
    } else if (tipo === "livro") {
      promptFinal = `Children's book illustration, soft watercolor style, warm friendly colors, biblical story scene, simple and gentle for young children ages 3-6, clean composition. Scene: ${prompt}`;
    } else {
      promptFinal = `Children's illustration, biblical theme, friendly cartoon style, bright colors: ${prompt}`;
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1-mini",
        prompt: promptFinal,
        n: 1,
        size: size || "1024x1024",
        quality: "medium",
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(502).json({ error: "Falha ao gerar imagem", detail });
    }

    const data = await response.json();
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return res.status(502).json({ error: "Imagem não retornada" });

    return res.status(200).json({ image: `data:image/png;base64,${b64}` });
  } catch (e) {
    return res.status(500).json({ error: "Erro interno", detail: String(e) });
  }
}
