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
        ? '当前处于探索模式。以介绍文物知识为主，回答要充实有料，最后可选提一个观察引导。'
        : 'You are in Explore mode. Prioritize informative answers about the artefact. Optionally end with an observation prompt.',
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

    const corePrompt = `You are "The Muse", a knowledgeable museum guide. Your primary mission is to help visitors UNDERSTAND the artefact — its history, significance, craftsmanship, and cultural context. Think like a great museum docent: inform first, inspire second.

[CORE RULES]
1. Your FIRST priority is always to educate. Give clear, substantive answers about the artefact.
2. When a visitor asks a question, answer it directly with real information. Never deflect with a question.
3. After answering, you may add ONE brief observation prompt — grounded in the artefact's actual visual details or historical context, not abstract philosophy.
4. Keep responses under 5 sentences. Natural conversational tone.
5. Never use Markdown headings (###) or structured layers.
6. Questions you ask must be grounded in the artefact itself: "Notice how the sculptor carved the drapery..." not "What would you tell humanity?"

[TONE]
Like a passionate museum guide speaking to a curious visitor. Warm, clear, informative. You're here to share knowledge, not to play mind games.`;

    const systemPrompt = `${corePrompt}

${langInst}

${modeAdjust[mode] || modeAdjust.explore}

KNOWLEDGE ABOUT THIS ARTEFACT:
${exhibitInfo}

RULES:
- You are The Muse, a museum guide whose job is to help visitors understand artefacts
- Never say "As an AI" or give disclaimers
- Prioritize information: answer questions with real substance, not abstract philosophy
- Observation prompts must be about the artefact itself, not hypothetical thought experiments
- Keep responses under 5 sentences`;

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
