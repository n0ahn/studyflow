<script lang="ts">
    import type { Snippet } from 'svelte'

    type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
    type Size = 'sm' | 'md' | 'lg'

    type Props = {
        variant?: Variant
        size?: Size
        disabled?: boolean
        type?: 'button' | 'submit' | 'reset'
        onclick?: () => void
        children: Snippet
    }

    let {
        variant = 'primary',
        size = 'md',
        disabled = false,
        type = 'button',
        onclick,
        children
    }: Props = $props()

    const variants: Record<Variant, string> = {
        primary: 'bg-accent text-white hover:bg-accent/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        danger: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
        ghost: 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
    }

    const sizes: Record<Size, string> = {
        sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
        md: 'px-4 py-2 text-sm rounded-lg gap-2',
        lg: 'px-5 py-2.5 text-sm rounded-lg gap-2'
    }
</script>

<button
    {type}
    {disabled}
    {onclick}
    class="inline-flex items-center justify-center font-medium transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        {variants[variant]} {sizes[size]}"
>
    {@render children()}
</button>