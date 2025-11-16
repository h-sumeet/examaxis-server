import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

// Returns the current date and time as a JavaScript Date object
export const currentDate = (): Date => dayjs().toDate();

// Returns the current year (e.g., 2025)
export const currentYear = (): number => dayjs().year();

// Adds the specified number of seconds to the current date
export const addSeconds = (seconds: number): Date =>
  dayjs().add(seconds, "second").toDate();

// Adds the specified number of minutes to the current date
export const addMinutes = (minutes: number): Date =>
  dayjs().add(minutes, "minute").toDate();

// Adds the specified number of days to the current date
export const addDays = (days: number): Date =>
  dayjs().add(days, "day").toDate();

// Converts minutes to milliseconds
export const convertToMilliseconds = (minutes: number): number =>
  dayjs.duration(minutes, "minutes").asMilliseconds();

// Formats a timestamp to "MM/DD/YYYY hh:mma" format
export const formatTimestamp = (date: Date = dayjs().toDate()): string =>
  dayjs(date).format("DD/MM/YYYY hh:mm a");

// Formats uptime in seconds into human-readable string (e.g., "1 yr 2 days 3 hrs 4 mins 5 secs")
export const formatUptime = (seconds: number): string => {
  const d = dayjs.duration(seconds, "seconds");

  return [
    d.years() ? `${d.years()} yr${d.years() > 1 ? "s" : ""}` : "",
    d.months() ? `${d.months()} mo${d.months() > 1 ? "s" : ""}` : "",
    d.days() ? `${d.days()} day${d.days() > 1 ? "s" : ""}` : "",
    d.hours() ? `${d.hours()} hr${d.hours() > 1 ? "s" : ""}` : "",
    d.minutes() ? `${d.minutes()} min${d.minutes() > 1 ? "s" : ""}` : "",
    `${d.seconds()} sec${d.seconds() > 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(" ");
};
