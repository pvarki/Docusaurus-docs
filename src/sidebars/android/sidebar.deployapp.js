module.exports = {
  androidDaSidebar: [
    {
      type: 'doc',
      id: 'android/deployapp/home',
      label: 'Home - Deploy App',
    },
    {
      type: 'category',
      label: 'Admin - Invite & Manage users',
      collapsed: true, // Expand by default
      items: [
        'android/deployapp/admin/admin-01-initial',
        'android/deployapp/admin/admin-02-addusers',
        'android/deployapp/admin/admin-03-manage',
        'android/deployapp/admin/admin-04-newfeatures',
      ],
    },
    
    { type: 'doc', id: 'android/deployapp/fighter', label: 'Fighter - Join in' },
    { type: 'doc', id: 'android/deployapp/useapps', label: 'Use Your Apps' },
    { type: 'doc', id: 'android/deployapp/faq',     label: 'Problems & Solutions' },
      ],
    };
