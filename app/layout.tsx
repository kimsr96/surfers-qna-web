import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "서퍼스 고객센터",
  description: "수강생 질의응답 게시판",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
