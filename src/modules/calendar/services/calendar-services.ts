import { getFirestoreCollection, getFirestoreDocumentCollection } from "@/lib/firebase/firestore-query"
import { calendars, eventDates, events } from "./calendar-mock-data"
import { type CalendarEvent } from "./types/calendar-types"
import type { Calendar } from "./types/calendar-types"

type FirestoreDateLike =
  | Date
  | string
  | { toDate: () => Date }
  | { seconds: number; nanoseconds?: number }

type StoredCalendarEvent = Omit<CalendarEvent, "date"> & {
  date: FirestoreDateLike
}

type StoredEventDate = {
  date: FirestoreDateLike
  count: number
}

function normalizeDate(date: FirestoreDateLike) {
  if (date instanceof Date) {
    return date
  }

  if (typeof date === "string") {
    return new Date(date)
  }

  if (date && typeof date === "object") {
    if ("toDate" in date && typeof date.toDate === "function") {
      return date.toDate()
    }
    if ("seconds" in date && typeof date.seconds === "number") {
      return new Date(
        date.seconds * 1000 + Math.round((date.nanoseconds ?? 0) / 1000000)
      )
    }
  }

  return new Date(date as any)
}

export async function getCalendarData() {
  const [storedEvents, storedEventDates, storedCalendars] = await Promise.all([
    getFirestoreCollection<StoredCalendarEvent>("events", events),
    getFirestoreDocumentCollection<StoredEventDate>("eventDates", eventDates),
    getFirestoreCollection<Calendar>("calendars", calendars),
  ])

  return {
    events: storedEvents.map((event) => ({
      ...event,
      date: normalizeDate(event.date),
    })),
    eventDates: storedEventDates.map((eventDate) => ({
      ...eventDate,
      date: normalizeDate(eventDate.date),
    })),
    calendars: storedCalendars,
  }
}
