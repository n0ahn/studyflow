import type { SupabaseClient } from '@supabase/supabase-js'
import type { Exam, ExamWithSubject } from '$lib/types'
import { runPlannerTrigger } from '$lib/planner/trigger'

type ExamInput = Omit<Exam, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export async function getExams(supabase: SupabaseClient): Promise<ExamWithSubject[]> {
    const { data, error } = await supabase
        .from('exams')
        .select('*, subject:subjects(*)')
        .order('exam_date')

    if (error) throw error
    return data
}

export async function createExam(supabase: SupabaseClient, input: any): Promise<Exam> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Niet ingelogd')

    const chapters = input.chapters
        ? input.chapters.split(',').map((c: string) => c.trim()).filter(Boolean)
        : []

    const { data, error } = await supabase
        .from('exams')
        .insert({ ...input, chapters, user_id: user.id })
        .select()
        .single()

    if (error) throw error

    await runPlannerTrigger(supabase)

    return data
}


export async function updateExam(supabase: SupabaseClient, id: string, input: Partial<ExamInput>): Promise<Exam> {
    const { data, error } = await supabase
        .from('exams')
        .update(input)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteExam(supabase: SupabaseClient, id: string): Promise<void> {
    const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id)

    if (error) throw error

    await runPlannerTrigger(supabase)
}