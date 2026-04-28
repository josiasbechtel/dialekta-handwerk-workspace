import { gunzipSync, inflateSync } from 'node:zlib';
import HandwerkWorkspace from '../components/HandwerkWorkspace';
import { htmlGzipBase64Parts } from './html-data';

function looksLikeHtml(value: string) {
  const trimmed = value.trimStart().toLowerCase();
  return trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html') || trimmed.includes('<body');
}

function decodeWorkspaceHtml() {
  let buffer = Buffer.from(htmlGzipBase64Parts.join(''), 'base64');
  const decoder = new TextDecoder();
  const errors: string[] = [];

  for (let round = 0; round < 6; round += 1) {
    const text = decoder.decode(buffer);
    if (looksLikeHtml(text)) return text;

    try {
      buffer = gunzipSync(buffer);
      continue;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    try {
      buffer = inflateSync(buffer);
      continue;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    break;
  }

  throw new Error(`Workspace template could not be decoded: ${errors.join(' | ')}`);
}

export default function Page() {
  const initialHtml = decodeWorkspaceHtml();
  return <HandwerkWorkspace initialHtml={initialHtml} />;
}
