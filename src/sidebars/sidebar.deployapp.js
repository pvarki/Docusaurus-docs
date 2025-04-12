module.exports = {
    deployAppSidebar: [
        {
            type: 'category',
            label: 'Deploy App',
            collapsed: false, // Expand by default
            items: [
              'deployapp/home', // Home page will be shown first
              {
                type: 'category',
                label: 'First login', // Custom label for the login category
                collapsed: true, // Default collapse
                items: [
                  'deployapp/firstlogin/step1',
                ],
              },
              {
                type: 'category',
                label: 'Add Users', // Custom label for "Add Users" category
                collapsed: true,
                items: [
                  'deployapp/add-users/step1',
                ],
              },
              {
                type: 'category',
                label: 'Manage Users', // Custom label for "Manage Users" category
                collapsed: true,
                items: [
                  'deployapp/manage-users/step1',
                ],
              },
            ],
          },
    ],
  };
  