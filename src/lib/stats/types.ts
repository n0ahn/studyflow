import type { StudySessionWithDetails, ExamWithSubject } from '$lib/types'

/** Ruwe input voor alle aggregatiefuncties in deze module. */
export type StatsInput = {
    sessions: StudySessionWithDetails[]
    upcomingExams: ExamWithSubject[]
    today: Date
}

// --- Hero / kernstats ---

export type WeekSummary = {
    minutesThisWeek: number
    minutesLastWeek: number
    /** Percentuele verandering t.o.v. vorige week. Null als vorige week 0 minuten was (delen door nul). */
    trendPercent: number | null
    currentStreak: number
    longestStreak: number
    /** % dagen met minstens één voltooide sessie, over de laatste 30 dagen. */
    consistencyPercent: number
}

export type CoreStats = {
    averageSessionMinutes: number
    completedSessionCount: number
    /** % van geplande minuten die ook daadwerkelijk (via completed sessies) gehaald is. */
    planAdherencePercent: number
    averageDifficulty: number | null
    averageConfidence: number | null
}

// --- Heatmap ---

export type HeatmapDay = {
    date: string
    minutes: number
    /** 0 = geen activiteit, 4 = hoogste intensiteit die dag in de dataset. */
    level: 0 | 1 | 2 | 3 | 4
}

// --- Trend over tijd ---

export type WeeklyTrendPoint = {
    weekStart: string
    minutes: number
}

// --- Per vak ---

export type SubjectBreakdownEntry = {
    subjectId: string
    subjectName: string
    subjectColor: string
    totalMinutes: number
    sessionCount: number
    averageDifficulty: number | null
    /** Fractie (0-1) van totale studietijd, voor balk-breedte. */
    shareOfTotal: number
}

// --- Planning vs. werkelijkheid ---

export type PlannedVsActualPoint = {
    weekStart: string
    plannedMinutes: number
    actualMinutes: number
}

// --- Voortgang per toets ---

export type ExamProgressEntry = {
    examId: string
    examName: string
    subjectColor: string
    examDate: string
    estimatedMinutes: number
    plannedMinutes: number
    completedMinutes: number
    /** completedMinutes / estimatedMinutes, geclamped op [0, 1]. */
    progressFraction: number
}

// --- Inzichten (verhalend) ---

export type Insight = {
    id: string
    text: string
    /** Substring(en) van `text` die extra geaccentueerd getoond moeten worden. */
    highlights: string[]
    icon: 'trending-up' | 'trending-down' | 'flame' | 'zap' | 'target' | 'calendar' | 'award'
}