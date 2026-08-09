<script lang="ts">
    import type { Subject } from '$lib/types'
    import Pencil from '@lucide/svelte/icons/pencil'
    import Trash2 from '@lucide/svelte/icons/trash-2'

    type Props = {
        subject: Subject
        onedit: (subject: Subject) => void
        ondelete: (subject: Subject) => void
    }

    let { subject, onedit, ondelete }: Props = $props()
</script>

<div class="card group flex flex-col gap-4 hover:border-white/10 transition-all duration-200">
    <div class="flex items-start justify-between">
        <div
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style="background-color: {subject.color}"
        >
            {subject.name[0].toUpperCase()}
        </div>

        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
                onclick={() => onedit(subject)}
                class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
                <Pencil size={13} />
            </button>
            <button
                onclick={() => ondelete(subject)}
                class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
                <Trash2 size={13} />
            </button>
        </div>
    </div>

    <div>
        <p class="font-semibold text-foreground">{subject.name}</p>
        {#if subject.teacher}
            <p class="text-xs text-muted-foreground mt-0.5">{subject.teacher}</p>
        {/if}
    </div>

    <div
        class="h-0.5 rounded-full w-full opacity-60"
        style="background-color: {subject.color}"
    ></div>
</div>