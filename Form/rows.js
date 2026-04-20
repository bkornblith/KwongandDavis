import { supabase } from './lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  // Simple secret protection — set ADMIN_SECRET in Vercel env vars
  // Access via: /api/rows?secret=YOUR_ADMIN_SECRET
  if (req.query.secret !== process.env.ADMIN_SECRET)
    return res.status(401).json({ error: 'Unauthorised' })

  const { data, error } = await supabase
    .from('intake')
    .select('id, created_at, first_name, last_name, email, phone, situation, has_deadline, deadline_date, is_urgent, referral')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Could not fetch rows' })
  }

  return res.status(200).json({ rows: data })
}
