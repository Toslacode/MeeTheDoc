import type { BookingStatus, MeetingType, Topic } from "./domain";

/**
 * Hebrew display labels for the domain enums. Kept separate from
 * types/domain.ts on purpose: the types themselves stay presentation-
 * agnostic, and a future locale change only touches this file.
 */

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  google_meet: "Google Meet",
  phone: "שיחת טלפון",
  in_person: "פגישה פרונטלית",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  scheduled: "נקבעה",
  completed: "הושלמה",
  cancelled: "בוטלה",
  no_answer: "לא נענתה",
};

export const TOPIC_LABELS: Record<Topic, string> = {
  condition: "מצב רפואי",
  test_results: "תוצאות בדיקות",
  treatment_plan: "תוכנית טיפול",
  discharge: "שחרור",
  change: "שינוי במצב",
  other: "אחר",
};
