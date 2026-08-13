import type { StudySessionWithDetails, UserSettings, AvailableTime } from '$lib/types'

const DAY_KEYS: (keyof AvailableTime)[] = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
]

export type ConflictType = 'duplicate_subject' | 'overbooked'

export type Conflict = {
    date: string
    type: ConflictType
    message: string
}

const ACTIVE_STATUSES = new Set(['planned', 'in_progress'])

function getAvailableMinutesForDate(dateStr: string, settings: UserSettings): number {
    const dayKey = DAY_KEYS[new Date(dateStr).getDay()]
    return settings.available_time[dayKey] ?? 0
}

export function detectConflicts(
    sessions: StudySessionWithDetails[],
    settings: UserSettings
): Conflict[] {
    const conflicts: Conflict[] = []

    const active = sessions.filter(s => ACTIVE_STATUSES.has(s.status))

    // Groepeer per dag
    const byDate = new Map<string, StudySessionWithDetails[]>()
    for (const session of active) {
        const list = byDate.get(session.date) ?? []
        list.push(session)
        byDate.set(session.date, list)
    }

    for (const [date, daySessions] of byDate) {
        // Type A: zelfde vak twee keer op één dag
        const bySubject = new Map<string, StudySessionWithDetails[]>()
        for (const session of daySessions) {
            const list = bySubject.get(session.subject_id) ?? []
            list.push(session)
            bySubject.set(session.subject_id, list)
        }

        for (const [, subjectSessions] of bySubject) {
            if (subjectSessions.length > 1) {
                const subjectName = subjectSessions[0].subject.name
                conflicts.push({
                    date,
                    type: 'duplicate_subject',
                    message: `"${subjectName}" staat ${subjectSessions.length}x gepland op deze dag.`
                })
            }
        }

        // Type B: meer gepland dan beschikbaar
        const totalPlanned = daySessions.reduce((sum, s) => sum + s.planned_duration, 0)
        const available = getAvailableMinutesForDate(date, settings)

        if (totalPlanned > available) {
            conflicts.push({
                date,
                type: 'overbooked',
                message: `${totalPlanned} minuten gepland, maar ${available} beschikbaar op deze dag.`
            })
        }
    }

    return conflicts
}

export function getConflictsForDate(conflicts: Conflict[], date: string): Conflict[] {
    return conflicts.filter(c => c.date === date)
}