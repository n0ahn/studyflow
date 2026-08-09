<script lang="ts">
    type Props = {
        icon: string
        title: string
        description: string
        actionLabel?: string
        onaction?: () => void
    }

    let { icon, title, description, actionLabel, onaction }: Props = $props()
</script>

<div class="flex flex-col items-center justify-center py-24 gap-4 text-center">
    <div class="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-2xl">
        {icon}
    </div>
    <div class="flex flex-col gap-1.5">
        <h3 class="text-sm font-semibold text-foreground">{title}</h3>
        <p class="text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>

    {#if actionLabel && onaction}
        <button
            onclick={onaction}
            class="mt-1 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium
                hover:bg-accent/90 transition-colors"
        >
            {actionLabel}
        </button>
    {/if}
</div>