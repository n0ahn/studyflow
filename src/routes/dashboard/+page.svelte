<script lang="ts">
    import { supabase } from '$lib/supabase'
    import { goto } from '$app/navigation'
    import { getAuthContext } from '$lib/stores'

    const auth = getAuthContext()

    async function handleLogout() {
        await supabase.auth.signOut()
        goto('/auth/login')
    }
</script>

<div class="min-h-screen p-8">
    <div class="max-w-4xl mx-auto flex flex-col gap-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold">Welkom terug 👋</h1>
                <p class="text-gray-500">{auth.session?.user.email}</p>
            </div>

            <button onclick={handleLogout}>
                Uitloggen
            </button>
        </div>

        <p class="text-gray-400">
            Dashboard komt in fase 4. Voor nu werkt authenticatie correct.
        </p>
    </div>
</div>