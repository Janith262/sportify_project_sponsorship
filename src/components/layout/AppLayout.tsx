import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const nav = [
    { label: "Home", to: "/" },
    { label: "Sponsorship", to: "/sponsorship" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-semibold tracking-tight text-lg">Sportify</Link>
            <nav className="hidden md:flex items-center gap-4">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-2 py-1 rounded-md transition-colors",
                    location.pathname.startsWith(n.to)
                      ? "bg-secondary text-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="hidden md:block w-[340px]">
              <Input placeholder="Search..." aria-label="Search" />
            </div>
            <Button className="rounded-full" aria-label="Create Post">Create Post</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex gap-6 px-4 py-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="rounded-lg border bg-card shadow-sm p-4">
            <div className="text-sm font-semibold mb-3">Navigation</div>
            <div className="flex flex-col gap-2">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm transition-colors",
                    location.pathname.startsWith(n.to)
                      ? "bg-secondary"
                      : "hover:bg-accent"
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
