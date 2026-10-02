import { getDb } from "../utils/db"

export default defineEventHandler(() => {
  const db = getDb()

  const serviceRows = db.prepare("SELECT slug FROM service_pages WHERE TRIM(COALESCE(slug, '')) != '' ORDER BY id ASC").all() as Array<{ slug: string }>
  const blogRows = db.prepare("SELECT slug FROM blog_posts WHERE published = 1 AND TRIM(COALESCE(slug, '')) != '' ORDER BY date DESC").all() as Array<{ slug: string }>

  const urls = new Set<string>()

  for (const row of serviceRows) {
    urls.add(`/${row.slug}`)
  }

  for (const row of blogRows) {
    urls.add(`/blog/${row.slug}`)
  }

  return [...urls]
})