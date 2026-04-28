'use client';

import { decompressSync } from 'fflate';
import { useEffect, useRef } from 'react';
import { htmlGzipBase64Parts } from '../app/html-data';

function base64ToBytes(parts: readonly string[]) {
  const base64 = parts.join('');
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function looksLikeHtml(text: string) {
  const trimmed = text.trimStart().toLowerCase();
  return trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html') || trimmed.includes('<body');
}

async function nativeGunzipToBytes(bytes: Uint8Array) {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Native DecompressionStream ist in diesem Browser nicht verfügbar.');
  }

  const stream = new Response(bytes as BodyInit).body;
  if (!stream) {
    throw new Error('Compressed HTML stream could not be created.');
  }

  const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
  const buffer = await new Response(decompressedStream).arrayBuffer();
  return new Uint8Array(buffer);
}

async function decodeHtml(parts: readonly string[]) {
  const decoder = new TextDecoder();
  let bytes: Uint8Array = base64ToBytes(parts);
  const errors: string[] = [];

  for (let round = 0; round < 4; round += 1) {
    const text = decoder.decode(bytes);
    if (looksLikeHtml(text)) return text;

    try {
      bytes = await nativeGunzipToBytes(bytes);
      continue;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    try {
      bytes = new Uint8Array(decompressSync(bytes));
      continue;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    break;
  }

  const preview = decoder.decode(bytes.slice(0, 120));
  throw new Error(`HTML-Daten konnten nicht vollständig entpackt werden. Vorschau: ${preview}. Fehler: ${errors.join(' | ')}`);
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showWorkspaceError(target: HTMLDivElement, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
  target.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f6f8fb;font-family:Arial,sans-serif;color:#111827;padding:24px;">
      <div style="max-width:720px;background:white;border-radius:18px;padding:28px;box-shadow:0 18px 50px rgba(15,23,42,.12);">
        <h1 style="margin:0 0 12px;font-size:22px;">Dialekta Handwerk Workspace konnte nicht geladen werden</h1>
        <p style="margin:0 0 16px;line-height:1.55;color:#4b5563;">Der Build ist online, aber beim Starten der Oberfläche ist im Browser ein Fehler aufgetreten.</p>
        <pre style="white-space:pre-wrap;background:#f3f4f6;border-radius:12px;padding:14px;font-size:13px;">${escapeHtml(message)}</pre>
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
        const html = await decodeHtml(htmlGzipBase64Parts);
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
