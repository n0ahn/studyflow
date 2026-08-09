import type { SupabaseClient } from '@supabase/supabase-js'
import type { Task, TaskWithSubject } from '$lib/types'
import { runPlannerTrigger } from '$lib/planner/trigger'


type TaskInput = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export async function getTasks(supabase: SupabaseClient): Promise<TaskWithSubject[]> {
    const { data, error } = await supabase
        .from('tasks')
        .select('*, subject:subjects(*)')
        .order('deadline')

    if (error) throw error
    return data
}

export async function createTask(supabase: SupabaseClient, input: any): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Niet ingelogd')

    const { data, error } = await supabase
        .from('tasks')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()

    if (error) throw error

    await runPlannerTrigger(supabase)

    return data
}

export async function updateTask(supabase: SupabaseClient, id: string, input: Partial<TaskInput>): Promise<Task> {
    const { data, error } = await supabase
        .from('tasks')
        .update(input)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteTask(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

    if (error) throw error

    await runPlannerTrigger(supabase)
}