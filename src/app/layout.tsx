import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIGC降重工具 - AI文本降重",
  description: "将AI生成的文本转化为更自然的人类写作风格，降低AI检测率",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
