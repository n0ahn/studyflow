import { getSettings } from '$lib/services/settings'
import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = async ({ locals }) => {
    const settings = await getSettings(locals.supabase)
    return { settings }
}