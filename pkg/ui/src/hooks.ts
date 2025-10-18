import { CalendarDate } from "@internationalized/date";
import type { Transport } from "@sveltejs/kit";

export const transport: Transport = {
  CalendarDate: {
    encode: (value) => value instanceof CalendarDate && [value.year, value.month, value.day],
    decode: ([y, m, d]) => new CalendarDate(y, m, d),
  },
};
