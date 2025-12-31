import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "우리 아이 맞춤형 AI 동화 작가",
  description: "아이의 사진과 이야기를 담은 특별한 동화를 만들어보세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}


