import dynamic from 'next/dynamic';

const HandwerkWorkspace = dynamic(() => import('../components/HandwerkWorkspace'), {
  ssr: false,
});

export default function Page() {
  return <HandwerkWorkspace />;
}
