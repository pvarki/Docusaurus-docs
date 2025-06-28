import React, { useEffect } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function AdminRedirect() {
  const adminUrl = useBaseUrl('/admin/index.html');

  useEffect(() => {
    window.location.href = adminUrl;
  }, []);

  return <p>Redirecting to Tina Admin...</p>;
}
