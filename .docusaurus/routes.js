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
    component: ComponentCreator('/', 'e95'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'ceb'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '5b9'),
            routes: [
              {
                path: '/bl/home',
                component: ComponentCreator('/bl/home', '9ce'),
                exact: true,
                sidebar: "blSidebar"
              },
              {
                path: '/deployapp/home',
                component: ComponentCreator('/deployapp/home', '8e0'),
                exact: true,
                sidebar: "daSidebar"
              },
              {
                path: '/dev/documentation/automatic/docusaurus',
                component: ComponentCreator('/dev/documentation/automatic/docusaurus', '725'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/documentation/automatic/release-please',
                component: ComponentCreator('/dev/documentation/automatic/release-please', 'f08'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/documentation/manual/',
                component: ComponentCreator('/dev/documentation/manual/', 'a37'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/documentation/manual/conventional commits',
                component: ComponentCreator('/dev/documentation/manual/conventional commits', '604'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/documentation/manual/wiki.js',
                component: ComponentCreator('/dev/documentation/manual/wiki.js', 'b61'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/home',
                component: ComponentCreator('/dev/home', 'b59'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/keycloak/openldap/',
                component: ComponentCreator('/dev/keycloak/openldap/', '053'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/takserver/takgov_assets/',
                component: ComponentCreator('/dev/takserver/takgov_assets/', '15f'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/tests/testcas/',
                component: ComponentCreator('/dev/tests/testcas/', 'f40'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/tests/testjwts/',
                component: ComponentCreator('/dev/tests/testjwts/', 'cbd'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/dev/ui/notes',
                component: ComponentCreator('/dev/ui/notes', '5c3'),
                exact: true,
                sidebar: "devSidebar"
              },
              {
                path: '/tak/home',
                component: ComponentCreator('/tak/home', 'dbb'),
                exact: true,
                sidebar: "takSidebar"
              },
              {
                path: '/user/home',
                component: ComponentCreator('/user/home', '569'),
                exact: true
              },
              {
                path: '/',
                component: ComponentCreator('/', 'c48'),
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
