import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/',
    component: ComponentCreator('/', '8e0'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '08f'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/Contribute/local-setup',
        component: ComponentCreator('/Contribute/local-setup', 'd06'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/Start/getting-started',
        component: ComponentCreator('/Start/getting-started', '20b'),
        exact: true,
        sidebar: "docs"
      },
      {
        path: '/Start/self-hosted',
        component: ComponentCreator('/Start/self-hosted', '522'),
        exact: true,
        sidebar: "docs"
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
