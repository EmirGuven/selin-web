import Database from "better-sqlite3"
import { join } from "path"
import { existsSync, mkdirSync } from "fs"
import {
  defaultFooterContactTitle,
  defaultFooterLegalLinks,
  defaultFooterMenuItems,
  defaultFooterMenuTitle,
  defaultFooterServicesTitle,
  defaultHeaderCtaLabel,
  defaultHeaderCtaUrl,
  defaultHeaderMenuItems,
  defaultLogoType,
} from "../../utils/site-settings"
import { resolveHomepageServiceIcon } from "../../utils/homepage-service-icons"
import { defaultThemePaletteId } from "../../utils/theme-palettes"

const DATA_DIR = join(process.cwd(), "data-db")
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

const DB_PATH = join(DATA_DIR, "app.db")
const DEFAULT_HEADER_MENU_ITEMS_JSON = JSON.stringify(defaultHeaderMenuItems)
const DEFAULT_FOOTER_MENU_ITEMS_JSON = JSON.stringify(defaultFooterMenuItems)
const DEFAULT_FOOTER_LEGAL_LINKS_JSON = JSON.stringify(defaultFooterLegalLinks)

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  _db = new Database(DB_PATH)
  _db.pragma("journal_mode = WAL")
  _db.pragma("foreign_keys = ON")
  initSchema(_db)
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    -- Site ayarları (tek satır)
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT 'Klinik Psikolog Selin Asya Bağcı',
      title_suffix TEXT NOT NULL DEFAULT 'Klinik Psikolog Selin Asya Bağcı',
      description TEXT NOT NULL DEFAULT '',
      logo_tagline TEXT NOT NULL DEFAULT 'Bireysel · Çift · Aile Terapisi',
      footer_tagline TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      phone_display TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      address_street TEXT NOT NULL DEFAULT '',
      address_region TEXT NOT NULL DEFAULT '',
      address_city TEXT NOT NULL DEFAULT '',
      working_hours TEXT NOT NULL DEFAULT '',
      maps_url TEXT NOT NULL DEFAULT '',
      social_instagram TEXT NOT NULL DEFAULT '',
      social_linkedin TEXT NOT NULL DEFAULT '',
      theme_palette TEXT NOT NULL DEFAULT 'forest',
      custom_theme_enabled INTEGER NOT NULL DEFAULT 0,
      custom_primary TEXT NOT NULL DEFAULT '#3d8b6d',
      custom_primary_deep TEXT NOT NULL DEFAULT '#2a624d',
      custom_surface_dark TEXT NOT NULL DEFAULT '#22382f',
      custom_accent_contrast TEXT NOT NULL DEFAULT '#ffffff',
      hero_image TEXT NOT NULL DEFAULT '',
      og_image TEXT NOT NULL DEFAULT '',
      logo_type TEXT NOT NULL DEFAULT 'text',
      logo_image TEXT NOT NULL DEFAULT '',
      header_cta_label TEXT NOT NULL DEFAULT 'Randevu Al',
      header_cta_url TEXT NOT NULL DEFAULT '/iletisim',
      header_menu_items TEXT NOT NULL DEFAULT '[{"label":"Ana Sayfa","to":"/","type":"link"},{"label":"Hakkımda","to":"/hakkimda","type":"link"},{"label":"Hizmetler","to":"","type":"services"},{"label":"Blog","to":"/blog","type":"link"},{"label":"SSS","to":"/sss","type":"link"},{"label":"İletişim","to":"/iletisim","type":"link"}]',
      footer_services_title TEXT NOT NULL DEFAULT 'Hizmetler',
      footer_menu_title TEXT NOT NULL DEFAULT 'Hakkımda',
      footer_menu_items TEXT NOT NULL DEFAULT '[{"label":"Hakkımda","to":"/hakkimda"},{"label":"Blog","to":"/blog"},{"label":"Sık Sorulan Sorular","to":"/sss"},{"label":"Randevu Al","to":"/iletisim"}]',
      footer_contact_title TEXT NOT NULL DEFAULT 'İletişim',
      footer_bottom_text TEXT NOT NULL DEFAULT '',
      footer_legal_links TEXT NOT NULL DEFAULT '[{"label":"Gizlilik Politikası","to":"/gizlilik"},{"label":"Kullanım Koşulları","to":"/kullanim-kosullari"},{"label":"KVKK","to":"/kvkk"}]'
    );

    -- SSS kategorileri
    CREATE TABLE IF NOT EXISTS faq_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- SSS soruları
    CREATE TABLE IF NOT EXISTS faq_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL REFERENCES faq_groups(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    -- Yasal sayfalar (slug: gizlilik, kullanim-kosullari, kvkk)
    CREATE TABLE IF NOT EXISTS legal_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Hakkımda sayfası (tek satır)
    CREATE TABLE IF NOT EXISTS about_page (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow TEXT NOT NULL DEFAULT 'Klinik Psikolog',
      hero_title TEXT NOT NULL DEFAULT 'Hakkımda',
      hero_lead TEXT NOT NULL DEFAULT '',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      photo_url TEXT NOT NULL DEFAULT '',
      bio_title TEXT NOT NULL DEFAULT 'Selin Asya Bağcı',
      bio_paragraphs TEXT NOT NULL DEFAULT '[]',
      specialties TEXT NOT NULL DEFAULT '[]',
      timeline TEXT NOT NULL DEFAULT '[]',
      approach_title TEXT NOT NULL DEFAULT 'Çalışma Prensiplerim',
      approach_lead TEXT NOT NULL DEFAULT '',
      approach_values TEXT NOT NULL DEFAULT '[]',
      cta_title TEXT NOT NULL DEFAULT 'Randevu almak ister misiniz?',
      cta_text TEXT NOT NULL DEFAULT '',
      cta_bg_image TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'Randevu Al',
      cta_primary_url TEXT NOT NULL DEFAULT '/iletisim',
      cta_secondary_label TEXT NOT NULL DEFAULT 'Bireysel Terapi',
      cta_secondary_url TEXT NOT NULL DEFAULT '/bireysel-terapi'
    );

    -- Blog yazıları
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '',
      quote TEXT NOT NULL DEFAULT '',
      read_time TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0,
      published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Anasayfa içeriği (tek satır)
    CREATE TABLE IF NOT EXISTS homepage (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow TEXT NOT NULL DEFAULT 'Klinik Psikolog Selin Asya Bağcı',
      hero_title TEXT NOT NULL DEFAULT 'Kendinize dair yolculuğunuzda güvenli bir destek',
      hero_description TEXT NOT NULL DEFAULT 'Bireysel, çift, aile ve online terapi ile kaygı, ilişki ve yaşam geçişi süreçlerinizde yanınızdayım.',
      hero_badge1 TEXT NOT NULL DEFAULT 'Gizlilik ilkesine bağlı görüşmeler',
      hero_badge2 TEXT NOT NULL DEFAULT 'Yüz yüze ve online seans seçeneği',
      hero_badge3 TEXT NOT NULL DEFAULT 'Klinik Psikoloji uzmanlığı',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      hero_images TEXT NOT NULL DEFAULT '[]',
      hero_primary_label TEXT NOT NULL DEFAULT 'Randevu Al',
      hero_primary_url TEXT NOT NULL DEFAULT '/iletisim',
      hero_secondary_label TEXT NOT NULL DEFAULT 'Hakkımda',
      hero_secondary_url TEXT NOT NULL DEFAULT '/hakkimda',
      accreditations TEXT NOT NULL DEFAULT '[]',
      about_eyebrow TEXT NOT NULL DEFAULT 'Hakkımda',
      about_title TEXT NOT NULL DEFAULT 'Klinik Psikoloji alanında uzman destek',
      about_role TEXT NOT NULL DEFAULT 'Bireysel, Çift, Aile ve Online Terapi',
      about_paragraph1 TEXT NOT NULL DEFAULT '',
      about_paragraph2 TEXT NOT NULL DEFAULT '',
      about_photo TEXT NOT NULL DEFAULT '',
      services_eyebrow TEXT NOT NULL DEFAULT 'Hizmetlerim',
      services_title TEXT NOT NULL DEFAULT 'İhtiyacınıza uygun terapi yaklaşımı',
      services_description TEXT NOT NULL DEFAULT 'Bireysel, çift, aile, online, ergen, bilişsel davranışçı ve psikodinamik terapide ihtiyacınıza uygun çalışma modelini birlikte belirliyoruz.',
      services_bg_image TEXT NOT NULL DEFAULT '',
      process_eyebrow TEXT NOT NULL DEFAULT 'Nasıl Çalışıyorum?',
      process_title TEXT NOT NULL DEFAULT 'İlk görüşmeden sürece giden yol',
      process_description TEXT NOT NULL DEFAULT 'Tanışma görüşmesi, değerlendirme ve düzenli seanslarla size özel bir çalışma planı oluşturuyoruz.',
      process_steps TEXT NOT NULL DEFAULT '[]',
      testimonials_eyebrow TEXT NOT NULL DEFAULT 'Danışan Deneyimleri',
      testimonials_title TEXT NOT NULL DEFAULT 'Neden Selin Asya Bağcı?',
      testimonials_description TEXT NOT NULL DEFAULT 'Gizlilik, güven ve danışan odaklı bir yaklaşımla her görüşmede yanınızda olmayı önceliklendiriyorum.',
      cta_title TEXT NOT NULL DEFAULT 'Randevu almak ister misiniz?',
      cta_description TEXT NOT NULL DEFAULT 'Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim.',
      cta_bg_image TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'Randevu Al',
      cta_primary_url TEXT NOT NULL DEFAULT '/iletisim',
      cta_secondary_label TEXT NOT NULL DEFAULT 'Bireysel Terapi',
      cta_secondary_url TEXT NOT NULL DEFAULT '/bireysel-terapi',
      services_items TEXT NOT NULL DEFAULT '[]'
    );

    -- Randevular / İletişim formları
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      service TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Admin kullanıcı (tek kullanıcı)
    CREATE TABLE IF NOT EXISTS admin_user (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT NOT NULL DEFAULT 'admin',
      password_hash TEXT NOT NULL DEFAULT ''
    );
  `)

  // Varsayılan site ayarlarını ekle
  const existing = db.prepare("SELECT id FROM site_settings WHERE id = 1").get()
  if (!existing) {
    db.prepare(`
      INSERT INTO site_settings (id, name, title_suffix, description, logo_tagline, footer_tagline, phone, phone_display, email,
        address_street, address_region, address_city, working_hours, maps_url,
        social_instagram, social_linkedin, hero_image, og_image)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "Klinik Psikolog Selin Asya Bağcı",
      "Klinik Psikolog Selin Asya Bağcı",
      "Klinik Psikolog Selin Asya Bağcı; bireysel terapi, çift terapisi, aile terapisi, online terapi, ergen terapisi, bilişsel davranışçı terapi ve psikodinamik terapi alanlarında İstanbul'da ve online olarak hizmet sunar.",
      "Bireysel · Çift · Aile Terapisi",
      "İstanbul Bakırköy'de ve online olarak bireysel, çift, aile ve psikodinamik odaklı terapi hizmeti sunuyorum.",
      "+905541211301",
      "0 554 121 13 01",
      "psikologselinasya@gmail.com",
      "Zuhuratbaba Mah. Hüdaverdi Sok. No:45 Daire:2",
      "Bakırköy",
      "İstanbul",
      "Hafta içi 09:00 - 18:00, randevu ile Cumartesi görüşme",
      "https://www.google.com/maps/search/?api=query&query=Klinik+Psikolog+Selin+Asya+Ba%C4%9Fc%C4%B1",
      "",
      "",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=80"
    )
  } else {
    // Mevcut kayıt varsa yeni sütunları eksikse ekle (migration)
    try { db.exec("ALTER TABLE site_settings ADD COLUMN logo_tagline TEXT NOT NULL DEFAULT 'Bireysel · Çift · Aile Terapisi'") } catch {}
    try { db.exec("ALTER TABLE site_settings ADD COLUMN footer_tagline TEXT NOT NULL DEFAULT ''") } catch {}
    try { db.exec(`ALTER TABLE site_settings ADD COLUMN logo_type TEXT NOT NULL DEFAULT '${defaultLogoType}'`) } catch {}
    try { db.exec("ALTER TABLE site_settings ADD COLUMN logo_image TEXT NOT NULL DEFAULT ''") } catch {}
    try { db.exec(`ALTER TABLE site_settings ADD COLUMN header_cta_label TEXT NOT NULL DEFAULT '${defaultHeaderCtaLabel}'`) } catch {}
    try { db.exec(`ALTER TABLE site_settings ADD COLUMN header_cta_url TEXT NOT NULL DEFAULT '${defaultHeaderCtaUrl}'`) } catch {}
    try { db.exec(`ALTER TABLE site_settings ADD COLUMN header_menu_items TEXT NOT NULL DEFAULT '${DEFAULT_HEADER_MENU_ITEMS_JSON}'`) } catch {}
    try { db.exec(`ALTER TABLE site_settings ADD COLUMN footer_services_title TEXT NOT NULL DEFAULT '${defaultFooterServicesTitle}'`) } catch {}
    try { db.exec(`ALTER TABLE site_settings ADD COLUMN footer_menu_title TEXT NOT NULL DEFAULT '${defaultFooterMenuTitle}'`) } catch {}
    try { db.exec(`ALTER TABLE site_settings ADD COLUMN footer_menu_items TEXT NOT NULL DEFAULT '${DEFAULT_FOOTER_MENU_ITEMS_JSON}'`) } catch {}
    try { db.exec(`ALTER TABLE site_settings ADD COLUMN footer_contact_title TEXT NOT NULL DEFAULT '${defaultFooterContactTitle}'`) } catch {}
    try { db.exec("ALTER TABLE site_settings ADD COLUMN footer_bottom_text TEXT NOT NULL DEFAULT ''") } catch {}
    try { db.exec(`ALTER TABLE site_settings ADD COLUMN footer_legal_links TEXT NOT NULL DEFAULT '${DEFAULT_FOOTER_LEGAL_LINKS_JSON}'`) } catch {}
    try { db.exec(`ALTER TABLE site_settings ADD COLUMN theme_palette TEXT NOT NULL DEFAULT '${defaultThemePaletteId}'`) } catch {}
    try { db.exec("ALTER TABLE site_settings ADD COLUMN custom_theme_enabled INTEGER NOT NULL DEFAULT 0") } catch {}
    try { db.exec("ALTER TABLE site_settings ADD COLUMN custom_primary TEXT NOT NULL DEFAULT '#3d8b6d'") } catch {}
    try { db.exec("ALTER TABLE site_settings ADD COLUMN custom_primary_deep TEXT NOT NULL DEFAULT '#2a624d'") } catch {}
    try { db.exec("ALTER TABLE site_settings ADD COLUMN custom_surface_dark TEXT NOT NULL DEFAULT '#22382f'") } catch {}
    try { db.exec("ALTER TABLE site_settings ADD COLUMN custom_accent_contrast TEXT NOT NULL DEFAULT '#ffffff'") } catch {}
  }

  // Varsayılan admin kullanıcısı (şifre: admin123 — ilk girişte değiştirilmeli)
  const adminExists = db.prepare("SELECT id FROM admin_user WHERE id = 1").get()
  if (!adminExists) {
    // bcrypt yerine basit hash — production'da değiştirin
    db.prepare("INSERT INTO admin_user (id, username, password_hash) VALUES (1, 'admin', 'admin123')").run()
  }

  // Örnek blog yazılarını ekle (sadece boşsa)
  const blogCount = (db.prepare("SELECT COUNT(*) as c FROM blog_posts").get() as any).c
  if (blogCount === 0) {
    // Varsayılan blog içerikleri applySelinAsyaBagciPreset ile eklenir.
  }

  // Varsayılan SSS verilerini ekle (sadece boşsa)
  const faqCount = (db.prepare("SELECT COUNT(*) as c FROM faq_groups").get() as any).c
  if (faqCount === 0) {
    // Varsayılan SSS içerikleri applySelinAsyaBagciPreset ile eklenir.
  }

  // Varsayılan yasal sayfaları ekle (sadece boşsa)
  const legalCount = (db.prepare("SELECT COUNT(*) as c FROM legal_pages").get() as any).c
  if (legalCount === 0) {
    // Varsayılan yasal içerikler applySelinAsyaBagciPreset ile eklenir.
  }

  // Varsayılan hakkımda sayfasını ekle
  const aboutExists = db.prepare("SELECT id FROM about_page WHERE id = 1").get()
  if (!aboutExists) {
    db.prepare(`
      INSERT INTO about_page (id, hero_eyebrow, hero_title, hero_lead, photo_url,
        bio_title, bio_paragraphs, specialties,
        timeline, approach_title, approach_lead, approach_values, cta_title, cta_text)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "Klinik Psikolog",
      "Hakkımda",
      "Klinik Psikolog olarak İstanbul'da ve online olarak bireysel, çift ve aile terapisi alanlarında danışanlarıma eşlik ediyorum.",
      "",
      "Selin Asya Bağcı",
      JSON.stringify([
        "Klinik Psikoloji alanındaki eğitimimi ve uzmanlık deneyimimi, danışanlarıma güvenli ve etik bir çerçevede eşlik etmek için kullanıyorum.",
        "Bireysel, çift, aile ve online terapi çalışmalarımda danışan odaklı, somut ve gizliliğe bağlı bir yaklaşım benimsiyorum."
      ]),
      JSON.stringify([
        { title: "Bireysel Terapi", desc: "Kaygı, tükenmişlik ve özgüven konularında kişiye özel terapi süreci." },
        { title: "Çift Terapisi", desc: "İletişim, güven ve yakınlık konularında çiftlere yönelik destek." },
        { title: "Aile Terapisi", desc: "Aile içi iletişim ve kuşaklar arası uyum çalışmaları." },
        { title: "BDT ve Psikodinamik Terapi", desc: "Bilişsel davranışçı ve psikodinamik yaklaşımlarla kişiye özel çalışma." }
      ]),
      JSON.stringify([
        { years: "Lisans", title: "Psikoloji Lisansı", desc: "Psikoloji lisans eğitimimi tamamlayarak klinik alana yöneldim." },
        { years: "Yüksek Lisans", title: "Klinik Psikoloji", desc: "Klinik Psikoloji yüksek lisans eğitimimle uzmanlık alanımı derinleştirdim." },
        { years: "Uzmanlık", title: "BDT ve Psikodinamik Terapi Eğitimleri", desc: "Bilişsel davranışçı terapi ve psikodinamik terapi yaklaşımları üzerine ileri düzey eğitimler aldım." },
        { years: "10+", title: "Danışmanlık Deneyimi", desc: "Bireysel, çift ve aile danışmanlığında çok yıllı klinik deneyime sahibim." }
      ]),
      "Çalışma Prensiplerim",
      "Gizlilik, güven ve danışan odaklı bir yaklaşımı, etik ilkelere bağlı kalarak her görüşmede önceliklendiriyorum.",
      JSON.stringify([
        { title: "Gizlilik", desc: "Görüşmelerde paylaşılan her bilgi mesleki gizlilik ilkesiyle korunur." },
        { title: "Güven", desc: "Yargılamayan, güvenli bir görüşme alanı oluşturmayı önceliklendiriyorum." },
        { title: "Danışan Odaklılık", desc: "Çalışma planı, danışanın ihtiyaç ve hedefleri doğrultusunda şekillenir." }
      ]),
      "Randevu almak ister misiniz?",
      "Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim."
    )
  } else {
    // Migration: yeni sütunlar ekle
    try { db.exec("ALTER TABLE about_page ADD COLUMN photo_url TEXT NOT NULL DEFAULT ''") } catch {}
    try { db.exec("ALTER TABLE about_page ADD COLUMN hero_bg_image TEXT NOT NULL DEFAULT ''") } catch {}
    try { db.exec("ALTER TABLE about_page ADD COLUMN cta_bg_image TEXT NOT NULL DEFAULT ''") } catch {}
    try { db.exec("ALTER TABLE about_page ADD COLUMN cta_primary_label TEXT NOT NULL DEFAULT 'Randevu Al'") } catch {}
    try { db.exec("ALTER TABLE about_page ADD COLUMN cta_primary_url TEXT NOT NULL DEFAULT '/iletisim'") } catch {}
    try { db.exec("ALTER TABLE about_page ADD COLUMN cta_secondary_label TEXT NOT NULL DEFAULT 'Bireysel Terapi'") } catch {}
    try { db.exec("ALTER TABLE about_page ADD COLUMN cta_secondary_url TEXT NOT NULL DEFAULT '/bireysel-terapi'") } catch {}
  }

  // Appointments migration: yeni sütunlar
  try { db.exec("ALTER TABLE appointments ADD COLUMN first_visit_date TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE appointments ADD COLUMN issue_date TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE appointments ADD COLUMN session_count INTEGER NOT NULL DEFAULT 0") } catch {}
  try { db.exec("ALTER TABLE appointments ADD COLUMN type TEXT NOT NULL DEFAULT 'request'") } catch {}
  try { db.exec("ALTER TABLE appointments ADD COLUMN appointment_date TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE appointments ADD COLUMN appointment_time TEXT NOT NULL DEFAULT ''") } catch {}

  // Blog migration: yeni sütunlar
  try { db.exec("ALTER TABLE blog_posts ADD COLUMN hero_bg_image TEXT NOT NULL DEFAULT ''") } catch {}

  // İletişim sayfası (tek satır)
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_page (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow    TEXT NOT NULL DEFAULT 'İletişim',
      hero_title      TEXT NOT NULL DEFAULT 'İletişim ve Randevu Talebi',
      hero_lead       TEXT NOT NULL DEFAULT 'İletişim bilgilerimiz üzerinden bize ulaşabilir, randevu formu ile görüşme talebinizi iletebilirsiniz.',
      hero_bg_image   TEXT NOT NULL DEFAULT '',
      info_title      TEXT NOT NULL DEFAULT 'İletişim Bilgileri',
      info_lead       TEXT NOT NULL DEFAULT 'Görüşme kanallarımız üzerinden randevu detaylarınızı paylaşabilirsiniz.',
      contact_email   TEXT NOT NULL DEFAULT '',
      form_title      TEXT NOT NULL DEFAULT 'Randevu Talebi',
      form_lead       TEXT NOT NULL DEFAULT 'Bireysel, çift, aile veya online terapi talebiniz için temel bilgileri paylaşın, size geri dönelim.',
      cta_title       TEXT NOT NULL DEFAULT 'Hızlı Ulaşım',
      cta_lead        TEXT NOT NULL DEFAULT 'Form yerine telefon veya e-posta üzerinden de doğrudan ulaşabilirsiniz.',
      cta_bg_image    TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'E-posta Gönder',
      cta_primary_url TEXT NOT NULL DEFAULT '',
      cta_secondary_label TEXT NOT NULL DEFAULT 'Telefon Et',
      cta_secondary_url TEXT NOT NULL DEFAULT ''
    )
  `)
  const contactExists = db.prepare("SELECT id FROM contact_page WHERE id = 1").get()
  if (!contactExists) {
    db.prepare(`INSERT INTO contact_page (id) VALUES (1)`).run()
  }
  try { db.exec("ALTER TABLE contact_page ADD COLUMN cta_bg_image TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE contact_page ADD COLUMN contact_email TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE contact_page ADD COLUMN cta_primary_label TEXT NOT NULL DEFAULT 'E-posta Gönder'") } catch {}
  try { db.exec("ALTER TABLE contact_page ADD COLUMN cta_primary_url TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE contact_page ADD COLUMN cta_secondary_label TEXT NOT NULL DEFAULT 'Telefon Et'") } catch {}
  try { db.exec("ALTER TABLE contact_page ADD COLUMN cta_secondary_url TEXT NOT NULL DEFAULT ''") } catch {}

  // Blog listesi sayfası
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_page (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow  TEXT NOT NULL DEFAULT 'Psikoloji Yazıları',
      hero_title    TEXT NOT NULL DEFAULT 'Blog',
      hero_lead     TEXT NOT NULL DEFAULT 'Kaygı, ilişkiler ve terapi süreci üzerine paylaştığım temel içerikleri burada bulabilirsiniz.',
      hero_bg_image TEXT NOT NULL DEFAULT ''
    )
  `)
  const blogPageExists = db.prepare("SELECT id FROM blog_page WHERE id = 1").get()
  if (!blogPageExists) {
    db.prepare(`INSERT INTO blog_page (id) VALUES (1)`).run()
  }

  // SSS sayfası
  db.exec(`
    CREATE TABLE IF NOT EXISTS sss_page (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow  TEXT NOT NULL DEFAULT 'Merak Edilenler',
      hero_title    TEXT NOT NULL DEFAULT 'Sık Sorulan Sorular',
      hero_lead     TEXT NOT NULL DEFAULT 'Randevu süreci, seanslar ve online terapi hakkında en çok sorulan soruları burada bulabilirsiniz.',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      cta_title     TEXT NOT NULL DEFAULT 'Cevabını bulamadığınız bir sorunuz mu var?',
      cta_lead      TEXT NOT NULL DEFAULT 'Randevu veya görüşme detayları için benimle doğrudan iletişime geçebilirsiniz.',
      cta_bg_image  TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'İletişime Geçin',
      cta_primary_url TEXT NOT NULL DEFAULT '/iletisim',
      cta_secondary_label TEXT NOT NULL DEFAULT 'Randevu Alın',
      cta_secondary_url TEXT NOT NULL DEFAULT '/iletisim'
    )
  `)
  const sssPageExists = db.prepare("SELECT id FROM sss_page WHERE id = 1").get()
  if (!sssPageExists) {
    db.prepare(`INSERT INTO sss_page (id) VALUES (1)`).run()
  }
  try { db.exec("ALTER TABLE sss_page ADD COLUMN cta_bg_image TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE sss_page ADD COLUMN cta_primary_label TEXT NOT NULL DEFAULT 'İletişime Geçin'") } catch {}
  try { db.exec("ALTER TABLE sss_page ADD COLUMN cta_primary_url TEXT NOT NULL DEFAULT '/iletisim'") } catch {}
  try { db.exec("ALTER TABLE sss_page ADD COLUMN cta_secondary_label TEXT NOT NULL DEFAULT 'Randevu Alın'") } catch {}
  try { db.exec("ALTER TABLE sss_page ADD COLUMN cta_secondary_url TEXT NOT NULL DEFAULT '/iletisim'") } catch {}

  // Hizmet sayfaları (bireysel, çift, online)
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_pages (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      slug         TEXT NOT NULL UNIQUE,
      hero_eyebrow TEXT NOT NULL DEFAULT 'Terapi Hizmeti',
      hero_title   TEXT NOT NULL DEFAULT '',
      hero_lead    TEXT NOT NULL DEFAULT '',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      what_title   TEXT NOT NULL DEFAULT '',
      what_lead    TEXT NOT NULL DEFAULT '',
      benefits     TEXT NOT NULL DEFAULT '[]',
      issues_title TEXT NOT NULL DEFAULT 'Hangi Durumlarda Tercih Edilir?',
      issues_lead  TEXT NOT NULL DEFAULT '',
      issues       TEXT NOT NULL DEFAULT '[]',
      process_title TEXT NOT NULL DEFAULT 'Süreç Nasıl İlerler?',
      process_lead  TEXT NOT NULL DEFAULT '',
      process_steps TEXT NOT NULL DEFAULT '[]',
      cta_title    TEXT NOT NULL DEFAULT 'Randevu almak ister misiniz?',
      cta_lead     TEXT NOT NULL DEFAULT '',
      cta_bg_image TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'Randevu Al',
      cta_primary_url TEXT NOT NULL DEFAULT '/iletisim',
      cta_secondary_label TEXT NOT NULL DEFAULT 'Hakkımda',
      cta_secondary_url TEXT NOT NULL DEFAULT '/hakkimda'
    )
  `)
  try { db.exec("ALTER TABLE service_pages ADD COLUMN cta_bg_image TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE service_pages ADD COLUMN cta_primary_label TEXT NOT NULL DEFAULT 'Randevu Al'") } catch {}
  try { db.exec("ALTER TABLE service_pages ADD COLUMN cta_primary_url TEXT NOT NULL DEFAULT '/iletisim'") } catch {}
  try { db.exec("ALTER TABLE service_pages ADD COLUMN cta_secondary_label TEXT NOT NULL DEFAULT 'Hakkımda'") } catch {}
  try { db.exec("ALTER TABLE service_pages ADD COLUMN cta_secondary_url TEXT NOT NULL DEFAULT '/hakkimda'") } catch {}

  // Hizmetler ana sayfası
  db.exec(`
    CREATE TABLE IF NOT EXISTS services_page (
      id           INTEGER PRIMARY KEY CHECK (id = 1),
      hero_eyebrow TEXT NOT NULL DEFAULT 'Hizmetlerim',
      hero_title   TEXT NOT NULL DEFAULT 'Terapi Hizmetlerim',
      hero_lead    TEXT NOT NULL DEFAULT 'Bireysel, çift, aile, online, ergen, bilişsel davranışçı ve psikodinamik terapide ihtiyacınıza göre doğru çalışma modelini planlıyoruz.',
      hero_bg_image TEXT NOT NULL DEFAULT '',
      intro_title  TEXT NOT NULL DEFAULT 'Nasıl Yardımcı Olabilirim?',
      intro_lead   TEXT NOT NULL DEFAULT 'İhtiyacınız ve beklentileriniz doğrultusunda size uygun terapi yaklaşımını birlikte oluşturuyoruz.',
      cta_title    TEXT NOT NULL DEFAULT 'Randevu almak ister misiniz?',
      cta_lead     TEXT NOT NULL DEFAULT 'Görüşme talebinizi paylaşın, size uygun randevu saatini birlikte netleştirelim.',
      cta_bg_image TEXT NOT NULL DEFAULT '',
      cta_primary_label TEXT NOT NULL DEFAULT 'Randevu Al',
      cta_primary_url TEXT NOT NULL DEFAULT '/iletisim',
      cta_secondary_label TEXT NOT NULL DEFAULT 'İletişime Geçin',
      cta_secondary_url TEXT NOT NULL DEFAULT '/iletisim'
    )
  `)
  const servicesPageExists = db.prepare("SELECT id FROM services_page WHERE id = 1").get()
  if (!servicesPageExists) {
    db.prepare(`INSERT INTO services_page (id) VALUES (1)`).run()
  }
  try { db.exec("ALTER TABLE services_page ADD COLUMN cta_bg_image TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE services_page ADD COLUMN cta_primary_label TEXT NOT NULL DEFAULT 'Randevu Al'") } catch {}
  try { db.exec("ALTER TABLE services_page ADD COLUMN cta_primary_url TEXT NOT NULL DEFAULT '/iletisim'") } catch {}
  try { db.exec("ALTER TABLE services_page ADD COLUMN cta_secondary_label TEXT NOT NULL DEFAULT 'İletişime Geçin'") } catch {}
  try { db.exec("ALTER TABLE services_page ADD COLUMN cta_secondary_url TEXT NOT NULL DEFAULT '/iletisim'") } catch {}

  // Hizmet sayfalarını varsayılan verilerle oluştur
  const sp = db.prepare("SELECT COUNT(*) as c FROM service_pages").get() as any
  if (sp.c === 0) {
    // Varsayılan hizmet içerikleri applySelinAsyaBagciPreset ile eklenir.
  }

  // Admin notlar tablosu (notluk / hatırlatıcı)
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      remind_at TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT 'yellow',
      pinned INTEGER NOT NULL DEFAULT 0,
      done INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  // Varsayılan anasayfa içeriğini ekle
  const homepageExists = db.prepare("SELECT id FROM homepage WHERE id = 1").get()
  if (!homepageExists) {
    db.prepare(`
      INSERT INTO homepage (id,
        hero_eyebrow, hero_title, hero_description, hero_badge1, hero_badge2, hero_badge3,
        accreditations,
        about_eyebrow, about_title, about_role, about_paragraph1, about_paragraph2, about_photo,
        services_eyebrow, services_title, services_description,
        process_eyebrow, process_title, process_description, process_steps,
        testimonials_eyebrow, testimonials_title, testimonials_description,
        cta_title, cta_description
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "Klinik Psikolog Selin Asya Bağcı",
      "Kendinize dair yolculuğunuzda güvenli bir destek",
      "Bireysel, çift, aile ve online terapi ile kaygı, ilişki ve yaşam geçişi süreçlerinizde yanınızdayım.",
      "Gizlilik ilkesine bağlı görüşmeler",
      "Yüz yüze ve online seans seçeneği",
      "Klinik Psikoloji uzmanlığı",
      JSON.stringify([
        { icon: "shield", label: "Gizlilik ilkesine bağlı görüşmeler" },
        { icon: "video",  label: "Yüz yüze ve online seans seçeneği" },
        { icon: "brain", label: "Klinik Psikoloji uzmanlığı" },
      ]),
      "Hakkımda",
      "Klinik Psikoloji alanında uzman destek",
      "Bireysel, Çift, Aile ve Online Terapi",
      "Danışanlarıma güvenli, gizlilik ilkesine bağlı ve etik bir çerçevede eşlik etmeyi amaçlıyorum.",
      "İstanbul Bakırköy'deki görüşme odamda ve online olarak bireysel, çift, aile, ergen ve psikodinamik odaklı terapi hizmeti sunuyorum.",
      "",
      "Hizmetlerim",
      "İhtiyacınıza uygun terapi yaklaşımı",
      "Bireysel, çift, aile, online, ergen, bilişsel davranışçı ve psikodinamik terapide ihtiyacınıza uygun çalışma modelini birlikte belirliyoruz.",
      "Nasıl Çalışıyorum?",
      "İlk görüşmeden sürece giden yol",
      "Tanışma görüşmesi, değerlendirme ve düzenli seanslarla size özel bir çalışma planı oluşturuyoruz.",
      JSON.stringify([
        { number: "1", title: "Tanışma Görüşmesi", description: "İlk görüşmede sizi dinler, gelme nedeninizi ve beklentilerinizi birlikte netleştiririz." },
        { number: "2", title: "Değerlendirme ve Plan", description: "Yaşadığınız güçlükler çerçevesinde uygun terapi yaklaşımı ve görüşme sıklığı belirlenir." },
        { number: "3", title: "Düzenli Seanslar", description: "Belirlenen plan doğrultusunda düzenli görüşmelerle süreç takip edilir ve ilerleme birlikte değerlendirilir." },
      ]),
      "Danışan Deneyimleri",
      "Neden Selin Asya Bağcı?",
      "Gizlilik, güven ve danışan odaklı bir yaklaşımla her görüşmede yanınızda olmayı önceliklendiriyorum.",
      "Randevu almak ister misiniz?",
      "Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim."
    )
  }
  try { db.exec("ALTER TABLE homepage ADD COLUMN hero_bg_image TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE homepage ADD COLUMN hero_images TEXT NOT NULL DEFAULT '[]'") } catch {}
  try { db.exec("ALTER TABLE homepage ADD COLUMN hero_primary_label TEXT NOT NULL DEFAULT 'Randevu Al'") } catch {}
  try { db.exec("ALTER TABLE homepage ADD COLUMN hero_primary_url TEXT NOT NULL DEFAULT '/iletisim'") } catch {}
  try { db.exec("ALTER TABLE homepage ADD COLUMN hero_secondary_label TEXT NOT NULL DEFAULT 'Hakkımda'") } catch {}
  try { db.exec("ALTER TABLE homepage ADD COLUMN hero_secondary_url TEXT NOT NULL DEFAULT '/hakkimda'") } catch {}
  try { db.exec("ALTER TABLE homepage ADD COLUMN services_bg_image TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE homepage ADD COLUMN cta_bg_image TEXT NOT NULL DEFAULT ''") } catch {}
  try { db.exec("ALTER TABLE homepage ADD COLUMN cta_primary_label TEXT NOT NULL DEFAULT 'Randevu Al'") } catch {}
  try { db.exec("ALTER TABLE homepage ADD COLUMN cta_primary_url TEXT NOT NULL DEFAULT '/iletisim'") } catch {}
  try { db.exec("ALTER TABLE homepage ADD COLUMN cta_secondary_label TEXT NOT NULL DEFAULT 'Bireysel Terapi'") } catch {}
  try { db.exec("ALTER TABLE homepage ADD COLUMN cta_secondary_url TEXT NOT NULL DEFAULT '/bireysel-terapi'") } catch {}

  const legacyHeroImage = (db.prepare("SELECT hero_image FROM site_settings WHERE id = 1").get() as any)?.hero_image || ""
  if (legacyHeroImage) {
    db.prepare(`
      UPDATE homepage
      SET hero_bg_image = ?
      WHERE id = 1 AND TRIM(COALESCE(hero_bg_image, '')) = ''
    `).run(legacyHeroImage)
  }
  db.prepare(`
    UPDATE homepage
    SET services_bg_image = COALESCE(NULLIF(hero_bg_image, ''), ?)
    WHERE id = 1 AND TRIM(COALESCE(services_bg_image, '')) = ''
  `).run(legacyHeroImage)

  applySelinAsyaBagciPreset(db)
}

function applySelinAsyaBagciPreset(db: Database.Database) {
  const row = db.prepare(`
    SELECT name, title_suffix, logo_tagline, email, phone_display, address_street
    FROM site_settings
    WHERE id = 1
  `).get() as any
  if (!row) return

  const brandFingerprint = `${row.name || ""} ${row.title_suffix || ""} ${row.logo_tagline || ""}`.toLowerCase()
  const hasLegacyPsychBrand =
    brandFingerprint.includes("nurgül yaren") ||
    brandFingerprint.includes("psikoterapist") ||
    brandFingerprint.includes("bakırköy")
  const hasAsciiGozdeBrand = brandFingerprint.includes("gozde nakliyat")
  const hasTurkishGozdeBrand = brandFingerprint.includes("gözde nakliyat")
  const serviceSlugs = (db.prepare("SELECT slug FROM service_pages").all() as Array<{ slug: string }>).map((item) => item.slug)
  const hasLegacySampleServices = serviceSlugs.some((slug) =>
    ["evden-eve-nakliyat", "ofis-tasimaciligi", "sehirler-arasi-nakliyat", "frigolu-tasima", "kara-tasimaciligi", "parsiyel-tasima", "banka-tasimaciligi", "fuar-tasima", "tibbi-cihaz-tasima"].includes(slug),
  )
  const hasPlaceholderContact =
    row.email === "info@gozdenakliyat.com" ||
    row.phone_display === "0555 555 55 55" ||
    String(row.address_street || "").includes("Örnek Mah")
  const hasGozdeBrand = hasAsciiGozdeBrand || hasTurkishGozdeBrand
  const hasNoServicesYet = serviceSlugs.length === 0

  if (!hasLegacyPsychBrand && !hasLegacySampleServices && !hasPlaceholderContact && !hasGozdeBrand && !hasNoServicesYet) {
    return
  }

  const heroImage = "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=80"
  const aboutImage = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1400&q=80"
  const blogImage1 = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
  const blogImage2 = "https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?auto=format&fit=crop&w=1200&q=80"
  const blogImage3 = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"

  const services = [
    {
      slug: "bireysel-terapi",
      heroEyebrow: "Kişiye Özel Çalışma",
      heroTitle: "Bireysel Terapi",
      heroLead: "Bireysel terapi seanslarında kendinizi daha iyi tanımanıza, zorlayıcı duygu ve düşüncelerle sağlıklı bir ilişki kurmanıza eşlik ediyorum.",
      whatTitle: "Bireysel Terapi Nedir?",
      whatLead: "Bireysel terapi; kaygı, tükenmişlik, özgüven ve yaşam geçişleriyle baş etmek isteyen danışanlara yönelik, kişiye özel bir çalışma sürecidir.",
      benefits: JSON.stringify([
        { title: "Güvenli Bir Görüşme Alanı", text: "Yargılamayan, gizlilik ilkesine bağlı bir ortamda duygu ve düşüncelerinizi rahatça ifade edebilirsiniz." },
        { title: "Kişiye Özel Çalışma Planı", text: "Görüşme hedefleriniz ve yaşadığınız güçlükler doğrultusunda size uygun bir terapi akışı oluşturulur." },
        { title: "Somut Baş Etme Becerileri", text: "Seanslar arasında uygulayabileceğiniz farkındalık ve baş etme yöntemleriyle süreç desteklenir." },
      ]),
      issuesTitle: "Hangi Durumlarda Tercih Edilir?",
      issuesLead: "Bireysel terapi; kaygı, tükenmişlik ve yaşam geçişleriyle baş etmek isteyen danışanlar için uygundur.",
      issues: JSON.stringify([
        "Kaygı ve yoğun stres durumları",
        "Tükenmişlik ve motivasyon kaybı",
        "Özgüven ve öz saygı güçlükleri",
        "Yas ve kayıp süreçleri",
        "Yaşam geçişleri ve karar verme zorlukları",
        "Uyku ve duygu durum dalgalanmaları",
      ]),
      processTitle: "Süreç Nasıl İlerler?",
      processLead: "Tanışma görüşmesi, değerlendirme ve düzenli seanslarla size özel bir çalışma planı oluşturulur.",
      processSteps: JSON.stringify([
        { title: "Tanışma Görüşmesi", text: "İlk görüşmede sizi dinler, gelme nedeninizi ve beklentilerinizi birlikte netleştiririz." },
        { title: "Değerlendirme ve Plan", text: "Yaşadığınız güçlükler çerçevesinde uygun terapi yaklaşımı ve görüşme sıklığı belirlenir." },
        { title: "Düzenli Seanslar", text: "Belirlenen plan doğrultusunda düzenli görüşmelerle süreç takip edilir ve ilerleme birlikte değerlendirilir." },
      ]),
      ctaTitle: "Bireysel terapi sürecinizi başlatalım",
      ctaLead: "Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim.",
    },
    {
      slug: "cift-terapisi",
      heroEyebrow: "İlişki Odaklı Çalışma",
      heroTitle: "Çift Terapisi",
      heroLead: "Çift terapisinde partnerlerin birbirini daha iyi anlamasına, sağlıklı iletişim kurmasına ve ilişkideki tıkanıklıkları birlikte çözmesine destek oluyorum.",
      whatTitle: "Çift Terapisi Nedir?",
      whatLead: "Çift terapisi; iletişim, güven ve yakınlık konularında zorlanan çiftlerin, tarafsız bir görüşme ortamında birlikte çalışmasını kapsar.",
      benefits: JSON.stringify([
        { title: "Tarafsız Bir Görüşme Zemini", text: "Her iki tarafın da kendini güvenle ifade edebildiği, yapılandırılmış bir görüşme ortamı sağlanır." },
        { title: "İletişim Odaklı Çalışma", text: "Çatışma anlarında kullanılan iletişim kalıpları fark edilir, daha yapıcı alternatifler birlikte geliştirilir." },
        { title: "İlişki Hedeflerine Uygun Takip", text: "Çiftin birlikte belirlediği hedefler doğrultusunda görüşmeler planlanır ve ilerleme değerlendirilir." },
      ]),
      issuesTitle: "Hangi Durumlarda Tercih Edilir?",
      issuesLead: "Çift terapisi; iletişim, güven ve yakınlık konularında zorlanan çiftler için uygundur.",
      issues: JSON.stringify([
        "Sık tekrar eden iletişim çatışmaları",
        "Güven kaybı ve kıskançlık",
        "Duygusal uzaklaşma ve yakınlık kaygısı",
        "Evlilik ve birliktelik kararları",
        "Ebeveynlik yaklaşımındaki anlaşmazlıklar",
        "Ayrılık sonrası süreç yönetimi",
      ]),
      processTitle: "Süreç Nasıl İlerler?",
      processLead: "Ortak tanışma görüşmesi, dinamiklerin değerlendirilmesi ve düzenli ortak çalışmayla süreç ilerler.",
      processSteps: JSON.stringify([
        { title: "Ortak Tanışma Görüşmesi", text: "Çiftle birlikte ilişkinin geçmişi ve görüşmeden beklentiler değerlendirilir." },
        { title: "Dinamiklerin Değerlendirilmesi", text: "İlişkideki tekrar eden örüntüler ve iletişim biçimleri birlikte incelenir." },
        { title: "Birlikte Çalışma Süreci", text: "Belirlenen hedefler doğrultusunda düzenli görüşmelerle iletişim ve yakınlık yeniden güçlendirilir." },
      ]),
      ctaTitle: "Çift terapisi sürecinizi başlatalım",
      ctaLead: "Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim.",
    },
    {
      slug: "aile-terapisi",
      heroEyebrow: "Sistem Odaklı Çalışma",
      heroTitle: "Aile Terapisi",
      heroLead: "Aile terapisinde aile üyelerinin birbirini dinlemesine, roller ve sınırlar konusunda ortak bir dil geliştirmesine eşlik ediyorum.",
      whatTitle: "Aile Terapisi Nedir?",
      whatLead: "Aile terapisi; aile içi iletişim, sınırlar ve kuşaklar arası anlaşmazlıkların, aile sistemi bütünüyle ele alınarak çalışılmasını kapsar.",
      benefits: JSON.stringify([
        { title: "Tüm Aileyi Kapsayan Yaklaşım", text: "Sorun tek bir kişiye değil, aile sistemine ait bir bütün olarak ele alınır." },
        { title: "Sınır ve Rol Netliği", text: "Aile içindeki roller, beklentiler ve sınırlar birlikte gözden geçirilir." },
        { title: "Kuşaklar Arası Köprü", text: "Farklı kuşakların bakış açıları bir araya getirilerek ortak anlayış geliştirilir." },
      ]),
      issuesTitle: "Hangi Durumlarda Tercih Edilir?",
      issuesLead: "Aile terapisi; aile içi iletişim ve kuşaklar arası uyum güçlükleri yaşayan aileler için uygundur.",
      issues: JSON.stringify([
        "Ebeveyn-çocuk iletişim güçlükleri",
        "Kardeş ilişkilerinde çatışma",
        "Boşanma veya yeniden evlilik süreçleri",
        "Ergenlik dönemi gerginlikleri",
        "Aile içi sınır ve özerklik konuları",
        "Kayıp ve değişim süreçlerine uyum",
      ]),
      processTitle: "Süreç Nasıl İlerler?",
      processLead: "Aile ile tanışma, sistem değerlendirmesi ve ortak çalışma planıyla süreç ilerler.",
      processSteps: JSON.stringify([
        { title: "Aile ile Tanışma", text: "Aile üyeleriyle birlikte görüşmeden beklentiler ve gündem netleştirilir." },
        { title: "Sistem Değerlendirmesi", text: "Aile içi iletişim örüntüleri ve roller birlikte gözden geçirilir." },
        { title: "Ortak Çalışma Planı", text: "Belirlenen hedefler doğrultusunda düzenli görüşmelerle aile içi iletişim güçlendirilir." },
      ]),
      ctaTitle: "Aile terapisi sürecinizi başlatalım",
      ctaLead: "Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim.",
    },
    {
      slug: "online-terapi",
      heroEyebrow: "Zaman ve Mekandan Bağımsız",
      heroTitle: "Online Terapi",
      heroLead: "Online terapi seansları, yüz yüze görüşmeyle aynı gizlilik ve özen ilkesiyle, size uygun zaman diliminde video üzerinden gerçekleştirilir.",
      whatTitle: "Online Terapi Nedir?",
      whatLead: "Online terapi; güvenli bir görüntülü görüşme platformu üzerinden, yüz yüze seanslarla aynı etik ilkelere bağlı kalınarak yürütülen bir terapi biçimidir.",
      benefits: JSON.stringify([
        { title: "Zaman ve Mekandan Bağımsızlık", text: "Şehir dışında veya yurt dışında yaşıyor olsanız bile düzenli görüşme imkanı sunar." },
        { title: "Aynı Gizlilik İlkesi", text: "Online görüşmeler de yüz yüze seanslarla aynı mesleki gizlilik ve etik ilkelere tabidir." },
        { title: "Kolay Randevu Akışı", text: "Güvenli görüntülü görüşme bağlantısı, randevu öncesinde tarafınıza iletilir." },
      ]),
      issuesTitle: "Hangi Durumlarda Tercih Edilir?",
      issuesLead: "Online terapi; zaman veya mekan kısıtlılığı yaşayan, düzenli seans takibi isteyen danışanlar için uygundur.",
      issues: JSON.stringify([
        "Şehir dışında veya yurt dışında yaşayanlar",
        "Yoğun iş temposu nedeniyle kısıtlı zaman",
        "Yüz yüze görüşmede zorlanma",
        "Düzenli seans takibi isteyenler",
        "İlk kez terapiye başlayacak danışanlar",
        "Mobilite kısıtlılığı yaşayan danışanlar",
      ]),
      processTitle: "Süreç Nasıl İlerler?",
      processLead: "Ön görüşme, randevu planlama ve düzenli online seanslarla süreç yürütülür.",
      processSteps: JSON.stringify([
        { title: "Ön Görüşme", text: "Kısa bir ön görüşmeyle online terapiye uygunluk ve beklentiler değerlendirilir." },
        { title: "Randevu ve Bağlantı", text: "Seans günü ve saati belirlenir, güvenli görüntülü görüşme bağlantısı paylaşılır." },
        { title: "Düzenli Online Seanslar", text: "Belirlenen sıklıkta online görüşmelerle süreç yüz yüze terapiyle aynı özenle sürdürülür." },
      ]),
      ctaTitle: "Online terapi sürecinizi başlatalım",
      ctaLead: "Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim.",
    },
    {
      slug: "ergen-terapisi",
      heroEyebrow: "Gelişim Dönemine Uygun Destek",
      heroTitle: "Ergen ve Genç Yetişkin Terapisi",
      heroLead: "Ergenlik ve genç yetişkinlik döneminin getirdiği kimlik, ilişki ve geleceğe yönelik kaygılarda güvenli bir görüşme alanı sunuyorum.",
      whatTitle: "Ergen ve Genç Yetişkin Terapisi Nedir?",
      whatLead: "Ergen ve genç yetişkin terapisi; kimlik arayışı, okul ve sosyal ilişkiler konularında gençlere yönelik, gelişim dönemine uygun bir çalışma biçimidir.",
      benefits: JSON.stringify([
        { title: "Yargılamayan Bir Dinleyici", text: "Genç danışan kendini ifade ederken yargılanma kaygısı taşımadan konuşabileceği bir alan bulur." },
        { title: "Gelişim Dönemine Uygun Yaklaşım", text: "Ergenlik ve genç yetişkinliğin kendine özgü dinamikleri gözetilerek çalışma planı oluşturulur." },
        { title: "Aile ile Koordineli Destek", text: "Gerekli görüldüğünde, danışanın onayıyla aile ile sınırlı ve yapılandırılmış bilgilendirme yapılabilir." },
      ]),
      issuesTitle: "Hangi Durumlarda Tercih Edilir?",
      issuesLead: "Ergen ve genç yetişkin terapisi; okul, kimlik ve ilişki güçlükleri yaşayan gençler için uygundur.",
      issues: JSON.stringify([
        "Okul ve akademik performans kaygısı",
        "Kimlik ve aidiyet arayışı",
        "Arkadaşlık ve sosyal ilişki güçlükleri",
        "Aile ile iletişim gerginlikleri",
        "Sosyal medya ve dijital kullanım dengesi",
        "Geleceğe yönelik belirsizlik ve kaygı",
      ]),
      processTitle: "Süreç Nasıl İlerler?",
      processLead: "Tanışma ve güven inşası, ortak hedef belirleme ve düzenli görüşmelerle süreç ilerler.",
      processSteps: JSON.stringify([
        { title: "Tanışma ve Güven İnşası", text: "İlk görüşmelerde genç danışanla güvenli bir ilişki kurulmasına öncelik verilir." },
        { title: "Ortak Hedef Belirleme", text: "Danışanın kendi ifade ettiği ihtiyaçlar doğrultusunda çalışma hedefleri netleştirilir." },
        { title: "Düzenli Görüşmeler", text: "Belirlenen sıklıkta seanslarla süreç takip edilir, gerektiğinde aile ile sınırlı koordinasyon sağlanır." },
      ]),
      ctaTitle: "Ergen terapisi sürecini başlatalım",
      ctaLead: "Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim.",
    },
    {
      slug: "bilissel-davranisci-terapi",
      heroEyebrow: "Düşünce ve Davranış Odaklı Çalışma",
      heroTitle: "Bilişsel Davranışçı Terapi",
      heroLead: "Bilişsel davranışçı terapide, sizi zorlayan düşünce ve davranış örüntülerini birlikte fark edip somut baş etme becerileri geliştiriyoruz.",
      whatTitle: "Bilişsel Davranışçı Terapi Nedir?",
      whatLead: "Bilişsel davranışçı terapi (BDT); düşünce, duygu ve davranış arasındaki bağlantıyı ele alan, yapılandırılmış ve hedefe yönelik bir terapi yaklaşımıdır.",
      benefits: JSON.stringify([
        { title: "Yapılandırılmış Çalışma", text: "Her seans belirli bir gündem ve hedef doğrultusunda, somut adımlarla ilerler." },
        { title: "Fark Edilebilir İlerleme", text: "Düşünce ve davranış örüntülerindeki değişim, süreç boyunca birlikte takip edilir." },
        { title: "Günlük Yaşama Taşınabilir Beceriler", text: "Seanslar arasında uygulayabileceğiniz pratik teknik ve alıştırmalarla çalışma desteklenir." },
      ]),
      issuesTitle: "Hangi Durumlarda Tercih Edilir?",
      issuesLead: "Bilişsel davranışçı terapi; somut, hedefe yönelik bir çalışma isteyen danışanlar için uygundur.",
      issues: JSON.stringify([
        "Yoğun kaygı ve kaygı bozuklukları",
        "Olumsuz ve otomatik düşünce kalıpları",
        "Panik atak ve kaçınma davranışları",
        "Özgüven ve karar verme güçlükleri",
        "Uyku ve stres yönetimi zorlukları",
        "Belirli bir hedefe yönelik kısa süreli çalışma istekleri",
      ]),
      processTitle: "Süreç Nasıl İlerler?",
      processLead: "Değerlendirme, hedef belirleme ve düzenli uygulamalı seanslarla süreç ilerler.",
      processSteps: JSON.stringify([
        { title: "Değerlendirme ve Formülasyon", text: "Yaşadığınız güçlükler, tetikleyen düşünce ve davranış örüntüleri birlikte haritalandırılır." },
        { title: "Hedef Belirleme", text: "Çalışma boyunca üzerinde ilerlenecek somut ve ölçülebilir hedefler netleştirilir." },
        { title: "Uygulamalı Seanslar", text: "Düşünce kayıtları ve davranışsal alıştırmalarla desteklenen düzenli seanslarla ilerleme sağlanır." },
      ]),
      ctaTitle: "Bilişsel davranışçı terapi sürecinizi başlatalım",
      ctaLead: "Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim.",
    },
    {
      slug: "psikodinamik-terapi",
      heroEyebrow: "Derinlemesine Anlama Odaklı Çalışma",
      heroTitle: "Psikodinamik Terapi",
      heroLead: "Psikodinamik terapide, bugünkü güçlüklerinizin kökenindeki örüntüleri birlikte keşfederek kendinize dair daha derin bir anlayış geliştiriyoruz.",
      whatTitle: "Psikodinamik Terapi Nedir?",
      whatLead: "Psikodinamik terapi; geçmiş deneyimlerin ve bilinçdışı örüntülerin bugünkü duygu, düşünce ve ilişki biçimlerini nasıl etkilediğini keşfetmeye odaklanan bir terapi yaklaşımıdır.",
      benefits: JSON.stringify([
        { title: "Derinlemesine Kendini Anlama", text: "Tekrar eden duygu ve ilişki örüntülerinizin kökenine birlikte bakma imkanı sunar." },
        { title: "Danışan Temposuna Saygılı Süreç", text: "Çalışma, danışanın kendi hızında açılmasına ve keşfetmesine alan tanıyarak ilerler." },
        { title: "Kalıcı Değişime Odaklı Çalışma", text: "Yüzeysel belirtilerin ötesinde, altta yatan dinamiklerle çalışılarak kalıcı bir değişim hedeflenir." },
      ]),
      issuesTitle: "Hangi Durumlarda Tercih Edilir?",
      issuesLead: "Psikodinamik terapi; kendini ve ilişki örüntülerini derinlemesine anlamak isteyen danışanlar için uygundur.",
      issues: JSON.stringify([
        "Tekrar eden ilişki örüntüleri",
        "Kök nedenleri anlaşılamayan duygu durum güçlükleri",
        "Erken yaşam deneyimlerinin güncel etkileri",
        "Özgüven ve kimlikle ilgili derin arayışlar",
        "Uzun süredir devam eden, nedeni belirsiz huzursuzluk",
        "Kendini daha derinlemesine tanımak isteyenler",
      ]),
      processTitle: "Süreç Nasıl İlerler?",
      processLead: "Tanışma, keşif süreci ve düzenli derinlemesine çalışmayla süreç ilerler.",
      processSteps: JSON.stringify([
        { title: "Tanışma Görüşmesi", text: "İlk görüşmede sizi dinler, gelme nedeninizi ve geçmiş yaşantılarınızı birlikte ele alırız." },
        { title: "Keşif Süreci", text: "Tekrar eden duygu ve ilişki örüntüleriniz, geçmiş deneyimlerinizle bağlantılı biçimde incelenir." },
        { title: "Düzenli Derinlemesine Çalışma", text: "Düzenli görüşmelerle kendinize dair farkındalığınız derinleşir ve kalıcı değişim desteklenir." },
      ]),
      ctaTitle: "Psikodinamik terapi sürecinizi başlatalım",
      ctaLead: "Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim.",
    },
  ]

  const aboutBioParagraphs = [
    "Klinik Psikoloji alanındaki eğitimimi ve uzmanlık deneyimimi, danışanlarıma güvenli ve etik bir çerçevede eşlik etmek için kullanıyorum.",
    "Bireysel, çift, aile ve online terapi çalışmalarımda danışan odaklı, somut ve gizliliğe bağlı bir yaklaşım benimsiyorum.",
  ]
  const aboutSpecialties = [
    { title: "Bireysel Terapi", desc: "Kaygı, tükenmişlik ve özgüven konularında kişiye özel terapi süreci." },
    { title: "Çift Terapisi", desc: "İletişim, güven ve yakınlık konularında çiftlere yönelik destek." },
    { title: "Aile Terapisi", desc: "Aile içi iletişim ve kuşaklar arası uyum çalışmaları." },
    { title: "BDT ve Psikodinamik Terapi", desc: "Bilişsel davranışçı ve psikodinamik yaklaşımlarla kişiye özel çalışma." },
  ]
  const aboutTimeline = [
    { years: "Lisans", title: "Psikoloji Lisansı", desc: "Psikoloji lisans eğitimimi tamamlayarak klinik alana yöneldim." },
    { years: "Yüksek Lisans", title: "Klinik Psikoloji", desc: "Klinik Psikoloji yüksek lisans eğitimimle uzmanlık alanımı derinleştirdim." },
    { years: "Uzmanlık", title: "BDT ve Psikodinamik Terapi Eğitimleri", desc: "Bilişsel davranışçı terapi ve psikodinamik terapi yaklaşımları üzerine ileri düzey eğitimler aldım." },
    { years: "10+", title: "Danışmanlık Deneyimi", desc: "Bireysel, çift ve aile danışmanlığında çok yıllı klinik deneyime sahibim." },
  ]
  const approachValues = [
    { title: "Gizlilik", desc: "Görüşmelerde paylaşılan her bilgi mesleki gizlilik ilkesiyle korunur." },
    { title: "Güven", desc: "Yargılamayan, güvenli bir görüşme alanı oluşturmayı önceliklendiriyorum." },
    { title: "Danışan Odaklılık", desc: "Çalışma planı, danışanın ihtiyaç ve hedefleri doğrultusunda şekillenir." },
  ]

  const tx = db.transaction(() => {
    db.prepare(`
      UPDATE site_settings SET
        name = ?, title_suffix = ?, description = ?, logo_tagline = ?, footer_tagline = ?,
        phone = ?, phone_display = ?, email = ?, address_street = ?, address_region = ?, address_city = ?,
        working_hours = ?, maps_url = ?, social_instagram = ?, social_linkedin = ?,
        theme_palette = ?, hero_image = ?, og_image = ?, logo_type = ?, logo_image = ?,
        header_cta_label = ?, header_cta_url = ?, header_menu_items = ?,
        footer_services_title = ?, footer_menu_title = ?, footer_menu_items = ?,
        footer_contact_title = ?, footer_bottom_text = ?, footer_legal_links = ?
      WHERE id = 1
    `).run(
      "Klinik Psikolog Selin Asya Bağcı",
      "Klinik Psikolog Selin Asya Bağcı",
      "Klinik Psikolog Selin Asya Bağcı; bireysel terapi, çift terapisi, aile terapisi, online terapi, ergen terapisi, bilişsel davranışçı terapi ve psikodinamik terapi alanlarında İstanbul'da ve online olarak hizmet sunar.",
      "Bireysel · Çift · Aile Terapisi",
      "İstanbul Bakırköy'de ve online olarak bireysel, çift, aile ve psikodinamik odaklı terapi hizmeti sunuyorum.",
      "+905541211301",
      "0 554 121 13 01",
      "psikologselinasya@gmail.com",
      "Zuhuratbaba Mah. Hüdaverdi Sok. No:45 Daire:2",
      "Bakırköy",
      "İstanbul",
      "Hafta içi 09:00 - 18:00, randevu ile Cumartesi görüşme",
      "https://www.google.com/maps/search/?api=query&query=Klinik+Psikolog+Selin+Asya+Ba%C4%9Fc%C4%B1",
      "",
      "",
      defaultThemePaletteId,
      heroImage,
      heroImage,
      "text",
      "",
      defaultHeaderCtaLabel,
      defaultHeaderCtaUrl,
      DEFAULT_HEADER_MENU_ITEMS_JSON,
      defaultFooterServicesTitle,
      defaultFooterMenuTitle,
      DEFAULT_FOOTER_MENU_ITEMS_JSON,
      defaultFooterContactTitle,
      "Bakırköy / İstanbul'da yüz yüze, Türkiye ve yurt dışından online görüşme imkanı.",
      DEFAULT_FOOTER_LEGAL_LINKS_JSON,
    )

    db.prepare(`
      UPDATE about_page SET
        hero_eyebrow = ?, hero_title = ?, hero_lead = ?, hero_bg_image = ?, photo_url = ?,
        bio_title = ?, bio_paragraphs = ?, specialties = ?, timeline = ?,
        approach_title = ?, approach_lead = ?, approach_values = ?,
        cta_title = ?, cta_text = ?, cta_bg_image = ?, cta_primary_label = ?, cta_primary_url = ?,
        cta_secondary_label = ?, cta_secondary_url = ?
      WHERE id = 1
    `).run(
      "Klinik Psikolog",
      "Hakkımda",
      "Klinik Psikolog olarak İstanbul'da ve online olarak bireysel, çift ve aile terapisi alanlarında danışanlarıma eşlik ediyorum.",
      heroImage,
      aboutImage,
      "Selin Asya Bağcı",
      JSON.stringify(aboutBioParagraphs),
      JSON.stringify(aboutSpecialties),
      JSON.stringify(aboutTimeline),
      "Çalışma Prensiplerim",
      "Gizlilik, güven ve danışan odaklı bir yaklaşımı, etik ilkelere bağlı kalarak her görüşmede önceliklendiriyorum.",
      JSON.stringify(approachValues),
      "Randevu almak ister misiniz?",
      "Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim.",
      heroImage,
      "Randevu Al",
      "/iletisim",
      "Bireysel Terapi",
      "/bireysel-terapi",
    )

    db.prepare("DELETE FROM blog_posts").run()
    const insertBlog = db.prepare(`
      INSERT INTO blog_posts (slug, title, excerpt, content, category, tags, quote, read_time, date, image, featured, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    insertBlog.run(
      "kaygi-bozuklugu-nedir",
      "Kaygı Bozukluğu Nedir?",
      "Kaygı; günlük yaşamı zorlaştırmaya başladığında fark edilmesi ve üzerinde çalışılması gereken bir deneyimdir.",
      "<p>Kaygı, belirsizlik karşısında bedenin ve zihnin verdiği doğal bir tepkidir; ancak sıklığı ve şiddeti günlük yaşamı etkilemeye başladığında dikkat gerektirir.</p><p>Kaygı bozukluğunda kişi, gerçek bir tehdit olmasa dahi sürekli bir endişe ve tetikte olma hali yaşayabilir; bu durum uyku, iş ve ilişkilerde zorluklara yol açabilir.</p><p>Terapi sürecinde kaygıyı tetikleyen düşünce kalıpları fark edilir, bedensel belirtilerle baş etme becerileri geliştirilir ve kişi kendi kaygısını yönetme konusunda daha güçlü hale gelir.</p>",
      "Kaygı",
      "kaygı,stres,bireysel terapi",
      "Kaygı, fark edildiğinde ve üzerinde çalışıldığında yönetilebilir bir deneyimdir.",
      "6 dk",
      "12 Ocak 2026",
      blogImage1,
      1,
      1,
    )
    insertBlog.run(
      "terapide-sik-kullanilan-kavramlar",
      "Terapide Sık Kullanılan Kavramlar",
      "Bilişsel çarpıtma, sınır koyma, duygu düzenleme gibi terapi sürecinde sık duyulan kavramları bir araya getirdik.",
      "<p>Terapi sürecinde sıkça karşılaşılan kavramlardan biri bilişsel çarpıtmadır; gerçekliği olduğundan farklı değerlendirmemize yol açan otomatik düşünce kalıplarını ifade eder.</p><p>Sınır koyma, kişinin kendi ihtiyaç ve değerlerini koruyarak ilişkilerinde sağlıklı bir denge kurmasını; duygu düzenleme ise yoğun duygularla baş etme becerisini tanımlar.</p><p>Bu kavramları tanımak, terapi sürecinde kendi deneyiminizi daha net ifade etmenize ve terapistinizle ortak bir dil kurmanıza yardımcı olur.</p>",
      "Terimler",
      "bilişsel çarpıtma,sınır koyma,duygu düzenleme",
      "Doğru terminoloji, terapi sürecinde kendi deneyiminizi daha net ifade etmenizi sağlar.",
      "8 dk",
      "3 Şubat 2026",
      blogImage2,
      0,
      1,
    )
    insertBlog.run(
      "online-terapi-nasil-isler",
      "Online Terapi Nasıl İşler?",
      "Online terapinin yüz yüze görüşmeden farkları ve sürecin nasıl işlediğini merak edenler için bir rehber.",
      "<p>Online terapi, güvenli bir görüntülü görüşme platformu üzerinden, yüz yüze seanslarla aynı gizlilik ve etik ilkelere bağlı kalınarak yürütülür.</p><p>Sürecin işleyişi; randevu planlama, ön görüşme ve düzenli seanslar açısından yüz yüze terapiyle büyük ölçüde benzerdir, fark yalnızca görüşmenin yapıldığı ortamdır.</p><p>Düzenli bir internet bağlantısı ve mahremiyetinizi koruyabileceğiniz sakin bir ortam, online terapi sürecinden en iyi şekilde faydalanmanız için yeterlidir.</p>",
      "Online Terapi",
      "online terapi,görüntülü görüşme,uzaktan danışmanlık",
      "Online terapi, yüz yüze seanslarla aynı özen ve gizlilik ilkesiyle yürütülür.",
      "5 dk",
      "20 Şubat 2026",
      blogImage3,
      0,
      1,
    )

    db.prepare("DELETE FROM faq_items").run()
    db.prepare("DELETE FROM faq_groups").run()
    const insertGroup = db.prepare("INSERT INTO faq_groups (category, sort_order) VALUES (?, ?)")
    const insertItem = db.prepare("INSERT INTO faq_items (group_id, question, answer, sort_order) VALUES (?, ?, ?, ?)")

    const fg1 = Number((insertGroup.run("Hizmetlerim", 1) as any).lastInsertRowid)
    insertItem.run(fg1, "Hangi terapi hizmetlerini sunuyorsunuz?", "Bireysel terapi, çift terapisi, aile terapisi, online terapi, ergen terapisi, bilişsel davranışçı terapi ve psikodinamik terapi alanlarında hizmet veriyorum.", 1)
    insertItem.run(fg1, "Çift ve aile terapisi birlikte mi yapılıyor?", "Evet. Çift veya aile üyeleriyle birlikte, ihtiyaca göre bazı görüşmeler bireysel olarak da planlanabilir.", 2)
    insertItem.run(fg1, "Online terapi de sunuyor musunuz?", "Evet. Güvenli görüntülü görüşme üzerinden, yüz yüze seanslarla aynı özenle online terapi hizmeti sunuyorum.", 3)

    const fg2 = Number((insertGroup.run("Randevu ve Seans", 2) as any).lastInsertRowid)
    insertItem.run(fg2, "Randevu süreci nasıl planlanıyor?", "İletişim formu veya telefon üzerinden talebinizi ilettikten sonra size uygun randevu saati birlikte belirlenir.", 1)
    insertItem.run(fg2, "Bir seans ne kadar sürüyor?", "Bireysel seanslar ortalama 50 dakika, çift ve aile seansları ise 60-90 dakika arasında sürebilir.", 2)
    insertItem.run(fg2, "Cumartesi günleri görüşme yapıyor musunuz?", "Evet. Hafta içi düzenli saatlerin yanı sıra randevu ile Cumartesi günleri de görüşme planlanabilir.", 3)

    const fg3 = Number((insertGroup.run("Gizlilik ve Güven", 3) as any).lastInsertRowid)
    insertItem.run(fg3, "Görüşmelerim gizli tutuluyor mu?", "Evet. Tüm görüşmeler mesleki gizlilik ilkesi ve etik kurallar çerçevesinde korunur.", 1)
    insertItem.run(fg3, "Online seanslar da güvenli mi?", "Evet. Online seanslar da yüz yüze görüşmelerle aynı gizlilik ve etik ilkelere tabidir.", 2)
    insertItem.run(fg3, "İlk görüşmede ne konuşulur?", "İlk görüşmede sizi dinler, gelme nedeninizi ve beklentilerinizi birlikte netleştiririz.", 3)

    const fg4 = Number((insertGroup.run("Randevu ve İletişim", 4) as any).lastInsertRowid)
    insertItem.run(fg4, "Randevu almak için hangi bilgiler gerekli?", "Adınız, iletişim bilginiz ve kısa bir görüşme talebi randevu planlamak için yeterlidir.", 1)
    insertItem.run(fg4, "Görüşme odanız nerede?", "Görüşme odam Zuhuratbaba Mah. Hüdaverdi Sok. No:45 Daire:2 Bakırköy / İstanbul adresindedir.", 2)
    insertItem.run(fg4, "Şehir dışından randevu alabilir miyim?", "Evet. Şehir dışında veya yurt dışında yaşıyorsanız online terapi ile düzenli görüşme imkanı sunuyorum.", 3)

    db.prepare("DELETE FROM legal_pages").run()
    const insertLegal = db.prepare("INSERT INTO legal_pages (slug, title, content) VALUES (?, ?, ?)")
    insertLegal.run("gizlilik", "Gizlilik Politikası", "# Gizlilik Politikası\n\nBu politika, iletişim ve randevu süreçlerinde tarafıma iletilen bilgilerin nasıl işlendiğini açıklar.\n\n## Toplanan Veriler\n\nAd, telefon, e-posta ve mesaj içeriği işlenebilir.\n\n## Kullanım Amacı\n\nBu veriler yalnızca randevu sürecini yönetmek ve sizinle iletişime geçmek amacıyla kullanılır.\n\n## İletişim\n\nSorularınız için iletişim sayfasındaki kanallar üzerinden bana ulaşabilirsiniz.")
    insertLegal.run("kullanim-kosullari", "Kullanım Koşulları", "# Kullanım Koşulları\n\nBu web sitesini kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.\n\n## İçerik\n\nSitedeki bilgiler genel bilgilendirme amaçlıdır ve tıbbi/psikiyatrik tanı veya tedavi yerine geçmez.\n\n## Sorumluluk\n\nRandevu ve görüşme koşulları, görüşme öncesinde birlikte netleştirilir.\n\n## Telif\n\nSitedeki tüm içerikler izinsiz kopyalanamaz.")
    insertLegal.run("kvkk", "KVKK Aydınlatma Metni", "# KVKK Aydınlatma Metni\n\n6698 sayılı Kanun kapsamında, iletişim ve randevu sürecinde ilettiğiniz kişisel veriler işlenebilir.\n\n## Veri Sorumlusu\n\nKlinik Psikolog Selin Asya Bağcı, randevu ve iletişim süreçlerini yürütmek amacıyla verilerinizi işleyebilir.\n\n## İşlenen Veriler\n\nAd-soyad, telefon, e-posta ve mesaj içeriği.\n\n## Amaç\n\nRandevu oluşturma ve iletişim süreçlerini yürütmek.\n\n## Haklarınız\n\nKVKK kapsamındaki erişim, düzeltme ve silme taleplerinizi iletişim kanallarım üzerinden iletebilirsiniz.")

    db.prepare(`
      UPDATE contact_page SET
        hero_eyebrow = ?, hero_title = ?, hero_lead = ?, hero_bg_image = ?,
        info_title = ?, info_lead = ?, form_title = ?, form_lead = ?,
        cta_title = ?, cta_lead = ?, cta_bg_image = ?, cta_primary_label = ?, cta_primary_url = ?,
        cta_secondary_label = ?, cta_secondary_url = ?
      WHERE id = 1
    `).run(
      "İletişim",
      "İletişim ve Randevu Talebi",
      "İletişim bilgilerim üzerinden bana ulaşabilir, randevu formu ile görüşme talebinizi iletebilirsiniz.",
      heroImage,
      "İletişim Bilgileri",
      "Telefon: 0 554 121 13 01 · Görüşme Odası: Zuhuratbaba Mah. Hüdaverdi Sok. No:45 Daire:2 Bakırköy / İstanbul",
      "Randevu Talebi",
      "Bireysel, çift, aile veya online terapi talebiniz için temel bilgileri paylaşın, size geri dönelim.",
      "Alternatif Ulaşım",
      "Form yerine telefon veya e-posta üzerinden de doğrudan ulaşabilirsiniz.",
      heroImage,
      "E-posta Gönder",
      "mailto:psikologselinasya@gmail.com",
      "Telefon Et",
      "tel:+905541211301",
    )

    db.prepare(`
      UPDATE blog_page SET
        hero_eyebrow = ?, hero_title = ?, hero_lead = ?, hero_bg_image = ?
      WHERE id = 1
    `).run(
      "Psikoloji Yazıları",
      "Blog",
      "Kaygı, ilişkiler ve terapi süreci üzerine paylaştığım temel içerikleri burada bulabilirsiniz.",
      heroImage,
    )

    db.prepare(`
      UPDATE sss_page SET
        hero_eyebrow = ?, hero_title = ?, hero_lead = ?, hero_bg_image = ?,
        cta_title = ?, cta_lead = ?, cta_bg_image = ?, cta_primary_label = ?, cta_primary_url = ?,
        cta_secondary_label = ?, cta_secondary_url = ?
      WHERE id = 1
    `).run(
      "Merak Edilenler",
      "Sık Sorulan Sorular",
      "Randevu süreci, seanslar ve online terapi hakkında en çok sorulan soruları burada bulabilirsiniz.",
      heroImage,
      "Cevabını bulamadığınız bir sorunuz mu var?",
      "Randevu veya görüşme detayları için benimle doğrudan iletişime geçebilirsiniz.",
      heroImage,
      "İletişime Geçin",
      "/iletisim",
      "Randevu Alın",
      "/iletisim",
    )

    db.prepare("DELETE FROM service_pages").run()
    const insertService = db.prepare(`
      INSERT INTO service_pages (
        slug, hero_eyebrow, hero_title, hero_lead, what_title, what_lead, benefits,
        issues_title, issues_lead, issues, process_title, process_lead, process_steps,
        cta_title, cta_lead, cta_bg_image, cta_primary_label, cta_primary_url, cta_secondary_label, cta_secondary_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const service of services) {
      insertService.run(
        service.slug,
        service.heroEyebrow,
        service.heroTitle,
        service.heroLead,
        service.whatTitle,
        service.whatLead,
        service.benefits,
        service.issuesTitle,
        service.issuesLead,
        service.issues,
        service.processTitle,
        service.processLead,
        service.processSteps,
        service.ctaTitle,
        service.ctaLead,
        heroImage,
        "Randevu Al",
        "/iletisim",
        "Hakkımda",
        "/hakkimda",
      )
    }

    db.prepare(`
      UPDATE services_page SET
        hero_eyebrow = ?, hero_title = ?, hero_lead = ?, hero_bg_image = ?,
        intro_title = ?, intro_lead = ?, cta_title = ?, cta_lead = ?, cta_bg_image = ?,
        cta_primary_label = ?, cta_primary_url = ?, cta_secondary_label = ?, cta_secondary_url = ?
      WHERE id = 1
    `).run(
      "Hizmetlerim",
      "Terapi Hizmetlerim",
      "Bireysel, çift, aile, online, ergen, bilişsel davranışçı ve psikodinamik terapide ihtiyacınıza göre doğru çalışma modelini planlıyoruz.",
      heroImage,
      "Nasıl Yardımcı Olabilirim?",
      "İhtiyacınız ve beklentileriniz doğrultusunda size uygun terapi yaklaşımını birlikte oluşturuyoruz.",
      "Randevu almak ister misiniz?",
      "Görüşme talebinizi paylaşın, size uygun randevu saatini birlikte netleştirelim.",
      heroImage,
      "Randevu Al",
      "/iletisim",
      "İletişime Geçin",
      "/iletisim",
    )

    db.prepare(`
      UPDATE homepage SET
        hero_eyebrow = ?, hero_title = ?, hero_description = ?, hero_badge1 = ?, hero_badge2 = ?, hero_badge3 = ?,
        hero_bg_image = ?, hero_primary_label = ?, hero_primary_url = ?, hero_secondary_label = ?, hero_secondary_url = ?,
        accreditations = ?, about_eyebrow = ?, about_title = ?, about_role = ?, about_paragraph1 = ?, about_paragraph2 = ?, about_photo = ?,
        services_eyebrow = ?, services_title = ?, services_description = ?, services_bg_image = ?,
        process_eyebrow = ?, process_title = ?, process_description = ?, process_steps = ?,
        testimonials_eyebrow = ?, testimonials_title = ?, testimonials_description = ?,
        cta_title = ?, cta_description = ?, cta_bg_image = ?, cta_primary_label = ?, cta_primary_url = ?, cta_secondary_label = ?, cta_secondary_url = ?,
        services_items = ?
      WHERE id = 1
    `).run(
      "Klinik Psikolog Selin Asya Bağcı",
      "Kendinize dair yolculuğunuzda güvenli bir destek",
      "Bireysel, çift, aile ve online terapi ile kaygı, ilişki ve yaşam geçişi süreçlerinizde yanınızdayım.",
      "Gizlilik ilkesine bağlı görüşmeler",
      "Yüz yüze ve online seans seçeneği",
      "Klinik Psikoloji uzmanlığı",
      heroImage,
      "Randevu Al",
      "/iletisim",
      "Hakkımda",
      "/hakkimda",
      JSON.stringify([
        { icon: "shield", title: "Gizlilik ilkesine bağlı görüşmeler", description: "Etik ilkelere bağlı, güvenli görüşme alanı" },
        { icon: "video", title: "Yüz yüze ve online seans seçeneği", description: "İhtiyacınıza göre esnek görüşme biçimi" },
        { icon: "brain", title: "Klinik Psikoloji uzmanlığı", description: "Danışan odaklı, somut çalışma yaklaşımı" },
      ]),
      "Selin Asya Bağcı",
      "Klinik Psikoloji alanında uzman destek",
      "Bireysel, Çift, Aile ve Online Terapi",
      "Danışanlarıma güvenli, gizlilik ilkesine bağlı ve etik bir çerçevede eşlik etmeyi amaçlıyorum.",
      "İstanbul Bakırköy'deki görüşme odamda ve online olarak bireysel, çift, aile, ergen ve psikodinamik odaklı terapi hizmeti sunuyorum.",
      aboutImage,
      "Hizmetlerim",
      "İhtiyacınıza uygun terapi yaklaşımı",
      "Bireysel, çift, aile, online, ergen, bilişsel davranışçı ve psikodinamik terapide ihtiyacınıza uygun çalışma modelini birlikte belirliyoruz.",
      aboutImage,
      "Nasıl Çalışıyorum?",
      "İlk görüşmeden sürece giden yol",
      "Tanışma görüşmesi, değerlendirme ve düzenli seanslarla size özel bir çalışma planı oluşturuyoruz.",
      JSON.stringify([
        { number: "1", title: "Tanışma Görüşmesi", description: "İlk görüşmede sizi dinler, gelme nedeninizi ve beklentilerinizi birlikte netleştiririz." },
        { number: "2", title: "Değerlendirme ve Plan", description: "Yaşadığınız güçlükler çerçevesinde uygun terapi yaklaşımı ve görüşme sıklığı belirlenir." },
        { number: "3", title: "Düzenli Seanslar", description: "Belirlenen plan doğrultusunda düzenli görüşmelerle süreç takip edilir ve ilerleme birlikte değerlendirilir." },
      ]),
      "Danışan Deneyimleri",
      "Neden Selin Asya Bağcı?",
      "Gizlilik, güven ve danışan odaklı bir yaklaşımla her görüşmede yanınızda olmayı önceliklendiriyorum.",
      "Randevu almak ister misiniz?",
      "Görüşme talebinizi iletin, size en uygun randevu saatini birlikte belirleyelim.",
      heroImage,
      "Randevu Al",
      "/iletisim",
      "Bireysel Terapi",
      "/bireysel-terapi",
      JSON.stringify(services.map((service) => ({
        slug: service.slug,
        title: service.heroTitle,
        description: service.heroLead,
        icon: resolveHomepageServiceIcon("", service.slug),
      }))),
    )
  })

  tx()
}
