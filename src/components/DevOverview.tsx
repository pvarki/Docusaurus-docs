import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import firstDocs from '@site/src/generated/devFirstDocs.json';
import TileGrid from '@site/src/components/TileGrid';

export default function DevOverview() {
  const tiles = [
    { href: useBaseUrl(`/docs/${firstDocs.contributing}`), img: '/img/tiles/developer.jpeg',          label: 'Contribution guide' },
    { href: useBaseUrl(`/docs/${firstDocs.specs}`),        img: '/img/tiles/specs.jpeg',    label: 'Product specs' },
    { href: useBaseUrl(`/docs/${firstDocs.roadmap}`),      img: '/img/tiles/roadmap.webp',       label: 'Roadmaps' },
    { href: useBaseUrl(`/docs/${firstDocs.setupguide}`),   img: '/img/tiles/tähtäin.jpeg',          label: 'Setup your environment' },
    { href: useBaseUrl(`/docs/integrationrepo/README`),   img: '/img/tiles/ryhmä.jpeg',          label: 'Repo readmes' },
    { href: useBaseUrl(`/docs/autoapidocs/rasenmaeher`),   img: '/img/tiles/infoprotect2.png',          label: 'API docs' },
  ];
  return <TileGrid icons={false} tiles={tiles} />;
}
