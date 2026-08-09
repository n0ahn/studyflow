<script lang="ts">
    import Flame from '@lucide/svelte/icons/flame'

    type Props = {
        currentStreak: number
        longestStreak: number
    }

    let { currentStreak, longestStreak }: Props = $props()
</script>

<div class="relative col-span-4 rounded-3xl p-7 flex flex-col justify-between overflow-hidden border border-[oklch(0.8_0.16_75/14%)] bg-linear-to-br from-[oklch(0.8_0.16_75/8%)] to-transparent">
    <div>
        <Flame size={30} class="text-amber-400 drop-shadow-[0_0_10px_oklch(0.8_0.16_75/60%)]" />
        <p class="text-5xl font-extralight tracking-tight text-foreground mt-2.5">{currentStreak}</p>
        <p class="text-xs text-muted-foreground mt-1">{currentStreak === 1 ? 'dag op rij' : 'dagen op rij'}</p>
    </div>

    <div class="flex items-center justify-between pt-3.5 mt-3.5 border-t border-border">
        <span class="text-xs text-muted-foreground">Langste streak</span>
        <span class="text-sm font-medium text-foreground">{longestStreak} {longestStreak === 1 ? 'dag' : 'dagen'}</span>
    </div>
</div>