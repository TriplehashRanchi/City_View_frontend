import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import AdminShell from "@/components/AdminShell";

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const displayFont = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata = {
  title: "CityView Events",
  description: "CityView event management and premium operations platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased`}>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
