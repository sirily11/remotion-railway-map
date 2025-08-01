import "../../styles/global.css";
import { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { DrivingTrains } from "@/components/DrivingTrains";
import { kalam, bubblegumSans, fredoka, inter } from "./fonts";

export const metadata: Metadata = {
  title: "Railway Route Animation",
  description: "Railway Route Animation",
  openGraph: {
    title: "Railway Route Animation",
    description: "Railway Route Animation",
    images: [{ url: "/og-image.webp" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`bg-background ${fredoka.variable} ${bubblegumSans.variable} ${kalam.variable} ${inter.variable} font-sans`}>
        <DrivingTrains />
        <div className="relative z-10">{children}</div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
