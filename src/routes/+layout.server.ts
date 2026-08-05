import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

const PUBLIC_ROUTES = ['/auth/login', '/auth/signup', '/auth/callback']

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const session = await locals.getSession()
    const isPublicRoute = PUBLIC_ROUTES.includes(url.pathname)

    if (!session && !isPublicRoute) {
        redirect(303, '/auth/login')
    }

    if (session && url.pathname === '/') {
        redirect(303, '/dashboard')
    }

    return { session }
}