export function initTheme() {
    const stored = localStorage.getItem('theme') ?? 'dark'
    document.documentElement.classList.toggle('dark', stored === 'dark')
    return stored as 'dark' | 'light'
}

export function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    return isDark ? 'dark' : 'light'
}