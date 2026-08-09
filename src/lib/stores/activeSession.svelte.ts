import { getContext, setContext } from 'svelte'

const ACTIVE_SESSION_KEY = Symbol('activeSession')
const STORAGE_KEY = 'studyflow:activeSession'

type StoredActiveSession = {
    sessionId: string
    startedAt: number | null
    accumulatedSeconds: number
    paused: boolean
    plannedDuration: number
}

class ActiveSessionState {
    sessionId = $state<string | null>(null)
    startedAt = $state<number | null>(null)
    accumulatedSeconds = $state(0)
    paused = $state(false)
    plannedDuration = $state(0)
    now = $state(Date.now())

    private tickInterval: ReturnType<typeof setInterval> | null = null

    constructor() {
        this.restore()
        this.startTicking()
    }

    private restore() {
        if (typeof localStorage === 'undefined') return

        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return

        try {
            const stored: StoredActiveSession = JSON.parse(raw)
            this.sessionId = stored.sessionId
            this.startedAt = stored.startedAt
            this.accumulatedSeconds = stored.accumulatedSeconds
            this.paused = stored.paused
            this.plannedDuration = stored.plannedDuration
        } catch {
            localStorage.removeItem(STORAGE_KEY)
        }
    }

    private persist() {
        if (typeof localStorage === 'undefined') return

        if (this.sessionId === null) {
            localStorage.removeItem(STORAGE_KEY)
            return
        }

        const stored: StoredActiveSession = {
            sessionId: this.sessionId,
            startedAt: this.startedAt,
            accumulatedSeconds: this.accumulatedSeconds,
            paused: this.paused,
            plannedDuration: this.plannedDuration
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    }

    private startTicking() {
        if (this.tickInterval !== null) return
        this.tickInterval = setInterval(() => {
            this.now = Date.now()
        }, 1000)
    }

    start(sessionId: string, plannedDuration: number) {
        this.sessionId = sessionId
        this.startedAt = Date.now()
        this.accumulatedSeconds = 0
        this.paused = false
        this.plannedDuration = plannedDuration
        this.now = Date.now()
        this.persist()
    }

    pause() {
        if (this.paused || this.startedAt === null) return
        this.accumulatedSeconds += Math.floor((Date.now() - this.startedAt) / 1000)
        this.startedAt = null
        this.paused = true
        this.persist()
    }

    resume() {
        if (!this.paused) return
        this.startedAt = Date.now()
        this.now = Date.now()
        this.paused = false
        this.persist()
    }

    clear() {
        this.sessionId = null
        this.startedAt = null
        this.accumulatedSeconds = 0
        this.paused = false
        this.plannedDuration = 0
        this.persist()
    }

    get isActive() {
        return this.sessionId !== null
    }

    get elapsedSeconds() {
        if (this.startedAt === null) return this.accumulatedSeconds
        return this.accumulatedSeconds + Math.floor((this.now - this.startedAt) / 1000)
    }

    get remainingSeconds() {
        const total = this.plannedDuration * 60
        return Math.max(0, total - this.elapsedSeconds)
    }

    get isOvertime() {
        return this.isActive && this.remainingSeconds === 0
    }
}

export function setActiveSessionContext() {
    return setContext(ACTIVE_SESSION_KEY, new ActiveSessionState())
}

export function getActiveSessionContext(): ActiveSessionState {
    return getContext(ACTIVE_SESSION_KEY)
}