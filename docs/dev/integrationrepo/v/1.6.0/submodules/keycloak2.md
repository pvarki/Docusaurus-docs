---
title: "pvarki/docker-keycloak – README"
---

> **Integration tag:** `1.6.0` · **Submodule commit:** `84cb459c5b0ecacfce4213e6e3aa0a0e33be914e`  
> **Repo:** git@github.com:pvarki/docker-keycloak.git  
> **Browse at this commit:** https://github.com/pvarki/docker-keycloak/tree/84cb459c5b0ecacfce4213e6e3aa0a0e33be914e

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

