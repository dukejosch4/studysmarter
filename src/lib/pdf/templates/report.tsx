import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type {
  Concept,
  TaskPattern,
  Priority,
  ExamProblem,
  StudyPlanDay,
  Flashcard,
} from "@/types";

// Styles
const colors = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  text: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.text,
  },
  // Cover
  coverPage: {
    padding: 60,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 40,
  },
  coverDate: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  // Section headers
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 12,
    marginTop: 20,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  // Cards
  card: {
    backgroundColor: colors.gray50,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 9,
    color: colors.textSecondary,
    lineHeight: 1.4,
  },
  // Progress bar
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginTop: 4,
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  // Table
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: 6,
    backgroundColor: colors.primaryLight,
  },
  tableCell: {
    fontSize: 9,
    paddingHorizontal: 4,
  },
  // Badge
  badge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8,
    color: colors.primary,
    fontFamily: "Helvetica-Bold",
  },
  // Misc
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  spacer: {
    height: 12,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: colors.textSecondary,
  },
});

// Types
export type ReportData = {
  concepts: Concept[];
  taskPatterns: TaskPattern[];
  priorities: Priority[];
  examProblems: ExamProblem[];
  studyPlan: StudyPlanDay[];
  flashcards: Flashcard[];
  totalPages: number;
  processingTimeMs: number;
  documentNames: string[];
  createdAt: string;
};

const TASK_TYPE_LABELS: Record<string, string> = {
  calculation: "Rechenaufgabe",
  proof: "Beweis",
  mc: "Multiple Choice",
  short_answer: "Kurzantwort",
  essay: "Freitext",
  modeling: "Modellierung",
};

