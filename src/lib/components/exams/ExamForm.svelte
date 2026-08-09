<script lang="ts">
    import type { Exam, Subject } from '$lib/types'
    import Button from '$lib/components/ui/Button.svelte'

    type FormData = {
        subject_id: string
        name: string
        exam_date: string
        chapters: string
        difficulty: 'easy' | 'medium' | 'hard'
        target_grade: number
        estimated_study_time: number
        notes: string
        status: 'planned' | 'in_progress' | 'completed'
        start_offset: number
    }

    type Props = {
        initial?: Partial<Exam>
        subjects: Subject[]
        onsubmit: (data: FormData) => void
        loading?: boolean
    }

    let { initial = {}, subjects, onsubmit, loading = false }: Props = $props()

    let subject_id = $state('')
    let name = $state('')
    let exam_date = $state('')
    let chapters = $state('')
    let difficulty = $state<'easy' | 'medium' | 'hard'>('medium')
    let target_grade = $state(7)
    let estimated_study_time = $state(2)
    let notes = $state('')
    let status = $state<'planned' | 'in_progress' | 'completed'>('planned')
    let start_offset = $state(7)

    $effect(() => {
        subject_id = initial.subject_id ?? ''
        name = initial.name ?? ''
        exam_date = initial.exam_date ?? ''
        chapters = initial.chapters?.join(', ') ?? ''
        difficulty = initial.difficulty ?? 'medium'
        target_grade = initial.target_grade ?? 7
        estimated_study_time = initial.estimated_study_time ? initial.estimated_study_time / 60 : 2
        notes = initial.notes ?? ''
        status = initial.status ?? 'planned'
        start_offset = initial.start_offset ?? 7
    })

    const isValid = $derived(subject_id && name.trim() && exam_date)

    function handleSubmit() {
        if (!isValid) return
        onsubmit({
            subject_id, name, exam_date, chapters, difficulty,
            target_grade,
            estimated_study_time: Math.round(estimated_study_time * 60),
            notes, status, start_offset
        })
    }
</script>

<div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5">
        <label for="subject" class="label">Vak *</label>
        <select id="subject" bind:value={subject_id} class="select">
            <option value="">Kies een vak</option>
            {#each subjects as subject}
                <option value={subject.id}>{subject.name}</option>
            {/each}
        </select>
    </div>

    <div class="flex flex-col gap-1.5">
        <label for="name" class="label">Naam *</label>
        <input id="name" type="text" bind:value={name} placeholder="Bijv. Hoofdstuk 4 toets" class="input" />
    </div>

    <div class="flex flex-col gap-1.5">
        <label for="exam_date" class="label">Datum *</label>
        <input id="exam_date" type="date" bind:value={exam_date} class="input" />
    </div>

    <div class="flex flex-col gap-1.5">
        <label for="chapters" class="label">Hoofdstukken</label>
        <input id="chapters" type="text" bind:value={chapters} placeholder="Bijv. H1, H2, H3" class="input" />
    </div>

    <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
            <label for="difficulty" class="label">Moeilijkheid</label>
            <select id="difficulty" bind:value={difficulty} class="select">
                <option value="easy">Makkelijk</option>
                <option value="medium">Gemiddeld</option>
                <option value="hard">Moeilijk</option>
            </select>
        </div>
        <div class="flex flex-col gap-1.5">
            <label for="target_grade" class="label">Doelcijfer</label>
            <input id="target_grade" type="number" min="1" max="10" bind:value={target_grade} class="input" />
        </div>
    </div>
    <div class="flex flex-col gap-1.5">
    <label for="start_offset" class="label">Wanneer beginnen met leren</label>
    <div class="flex gap-2 flex-wrap">
        {#each [1, 3, 5, 7, 10, 14, 21, 30] as days}
            <button
                onclick={() => start_offset = days}
                class="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                    {start_offset === days
                        ? 'bg-accent text-white'
                        : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}"
            >
                {days} dagen
            </button>
        {/each}
    </div>
    <p class="text-xs text-muted-foreground">
        Planner start {start_offset} dagen voor de toetsdatum
    </p>
</div>

    <div class="flex flex-col gap-1.5">
        <label for="estimated_study_time" class="label">Geschatte studietijd (uren)</label>
        <input id="estimated_study_time" type="number" min="0.5" max="100" step="0.5" bind:value={estimated_study_time} class="input" />
    </div>

    <div class="flex flex-col gap-1.5">
        <label for="notes" class="label">Notities</label>
        <textarea id="notes" bind:value={notes} placeholder="Optionele notities..." rows={3} class="input"></textarea>
    </div>

    <Button onclick={handleSubmit} disabled={loading || !isValid}>
        {loading ? 'Opslaan...' : 'Opslaan'}
    </Button>
</div>