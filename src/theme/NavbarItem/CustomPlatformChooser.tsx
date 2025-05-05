// src/theme/NavbarItem/CustomPlatformChooser.tsx
import React from 'react';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import {useOS} from '@site/src/context/OSContext';
import {useHistory, useLocation} from '@docusaurus/router';

const choices = [
  {id: 'android', label: 'Android', icon: '/img/android.svg'},
  {id: 'ios',     label: 'iOS',     icon: '/img/apple.svg'},
  {id: 'windows', label: 'Windows', icon: '/img/windows.svg'},
] as const;

function makeLabel(c) {
  return (
    <span className="platform-label">
      <img src={c.icon} alt="" className="platform-icon" />
      {c.label}
    </span>
  );
}

function useChangeOS() {
  const history   = useHistory();
  const location  = useLocation();
  const {setOS}   = useOS();

  return (next: string) => {
    setOS(next);
    const match = location.pathname.match(/^\/docs\/([^/]+)(.*)/);
    if (match) {
      const [, , rest] = match;
      history.replace(`/docs/${next}${rest || '/deployapp/home'}`);
    } else {
      history.replace(`/docs/${next}/deployapp/home`);
    }
  };
}

function Chooser(props: any) {
  const {os}   = useOS();
  const change = useChangeOS();

  return (
    <DropdownNavbarItem
      {...props}
      label={makeLabel(choices.find(c => c.id === os)!)}
      items={choices.map(c => ({
        label: makeLabel(c),
        to:    '#',
        onClick: () => change(c.id),
      }))}
    />
  );
}
Chooser.Mobile = (p: any) => <Chooser mobile {...p} />; // mobile variant
export default Chooser;
