<script lang="ts">
    import type { Snippet } from 'svelte'
    import X from '@lucide/svelte/icons/x'

    type Props = {
        open: boolean
        title: string
        onclose: () => void
        children: Snippet
    }

    let { open, title, onclose, children }: Props = $props()

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) onclose()
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') onclose()
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <div
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onclick={handleBackdropClick}
        onkeydown={(e) => e.target === e.currentTarget && handleKeydown(e)}
    >
        <div class="bg-card border border-border rounded-2xl w-full max-w-md mx-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <h2 class="text-sm font-semibold text-foreground">{title}</h2>
                <button
                    onclick={onclose}
                    class="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent/5"
                >
                    <X size={16} />
                </button>
            </div>
            <div class="px-6 py-5 overflow-y-auto">
                {@render children()}
            </div>
        </div>
    </div>
{/if}