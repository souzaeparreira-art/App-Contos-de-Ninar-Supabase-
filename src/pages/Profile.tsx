import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Moon, Settings, Camera, Pencil, Check, X, 
  RefreshCw, Info, FileText, Shield, Sparkles, LogOut, ChevronRight
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import sonoTranquiloBanner from "@/assets/sono-tranquilo-banner.png";
import historiasEspeciaisBanner from "@/assets/historias-especiais-banner.png";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, loading, updating, updateName, uploadAvatar } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [checkingUpdates, setCheckingUpdates] = useState(false);

  const [nightMode, setNightMode] = useState(() => {
    const saved = localStorage.getItem('nightMode');
    return saved === 'true';
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const isFirstRender = useRef(true);

  // Only apply theme changes when user explicitly toggles, not on mount
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (nightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [nightMode]);

  useEffect(() => {
    if (profile?.full_name) {
      setEditedName(profile.full_name);
    }
  }, [profile?.full_name]);

  const handleNightModeToggle = (checked: boolean) => {
    setNightMode(checked);
    localStorage.setItem('nightMode', String(checked));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  const handleSaveName = async () => {
    if (editedName.trim()) {
      await updateName(editedName.trim());
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(profile?.full_name || "");
    setIsEditingName(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleCheckForUpdates = async () => {
    setCheckingUpdates(true);
    toast({
      title: "Verificando atualizações...",
      description: "Buscando a versão mais recente do app.",
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    window.location.reload();
  };

  return (
    <Layout>
      <div className="px-6 py-8 space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Perfil
          </h1>
          <p className="text-muted-foreground">
            Configure suas preferências
          </p>
        </div>

        {/* User Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-16 h-16 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md"
                disabled={updating}
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-9"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSaveName} disabled={updating}>
                    <Check className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg text-foreground">
                    {profile?.full_name || "Usuário"}
                  </h2>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditingName(true)}>
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>
        </Card>

        {/* Preferences Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Preferências</h3>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <div>
                <Label htmlFor="night-mode" className="text-foreground font-medium cursor-pointer">
                  Modo Noturno
                </Label>
                <p className="text-sm text-muted-foreground">
                  Otimizado para leitura antes de dormir
                </p>
              </div>
            </div>
            <Switch
              id="night-mode"
              checked={nightMode}
              onCheckedChange={handleNightModeToggle}
            />
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 py-3 w-full text-left text-destructive hover:bg-destructive/10 rounded-md px-2 -mx-2 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair da conta</span>
          </button>
        </Card>

        {/* About App Card */}
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Sobre o App</h3>
          </div>

          <button 
            onClick={handleCheckForUpdates}
            disabled={checkingUpdates}
            className="flex items-center justify-between py-3 w-full text-left hover:bg-accent/50 rounded-md px-2 -mx-2 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-5 h-5 text-muted-foreground ${checkingUpdates ? 'animate-spin' : ''}`} />
              <span className="text-foreground">
                {checkingUpdates ? "Verificando..." : "Verificar Atualizações"}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-center justify-between py-3 px-2 -mx-2">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Versão</span>
            </div>
            <span className="text-muted-foreground">1.0.0</span>
          </div>

          <button className="flex items-center justify-between py-3 w-full text-left hover:bg-accent/50 rounded-md px-2 -mx-2 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Termos de Uso</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button className="flex items-center justify-between py-3 w-full text-left hover:bg-accent/50 rounded-md px-2 -mx-2 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Política de Privacidade</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </Card>

        {/* News Card with Carousel */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Novidades</h3>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              <CarouselItem className="basis-[85%] md:basis-1/2">
                <Card className="overflow-hidden">
                  <img 
                    src={sonoTranquiloBanner} 
                    alt="Sono Tranquilo em 21 Dias" 
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4 space-y-3">
                    <h4 className="font-semibold text-foreground text-sm">
                      Sono Tranquilo em 21 Dias
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Guia completo para estabelecer uma rotina de sono saudável.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-muted-foreground line-through">R$ 47,00</span>
                        <span className="text-lg font-bold text-primary">R$ 9,90</span>
                      </div>
                      <a 
                        href="https://pay.cakto.com.br/nhz2k53_676539" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" className="gap-1">
                          Quero <ChevronRight className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
              <CarouselItem className="basis-[85%] md:basis-1/2">
                <Card className="overflow-hidden">
                  <img 
                    src={historiasEspeciaisBanner} 
                    alt="Histórias para Dias Especiais" 
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4 space-y-3">
                    <h4 className="font-semibold text-foreground text-sm">
                      Histórias para Dias Especiais
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Coleção de histórias temáticas para momentos únicos.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-muted-foreground line-through">R$ 47,00</span>
                        <span className="text-lg font-bold text-primary">R$ 9,90</span>
                      </div>
                      <a 
                        href="https://pay.cakto.com.br/8np6v25_676540" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" className="gap-1">
                          Quero <ChevronRight className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </Carousel>
        </Card>

        <div className="text-center pt-4 pb-20">
          <p className="text-sm text-muted-foreground">
            Conto de Ninar v1.0
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
