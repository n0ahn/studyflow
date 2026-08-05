<script lang="ts">
    import { supabase } from '$lib/supabase'

    let email = $state('')
    let password = $state('')
    let confirm = $state('')
    let error = $state<string | null>(null)
    let success = $state(false)
    let loading = $state(false)

    async function handleSignup() {
        if (password !== confirm) {
            error = 'Wachtwoorden komen niet overeen'
            return
        }

        loading = true
        error = null

        const { error: authError } = await supabase.auth.signUp({ email, password })

        if (authError) {
            error = authError.message
            loading = false
            return
        }

        success = true
    }
</script>

<div class="min-h-screen flex items-center justify-center">
    <div class="w-full max-w-sm flex flex-col gap-6">
        <h1 class="text-2xl font-bold">Registreren</h1>

        {#if success}
            <p class="text-green-500">Check je e-mail om je account te bevestigen.</p>
        {:else}
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
            <input
                type="password"
                placeholder="Bevestig wachtwoord"
                bind:value={confirm}
                class="border p-2 rounded"
            />

            <button onclick={handleSignup} disabled={loading}>
                {loading ? 'Laden...' : 'Registreren'}
            </button>
        {/if}

        <a href="/auth/login">Al een account? Log in</a>
    </div>
</div>