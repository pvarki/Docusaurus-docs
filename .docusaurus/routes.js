import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/fi/',
    component: ComponentCreator('/fi/', '9c9'),
    routes: [
      {
        path: '/fi/',
        component: ComponentCreator('/fi/', 'c7f'),
        routes: [
          {
            path: '/fi/',
            component: ComponentCreator('/fi/', 'a19'),
            routes: [
              {
                path: '/fi/bl/home',
                component: ComponentCreator('/fi/bl/home', '32b'),
                exact: true,
                sidebar: "blSidebar"
              },
              {
                path: '/fi/deployapp/home',
                component: ComponentCreator('/fi/deployapp/home', 'ebe'),
                exact: true,
                sidebar: "daSidebar"
              },
              {
                path: '/fi/dev/documentation/automatic/docusaurus',
                component: ComponentCreator('/fi/dev/documentation/automatic/docusaurus', '33a'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/fi/dev/documentation/automatic/release-please',
                component: ComponentCreator('/fi/dev/documentation/automatic/release-please', 'eab'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/fi/dev/documentation/manual/',
                component: ComponentCreator('/fi/dev/documentation/manual/', 'f65'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/fi/dev/documentation/manual/conventional commits',
                component: ComponentCreator('/fi/dev/documentation/manual/conventional commits', 'aa4'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/fi/dev/documentation/manual/wiki.js',
                component: ComponentCreator('/fi/dev/documentation/manual/wiki.js', 'f50'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/fi/dev/home',
                component: ComponentCreator('/fi/dev/home', 'e10'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/fi/dev/keycloak/openldap/',
                component: ComponentCreator('/fi/dev/keycloak/openldap/', '69c'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/fi/dev/takserver/takgov_assets/',
                component: ComponentCreator('/fi/dev/takserver/takgov_assets/', '215'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/fi/dev/tests/testcas/',
                component: ComponentCreator('/fi/dev/tests/testcas/', '135'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/fi/dev/tests/testjwts/',
                component: ComponentCreator('/fi/dev/tests/testjwts/', '201'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/fi/dev/ui/notes',
                component: ComponentCreator('/fi/dev/ui/notes', 'ddb'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/fi/tak/home',
                component: ComponentCreator('/fi/tak/home', '0a1'),
                exact: true,
                sidebar: "takSidebar"
              },
              {
                path: '/fi/user/home',
                component: ComponentCreator('/fi/user/home', 'f4d'),
                exact: true
              },
              {
                path: '/fi/',
                component: ComponentCreator('/fi/', 'e16'),
                exact: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
