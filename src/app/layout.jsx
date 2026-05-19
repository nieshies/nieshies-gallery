import "./../styles.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "nieshies gallery",
  description: "A warm gallery of moments — curated, real, and alive",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Sidebar />
        {children}
      </body>
    </html>
  );
}
