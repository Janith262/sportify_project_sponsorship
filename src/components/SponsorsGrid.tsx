import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

// The Sponsor type might need adjustment based on your backend's response.
// Let's define it to match the JSON data exactly.
export interface Sponsor {
  id: number;
  companyName: string;
  website?: string;
  contactPersonName: string;
  email: string;
  contactNumber: string;
  sponsorshipTier: "Platinum" | "Gold" | "Silver" | "Other";
  amountLKR: number;
  interestReason?: string;
  companyLetterFilename?: string;
  additionalComments?: string;
  dateSince: string; // This is an ISO string from the backend
}

function TierBadge({ tier }: { tier: Sponsor["sponsorshipTier"] }) {
  const variant = tier === "Platinum" ? "default" : tier === "Gold" ? "secondary" : "outline";
  return <Badge variant={variant as any}>{tier}</Badge>;
}

function LogoCircle({ name }: { name: string }) {
  const letter = name ? name.charAt(0).toUpperCase() : "?";
  return (
    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
      {letter}
    </div>
  );
}

export default function SponsorsGrid({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sponsors.map((s) => (
        <Card key={s.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex-row items-center gap-3">
            <LogoCircle name={s.companyName} />
            <div className="flex-1">
              <CardTitle className="text-base">{s.companyName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <TierBadge tier={s.sponsorshipTier} />
                <span className="text-xs">LKR {s.amountLKR.toLocaleString("en-LK")}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground flex items-center justify-between">
            <div>
              Since {new Date(s.dateSince).toLocaleDateString("en-GB")}
            </div>
            {s.website && (
              <a href={s.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}