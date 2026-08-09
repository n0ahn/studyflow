import type { SupabaseClient } from '@supabase/supabase-js'
import type { StudySession, StudySessionWithDetails } from '$lib/types'
import type { PlannedSession } from '$lib/planner/types'

export async function getSessions(
    supabase: SupabaseClient,
    from: string,
    to: string
): Promise<StudySessionWithDetails[]> {
    const { data, error } = await supabase
        .from('study_sessions')
        .select('*, subject:subjects(*), exam:exams(*), task:tasks(*)')
        .gte('date', from)
        .lte('date', to)
        .order('date')

    if (error) throw error
    return data
}

export async function getSessionById(
    supabase: SupabaseClient,
    id: string
): Promise<StudySessionWithDetails | null> {
    const { data, error } = await supabase
        .from('study_sessions')
        .select('*, subject:subjects(*), exam:exams(*), task:tasks(*)')
        .eq('id', id)
        .single()

    if (error && error.code === 'PGRST116') return null
    if (error) throw error
    return data
}

export async function createSessions(
    supabase: SupabaseClient,
    sessions: PlannedSession[]
): Promise<void> {
    if (sessions.length === 0) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Niet ingelogd')

    const rows = sessions.map(session => ({
        ...session,
        user_id: user.id,
        status: 'planned'
    }))

    const { error } = await supabase
        .from('study_sessions')
        .insert(rows)

    if (error) throw error
}

export async function updateSession(
    supabase: SupabaseClient,
    id: string,
    data: Partial<StudySession>
): Promise<StudySession> {
    const { data: updated, error } = await supabase
        .from('study_sessions')
        .update(data)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return updated
}

export async function deleteSession(
    supabase: SupabaseClient,
    id: string
): Promise<void> {
    const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function markMissedSessions(
    supabase: SupabaseClient
): Promise<void> {
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
        .from('study_sessions')
        .update({ status: 'missed' })
        .eq('status', 'planned')
        .lt('date', today)

    if (error) throw error
}

export async function deleteFuturePlannedSessions(
    supabase: SupabaseClient
): Promise<void> {
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('status', 'planned')
        .gte('date', today)

    if (error) throw error
}