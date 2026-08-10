<script lang="ts">
    import type { ChecklistItem } from '$lib/types'
    import Plus from '@lucide/svelte/icons/plus'
    import Check from '@lucide/svelte/icons/check'

    type Props = {
        checklist: ChecklistItem[]
        onchange: (checklist: ChecklistItem[]) => void
    }

    let { checklist, onchange }: Props = $props()

    // Index van het eerste niet-afgevinkte item = het "actieve" item
    const activeIndex = $derived(checklist.findIndex(item => !item.done))

    let newItemText = $state('')

    function addItem() {
        const text = newItemText.trim()
        if (!text) return
        onchange([...checklist, { text, done: false }])
        newItemText = ''
    }

    function toggleItem(index: number) {
        const updated = checklist.map((item, i) =>
            i === index ? { ...item, done: !item.done } : item
        )
        onchange(updated)
    }

    function removeItem(index: number) {
        onchange(checklist.filter((_, i) => i !== index))
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault()
            addItem()
        }
    }
</script>

<div class="flex flex-col w-95 gap-4.5 justify-center items-center">
    <p class="text-[11.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground pl-1 m-0">Stappenplan</p>

    <div
        class="flex flex-col gap-0.5 p-2.5 rounded-3xl h-140 w-full overflow-y-auto"
        style="background: oklch(1 0 0 / 2.5%); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border: 1px solid oklch(1 0 0 / 6%);"
    >
        {#each checklist as item, index (index)}
            {@const isActive = index === activeIndex}
            {@const isPast = item.done}
            {@const isUpcoming = !item.done && index !== activeIndex}

            <div
                class="group flex items-center gap-3.5 rounded-2xl cursor-pointer transition-all duration-500 ease-out
                    {isActive ? 'py-5 px-4' : 'py-3 px-3.5'}
                    {isPast ? 'opacity-[0.28]' : ''}
                    {isUpcoming ? 'opacity-[0.32] blur-[3.5px] hover:blur-0 hover:opacity-60' : ''}"
                onclick={() => toggleItem(index)}
                onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleItem(index) } }}
                role="button"
                tabindex="0"
            >
                <!-- Checkbox -->
                <span
                    class="flex items-center justify-center shrink-0 rounded-full transition-all duration-300
                        {isActive ? 'w-6.5 h-6.5' : 'w-4.5 h-4.5'}"
                    style={isPast
                        ? 'background: linear-gradient(135deg, oklch(from var(--accent) calc(l * 1.15) c h), var(--accent)); box-shadow: 0 0 18px oklch(from var(--accent) l c h / 55%);'
                        : isActive
                            ? 'border: 1.5px solid oklch(1 0 0 / 22%); background: oklch(1 0 0 / 3%);'
                            : 'border: 1.5px solid oklch(1 0 0 / 13%);'}
                >
                    {#if isPast}
                        <Check size={isActive ? 14 : 10} class="text-white" />
                    {/if}
                </span>

                <!-- Tekst -->
                <span
                    class="flex-1 truncate transition-all duration-300
                        {isActive ? 'text-xl font-light text-foreground tracking-tight' : 'text-sm text-muted-foreground'}
                        {isPast ? 'line-through' : ''}"
                >
                    {item.text}
                </span>

                <!-- Verwijderen -->
                {#if !isPast}
                    <button
                        onclick={(e) => { e.stopPropagation(); removeItem(index) }}
                        class="opacity-0 group-hover:opacity-50 hover:opacity-100! transition-opacity
                            text-muted-foreground text-xs p-1 shrink-0"
                        aria-label="Stap verwijderen"
                    >
                        ✕
                    </button>
                {/if}
            </div>
        {/each}

        <!-- Nieuw item toevoegen -->
        <div class="flex items-center gap-2.5 px-4 pt-4 pb-2">
            <input
                type="text"
                bind:value={newItemText}
                onkeydown={handleKeydown}
                placeholder="Stap toevoegen..."
                class="flex-1 bg-transparent border-none outline-none text-sm text-foreground
                    placeholder:text-muted-foreground/50"
            />
            {#if newItemText.trim()}
                <button
                    onclick={addItem}
                    class="flex items-center justify-center w-7.5 h-7.5 rounded-full transition-all duration-200 shrink-0"
                    style="background: oklch(from var(--accent) l c h / 14%); border: 1px solid oklch(from var(--accent) l c h / 28%); color: oklch(from var(--accent) calc(l * 1.15) c h);"
                    aria-label="Stap toevoegen"
                >
                    <Plus size={14} />
                </button>
            {/if}
        </div>
    </div>
</div>