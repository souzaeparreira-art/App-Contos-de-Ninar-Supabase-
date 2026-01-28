import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Volume2
} from "lucide-react";
import { VoiceGender } from "@/hooks/useNarration";
import { cn } from "@/lib/utils";

interface NarrationControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentParagraph: number;
  totalParagraphs: number;
  speed: number;
  voiceGender: VoiceGender;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  onVoiceGenderChange: (gender: VoiceGender) => void;
  onNext: () => void;
  onPrevious: () => void;
  onGoToParagraph: (index: number) => void;
}

export const NarrationControls = ({
  isPlaying,
  isPaused,
  currentParagraph,
  totalParagraphs,
  speed,
  voiceGender,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSpeedChange,
  onVoiceGenderChange,
  onNext,
  onPrevious,
  onGoToParagraph,
}: NarrationControlsProps) => {
  const handlePlayPause = () => {
    if (!isPlaying) {
      onPlay();
    } else if (isPaused) {
      onResume();
    } else {
      onPause();
    }
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4">
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl shadow-lg p-4 space-y-3">
        {/* Voice selection and progress */}
        <div className="flex items-center justify-between">
          {/* Voice Gender Selection */}
          <div className="flex items-center gap-1 bg-muted rounded-full p-1">
            <button
              onClick={() => onVoiceGenderChange('female')}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all",
                voiceGender === 'female' 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-background/50"
              )}
              title="Voz feminina"
            >
              👧
            </button>
            <button
              onClick={() => onVoiceGenderChange('male')}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all",
                voiceGender === 'male' 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-background/50"
              )}
              title="Voz masculina"
            >
              👦
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Volume2 className="w-4 h-4" />
            <span>
              {currentParagraph + 1} / {totalParagraphs}
            </span>
          </div>
        </div>

        {/* Paragraph navigation dots */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap py-1">
          {Array.from({ length: totalParagraphs }).map((_, index) => (
            <button
              key={index}
              onClick={() => onGoToParagraph(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                currentParagraph === index 
                  ? "bg-primary scale-125" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              title={`Ir para parágrafo ${index + 1}`}
            />
          ))}
        </div>

        {/* Main controls */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={currentParagraph === 0}
            className="h-10 w-10"
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            className="h-12 w-12 rounded-full"
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={currentParagraph >= totalParagraphs - 1}
            className="h-10 w-10"
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onStop}
            className="h-10 w-10"
          >
            <Square className="w-5 h-5" />
          </Button>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-3 px-2">
          <span className="text-xs text-muted-foreground w-8">🐢</span>
          <Slider
            value={[speed]}
            onValueChange={([value]) => onSpeedChange(value)}
            min={0.5}
            max={1.5}
            step={0.1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-8">🐇</span>
          <span className="text-xs text-muted-foreground w-12 text-right">
            {speed.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
};
