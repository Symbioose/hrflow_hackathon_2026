import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Claw4HR — Source Talent From Everywhere. Instantly.",
  description:
    "AI-powered passive talent sourcing. Search GitHub, LinkedIn, Indeed and more — score and rank candidates in real-time.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} font-sans`}>
      {children}
    </div>
  );
}
