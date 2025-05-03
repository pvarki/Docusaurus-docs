module.exports = {
  daSidebar: [
    {
      type: 'doc',
      id: 'deployapp/home',
      label: 'Home - Deploy App',
    },
    {
      type: 'category',
      label: 'Android',
      link: { type: 'doc', id: 'deployapp/android/index' },
      collapsed: true,
      items: [
        { type: 'doc', id: 'deployapp/android/admin', label: 'Admin - Get started' },
        { type: 'doc', id: 'deployapp/android/fighter', label: 'Fighter - Join in' },
        { type: 'doc', id: 'deployapp/android/useapps', label: 'Use Your Apps' },
        { type: 'doc', id: 'deployapp/android/faq', label: 'Problems & Solutions' },
      ],
    },    
    {
      type: 'category',
      label: 'iOS',
      link: { type: 'doc', id: 'deployapp/ios/index' },
      collapsed: true,
      items: [
        { type: 'doc', id: 'deployapp/ios/admin', label: 'Admin - Get started' },
        { type: 'doc', id: 'deployapp/ios/fighter', label: 'Fighter - Join in' },
        { type: 'doc', id: 'deployapp/ios/useapps', label: 'Use Your Apps' },
        { type: 'doc', id: 'deployapp/ios/faq', label: 'Problems & Solutions' },
      ],
    },
    {
      type: 'category',
      label: 'Windows',
      link: { type: 'doc', id: 'deployapp/windows/index' },
      collapsed: true,
      items: [
        { type: 'doc', id: 'deployapp/windows/admin', label: 'Admin - Get started' },
        { type: 'doc', id: 'deployapp/windows/fighter', label: 'Fighter - Join in' },
        { type: 'doc', id: 'deployapp/windows/useapps', label: 'Use Your Apps' },
        { type: 'doc', id: 'deployapp/windows/faq', label: 'Problems & Solutions' },
      ],
    },
  ],
};
