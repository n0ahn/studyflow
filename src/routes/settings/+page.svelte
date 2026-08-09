<script lang="ts">
    import { invalidateAll } from '$app/navigation'
    import { supabase } from '$lib/supabase'
    import { saveSettings } from '$lib/services/settings'
    import AvailabilityForm from '$lib/components/settings/AvailabilityForm.svelte'
    import type { UserSettings } from '$lib/types'
    import type { PageData } from './$types'

    let { data }: { data: PageData } = $props()

    let loading = $state(false)
    let error = $state<string | null>(null)
    let saved = $state(false)

    async function handleSubmit(formData: Partial<UserSettings>) {
        loading = true
        error = null
        saved = false

        try {
            await saveSettings(supabase, formData)
            await invalidateAll()
            saved = true
            setTimeout(() => saved = false, 3000)
        } catch (e: any) {
            error = e.message
        } finally {
            loading = false
        }
    }
</script>

<div class="flex flex-col gap-6 max-w-xl">
    <div>
        <h1 class="text-2xl font-bold">Instellingen</h1>
        <p class="text-muted-foreground text-sm">Pas je studievoorkeuren aan</p>
    </div>

    {#if error}
        <p class="text-destructive text-sm">{error}</p>
    {/if}

    {#if saved}
        <p class="text-sm" style="color: var(--color-success, #22c55e)">Instellingen opgeslagen ✓</p>
    {/if}

    <AvailabilityForm
        initial={data.settings}
        onsubmit={handleSubmit}
        {loading}
    />
</div>