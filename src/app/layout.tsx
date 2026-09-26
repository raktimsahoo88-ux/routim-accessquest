import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Routim — AccessQuest', description: 'Evidence-driven accessible campus routing and barrier reporting.', applicationName: 'Routim', manifest: '/manifest.webmanifest' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}<script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));}`}} /></body></html>; }
