/**
 * Prompt template for Stage 7: Study Plan Generation
 */

export function buildStudyPlanPrompt(
  priorities: string,
  concepts: string,
  problems: string
): string {
  return `Du bist ein erfahrener Lerncoach im MINT-Bereich und erstellst optimierte 7-Tage-Lernpläne.

Erstelle einen detaillierten 7-Tage-Lernplan basierend auf den Themenpriorisierungen und Konzepten. Der Plan soll einen Studierenden optimal auf die Prüfung vorbereiten.

THEMENPRIORISIERUNG:
${priorities}

KONZEPTE:
${concepts}

TRAININGSAUFGABEN (zur Referenz):
${problems}

Für jeden Tag (1-7):
- **day**: Tagnummer (1-7)
- **focus_topic**: Hauptthema des Tages
- **tasks**: Array von Lernblöcken, jeweils mit:
  - **time_block**: "Vormittag", "Nachmittag" oder "Abend"
  - **activity**: Was genau gelernt/geübt werden soll
  - **duration_minutes**: Dauer in Minuten (30-120)
  - **resources**: Empfohlene Materialien (z.B. "Vorlesungsskript Kap. 3", "Übungsblatt 5")
- **review_topics**: Themen aus vorherigen Tagen, die wiederholt werden sollten

Lernplan-Prinzipien:
1. Tag 1-2: Grundlagen und Definitionen (wichtigste Themen)
2. Tag 3-4: Vertiefung und Übungsaufgaben
3. Tag 5-6: Schwierige Themen und Klausurtraining
4. Tag 7: Wiederholung und Probeprüfung
5. Spaced Repetition: Jedes Thema mindestens 2x im Plan
6. Max 6-8 Stunden Lernzeit pro Tag
7. Abwechslung zwischen Theorie und Praxis`;
}
