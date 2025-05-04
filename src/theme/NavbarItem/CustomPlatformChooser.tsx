import React from 'react';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import {useOS} from '@site/src/context/OSContext';

const choices = [
  {id: 'android', label: 'Android'},
  {id: 'ios',     label: 'iOS'},
  {id: 'windows', label: 'Windows'},
] as const;

/* ---------- desktop ---------- */
function PlatformChooserDesktop(props: any) {
  const {os, setOS} = useOS();
  return (
    <DropdownNavbarItem
      {...props}
      label={choices.find(c => c.id === os)?.label ?? 'OS'}
      items={choices.map(c => ({
        label: c.label,
        to:    '#',
        onClick: () => setOS(c.id as any),
      }))}
    />
  );
}

/* ---------- hamburger ---------- */
function PlatformChooserMobile(props: any) {
  const {os, setOS} = useOS();
  return (
    <DropdownNavbarItem
      mobile
      {...props}
      label={choices.find(c => c.id === os)?.label ?? 'OS'}
      items={choices.map(c => ({
        label: c.label,
        to:    '#',
        onClick: () => setOS(c.id as any),
      }))}
    />
  );
}

PlatformChooserDesktop.Mobile = PlatformChooserMobile;   // 🗝️ expose variant
export default PlatformChooserDesktop;
