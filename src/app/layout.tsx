import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "爱(AI)降 - 专业降AIGC工具｜深度适配知网、维普、万方、格子达、Turnitin、GPTzero",
  description: "一键降AI，全平台检测无忧。专注降低AIGC生成痕迹，深度适配知网、维普、万方、格子达、Turnitin、GPTzero，一键消除AI特征，降低AIGC检测率，让文本回归真人原创质感。",
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
