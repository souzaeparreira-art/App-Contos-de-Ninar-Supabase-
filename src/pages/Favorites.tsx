import { Layout } from "@/components/Layout";
import { StoryCard } from "@/components/StoryCard";
import { useStories } from "@/hooks/useStories";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const Favorites = () => {
  const { favorites, loading } = useStories();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (favorites.length === 0) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-6 py-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-2">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Nenhum favorito ainda
            </h2>
            <p className="text-muted-foreground">
              Marque suas histórias preferidas como favoritas para encontrá-las facilmente
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-8 space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Favoritos
          </h1>
          <p className="text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? 'história favorita' : 'histórias favoritas'}
          </p>
        </div>

        <div className="space-y-3">
          {favorites.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onClick={() => navigate(`/story/${story.id}`)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Favorites;
