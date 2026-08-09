import { error } from '@sveltejs/kit'
import { getSessionById } from '$lib/services/sessions'
import type { ServerLoad } from '@sveltejs/kit'

export const load: ServerLoad = async ({ locals, params }) => {
    const session = await getSessionById(locals.supabase, params.sessionId!)

    if (!session) {
        error(404, 'Sessie niet gevonden')
    }

    return { session }
}