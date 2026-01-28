import { useState, useEffect, useCallback, useRef } from 'react';

export type VoiceGender = 'male' | 'female';

interface UseNarrationProps {
  paragraphs: string[];
  onParagraphChange?: (index: number) => void;
}

interface UseNarrationReturn {
  isPlaying: boolean;
  isPaused: boolean;
  currentParagraph: number;
  speed: number;
  voiceGender: VoiceGender;
  isSupported: boolean;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setSpeed: (speed: number) => void;
  setVoiceGender: (gender: VoiceGender) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToParagraph: (index: number) => void;
}

export const useNarration = ({ paragraphs, onParagraphChange }: UseNarrationProps): UseNarrationReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [speed, setSpeedState] = useState(0.9);
  const [voiceGender, setVoiceGenderState] = useState<VoiceGender>('female');
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentParagraphRef = useRef(currentParagraph);
  const speedRef = useRef(speed);
  const voiceGenderRef = useRef(voiceGender);

  useEffect(() => {
    currentParagraphRef.current = currentParagraph;
  }, [currentParagraph]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    voiceGenderRef.current = voiceGender;
  }, [voiceGender]);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  useEffect(() => {
    onParagraphChange?.(currentParagraph);
  }, [currentParagraph, onParagraphChange]);

  // Load voices
  useEffect(() => {
    if (!isSupported) return;
    
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  const getVoiceByGender = useCallback((gender: VoiceGender): SpeechSynthesisVoice | null => {
    const ptVoices = voices.filter(v => v.lang.startsWith('pt'));
    
    if (ptVoices.length === 0) {
      return voices[0] || null;
    }

    // Try to find a voice matching the gender
    // Common patterns: female voices often have names like "Maria", "Ana", "Luciana", "Francisca"
    // Male voices often have names like "Daniel", "Ricardo", "António"
    const femaleKeywords = ['maria', 'ana', 'luciana', 'francisca', 'female', 'feminino', 'mulher'];
    const maleKeywords = ['daniel', 'ricardo', 'antonio', 'male', 'masculino', 'homem'];
    
    const keywords = gender === 'female' ? femaleKeywords : maleKeywords;
    
    const matchedVoice = ptVoices.find(v => 
      keywords.some(keyword => v.name.toLowerCase().includes(keyword))
    );

    if (matchedVoice) {
      return matchedVoice;
    }

    // Fallback: try to use voice index (usually first is female in pt-BR)
    if (gender === 'female' && ptVoices.length > 0) {
      return ptVoices[0];
    }
    if (gender === 'male' && ptVoices.length > 1) {
      return ptVoices[1];
    }

    return ptVoices[0] || voices[0] || null;
  }, [voices]);

  const speakParagraph = useCallback((index: number) => {
    if (!isSupported || index >= paragraphs.length) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(paragraphs[index]);
    utterance.lang = 'pt-BR';
    utterance.rate = speedRef.current;
    utterance.pitch = voiceGenderRef.current === 'female' ? 1.1 : 0.9;

    const selectedVoice = getVoiceByGender(voiceGenderRef.current);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      const nextIndex = currentParagraphRef.current + 1;
      if (nextIndex < paragraphs.length) {
        setCurrentParagraph(nextIndex);
        speakParagraph(nextIndex);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentParagraph(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, paragraphs, getVoiceByGender]);

  const play = useCallback(() => {
    if (!isSupported) return;
    setIsPlaying(true);
    setIsPaused(false);
    speakParagraph(currentParagraph);
  }, [isSupported, currentParagraph, speakParagraph]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraph(0);
  }, [isSupported]);

  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(newSpeed);
  }, []);

  const setVoiceGender = useCallback((gender: VoiceGender) => {
    setVoiceGenderState(gender);
  }, []);

  const goToNext = useCallback(() => {
    if (currentParagraph < paragraphs.length - 1) {
      const nextIndex = currentParagraph + 1;
      setCurrentParagraph(nextIndex);
      if (isPlaying) {
        speakParagraph(nextIndex);
      }
    }
  }, [currentParagraph, paragraphs.length, isPlaying, speakParagraph]);

  const goToPrevious = useCallback(() => {
    if (currentParagraph > 0) {
      const prevIndex = currentParagraph - 1;
      setCurrentParagraph(prevIndex);
      if (isPlaying) {
        speakParagraph(prevIndex);
      }
    }
  }, [currentParagraph, isPlaying, speakParagraph]);

  const goToParagraph = useCallback((index: number) => {
    if (index >= 0 && index < paragraphs.length) {
      setCurrentParagraph(index);
      if (isPlaying) {
        speakParagraph(index);
      }
    }
  }, [paragraphs.length, isPlaying, speakParagraph]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  return {
    isPlaying,
    isPaused,
    currentParagraph,
    speed,
    voiceGender,
    isSupported,
    play,
    pause,
    resume,
    stop,
    setSpeed,
    setVoiceGender,
    goToNext,
    goToPrevious,
    goToParagraph,
  };
};
