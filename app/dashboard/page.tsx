import { supabaseAdmin } from '@/lib/supabase'
import HealthChart from '@/components/HealthChart'
import AiChat from '@/components/AiChat'

export default async function DashboardPage() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: summaries } = await supabaseAdmin
    .from('daily_summaries')
    .select('*')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  const latest = summaries?.[summaries.length - 1]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Health dashboard</h1>
        <p className="text-sm text-gray-400 mb-8">Powered by Apple Health + Claude</p>

        {latest && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Steps', value: latest.steps?.toLocaleString() ?? '—' },
              { label: 'Resting HR', value: latest.resting_hr ? `${Math.round(latest.resting_hr)} bpm` : '—' },
              { label: 'HRV', value: latest.hrv ? `${Math.round(latest.hrv)} ms` : '—' },
              { label: 'Sleep', value: latest.sleep_hours ? `${latest.sleep_hours.toFixed(1)}h` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-xl font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        )}

        <HealthChart data={summaries ?? []} />
        <AiChat />
      </div>
    </div>
  )
}