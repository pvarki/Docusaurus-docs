import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import clsx from 'clsx';
import '../css/tilegrid.css';

/**
 * tiles = [
 *   { href: './admin.md',  img: '/img/tiles/admin.jpg',  label: 'Admin – Get started' },
 *   { href: './fighter.md',img: '/img/tiles/fighter.jpg',label: 'Fighter – Join in' },
 * ]
 */
export default function TileGrid({tiles, className}) {
    return (
      <div className={clsx('tile-grid', className)}>
        {tiles.map(({href, img, img2, label}) => (
          <Link
            key={href}
            className="tile-grid__tile"
            to={href}
            style={{backgroundImage:`url(${useBaseUrl(img)})`}}
          >
            {img2 && (
              <img
                src={useBaseUrl(img2)}
                alt=""
                className="tile-grid__icon"
              />
            )}
            <span className="tile-grid__label">{label}</span>
          </Link>
        ))}
      </div>
    );
  }