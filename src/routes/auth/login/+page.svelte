<script lang="ts">
    import { supabase } from '$lib/supabase'
    import { goto } from '$app/navigation'

    let email = $state('')
    let password = $state('')
    let error = $state<string | null>(null)
    let loading = $state(false)

    async function handleLogin() {
        loading = true
        error = null

        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

        if (authError) {
            error = authError.message
            loading = false
            return
        }

        goto('/dashboard')
    }
</script>

<div class="min-h-screen flex items-center justify-center">
    <div class="w-full max-w-sm flex flex-col gap-6">
        <h1 class="text-2xl font-bold">Inloggen</h1>

        {#if error}
            <p class="text-red-500 text-sm">{error}</p>
        {/if}

        <input
            type="email"
            placeholder="E-mailadres"
            bind:value={email}
            class="border p-2 rounded"
        />
        <input
            type="password"
            placeholder="Wachtwoord"
            bind:value={password}
            class="border p-2 rounded"
        />

        <button onclick={handleLogin} disabled={loading}>
            {loading ? 'Laden...' : 'Inloggen'}
        </button>

        <a href="/auth/signup">Nog geen account? Registreer</a>
    </div>
</div>