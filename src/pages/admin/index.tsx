import React, { useEffect } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

/**
 * Admin redirect component that handles routing to TinaCMS admin interface
 * This component redirects users from /admin to the actual static admin/index.html file
 * while respecting the Docusaurus baseUrl configuration
 */
export default function AdminRedirect(): JSX.Element {
  // Generate the correct admin URL respecting the baseUrl
  const adminUrl = useBaseUrl('/admin/index.html');

  useEffect(() => {
    // Use replace instead of href to avoid browser history pollution
    window.location.replace(adminUrl);
  }, [adminUrl]);

  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Redirecting to TinaCMS Admin...</h1>
      <p>
        If you are not redirected automatically, 
        <a href={adminUrl} style={{ marginLeft: '0.5rem' }}>
          click here to access the admin interface
        </a>
      </p>
    </main>
  );
}