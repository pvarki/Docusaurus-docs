// src/theme/NavbarItem/CustomProductLink.tsx
import React from 'react';
import Link from '@docusaurus/Link';
import {useOS} from '@site/src/context/OSContext';

function ProductLink({product, label, mobile, ...rest}: any) {
  const {os} = useOS();

  return (
    <Link
      {...rest}
      to={`/docs/${os}/${product}/home`}
      className={`navbar__item navbar__link${mobile ? ' menu__link' : ''}`}
      isNavLink
      activeBaseRegex={`docs/[^/]+/${product}/`}
    >
      {label}
    </Link>
  );
}

/* make mobile variant for hamburger */
ProductLink.Mobile = (props: any) => <ProductLink {...props} mobile />;

export default ProductLink;
