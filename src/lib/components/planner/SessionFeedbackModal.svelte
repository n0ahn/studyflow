<script lang="ts">
    import Modal from '$lib/components/ui/Modal.svelte'
    import Button from '$lib/components/ui/Button.svelte'
    import type { StudySessionWithDetails } from '$lib/types'

    type Props = {
        open: boolean
        session: StudySessionWithDetails
        elapsedMinutes: number
        onsubmit: (data: {
            actual_duration: number
            difficulty_rating: number
            confidence_rating: number
        }) => void
        onclose: () => void
        loading?: boolean
    }

    let { open, session, elapsedMinutes, onsubmit, onclose, loading = false }: Props = $props()

    const ratingOptions = [1, 2, 3, 4, 5]

    // svelte-ignore state_referenced_locally
    let actual_duration = $state(elapsedMinutes)
    let difficulty_rating = $state<number | null>(null)
    let confidence_rating = $state<number | null>(null)

    $effect(() => {
        if (open) {
            actual_duration = elapsedMinutes
            difficulty_rating = null
            confidence_rating = null
        }
    })

    const canSubmit = $derived(
        difficulty_rating !== null &&
        confidence_rating !== null &&
        actual_duration > 0
    )

    function handleSubmit() {
        if (!canSubmit || difficulty_rating === null || confidence_rating === null) return
        onsubmit({ actual_duration, difficulty_rating, confidence_rating })
    }
</script>

<Modal {open} title="Sessie afronden" {onclose}>
    <div class="flex flex-col gap-6">
        <div>
            <p class="text-sm font-medium text-foreground">
                {session.exam?.name ?? session.task?.title ?? session.subject.name}
            </p>
            <p class="text-xs text-muted-foreground mt-0.5">{session.subject.name}</p>
        </div>

        <!-- Werkelijke tijd -->
        <div class="flex flex-col gap-2">
            <span class="label">Hoeveel minuten heb je echt geleerd?</span>
            <input
                type="number"
                min="1"
                class="input"
                bind:value={actual_duration}
            />
        </div>

        <!-- Moeilijkheid -->
        <div class="flex flex-col gap-2">
            <span class="label">Hoe moeilijk was dit?</span>
            <div class="flex gap-1.5">
                {#each ratingOptions as option}
                    <button
                        onclick={() => difficulty_rating = option}
                        class="flex-1 py-2 rounded-md text-sm font-medium transition-all duration-150
                            {difficulty_rating === option
                                ? 'bg-accent text-white'
                                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}"
                    >
                        {option}
                    </button>
                {/each}
            </div>
            <div class="flex justify-between text-xs text-muted-foreground/60">
                <span>Makkelijk</span>
                <span>Moeilijk</span>
            </div>
        </div>

        <!-- Zekerheid -->
        <div class="flex flex-col gap-2">
            <span class="label">Hoe zeker voel je je?</span>
            <div class="flex gap-1.5">
                {#each ratingOptions as option}
                    <button
                        onclick={() => confidence_rating = option}
                        class="flex-1 py-2 rounded-md text-sm font-medium transition-all duration-150
                            {confidence_rating === option
                                ? 'bg-accent text-white'
                                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}"
                    >
                        {option}
                    </button>
                {/each}
            </div>
            <div class="flex justify-between text-xs text-muted-foreground/60">
                <span>Onzeker</span>
                <span>Zeker</span>
            </div>
        </div>

        <Button onclick={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? 'Opslaan...' : 'Sessie afronden'}
        </Button>
    </div>
</Modal>