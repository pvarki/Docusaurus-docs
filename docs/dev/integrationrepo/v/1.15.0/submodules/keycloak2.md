---
title: "pvarki/docker-keycloak – README"
---

> **Integration tag:** `1.15.0` · **Submodule commit:** `8b2efdf6a4d90fd91d2074617983c086ebe537c5`  
> **Repo:** git@github.com:pvarki/docker-keycloak.git  
> **Browse at this commit:** https://github.com/pvarki/docker-keycloak/tree/8b2efdf6a4d90fd91d2074617983c086ebe537c5

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

