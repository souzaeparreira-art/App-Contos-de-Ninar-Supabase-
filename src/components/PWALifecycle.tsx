import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWALifecycle = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleRefresh = () => {
    updateServiceWorker(true);
  };

  const dismissInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const dismissRefresh = () => {
    setNeedRefresh(false);
  };

  // Don't show install prompt if dismissed before
  const wasDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';

  if (isInstalled && !needRefresh) return null;

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && !wasDismissed && !isInstalled && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
          <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  Instalar Conto de Ninar
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione à tela inicial para acesso rápido e uso offline
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleInstall} className="gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    Instalar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={dismissInstall}>
                    Agora não
                  </Button>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="flex-shrink-0 h-6 w-6"
                onClick={dismissInstall}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Available Prompt */}
      {needRefresh && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
          <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">
                  Atualização disponível
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Uma nova versão do app está pronta
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleRefresh} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Atualizar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={dismissRefresh}>
                    Depois
                  </Button>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="flex-shrink-0 h-6 w-6"
                onClick={dismissRefresh}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
