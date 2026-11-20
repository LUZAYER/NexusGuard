'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function LandingTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {animating && <div className="laser-progress-bar" />}
      <div key={pathname} className="page-transition-enter min-h-full">
        {children}
      </div>
    </>
  );
}
