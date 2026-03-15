'use server'
import { askAboutHealth } from '@/lib/health-ai'

export async function queryHealth(question: string) {
  return askAboutHealth(question)
}