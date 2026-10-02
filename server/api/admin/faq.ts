// GET+PUT /api/admin/faq — SSS yönetimi
import { getDb } from "../../utils/db"
import { verifyToken, parseCookies } from "../../utils/auth"

async function checkAuth(event: any) {
  const cookies = parseCookies(getHeader(event, "cookie") || null)
  const token = cookies.admin_token
  if (!token) throw createError({ statusCode: 401, message: "Yetkisiz erişim." })
  const payload = await verifyToken(token)
  if (!payload) throw createError({ statusCode: 401, message: "Oturum süresi doldu." })
}

export default defineEventHandler(async (event) => {
  await checkAuth(event)
  const db = getDb()

  if (event.method === "GET") {
    const groups = db.prepare("SELECT * FROM faq_groups ORDER BY sort_order, id").all() as any[]
    const items  = db.prepare("SELECT * FROM faq_items ORDER BY group_id, sort_order, id").all() as any[]
    return groups.map((g) => ({
      id: g.id,
      category: g.category,
      sort_order: g.sort_order,
      items: items
        .filter((i) => i.group_id === g.id)
        .map((i) => ({ id: i.id, question: i.question, answer: i.answer, sort_order: i.sort_order }))
    }))
  }

  // PUT — tüm yapıyı sıfırdan yazar
  if (event.method === "PUT") {
    const body = await readBody(event) as Array<{
      id?: number
      category: string
      sort_order?: number
      items: Array<{ id?: number; question: string; answer: string; sort_order?: number }>
    }>

    const deleteItems  = db.prepare("DELETE FROM faq_items")
    const deleteGroups = db.prepare("DELETE FROM faq_groups")
    const insertGroup  = db.prepare("INSERT INTO faq_groups (id, category, sort_order) VALUES (?, ?, ?)")
    const insertItem   = db.prepare("INSERT INTO faq_items (group_id, question, answer, sort_order) VALUES (?, ?, ?, ?)")

    const tx = db.transaction(() => {
      deleteItems.run()
      deleteGroups.run()
      body.forEach((g, gi) => {
        const groupId = g.id ?? (gi + 1)
        insertGroup.run(groupId, g.category || '', g.sort_order ?? gi)
        ;(g.items || []).forEach((item, ii) => {
          insertItem.run(groupId, item.question || '', item.answer || '', item.sort_order ?? ii)
        })
      })
    })
    tx()
    return { success: true }
  }
})
