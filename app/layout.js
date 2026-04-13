import "./globals.css";
import AdminShell from "@/components/AdminShell";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata = {
  title: "CityView Admin",
  description: "Thin admin panel for products, packages, clients, events, and quotation versions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AdminShell>{children}</AdminShell>
        </ToastProvider>
      </body>
    </html>
  );
}
