import type { SupabaseClient } from '@supabase/supabase-js'
import type { Subject } from '$lib/types'

type SubjectInput = Omit<Subject, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export async function getSubjects(supabase: SupabaseClient): Promise<Subject[]> {
    const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name')

    if (error) throw error
    return data
}

export async function createSubject(supabase: SupabaseClient, input: SubjectInput): Promise<Subject> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Niet ingelogd')

    const { data, error } = await supabase
        .from('subjects')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateSubject(supabase: SupabaseClient, id: string, input: Partial<SubjectInput>): Promise<Subject> {
    const { data, error } = await supabase
        .from('subjects')
        .update(input)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteSubject(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)

    if (error) throw error
}