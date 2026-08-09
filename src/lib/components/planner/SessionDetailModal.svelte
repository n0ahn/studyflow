<script lang="ts">
    import type { StudySessionWithDetails } from '$lib/types'
    import { supabase } from '$lib/supabase'
    import { invalidateAll, goto } from '$app/navigation'
    import { getActiveSessionContext } from '$lib/stores'
    import { updateSession } from '$lib/services/sessions'
    import Modal from '$lib/components/ui/Modal.svelte'
    import Button from '$lib/components/ui/Button.svelte'
    import SessionFeedbackModal from './SessionFeedbackModal.svelte'
    import Play from '@lucide/svelte/icons/play'
    import Check from '@lucide/svelte/icons/check'
    import Calendar from '@lucide/svelte/icons/calendar'
    import Clock from '@lucide/svelte/icons/clock'
    import BookOpen from '@lucide/svelte/icons/book-open'
    import Maximize from '@lucide/svelte/icons/maximize-2'

    type Props = {
        open: boolean
        session: StudySessionWithDetails
        onclose: () => void
    }

    let { open, session, onclose }: Props = $props()

    const activeSession = getActiveSessionContext()

    const isThisSessionActive = $derived(
        activeSession.isActive && activeSession.sessionId === session.id
    )

    // "orphaned": in de database staat de sessie al op in_progress, maar er is
    // geen lokale timer-state voor (bv. andere sessie was actief, of localStorage
    // is kwijtgeraakt). De oorspronkelijke starttijd is niet te reconstrueren.
    const isOrphanedInProgress = $derived(
        session.status === 'in_progress' && !isThisSessionActive
    )

    const statusLabel = {
        planned: 'Gepland',
        in_progress: 'Bezig',
        completed: 'Voltooid',
        missed: 'Gemist'
    }

    const typeLabel = $derived(() =>
        session.exam ? 'Toets' : session.task ? 'Taak' : 'Vrije sessie'
    )

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('nl-NL', {
            weekday: 'long', day: 'numeric', month: 'long'
        })
    }

    function formatMinutes(m: number): string {
        if (m < 60) return `${m} min`
        const h = Math.floor(m / 60)
        const rem = m % 60
        return rem === 0 ? `${h}u` : `${h}u ${rem}m`
    }

    function formatTimer(seconds: number): string {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    let starting = $state(false)
    let showFeedback = $state(false)
    let submitting = $state(false)

    // svelte-ignore state_referenced_locally
    let notes = $state(session.notes ?? '')
    let noteSaveStatus = $state<'idle' | 'saving' | 'saved'>('idle')
    let noteSaveTimeout: ReturnType<typeof setTimeout> | null = null

    $effect(() => {
        notes = session.notes ?? ''
    })

    function handleNotesInput() {
        noteSaveStatus = 'saving'
        if (noteSaveTimeout) clearTimeout(noteSaveTimeout)
        noteSaveTimeout = setTimeout(async () => {
            try {
                await updateSession(supabase, session.id, { notes: notes.trim() || null })
                noteSaveStatus = 'saved'
            } catch (e) {
                console.error(e)
                noteSaveStatus = 'idle'
            }
        }, 600)
    }

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

    function handleRestart() {
        // Orphaned in_progress oppakken: start de lokale timer opnieuw vanaf nu.
        activeSession.start(session.id, session.planned_duration)
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
            showFeedback = false
            onclose()
            await invalidateAll()
        } catch (e) {
            console.error(e)
        } finally {
            submitting = false
        }
    }

    const elapsedMinutes = $derived(() => Math.max(1, Math.round(activeSession.elapsedSeconds / 60)))
</script>

<Modal {open} title={session.exam?.name ?? session.task?.title ?? session.subject.name} {onclose}>
    <div class="flex flex-col gap-5">
        <div class="flex items-center gap-2">
            <div
                class="w-2 h-2 rounded-full shrink-0"
                style="background-color: {session.subject.color}"
            ></div>
            <p class="text-sm text-muted-foreground">{session.subject.name}</p>
            <span class="text-xs text-muted-foreground/60">·</span>
            <p class="text-sm text-muted-foreground">{typeLabel()}</p>
        </div>

        <div class="flex flex-col gap-3 border-t border-border pt-4">
            <div class="flex items-center gap-3">
                <Calendar size={14} class="text-muted-foreground shrink-0" />
                <span class="text-sm text-foreground capitalize">{formatDate(session.date)}</span>
            </div>
            <div class="flex items-center gap-3">
                <Clock size={14} class="text-muted-foreground shrink-0" />
                {#if isThisSessionActive}
                    <span class="text-sm font-medium tabular-nums {activeSession.isOvertime ? 'text-amber-400' : 'text-accent'}">
                        {formatTimer(activeSession.isOvertime ? activeSession.elapsedSeconds : activeSession.remainingSeconds)}
                        {#if activeSession.paused}<span class="text-muted-foreground font-normal">(gepauzeerd)</span>{/if}
                    </span>
                {:else}
                    <span class="text-sm text-foreground">{formatMinutes(session.planned_duration)} gepland</span>
                {/if}
            </div>
            <div class="flex items-center gap-3">
                <BookOpen size={14} class="text-muted-foreground shrink-0" />
                <span class="text-sm text-foreground">{statusLabel[session.status]}</span>
            </div>
        </div>

        <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
                <span class="label">Notities</span>
                <span class="text-xs text-muted-foreground/60">
                    {#if noteSaveStatus === 'saving'}Opslaan...{/if}
                    {#if noteSaveStatus === 'saved'}Opgeslagen{/if}
                </span>
            </div>
            <textarea
                bind:value={notes}
                oninput={handleNotesInput}
                placeholder="Aantekeningen bij deze sessie..."
                rows="3"
                class="input resize-none"
            ></textarea>
        </div>

        {#if session.status === 'planned' && !isThisSessionActive}
            <Button onclick={handleStart} disabled={starting} size="lg">
                <Play size={16} />
                {starting ? 'Starten...' : 'Start sessie'}
            </Button>
        {:else if isOrphanedInProgress}
            <p class="text-xs text-muted-foreground -mb-1">Deze sessie loopt al, maar de timer is niet meer actief.</p>
            <Button onclick={handleRestart} size="lg">
                <Play size={16} />
                Hervat sessie
            </Button>
        {:else if isThisSessionActive}
            <div class="flex items-center gap-2">
                <Button onclick={() => goto(`/focus/${session.id}`)} variant="secondary" size="lg">
                    <Maximize size={16} />
                    Focus mode
                </Button>
                <Button onclick={handleOpenFeedback} size="lg">
                    <Check size={16} />
                    Afronden
                </Button>
            </div>
        {/if}
    </div>
</Modal>

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