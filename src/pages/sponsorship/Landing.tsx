import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Heart, Trophy, Users, Globe, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSponsors, seedSponsorsIfEmpty, type Sponsor } from "@/utils/sponsorsStorage";
import SponsorsGrid from "@/components/SponsorsGrid";
import { SEO } from "@/components/SEO";

function DottedIllustration() {
  return (
    <div className="relative w-full aspect-square max-w-[420px] mx-auto text-primary/40">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <g fill="none" stroke="currentColor" strokeDasharray="2 10">
          <circle cx="200" cy="200" r="180" />
          <circle cx="200" cy="200" r="140" />
          <circle cx="200" cy="200" r="100" />
        </g>
      </svg>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card shadow-sm rounded-full p-3 border">
          <Trophy className="text-primary" />
        </div>
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-card shadow-sm rounded-full p-3 border">
          <Users className="text-primary" />
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-card shadow-sm rounded-full p-3 border">
          <Megaphone className="text-primary" />
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card shadow-sm rounded-full p-3 border">
          <Globe className="text-primary" />
        </div>
      </div>
    </div>
  );
}

export default function SponsorshipLanding() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    seedSponsorsIfEmpty();
    setSponsors(getSponsors());
  }, []);

  return (
    <AppLayout>
      <SEO
        title="Sponsorship | Sportify"
        description="Become a Sponsor of Sportify. Increase brand visibility, reach a global audience, and unlock networking opportunities."
        canonical={window.location.origin + "/sponsorship"}
      />
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          <DottedIllustration />
        </div>
        <div className="order-1 md:order-2">
          <h1 className="text-4xl font-bold leading-tight text-foreground">
            Become a Sponsor
          </h1>
          <p className="mt-3 text-muted-foreground max-w-prose">
            Partner with Sportify to support athletes and gain premium exposure across our platforms and events.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              { text: "Increased brand visibility" },
              { text: "Exposure to a global audience" },
              { text: "Networking opportunities" },
            ].map((b) => (
              <li key={b.text} className="flex items-center gap-3">
                <CheckCircle2 className="text-primary" />
                <span className="text-foreground/90">{b.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex items-center gap-4">
            <Button asChild className="rounded-full px-6 py-6 text-base">
              <Link to="/sponsorship/packages">Sponsorship Packages</Link>
            </Button>
            <Link to="#sponsors" className="text-sm text-primary hover:underline">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <section id="sponsors" className="mt-12">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Our Sponsors</h2>
            <div className="hidden md:flex items-center gap-2 text-destructive">
              <Heart className="size-4" />
              <span className="text-sm">We appreciate your support</span>
            </div>
          </div>
          <SponsorsGrid sponsors={sponsors} />
        </div>
      </section>
    </AppLayout>
  );
}
