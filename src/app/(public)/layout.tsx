
import { UserProvider } from '../context/UserContext';
import '../styles/globals.css'; 

export const metadata = {
  title: 'HortiTech App',
  description: 'Aplicación de gestión para HortiTech',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
 
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
