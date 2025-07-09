import { ReactNode } from 'react';
import '../styles/globals.css'
export const metadata = {
  title: 'HortiTech',
  description: 'Automatización de invernaderos',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head />
      <body>{children}</body>
    </html>
  );
}