// Report Document Component
export function ReportDocument({ data }: { data: ReportData }) {
  const date = new Date(data.createdAt).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.coverTitle}>StudySmarter</Text>
        <Text style={styles.coverSubtitle}>
          Analyse-Report
        </Text>
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 11, color: colors.textSecondary, textAlign: "center" }}>
            {data.documentNames.length} Dokument{data.documentNames.length !== 1 ? "e" : ""} analysiert
          </Text>
          <Text style={{ fontSize: 9, color: colors.textSecondary, textAlign: "center", marginTop: 4 }}>
            {data.totalPages} Seiten | {data.concepts.length} Konzepte | {data.examProblems.length} Aufgaben
          </Text>
        </View>
        <Text style={styles.coverDate}>Erstellt am {date}</Text>
        <View style={styles.footer}>
          <Text>StudySmarter - KI-gestuetzte Pruefungsvorbereitung</Text>
          <Text>studysmarter.de</Text>
        </View>
      </Page>

      {/* Concepts & Priorities */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Themenpriorisierung</Text>
        {data.priorities.map((p, i) => (
          <View key={i} style={styles.card}>
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <Text style={styles.cardTitle}>
                {i + 1}. {p.topic}
              </Text>
              <Text style={styles.badge}>{p.relevance_score}% Relevanz</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${p.relevance_score}%` }]} />
            </View>
            <View style={[styles.row, { marginTop: 6 }]}>
              <Text style={styles.cardText}>
                Klausurgewichtung: {p.estimated_exam_weight}% | Lernzeit: {p.recommended_study_hours}h
              </Text>
            </View>
            <Text style={[styles.cardText, { marginTop: 4 }]}>{p.reasoning}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Erkannte Konzepte</Text>
        {data.concepts.slice(0, 15).map((c, i) => (
          <View key={i} style={[styles.card, { flexDirection: "row", justifyContent: "space-between" }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{c.name}</Text>
              <Text style={styles.cardText}>{c.description}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.badge}>{c.importance}/10</Text>
              <Text style={[styles.cardText, { marginTop: 2 }]}>{c.category}</Text>
            </View>
          </View>
        ))}
        <View style={styles.footer}>
          <Text>StudySmarter Report</Text>
          <Text>{date}</Text>
        </View>
      </Page>

      {/* Task Patterns */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Aufgabenmuster</Text>
        {data.taskPatterns.map((p, i) => (
          <View key={i} style={styles.card}>
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <Text style={styles.cardTitle}>
                {TASK_TYPE_LABELS[p.type] || p.type}
              </Text>
              <View style={styles.row}>
                <Text style={styles.badge}>{p.frequency}x</Text>
                <Text style={styles.badge}>Schwierigkeit {p.difficulty}/10</Text>
              </View>
            </View>
            <Text style={[styles.cardText, { marginTop: 4 }]}>{p.description}</Text>
            {p.example_topics.length > 0 && (
              <Text style={[styles.cardText, { marginTop: 4 }]}>
                Themen: {p.example_topics.join(", ")}
              </Text>
            )}
          </View>
        ))}
        <View style={styles.footer}>
          <Text>StudySmarter Report</Text>
          <Text>{date}</Text>
        </View>
      </Page>

      {/* Exam Problems */}
      {data.examProblems.map((problem, i) => (
        <Page key={i} size="A4" style={styles.page}>
          {i === 0 && <Text style={styles.sectionTitle}>Trainingsaufgaben</Text>}
          <View style={styles.card}>
            <View style={[styles.row, { justifyContent: "space-between", marginBottom: 6 }]}>
              <Text style={styles.cardTitle}>
                Aufgabe {i + 1}: {problem.title}
              </Text>
              <View style={styles.row}>
                <Text style={styles.badge}>
                  {TASK_TYPE_LABELS[problem.type] || problem.type}
                </Text>
                <Text style={styles.badge}>{problem.points} Punkte</Text>
              </View>
            </View>
            <Text style={[styles.cardText, { marginTop: 2 }]}>
              Thema: {problem.topic} | Schwierigkeit: {problem.difficulty}/10
            </Text>
            <View style={styles.spacer} />
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
              Aufgabenstellung:
            </Text>
            <Text style={[styles.cardText, { fontSize: 10 }]}>{problem.description}</Text>
            {problem.hints.length > 0 && (
              <>
                <View style={styles.spacer} />
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
                  Hinweise:
                </Text>
                {problem.hints.map((hint, j) => (
                  <Text key={j} style={[styles.cardText, { marginLeft: 10, marginBottom: 2 }]}>
                    {j + 1}. {hint}
                  </Text>
                ))}
              </>
            )}
            <View style={styles.spacer} />
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 4, color: colors.success }}>
              Musterloesung:
            </Text>
            <Text style={[styles.cardText, { fontSize: 10 }]}>{problem.solution}</Text>
          </View>
          <View style={styles.footer}>
            <Text>StudySmarter Report - Aufgabe {i + 1}/{data.examProblems.length}</Text>
            <Text>{date}</Text>
          </View>
        </Page>
      ))}

      {/* Study Plan */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>7-Tage-Lernplan</Text>
        {data.studyPlan.map((day) => (
          <View key={day.day} style={[styles.card, { marginBottom: 10 }]}>
            <View style={[styles.row, { justifyContent: "space-between", marginBottom: 6 }]}>
              <Text style={styles.cardTitle}>Tag {day.day}: {day.focus_topic}</Text>
            </View>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { width: "20%", fontFamily: "Helvetica-Bold" }]}>
                Zeitblock
              </Text>
              <Text style={[styles.tableCell, { width: "45%", fontFamily: "Helvetica-Bold" }]}>
                Aktivitaet
              </Text>
              <Text style={[styles.tableCell, { width: "15%", fontFamily: "Helvetica-Bold" }]}>
                Dauer
              </Text>
              <Text style={[styles.tableCell, { width: "20%", fontFamily: "Helvetica-Bold" }]}>
                Material
              </Text>
            </View>
            {day.tasks.map((task, j) => (
              <View key={j} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "20%" }]}>{task.time_block}</Text>
                <Text style={[styles.tableCell, { width: "45%" }]}>{task.activity}</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>{task.duration_minutes} min</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>
                  {task.resources.join(", ")}
                </Text>
              </View>
            ))}
            {day.review_topics.length > 0 && (
              <Text style={[styles.cardText, { marginTop: 4 }]}>
                Wiederholung: {day.review_topics.join(", ")}
              </Text>
            )}
          </View>
        ))}
        <View style={styles.footer}>
          <Text>StudySmarter Report - Lernplan</Text>
          <Text>{date}</Text>
        </View>
      </Page>

      {/* Flashcards */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Karteikarten</Text>
        {data.flashcards.map((card, i) => (
          <View key={i} style={[styles.card, { marginBottom: 6 }]}>
            <View style={[styles.row, { justifyContent: "space-between", marginBottom: 4 }]}>
              <Text style={styles.badge}>{card.category}</Text>
              <Text style={[styles.cardText, { fontSize: 8 }]}>
                Schwierigkeit: {card.difficulty}/5
              </Text>
            </View>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 }}>
              F: {card.front}
            </Text>
            <Text style={[styles.cardText, { fontSize: 10 }]}>
              A: {card.back}
            </Text>
          </View>
        ))}
        <View style={styles.footer}>
          <Text>StudySmarter Report - Karteikarten</Text>
          <Text>{date}</Text>
        </View>
      </Page>
    </Document>
  );
}
