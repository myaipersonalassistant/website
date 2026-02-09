import type { Metadata } from "next";
import "./globals.css";
import AuthWrapper from "./components/AuthWrapper";

export const metadata = {
  title: 'MAI-PA - Your Personal AI Assistant',
  description: 'AI-powered personal assistant that manages your calendar, tasks, and emails through natural conversation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthWrapper>
        {children}
        </AuthWrapper>
      </body>
    </html>
  );
}