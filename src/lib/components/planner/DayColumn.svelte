<script lang="ts">
    import type { StudySessionWithDetails } from '$lib/types'
    import SessionCard from './SessionCard.svelte'

    type Deadline = { date: string; label: string; color: string; type: 'exam' | 'task' }

    type Props = {
        date: string
        sessions: StudySessionWithDetails[]
        deadlines?: Deadline[]
        isToday: boolean
        compact?: boolean
        dimmed?: boolean
    }

    let { date, sessions, deadlines = [], isToday, compact = false, dimmed = false }: Props = $props()

    const dayLabel = $derived(() => {
        const d = new Date(date + 'T12:00:00Z')
        return {
            weekday: d.toLocaleDateString('nl-NL', { weekday: 'short', timeZone: 'UTC' }).toUpperCase(),
            day: compact
                ? String(d.getUTCDate())
                : d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', timeZone: 'UTC' })
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

<div class="flex flex-col gap-1.5 min-w-0 {dimmed ? 'opacity-35' : ''}">
    <!-- Dag header -->
    <div class="flex flex-col gap-0.5 pb-1.5 border-b {isToday ? 'border-accent' : 'border-border'}">
        {#if compact}
            <!-- Maand-view: compacte header met enkel dagnummer -->
            <div class="flex items-center justify-between">
                <span
                    class="text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full
                        {isToday ? 'bg-accent text-white' : 'text-muted-foreground'}"
                >
                    {dayLabel().day}
                </span>
                {#if totalLabel()}
                    <span class="text-[10px] text-muted-foreground">{totalLabel()}</span>
                {/if}
            </div>
        {:else}
            <!-- Week-view: volledige header -->
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
        {/if}
    </div>

    <!-- Deadline-markers -->
    {#if deadlines.length > 0}
        <div class="flex flex-col gap-0.5">
            {#each deadlines as deadline (deadline.label + deadline.date)}
                <div
                    class="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate"
                    style="background-color: {deadline.color}22; color: {deadline.color}"
                    title="{deadline.type === 'exam' ? '📝' : '✅'} {deadline.label}"
                >
                    <span class="shrink-0">{deadline.type === 'exam' ? '📝' : '✅'}</span>
                    {#if !compact}
                        <span class="truncate">{deadline.label}</span>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}

    <!-- Sessies -->
    <div class="flex flex-col gap-1 {compact ? 'min-h-10' : 'min-h-16'}">
        {#if sessions.length === 0}
            {#if !compact}
                <div class="flex items-center justify-center h-16">
                    <span class="text-xs text-muted-foreground/40">—</span>
                </div>
            {/if}
        {:else}
            {#each sessions as session (session.id)}
                <SessionCard {session} {compact} />
            {/each}
        {/if}
    </div>
</div>