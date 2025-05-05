import React from 'react';
import NavbarNavLink from '@theme/NavbarItem/NavbarNavLink';
import {useOS} from '@site/src/context/OSContext';

export default function CustomProductLink({product, label, ...rest}) {
  const {os} = useOS();

  return (
    <li className="navbar__item">                     
      <NavbarNavLink
        className="navbar__link"                 
        {...rest}
        to={`/docs/${os}/${product}/home`}
        activeBaseRegex={`docs/[^/]+/${product}/`}
      >
        {label}
      </NavbarNavLink>
    </li>
  );
}
