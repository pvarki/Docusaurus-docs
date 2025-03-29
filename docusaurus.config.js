import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const domain = process.env.DOCS_DOMAIN || 'localhost:4439';
const devPort = process.env.DOCS_PORT || '';
const siteUrl = `https://${domain}${devPort ? `:${devPort}` : ''}`;

export default {
  title: 'Deploy App',
  tagline: 'Documentation for Deploy App',
  url: siteUrl,
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: '/img/favicon.ico',
  organizationName: 'PVARKI',
  projectName: 'Deploy App',

  // ✅ Add i18n block
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fi'],
  },

  themeConfig: {
    navbar: {
      title: 'Deploy App',
      logo: {
        alt: 'Site Logo',
        href: '/',
        src: '/pvatk.png',
      },
      items: [
        {
          to: '/user/home',
          activeBasePath: '/user',
          label: 'User',
          position: 'left',
        },
        {
          to: '/dev/home',
          activeBasePath: '/dev',
          label: 'Developer',
          position: 'left',
        },
        {
          href: 'https://github.com/pvarki/Docusaurus-docs',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'localeDropdown', // ✅ Adds the language switcher
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
          customCss: path.resolve(__dirname, 'css/custom.css'),
        },
      },
    ],
  ],
};
