<script lang="ts">
    type Props = {
        value: string
        label: string
    }

    let { value, label }: Props = $props()
</script>

<div class="col-span-4 card p-6 flex flex-col gap-2">
    <p class="text-3xl font-extralight tracking-tight text-foreground">{value}</p>
    <p class="text-xs text-muted-foreground">{label}</p>
</div>