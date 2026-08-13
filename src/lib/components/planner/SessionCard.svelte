<script lang="ts">
    import type { StudySessionWithDetails } from '$lib/types'
    import { getActiveSessionContext } from '$lib/stores'
    import SessionDetailModal from './SessionDetailModal.svelte'

    type Props = {
        session: StudySessionWithDetails
        compact?: boolean
    }

    let { session, compact = false }: Props = $props()

    const activeSession = getActiveSessionContext()

    const statusConfig = {
        planned:    { class: 'border-border bg-secondary/50', dot: 'bg-muted-foreground' },
        in_progress: { class: 'border-accent/30 bg-accent/5', dot: 'bg-accent' },
        completed:  { class: 'border-emerald-500/30 bg-emerald-500/5', dot: 'bg-emerald-400' },
        missed:     { class: 'border-red-500/30 bg-red-500/5', dot: 'bg-red-400' }
    }

    const config = $derived(() => {
        const base = statusConfig[session.status]
        if (session.is_review && session.status === 'planned') {
            return { ...base, class: 'border-violet-500/30 bg-violet-500/5' }
        }
        return base
    })

    const isThisSessionActive = $derived(
        activeSession.isActive && activeSession.sessionId === session.id
    )

    function formatMinutes(m: number): string {
        if (m < 60) return `${m}m`
        const h = Math.floor(m / 60)
        const rem = m % 60
        return rem === 0 ? `${h}u` : `${h}u${rem}m`
    }

    function formatTimer(seconds: number): string {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const duration = $derived(() => {
        if (session.status === 'completed' && session.actual_duration !== null) {
            return formatMinutes(session.actual_duration)
        }
        return formatMinutes(session.planned_duration)
    })

    let showDetail = $state(false)
</script>

<button
    onclick={() => showDetail = true}
    class="border rounded-lg text-left transition-all duration-150 hover:brightness-110 {config().class}
        {compact ? 'px-1.5 py-1 flex items-center gap-1' : 'p-2.5 flex flex-col gap-1.5 w-full'}"
>
    {#if compact}
        <div
            class="w-1.5 h-1.5 rounded-full shrink-0"
            style="background-color: {session.subject.color}"
        ></div>
        <p class="text-[10px] font-medium truncate text-foreground flex-1">
            {session.exam?.name ?? session.task?.title ?? session.subject.name}
        </p>
        {#if session.is_review}
            <span class="text-[10px] shrink-0" style="color: oklch(from var(--accent) l c h / 70%)">↻</span>
        {/if}
    {:else}
        <div class="flex items-center gap-1.5">
            <div
                class="w-1.5 h-1.5 rounded-full shrink-0"
                style="background-color: {session.subject.color}"
            ></div>
            <p class="text-xs font-medium truncate text-foreground flex-1">
                {session.exam?.name ?? session.task?.title ?? session.subject.name}
            </p>
            {#if session.is_review}
                <span class="text-xs shrink-0" style="color: oklch(from var(--accent) l c h / 70%)">↻</span>
            {/if}
        </div>
        <div class="flex items-center justify-between gap-1.5">
            <p class="text-xs text-muted-foreground truncate">{session.subject.name}</p>

            {#if isThisSessionActive}
                <span class="text-xs font-medium shrink-0 ml-1 tabular-nums {activeSession.isOvertime ? 'text-amber-400' : 'text-accent'}">
                    {formatTimer(activeSession.isOvertime ? activeSession.elapsedSeconds : activeSession.remainingSeconds)}
                    {#if activeSession.paused}⏸{/if}
                </span>
            {:else}
                <span class="text-xs text-muted-foreground shrink-0 ml-1">{duration()}</span>
            {/if}
        </div>
    {/if}
</button>

<SessionDetailModal
    open={showDetail}
    {session}
    onclose={() => showDetail = false}
/>