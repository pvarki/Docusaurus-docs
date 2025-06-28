import React, { useEffect } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function AdminRedirect(): JSX.Element {
  // resolve to “…/Docusaurus-docs/admin/index.html” in production
  const adminUrl = useBaseUrl('/admin/index.html');

  useEffect(() => {
    window.location.replace(adminUrl);
  }, [adminUrl]);

  return <p>Redirecting to Tina Admin…</p>;
}
