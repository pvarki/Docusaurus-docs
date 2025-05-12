module.exports = {
  winDaSidebar: [
    {
      type: 'doc', id: 'windows/deployapp/home', label: 'Home - Deploy App',
    },
    {
      type: 'category',
      label: 'Admin - Invite & Manage Users',
      collapsed: true, // Expand by default
      items: [
        'windows/deployapp/admin/admin-01-initial',
        'windows/deployapp/admin/admin-02-addusers',
        'windows/deployapp/admin/admin-03-manage',
        'windows/deployapp/admin/admin-04-newfeatures',
      ],
    },
    { type: 'doc', id: 'windows/deployapp/fighter', label: 'Fighter - Join in' },
    { type: 'doc', id: 'windows/deployapp/useapps', label: 'Use Your Apps' },
    { type: 'doc', id: 'windows/deployapp/faq',     label: 'Problems & Solutions' },
      ],
    };
