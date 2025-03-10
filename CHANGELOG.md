# Changelog

## [1.5.1](https://github.com/Lonimokio/docs/compare/v1.5.0...v1.5.1) (2025-03-10)


### Bug Fixes

* **fetch_docs:** replace rsync with find for Markdown file copying ([6b8bc83](https://github.com/Lonimokio/docs/commit/6b8bc8307643b9b542eccc605bc34582b88119b6))
* **nginx:** update location block to use alias for home documentation ([21295ab](https://github.com/Lonimokio/docs/commit/21295ab63b7debeb94011afc11ba1a00dd405ea7))

## [1.5.0](https://github.com/Lonimokio/docs/compare/v1.4.0...v1.5.0) (2025-03-06)


### Features

* **docker:** implement SSL support with Certbot and update Nginx configuration ([ca26c32](https://github.com/Lonimokio/docs/commit/ca26c3261c8a563c99ecffb77abb772ade828283))
* **nginx:** add SSL support and enhance error handling in configuration ([40fd4ff](https://github.com/Lonimokio/docs/commit/40fd4ff0cc7d505cce1b7028bfec449e420e2326))

## [1.4.0](https://github.com/Lonimokio/docs/compare/v1.3.0...v1.4.0) (2025-03-06)


### Features

* **nginx:** update location blocks for improved file serving and error handling ([a93d4b0](https://github.com/Lonimokio/docs/commit/a93d4b09ee50126a63885a8379aadc88c37574f6))

## [1.3.0](https://github.com/Lonimokio/docs/compare/v1.2.1...v1.3.0) (2025-03-06)


### Features

* **nginx:** set default index file for documentation location ([f24bbab](https://github.com/Lonimokio/docs/commit/f24bbab9a640ed721bec70b46bfdab16269716e1))

## [1.2.1](https://github.com/Lonimokio/docs/compare/v1.2.0...v1.2.1) (2025-03-06)


### Bug Fixes

* **nginx:** change root directive to alias for correct document serving ([3fd5711](https://github.com/Lonimokio/docs/commit/3fd5711b76375bbf84d8fcd8f481643953603c91))

## [1.2.0](https://github.com/Lonimokio/docs/compare/v1.1.2...v1.2.0) (2025-03-06)


### Features

* **docs:** enhance README and add Docker support for Nginx hosting ([bd53375](https://github.com/Lonimokio/docs/commit/bd53375a21f2c79a655a2a2de7a6193bdd7eea3a))


### Bug Fixes

* **config:** update base URL in Docusaurus config for correct hosting setup ([c8faf5f](https://github.com/Lonimokio/docs/commit/c8faf5f7658a6bad6383eccb6d63fd29b652a982))
* **sidebar:** simplify path handling by removing base URL from document IDs ([f64cf23](https://github.com/Lonimokio/docs/commit/f64cf239a1033bd0222b049d7b6501332b83435f))
* **workflow:** streamline Docusaurus documentation update process in GitHub Actions ([dbbdfea](https://github.com/Lonimokio/docs/commit/dbbdfea957ae13b7889f92250ce1a64949ed79da))

## [1.1.2](https://github.com/Lonimokio/docs/compare/v1.1.1...v1.1.2) (2025-03-05)


### Bug Fixes

* **sidebar:** prepend base URL to document IDs for correct linking ([a079703](https://github.com/Lonimokio/docs/commit/a07970368bedf82c8d1f3a7d0e3a1bc55c951f70))

## [1.1.1](https://github.com/Lonimokio/docs/compare/v1.1.0...v1.1.1) (2025-03-05)


### Bug Fixes

* **workflow:** update docs workflow to download built artifact and configure git remote ([97bd2e7](https://github.com/Lonimokio/docs/commit/97bd2e7b0b0151058f1e636a2b206d7a1471092a))
* **workflow:** update job dependencies and adjust base URL in Docusaurus config ([0078f50](https://github.com/Lonimokio/docs/commit/0078f50dd0b2728a4d8a2b1187ec08748fff3507))

## [1.1.0](https://github.com/Lonimokio/docs/compare/v1.0.1...v1.1.0) (2025-03-05)


### Features

* **docker:** update Dockerfile to use multi-stage build and serve with Nginx ([5aa0ee2](https://github.com/Lonimokio/docs/commit/5aa0ee23bf8fcb2711541e0ea36533dbace4f048))
* **docusaurus:** configure devServer to listen on all interfaces ([5aa0ee2](https://github.com/Lonimokio/docs/commit/5aa0ee23bf8fcb2711541e0ea36533dbace4f048))

## [1.0.1](https://github.com/Lonimokio/docs/compare/v1.0.0...v1.0.1) (2025-03-05)


### Bug Fixes

* **sidebar:** handle child items correctly in sidebar generation ([1a8f219](https://github.com/Lonimokio/docs/commit/1a8f219aa5db549a36fbfa69fafd58251b4917b6))

## 1.0.0 (2025-02-27)


### Features

* **docs:** add debug step to list documentation files in GitHub Actions workflow ([c5f0a24](https://github.com/Lonimokio/docs/commit/c5f0a24ce1744aafb8a04394c2a0849a1ae29cbc))
* **docs:** add debug step to list file paths in GitHub Actions workflow ([9203bb3](https://github.com/Lonimokio/docs/commit/9203bb38ef4556cb70b4237d8976c2d5369cff5a))
* **docs:** add fetch_docs.sh script to clone and fetch documentation from repository ([3634ef1](https://github.com/Lonimokio/docs/commit/3634ef14b7e69d5ce0e2d16cca9ff2476171fe65))
* **docs:** add GitHub Actions workflow and scripts for fetching and building Docusaurus docs ([adf011c](https://github.com/Lonimokio/docs/commit/adf011c2c4721f610bd12d19d05cf139c0e4120d))
* **docs:** add step to clear destination directory before cloning docs ([6312932](https://github.com/Lonimokio/docs/commit/6312932394bf31893bbbe0f6d4f61f238f5edd64))
* **docs:** automate GitHub release and upload built documentation assets ([aa00d62](https://github.com/Lonimokio/docs/commit/aa00d62f4055e10a226ba436a2712c25440a95bf))
* **docs:** clear destination directory before copying docs ([7a7fb66](https://github.com/Lonimokio/docs/commit/7a7fb6630a488f8ca5408cbc5893ecf0f9f46b64))
* **docs:** enhance output messages for cloning and fetching documentation ([2c04c36](https://github.com/Lonimokio/docs/commit/2c04c36f5c6cfce49440c3545c04859b83e6ea2d))
* **docs:** exit early if 'docs' directory is found and improve output message ([f9f7c9d](https://github.com/Lonimokio/docs/commit/f9f7c9d11fcd705afb752afd12b518c0dff61775))
* **docs:** improve handling of submodules and enhance output messages ([905f495](https://github.com/Lonimokio/docs/commit/905f4950268bc647ee2d5d64907cbe617d6aa451))
* **docs:** restructure documentation workflow and add new Docusaurus configuration ([568654d](https://github.com/Lonimokio/docs/commit/568654d9c45f6f66b1f2cd0d8747c7178ad0561f))
* **docs:** streamline GitHub Actions workflow for Docusaurus documentation build ([a510084](https://github.com/Lonimokio/docs/commit/a510084c2ba38685f6c3182ef75a59d3104226d5))
* **docs:** update docs.yml to run Docusaurus correctly ([01fef9a](https://github.com/Lonimokio/docs/commit/01fef9a2894e1f12a0bb5f33bbbd1eb316c33f6b))
* **docs:** update Docusaurus config to set the path for documentation directory ([048d245](https://github.com/Lonimokio/docs/commit/048d245d9d71456609dcb780c73cbce620f965c8))
* **docs:** update GitHub Actions workflow to include Docusaurus config generation and build steps ([492d3cb](https://github.com/Lonimokio/docs/commit/492d3cbfb954f92f71b9383a70453cf15082376b))
* **docs:** update workflow to commit and push changes to Docusaurus documentation ([5096a5f](https://github.com/Lonimokio/docs/commit/5096a5fb32597ab3ba48b7745edd09a143090e14))
* **github:** add release-please configuration and workflow for automated releases ([90551e6](https://github.com/Lonimokio/docs/commit/90551e684f29d8c5fce61d44f0c5658416bb21e0))
* **github:** add release-please configuration file for automated versioning ([118135f](https://github.com/Lonimokio/docs/commit/118135f96c3b65a41195cba104536ce7d6ef14c8))
* **sidebar:** implement dynamic sidebar generation from docs directory ([c5bc84b](https://github.com/Lonimokio/docs/commit/c5bc84b64968b8648ec6ce0fcea16631bf25138d))
* **workflows:** add Docusaurus config update step and script for dynamic sidebar generation ([7ca9023](https://github.com/Lonimokio/docs/commit/7ca90237ae57d2b6a2bc1fe4eb5281fb1a4b5808))


### Bug Fixes

* **docs:** configure Git user in workflow for documentation updates ([f534bc4](https://github.com/Lonimokio/docs/commit/f534bc432131dcc37626e60cce77ec19937ed2b9))
* **docs:** correct path for custom CSS in Docusaurus config ([3000f3c](https://github.com/Lonimokio/docs/commit/3000f3c0035206e1b8d6ee1ba3837cbad19476c7))
* **docs:** correct upload_url reference in workflow for asset upload ([5ff2f84](https://github.com/Lonimokio/docs/commit/5ff2f84821bdacdbb2dbcc4e74b3cec91e3a34b6))
* **docs:** enhance workflow to configure Git and streamline commit process for documentation updates ([bed1495](https://github.com/Lonimokio/docs/commit/bed14951d1d3f2dd420764b43e0c2362e1a3c34f))
* **docs:** enhance workflow to include debug steps and improve Git push process for Docusaurus docs ([a600544](https://github.com/Lonimokio/docs/commit/a6005447e34e371199ffa681dd9f1f834bfde2ca))
* **docs:** refactor workflow to create local changes and streamline commit and push steps ([f60238b](https://github.com/Lonimokio/docs/commit/f60238bc80606889869af86542a88912652f18f7))
* **docs:** remove debug steps from workflow to streamline Git push process for Docusaurus docs ([5257ac1](https://github.com/Lonimokio/docs/commit/5257ac126d86bf7e884ba44d2bd7a060eea7dffe))
* **docs:** remove redundant step for creating local changes in workflow ([6e9d5ee](https://github.com/Lonimokio/docs/commit/6e9d5ee3d9ac0c218b8a4e0ac892bdba7680b44a))
* **docs:** replace GITHUB_TOKEN with PAT_TOKEN in workflow for authentication ([e40a247](https://github.com/Lonimokio/docs/commit/e40a247fc73cd5470a4cf64ed7c363012ee23ba8))
* **docs:** replace PAT_TOKEN with GITHUB_TOKEN in workflow for consistency ([a0f1b42](https://github.com/Lonimokio/docs/commit/a0f1b42769a3c01b05cddf8c77e053d7c1cdf935))
* **docs:** set upload_url environment variable for asset upload in workflow ([134e500](https://github.com/Lonimokio/docs/commit/134e500c7f939537efa31a927fa4984533579605))
* **docs:** specify output directory for Docusaurus build in workflow ([cf5135b](https://github.com/Lonimokio/docs/commit/cf5135b0f9934b1d3897ccab8245bcba2d9eb1a3))
* **docs:** streamline commit process in workflow by adding changes before commit ([9186d0d](https://github.com/Lonimokio/docs/commit/9186d0df4b4c9bc6a9fdd3a16a0fca626ce1732b))
* **docs:** update Docusaurus config to correct documentation paths and improve structure ([e3bc324](https://github.com/Lonimokio/docs/commit/e3bc324b67bab9c1168213843f561fddc1e151e9))
* **docs:** update Docusaurus config to correct paths and improve navbar structure ([45b79cc](https://github.com/Lonimokio/docs/commit/45b79ccab833f9f99a9517a3acb42324550b8fec))
* **docs:** update Git user configuration in workflow for documentation updates ([6a2d564](https://github.com/Lonimokio/docs/commit/6a2d564ec69375cbcb7128ef74ebddb5b09acf61))
* **docs:** update paths in Docusaurus config for sidebar and custom CSS because github doesnt like relative paths ([10e2407](https://github.com/Lonimokio/docs/commit/10e24072b0bb3f93df3061a984f7189a14234975))
* **docs:** update workflow to configure Git settings and streamline pull and push steps for Docusaurus docs ([26eaac9](https://github.com/Lonimokio/docs/commit/26eaac96f4888a2cc070f20b6b633681d33e57ac))
* **docs:** update workflow to download built docs artifact and streamline commit process ([96f61f1](https://github.com/Lonimokio/docs/commit/96f61f1a7ece1d0922b86f9741ee0750942fde99))
* **docs:** update workflow to list documentation directory contents before and after build ([e499db8](https://github.com/Lonimokio/docs/commit/e499db85fdbd24e1d9bcaad99e6348c57b1f1705))
* **docs:** update workflow to separate commit and push steps for built documentation ([27f9fcf](https://github.com/Lonimokio/docs/commit/27f9fcf2b4be6bb95f903fff6c1b9aeedaf5aad9))
* **docs:** update workflow to set remote URL with PAT_TOKEN for GitHub authentication before pushing changes ([84f2ced](https://github.com/Lonimokio/docs/commit/84f2ced79ed8093a0241de8329c5c803ab386ecf))
* **docs:** update workflow to streamline commit and push steps for Docusaurus docs ([5b1055b](https://github.com/Lonimokio/docs/commit/5b1055b8b128b94617b40b429ab8ab2e16b1a2c4))
* **docs:** update workflow to use PAT_TOKEN for Git operations and improve commit process ([6724798](https://github.com/Lonimokio/docs/commit/6724798ab3542e035d84401da5b2ed41f7736dd2))
* **docs:** update workflow to use PAT_TOKEN for GitHub authentication in documentation push ([f233e80](https://github.com/Lonimokio/docs/commit/f233e80782523543c87bec8455d811bea542b6c4))
* **docusaurus:** correct paths in docusaurus.config.js to ensure proper navigation ([b48cc44](https://github.com/Lonimokio/docs/commit/b48cc44b362471c29f2664dd8d74a804e8d79255))
* **docusaurus:** update paths in docusaurus.config.js to use relative references ([67cf6de](https://github.com/Lonimokio/docs/commit/67cf6dedb6d9dec9c51c756800e16369b9bc58fe))
* **scripts:** enhance fetch_docs.sh to copy Markdown files from main repo and submodules while preserving directory structure ([39f587e](https://github.com/Lonimokio/docs/commit/39f587ee83c957f273f47e7572f3449b4ce2a6a0))
* **scripts:** escape newlines in sidebar items for Docusaurus config update ([a581ecb](https://github.com/Lonimokio/docs/commit/a581ecbc35b2a6681a2876e8fce68680fa9eb983))
* **scripts:** improve fetch_docs.sh to use rsync for copying Markdown files while preserving directory structure ([9b37b5e](https://github.com/Lonimokio/docs/commit/9b37b5e11e3f45219a60dcf47227f0982e0ce6d0))
* **scripts:** remove debugging lines from fetch_docs.sh for cleaner execution ([4c88a1e](https://github.com/Lonimokio/docs/commit/4c88a1e92b5dc38613576cec77c906d7037e67e3))
* **scripts:** set default workspace for Docusaurus config update script ([e15ea4b](https://github.com/Lonimokio/docs/commit/e15ea4b588b21fc13deeea3d2fcc78bd53bbf8f8))
* **workflow:** add write permissions for contents in docs workflow ([762dd7b](https://github.com/Lonimokio/docs/commit/762dd7bbcb24cca6a6d5778ef6bfef7c8b41d6f1))
