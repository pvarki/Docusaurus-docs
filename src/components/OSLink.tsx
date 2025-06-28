import React from 'react';
import Link from '@docusaurus/Link';
import { useOS } from '../context/OSContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

type Props = {
  page: 'admin' | 'fighter' | 'useapps' | 'faq';
  children?: React.ReactNode;
};

export default function OSLink({ page, children }: Props) {
  const { os } = useOS();

  // ✅ Dynamically generate the full path using baseUrl
  const targetPath = useBaseUrl(`/docs/${os}/deployapp/${page}`);

  return (
    <Link to={targetPath}>
      {children ?? page}
    </Link>
  );
}
