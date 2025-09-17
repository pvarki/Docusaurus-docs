---
title: "pvarki/rasenmaeher-ui – README"
---

> **Integration tag:** `1.2.1` · **Submodule commit:** `66c222e19a14434cae80f75b6e3a64e964707b05`  
> **Repo:** git@github.com:pvarki/rasenmaeher-ui.git  
> **Browse at this commit:** https://github.com/pvarki/rasenmaeher-ui/tree/66c222e19a14434cae80f75b6e3a64e964707b05

# UI For RASENMAEHER

React, TS etc

## Docker

For more controlled deployments and to get rid of "works on my computer"
-syndrome, we always make sure our software works under docker.

It's also a quick way to get started with a standard development
environment.

### SSH agent forwarding

We need
[buildkit](https://docs.docker.com/develop/develop-images/build_enhancements/):

    export DOCKER_BUILDKIT=1

And also the exact way for forwarding agent to running instance is
different on OSX:

    export DOCKER_SSHAGENT="-v /run/host-services/ssh-auth.sock:/run/host-services/ssh-auth.sock -e SSH_AUTH_SOCK=/run/host-services/ssh-auth.sock"

and Linux:

    export DOCKER_SSHAGENT="-v $SSH_AUTH_SOCK:$SSH_AUTH_SOCK -e SSH_AUTH_SOCK"

### Creating a development container

Build image, create container and start it:

    docker build --ssh default --target devel_shell -t rasenmaeher_ui:devel_shell .
    docker create --name rmui_devel -v `pwd`":/app" -p 8002:8002 -it `echo $DOCKER_SSHAGENT` rasenmaeher_ui:devel_shell
    docker start -i rmui_devel

Note: due to the volume mapping if you already had run "npm install" on
the host you need to delete the node_modules directory and in any case
you need to run "npm install" inside the container.

### pre-commit considerations

If working in Docker instead of native env you need to run the
pre-commit checks in docker too:

    docker exec -i rmui_devel /bin/bash -c "pre-commit install"
    docker exec -i rmui_devel /bin/bash -c "pre-commit run --all-files"

You need to have the container running, see above. Or alternatively use
the docker run syntax but using the running container is faster:

    docker run --rm -it -v `pwd`":/app" rasenmaeher_ui:devel_shell -c "pre-commit run --all-files"

### Production docker

This will just deliver the compiled files to a mounted directory

> docker build --ssh default --target production -t
> rasenmaeher_ui:amd64-latest . docker run -it --rm -v
> <span class="title-ref">pwd</span>/rmui_files:/deliver
> rasenmaeher_ui:amd64-latest

Then you need to serve things so that index.html is the default
controller for things, nginx example:

    location / &#123;
        index index.html;
        root /rmui_files;
        try_files $uri $uri/ /index.html =404;
    &#125;

## Development

TLDR:

- Create and activate a Node 18 virtualenv:

      FIXME: Insert instructions

- change to a branch:

      git checkout -b my_branch

- Install project deps and pre-commit hooks:

      npm install
      pre-commit install
      pre-commit run --all-files

- Ready to go.

Remember to activate your virtualenv whenever working on the repo.

### Asset set

Asset set is loaded according to VITE_ASSET_SET enviroment variable.
Changing asset set requires reloading vite. Folder assetSetStore
contains files for for different sets that are copied to src/assets/set/
folder on startup. Current set is tracked with setName.txt file.

When you want to use dynamic assets, you want to make sure your dynamic
asset has equivalent for sets (both "fdf" and "neutral", so on). If the
assets are images, you want to then import them to your components from
/assets/set/\* where the env-defined assets are placed by VITE on
startup. If the assets are translation keys, make sure keys are present
in locales under assetSetStore, and then use the "dynamic" namespace for
accessing them.

