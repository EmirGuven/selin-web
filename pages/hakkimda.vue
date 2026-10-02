<script setup lang="ts">
import { usePageSeo } from "../composables/usePageSeo"
import { buildPageCtaBackgroundStyle } from "../utils/page-cta"

interface AboutData {
  heroEyebrow: string; heroTitle: string; heroLead: string; heroBgImage: string; photoUrl: string
  bioTitle: string; bioParagraphs: string[]
  specialties: { title: string; desc: string }[]
  timeline: { years: string; title: string; desc: string }[]
  approachTitle: string; approachLead: string
  approachValues: { title: string; desc: string }[]
  ctaTitle: string; ctaText: string; ctaBgImage: string
  ctaPrimaryLabel: string; ctaPrimaryUrl: string
  ctaSecondaryLabel: string; ctaSecondaryUrl: string
}

const { data: about } = await useFetch<AboutData>('/api/about')

usePageSeo({
  title: about.value?.heroTitle || "Hakkımda – Klinik Psikolog Selin Asya Bağcı",
  description: about.value?.heroLead || "Klinik Psikolog Selin Asya Bağcı'nın eğitimi, uzmanlık alanları ve çalışma yaklaşımı hakkında bilgi alın.",
  path: "/hakkimda"
})

const heroStyle = computed(() => about.value?.heroBgImage ? {
  backgroundImage: `linear-gradient(100deg, rgba(245,243,240,0.96) 38%, rgba(245,243,240,0.55) 65%, rgba(245,243,240,0.08) 100%), url(${about.value.heroBgImage})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center top'
} : {})

const aboutCtaStyle = computed(() => buildPageCtaBackgroundStyle(about.value?.ctaBgImage))
</script>

<template>
  <div class="ab">

    <!-- ══════ HERO ══════ -->
    <section
      class="ab-hero"
      :style="heroStyle"
    >
      <div class="container ab-hero__inner">
        <div class="ab-hero__copy">
          <div class="ab-hero__kicker">
            <span class="ab-hero__dot"></span>
            {{ about?.heroEyebrow || "Klinik Psikolog" }}
          </div>
          <h1 class="ab-hero__h1">{{ about?.heroTitle || 'Hakkımda' }}</h1>
          <p class="ab-hero__lead">{{ about?.heroLead || 'Klinik Psikolog olarak İstanbul\'da ve online olarak bireysel, çift ve aile terapisi alanlarında danışanlarıma eşlik ediyorum.' }}</p>
          <div class="ab-hero__actions">
            <a href="#egitim" class="ab-hero__btn-primary">Çalışma Prensiplerim</a>
            <NuxtLink to="/iletisim" class="ab-hero__btn-sec">Randevu Al →</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Alt 3 rozet bandı -->
      <div class="ab-hero__feats">
        <div class="container ab-hero__feats-inner">
          <div class="ab-hero__feat">
            <div class="ab-hero__feat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div>
              <strong>10+ Yıl Deneyim</strong>
              <span>Bireysel, çift ve aile danışmanlığında klinik deneyim</span>
            </div>
          </div>
          <div class="ab-hero__feat-divider"></div>
          <div class="ab-hero__feat">
            <div class="ab-hero__feat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <strong>BDT &amp; Psikodinamik Terapi</strong>
              <span>Bilişsel davranışçı ve psikodinamik yaklaşımlarla çalışma</span>
            </div>
          </div>
          <div class="ab-hero__feat-divider"></div>
          <div class="ab-hero__feat">
            <div class="ab-hero__feat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            </div>
            <div>
              <strong>Gizlilik İlkesi</strong>
              <span>Mesleki etik kurallara bağlı görüşmeler</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════ BİYOGRAFİ ══════ -->
    <section id="egitim" class="ab-section ab-section--light">
      <div class="container ab-bio">
        <div class="ab-bio__photo" v-if="about?.photoUrl">
          <img :src="about.photoUrl" :alt="about.heroTitle" />
          <div class="ab-bio__exp">
            <strong>20+</strong>
            <span>Yıl Deneyim</span>
          </div>
        </div>
        <div class="ab-bio__copy">
          <span class="ab-tag">{{ 'Hakkımda' }}</span>
          <h2>{{ about?.bioTitle || 'Nasıl Çalışıyoruz?' }}</h2>
          <div class="ab-bio__paragraphs">
            <p v-for="(para, i) in about?.bioParagraphs" :key="i">{{ para }}</p>
          </div>
          <!-- Uzmanlık alanları -->
          <div v-if="about?.specialties?.length" class="ab-specs">
            <div v-for="(sp, i) in about.specialties" :key="i" class="ab-spec">
              <div class="ab-spec__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div>
                <strong>{{ sp.title }}</strong>
                <span>{{ sp.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════ EĞİTİM TİMLİNE ══════ -->
    <section class="ab-section ab-section--warm">
      <div class="container">
        <div class="ab-section__head ab-section__head--center">
          <span class="ab-tag">Süreç</span>
          <h2>Eğitim ve Deneyim Yolculuğum</h2>
        </div>
        <div class="ab-tl">
          <div v-for="(item, i) in about?.timeline" :key="i" class="ab-tl__item">
            <div class="ab-tl__aside">
              <div class="ab-tl__badge">{{ item.years }}</div>
              <div class="ab-tl__line" v-if="i < (about?.timeline?.length ?? 0) - 1"></div>
            </div>
            <div class="ab-tl__card">
              <div class="ab-tl__num">{{ String(i + 1).padStart(2, '0') }}</div>
              <div class="ab-tl__body">
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════ TERAPÖTİK YAKLAŞIM ══════ -->
    <section class="ab-section ab-section--light">
      <div class="container">
        <div class="ab-section__head ab-section__head--center">
          <span class="ab-tag">Prensipler</span>
          <h2>{{ about?.approachTitle || 'Çalışma Prensiplerimiz' }}</h2>
          <p>{{ about?.approachLead }}</p>
        </div>
        <div class="ab-approach">
          <div v-for="(val, i) in about?.approachValues" :key="i" class="ab-approach__card">
            <div class="ab-approach__num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="ab-approach__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h3>{{ val.title }}</h3>
            <p>{{ val.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════ CTA ══════ -->
    <section class="ab-cta" :style="aboutCtaStyle">
      <div class="container ab-cta__inner">
        <div class="ab-cta__copy">
          <h2>{{ about?.ctaTitle || 'Randevu almak ister misiniz?' }}</h2>
          <p>{{ about?.ctaText || 'Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim.' }}</p>
        </div>
        <div class="ab-cta__actions">
          <AppSmartLink :to="about?.ctaPrimaryUrl || '/iletisim'" class="ab-btn ab-btn--white">
            {{ about?.ctaPrimaryLabel || 'Randevu Alın' }}
          </AppSmartLink>
          <AppSmartLink
            v-if="about?.ctaSecondaryLabel"
            :to="about?.ctaSecondaryUrl || '/bireysel-terapi'"
            class="ab-btn ab-btn--ghost"
          >
            {{ about?.ctaSecondaryLabel || 'Hizmetleri İnceleyin' }}
          </AppSmartLink>
        </div>
      </div>
    </section>

  </div>
</template>
