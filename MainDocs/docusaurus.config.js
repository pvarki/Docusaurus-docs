import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    title: 'Static docs',
    tagline: 'documentation for rasenmaher',
    url: 'https://example.com', // Update to a generic URL
    baseUrl: '/',
    onBrokenLinks: 'warn',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico', 
    organizationName: 'PVarki', // Usually your GitHub org/user name.
    projectName: 'Rasenmaeher', // Usually your repo name.
    themeConfig: {
        navbar: {
            title: 'Rasenmaeher',
            logo: {
                alt: 'Site Logo',
                href: 'docs/home',
                src: 'img/logo.svg', // does not work
            },
            items: [
                {
                    to: '/docs/dev/home', 
                    activeBasePath: '/docs/dev/home',
                    label: 'Developer',
                    position: 'left',
                },
                {
                    to: '/docs/user/home', 
                    activeBasePath: '/docs/user/home',
                    label: 'User',
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
            copyright: `Copyright © ${new Date().getFullYear()} Your Project, Inc. Built with Docusaurus.`,
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