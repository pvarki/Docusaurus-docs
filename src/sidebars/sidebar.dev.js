module.exports = {
    takSidebar: [
        {
            type: 'category',
            label: 'General info',
            collapsed: true, // Expand by default
            items: [
              'tak/home', // Home page will be shown first
            ],
          },
          {
            type: 'category',
            label: 'Usage Model',
            collapsed: true, // Expand by default
            items: [
              'tak/usage/home', // Home page will be shown first
              {
                type: 'category',
                label: 'First login', // Custom label for the login category
                collapsed: true, // Default collapse
                items: [
                  'tak/usage/home',
                ],
              },
            ],
          },
          {
            type: 'category',
            label: 'How to: ATAK',
            collapsed: true, // Expand by default
            items: [
              'tak/atak/home', // Home page will be shown first
              {
                type: 'category',
                label: 'First login', // Custom label for the login category
                collapsed: true, // Default collapse
                items: [
                  'tak/atak/home',
                ],
              },
            ],
          },
          {
            type: 'category',
            label: 'How to: iTAK',
            collapsed: true, // Expand by default
            items: [
              'tak/itak/home', // Home page will be shown first
              {
                type: 'category',
                label: 'First login', // Custom label for the login category
                collapsed: true, // Default collapse
                items: [
                  'tak/itak/home',
                ],
              },
            ],
          },
          {
            type: 'category',
            label: 'How to: WinTAK',
            collapsed: true, // Expand by default
            items: [
              'tak/wintak/home', // Home page will be shown first
              {
                type: 'category',
                label: 'First login', // Custom label for the login category
                collapsed: true, // Default collapse
                items: [
                  'tak/wintak/home',
                ],
              },
            ],
          },
          {
            type: 'category',
            label: 'How to: Android TAK Tracker',
            collapsed: true, // Expand by default
            items: [
              'tak/taktracker/home', // Home page will be shown first
              {
                type: 'category',
                label: 'First login', // Custom label for the login category
                collapsed: true, // Default collapse
                items: [
                  'tak/taktracker/home',
                ],
              },
            ],
          },

          
          
    ],
  };
  