import { getExams } from '$lib/services/exams'
import { getSubjects } from '$lib/services/subjects'
import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = async ({ locals }) => {
    const [exams, subjects] = await Promise.all([
        getExams(locals.supabase),
        getSubjects(locals.supabase)
    ])

    return { exams, subjects }
}