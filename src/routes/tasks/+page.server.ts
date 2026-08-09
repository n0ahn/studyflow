import { getTasks } from '$lib/services/tasks'
import { getSubjects } from '$lib/services/subjects'
import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = async ({ locals }) => {
    const [tasks, subjects] = await Promise.all([
        getTasks(locals.supabase),
        getSubjects(locals.supabase)
    ])

    return { tasks, subjects }
}