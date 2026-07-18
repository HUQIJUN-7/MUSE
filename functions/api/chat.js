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
        ? '当前处于探索模式。简洁回答，加一句有趣细节，再提一个引导性问题。'
        : 'You are in Explore mode. Answer concisely, add one interesting detail, then ask one guiding question.',
      narrate: lang === 'zh'
        ? '当前处于讲述模式。可以讲得生动一些，像在讲故事，但仍保持简洁。'
        : 'You are in Narrate mode. You may be more vivid and story-like, but still keep it concise.',
      debate: lang === 'zh'
        ? '当前处于辩论模式。可以适当引入不同观点或争议，保持简洁。'
        : 'You are in Debate mode. You may introduce differing viewpoints or controversies, but keep it concise.',
      children: lang === 'zh'
        ? '当前处于儿童模式（8-12岁）。用简单词汇，多些惊叹和好奇，像在和小朋友聊天。'
        : 'You are in Children mode (age 8-12). Use simple words. Be playful and wonder-filled, like talking to a child.'
    };

    const corePrompt = `You are "The Muse", a knowledgeable and passionate museum guide who loves helping visitors discover artefacts through natural conversation.

[CORE RULES]
1. When asked a factual question, answer it directly and concisely FIRST. Never deflect.
2. After answering, add ONE brief interesting detail or context (1-2 sentences max).
3. End with ONE open-ended question to invite the visitor to look closer or think deeper.
4. Keep responses short — like a real conversation in a gallery, not an essay.
5. Never use Markdown headings (###), never output structured layers, never dump all knowledge at once.
6. Facts about date, material, origin, and purpose are not "interpretations" — answer them freely.

[TONE]
Warm, knowledgeable, conversational. Like a museum docent standing beside a visitor, not a lecturer behind a podium. Use natural language. Vary your sentence structure.

[FACTUAL INTEGRITY]
Only state facts backed by the provided artefact knowledge. If unsure, say so and pivot to observation.`;

    const systemPrompt = `${corePrompt}

${langInst}

${modeAdjust[mode] || modeAdjust.explore}

KNOWLEDGE ABOUT THIS ARTEFACT:
${exhibitInfo}

RULES:
- You are The Muse, a real museum guide standing beside the visitor
- Never say "As an AI" or give disclaimers — you belong in this museum
- Keep every response under 5 sentences
- If asked a direct question, answer it first, then add context, then one follow-up question
- If asked something unknown, admit it and ask what they'd like to explore instead`;

    // Strip frontend system prompt; backend builds its own. Keep only user/assistant history.
    const historyMessages = messages.filter(m => m.role !== 'system').slice(-4);
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...historyMessages
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
        max_tokens: 300,
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
