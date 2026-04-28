'use client';

import { useEffect, useRef } from 'react';
import { htmlGzipBase64Parts } from '@/app/html-data';

async function decompressHtml(parts: string[]) {
  const base64 = parts.join('');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const stream = new Response(bytes).body;

  if (!stream) {
    throw new Error('Compressed HTML stream could not be created.');
  }

  const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
  return await new Response(decompressedStream).text();
}

function appendExternalScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script konnte nicht geladen werden: ${src}`));
    document.body.appendChild(script);
  });
}

export default function HandwerkWorkspace() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function mountWorkspace() {
      const html = await decompressHtml(htmlGzipBase64Parts);
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
    }

    mountWorkspace().catch((error) => {
      console.error('Dialekta Handwerk Workspace konnte nicht gestartet werden.', error);
    });

    return () => {
      active = false;
      if (rootRef.current) rootRef.current.innerHTML = '';
    };
  }, []);

  return <div ref={rootRef} />;
}
