import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import HomeButton from './components/HomeButton';
import StarField from './components/StarField';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Quizard',
  description: 'Fun multiple choice quizzes for Joseph, Liam & Tomas',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Quizard!',
  },
};

export const viewport: Viewport = {
  themeColor: '#7c3aed',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white flex flex-col">
        <Script defer src="https://tinylytics.app/embed/fcmUHjFamMemKuynmcnb.js" />
        <StarField />
        <HomeButton />
        <div className="relative z-10 flex-1">{children}</div>
        <footer className="relative z-10 text-center py-6 text-white/30 text-sm font-semibold">
          Made by Andy Welfle and Claude Code especially for Joseph, Liam &amp; Tomas 🧙‍♂️
        </footer>
      </body>
    </html>
  );
}
