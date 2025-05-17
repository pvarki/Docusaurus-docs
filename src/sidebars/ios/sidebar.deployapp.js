module.exports = {
  iosDaSidebar: [
    {
      type: 'doc', id: 'ios/deployapp/home', label: 'Home - Deploy App',
    },
    {
      type: 'category',
      label: 'Admin - Invite & Manage Users',
      collapsed: true, // Expand by default
      items: [
        'ios/deployapp/admin/admin-01-initial',
        'ios/deployapp/admin/admin-02-addusers',
        'ios/deployapp/admin/admin-03-manage',
      ],
    },
    { type: 'doc', id: 'ios/deployapp/fighter', label: 'Fighter - Join in' },
    { type: 'doc', id: 'ios/deployapp/useapps', label: 'Use Your Apps' },
    { type: 'doc', id: 'ios/deployapp/faq',     label: 'Problems & Solutions' },
      ],
    };
