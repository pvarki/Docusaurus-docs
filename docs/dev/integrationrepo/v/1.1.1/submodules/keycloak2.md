---
title: "pvarki/docker-keycloak – README"
---

> **Integration tag:** `1.1.1` · **Submodule commit:** `ecebb50fd8debdbdaba722ddba6a6f6c94100b1e`  
> **Repo:** git@github.com:pvarki/docker-keycloak.git  
> **Browse at this commit:** https://github.com/pvarki/docker-keycloak/tree/ecebb50fd8debdbdaba722ddba6a6f6c94100b1e

# KeyCloak

Templates, init container etc to setup keycloak automagically with ENV
variables.

## Used as git submodule

This repo is used as submodule in
[https://github.com/pvarki/docker-rasenmaeher-integration](https://github.com/pvarki/docker-rasenmaeher-integration) it is
probably a good idea to handle all development via it because it has
docker composition for bringin up all the other services rasenmaeher-api
depends on

## pre-commit notes

Make sure pre-commit is installed:

    pre-commit install --install-hooks

And it's a good idea to run it regularly before committing:

    pre-commit run --all-files

