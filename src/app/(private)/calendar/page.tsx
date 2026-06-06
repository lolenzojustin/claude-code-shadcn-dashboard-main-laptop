import { Calendar } from "@/modules/calendar/components/calendar"
import { getCalendarData } from "@/modules/calendar/services/calendar-services"

export default async function CalendarPage() {
  const { events, eventDates } = await getCalendarData()

  return (
    <div className="px-4 lg:px-6">
      <Calendar events={events} eventDates={eventDates} />
    </div>
  )
}
