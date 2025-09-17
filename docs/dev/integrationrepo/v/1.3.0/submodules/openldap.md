---
title: "pvarki/docker-openldap – README"
---

> **Integration tag:** `1.3.0` · **Submodule commit:** `36a16a5d02a5d5312c2a8f395d0b9933ffc26751`  
> **Repo:** git@github.com:pvarki/docker-openldap.git  
> **Browse at this commit:** https://github.com/pvarki/docker-openldap/tree/36a16a5d02a5d5312c2a8f395d0b9933ffc26751

# openLDAP with PVARKI defaults

## Used as git submodule

This repo is used as submodule in https://github.com/pvarki/docker-rasenmaeher-integration
it is probably a good idea to handle all development via it because it has docker composition
for bringin up all the other services rasenmaeher-api depends on

## Local testing

1. Run ```docker-compose -f docker-compose-local.yml up```

Execute inside openldap container with uid of created user:

```
ldapsearch -LL -Y EXTERNAL -H ldapi:/// "(uid=testuser)" -b dc=example,dc=org memberOf
```

