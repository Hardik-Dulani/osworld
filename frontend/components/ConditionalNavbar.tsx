"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide the navbar entirely if the user is on the auth page
  if (pathname === "/auth") {
    return null;
  }
  
  return <Navbar />;
}