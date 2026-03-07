import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { suggestLogComment } from '@/lib/ai/gemini'
import { z } from 'zod'

const RequestSchema = z.object({
  logType: z.enum(['train', 'rest', 'active_recovery']),
  prs: z.array(z.object({
    exercise: z.string(),
    value: z.number(),
    unit: z.string(),
  })).default([]),
  existingComment: z.string().optional(),
})

export async function POST(req: NextRequest) {
  // Auth check — never call AI for unauthenticated users
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const result = await suggestLogComment(parsed.data)

  // Always return 200 — let the client decide what to do with success/failure
  return NextResponse.json(result)
}