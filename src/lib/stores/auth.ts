import { getContext, setContext } from 'svelte'
import type { Session } from '@supabase/supabase-js'

const AUTH_KEY = Symbol('auth')

type AuthState = {
    readonly session: Session | null
}

export function setAuthContext(getSession: () => Session | null) {
    return setContext<AuthState>(AUTH_KEY, {
        get session() {
            return getSession()
        }
    })
}

export function getAuthContext(): AuthState {
    return getContext(AUTH_KEY)
}