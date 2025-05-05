module.exports = {
    takSidebar: [
        {
            type: 'category',
            label: 'General info',
            collapsed: true, // Expand by default
            items: [
              'takhome', // Home page will be shown first
            ],
          },
          {
            type: 'category',
            label: 'Usage Model',
            collapsed: true, // Expand by default
            items: [
              'android/tak/usage/home', // Home page will be shown first
              {
                type: 'category',
                label: 'First login', // Custom label for the login category
                collapsed: true, // Default collapse
                items: [
                  'android/tak/usage/home',
                ],
              },
            ],
          },
          {
            type: 'category',
            label: 'How to: ATAK',
            collapsed: true, // Expand by default
            items: [
              'android/tak/home', // Home page will be shown first
              {
                type: 'category',
                label: 'First login', // Custom label for the login category
                collapsed: true, // Default collapse
                items: [
                  'ios/tak/home',
                ],
              },
            ],
          },
          
          
    ],
  };
  