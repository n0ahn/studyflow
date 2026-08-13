import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserSettings } from '$lib/types'
import { runPlannerTrigger } from '$lib/planner/trigger'


export async function getSettings(supabase: SupabaseClient): Promise<UserSettings | null> {
    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .single()

    if (error && error.code === 'PGRST116') return null
    if (error) throw error
    return data
}

export async function saveSettings(
    supabase: SupabaseClient,
    settings: Partial<UserSettings>
): Promise<UserSettings> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Niet ingelogd')

    const { data, error } = await supabase
        .from('user_settings')
        .upsert(
            { ...settings, user_id: user.id },
            { onConflict: 'user_id' }
        )
        .select()
        .single()

    if (error) throw error

    await runPlannerTrigger(supabase)

    return data
}