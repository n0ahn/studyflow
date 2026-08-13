<script lang="ts">
    import { supabase } from '$lib/supabase'
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import logo from '$lib/assets/logo.png'
    import biglogo from '$lib/assets/biglogo.png'

    let newPassword = $state('')
    let confirmPassword = $state('')
    let error = $state<string | null>(null)
    let success = $state(false)
    let loading = $state(false)

    async function handleUpdatePassword() {
        if (newPassword !== confirmPassword) {
            error = "Wachtwoorden komen niet overeen."
            return
        }

        if (newPassword.length < 6) {
            error = "Het wachtwoord moet minimaal 6 tekens lang zijn."
            return
        }

        loading = true
        error = null

        // Update het wachtwoord van de momenteel (via de mail-link) ingelogde gebruiker
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        })

        if (updateError) {
            error = updateError.message
            loading = false
            return
        }

        success = true
        loading = false

        // Stuur de gebruiker na een korte pauze naar het dashboard
        setTimeout(() => {
            goto(resolve('/dashboard'))
        }, 2000)
    }
</script>

<div class="relative min-h-screen flex flex-col justify-between bg-background text-foreground overflow-hidden px-6 py-8">
    <!-- Ambient achtergrondgloed -->
    <div
        class="pointer-events-none absolute inset-0"
        style="background:
            radial-gradient(ellipse 1000px 800px at 50% -20%, oklch(from var(--accent) l c h / 15%), transparent 70%),
            radial-gradient(ellipse 800px 600px at 80% 120%, oklch(from var(--accent) l c h / 8%, transparent 60%);"
    ></div>

    <!-- Grid patroon -->
    <div 
        class="absolute inset-0 pointer-events-none opacity-20"
        style="background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);"
    ></div>

    <!-- Topbar met logo -->
    <header class="relative z-10 flex items-center justify-between max-w-7xl mx-auto w-full">
        <a href={resolve('/')} class="flex items-center gap-3">
            <img src={logo} alt="StudyFlow Logo" class="w-8 h-8 object-contain" />
            <span class="text-lg font-bold tracking-tight">StudyFlow</span>
        </a>
    </header>

    <!-- Formulier gecentreerd -->
    <main class="relative z-10 flex-1 flex items-center justify-center">
        <div class="w-full max-w-md card p-8 backdrop-blur-xl bg-card/80 border-border shadow-2xl flex flex-col gap-6">
            <div>
                <h1 class="text-2xl font-bold tracking-tight mb-1">Nieuw wachtwoord</h1>
                <p class="text-sm text-muted-foreground">Kies een sterk nieuw wachtwoord voor je account.</p>
            </div>

            {#if error}
                <div class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                </div>
            {/if}

            {#if success}
                <div class="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium text-center">
                    Wachtwoord succesvol gewijzigd! Je wordt nu doorgestuurd...
                </div>
            {:else}
                <form onsubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }} class="flex flex-col gap-4">
                    <div class="flex flex-col gap-1.5">
                        <label for="new-password" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nieuw wachtwoord</label>
                        <input
                            id="new-password"
                            type="password"
                            placeholder="••••••••"
                            bind:value={newPassword}
                            required
                            minlength="6"
                            class="input"
                        />
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <label for="confirm-password" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bevestig wachtwoord</label>
                        <input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            bind:value={confirmPassword}
                            required
                            minlength="6"
                            class="input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        class="mt-2 group flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] disabled:opacity-50"
                        style="background: linear-gradient(135deg, oklch(from var(--accent) calc(l * 1.15) c h), var(--accent)); box-shadow: 0 0 0 1px oklch(from var(--accent) l c h / 35%), 0 10px 25px oklch(from var(--accent) l c h / 35%);"
                    >
                        {loading ? 'Bezig met opslaan...' : 'Wachtwoord opslaan'}
                    </button>
                </form>
            {/if}
        </div>
    </main>

    <!-- Glurende mascotte -->
    <div class="peek-container absolute bottom-0 right-2 md:right-10 z-20 group cursor-pointer flex flex-col items-end pointer-events-none">
        <div 
            class="speech-bubble opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none mb-3 px-4 py-2.5 rounded-2xl text-xs font-medium shadow-2xl backdrop-blur-2xl border"
            style="background: oklch(from var(--background) l c h / 90%); border-color: oklch(from var(--accent) l c h / 30%); color: var(--foreground);"
        >
            <p class="m-0 flex items-center gap-1.5 whitespace-nowrap">
                🔒 <span style="color: oklch(from var(--accent) calc(l * 1.15) c h); font-weight: 600;">Bijna klaar!</span> Zorg dat je het onthoudt.
            </p>
        </div>

        <div class="relative pointer-events-auto">
            <div 
                class="absolute inset-0 rounded-full blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-90"
                style="background: radial-gradient(circle, oklch(from var(--accent) l c h / 60%), transparent 70%);"
            ></div>
            
            <img 
                src={biglogo} 
                alt="StudyFlow Mascot" 
                class="relative z-10 w-28 md:w-36 object-contain drop-shadow-2xl transition-transform duration-300 origin-bottom-right group-hover:-translate-y-4 group-hover:-translate-x-2 group-hover:rotate-6 group-hover:scale-105"
            />
        </div>
    </div>
</div>

<style>
    .peek-container {
        animation: peek 6s ease-in-out infinite;
        transform-origin: bottom right;
    }

    @keyframes peek {
        0%, 100% { transform: translateY(20px) translateX(10px) rotate(-8deg); }
        50% { transform: translateY(8px) translateX(4px) rotate(-4deg); }
    }
</style>