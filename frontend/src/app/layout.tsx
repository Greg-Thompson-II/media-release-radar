import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ClerkProvider, SignInButton, Show, UserButton } from "@clerk/nextjs";
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
            <div className={styles.navLinks}>
              <Link href="/" className={styles.navLink}>
                All Shows
              </Link>
              <Link href="/calendar" className={styles.navLink}>
                Calendar
              </Link>
            </div>
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
