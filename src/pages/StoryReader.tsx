import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useStories } from "@/hooks/useStories";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Volume2,
  VolumeX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNarration } from "@/hooks/useNarration";
import { NarrationControls } from "@/components/NarrationControls";

const StoryReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stories, toggleFavorite, setFeedback, addStory, loading } = useStories();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const fontSizeClasses = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl'
  };

  const story = stories.find(s => s.id === id);
  const paragraphs = story?.content.split('\n\n') || [];

  const handleParagraphChange = useCallback((index: number) => {
    paragraphRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, []);

  const narration = useNarration({
    paragraphs,
    onParagraphChange: handleParagraphChange,
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!story) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              História não encontrada
            </h2>
            <Button onClick={() => navigate('/')}>
              Voltar ao início
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleToggleFavorite = () => {
    toggleFavorite(story.id);
    toast({
      title: story.isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      description: story.isFavorite 
        ? "A história foi removida dos seus favoritos" 
        : "A história foi salva nos seus favoritos",
    });
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(story.id, type);
    toast({
      title: type === 'like' ? "Obrigado!" : "Entendido",
      description: type === 'like' 
        ? "Fico feliz que tenha gostado!" 
        : "Vamos melhorar nas próximas histórias",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: `Confira esta história: ${story.title}`,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      toast({
        title: "Compartilhar",
        description: "Recurso de compartilhamento não disponível neste navegador",
      });
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-story', {
        body: { 
          ageRange: story.ageRange || '5-6',
          duration: story.duration
        }
      });

      if (error) throw error;

      const newStory = await addStory({
        title: data.title,
        content: data.content,
        duration: story.duration,
        ageRange: story.ageRange,
        theme: story.theme,
        characterName: story.characterName,
      });

      if (newStory) {
        navigate(`/story/${newStory.id}`);
      }
      
      toast({
        title: "Nova história gerada!",
        description: "Aproveite sua nova história",
      });
    } catch (error: any) {
      console.error('Error regenerating story:', error);
      toast({
        title: "Erro ao gerar nova história",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const readingTime = Math.ceil(story.content.split(' ').length / 200);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-border rounded-md p-1">
                <Button
                  variant={fontSize === 'small' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setFontSize('small')}
                >
                  A
                </Button>
                <Button
                  variant={fontSize === 'medium' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-sm"
                  onClick={() => setFontSize('medium')}
                >
                  A
                </Button>
                <Button
                  variant={fontSize === 'large' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-base"
                  onClick={() => setFontSize('large')}
                >
                  A
                </Button>
              </div>
              {narration.isSupported && (
                <Button
                  variant={narration.isPlaying ? "default" : "ghost"}
                  size="icon"
                  onClick={() => narration.isPlaying ? narration.stop() : narration.play()}
                  title={narration.isPlaying ? "Parar narração" : "Narrar história"}
                >
                  {narration.isPlaying ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                <RefreshCw className={cn("w-5 h-5", isRegenerating && "animate-spin")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <article className={cn("px-6 py-8 max-w-2xl mx-auto space-y-6", narration.isPlaying && "pb-40")}>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-foreground leading-tight">
              {story.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              Tempo de leitura: ~{readingTime} minuto{readingTime !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            {paragraphs.map((paragraph, index) => (
              <p 
                key={index} 
                ref={(el) => (paragraphRefs.current[index] = el)}
                className={cn(
                  "text-foreground leading-relaxed mb-4 transition-all duration-300 rounded-lg px-2 -mx-2",
                  fontSizeClasses[fontSize],
                  narration.isPlaying && narration.currentParagraph === index && "bg-primary/10 py-2"
                )}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-6 space-y-4 border-t border-border">
            <Button
              onClick={handleToggleFavorite}
              variant={story.isFavorite ? "default" : "outline"}
              className="w-full"
            >
              <Heart className={cn("w-5 h-5 mr-2", story.isFavorite && "fill-current")} />
              {story.isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
            </Button>

            <div className="flex gap-3">
              <Button
                onClick={() => handleFeedback('like')}
                variant={story.feedback === 'like' ? "default" : "outline"}
                className="flex-1"
              >
                <ThumbsUp className={cn("w-5 h-5 mr-2", story.feedback === 'like' && "fill-current")} />
                Gostei
              </Button>
              <Button
                onClick={() => handleFeedback('dislike')}
                variant={story.feedback === 'dislike' ? "default" : "outline"}
                className="flex-1"
              >
                <ThumbsDown className={cn("w-5 h-5 mr-2", story.feedback === 'dislike' && "fill-current")} />
                Não gostei
              </Button>
            </div>
          </div>
        </article>

        {/* Narration Controls */}
        {narration.isPlaying && (
          <NarrationControls
            isPlaying={narration.isPlaying}
            isPaused={narration.isPaused}
            currentParagraph={narration.currentParagraph}
            totalParagraphs={paragraphs.length}
            speed={narration.speed}
            voiceGender={narration.voiceGender}
            onPlay={narration.play}
            onPause={narration.pause}
            onResume={narration.resume}
            onStop={narration.stop}
            onSpeedChange={narration.setSpeed}
            onVoiceGenderChange={narration.setVoiceGender}
            onNext={narration.goToNext}
            onPrevious={narration.goToPrevious}
            onGoToParagraph={narration.goToParagraph}
          />
        )}
      </div>
    </Layout>
  );
};

export default StoryReader;
