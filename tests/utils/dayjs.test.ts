import {
  currentDate,
  currentYear,
  addSeconds,
  addMinutes,
  addDays,
  convertToMilliseconds,
  formatTimestamp,
  formatUptime,
} from "../../src/utils/dayjs";

describe("DayJS Utils", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-01-15T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("currentDate", () => {
    it("should return current date", () => {
      const result = currentDate();
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(new Date("2025-01-15T12:00:00Z").getTime());
    });
  });

  describe("currentYear", () => {
    it("should return current year", () => {
      const result = currentYear();
      expect(result).toBe(2025);
    });
  });

  describe("addSeconds", () => {
    it("should add seconds to current date", () => {
      const result = addSeconds(30);
      const expected = new Date("2025-01-15T12:00:30Z");
      expect(result.getTime()).toBe(expected.getTime());
    });
  });

  describe("addMinutes", () => {
    it("should add minutes to current date", () => {
      const result = addMinutes(15);
      const expected = new Date("2025-01-15T12:15:00Z");
      expect(result.getTime()).toBe(expected.getTime());
    });
  });

  describe("addDays", () => {
    it("should add days to current date", () => {
      const result = addDays(2);
      const expected = new Date("2025-01-17T12:00:00Z");
      expect(result.getTime()).toBe(expected.getTime());
    });
  });

  describe("convertToMilliseconds", () => {
    it("should convert minutes to milliseconds", () => {
      const result = convertToMilliseconds(5);
      expect(result).toBe(5 * 60 * 1000);
    });
  });

  describe("formatTimestamp", () => {
    it("should format current date correctly", () => {
      const result = formatTimestamp();
      // Note: The actual format is "DD/MM/YYYY hh:mm a" (not "MM/DD/YYYY hh:mma")
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} [ap]m$/);
    });

    it("should format specific date correctly", () => {
      const testDate = new Date("2025-01-15T14:30:00Z");
      const result = formatTimestamp(testDate);
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} [ap]m$/);
    });

    it("should handle different times of day", () => {
      // Test with current time (which is mocked to 12:00 PM)
      const currentResult = formatTimestamp();
      expect(currentResult).toContain("pm");

      // Test with a time that should definitely be AM (early morning)
      const earlyMorning = new Date("2025-01-15T06:00:00Z");
      const earlyResult = formatTimestamp(earlyMorning);
      expect(earlyResult).toContain("am");

      // Test with a time that should definitely be PM (late evening)
      // Use 1:30 PM UTC which should definitely be PM
      const lateEvening = new Date("2025-01-15T13:30:00Z");
      const lateResult = formatTimestamp(lateEvening);
      expect(lateResult).toContain("pm");
    });
  });

  describe("formatUptime", () => {
    it("should format zero seconds", () => {
      const result = formatUptime(0);

      expect(result).toBe("0 sec");
    });

    it("should format seconds only", () => {
      const result = formatUptime(45);

      expect(result).toBe("45 secs");
    });

    it("should format minutes and seconds", () => {
      const result = formatUptime(125); // 2 minutes 5 seconds

      expect(result).toBe("2 mins 5 secs");
    });

    it("should format hours, minutes and seconds", () => {
      const result = formatUptime(7325); // 2 hours 2 minutes 5 seconds

      expect(result).toBe("2 hrs 2 mins 5 secs");
    });

    it("should format days, hours, minutes and seconds", () => {
      const result = formatUptime(90000); // 1 day 1 hour 0 minutes 0 seconds

      expect(result).toBe("1 day 1 hr 0 sec");
    });

    it("should format months and days", () => {
      const result = formatUptime(2592000); // 30 days

      expect(result).toBe("30 days 0 sec");
    });

    it("should format years and months", () => {
      const result = formatUptime(31536000); // 365 days

      expect(result).toBe("1 yr 0 sec");
    });

    it("should handle plural forms correctly", () => {
      const oneSecond = formatUptime(1);
      const twoSeconds = formatUptime(2);
      const oneMinute = formatUptime(60);
      const twoMinutes = formatUptime(120);
      const oneHour = formatUptime(3600);
      const twoHours = formatUptime(7200);

      expect(oneSecond).toBe("1 sec");
      expect(twoSeconds).toBe("2 secs");
      expect(oneMinute).toBe("1 min 0 sec");
      expect(twoMinutes).toBe("2 mins 0 sec");
      expect(oneHour).toBe("1 hr 0 sec");
      expect(twoHours).toBe("2 hrs 0 sec");
    });
  });
});
