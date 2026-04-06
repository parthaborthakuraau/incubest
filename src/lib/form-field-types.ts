// All supported field types for the form builder

export const FIELD_TYPES = [
  { value: "short_text", label: "Short Text", icon: "T", desc: "Single line text" },
  { value: "paragraph", label: "Paragraph", icon: "¶", desc: "Multi-line text" },
  { value: "number", label: "Number", icon: "#", desc: "Numeric input" },
  { value: "email", label: "Email", icon: "@", desc: "Email address" },
  { value: "phone", label: "Phone", icon: "📱", desc: "Phone number" },
  { value: "url", label: "URL", icon: "🔗", desc: "Web link" },
  { value: "date", label: "Date", icon: "📅", desc: "Date picker" },
  { value: "single_choice", label: "Single Choice", icon: "◉", desc: "Radio buttons — pick one" },
  { value: "multiple_choice", label: "Multiple Choice", icon: "☑", desc: "Checkboxes — pick many" },
  { value: "dropdown", label: "Dropdown", icon: "▼", desc: "Select from list" },
  { value: "file_upload", label: "File Upload", icon: "📎", desc: "Upload document/image" },
  { value: "rating", label: "Rating", icon: "⭐", desc: "1-5 star rating" },
] as const;

export type FieldType = (typeof FIELD_TYPES)[number]["value"];

export interface FormField {
  id: string;       // unique field ID
  name: string;     // machine name
  label: string;    // display label
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // for single_choice, multiple_choice, dropdown
}

export function generateFieldId(): string {
  return `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
