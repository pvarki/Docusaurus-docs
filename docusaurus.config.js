import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const domain = process.env.DOCS_DOMAIN || 'localhost:3001';
const devPort = process.env.DOCS_PORT || '';
const siteUrl = `https://${domain}${devPort ? `:${devPort}` : ''}`;

export default {
  title: 'Docs',
  tagline: 'Documentation for Deploy App',
  url: siteUrl,
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: '/img/favicon.ico',
  organizationName: 'PVARKI',
  projectName: 'Deploy App',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fi'],
  },

  themeConfig: {
    navbar: {
      title: 'Docs',
      logo: {
        alt: 'Site Logo',
        href: '/',
        src: '/img/pvatk.png',
      },
      items: [
        {
          to: '/deployapp/home',
          activeBasePath: '/deployapp',
          label: 'Deploy App',
          position: 'left',
        },
        {
          to: '/tak/home',
          activeBasePath: '/tak',
          label: 'TAK',
          position: 'left',
        },
        {
          to: '/bl/home',
          activeBasePath: '/bl',
          label: 'Battlelog',
          position: 'left',
        },
        {
          to: '/dev/home',
          activeBasePath: '/dev',
          label: 'Developer',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },

    devServer: {
      host: '0.0.0.0',
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} PVARKI. Built with Docusaurus.`,
    },
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: path.resolve(__dirname, 'docs'),
          routeBasePath: '/',
          sidebarPath: path.resolve(__dirname, 'sidebar.js'),
          editUrl: 'https://github.com/pvarki',
        },
        theme: {
          customCss: path.resolve(__dirname, 'src/css/custom.css'),
        },
      },
    ],
  ],
};
