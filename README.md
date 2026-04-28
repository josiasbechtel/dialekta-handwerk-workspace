# Dialekta Handwerk Workspace

Originalgetreue Next.js-Version fuer die bereitgestellte HTML-Vorlage.

## Status

- Echte Next.js-Seite ohne iframe
- Vorlage wird in einer Client-Komponente geladen
- Supabase-Hauptprojekt: dialekta-outbound
- Getrennter Datenbankbereich: handwerk
- Vorbereitet fuer SaaS-Ausbau

## Start

```bash
npm install
npm run dev
```

## Deployment

Das Projekt ist fuer Vercel vorbereitet. Jeder Push auf `main` startet ein Production Deployment, sobald das Repository mit Vercel verbunden ist.

Benötigte Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ebjuheaxtahepllwhwfq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_OsuTxGGe3eivhEKNZxDW9g_97xDvLqa
```
