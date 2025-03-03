import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { I18nextProvider } from "react-i18next";
import i18n from ".//i18n"; // Adjust the path if necessary

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
        <I18nextProvider i18n={i18n}>
          <ThirdwebProvider>{children}</ThirdwebProvider>
        </I18nextProvider>
      </body>
    </html>
  );
}
