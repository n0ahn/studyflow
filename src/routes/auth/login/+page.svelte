<script lang="ts">
    import { supabase } from '$lib/supabase'
    import { goto } from '$app/navigation'
    import { resolve } from '$app/paths'
    import logo from '$lib/assets/logo.png'
    import biglogo from '$lib/assets/biglogo.png'
    import { onMount } from 'svelte'

    let email = $state('')
    let password = $state('')
    let error = $state<string | null>(null)
    let successMsg = $state<string | null>(null)
    let loading = $state(false)
    let isResetMode = $state(false)

    function toggleMode() {
        isResetMode = !isResetMode
        error = null
        successMsg = null
        password = ''
    }

    async function handleLogin() {
        loading = true
        error = null
        successMsg = null

        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

        if (authError) {
            error = authError.message
            loading = false
            return
        }

        goto(resolve('/dashboard'))
    }

    async function handlePasswordReset() {
        if (!email) {
            error = "Vul eerst je e-mailadres in."
            return
        }

        loading = true
        error = null
        successMsg = null

        // Zorg ervoor dat je in Supabase je 'Site URL' of Redirect URL goed hebt ingesteld
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/update-password`,
        })

        if (resetError) {
            error = resetError.message
        } else {
            successMsg = "We hebben een herstellink naar je e-mailadres gestuurd!"
        }
        loading = false
    }

    function handleSubmit(e: Event) {
        e.preventDefault()
        if (isResetMode) {
            handlePasswordReset()
        } else {
            handleLogin()
        }
    }

    onMount(() => {
        // Check of er een error in de URL hash zit (achter de #)
        const hash = window.location.hash
        if (hash.includes('error=')) {
            // Zet de hash tijdelijk om naar een query string formaat zodat we hem makkelijk kunnen lezen
            const params = new URLSearchParams(hash.replace('#', '?'))
            const errorDesc = params.get('error_description')
            
            if (errorDesc) {
                // Vertaal de specifieke Supabase error naar begrijpelijk Nederlands
                if (errorDesc.includes('expired') || errorDesc.includes('invalid')) {
                    error = "De link is ongeldig of verlopen. Vraag alsjeblieft een nieuwe herstellink aan."
                    isResetMode = true // Optioneel: zet ze direct in het "wachtwoord vergeten" formulier
                } else {
                    error = errorDesc.replace(/\+/g, ' ') // Vervang + door spaties
                }
                
                // Maak de URL weer schoon voor de netheid
                window.history.replaceState(null, '', window.location.pathname)
            }
        }
    })
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
                <h1 class="text-2xl font-bold tracking-tight mb-1">
                    {isResetMode ? 'Wachtwoord herstellen' : 'Inloggen'}
                </h1>
                <p class="text-sm text-muted-foreground">
                    {isResetMode 
                        ? 'Vul je e-mailadres in en we sturen je een link om je wachtwoord opnieuw in te stellen.' 
                        : 'Welkom terug! Log in om verder te gaan met studeren.'}
                </p>
            </div>

            {#if error}
                <div class="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                </div>
            {/if}

            {#if successMsg}
                <div class="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
                    {successMsg}
                </div>
            {/if}

            <form onsubmit={handleSubmit} class="flex flex-col gap-4">
                <div class="flex flex-col gap-1.5">
                    <label for="email" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mailadres</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="jouw@email.nl"
                        bind:value={email}
                        required
                        class="input"
                    />
                </div>

                {#if !isResetMode}
                    <div class="flex flex-col gap-1.5">
                        <div class="flex justify-between items-center">
                            <label for="password" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wachtwoord</label>
                            <button type="button" onclick={toggleMode} class="text-xs font-medium hover:underline text-muted-foreground hover:text-foreground">
                                Vergeten?
                            </button>
                        </div>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            bind:value={password}
                            required={!isResetMode}
                            class="input"
                        />
                    </div>
                {/if}

                <button
                    type="submit"
                    disabled={loading}
                    class="mt-2 group flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] disabled:opacity-50"
                    style="background: linear-gradient(135deg, oklch(from var(--accent) calc(l * 1.15) c h), var(--accent)); box-shadow: 0 0 0 1px oklch(from var(--accent) l c h / 35%), 0 10px 25px oklch(from var(--accent) l c h / 35%);"
                >
                    {#if isResetMode}
                        {loading ? 'Bezig met versturen...' : 'Stuur herstellink'}
                    {:else}
                        {loading ? 'Bezig met inloggen...' : 'Inloggen'}
                    {/if}
                </button>
            </form>

            <div class="text-center text-sm text-muted-foreground pt-2 border-t border-border">
                {#if isResetMode}
                    Weer herinnerd? 
                    <button type="button" onclick={toggleMode} class="font-medium hover:underline" style="color: oklch(from var(--accent) calc(l * 1.15) c h);">
                        Terug naar inloggen
                    </button>
                {:else}
                    Nog geen account? 
                    <a href={resolve('/auth/signup')} class="font-medium hover:underline" style="color: oklch(from var(--accent) calc(l * 1.15) c h);">
                        Registreer hier
                    </a>
                {/if}
            </div>
        </div>
    </main>

    <!-- Glurende mascotte rechtsonder met tekstwolk op hover -->
    <div class="peek-container absolute bottom-0 right-2 md:right-10 z-20 group cursor-pointer flex flex-col items-end pointer-events-none">
        <!-- Tekstwolkje -->
        <div 
            class="speech-bubble opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none mb-3 px-4 py-2.5 rounded-2xl text-xs font-medium shadow-2xl backdrop-blur-2xl border"
            style="background: oklch(from var(--background) l c h / 90%); border-color: oklch(from var(--accent) l c h / 30%); color: var(--foreground);"
        >
            <p class="m-0 flex items-center gap-1.5 whitespace-nowrap">
                🔥 <span style="color: oklch(from var(--accent) calc(l * 1.15) c h); font-weight: 600;">Welkom terug!</span> Tijd om te knallen.
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