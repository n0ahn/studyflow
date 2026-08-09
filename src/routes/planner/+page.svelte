<script lang="ts">
    import { invalidateAll } from '$app/navigation'
    import { supabase } from '$lib/supabase'
    import { runPlannerTrigger } from '$lib/planner/trigger'
    import PlannerView from '$lib/components/planner/PlannerView.svelte'
    import Button from '$lib/components/ui/Button.svelte'
    import RefreshCw from '@lucide/svelte/icons/refresh-cw'
    import type { PageData } from './$types'

    let { data }: { data: PageData } = $props()

    let replanning = $state(false)
    let warnings = $state<string[]>([])

    async function handleReplan() {
        replanning = true
        warnings = []
        try {
            const result = await runPlannerTrigger(supabase)
            warnings = result.warnings
            await invalidateAll()
        } catch (e: any) {
            console.error(e)
        } finally {
            replanning = false
        }
    }

    const totalSessions = $derived(() => data.sessions.length)
    const totalMinutes = $derived(() =>
        data.sessions.reduce((sum, s) => sum + s.planned_duration, 0)
    )
    const totalHours = $derived(() => Math.round(totalMinutes() / 60 * 10) / 10)
</script>

<div class="flex flex-col gap-6">
    <div class="flex items-start justify-between">
        <div>
            <h1 class="text-2xl font-bold">Planner</h1>
            <p class="text-muted-foreground text-sm mt-0.5">
                {totalSessions()} sessies · {totalHours()}u gepland
            </p>
        </div>
        <Button onclick={handleReplan} disabled={replanning} variant="secondary">
            <RefreshCw size={14} class={replanning ? 'animate-spin' : ''} />
            {replanning ? 'Herplannen...' : 'Herplan'}
        </Button>
    </div>

    {#if warnings.length > 0}
        <div class="border border-amber-500/20 bg-amber-500/5 rounded-xl p-4 flex flex-col gap-1">
            <p class="text-sm font-medium text-amber-400">Niet alles kon ingepland worden</p>
            {#each warnings as warning}
                <p class="text-xs text-amber-400/60">{warning}</p>
            {/each}
        </div>
    {/if}

    {#if data.sessions.length === 0}
        <div class="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <div class="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                <span class="text-2xl">📅</span>
            </div>
            <div>
                <p class="text-sm font-semibold text-foreground">Geen sessies gepland</p>
                <p class="text-sm text-muted-foreground mt-1">Voeg toetsen of taken toe om een planning te genereren.</p>
            </div>
            <Button onclick={handleReplan} variant="secondary">
                <RefreshCw size={14} />
                Planning genereren
            </Button>
        </div>
    {:else}
        <PlannerView
            sessions={data.sessions}
            from={data.from}
            to={data.to}
        />
    {/if}
</div>