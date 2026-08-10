<script lang="ts">
    import './layout.css'
    import { setAuthContext, setActiveSessionContext } from '$lib/stores'
    import { initTheme, toggleTheme } from '$lib/stores/theme'
    import Sidebar from '$lib/components/ui/Sidebar.svelte'
    import type { LayoutData } from './$types'
    import { onMount } from 'svelte'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { data, children }: { data: LayoutData, children: any } = $props()

    setAuthContext(() => data.session)
    setActiveSessionContext()

    // Hier is data.pathname === '/' toegevoegd!
    const isFullscreenRoute = $derived(
        data.pathname === '/' || data.pathname?.startsWith('/auth') || data.pathname?.startsWith('/focus')
    )

    let theme = $state<'dark' | 'light'>('dark')

    onMount(() => {
        theme = initTheme()
    })

    function handleToggle() {
        theme = toggleTheme()
    }
</script>

<svelte:head>
    <link rel="icon" href="src/lib/assets/favicon.ico" />
    <title>StudyFlow</title>
</svelte:head>

{#if isFullscreenRoute}
    {@render children()}
{:else}
    <div class="flex min-h-screen bg-background text-foreground">
        <Sidebar {theme} ontoggle={handleToggle} />
        <main class="flex-1 overflow-y-auto p-8">
            {@render children()}
        </main>
    </div>
{/if}