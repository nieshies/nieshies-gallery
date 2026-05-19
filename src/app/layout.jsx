import "./../styles.css";
import SoundToggle from "@/components/game/SoundToggle";
import ExperienceBar from "@/components/game/ExperienceBar";
import DailyMission from "@/components/game/DailyMission";

export const metadata = {
  title: "nieshies gallery",
  description: "A cosmic gallery of moments — surreal, playful, alive",
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
        {children}
        <DailyMission />
        <SoundToggle />
        <ExperienceBar />
      </body>
    </html>
  );
}
