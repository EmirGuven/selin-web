import { getDb } from "../utils/db"
import { mapServiceSummaryRow } from "../utils/services"

export default defineEventHandler(() => {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, slug, hero_eyebrow, hero_title, hero_lead, what_lead, hero_bg_image
    FROM service_pages
    ORDER BY id ASC
  `).all() as any[]

  return rows.map(mapServiceSummaryRow)
})
