'use client';

import { gunzipSync } from 'fflate';
import { useEffect, useRef } from 'react';
import { htmlGzipBase64Parts } from '../app/html-data';

function decodeHtml(parts: readonly string[]) {
  const base64 = parts.join('');
  const binary = atob(base64);
  const gzipped = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const unzipped = gunzipSync(gzipped);
  return new TextDecoder().decode(unzipped);
}

function showWorkspaceError(target: HTMLDivElement, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
  target.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f6f8fb;font-family:Arial,sans-serif;color:#111827;padding:24px;">
      <div style="max-width:720px;background:white;border-radius:18px;padding:28px;box-shadow:0 18px 50px rgba(15,23,42,.12);">
        <h1 style="margin:0 0 12px;font-size:22px;">Dialekta Handwerk Workspace konnte nicht geladen werden</h1>
        <p style="margin:0 0 16px;line-height:1.55;color:#4b5563;">Der Build ist online, aber beim Starten der Oberfläche ist im Browser ein Fehler aufgetreten.</p>
        <pre style="white-space:pre-wrap;background:#f3f4f6;border-radius:12px;padding:14px;font-size:13px;">${message}</pre>
      </div>
    </div>`;
}

function appendExternalScript(src: string) {
  return new Promise<void>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

export default function HandwerkWorkspace() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function mountWorkspace() {
      if (!rootRef.current) return;

      try {
        const html = decodeHtml(htmlGzipBase64Parts);
        if (!active || !rootRef.current) return;

        const doc = new DOMParser().parseFromString(html, 'text/html');

        doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
          const href = link.getAttribute('href');
          if (href && !document.querySelector(`link[href="${href}"]`)) {
            const nextLink = document.createElement('link');
            nextLink.rel = 'stylesheet';
            nextLink.href = href;
            document.head.appendChild(nextLink);
          }
        });

        doc.querySelectorAll('style').forEach((style, index) => {
          const id = `dialekta-handwerk-style-${index}`;
          if (!document.getElementById(id)) {
            const nextStyle = document.createElement('style');
            nextStyle.id = id;
            nextStyle.textContent = style.textContent;
            document.head.appendChild(nextStyle);
          }
        });

        rootRef.current.innerHTML = doc.body.innerHTML;

        const scripts = Array.from(doc.querySelectorAll('script'));
        for (const script of scripts) {
          const src = script.getAttribute('src');
          if (src) {
            await appendExternalScript(src);
          }
        }

        for (const script of scripts) {
          if (!script.src && script.textContent) {
            const inlineScript = document.createElement('script');
            inlineScript.textContent = script.textContent;
            document.body.appendChild(inlineScript);
          }
        }

        document.dispatchEvent(new Event('DOMContentLoaded'));
      } catch (error) {
        console.error('Dialekta Handwerk Workspace konnte nicht gestartet werden.', error);
        if (rootRef.current) showWorkspaceError(rootRef.current, error);
      }
    }

    mountWorkspace();

    return () => {
      active = false;
      if (rootRef.current) rootRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={rootRef} />;
}
