---
title: "pvarki/golang-kraftwerk-init-helper-cli – README"
---

> **Integration tag:** `1.7.2` · **Submodule commit:** `94d1a7c7581a3c08e87d0e365e21db96d40b7e78`  
> **Repo:** git@github.com:pvarki/golang-kraftwerk-init-helper-cli.git  
> **Browse at this commit:** https://github.com/pvarki/golang-kraftwerk-init-helper-cli/tree/94d1a7c7581a3c08e87d0e365e21db96d40b7e78

golang-kraftwerk-init-helper-cli ===============================

Tool for products to create their certificates from
<span class="title-ref">KRAFTWERK</span> manifests.

# Development

## Prerequisites

**Enable**
[buildkit](https://docs.docker.com/develop/develop-images/build_enhancements/)

```bash
export DOCKER_BUILDKIT=1
```

**Forward SSH-agent to running instance:**

**OSX:**

```bash
export DOCKER_SSHAGENT="-v /run/host-services/ssh-auth.sock:/run/host-services/ssh-auth.sock -e SSH_AUTH_SOCK=/run/host-services/ssh-auth.sock"
```

**Linux:**

```bash
export DOCKER_SSHAGENT="-v $SSH_AUTH_SOCK:$SSH_AUTH_SOCK -e SSH_AUTH_SOCK"
```

## Create & start development container

Build the image, create a container and start the container

```bash
docker build --ssh default --target dev_shell -t kraftwerk_init_helper:dev_shell .
```

```bash
docker create --name kraftwerk_init_helper -v `pwd`":/app" -it `echo $DOCKER_SSHAGENT` kraftwerk_init_helper:dev_shell
```

```bash
docker start -i kraftwerk_init_helper
```

## pre-commit initialization

Once inside the container, run:

```bash
pre-commit install && pre-commit run --all-files
```

That's it, now you have the development environment up & running.

# Production

Build the production image:

```bash
docker build --ssh default --target production -t kraftwerk_init_helper:latest .
```

Run the image:

```bash
docker run --rm -it --name kraftwerk_helper kraftwerk_init_helper:latest
```

