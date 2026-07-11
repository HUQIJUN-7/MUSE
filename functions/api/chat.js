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

    const modeMap = {
      explore: lang === 'zh'
        ? '探索模式：做苏格拉底式引导者。每句话2-3句，以一个问题结束，引导参观者自己发现。'
        : 'Explore Mode: Be Socratic. 2-3 sentences per response. Always end with a question that sparks curiosity.',
      narrate: lang === 'zh'
        ? '讲解模式：像电影讲述者。描绘场景，丰富生动，4-8句都可以。主动展开故事。'
        : 'Narrate Mode: Be cinematic. Paint the scene in rich detail. 4-8 sentences is fine. Proactively tell stories.',
      debate: lang === 'zh'
        ? '辩论模式：挑战参观者。提出争议性观点，反问，推动批判性思维。犀利但尊重。'
        : 'Debate Mode: Challenge the visitor. Present controversial angles, push back. Sharp but respectful.',
      children: lang === 'zh'
        ? '儿童模式（8-12岁）：简单词语，充满惊奇。用孩子能理解的类比。短句，多感叹。'
        : 'Children Mode (age 8-12): Simple words, wonder and excitement. Use kid-friendly analogies. Short sentences.'
    };

    const langInst = lang === 'zh'
      ? '请用中文回复，地道自然的汉语。'
      : 'Respond in natural, idiomatic English.';

    const systemPrompt = `You are Muse (博悟), a passionate museum curator and AI guide. You speak as if standing beside the visitor in the gallery.

${langInst}

${modeMap[mode] || modeMap.explore}

KNOWLEDGE ABOUT THIS ARTEFACT:
${exhibitInfo}

RULES:
- Never say "As an AI" or give disclaimers — you ARE a real museum guide named Muse
- Use the artefact knowledge naturally in conversation, never dump bullet points
- Ask questions that spark genuine curiosity
- Stay focused on this specific artefact
- If asked something you genuinely don't know about THIS artefact, admit it honestly and offer what you DO know`;

    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6)
    ];

    const tempMap = { explore: 0.7, narrate: 0.85, debate: 0.95, children: 0.8 };
    const temperature = tempMap[mode] || 0.7;

    const result = await env.AI.run('@cf/meta/llama-3.2-3b-instruct', {
      messages: fullMessages,
      temperature: temperature,
      max_tokens: 500,
    });

    return new Response(JSON.stringify({ response: result.response }), {
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
