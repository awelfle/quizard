import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import HomeButton from './components/HomeButton';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Quizard',
  description: 'Fun multiple choice quizzes for Joseph & Liam',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white flex flex-col">
        <HomeButton />
        <div className="flex-1">{children}</div>
        <footer className="text-center py-6 text-white/30 text-sm font-semibold">
          Made by Andy Welfle and Claude Code especially for Joseph, Liam &amp; Tomas 🧙‍♂️
        </footer>
      </body>
    </html>
  );
}
