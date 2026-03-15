'use client'
import { useState } from 'react'
import { queryHealth } from '@/app/actions'

const SUGGESTED = [
  'How has my sleep been this month?',
  'What are my step count trends?',
  'How does my HRV look?',
  'When did I have my best recovery week?',
]

export default function AiChat() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [loading, setLoading] = useState(false)

  async function submit(q: string) {
    if (!q.trim()) return
    setMessages(prev => [...prev, { role: 'user', text: q }])
    setQuestion('')
    setLoading(true)
    const answer = await queryHealth(q)
    setMessages(prev => [...prev, { role: 'ai', text: answer }])
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h2 className="text-base font-medium text-gray-700 mb-4">Ask about your health</h2>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => submit(s)}
              className="text-sm px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200
                         text-gray-600 hover:bg-gray-100 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed
              ${m.role === 'user'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-50 border border-gray-100 text-gray-700'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit(question)}
          placeholder="Ask anything about your health data..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2.5
                     focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <button onClick={() => submit(question)}
          className="px-4 py-2.5 bg-violet-600 text-white text-sm rounded-lg
                     hover:bg-violet-700 transition-colors disabled:opacity-50"
          disabled={loading || !question.trim()}>
          Ask
        </button>
      </div>
    </div>
  )
}