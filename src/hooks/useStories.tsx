import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Story {
  id: string;
  title: string;
  content: string;
  theme?: string;
  ageRange?: string;
  duration: number;
  characterName?: string;
  createdAt: string;
  isFavorite: boolean;
  feedback?: 'like' | 'dislike';
}

export const useStories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [favorites, setFavorites] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    if (!user) {
      setStories([]);
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedStories: Story[] = (data || []).map(s => ({
        id: s.id,
        title: s.title,
        content: s.content,
        theme: s.theme || undefined,
        ageRange: s.age_range || undefined,
        duration: s.duration,
        characterName: s.character_name || undefined,
        createdAt: s.created_at,
        isFavorite: s.is_favorite,
        feedback: s.feedback as 'like' | 'dislike' | undefined,
      }));

      setStories(mappedStories);
      setFavorites(mappedStories.filter(s => s.isFavorite));
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const addStory = async (story: Omit<Story, 'id' | 'createdAt' | 'isFavorite' | 'feedback'>): Promise<Story | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          title: story.title,
          content: story.content,
          theme: story.theme,
          age_range: story.ageRange,
          duration: story.duration,
          character_name: story.characterName,
        })
        .select()
        .single();

      if (error) throw error;

      const newStory: Story = {
        id: data.id,
        title: data.title,
        content: data.content,
        theme: data.theme || undefined,
        ageRange: data.age_range || undefined,
        duration: data.duration,
        characterName: data.character_name || undefined,
        createdAt: data.created_at,
        isFavorite: data.is_favorite,
        feedback: data.feedback as 'like' | 'dislike' | undefined,
      };

      setStories(prev => [newStory, ...prev]);
      return newStory;
    } catch (error) {
      console.error('Error adding story:', error);
      return null;
    }
  };

  const updateStory = async (id: string, updates: Partial<Story>) => {
    if (!user) return;

    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.theme !== undefined) dbUpdates.theme = updates.theme;
      if (updates.ageRange !== undefined) dbUpdates.age_range = updates.ageRange;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.characterName !== undefined) dbUpdates.character_name = updates.characterName;
      if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
      if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;

      const { error } = await supabase
        .from('stories')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setStories(prev => {
        const newStories = prev.map(s => s.id === id ? { ...s, ...updates } : s);
        setFavorites(newStories.filter(s => s.isFavorite));
        return newStories;
      });
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };

  const toggleFavorite = async (id: string) => {
    const story = stories.find(s => s.id === id);
    if (story) {
      await updateStory(id, { isFavorite: !story.isFavorite });
    }
  };

  const setFeedback = async (id: string, feedback: 'like' | 'dislike') => {
    await updateStory(id, { feedback });
  };

  const getStoryById = (id: string): Story | undefined => {
    return stories.find(s => s.id === id);
  };

  return {
    stories,
    favorites,
    loading,
    addStory,
    updateStory,
    toggleFavorite,
    setFeedback,
    getStoryById,
    refetch: fetchStories,
  };
};
