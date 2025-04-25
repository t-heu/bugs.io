'use client'

import { useState, useEffect } from 'react'
import Script from 'next/script'

const CookieConsent = () => {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null)

  // Verifica se o consentimento já foi armazenado no localStorage
  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (consent === "true") {
      setHasConsented(true)
    } else if (consent === "false") {
      setHasConsented(false)
    }
  }, [])

  // Função que lida com o consentimento
  const handleConsent = () => {
    localStorage.setItem("cookie-consent", "true")
    setHasConsented(true)
  }

  // Função que lida com a recusa do consentimento
  const handleReject = () => {
    localStorage.setItem("cookie-consent", "false")
    setHasConsented(false)
  }

  return (
    <div>
      {/* Apenas carrega o script de anúncios quando o consentimento for dado */}
      {hasConsented === true && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_CA_PUB}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {/* Exibir o banner de consentimento caso o usuário não tenha dado ou rejeitado */}
      {hasConsented === null && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-800 text-white p-4 text-center">
          <p>Este site usa cookies para melhorar a sua experiência. Ao continuar, você aceita o uso de cookies.</p>
          <div className="mt-4">
            <button onClick={handleConsent} className="bg-green-600 px-4 py-2 rounded mr-2">
              Consentir
            </button>
            <button onClick={handleReject} className="bg-gray-600 px-4 py-2 rounded text-white">
              Não Consentir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CookieConsent
