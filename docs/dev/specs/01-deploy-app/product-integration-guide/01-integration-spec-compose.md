---
title: "01-Integration spec: Compose"
---

Reference compose integration: rmfpapi setup at [https://github.com/pvarki/docker-rasenmaeher-integration](https://github.com/pvarki/docker-rasenmaeher-integration) 

## Compose Logic

Right now the Integration compose is *the* deployment. 

If you want to integrate, you must either PR yourself to the integration compose, or fork the compose for your own use. 

Roadmap has K8s deployment as a method, which removes the need to have a centralized integration repo that must always deploy everything that's written into it. 

This documents covers on what to add into dockercompose, in order to add your product into it.

## docker-compose.yml, -local, -dev

Start writing to docker-compose.yml. It's the production compose.

Then write your parts to docker-compose-local.yml, the purpose is to override certain things in order to make the compose capable being ran in a local environment. Mkcerts are written instead of LE certs, otherwise everything runs in production mode.

Then write your parts to docker-compose-dev.yml, the purpose is to override development configuration to run services in dev mode - eg. ui in Vite HMR mode, so on. 

## Miniwerk

When the compose runs, miniwerk runs first.

It's a minimal *Kraftwerk* (Deployment API) implementation. At this time automatically provides either Let's Encrypt (production mode) or mkcert (local or dev mode) based on what's our manifest (.env) 

`MW_PRODUCTS: "tak,kc,fake,bl,rmmtx`

lists subdomains that is in this deployment and deploy certs to

`MW_TAK__USER_PORT: 8443`

If your product needs a port open for user, define it like so. 

## Your Integration API

`rmfpapi:`

Definition for the reference fakeproductapi integration. Copy and paste for your product integration API and edit 'fakes' to your product name.

`image: pvarki/rmfpapi:local${DOCKER_TAG_EXTRA:-` 

Which image to build?

`context: ./fpintegration` 

Which product we build?

`networks:       `

`- productnet      `

`- intranet`

At least these networks, add dbnetwork for persisting data.

 `volumes:       `

`- ca_public:/ca_public      `

`- kraftwerk_shared_fake:/pvarki       `

`- rmfpapi_data:/data/persistent`

At least these volumes (edit rmfpapi_data for your product.

`depends_on:      `

`rmnginx:         `

   `condition: service_healthy       `

`rmapi:         `

   `condition: service_healthy      `

`postgres:        `

` condition: service_health`

Containers that should run before us. At least rmnginx and rmapi, postgres if you persist data to rm postgres.

`healthcheck:       `

`   test: 'takrmapi healthcheck || exit 1'     `

`   interval: 15s       `

`   timeout: 35s       `

`   retries: 3       `

`   start_period: 45s     `

`   restart: unless-stopped`

Refer to your healthcheck here. test: 'true' when you haven't that ready yet.

## Your Product's Server Container

Depending how you integrate yourself to Deploy App, you can handle everything in your integration API (aka. you refer to your product container and it has Deploy App integration right in) or you have separate integration API that handles talking to Deploy App (rmapi & keycloak), and separate service for your product.

If you got a separate service, take example on how takserver and takrmapi works. 

## RMNGINX - to make yourself accessible 

We got one NGINX container that utilizes one consolidated product templates, that we configure using env vars supplied right here. 

```javascript
NGINX_FP_UPSTREAM: "rmfpapi"
NGINX_FP_UPSTREAM_PORT: "8001"
```

Add in here your product, eg NGINX_YP… YP for "yourproduct." 

```javascript
depends_on:
      nginx_templates:
        condition: service_completed_successfully
      rmfpapi:
        condition: service_started
```

Remember to require your product integration API like so in rmnginx depends_on.

## RMNGINX Templating

integrationrepo/nginx/templates_consolidated/default.conf.template

Add in your product configurations to this template:

```javascript
    fake.${NGINX_HOST}     ${NGINX_FP_UPSTREAM}:${NGINX_FP_UPSTREAM_PORT};
    mtls.fake.${NGINX_HOST}     ${NGINX_FP_UPSTREAM}:${NGINX_FP_UPSTREAM_PORT};
```

Make sure this matches what you just defined to RMNGINX container. 

This makes your product api and subdomain accessible using Deploy App (rm) mTLS certs. You can see the mTLS config below on that consolidated nginx conf.template.
