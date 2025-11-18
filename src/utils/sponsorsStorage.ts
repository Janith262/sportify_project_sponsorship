export type SponsorTier = "Platinum" | "Gold" | "Silver" | "Other";

export interface Sponsor {
  id: string;
  company: string;
  tier: SponsorTier;
  amountLKR: number;
  dateSince: string; // ISO
  website?: string;
}

const STORAGE_KEY = "sportify_sponsors";

import seedData from "@/data/sponsors.json";

export function seedSponsorsIfEmpty() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  }
}

export function getSponsors(): Sponsor[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed: Sponsor[] = raw ? JSON.parse(raw) : [];
  return parsed.sort((a, b) => new Date(b.dateSince).getTime() - new Date(a.dateSince).getTime());
}

export function saveSponsors(list: Sponsor[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addSponsor(entry: Omit<Sponsor, "id" | "dateSince"> & { dateSince?: string }) {
  const list = getSponsors();
  const newItem: Sponsor = {
    id: crypto.randomUUID(),
    dateSince: entry.dateSince ?? new Date().toISOString(),
    ...entry,
  };
  list.unshift(newItem);
  saveSponsors(list);
  return newItem;
}
