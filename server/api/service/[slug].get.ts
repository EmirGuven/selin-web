// GET /api/service/[slug] — public
import { getDb } from "../../utils/db"
import { mapServiceRow } from "../../utils/services"

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const db   = getDb()
  const row  = db.prepare("SELECT * FROM service_pages WHERE slug = ?").get(slug) as any
  if (!row) throw createError({ statusCode: 404, message: "Sayfa bulunamadı." })
  return mapServiceRow(row)
})
