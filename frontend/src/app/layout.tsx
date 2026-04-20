import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { ClerkProvider, SignInButton, Show, UserButton } from "@clerk/nextjs";
import NavLinks from "@/components/NavLinks";
import "./globals.css";
import styles from "./layout.module.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Media Release Radar",
  description: "Track currently airing anime and never miss a new episode.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body>
          <nav className={styles.nav}>
            <Link href="/" className={styles.brand}>
              Media Release Radar
            </Link>
            <Suspense fallback={<div className={styles.navLinks} />}>
              <NavLinks />
            </Suspense>
            <div className={styles.authArea}>
              <Show when="signed-out">
                <SignInButton>
                  <button className={styles.signInBtn}>Sign in</button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </nav>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
