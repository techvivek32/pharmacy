import './globals.css';

export const metadata = {
  title: 'OrdoGo API',
  description: 'Backend API for OrdoGo Medicine Delivery Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
