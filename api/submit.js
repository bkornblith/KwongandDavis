import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const p = req.body

  if (!p.firstName) return res.status(400).json({ error: 'First name is required' })
  if (!p.lastName)  return res.status(400).json({ error: 'Last name is required' })
  if (!p.email)     return res.status(400).json({ error: 'Email is required' })
  if (!p.situation) return res.status(400).json({ error: 'Please describe your situation' })

  let isUrgent = false
  if (p.hasDeadline === 'yes' && p.deadlineDate) {
    const diff = (new Date(p.deadlineDate) - new Date()) / 86400000
    isUrgent = diff >= 0 && diff <= 14
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  )

  const { data: row, error } = await supabase
    .from('intake')
    .insert({
      first_name:    p.firstName,
      last_name:     p.lastName,
      email:         p.email,
      phone:         p.phone || null,
      situation:     p.situation,
      has_deadline:  p.hasDeadline || null,
      deadline_date: p.deadlineDate || null,
      is_urgent:     isUrgent,
      referral:      p.referral || null,
      raw_payload:   p,
    })
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    return res.status(500).json({ error: 'Could not save your submission' })
  }

  return res.status(200).json({ ok: true, id: row.id, urgent: isUrgent })
}