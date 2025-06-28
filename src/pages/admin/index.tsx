import React, { useEffect } from 'react';

export default function AdminRedirect(): JSX.Element {
  useEffect(() => {
    const base = document?.querySelector('base')?.getAttribute('href') || '/';
    window.location.href = `${base}admin/index.html`;
  }, []);

  return (
    <main>
      <p>Redirecting to Tina admin...</p>
    </main>
  );
}
