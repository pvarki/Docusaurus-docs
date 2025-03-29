import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/fi/__docusaurus/debug',
    component: ComponentCreator('/fi/__docusaurus/debug', '7a3'),
    exact: true
  },
  {
    path: '/fi/__docusaurus/debug/config',
    component: ComponentCreator('/fi/__docusaurus/debug/config', 'e02'),
    exact: true
  },
  {
    path: '/fi/__docusaurus/debug/content',
    component: ComponentCreator('/fi/__docusaurus/debug/content', '958'),
    exact: true
  },
  {
    path: '/fi/__docusaurus/debug/globalData',
    component: ComponentCreator('/fi/__docusaurus/debug/globalData', '635'),
    exact: true
  },
  {
    path: '/fi/__docusaurus/debug/metadata',
    component: ComponentCreator('/fi/__docusaurus/debug/metadata', '490'),
    exact: true
  },
  {
    path: '/fi/__docusaurus/debug/registry',
    component: ComponentCreator('/fi/__docusaurus/debug/registry', 'a52'),
    exact: true
  },
  {
    path: '/fi/__docusaurus/debug/routes',
    component: ComponentCreator('/fi/__docusaurus/debug/routes', '4f3'),
    exact: true
  },
  {
    path: '/fi/',
    component: ComponentCreator('/fi/', '495'),
    routes: [
      {
        path: '/fi/',
        component: ComponentCreator('/fi/', '8c7'),
        routes: [
          {
            path: '/fi/',
            component: ComponentCreator('/fi/', '877'),
            routes: [
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
                path: '/fi/user/home',
                component: ComponentCreator('/fi/user/home', 'c92'),
                exact: true,
                sidebar: "userSidebar"
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
