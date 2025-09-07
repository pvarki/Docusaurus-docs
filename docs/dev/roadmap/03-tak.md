---
title: "03-TAK"
---

## Deploy App x TAK Roadmap

### Core features

- [ ] **Docs: Write TAK Basic User Guides to the New Docs platform** - Get rid of user guides written into Deploy App UI, instead do them in Docs that is shipped as static site. This simplifies developing Guides a lot, so that you don't have to ship them via Integration API and you can show them in the Docs Platform easily.
- [ ] **Docs: Community Wiki:** Simple to use community wiki to write TAK usage documentation with as low bar as possible. We can polish docs later in order to deploy them to the New Docs platform, that shouldn't block actually writing them at first place. 

### New Features

- [ ] **Docs: TAK Usage Model guides** - While we don't think there is one correct way to use TAK, we want to develop a good basic usage model so that user groups could, upon their will, employ that without having their users extensively trained (as they can read our stellar Usage Model docs).
- [ ] **Docs: GeoChat usage guide -** While lacking, with a good guide GeoChat pretty easy to use and works for basic use cases.
- [ ] **UAS Tool: Docs** & Integration: As soon as Deploy App supports MediaMTX well, write usage docs & ensure smooth integration with the TAK UAS Tool. This will enable us to maximum the value off drones as their video & location can be easily shared within TAK.

### Infrastructure

- [ ] **Make Sure TAK K8s Deployment** - Helm Charts instead of Docker Compose. This lets us off from the one megacompose that always deploys with those services that are written into it. 

###
