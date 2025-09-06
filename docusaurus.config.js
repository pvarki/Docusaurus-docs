import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const baseUrl = process.env.DOCS_BASEURL || '/';
const domain = process.env.DOCS_DOMAIN || 'localhost:3000';
const devPort = process.env.DOCS_PORT || '';
const siteUrl = `https://${domain}${devPort ? `:${devPort}` : ''}`;

const GH_REPO   = process.env.GITHUB_REPO        || 'pvarki/Docusaurus-docs';
const GH_BRANCH = process.env.GITHUB_EDIT_BRANCH || 'main';
const I18N_DIR_PREFIX = process.env.DOCS_I18N_DIR_PREFIX || 'src/i18n';

export default {
  title: 'Docs',
  tagline: 'Documentation for Deploy App',
  url: siteUrl,
  baseUrl: baseUrl,
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
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
        src: 'img/pvatk.png',
        href: '/',
      },
      items: [
        { type: 'custom-platformchooser', position: 'right' },
        { type: 'custom-productlink', product: 'deployapp', label: 'Deploy App', position: 'left' },
        { type: 'custom-productlink', product: 'tak',       label: 'TAK',        position: 'left' },
        { type: 'custom-productlink', product: 'bl',        label: 'Battlelog',  position: 'left' },
        { type: 'custom-productlink', product: 'takplugins', label: 'TAK-Plugins', position: 'left' },
        { to: 'docs/dev/', label: 'Developer', position: 'right' },
        { type: 'localeDropdown', position: 'right' },
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
            { label: 'Getting Started', to: '/' },
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
          routeBasePath: 'docs',
          sidebarPath: path.resolve(__dirname, 'sidebar.js'),

          // Make “Edit this page” go to correct file for en + fi
          editLocalizedFiles: true,
          editUrl: ({ locale, docPath }) => {
            const base = `https://github.com/${GH_REPO}/edit/${GH_BRANCH}`;
            if (!locale || locale === 'en') {
              return `${base}/docs/${docPath}`;
            }
            return `${base}/${I18N_DIR_PREFIX}/${locale}/docusaurus-plugin-content-docs/current/${docPath}`;
          },

          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        theme: {
          customCss: path.resolve(__dirname, 'src/css/custom.css'),
        },
      },
    ],
  ],
};
