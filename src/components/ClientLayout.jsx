"use client";
import Sidebar from "./Sidebar";
import PageTransition from "./PageTransition";

export default function ClientLayout({ children }) {
  return (
    <>
      <Sidebar />
      <PageTransition>{children}</PageTransition>
    </>
  );
}
