<script lang="ts">
    import type { StudySessionWithDetails } from '$lib/types'
    import { supabase } from '$lib/supabase'
    import { goto, invalidateAll } from '$app/navigation'
    import { resolve } from '$app/paths'
    import { getActiveSessionContext } from '$lib/stores'
    import { updateSession } from '$lib/services/sessions'
    import SessionFeedbackModal from '$lib/components/planner/SessionFeedbackModal.svelte'
    import Play from '@lucide/svelte/icons/play'
    import Pause from '@lucide/svelte/icons/pause'
    import Check from '@lucide/svelte/icons/check'

    type Props = {
        session: StudySessionWithDetails
    }

    let { session }: Props = $props()

    const activeSession = getActiveSessionContext()

    const isThisSessionActive = $derived(
        activeSession.isActive && activeSession.sessionId === session.id
    )

    // Sessie staat in de database al op in_progress, maar er is geen lokale
    // timer-state voor (bv. gestart op ander apparaat, of localStorage kwijt).
    const isOrphaned = $derived(
        session.status === 'in_progress' && !isThisSessionActive
    )

    function formatTimer(seconds: number): string {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        if (h > 0) {
            return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        }
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const RADIUS = 165
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS

    const progressFraction = $derived(() => {
        const total = session.planned_duration * 60
        if (total === 0) return 0
        return Math.min(1, activeSession.elapsedSeconds / total)
    })

    const ringOffset = $derived(() => CIRCUMFERENCE * (1 - progressFraction()))

    let starting = $state(false)
    let showFeedback = $state(false)
    let submitting = $state(false)

    async function handleStart() {
        starting = true
        try {
            await updateSession(supabase, session.id, { status: 'in_progress' })
            activeSession.start(session.id, session.planned_duration)
            await invalidateAll()
        } catch (e) {
            console.error(e)
        } finally {
            starting = false
        }
    }

    function handleOrphanedStart() {
        activeSession.start(session.id, session.planned_duration)
    }

    function handlePause() {
        activeSession.pause()
    }

    function handleResume() {
        activeSession.resume()
    }

    function handleOpenFeedback() {
        showFeedback = true
    }

    async function handleSubmitFeedback(data: {
        actual_duration: number
        difficulty_rating: number
        confidence_rating: number
    }) {
        submitting = true
        try {
            await updateSession(supabase, session.id, {
                status: 'completed',
                actual_duration: data.actual_duration,
                difficulty_rating: data.difficulty_rating,
                confidence_rating: data.confidence_rating
            })
            activeSession.clear()
            await goto(resolve('/planner'))
        } catch (e) {
            console.error(e)
        } finally {
            submitting = false
        }
    }

    const elapsedMinutes = $derived(() => Math.max(1, Math.round(activeSession.elapsedSeconds / 60)))
</script>

<div class="flex flex-col items-center gap-11 shrink-0">
    <p class="text-xl font-semibold uppercase tracking-widest text-muted-foreground text-center max-w-95">
        {session.exam?.name ?? session.task?.title ?? session.subject.name}
    </p>

    <!-- Ring + timer: relative container, lagen elk absolute inset-0 -->
    <div class="relative w-95 h-95 max-w-full">
        {#if isThisSessionActive}
            <div
                class="absolute -inset-20 rounded-full blur-3xl transition-opacity duration-1000
                    {activeSession.paused ? 'opacity-35 animate-none' : 'opacity-70 animate-[focus-pulse_4.5s_ease-in-out_infinite]'}"
                style="background: radial-gradient(circle, {activeSession.isOvertime ? 'oklch(0.75 0.18 70 / 50%)' : 'oklch(0.66 0.2 275 / 50%)'}, transparent 68%);"
            ></div>
        {/if}

        <svg viewBox="0 0 380 380" class="absolute inset-0 w-full h-full -rotate-90">
            <defs>
                <linearGradient id="ringGradientNormal" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="oklch(0.76 0.14 275)" />
                    <stop offset="100%" stop-color="oklch(0.58 0.22 275)" />
                </linearGradient>
                <linearGradient id="ringGradientOvertime" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="oklch(0.85 0.15 85)" />
                    <stop offset="100%" stop-color="oklch(0.72 0.18 60)" />
                </linearGradient>
            </defs>
            <circle cx="190" cy="190" r="175" fill="none" stroke="oklch(1 0 0 / 4.5%)" stroke-width="1" />
            <circle cx="190" cy="190" r={RADIUS} fill="none" stroke="oklch(1 0 0 / 7%)" stroke-width="3" />
            {#if isThisSessionActive}
                <circle
                    cx="190" cy="190" r={RADIUS}
                    fill="none"
                    stroke={activeSession.isOvertime ? 'url(#ringGradientOvertime)' : 'url(#ringGradientNormal)'}
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-dasharray={CIRCUMFERENCE}
                    stroke-dashoffset={activeSession.isOvertime ? 0 : ringOffset()}
                    class="transition-[stroke-dashoffset,stroke] duration-1000 ease-linear"
                    style="filter: drop-shadow(0 0 16px {activeSession.isOvertime ? 'oklch(0.75 0.18 70 / 85%)' : 'oklch(0.66 0.2 275 / 85%)'});"
                />
            {/if}
        </svg>

        <div class="absolute inset-0 flex flex-col items-center justify-center gap-2.5 z-10">
            {#if session.status === 'planned' && !isThisSessionActive}
                <p class="text-7xl font-extralight tabular-nums tracking-tight text-foreground m-0">
                    {formatTimer(session.planned_duration * 60)}
                </p>
                <p class="text-[11.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground m-0">Geplande duur</p>
            {:else if isOrphaned}
                <p class="text-7xl font-extralight tabular-nums tracking-tight text-muted-foreground m-0">
                    {formatTimer(session.planned_duration * 60)}
                </p>
                <p class="text-[11.5px] font-bold uppercase tracking-[0.18em] text-muted-foreground text-center px-10 m-0">
                    Timer niet actief
                </p>
            {:else if isThisSessionActive}
                <p
                    class="text-7xl font-extralight tabular-nums tracking-tight m-0 transition-[text-shadow] duration-500
                        {activeSession.isOvertime ? 'text-amber-200' : 'text-foreground'}"
                    style="text-shadow: 0 0 70px {activeSession.paused ? 'transparent' : (activeSession.isOvertime ? 'oklch(0.75 0.18 70 / 50%)' : 'oklch(0.66 0.2 275 / 50%)')};"
                >
                    {formatTimer(activeSession.isOvertime ? activeSession.elapsedSeconds : activeSession.remainingSeconds)}
                </p>
                <p
                    class="text-[11.5px] font-bold uppercase tracking-[0.18em] m-0"
                    style="color: {activeSession.isOvertime ? 'oklch(0.78 0.16 75)' : 'oklch(0.78 0.14 275)'};"
                >
                    {#if activeSession.isOvertime}
                        Uitgelopen
                    {:else if activeSession.paused}
                        Gepauzeerd
                    {:else}
                        Resterende tijd
                    {/if}
                </p>
            {/if}
        </div>
    </div>

    <!-- Acties -->
    {#if session.status === 'planned' && !isThisSessionActive}
        <button
            onclick={handleStart}
            disabled={starting}
            class="group flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm text-white
                transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]
                disabled:opacity-50 disabled:hover:scale-100 disabled:hover:translate-y-0"
            style="background: linear-gradient(135deg, oklch(0.76 0.14 275), oklch(0.58 0.22 275));
                box-shadow: 0 0 0 1px oklch(0.66 0.2 275 / 35%), 0 10px 36px oklch(0.58 0.22 275 / 45%);"
        >
            <Play size={16} class="transition-transform group-hover:scale-110" />
            {starting ? 'Starten...' : 'Start sessie'}
        </button>
    {:else if isOrphaned}
        <button
            onclick={handleOrphanedStart}
            class="flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm
                bg-white/4 backdrop-blur-2xl border border-white/9 text-foreground
                transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5"
        >
            <Play size={16} />
            Hervat sessie
        </button>
    {:else if isThisSessionActive}
        <div class="flex items-center gap-3">
            {#if activeSession.paused}
                <button
                    onclick={handleResume}
                    class="flex items-center gap-2.5 px-7 py-4 rounded-full font-semibold text-sm
                        bg-white/4 backdrop-blur-2xl border border-white/9 text-foreground
                        transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5"
                >
                    <Play size={15} />
                    Hervatten
                </button>
            {:else}
                <button
                    onclick={handlePause}
                    class="flex items-center gap-2.5 px-7 py-4 rounded-full font-semibold text-sm
                        bg-white/4 backdrop-blur-2xl border border-white/9 text-foreground
                        transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5"
                >
                    <Pause size={15} />
                    Pauzeren
                </button>
            {/if}
            <button
                onclick={handleOpenFeedback}
                class="flex items-center gap-2.5 px-7 py-4 rounded-full font-semibold text-sm text-white
                    transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
                style="background: linear-gradient(135deg, oklch(0.76 0.14 275), oklch(0.58 0.22 275));
                    box-shadow: 0 0 0 1px oklch(0.66 0.2 275 / 35%), 0 10px 36px oklch(0.58 0.22 275 / 45%);"
            >
                <Check size={15} />
                Afronden
            </button>
        </div>
    {/if}
</div>

{#if isThisSessionActive}
    <SessionFeedbackModal
        open={showFeedback}
        {session}
        elapsedMinutes={elapsedMinutes()}
        onsubmit={handleSubmitFeedback}
        onclose={() => showFeedback = false}
        loading={submitting}
    />
{/if}

<style>
    @keyframes focus-pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.06); }
    }
</style>
