"use client";

const DOCUMENT_TYPES = [
  { value: "lecture_script", label: "Vorlesungsskript" },
  { value: "exercise_sheet", label: "Übungsblatt" },
  { value: "solution", label: "Musterlösung" },
  { value: "old_exam", label: "Altklausur" },
  { value: "notes", label: "Notizen" },
] as const;

type DocumentTypeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DocumentTypeSelector({
  value,
  onChange,
}: DocumentTypeSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
    >
      {DOCUMENT_TYPES.map((type) => (
        <option key={type.value} value={type.value}>
          {type.label}
        </option>
      ))}
    </select>
  );
}
