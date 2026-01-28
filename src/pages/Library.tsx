import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { StoryCard } from "@/components/StoryCard";
import { useStories } from "@/hooks/useStories";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Library = () => {
  const { stories, loading } = useStories();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("all");

  // Get unique themes from stories
  const themes = useMemo(() => {
    const uniqueThemes = new Set<string>();
    stories.forEach(story => {
      if (story.theme) uniqueThemes.add(story.theme);
    });
    return Array.from(uniqueThemes);
  }, [stories]);

  // Filter and sort stories
  const filteredStories = useMemo(() => {
    let result = [...stories];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(story => 
        story.title.toLowerCase().includes(query) ||
        story.content.toLowerCase().includes(query)
      );
    }

    // Favorites filter
    if (filterFavorites) {
      result = result.filter(story => story.isFavorite);
    }

    // Theme filter
    if (selectedTheme !== "all") {
      result = result.filter(story => story.theme === selectedTheme);
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [stories, searchQuery, filterFavorites, selectedTheme, sortOrder]);

  const hasActiveFilters = filterFavorites || selectedTheme !== "all" || searchQuery.trim();

  const clearFilters = () => {
    setSearchQuery("");
    setFilterFavorites(false);
    setSelectedTheme("all");
    setSortOrder("recent");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (stories.length === 0) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-6 py-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-2">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Sua biblioteca está vazia
            </h2>
            <p className="text-muted-foreground">
              Gere sua primeira história para começar sua coleção de contos
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
            Biblioteca
          </h1>
          <p className="text-muted-foreground">
            {stories.length} {stories.length === 1 ? 'história' : 'histórias'} geradas
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar histórias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            <Select value={sortOrder} onValueChange={(value: "recent" | "oldest") => setSortOrder(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="oldest">Mais antigas</SelectItem>
              </SelectContent>
            </Select>

            {themes.length > 0 && (
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os temas</SelectItem>
                  {themes.map(theme => (
                    <SelectItem key={theme} value={theme}>
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              variant={filterFavorites ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterFavorites(!filterFavorites)}
              className="h-10"
            >
              <Filter className="w-4 h-4 mr-2" />
              Favoritos
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {searchQuery.trim() && (
                <Badge variant="secondary">
                  Busca: "{searchQuery}"
                </Badge>
              )}
              {filterFavorites && (
                <Badge variant="secondary">Favoritos</Badge>
              )}
              {selectedTheme !== "all" && (
                <Badge variant="secondary">
                  Tema: {selectedTheme}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhuma história encontrada com os filtros selecionados
            </p>
            <Button variant="link" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {filteredStories.length} {filteredStories.length === 1 ? 'resultado' : 'resultados'}
            </p>
            {filteredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onClick={() => navigate(`/story/${story.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Library;
