<script lang="ts">
    import type { Subject } from '$lib/types'
    import Button from '$lib/components/ui/Button.svelte'

    type Props = {
        initial?: Partial<Subject>
        onsubmit: (data: { name: string; color: string; teacher: string; notes: string }) => void
        loading?: boolean
    }

    let { initial = {}, onsubmit, loading = false }: Props = $props()

    let name = $state('')
    let color = $state('#6366f1')
    let teacher = $state('')
    let notes = $state('')

    $effect(() => {
        name = initial.name ?? ''
        color = initial.color ?? '#6366f1'
        teacher = initial.teacher ?? ''
        notes = initial.notes ?? ''
    })

    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899',
        '#ef4444', '#f97316', '#eab308',
        '#22c55e', '#14b8a6', '#3b82f6',
    ]

    function handleSubmit() {
        if (!name.trim()) return
        onsubmit({ name, color, teacher, notes })
    }
</script>

<div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1.5">
        <label for="name" class="label">Naam *</label>
        <input id="name" type="text" bind:value={name} placeholder="Bijv. Wiskunde" class="input" />
    </div>

    <div class="flex flex-col gap-2">
        <label for="color" class="label">Kleur</label>
        <div id="color" class="flex gap-2 flex-wrap">
            {#each colors as c}
                <button
                    aria-label="Kies kleur {c}"
                    onclick={() => color = c}
                    class="w-7 h-7 rounded-full transition-all duration-150 hover:scale-110
                        {color === c ? 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-110' : ''}"
                    style="background-color: {c}"
                ></button>
            {/each}
        </div>
    </div>

    <div class="flex flex-col gap-1.5">
        <label for="teacher" class="label">Docent</label>
        <input id="teacher" type="text" bind:value={teacher} placeholder="Bijv. Dhr. Janssen" class="input" />
    </div>

    <div class="flex flex-col gap-1.5">
        <label for="notes" class="label">Notities</label>
        <textarea id="notes" bind:value={notes} placeholder="Optionele notities..." rows={3} class="input"></textarea>
    </div>

    <Button onclick={handleSubmit} disabled={loading || !name.trim()}>
        {loading ? 'Opslaan...' : 'Opslaan'}
    </Button>
</div>