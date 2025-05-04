// src/theme/NavbarItem/CustomPlatformChooser.tsx
import React from 'react';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import { useOS } from '@site/src/context/OSContext';

const choices = [
  { id: 'android', label: 'Android', icon: '/img/android.svg' },
  { id: 'ios', label: 'iOS', icon: '/img/apple.svg' },
  { id: 'windows', label: 'Windows', icon: '/img/windows.svg' },
] as const;

function renderLabel(id: string) {
  const choice = choices.find(c => c.id === id);
  if (!choice) return 'OS';
  return (
    <span className="platform-label">
      <img src={choice.icon} alt={choice.label} className="platform-icon" />
      {choice.label}
    </span>
  );
}

function PlatformChooserDesktop(props: any) {
  const { os, setOS } = useOS();
  return (
    <DropdownNavbarItem
      {...props}
      label={renderLabel(os)}
      items={choices.map(c => ({
        label: (
          <span className="platform-label">
            <img src={c.icon} alt={c.label} className="platform-icon" />
            {c.label}
          </span>
        ),
        to: '#',
        onClick: () => setOS(c.id as any),
      }))}
    />
  );
}

function PlatformChooserMobile(props: any) {
  const { os, setOS } = useOS();
  return (
    <DropdownNavbarItem
      mobile
      {...props}
      label={renderLabel(os)}
      items={choices.map(c => ({
        label: (
          <span className="platform-label">
            <img src={c.icon} alt={c.label} className="platform-icon" />
            {c.label}
          </span>
        ),
        to: '#',
        onClick: () => setOS(c.id as any),
      }))}
    />
  );
}

PlatformChooserDesktop.Mobile = PlatformChooserMobile;
export default PlatformChooserDesktop;
