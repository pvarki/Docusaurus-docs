# docusaurus-pvarki-docs

# Contribution Guide
Two ways to write Docs, either from 
- (a) Github Live Editor,
- (b) clone the repo, work locally and do PRs.
These are covered below.

## (a) Contributing via Github Live Editor
1. Go to [https://pvarki.github.io/Docusaurus-docs]
2. Click **Edit this page** from a page you wish to edit
3. Write edits, press **Commit Changes**
4. In Propose Changes screen: (a) give an informative **Commit Message** what's your edit about, (b) in **Extended description** describe it a bit & (c) **give a descriptive short branch name**, then press **Propose Changes.**
5. Open Pull Request screen opens. PR is a change proposal. Like before, give a descriptive title and description of changes.
6. Somebody needs to Approve and Merge your changes in order to get them in. Mark PR to Review ready in order for that.
7. Get your changes merged.

## (b) Contributing via Local Work & PR
1. Just your usual developing workflow.
2.  If you are a non-developer, check out this guide how to easily do this, basically you need to:
- clone the repository, eg. using Github Desktop
- open the repo in eg. VSCode
- Do edits with VSCode
- You might want to open a terminal in the folder the repo is in and run **npm run dev** in order to spin up a the docs site locally, so that you can see how your changes look in real time.

## Writing SlideDecks
The docs platform has RevealJS-based, markdown writable slide decks as a suggested option to do swipable User Guides with images. This is how you build them:

1. All decks reside in src/decks/{language}/{platform}/{product}. 
2. Language selector automatically shows deck in correct language, if a deck for that language is present.
3. A slide is written like so: 
```
### 2. Your Callsign?
@[phoneFrame](
  screenshot="/img/deployapp/crossplatform/enroll-callsign-en.png",
  alt="Initial Screen",
  top="8%", left="7.5%", width="85%", height="84%",
  caption="First the app asks your callsign."
)

---
```
where:
- ```### title``` will be shown as the Slide Title
- ```@[phoneFrame]``` tells what imageframe we use, Phone for a phoneframe or screenshotBox for desktop frame. Use phoneframe for guides targeted for mobile users, screenshotBox for desktop users.
- ```screenshot="/path"``` lets us choose an image to be shown in frame selected above. Make sure you have placed your image there aswell.
- ```alt="text"```is an alternative text for the image if image can't be shown
- ```caption="text be sure not to use , commas"``` lets you write the body text to slide. Be as short as possible!
- ```top="8%"``` so on, are tools to alter how the image is shown usually. Copypaste the default setting, it usually works.

4. When user is in mobile screen, the slides are automatically shown in a mobile-friendly way. Remember, Because of mobile support the ```caption``` text bodies must be quite short, unless text is not shown to users!
5. Both in dev and production, the app handles automatic build of the slidesets to single-file HTMLS that are shown interactive in the page. 

### How to add images
Either upload using github webeditor, or work locally. 
The structure:
- ```src/static/img/{product}/{platform}/name-images-descriptively-and_mention_their_locale```
- eg: ```src/static/img/deployapp/crossplatform/addusers-approveusers-en```

### How to edit Sidebars
Sidebars are defined manually to ensure they are as usable as possible for Docs readers. 

- All sidebars to be loaded mentioned at ```/sidebar.js```

There are multiple sidebars, eg when you go to "Deploy App" homepage using the Top Navbar button, you get to see the Deploy App sidebar - for the platform currently active, eg. Android. It is 

- loaded by mention in  ```/sidebar.js```
- defined at ```./src/sidebars/android/sidebar.deployapp```.

You can change sidebars by going to the respective sidebar, eg. Android sidebar for Deploy App as above. Just make sure all places you refer in the sidebar actually exist. 

The fact that there are different sidebars for each product, for each platform because of products might differ a lot between different platforms (eg. ATAK, iTAK, WinTAK) are very differently used applications

# Developer Guide
### Output: 
- the container pvarki/pvarki-docs:latest
- static Docusaurus site, [demo from the latest build]( https://animated-adventure-w6k79rk.pages.github.io/docs/home/)

## Table of Contents

- [docusaurus-pvarki-docs](#docusaurus-pvarki-docs)
- [Contribution Guide](#contribution-guide)
  - [(a) Contributing via Github Live Editor](#a-contributing-via-github-live-editor)
  - [(b) Contributing via Local Work \& PR](#b-contributing-via-local-work--pr)
  - [Writing SlideDecks](#writing-slidedecks)
    - [How to add images](#how-to-add-images)
    - [How to edit Sidebars](#how-to-edit-sidebars)
- [Developer Guide](#developer-guide)
    - [Output:](#output)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Features](#features)
  - [Project Structure](#project-structure)
  - [Scripts](#scripts)
    - [Production](#production)
    - [Testing](#testing)
    - [Developing](#developing)
  - [License](#license)

## Introduction
Static docs site for 1) Deploy App user guides 2) developer documentation.

## Features
- Reveal.js slidedecks with mobile-friendly mode for userguides with images
- Platform context shifting (Android, iOS, Windows)
- i18n en, fi

## Project Structure

```plaintext
.github/
    workflows/                                                                  # GitHub Actions workflows
        docs.yml
        release-please.yml
docs/                                                                           # Documentation source files
    ios/                                                                        # iOS context user guides
    android/                                                                    # Android context user guides
    windows                                                                     # Windows context user guides
        /deployapp
        /tak
        /bl                                                                     # docs for each product
    dev/                                                                        # Developer docs 
i18n/
    fi/                                                                         # For each non-English locale, similar structure as here
        /docusaurus-plugin-content-docs/current/(similar structure to docs/)
static/
    img/
    slides/
        en/
        fi/
src/
    decks                                                                       # Reveal.js guide decks here
        /img                                                                    # Images to the decks
        /en                                                                     # Similar structure with all locales
        /fi
            /android                                                            # Similar structure with all platform contexts
            /ios
            /windows
                /deployapp                                                      # guidedecks for each product
                /tak
                /bl
    components/                                                                 # Custom React components
    scripts/                                                                    # Fetch_docs script & others
    sidebars/                                                                   # Product-specific sidebars here
        /android
        /ios
        /windows                                                                # Platform specific sidebars
    theme/                                                                      # Custom themes, overriding the Docusaurus standards
        /NavbarItem                                                             # Navbar tweaks, by foremost Platform Context shifting & dropdown chooser
        MDXComponents.jsx                                                       # Include all components that are included across all MD & MDX files, here
        Root.tsx                                                                # App root includes (overriding/adding to Docusaurus standard config)
    css/                                                                        # Custom CSS
        mobileslides.css                                                        # CSS related to making Reveal.js decks mobile-friendly
        tilegrid.css                                                            # The Tilegrid component's CSS (For tile links)
docusaurus.config.js                                                            # Docusaurus configuration
sidebar.js                                                                      # Sidebar configuration
package.json                                                                    # Project dependencies and scripts
README.md                                                                       # Project overview and instructions
reveal.build.cjs                                                                 # Runs HMR-like in dev mode and when building the site. Builds Reveal.js decks, from markdown to portable 
reveal-template.html                                                            # Custom Reveal.js template, mainly to enable writing Mermaid to reveal decs.
build.sh                                                                        # Build script that runs deck building upon changes on local AND production build
Dockerfile                                                                      
LICENSE.md             
CHANGELOG.md            
```

## Scripts
### Production
- **`npm run build`**: Builds the static documentation site.

### Testing
- **`scripts/fetch_docs.sh`**: Fetches and updates documentation from the main repository and its submodules.
- **`docker build -t my-docusaurus-image -f dockerfile .`**: Builds the Docker image.
- **`docker run -p 80:80 my-docusaurus-image`**: Runs the Docker container.

### Developing
- **`npm run dev`**: Run the project in hot module reswap (HMR). HMR also reloads Reveal.js slides. 
- **`npm run dev:fi`**: Run the project with Finnish locales. For Reasons(tm), under dev mode, docusaurus can only run one locale at a time. 


## License
This project is licensed under the MIT License. See the LICENSE file for details.