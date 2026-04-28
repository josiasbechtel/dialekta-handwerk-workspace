export default function Page() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'Poppins, Arial, sans-serif', background: '#f4f7fb', color: '#001f33' }}>
      <section style={{ maxWidth: 760, background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 24px 70px rgba(0,31,51,0.12)', border: '1px solid #d6e4ec' }}>
        <p style={{ margin: '0 0 8px', color: '#005a84', fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', fontSize: 12 }}>Dialekta Handwerk Workspace</p>
        <h1 style={{ margin: '0 0 16px', fontSize: 34, lineHeight: 1.1 }}>Next.js-Projekt ist erreichbar</h1>
        <p style={{ margin: '0 0 16px', fontSize: 16, lineHeight: 1.65 }}>
          Der Vercel-Zugriff und der Next.js-Build laufen. Die urspruengliche Vorlage wird gerade in saubere Next.js-Komponenten/Datenmodule ueberfuehrt, damit keine kaputten komprimierten Template-Daten mehr geladen werden.
        </p>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#005a84' }}>
          Status: stabile Zwischenversion online. Naechster Schritt: 1:1 Workspace-Rendering wieder aktivieren, sobald die Template-Daten vollstaendig im Repo liegen.
        </p>
      </section>
    </main>
  );
}
