"use client"

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileSocialMenu } from "@/components/layout/MobileSocialMenu";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      {!isAdmin && <MobileSocialMenu />}
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}
