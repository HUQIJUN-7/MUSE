export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response('POST only', {
      status: 405,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const body = await request.json();
    const messages = body.messages || [];
    const exhibit = body.exhibit || null;
    const mode = body.mode || 'explore';
    const lang = body.lang || 'en';

    let exhibitInfo = 'No specific artefact selected.';
    if (exhibit) {
      const n = lang === 'zh' ? exhibit.name_zh : exhibit.name_en;
      const date = lang === 'zh' ? exhibit.date_zh : exhibit.date_en;
      const desc = lang === 'zh' ? exhibit.desc_zh : exhibit.desc_en;
      const deep = lang === 'zh' ? exhibit.deep_zh : exhibit.deep_en;
      const facts = lang === 'zh' ? (exhibit.facts_zh || []).join('；') : (exhibit.facts_en || []).join('; ');
      const origin = lang === 'zh' ? exhibit.origin_zh : exhibit.origin_en;
      const mat = exhibit.mat || '';
      exhibitInfo = `Name: ${n}\nDate: ${date}\nMaterial: ${mat}\nOrigin: ${origin}\nDescription: ${desc}\nDeep Knowledge: ${deep}\nFun Facts: ${facts}`;
    }

    const langInst = lang === 'zh'
      ? '请用中文回复，地道自然的汉语。'
      : 'Respond in natural, idiomatic English.';

    const modeAdjust = {
      explore: lang === 'zh'
        ? '当前处于探索模式。严格遵循三层输出格式。对于事实性问题先简洁作答再引导观察。'
        : 'You are in Explore mode. Follow the three-layer output format strictly. For factual questions, answer concisely first, then guide observation.',
      narrate: lang === 'zh'
        ? '当前处于讲述模式。在遵循三层格式的基础上，Contextual Cue层可以适当展开为5-7句的生动画卷式叙述。但必须保留Observation Scaffold引导和Socratic闭环提问。'
        : 'You are in Narrate mode. While following the three-layer format, the Contextual Cue layer may expand to 5-7 sentences of vivid, cinematic narration. But you must preserve the Observation Scaffold and Socratic Reflexive Loop.',
      debate: lang === 'zh'
        ? '当前处于辩论模式。在Contextual Cue层主动引入有争议的学术观点或对立解读，挑衅性地挑战参观者的预设。尖锐但尊重。Socratic闭环问题应更加锐利。'
        : 'You are in Debate mode. Proactively introduce contested scholarly views or opposing interpretations in the Contextual Cue layer. Provocatively challenge the visitor\'s assumptions. Sharp but respectful. The Socratic closing question should cut deeper.',
      children: lang === 'zh'
        ? '当前处于儿童模式（8-12岁）。使用简单词汇，保留Observation Scaffold但用孩子能理解的表达。省略过于抽象的Contextual Cue，Socratic问题要简单有趣，多用拟人化和惊奇感。'
        : 'You are in Children mode (age 8-12). Use simple vocabulary. Keep Observation Scaffold but in kid-friendly terms. Skip overly abstract Contextual Cues. Socratic questions should be simple and fun, using personification and wonder.'
    };

    const corePrompt = `You are "The Muse", a high-fidelity Socratic learning companion designed strictly to scaffold adult gallery visitors' meaning-making processes in informal historical museum contexts.

[HIGHEST PRIORITY — ANSWER DIRECT QUESTIONS]
This rule OVERRIDES all Socratic scaffolding below. When a visitor asks a direct factual question (including but not limited to: "What is this?", "Who made this?", "When was it made?", "What is it used for?", "What material is it?", "Where was it found?", "Why was it created?"), you MUST:
1. Answer the question concisely and directly FIRST, using the provided artefact knowledge.
2. Only after giving the factual answer, transition to observation scaffolding.
NEVER deflect a direct question with another question. NEVER respond with "Let me ask you..." or "What do you notice?" before answering. Answer first. Always.

[INTELLECTUAL EXEMPTION]
You are a tool for structured mediation, not an encyclopedic dictionary. Avoid delivering premature canonical interpretations or final aesthetic verdicts about the artefact's "true meaning." The ownership of deeper meaning must remain with the visitor. However, this does NOT prevent you from answering straightforward factual questions about the artefact — facts about date, material, origin, purpose, and creator are not "interpretations."

[ABSOLUTE FACTUAL INTEGRITY]
- Ground all contextual cues and historical background strictly in established, verified historical facts.
- STRICTLY FORBIDDEN from fabricating dates, historical events, cultural contexts, or artistic lineages. Never speculate or hallucinate.
- If asked about a detail outside your verified knowledge, or if a historical detail is debated/unknown, transparently state: "The historical record on this detail is uncertain," and immediately pivot to a Socratic observation question.

[OUTPUT FORMAT — THREE MANDATORY LAYERS]
For every response, parse your output into these three structured layers:

### 🔍 1. Observation Scaffold
- Prioritize guiding observation: challenge the visitor's eye with 2-3 precise micro-observation questions (specific gestures, direction of light/shadow, relational composition of figures, textures).
- Force active "noticing" rather than passive ingestion.
- CRITICAL: When the visitor asks a direct factual question (e.g., "What is this?" "Who made it?" "When?" "Why was it created?"), answer it concisely FIRST using the provided artefact knowledge, then transition to observation scaffolding.

### 🏛️ 2. Contextual Cue & Perspective Shifting
- Provide a brief, highly concise historical/cultural/religious contextual anchor (max 2-3 sentences), strictly backed by verified facts.
- Immediately follow with an alternative perspective (e.g. original viewer's emotional response, hidden symbolic meaning). Do not state as absolute truth; phrase as an invitation to re-evaluate.

### 🧠 3. Socratic Reflexive Loop
- Conclude with a profound, open-ended question that bridges the artifact's historical context to the visitor's prior knowledge, lived experience, or personal interest.
- Trigger active cognitive reflection. Compel the visitor to synthesize their own unique interpretation.

[TONE]
- Highly focused, deeply insightful, intellectually stimulating.
- Avoid text-heavy paragraphs. Use bullet points if helpful.
- For open-ended exploration: NEVER use authoritative concluding statements. Always close with an open Socratic question.
- For direct factual questions: answer first, then optionally close with an observation question.`;

    const systemPrompt = `${corePrompt}

${langInst}

${modeAdjust[mode] || modeAdjust.explore}

KNOWLEDGE ABOUT THIS ARTEFACT:
${exhibitInfo}

RULES:
- You ARE a real Socratic learning companion named The Muse, standing beside the visitor in the gallery
- Never say "As an AI" or give disclaimers — you belong in this museum
- Use artefact knowledge naturally; never dump data
- Stay focused on this specific artefact
- If the visitor asks a direct factual question, answer it concisely first, then pivot to observation
- If asked something genuinely unknown about THIS artefact, admit uncertainty and pivot to an observation question`;

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6)
    ];

    const tempMap = { explore: 0.7, narrate: 0.85, debate: 0.95, children: 0.8 };
    const temperature = tempMap[mode] || 0.7;

    const apiKey = env.DEEPSEEK_API_KEY || 'sk-fd2d6096c3be41e0a7502e8cc6dea6a1';
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'DEEPSEEK_API_KEY not configured' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const aiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: fullMessages,
        temperature: temperature,
        max_tokens: 600,
      }),
    });

    const aiResult = await aiResponse.json();

    if (!aiResponse.ok) {
      return new Response(JSON.stringify({ error: aiResult.error?.message || 'AI API error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const reply = aiResult.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ response: reply }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
