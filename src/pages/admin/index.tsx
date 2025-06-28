import React, { useEffect } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function AdminRedirect() {
  useEffect(() => {
    window.location.replace(
      useBaseUrl('/admin/index.html')
    );
  }, []);
  return <p>Redirecting to Tina Admin…</p>;
}
