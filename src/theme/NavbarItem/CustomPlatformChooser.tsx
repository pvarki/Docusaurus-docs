import React from 'react';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import useBaseUrl, {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import {useOS} from '@site/src/context/OSContext';
import {useLocation} from '@docusaurus/router';

type OS = 'android' | 'ios' | 'windows';

const choices: {id: OS; label: string; icon: string}[] = [
  {id: 'android', label: 'Android', icon: '/img/android.svg'},
  {id: 'ios',     label: 'iOS',     icon: '/img/apple.svg'},
  {id: 'windows', label: 'Windows', icon: '/img/windows.svg'},
];

function makeLabel(c: {label: string; icon: string}) {
  return (
    <span className="platform-label">
      <img src={c.icon} alt="" className="platform-icon" />
      {c.label}
    </span>
  );
}

export default function CustomPlatformChooser(props: any) {
  const {os, setOS} = useOS();
  const location = useLocation();

  // ✅ Use hooks at the top level only
  const base = useBaseUrl('/'); // e.g. "/Docusaurus-docs/"
  const {withBaseUrl} = useBaseUrlUtils(); // pure function we can use in callbacks

  // Strip baseUrl prefix from current pathname so matching is stable
  const pathname = location.pathname;
  const withoutBase =
    pathname.startsWith(base) ? `/${pathname.slice(base.length)}` : pathname;

  // Detect if we are on a docs page for a specific OS already
  const match = withoutBase.match(/^\/docs\/(android|ios|windows)(\/.*)?$/);
  const rest = match?.[2] ?? '';
  const isRoot = withoutBase === '/' || withoutBase === '';
  const isDevDocs = withoutBase.startsWith('/docs/dev');

  // Build target paths (WITHOUT baseUrl); withBaseUrl will add it
  const targetFor = (nextOS: OS) => {
    if (isRoot || isDevDocs) return `/docs/${nextOS}/deployapp/home`;
    if (match) return `/docs/${nextOS}${rest}`;
    return `/docs/${nextOS}/deployapp/home`;
  };

  // Precompute "to" links at render time (hooks OK here)
  const links: Record<OS, string> = {
    android: withBaseUrl(targetFor('android')),
    ios:     withBaseUrl(targetFor('ios')),
    windows: withBaseUrl(targetFor('windows')),
  };

  return (
    <DropdownNavbarItem
      {...props}
      label={makeLabel(choices.find((c) => c.id === os)!)}
      items={choices.map((c) => ({
        label: makeLabel(c),
        to: links[c.id],          // ✅ navigation handled by Link
        onClick: () => setOS(c.id) // ✅ just update context; no hooks here
      }))}
    />
  );
}

// Mobile variant
(CustomPlatformChooser as any).Mobile = (p: any) => <CustomPlatformChooser mobile {...p} />;
