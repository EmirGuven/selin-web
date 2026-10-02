export type HomepageServiceIconId =
  | "brain"
  | "heart"
  | "family"
  | "video"
  | "chat"
  | "shield"
  | "sun"
  | "compass"
  | "leaf"

export type HomepageServiceItem = {
  slug: string
  title: string
  description: string
  icon: HomepageServiceIconId
}

export const homepageServiceIconOptions: Array<{ value: HomepageServiceIconId; label: string }> = [
  { value: "brain", label: "Zihin / Bireysel Terapi" },
  { value: "heart", label: "Kalp / Çift Terapisi" },
  { value: "family", label: "Aile" },
  { value: "video", label: "Video / Online Terapi" },
  { value: "chat", label: "Konuşma / Danışmanlık" },
  { value: "shield", label: "Güven / Güvenlik" },
  { value: "sun", label: "Güneş / İyi Oluş" },
  { value: "compass", label: "Pusula / Yönelim" },
  { value: "leaf", label: "Yaprak / Denge" },
]

export const homepageServiceIconSvgMap: Record<HomepageServiceIconId, string> = {
  brain: '<path d="M9.5 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5h.5a3 3 0 0 0 3-3V7a3 3 0 0 0-.5-3Z"/><path d="M14.5 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5h-.5a3 3 0 0 1-3-3V7a3 3 0 0 1 .5-3Z"/>',
  heart: '<path d="M12 21s-7.5-4.6-10-9.3C.5 8.3 2.3 5 5.6 5c1.9 0 3.4 1 4.4 2.5C11 6 12.5 5 14.4 5 17.7 5 19.5 8.3 22 11.7 19.5 16.4 12 21 12 21Z"/>',
  family: '<circle cx="8" cy="7" r="2.5"/><circle cx="16" cy="7" r="2.5"/><path d="M3 20v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"/><path d="M13 20v-1.5a3.5 3.5 0 0 1 3.5-3.5h1a3.5 3.5 0 0 1 3.5 3.5V20"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3"/>',
  chat: '<path d="M4 4h16v11H9l-5 4V4Z"/><path d="M8 9h8"/><path d="M8 12h5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M4.2 4.2l2.1 2.1"/><path d="m17.7 17.7 2.1 2.1"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="M4.2 19.8l2.1-2.1"/><path d="m17.7 6.3 2.1-2.1"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m14.5 9.5-2 5-5 2 2-5 5-2Z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-6 7-11 15-11 0 8-5 15-11 15-1.5 0-3-.3-4-.9"/><path d="M4 20c6-1 10-5 11-11"/>',
}

export function resolveHomepageServiceIcon(icon?: string, slug?: string): HomepageServiceIconId {
  const candidate = String(icon || "").trim() as HomepageServiceIconId
  if (candidate && homepageServiceIconSvgMap[candidate]) return candidate
  return getDefaultHomepageServiceIcon(slug)
}

export function getDefaultHomepageServiceIcon(slug?: string): HomepageServiceIconId {
  switch (slug) {
    case "bireysel-terapi":
      return "brain"
    case "cift-terapisi":
      return "heart"
    case "aile-terapisi":
      return "family"
    case "online-terapi":
      return "video"
    case "ergen-terapisi":
      return "chat"
    case "bilissel-davranisci-terapi":
      return "compass"
    case "psikodinamik-terapi":
      return "leaf"
    default:
      return "brain"
  }
}

export function normalizeHomepageServiceItems(val: any): HomepageServiceItem[] {
  let items = val
  if (typeof items === "string") {
    try {
      items = JSON.parse(items)
    } catch {
      items = []
    }
  }
  items = Array.isArray(items) ? items : []

  return items
    .map((item: any) => ({
      slug: String(item?.slug || ""),
      title: String(item?.title || ""),
      description: String(item?.description || ""),
      icon: resolveHomepageServiceIcon(item?.icon, item?.slug),
    }))
    .filter((item) => item.slug || item.title)
}
