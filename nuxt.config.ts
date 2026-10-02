import { defineNuxtConfig } from "nuxt/config"

export default defineNuxtConfig({
  compatibilityDate: "2025-03-01",
  devtools: { enabled: false },
  ssr: true,
  modules: ["@nuxtjs/seo"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY || "",
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://www.klinikpsikologselinasyabagci.com",
      turnstileSiteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || ""
    }
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "tr"
      },
      viewport: "width=device-width, initial-scale=1",
      titleTemplate: "%s | Klinik Psikolog Selin Asya Bağcı",
      meta: [
        { name: "theme-color", content: "#3d8b6d" }
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.ico" }
      ]
    }
  },
  // @ts-ignore - @nuxtjs/seo module augments this type at runtime
  //
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || "https://www.klinikpsikologselinasyabagci.com",
    name: "Klinik Psikolog Selin Asya Bağcı",
    description: "Klinik Psikolog Selin Asya Bağcı; bireysel terapi, çift terapisi, aile terapisi, online terapi, ergen terapisi ve travma/EMDR terapisi alanlarında İstanbul'da ve online olarak hizmet sunar.",
    defaultLocale: "tr"
  },
  robots: {
    disallow: process.env.NODE_ENV === "production" ? [] : ["/"],
    sitemap: "/sitemap.xml"
  },
  sitemap: {
    autoLastmod: true,
    sources: ["/api/sitemap-urls"]
  },
  routeRules: {
    "/": { ssr: true },
    "/hakkimda": { ssr: true },
    "/iletisim": { ssr: true },
    "/sss": { ssr: true },
    "/gizlilik": { ssr: true },
    "/kullanim-kosullari": { ssr: true },
    "/kvkk": { ssr: true },
    "/admin/**": { ssr: false }
  },
  nitro: {
    prerender: {
      routes: ["/robots.txt", "/sitemap.xml"]
    },
    externals: {
      external: ["better-sqlite3"]
    }
  }
})
