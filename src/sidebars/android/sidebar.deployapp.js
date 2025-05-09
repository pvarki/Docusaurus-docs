module.exports = {
  androidDaSidebar: [
    {
      type: 'doc',
      id: 'android/deployapp/home',
      label: 'Home - Deploy App',
    },
    {
      type: 'category',
      label: 'Admin - Get started',
      collapsed: true, // Expand by default
      items: [
        'android/deployapp/admin', // Home page will be shown firs
        'android/deployapp/admin-02-addusers',
      ],
    },
    
    { type: 'doc', id: 'android/deployapp/fighter', label: 'Fighter - Join in' },
    { type: 'doc', id: 'android/deployapp/useapps', label: 'Use Your Apps' },
    { type: 'doc', id: 'android/deployapp/faq',     label: 'Problems & Solutions' },
      ],
    };
