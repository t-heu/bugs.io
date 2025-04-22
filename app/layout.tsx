import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from 'next/script';

export const metadata = {
  title: "Bugs.io - Batalha de Insetos",
  description: "Um jogo de batalha de insetos online"
}

export default function RootLayout({ children }: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_CA_PUB}`}
          crossOrigin="anonymous"
          strategy="afterInteractive" // O script será carregado após a interação inicial do usuário
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
