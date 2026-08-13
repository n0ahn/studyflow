import type { Exam, Task, Subject, UserSettings } from '$lib/types'

export type PlannerItem = {
    id: string
    type: 'exam' | 'task'
    subject: Subject
    deadline: string
    startDate: string
    remainingMinutes: number
    urgencyScore: number
    exam?: Exam
    task?: Task
}

export type LockedSession = {
    subject_id: string
    exam_id: string | null
    task_id: string | null
    date: string
    planned_duration: number
}

export type PlannerInput = {
    exams: (Exam & { subject: Subject })[]
    tasks: (Task & { subject: Subject })[]
    settings: UserSettings
    today: Date
    lockedSessions?: LockedSession[]
}

export type PlannedSession = {
    subject_id: string
    exam_id: string | null
    task_id: string | null
    date: string
    planned_duration: number
    is_review: boolean
}
