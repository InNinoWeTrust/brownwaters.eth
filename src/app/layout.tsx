// src/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers"; // Import the client-only providers component

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "brownwaters.eth",
  description: "Brown Waters Productions DAO",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
