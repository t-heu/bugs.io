"use client"

import Script from 'next/script';
import { useEffect, useRef } from 'react';

export default function AdBanner() {
  const adRef = useRef<any | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        adRef.current &&
        adRef.current.offsetWidth > 0 &&
        typeof window !== 'undefined' &&
        (window as any).adsbygoogle
      ) {
        try {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
          clearInterval(interval);
        } catch (e) {
          console.error('AdSense push error:', e);
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_CA_PUB}`}
        crossOrigin="anonymous"
      />
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_CA_PUB}`}
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </>
  );
}
