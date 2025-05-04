import React from 'react';
import {useOS} from '../../context/OSContext';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';

const choices = [
  {id: 'android', label: 'Android'},
  {id: 'ios', label: 'iOS'},
  {id: 'windows', label: 'Windows'},
] as const;

export default function CustomPlatformChooser() {
  const {os, setOS} = useOS();
  return (
    <DropdownNavbarItem
      label={choices.find(c => c.id === os)?.label ?? 'OS'}
      items={choices.map(c => ({
        label: c.label,
        to: '#', // keeps Docusaurus happy
        onClick: () => setOS(c.id as any),
      }))}
      className="navbar__item"
    />
  );
}
