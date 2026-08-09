import { getSessions, markMissedSessions } from '$lib/services/sessions'
import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = async ({ locals }) => {
    const today = new Date()
    const from = today.toISOString().split('T')[0]
    const to = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

    await markMissedSessions(locals.supabase)

    const sessions = await getSessions(locals.supabase, from, to)
    return { sessions, from, to }
}