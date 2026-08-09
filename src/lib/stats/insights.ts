import type { StudySessionWithDetails } from '$lib/types'
import type { Insight, SubjectBreakdownEntry } from './types'

const DAY_NAMES = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']

function effectiveMinutes(session: StudySessionWithDetails): number {
    return session.actual_duration ?? session.planned_duration
}

/**
 * Genereert een lijst verhalende inzichten uit de sessiedata. Puur regel-gebaseerd
 * (geen AI) — elke check produceert hoogstens één inzicht, en alleen als er genoeg
 * data is om de observatie betrouwbaar te maken (voorkomt onzin-conclusies bij weinig data).
 */
export function generateInsights(
    sessions: StudySessionWithDetails[],
    subjectBreakdown: SubjectBreakdownEntry[]
): Insight[] {
    const completed = sessions.filter(s => s.status === 'completed')
    const insights: Insight[] = []

    if (completed.length < 5) {
        return insights // te weinig data voor betrouwbare patronen
    }

    // 1. Beste dag van de week (gemiddeld meeste minuten)
    const bestDay = findBestDayOfWeek(completed)
    if (bestDay) {
        insights.push({
            id: 'best-day',
            text: `Je studeert gemiddeld ${bestDay.percentAboveAverage}% langer op ${bestDay.dayName} dan op andere dagen.`,
            highlights: [`${bestDay.percentAboveAverage}% langer`, bestDay.dayName],
            icon: 'trending-up'
        })
    }

    // 2. Meest verbeterde vak (moeilijkheid daalt significant over tijd)
    const improved = findMostImprovedSubject(completed)
    if (improved) {
        insights.push({
            id: 'most-improved',
            text: `${improved.subjectName} is je meest verbeterde vak — gemiddelde moeilijkheid daalde van ${improved.firstHalfAvg} naar ${improved.secondHalfAvg}.`,
            highlights: [improved.subjectName],
            icon: 'trending-down'
        })
    }

    // 3. Langste sessie ooit
    const longest = completed.reduce((max, s) =>
        effectiveMinutes(s) > effectiveMinutes(max) ? s : max, completed[0])
    const longestMinutes = effectiveMinutes(longest)
    if (longestMinutes >= 60) {
        insights.push({
            id: 'longest-session',
            text: `Je langste focus-sessie ooit was ${formatMinutes(longestMinutes)}, op ${formatDate(longest.date)}.`,
            highlights: [formatMinutes(longestMinutes)],
            icon: 'zap'
        })
    }

    // 4. Vak met hoogste gemiddelde zekerheid (self-efficacy)
    const mostConfident = findMostConfidentSubject(completed)
    if (mostConfident) {
        insights.push({
            id: 'most-confident',
            text: `Je voelt je het zekerst bij ${mostConfident.subjectName}, met een gemiddelde zekerheid van ${mostConfident.avgConfidence}/5.`,
            highlights: [mostConfident.subjectName],
            icon: 'target'
        })
    }

    // 5. Vak dat het meeste tijd opeist
    if (subjectBreakdown.length > 0) {
        const top = subjectBreakdown[0]
        const percent = Math.round(top.shareOfTotal * 100)
        if (percent >= 35) {
            insights.push({
                id: 'time-dominant-subject',
                text: `${top.subjectName} neemt ${percent}% van je totale studietijd in beslag.`,
                highlights: [top.subjectName, `${percent}%`],
                icon: 'calendar'
            })
        }
    }

    return insights
}

function findBestDayOfWeek(completed: StudySessionWithDetails[]): { dayName: string; percentAboveAverage: number } | null {
    const minutesByDayOfWeek: number[] = [0, 0, 0, 0, 0, 0, 0]
    const countByDayOfWeek: number[] = [0, 0, 0, 0, 0, 0, 0]

    for (const s of completed) {
        const dow = new Date(s.date).getDay()
        minutesByDayOfWeek[dow] += effectiveMinutes(s)
        countByDayOfWeek[dow] += 1
    }

    const averages = minutesByDayOfWeek.map((total, i) => countByDayOfWeek[i] === 0 ? 0 : total / countByDayOfWeek[i])
    const overallAverage = averages.reduce((a, b) => a + b, 0) / averages.filter(a => a > 0).length

    let bestIndex = -1
    let bestAvg = 0
    averages.forEach((avg, i) => {
        if (countByDayOfWeek[i] >= 2 && avg > bestAvg) {
            bestAvg = avg
            bestIndex = i
        }
    })

    if (bestIndex === -1 || overallAverage === 0) return null

    const percentAboveAverage = Math.round(((bestAvg - overallAverage) / overallAverage) * 100)
    if (percentAboveAverage < 10) return null // niet significant genoeg om te noemen

    return { dayName: DAY_NAMES[bestIndex], percentAboveAverage }
}

function findMostImprovedSubject(completed: StudySessionWithDetails[]) {
    const bySubject = new Map<string, { subjectName: string; ratings: { date: string; rating: number }[] }>()

    for (const s of completed) {
        if (s.difficulty_rating === null) continue
        const entry = bySubject.get(s.subject_id) ?? { subjectName: s.subject.name, ratings: [] }
        entry.ratings.push({ date: s.date, rating: s.difficulty_rating })
        bySubject.set(s.subject_id, entry)
    }

    let best: { subjectName: string; firstHalfAvg: number; secondHalfAvg: number; improvement: number } | null = null

    for (const entry of bySubject.values()) {
        if (entry.ratings.length < 6) continue // te weinig datapunten voor een betrouwbare trend
        const sorted = entry.ratings.sort((a, b) => a.date.localeCompare(b.date))
        const mid = Math.floor(sorted.length / 2)
        const firstHalf = sorted.slice(0, mid)
        const secondHalf = sorted.slice(mid)

        const firstHalfAvg = average(firstHalf.map(r => r.rating))
        const secondHalfAvg = average(secondHalf.map(r => r.rating))
        const improvement = firstHalfAvg - secondHalfAvg // positief = makkelijker geworden

        if (improvement > 0.5 && (best === null || improvement > best.improvement)) {
            best = {
                subjectName: entry.subjectName,
                firstHalfAvg: round1(firstHalfAvg),
                secondHalfAvg: round1(secondHalfAvg),
                improvement
            }
        }
    }

    return best
}

function findMostConfidentSubject(completed: StudySessionWithDetails[]) {
    const bySubject = new Map<string, { subjectName: string; ratings: number[] }>()

    for (const s of completed) {
        if (s.confidence_rating === null) continue
        const entry = bySubject.get(s.subject_id) ?? { subjectName: s.subject.name, ratings: [] }
        entry.ratings.push(s.confidence_rating)
        bySubject.set(s.subject_id, entry)
    }

    let best: { subjectName: string; avgConfidence: number } | null = null
    for (const entry of bySubject.values()) {
        if (entry.ratings.length < 3) continue
        const avg = round1(average(entry.ratings))
        if (best === null || avg > best.avgConfidence) {
            best = { subjectName: entry.subjectName, avgConfidence: avg }
        }
    }

    return best
}

function average(nums: number[]): number {
    return nums.reduce((a, b) => a + b, 0) / nums.length
}

function round1(n: number): number {
    return Math.round(n * 10) / 10
}

function formatMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m}m`
    return m === 0 ? `${h}u` : `${h}u ${m}m`
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
}