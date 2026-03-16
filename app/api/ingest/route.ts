import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-api-secret')
  if (secret !== process.env.INGEST_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const metrics = body?.data?.metrics

  if (!metrics || !Array.isArray(metrics)) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const rows = metrics.flatMap((metric: any) =>
    (metric.data ?? []).map((point: any) => ({
      type: metric.name,
      value: point.qty ?? point.value ?? 0,
      unit: metric.units ?? null,
      recorded_at: new Date(point.date).toISOString(),,
    }))
  )

  if (rows.length === 0) {
    return Response.json({ inserted: 0 })
  }

  const { error, count } = await supabaseAdmin
    .from('health_metrics')
    .upsert(rows, { onConflict: 'type,recorded_at', count: 'exact' })

  if (error) {
    console.error('Supabase upsert error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  await rebuildDailySummary(new Date().toISOString().split('T')[0])

  return Response.json({ inserted: count })
}

async function rebuildDailySummary(date: string) {
  const start = `${date}T00:00:00Z`
  const end = `${date}T23:59:59Z`

  const { data } = await supabaseAdmin
    .from('health_metrics')
    .select('type, value')
    .gte('recorded_at', start)
    .lte('recorded_at', end)

  if (!data || data.length === 0) return

  const avg = (type: string) => {
    const vals = data.filter(r => r.type === type).map(r => r.value)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }

  const sum = (type: string) => {
    const vals = data.filter(r => r.type === type).map(r => r.value)
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null
  }

  await supabaseAdmin.from('daily_summaries').upsert({
    date,
    steps: sum('step_count'),
    active_cal: sum('active_energy_burned'),
    resting_hr: avg('resting_heart_rate'),
    hrv: avg('heart_rate_variability_sdnn'),
    sleep_hours: sum('sleep_analysis'),
  }, { onConflict: 'date' })
}