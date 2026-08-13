// Enums
export type DifficultyLevel = 'easy' | 'medium' | 'hard'
export type ExamStatus = 'planned' | 'in_progress' | 'completed'
export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'
export type SessionStatus = 'planned' | 'in_progress' | 'completed' | 'missed'

// User
export type User = {
    id: string
    email: string
    created_at: string
}

// Subject
export type Subject = {
    id: string
    user_id: string
    name: string
    color: string
    teacher: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

// Exam
export type Exam = {
    id: string
    user_id: string
    subject_id: string
    name: string
    exam_date: string
    chapters: string[]
    difficulty: DifficultyLevel
    target_grade: number
    estimated_study_time: number
    notes: string | null
    status: ExamStatus
    created_at: string
    updated_at: string
    start_offset: number
}

// Task
export type Task = {
    id: string
    user_id: string
    subject_id: string
    title: string
    description: string | null
    deadline: string
    priority: TaskPriority
    estimated_time: number
    status: TaskStatus
    created_at: string
    updated_at: string
    start_offset: number
}

export type ChecklistItem = {
    text: string
    done: boolean
}


// StudySession (fase 5)
export type StudySession = {
    id: string
    user_id: string
    subject_id: string
    exam_id: string | null
    task_id: string | null
    date: string
    planned_duration: number
    actual_duration: number | null
    status: SessionStatus
    locked: boolean
    difficulty_rating: number | null
    confidence_rating: number | null
    notes: string | null
    checklist: ChecklistItem[]
    created_at: string
    updated_at: string
}

export type AvailableTime = {
    monday: number
    tuesday: number
    wednesday: number
    thursday: number
    friday: number
    saturday: number
    sunday: number
}

export type UserSettings = {
    id: string
    user_id: string
    available_time: AvailableTime
    session_duration: number
    break_duration: number
    planning_horizon: number
    created_at: string
    updated_at: string
}



// Relational types (handig voor queries met joins)
export type ExamWithSubject = Exam & {
    subject: Subject
}

export type TaskWithSubject = Task & {
    subject: Subject
}

export type StudySessionWithSubject = StudySession & {
    subject: Subject
    exam: Exam | null
}

export type StudySessionWithDetails = StudySession & {
    subject: Subject
    exam: Exam | null
    task: Task | null
    is_review: boolean
}