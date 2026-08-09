import type { PlannerItem } from './types'
import type { Exam, Task, Subject, UserSettings } from '$lib/types'

const DIFFICULTY_WEIGHT = {
    easy: 0.8,
    medium: 1.0,
    hard: 1.3
}

const PRIORITY_WEIGHT = {
    low: 0.8,
    medium: 1.0,
    high: 1.4
}

function daysUntil(deadline: string, today: Date): number {
    const diff = new Date(deadline).getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function scoreExam(exam: Exam & { subject: Subject }, today: Date): PlannerItem {
    const days = Math.max(daysUntil(exam.exam_date, today), 1)
    const difficultyWeight = DIFFICULTY_WEIGHT[exam.difficulty]
    const urgencyScore = (difficultyWeight * exam.estimated_study_time) / days

    const startDate = new Date(exam.exam_date)
    startDate.setDate(startDate.getDate() - exam.start_offset)

    return {
        id: exam.id,
        type: 'exam',
        subject: exam.subject,
        deadline: exam.exam_date,
        startDate: startDate.toISOString().split('T')[0],
        remainingMinutes: exam.estimated_study_time,
        urgencyScore,
        exam
    }
}

export function scoreTask(task: Task & { subject: Subject }, today: Date): PlannerItem {
    const days = Math.max(daysUntil(task.deadline, today), 1)
    const priorityWeight = PRIORITY_WEIGHT[task.priority]
    const urgencyScore = (priorityWeight * task.estimated_time) / days

    const startDate = new Date(task.deadline)
    startDate.setDate(startDate.getDate() - task.start_offset)

    return {
        id: task.id,
        type: 'task',
        subject: task.subject,
        deadline: task.deadline,
        startDate: startDate.toISOString().split('T')[0],
        remainingMinutes: task.estimated_time,
        urgencyScore,
        task
    }
}

export function sortByUrgency(items: PlannerItem[]): PlannerItem[] {
    return [...items].sort((a, b) => b.urgencyScore - a.urgencyScore)
}