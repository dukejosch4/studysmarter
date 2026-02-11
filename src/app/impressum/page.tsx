export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Impressum</h1>
      <div className="prose prose-gray max-w-none">
        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          [Name einfügen]
          <br />
          [Adresse einfügen]
          <br />
          [PLZ, Ort einfügen]
        </p>

        <h2>Kontakt</h2>
        <p>
          E-Mail: [E-Mail einfügen]
        </p>

        <h2>Haftungsausschluss</h2>
        <h3>Haftung für Inhalte</h3>
        <p>
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für
          die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können
          wir jedoch keine Gewähr übernehmen.
        </p>

        <h3>Haftung für Links</h3>
        <p>
          Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten
          Seiten ist stets der jeweilige Anbieter verantwortlich.
        </p>

        <h2>Hinweis</h2>
        <p>
          StudySmarter ist ein Lernhilfe-Tool und bietet datenbasierte
          Priorisierung. Die Ergebnisse stellen keine Garantie für
          Prüfungsinhalte dar.
        </p>
      </div>
    </div>
  );
}
