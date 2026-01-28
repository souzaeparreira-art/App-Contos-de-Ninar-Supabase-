import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sparkles, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useStories } from "@/hooks/useStories";

const characters = [
  { id: 'urso', label: 'Urso', emoji: '🐻' },
  { id: 'coelho', label: 'Coelho', emoji: '🐰' },
  { id: 'raposa', label: 'Raposa', emoji: '🦊' },
  { id: 'gatinho', label: 'Gatinho', emoji: '🐱' },
  { id: 'dinossauro', label: 'Dinossauro', emoji: '🦕' },
  { id: 'principe', label: 'Príncipe', emoji: '🤴' },
  { id: 'princesa', label: 'Princesa', emoji: '👸' },
  { id: 'outro', label: 'Outro', emoji: '✏️' },
];

const scenarios = [
  { id: 'floresta', label: 'Floresta Mágica', emoji: '🌲' },
  { id: 'espaco', label: 'Espaço Sideral', emoji: '🚀' },
  { id: 'oceano', label: 'Fundo do Oceano', emoji: '🌊' },
  { id: 'castelo', label: 'Castelo Encantado', emoji: '🏰' },
  { id: 'fazenda', label: 'Fazendinha', emoji: '🌾' },
  { id: 'cidade', label: 'Cidade dos Sonhos', emoji: '🌆' },
  { id: 'outro', label: 'Outro', emoji: '✏️' },
];

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addStory } = useStories();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('urso');
  const [selectedScenario, setSelectedScenario] = useState('floresta');
  const [customCharacter, setCustomCharacter] = useState('');
  const [customScenario, setCustomScenario] = useState('');

  const generateStory = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      toast({
        title: "Erro de configuração",
        description: "A chave VITE_OPENAI_API_KEY não foi encontrada na Vercel.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const charName = selectedCharacter === 'outro' ? customCharacter : selectedCharacter;
      const scenarioName = selectedScenario === 'outro' ? customScenario : selectedScenario;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um contador de histórias infantis calmas para dormir em português. Retorne APENAS um JSON: {"title": "Título", "content": "Texto da história"}'
            },
            {
              role: 'user',
              content: `Crie uma história para crianças de 5 anos sobre ${charName} em ${scenarioName}. No máximo 5 parágrafos.`
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error('Falha na resposta da OpenAI');

      const aiResult = await response.json();
      const storyData = JSON.parse(aiResult.choices[0].message.content);

      const newStory = await addStory({
        title: storyData.title,
        content: storyData.content,
        duration: 5,
        ageRange: '5-6',
        theme: scenarioName,
        characterName: charName,
      });

      if (newStory) {
        navigate(`/story/${newStory.id}`);
      }
    } catch (error: any) {
      console.error('Error generating story:', error);
      toast({
        title: "Erro ao gerar história",
        description: "Verifique sua chave da OpenAI e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Moon className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground leading-tight">
              Conto de Ninar
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Escolha o personagem e o cenário para sua história
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Escolha o Personagem</Label>
              <div className="grid grid-cols-2 gap-3">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setSelectedCharacter(char.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${selectedCharacter === char.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                      }`}
                  >
                    <span className="text-2xl">{char.emoji}</span>
                    <span className="font-medium text-foreground">{char.label}</span>
                  </button>
                ))}
              </div>
              {selectedCharacter === 'outro' && (
                <Input
                  placeholder="Digite o personagem..."
                  value={customCharacter}
                  onChange={(e) => setCustomCharacter(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Escolha o Cenário</Label>
              <div className="grid grid-cols-2 gap-3">
                {scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setSelectedScenario(scenario.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${selectedScenario === scenario.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                      }`}
                  >
                    <span className="text-2xl">{scenario.emoji}</span>
                    <span className="font-medium text-foreground">{scenario.label}</span>
                  </button>
                ))}
              </div>
              {selectedScenario === 'outro' && (
                <Input
                  placeholder="Digite o cenário..."
                  value={customScenario}
                  onChange={(e) => setCustomScenario(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={generateStory}
              disabled={isGenerating}
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Criando sua história...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar História
                </>
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center pt-4">
            Histórias personalizadas para crianças de 2 a 8 anos
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
