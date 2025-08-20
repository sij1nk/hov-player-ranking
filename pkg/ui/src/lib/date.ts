import { CalendarDate } from "@internationalized/date";

export const toCalendarDate = (date: Date): CalendarDate =>
  new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());

export const equalsCalendarDate = (date: Date, calendarDate: CalendarDate): boolean =>
  date.getUTCFullYear() === calendarDate.year &&
  date.getUTCMonth() + 1 === calendarDate.month &&
  date.getUTCDate() === calendarDate.day;
