<script lang="ts">
    import type { Insight } from '$lib/stats/types'
    import TrendingUp from '@lucide/svelte/icons/trending-up'
    import TrendingDown from '@lucide/svelte/icons/trending-down'
    import Flame from '@lucide/svelte/icons/flame'
    import Zap from '@lucide/svelte/icons/zap'
    import Target from '@lucide/svelte/icons/target'
    import CalendarDays from '@lucide/svelte/icons/calendar-days'
    import Award from '@lucide/svelte/icons/award'

    type Props = {
        insights: Insight[]
    }

    let { insights }: Props = $props()

    const iconMap = {
        'trending-up': TrendingUp,
        'trending-down': TrendingDown,
        flame: Flame,
        zap: Zap,
        target: Target,
        calendar: CalendarDays,
        award: Award
    }

    /** Splitst tekst op de highlight-substrings, zodat ze apart (geaccentueerd) gerenderd kunnen worden. */
    function splitHighlighted(text: string, highlights: string[]): { text: string; isHighlight: boolean }[] {
        if (highlights.length === 0) return [{ text, isHighlight: false }]

        const escaped = highlights
            .filter(h => h.length > 0)
            .sort((a, b) => b.length - a.length)
            .map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        if (escaped.length === 0) return [{ text, isHighlight: false }]

        const regex = new RegExp(`(${escaped.join('|')})`, 'g')
        return text.split(regex).map(part => ({
            text: part,
            isHighlight: highlights.includes(part)
        }))
    }
</script>

<div class="col-span-12 card p-7">
    <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Inzichten</p>

    {#if insights.length === 0}
        <p class="text-sm text-muted-foreground py-6">
            Nog niet genoeg data voor persoonlijke inzichten — voltooi een paar sessies met feedback om hier patronen te zien.
        </p>
    {:else}
        <div class="grid grid-cols-3 gap-3.5 mt-4.5">
            {#each insights as insight (insight.id)}
                {@const Icon = iconMap[insight.icon]}
                <div class="flex flex-col gap-3 p-4.5 rounded-2xl bg-white/2 border border-white/4">
                    <div
                        class="flex items-center justify-center w-8.5 h-8.5 rounded-[10px] shrink-0"
                        style="background: linear-gradient(135deg, oklch(0.66 0.2 275 / 20%), oklch(0.58 0.22 275 / 6%)); color: oklch(0.78 0.14 275);"
                    >
                        <Icon size={15} />
                    </div>
                    <p class="text-[13px] leading-relaxed text-foreground">
                        {#each splitHighlighted(insight.text, insight.highlights) as part, partIndex (partIndex)}
                            {#if part.isHighlight}
                                <span class="font-semibold" style="color: oklch(0.78 0.14 275);">{part.text}</span>
                            {:else}
                                {part.text}
                            {/if}
                        {/each}
                    </p>
                </div>
            {/each}
        </div>
    {/if}
</div>