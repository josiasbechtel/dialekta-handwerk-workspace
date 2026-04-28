"use client";

import { useEffect, useState } from "react";
import { htmlGzipBase64 } from "./html-data";

async function decompressHtml(base64: string) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const stream = new Response(bytes).body;

  if (!stream) {
    throw new Error("Compressed HTML stream could not be created.");
  }

  const decompressedStream = stream.pipeThrough(new DecompressionStream("gzip"));
  return await new Response(decompressedStream).text();
}

export default function Page() {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let active = true;

    decompressHtml(htmlGzipBase64)
      .then((value) => {
        if (active) {
          setHtml(value);
        }
      })
      .catch((error) => {
        console.error("Failed to restore original HTML template.", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page-shell">
      <iframe
        className="app-frame"
        srcDoc={html}
        title="Dialekta Handwerk Workspace"
      />
    </main>
  );
}
