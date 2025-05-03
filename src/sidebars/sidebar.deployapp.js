module.exports = {
  daSidebar: [
    {
      type: 'doc',
      id: 'deployapp/home',
      label: 'Home - Deploy App',
    },
    {
      type: 'category',
      label: 'iOS',
      link: { type: 'doc', id: 'deployapp/ios/admin' }, // ← tap iOS = open Admin
      collapsed: false,
      items: [
        'deployapp/ios/admin',
        'deployapp/ios/fighter',
        'deployapp/ios/useapps',
        'deployapp/ios/faq',
      ],
    },
    {
      type: 'category',
      label: 'Android',
      link: { type: 'doc', id: 'deployapp/android/admin' }, // ← tap Android = open Admin
      collapsed: false,
      items: [
        'deployapp/android/admin',
        'deployapp/android/fighter',
        'deployapp/android/useapps',
        'deployapp/android/faq',
      ],
    },
    {
      type: 'category',
      label: 'Windows',
      link: { type: 'doc', id: 'deployapp/windows/admin' }, // ← tap Windows = open Admin
      collapsed: false,
      items: [
        'deployapp/windows/admin',
        'deployapp/windows/fighter',
        'deployapp/windows/useapps',
        'deployapp/windows/faq',
      ],
    },
  ],
};
