import React from 'react';
import Link from '@docusaurus/Link';
import {useOS} from '../context/OSContext';

type Props = {
  page: 'admin' | 'fighter' | 'useapps' | 'faq';
  children?: React.ReactNode; // optional custom label
};

export default function OSLink({page, children}: Props) {
  const {os} = useOS();
  return (
    <Link to={`/deployapp/${os}/${page}`}>
      {children ?? page}
    </Link>
  );
}
