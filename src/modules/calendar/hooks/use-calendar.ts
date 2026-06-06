"use client"

import { useCallback, useState } from "react"

import { type CalendarEvent } from "@/modules/calendar/services/types/calendar-types"

export interface UseCalendarState {
  selectedDate: Date
  showEventForm: boolean
  editingEvent: CalendarEvent | null
  showCalendarSheet: boolean
  events: CalendarEvent[]
}

export interface UseCalendarActions {
  setSelectedDate: (date: Date) => void
  setShowEventForm: (show: boolean) => void
  setEditingEvent: (event: CalendarEvent | null) => void
  setShowCalendarSheet: (show: boolean) => void
  handleDateSelect: (date: Date) => void
  handleNewEvent: () => void
  handleNewCalendar: () => void
  handleSaveEvent: (eventData: Partial<CalendarEvent>) => void
  handleDeleteEvent: (eventId: number) => void
  handleEditEvent: (event: CalendarEvent) => void
}

export interface UseCalendarReturn extends UseCalendarState, UseCalendarActions {}

export function useCalendar(initialEvents: CalendarEvent[] = []): UseCalendarReturn {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [showCalendarSheet, setShowCalendarSheet] = useState(false)
  const [events] = useState<CalendarEvent[]>(initialEvents)

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
    setShowCalendarSheet(false)
  }, [])

  const handleNewEvent = useCallback(() => {
    setEditingEvent(null)
    setShowEventForm(true)
  }, [])

  const handleNewCalendar = useCallback(() => {
    console.log("Creating new calendar")
  }, [])

  const handleSaveEvent = useCallback((eventData: Partial<CalendarEvent>) => {
    console.log("Saving event:", eventData)
    setShowEventForm(false)
    setEditingEvent(null)
  }, [])

  const handleDeleteEvent = useCallback((eventId: number) => {
    console.log("Deleting event:", eventId)
    setShowEventForm(false)
    setEditingEvent(null)
  }, [])

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }, [])

  return {
    selectedDate,
    showEventForm,
    editingEvent,
    showCalendarSheet,
    events,
    setSelectedDate,
    setShowEventForm,
    setEditingEvent,
    setShowCalendarSheet,
    handleDateSelect,
    handleNewEvent,
    handleNewCalendar,
    handleSaveEvent,
    handleDeleteEvent,
    handleEditEvent,
  }
}
