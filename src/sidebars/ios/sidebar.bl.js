module.exports = {
    iosBlSidebar: [
        {
            type: 'category',
            label: 'General info',
            collapsed: true, // Expand by default
            items: [
              'blhome', // Home page will be shown first
            ],
        },
        {
            type: 'category',
            label: 'Usage Model',
            collapsed: true, // Expand by default
            items: [
              'ios/bl/usage/home', // Home page will be shown first
            ],
        },
        {
            type: 'category',
            label: 'Problems & Solutions',
            collapsed: true, // Expand by default
            items: [
              'ios/bl/faq/home', // Home page will be shown first
            ],
        },
    ],
  };
  