<script lang="ts">
    type Props = {
        percent: number
    }

    let { percent }: Props = $props()

    const RADIUS = 46
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS
    const offset = $derived(CIRCUMFERENCE * (1 - Math.min(100, percent) / 100))
    const activeDays = $derived(Math.round((percent / 100) * 30))
</script>

<div class="col-span-5 card p-7 flex items-center gap-6">
    <div class="relative w-27 h-27 shrink-0">
        <svg viewBox="0 0 108 108" class="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="54" cy="54" r={RADIUS} fill="none" stroke="oklch(1 0 0 / 6%)" stroke-width="7" />
            <circle
                cx="54" cy="54" r={RADIUS}
                fill="none"
                stroke="oklch(0.66 0.2 275)"
                stroke-width="7"
                stroke-linecap="round"
                stroke-dasharray={CIRCUMFERENCE}
                stroke-dashoffset={offset}
                style="filter: drop-shadow(0 0 10px oklch(0.66 0.2 275 / 70%)); transition: stroke-dashoffset 800ms ease;"
            />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-2xl font-extralight text-foreground">{percent}%</span>
        </div>
    </div>
    <div class="flex flex-col gap-1.5">
        <p class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Consistentie</p>
        <p class="text-[12.5px] leading-relaxed text-muted-foreground max-w-45">
            Je hebt op <span class="font-semibold text-[oklch(0.78_0.14_275)]">{activeDays} van de 30</span> laatste dagen gestudeerd.
        </p>
    </div>
</div>