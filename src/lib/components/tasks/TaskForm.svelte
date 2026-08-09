<script lang="ts">
    import type { Task, Subject } from '$lib/types'
    import Button from '$lib/components/ui/Button.svelte'

    type FormData = {
        subject_id: string
        title: string
        description: string
        deadline: string
        priority: 'low' | 'medium' | 'high'
        estimated_time: number
        status: 'pending' | 'in_progress' | 'completed'
        start_offset: number
    }

    type Props = {
        initial?: Partial<Task>
        subjects: Subject[]
        onsubmit: (data: FormData) => void
        loading?: boolean
    }

    let { initial = {}, subjects, onsubmit, loading = false }: Props = $props()

    let subject_id = $state('')
    let title = $state('')
    let description = $state('')
    let deadline = $state('')
    let priority = $state<'low' | 'medium' | 'high'>('medium')
    let estimated_time = $state(1)
    let status = $state<'pending' | 'in_progress' | 'completed'>('pending')
    let start_offset = $state(3)

    $effect(() => {
        subject_id = initial.subject_id ?? ''
        title = initial.title ?? ''
        description = initial.description ?? ''
        deadline = initial.deadline ?? ''
        priority = initial.priority ?? 'medium'
        estimated_time = initial.estimated_time ? initial.estimated_time / 60 : 1
        status = initial.status ?? 'pending'
        start_offset = initial.start_offset ?? 3
    })

    const isValid = $derived(subject_id && title.trim() && deadline)

    function handleSubmit() {
        if (!isValid) return
        onsubmit({
            subject_id, title, description, deadline, priority,
            estimated_time: Math.round(estimated_time * 60),
            status, start_offset
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
        <label for="title" class="label">Titel *</label>
        <input id="title" type="text" bind:value={title} placeholder="Bijv. Samenvatting maken" class="input" />
    </div>

    <div class="flex flex-col gap-1.5">
        <label for="description" class="label">Omschrijving</label>
        <textarea id="description" bind:value={description} placeholder="Optionele omschrijving..." rows={3} class="input"></textarea>
    </div>

    <div class="flex flex-col gap-1.5">
        <label for="deadline" class="label">Deadline *</label>
        <input id="deadline" type="date" bind:value={deadline} class="input" />
    </div>

    <div class="flex flex-col gap-1.5">
    <label for="start_offset" class="label">Wanneer beginnen</label>
    <div class="flex gap-2 flex-wrap">
        {#each [1, 2, 3, 5, 7, 14] as days}
            <button
                onclick={() => start_offset = days}
                class="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                    {start_offset === days
                        ? 'bg-accent text-white'
                        : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'}"
            >
                {days} {days === 1 ? 'dag' : 'dagen'}
            </button>
        {/each}
    </div>
    <p class="text-xs text-muted-foreground">
        Planner start {start_offset} {start_offset === 1 ? 'dag' : 'dagen'} voor de deadline
    </p>
</div>

    <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
            <label for="priority" class="label">Prioriteit</label>
            <select id="priority" bind:value={priority} class="select">
                <option value="low">Laag</option>
                <option value="medium">Gemiddeld</option>
                <option value="high">Hoog</option>
            </select>
        </div>
        <div class="flex flex-col gap-1.5">
            <label for="estimated_time" class="label">Geschatte tijd (uren)</label>
            <input id="estimated_time" type="number" min="0.5" max="100" step="0.5" bind:value={estimated_time} class="input" />
        </div>
    </div>

    <Button onclick={handleSubmit} disabled={loading || !isValid}>
        {loading ? 'Opslaan...' : 'Opslaan'}
    </Button>
</div>