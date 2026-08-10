import { redirect } from '@sveltejs/kit'
import type { ServerLoad } from '@sveltejs/kit'

// '/' toegevoegd aan publieke routes!
const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/signup', '/auth/callback']

export const load: ServerLoad = async ({ locals, url }) => {
    const session = await locals.getSession()
    const isPublicRoute = PUBLIC_ROUTES.includes(url.pathname)

    // Als je niet bent ingelogd en NIET op een publieke route zit -> naar login
    if (!session && !isPublicRoute) {
        redirect(303, '/auth/login')
    }

    // Als je WEL bent ingelogd en naar de homepage gaat -> direct naar dashboard
    if (session && url.pathname === '/') {
        redirect(303, '/dashboard')
    }

    return {
        session,
        pathname: url.pathname
    }
}