import "@/app/globals.css"

export const metadata = {
  title: "Bugs - Batalha de Insetos",
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
        <script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_CA_PUB}`}
          async
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
