import { gunzipSync } from 'node:zlib';
import HandwerkWorkspace from '../components/HandwerkWorkspace';
import { workspaceTemplateGzipBase64 } from './clean-template';

function decodeWorkspaceHtml() {
  const buffer = Buffer.from(workspaceTemplateGzipBase64, 'base64');
  return gunzipSync(buffer).toString('utf-8');
}

export default function Page() {
  const initialHtml = decodeWorkspaceHtml();
  return <HandwerkWorkspace initialHtml={initialHtml} />;
}
