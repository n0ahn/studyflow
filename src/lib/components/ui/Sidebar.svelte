<script lang="ts">
    import { page } from '$app/state'
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import { supabase } from '$lib/supabase'
    import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard'
    import BookOpen from '@lucide/svelte/icons/book-open'
    import ClipboardList from '@lucide/svelte/icons/clipboard-list'
    import CheckSquare from '@lucide/svelte/icons/check-square-2'
    import Calendar from '@lucide/svelte/icons/calendar'
    import BarChart3 from '@lucide/svelte/icons/bar-chart-3'
    import Settings from '@lucide/svelte/icons/settings'
    import LogOut from '@lucide/svelte/icons/log-out'
    import Sun from '@lucide/svelte/icons/sun'
    import Moon from '@lucide/svelte/icons/moon'

    type Props = {
        theme: 'dark' | 'light'
        ontoggle: () => void
    }

    let { theme, ontoggle }: Props = $props()

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/subjects',  label: 'Vakken',    icon: BookOpen },
        { href: '/exams',     label: 'Toetsen',   icon: ClipboardList },
        { href: '/tasks',     label: 'Taken',     icon: CheckSquare },
        { href: '/planner',   label: 'Planner',   icon: Calendar },
        { href: '/stats',     label: 'Statistieken', icon: BarChart3 },
    ] as const

    const isActive = (href: string) => page.url.pathname === href

    async function handleLogout() {
        await supabase.auth.signOut()
        goto(resolve('/auth/login'))
    }
</script>

<aside class="w-60 h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border">
    <div class="flex items-center gap-2.5 px-5 py-2 border-b border-sidebar-border">
        <img src="src/lib/assets/logo.png" alt="StudyFlow logo" class="w-10 h-10" />
        <span class="font-semibold text-lg tracking-tight text-foreground">Study<span class="text-[#F5760B] font-bold">Flow</span></span>
    </div>

    <nav class="flex-1 flex flex-col gap-0.5 p-3 overflow-y-auto">
        {#each links as link (link.href)}
            <a
                href={resolve(link.href)}
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                    {isActive(link.href)
                        ? 'bg-accent/15 text-accent font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'}"
            >
                <link.icon size={16} class="shrink-0" />
                <span>{link.label}</span>
                {#if isActive(link.href)}
                    <div class="ml-auto w-1 h-1 rounded-full bg-accent"></div>
                {/if}
            </a>
        {/each}
    </nav>

    <div class="p-3 border-t border-sidebar-border flex flex-col gap-0.5">
        <a
            href={resolve('/settings')}
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                {isActive('/settings')
                    ? 'bg-accent/15 text-accent font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'}"
        >
            <Settings size={16} class="shrink-0" />
            <span>Instellingen</span>
        </a>

        <button
            onclick={ontoggle}
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                text-muted-foreground hover:text-foreground hover:bg-accent/5 w-full text-left"
        >
            {#if theme === 'dark'}
                <Sun size={16} class="shrink-0" />
                <span>Light mode</span>
            {:else}
                <Moon size={16} class="shrink-0" />
                <span>Dark mode</span>
            {/if}
        </button>

        <button
            onclick={handleLogout}
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full text-left"
        >
            <LogOut size={16} class="shrink-0" />
            <span>Uitloggen</span>
        </button>
    </div>
</aside>