<script lang="ts">
    import ArrowRight from '@lucide/svelte/icons/arrow-right'
    import { resolve } from '$app/paths'
    import logo from '$lib/assets/logo.png'
    import biglogo from '$lib/assets/biglogo.png'
</script>

<div class="relative min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
    <!-- Ambient achtergrondgloed (gebaseerd op je accentkleur) -->
    <div
        class="pointer-events-none absolute inset-0"
        style="background:
            radial-gradient(ellipse 1000px 800px at 50% -20%, oklch(from var(--accent) l c h / 15%), transparent 70%),
            radial-gradient(ellipse 800px 600px at 80% 120%, oklch(from var(--accent) l c h / 8%, transparent 60%);"
    ></div>

    <!-- Grid patroon voor een technische/moderne look -->
    <div 
        class="absolute inset-0 pointer-events-none opacity-20"
        style="background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);"
    ></div>

    <!-- Navigatie -->
    <header class="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div class="flex items-center gap-3">
            <img src={logo} alt="StudyFlow Logo" class="w-8 h-8 object-contain" />
            <span class="text-lg font-bold tracking-tight">StudyFlow</span>
        </div>

        <div class="flex items-center gap-4">
            <a 
                href={resolve('/auth/login')}
                class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
                Inloggen
            </a>
            <a 
                href={resolve('/auth/signup')}
                class="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
                style="background: var(--accent); box-shadow: 0 4px 14px oklch(from var(--accent) l c h / 30%);"
            >
                Start nu
            </a>
        </div>
    </header>

    <!-- Hero Sectie -->
    <main class="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto w-full pb-20 pt-10">
        
        <div 
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 border"
            style="background: oklch(from var(--accent) l c h / 5%); border-color: oklch(from var(--accent) l c h / 15%);"
        >
            <span class="flex h-2 w-2 rounded-full" style="background-color: var(--accent); box-shadow: 0 0 8px var(--accent);"></span>
            <span class="text-xs font-medium" style="color: oklch(from var(--accent) calc(l * 1.15) c h);">Nieuw: Slimme planning & focus timers</span>
        </div>

        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
            Grip op je studie,<br />
            <span style="color: oklch(from var(--accent) calc(l * 1.15) c h); text-shadow: 0 0 40px oklch(from var(--accent) l c h / 30%);">zonder de stress.</span>
        </h1>
        
        <p class="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Plan je sessies, houd je focus vast met de ingebouwde timer en krijg direct inzicht in je voortgang voor komende toetsen.
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-4">
            <a 
                href={resolve('/auth/signup')}
                class="group flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-base text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]"
                style="background: linear-gradient(135deg, oklch(from var(--accent) calc(l * 1.15) c h), var(--accent)); box-shadow: 0 0 0 1px oklch(from var(--accent) l c h / 35%), 0 10px 36px oklch(from var(--accent) l c h / 45%);"
            >
                Gratis Account Aanmaken
                <ArrowRight size={18} class="transition-transform group-hover:translate-x-1" />
            </a>
            
            <a 
                href={resolve('/auth/login')}
                class="flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-base bg-white/4 backdrop-blur-2xl border border-white/9 text-foreground transition-all duration-300 hover:bg-white/8 hover:-translate-y-0.5"
            >
                Ik heb al een account
            </a>
        </div>
    </main>

    <!-- Professionele glurende mascotte rechtsonder met tekstwolk erboven op hover -->
    <div class="peek-container absolute bottom-0 right-2 md:right-10 z-20 group cursor-pointer flex flex-col items-end">
        
        <!-- Het tekstwolkje dat alleen verschijnt bij hover en netjes erboven staat -->
        <div 
            class="speech-bubble opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none mb-3 px-4 py-2.5 rounded-2xl text-xs font-medium shadow-2xl backdrop-blur-2xl border"
            style="background: oklch(from var(--background) l c h / 90%); border-color: oklch(from var(--accent) l c h / 30%); color: var(--foreground);"
        >
            <p class="m-0 flex items-center gap-1.5 whitespace-nowrap">
                🔥 <span style="color: oklch(from var(--accent) calc(l * 1.15) c h); font-weight: 600;">Klaar om te knallen?</span> Start je sessie vandaag nog!
            </p>
        </div>

        <div class="relative cursor-pointer">
            <div 
                class="absolute inset-0 rounded-full blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-90"
                style="background: radial-gradient(circle, oklch(from var(--accent) l c h / 60%), transparent 70%);"
            ></div>
            
            <!-- De mascotte met biglogo.png -->
            <img 
                src={biglogo} 
                alt="StudyFlow Mascot" 
                class="relative z-10 w-32 md:w-44 object-contain drop-shadow-2xl transition-transform duration-300 origin-bottom-right group-hover:-translate-y-4 group-hover:-translate-x-2 group-hover:rotate-6 group-hover:scale-105"
            />
        </div>
    </div>
</div>

<style>
    /* Subtiele rustige ademhaling in ruststand */
    .peek-container {
        animation: peek 6s ease-in-out infinite;
        transform-origin: bottom right;
    }

    @keyframes peek {
        0%, 100% { transform: translateY(20px) translateX(10px) rotate(-8deg); }
        50% { transform: translateY(8px) translateX(4px) rotate(-4deg); }
    }
</style>