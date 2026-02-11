export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Datenschutzerklärung
      </h1>
      <div className="prose prose-gray max-w-none">
        <p>
          Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen.
          Diese Datenschutzerklärung informiert Sie darüber, wie wir Ihre Daten
          erheben, verarbeiten und nutzen.
        </p>

        <h2>1. Verantwortlicher</h2>
        <p>
          Verantwortlicher im Sinne der DSGVO ist der Betreiber dieser
          Webseite. Kontaktdaten finden Sie im Impressum.
        </p>

        <h2>2. Erhebung und Verarbeitung personenbezogener Daten</h2>
        <p>
          Bei der Nutzung unserer Plattform werden folgende Daten verarbeitet:
        </p>
        <ul>
          <li>E-Mail-Adresse (bei Registrierung)</li>
          <li>Hochgeladene Dokumente (temporär zur Analyse)</li>
          <li>Analyse-Ergebnisse</li>
          <li>Technische Daten (IP-Adresse, Browser-Typ)</li>
        </ul>

        <h2>3. Zweck der Datenverarbeitung</h2>
        <p>
          Ihre Daten werden ausschließlich zur Bereitstellung unseres
          Analyse-Services verarbeitet. Hochgeladene Dokumente werden
          ausschließlich für die Analyse verwendet und nicht an Dritte
          weitergegeben.
        </p>

        <h2>4. Drittanbieter-Services</h2>
        <p>
          Wir nutzen folgende Drittanbieter zur Bereitstellung unseres
          Services:
        </p>
        <ul>
          <li>Supabase (Datenbank und Authentifizierung)</li>
          <li>Vercel (Hosting)</li>
          <li>Google Gemini (KI-Analyse)</li>
          <li>Mathpix (PDF-Textextraktion)</li>
          <li>PayPal (Zahlungsabwicklung)</li>
        </ul>

        <h2>5. Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung und
          Einschränkung der Verarbeitung Ihrer Daten. Kontaktieren Sie uns
          hierzu über die im Impressum angegebenen Kontaktdaten.
        </p>

        <h2>6. Cookies</h2>
        <p>
          Wir verwenden technisch notwendige Cookies für die
          Session-Verwaltung. Es werden keine Tracking-Cookies verwendet.
        </p>
      </div>
    </div>
  );
}
