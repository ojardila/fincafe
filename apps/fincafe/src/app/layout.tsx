import './global.css';
import { AuthProvider } from '../contexts/AuthContext';

export const metadata = {
  title: 'FinCafe',
  description: 'Financial management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
