import React from 'react';
import DocusaurusLink from '@docusaurus/Link';
import {useOS} from '@site/src/context/OSContext';

/* ---- local prop shim for the missing navbar fields ---- */
type NavLinkProps = React.ComponentProps<typeof DocusaurusLink> & {
  activeBaseRegex?: string;
  isNavLink?: boolean;
};
const Link = DocusaurusLink as unknown as React.FC<NavLinkProps>;
/* ------------------------------------------------------- */

function ProductLink({product, label, mobile, ...rest}: any) {
  const {os} = useOS();
  const liClass   = mobile ? 'menu__list-item' : 'navbar__item';
  const linkClass = mobile ? 'menu__link'      : 'navbar__link';

  return (
    <li className={liClass}>
      <Link
        {...rest}
        to={`/docs/${os}/${product}/home`}
        className={linkClass}
        isNavLink
        activeBaseRegex={`docs/[^/]+/${product}/`}
      >
        {label}
      </Link>
    </li>
  );
}

/* expose mobile variant for the hamburger drawer */
ProductLink.Mobile = (p: any) => <ProductLink {...p} mobile />;

export default ProductLink;
