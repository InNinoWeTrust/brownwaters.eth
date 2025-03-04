"use client";

// biome-ignore lint/style/useImportType: <explanation>
import React from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n"; // Corrected path, since i18n.tsx is in the same directory
import { ThirdwebProvider } from "thirdweb/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThirdwebProvider>{children}</ThirdwebProvider>
    </I18nextProvider>
  );
}

export default Providers;