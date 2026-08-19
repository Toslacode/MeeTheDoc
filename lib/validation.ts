/**
 * User-facing field validation for the family booking form. Hebrew
 * messages, no dependency. The defensive checks in lib/store/api.ts are a
 * separate, programmer-facing layer — these run first and are what the
 * family actually sees.
 */

export interface FieldErrors {
  [field: string]: string | undefined;
}

/** Israeli mobile/landline: 0 + 9 digits, optionally hyphen-separated. */
const PHONE_RE = /^0\d{1,2}-?\d{7}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateRequired(value: string, message: string): string | undefined {
  return value.trim() ? undefined : message;
}

export function validatePhone(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "נא להזין מספר טלפון";
  if (!PHONE_RE.test(trimmed)) return "מספר הטלפון אינו תקין";
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "נא להזין כתובת אימייל";
  if (!EMAIL_RE.test(trimmed)) return "כתובת האימייל אינה תקינה";
  return undefined;
}

export interface BookingFormValues {
  patientName: string;
  familyContactName: string;
  phone: string;
  email: string;
}

export function validateBookingForm(values: BookingFormValues): FieldErrors {
  return {
    patientName: validateRequired(values.patientName, "נא להזין את שם המטופל"),
    familyContactName: validateRequired(
      values.familyContactName,
      "נא להזין את שם בן/בת המשפחה"
    ),
    phone: validatePhone(values.phone),
    email: validateEmail(values.email),
  };
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
