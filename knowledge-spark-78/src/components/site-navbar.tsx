import { Link } from "@tanstack/react-router";
import { Factory, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const links = [
  { to: "/", label: "Home" },
  { to: "/upload", label: "Upload" },
  { to: "/chat", label: "Chat" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/equipment", label: "Equipment" },
] as const;

export function SiteNavbar() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-soft)] transition-transform group-hover:scale-105">
            <Factory className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">Industrial Knowledge</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Intelligence</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-primary bg-accent" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Avatar className="h-9 w-9 border">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">IK</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
