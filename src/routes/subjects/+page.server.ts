import { getSubjects } from '$lib/services/subjects'
import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = async ({ locals }) => {
    const subjects = await getSubjects(locals.supabase)
    return { subjects }
}