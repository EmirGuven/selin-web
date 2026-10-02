export interface PageCtaButtons {
  primaryLabel: string
  primaryUrl: string
  secondaryLabel: string
  secondaryUrl: string
}

export const CTA_HIDDEN_VALUE = "__hidden__"

export const homepageCtaDefaults: PageCtaButtons = {
  primaryLabel: "Randevu Alın",
  primaryUrl: "/iletisim",
  secondaryLabel: "Hizmetleri İnceleyin",
  secondaryUrl: "/bireysel-terapi",
}

export const aboutCtaDefaults: PageCtaButtons = {
  primaryLabel: "Randevu Alın",
  primaryUrl: "/iletisim",
  secondaryLabel: "Hizmetleri İnceleyin",
  secondaryUrl: "/bireysel-terapi",
}

export const faqCtaDefaults: PageCtaButtons = {
  primaryLabel: "İletişime Geçin",
  primaryUrl: "/iletisim",
  secondaryLabel: "Randevu Alın",
  secondaryUrl: "/iletisim",
}

export const serviceCtaDefaults: PageCtaButtons = {
  primaryLabel: "Randevu Alın",
  primaryUrl: "/iletisim",
  secondaryLabel: "Hakkımda",
  secondaryUrl: "/hakkimda",
}

export function getContactCtaDefaults(email = "", phone = ""): PageCtaButtons {
  return {
    primaryLabel: "E-posta Gönder",
    primaryUrl: email ? `mailto:${email}` : "",
    secondaryLabel: "Telefon Et",
    secondaryUrl: phone ? `tel:${phone}` : "",
  }
}

export function resolvePageCtaButtons(
  value: Partial<PageCtaButtons> | null | undefined,
  defaults: PageCtaButtons,
): PageCtaButtons {
  const primaryLabel = String(value?.primaryLabel || defaults.primaryLabel || "").trim()
  const primaryUrl = String(value?.primaryUrl || defaults.primaryUrl || "").trim()
  const secondaryLabelValue = String(value?.secondaryLabel || "").trim()
  const secondaryUrlValue = String(value?.secondaryUrl || "").trim()
  const secondaryHidden = secondaryLabelValue === CTA_HIDDEN_VALUE

  return {
    primaryLabel,
    primaryUrl,
    secondaryLabel: secondaryHidden
      ? ""
      : String(secondaryLabelValue || defaults.secondaryLabel || "").trim(),
    secondaryUrl: secondaryHidden
      ? ""
      : String(secondaryUrlValue || defaults.secondaryUrl || "").trim(),
  }
}

export function buildPageCtaBackgroundStyle(image?: string) {
  const source = String(image || "").trim()
  if (!source) return {}

  return {
    backgroundImage: `linear-gradient(135deg, rgba(8,10,12,0.84) 0%, rgba(18,16,15,0.8) 58%, rgba(36,21,18,0.72) 100%), url(${source})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }
}
