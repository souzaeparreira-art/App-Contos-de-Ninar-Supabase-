import { Home, Library, Heart, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Início" },
    { to: "/library", icon: Library, label: "Biblioteca" },
    { to: "/favorites", icon: Heart, label: "Favoritos" },
    { to: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-accent/50"
            activeClassName="text-primary bg-accent"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
