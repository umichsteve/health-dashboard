'use client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend
} from 'recharts'

export default function HealthChart({ data }: { data: any[] }) {
  const formatted = data.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
      <h2 className="text-base font-medium text-gray-700 mb-4">Last 30 days</h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="steps" orientation="left" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="hr" orientation="right" tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="steps" type="monotone" dataKey="steps"
            stroke="#7F77DD" strokeWidth={2} dot={false} name="Steps" />
          <Line yAxisId="hr" type="monotone" dataKey="resting_hr"
            stroke="#D85A30" strokeWidth={2} dot={false} name="Resting HR" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}