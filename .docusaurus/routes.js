import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e33'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '0d6'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '3bf'),
            routes: [
              {
                path: '/dev/documentation/automatic/docusaurus',
                component: ComponentCreator('/dev/documentation/automatic/docusaurus', 'f37'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/documentation/automatic/release-please',
                component: ComponentCreator('/dev/documentation/automatic/release-please', 'c48'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/documentation/manual/',
                component: ComponentCreator('/dev/documentation/manual/', '13f'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/documentation/manual/conventional commits',
                component: ComponentCreator('/dev/documentation/manual/conventional commits', '6fb'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/documentation/manual/wiki.js',
                component: ComponentCreator('/dev/documentation/manual/wiki.js', 'ef9'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/home',
                component: ComponentCreator('/dev/home', 'de9'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/keycloak/openldap/',
                component: ComponentCreator('/dev/keycloak/openldap/', 'fea'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/takserver/takgov_assets/',
                component: ComponentCreator('/dev/takserver/takgov_assets/', '56f'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/tests/testcas/',
                component: ComponentCreator('/dev/tests/testcas/', 'ab9'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/tests/testjwts/',
                component: ComponentCreator('/dev/tests/testjwts/', '4f2'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/ui/notes',
                component: ComponentCreator('/dev/ui/notes', 'e07'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/user/home',
                component: ComponentCreator('/user/home', '931'),
                exact: true,
                sidebar: "userSidebar"
              },
              {
                path: '/',
                component: ComponentCreator('/', '309'),
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
