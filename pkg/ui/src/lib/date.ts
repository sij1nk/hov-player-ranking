import { CalendarDate } from "@internationalized/date";

export const toCalendarDate = (date: Date): CalendarDate =>
  new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
