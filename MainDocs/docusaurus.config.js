import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const domain = process.env.DOCS_DOMAIN || 'docs.example.com';
// Optionally grab the dev port
const devPort = process.env.DOCS_PORT || ''; // e.g. '4439' in dev, '' in production
// Construct the URL
// If devPort is non-empty, add :4439, else leave it out
const siteUrl = `https://${domain}${devPort ? `:${devPort}` : ''}`;

export default {
    title: 'Deploy App',
    tagline: 'Documentation for Deploy App',
    url: siteUrl,
    baseUrl: '/',
    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico', 
    organizationName: 'PVARKI',
    projectName: 'Deploy App',
    themeConfig: {
        navbar: {
            title: 'Deploy App',
            logo: {
                alt: 'Site Logo',
                href: 'docs/home',
                src: 'img/pvatk.svg',
            },
            items: [
                {
                    to: '/docs/user/home', 
                    activeBasePath: '/docs/user/home',
                    label: 'User',
                    position: 'left',
                },
                {
                    to: '/docs/dev/home', 
                    activeBasePath: '/docs/dev/home',
                    label: 'Developer',
                    position: 'left',
                },
                {
                    href: 'https://github.com/pvarki/Docusaurus-docs',
                    label: 'GitHub',
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
                            to: '/docs',
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
                    sidebarPath: path.resolve(__dirname, 'sidebar.js'),
                    editUrl: 'https://github.com/your-org/your-project/edit/main/website/',
                },
                theme: {
                    customCss: path.resolve(__dirname, 'src/css/custom.css'),
                },
            },
        ],
    ],
};