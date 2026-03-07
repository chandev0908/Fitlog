import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWeeklySummary } from '@/lib/ai/gemini'

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { weekStart: fmt(monday), weekEnd: fmt(sunday) }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { weekStart, weekEnd } = getWeekRange()

    const [logsRes, prsRes] = await Promise.all([
      supabase
        .from('logs')
        .select('log_date, type, comment')
        .eq('user_id', user.id)
        .gte('log_date', weekStart)
        .lte('log_date', weekEnd)
        .order('log_date', { ascending: true }),

      supabase
        .from('personal_records')
        .select('exercise, value, unit, recorded_at')
        .eq('user_id', user.id)
        .gte('recorded_at', weekStart)
        .lte('recorded_at', weekEnd),
    ])

    const result = await generateWeeklySummary({
      logs: logsRes.data ?? [],
      prs: prsRes.data ?? [],
    })

    return NextResponse.json(result)

  } catch (err: unknown) {
    console.error('=== ROUTE CRASH ===', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}