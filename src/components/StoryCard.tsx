import { Story } from "@/hooks/useStories";
import { Card } from "./ui/card";
import { BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

export const StoryCard = ({ story, onClick }: StoryCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
        "bg-card border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif font-semibold text-lg text-foreground mb-1 truncate">
            {story.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{story.duration} min</span>
            {story.theme && (
              <>
                <span>•</span>
                <span className="truncate">{story.theme}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
