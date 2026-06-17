import type { Metadata } from 'next';
import { AbhyasaLandingContent } from './landing-content';

export const metadata: Metadata = {
  title: 'Abhyāsa by Trayini — AI worksheets for Indian tuition centres & schools',
  description:
    'Generate board-aligned practice worksheets, grade them by scanning OMR strips with a phone, and let Abhyāsa recommend the next practice set for every student. Built for CBSE, state boards, and Indian budget schools.',
  openGraph: {
    title: 'Abhyāsa by Trayini — AI worksheets that grow with every student',
    description:
      'Personalised, board-aligned worksheets. Print on A4. Scan with a phone. Adapt for every learner.',
    url: 'https://abhyasa.trayini.ai',
    siteName: 'Abhyāsa by Trayini',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function AbhyasaPage() {
  return <AbhyasaLandingContent />;
}
