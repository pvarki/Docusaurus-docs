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
  const history  = useHistory();
  const location = useLocation();
  const {setOS}  = useOS();

  return (nextOS: 'android' | 'ios' | 'windows') => {
    setOS(nextOS);

    const {pathname} = location;

    // ➜ 1. Stay put on the landing page
    if (pathname === '/') return;

    // ➜ 2. Do not redirect anything under /docs/dev
    if (pathname.startsWith('/docs/dev')) return;

    // ➜ 3. Replace existing platform segment if present
    const match = pathname.match(/^\/docs\/(android|ios|windows)(\/.*)?$/);
    if (match) {
      const [, , rest = ''] = match;
      history.replace(`/docs/${nextOS}${rest}`);
    } else {
      // otherwise send them to the Deploy App entry page
      history.replace(`/docs/${nextOS}/deployapp/home`);
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
