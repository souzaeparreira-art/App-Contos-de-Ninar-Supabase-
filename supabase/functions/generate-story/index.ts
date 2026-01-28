import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ageRange = '5-6', duration = 5, theme, characterName, character, scenario, customCharacter, customScenario } = await req.json();

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Ajustar o prompt baseado na faixa etária
    const ageGuidelines: Record<string, string> = {
      '2-4': 'frases muito simples, vocabulário básico, repetição de sons, personagens animais fofinhos',
      '5-6': 'frases curtas e claras, vocabulário ampliado, pequenas aventuras, valores como amizade',
      '7-8': 'frases mais elaboradas, vocabulário rico, histórias com começo, meio e fim bem definidos',
    };

    const ageGuide = ageGuidelines[ageRange as keyof typeof ageGuidelines] || ageGuidelines['5-6'];
    const themeText = theme ? `com o tema "${theme}"` : '';
    const characterText = characterName ? `O personagem principal deve se chamar ${characterName}.` : '';

    const characterMap: Record<string, string> = {
      'urso': 'um urso adorável e carinhoso',
      'coelho': 'um coelhinho curioso e saltitante',
      'raposa': 'uma raposa esperta e amigável',
      'gatinho': 'um gatinho fofo e brincalhão',
      'dinossauro': 'um dinossauro gentil e protetor',
      'principe': 'um príncipe corajoso e bondoso',
      'princesa': 'uma princesa gentil e aventureira',
    };

    const scenarioMap: Record<string, string> = {
      'floresta': 'em uma floresta mágica cheia de árvores antigas e luzes brilhantes',
      'espaco': 'no espaço sideral, entre planetas coloridos e estrelas cintilantes',
      'oceano': 'no fundo do oceano, entre corais coloridos e peixes amigáveis',
      'castelo': 'em um castelo encantado com torres altas e jardins floridos',
      'fazenda': 'em uma fazendinha acolhedora com animais amigáveis',
      'cidade': 'em uma cidade dos sonhos onde tudo é possível',
    };

    const characterDesc = character === 'outro' && customCharacter
      ? customCharacter
      : (character ? characterMap[character] || 'um personagem especial' : '');
    const scenarioDesc = scenario === 'outro' && customScenario
      ? `em ${customScenario}`
      : (scenario ? scenarioMap[scenario] || 'em um lugar maravilhoso' : '');
    const contextText = characterDesc && scenarioDesc ? `O personagem principal é ${characterDesc} que vive ${scenarioDesc}.` : '';

    const systemPrompt = `Você é um contador de histórias infantis especializado em criar contos para dormir. 
Crie histórias calmas, aconchegantes e com finais felizes que ajudem as crianças a relaxar antes de dormir.
Use linguagem apropriada para a idade, ritmo suave e imagens mentais tranquilizadoras.`;

    const userPrompt = `Crie uma história infantil ${themeText} para crianças de ${ageRange} anos com duração aproximada de ${duration} minutos de leitura.
${characterText}
${contextText}

Diretrizes:
- Use ${ageGuide}
- Tom calmo e acolhedor, perfeito para a hora de dormir
- Final feliz e reconfortante
- Sem sustos ou elementos assustadores
- Aproximadamente ${duration * 180} palavras
- Divida em parágrafos curtos para facilitar a leitura

Formato de resposta:
Retorne APENAS um JSON no formato:
{
  "title": "Título da História",
  "content": "Conteúdo da história dividido em parágrafos. Use \\n\\n para separar parágrafos."
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error('Failed to generate story');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    // Tentar extrair JSON da resposta
    let storyData;
    try {
      // Remover markdown code blocks se presentes
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      storyData = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse JSON, using fallback format');
      // Fallback: tentar extrair título e conteúdo do texto
      const lines = content.split('\n').filter((l: string) => l.trim());
      storyData = {
        title: lines[0]?.replace(/^#+\s*/, '') || 'História Especial',
        content: lines.slice(1).join('\n\n'),
      };
    }

    return new Response(
      JSON.stringify(storyData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error in generate-story function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to generate story'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
