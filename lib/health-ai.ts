import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from './supabase'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function askAboutHealth(question: string): Promise<string> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: summaries } = await supabaseAdmin
    .from('daily_summaries')
    .select('*')
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })

  if (!summaries || summaries.length === 0) {
    return "I don't have any health data yet. Make sure your Apple Health data has been synced."
  }

  const context = summaries.map(d =>
    `${d.date}: steps=${d.steps ?? 'n/a'}, ` +
    `resting_hr=${d.resting_hr ?? 'n/a'}, ` +
    `hrv=${d.hrv ?? 'n/a'}, ` +
    `sleep=${d.sleep_hours ? d.sleep_hours + 'h' : 'n/a'}, ` +
    `active_cal=${d.active_cal ?? 'n/a'}`
  ).join('\n')

  const response = await claude.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are a personal health analyst with access to the user's Apple Health data 
for the past 30 days. Give specific, actionable insights — reference actual numbers and dates 
from the data. Be direct and conversational. Don't hedge excessively.

Here is their recent data:
${context}`,
    messages: [{ role: 'user', content: question }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}