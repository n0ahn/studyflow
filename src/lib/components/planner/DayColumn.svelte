<script lang="ts">
    import type { StudySessionWithDetails } from '$lib/types'
    import SessionCard from './SessionCard.svelte'

    type Props = {
        date: string
        sessions: StudySessionWithDetails[]
        isToday: boolean
    }

    let { date, sessions, isToday }: Props = $props()

    const dayLabel = $derived(() => {
        const d = new Date(date)
        return {
            weekday: d.toLocaleDateString('nl-NL', { weekday: 'short' }).toUpperCase(),
            day: d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
        }
    })

    const totalMinutes = $derived(() =>
        sessions.reduce((sum, s) => sum + s.planned_duration, 0)
    )

    const totalLabel = $derived(() => {
        const m = totalMinutes()
        if (m === 0) return null
        if (m < 60) return `${m}m`
        const h = Math.floor(m / 60)
        const rem = m % 60
        return rem === 0 ? `${h}u` : `${h}u${rem}m`
    })
</script>

<div class="flex flex-col gap-2 min-w-0">
    <!-- Dag header -->
    <div class="flex flex-col gap-0.5 pb-2 border-b {isToday ? 'border-accent' : 'border-border'}">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold {isToday ? 'text-accent' : 'text-muted-foreground'}">
                {dayLabel().weekday}
            </span>
            {#if totalLabel()}
                <span class="text-xs text-muted-foreground">{totalLabel()}</span>
            {/if}
        </div>
        <span class="text-xs {isToday ? 'text-foreground font-medium' : 'text-muted-foreground'}">
            {dayLabel().day}
        </span>
    </div>

    <!-- Sessies -->
    <div class="flex flex-col gap-1.5 min-h-16">
        {#if sessions.length === 0}
            <div class="flex items-center justify-center h-16">
                <span class="text-xs text-muted-foreground/40">—</span>
            </div>
        {:else}
            {#each sessions as session (session.id)}
                <SessionCard {session} />
            {/each}
        {/if}
    </div>
</div>