---
title: "3. Integration repo merge process"
---

# **Doing & merging an integration repo PR** - Release Process

When a submodule PR is merged, **nothing has been released** - yet. 

The Release process takes place, to give your Brand New Update a Version Tag, which is the medium to get it into actually Released to Users.

# Version Delivery Process - Responsible people:

### You/Developer (or delegated to Submodule Code Lead, etc).


1. ### Create a new branch of the [RASENMAEHER integration repo](https://github.com/pvarki/docker-rasenmaeher-integration).

   Open a new PR on it.

   \
2. ### **Update the submodule pointers.** 

   This is the "bread" of an integration repo PR: it makes the submodule code change to its New Main (of that time) after your freshly-done step2 of merging your PR to the submodule main. This works as follows:

   **a.** Get rid of whatever you had in your own clone of the integration repo: `rm -rf docker-rasenmaeher integration`.

   **b.** Freshly clone the integration repo.

   **c. I**n your shell, navigate to the integration repo folder - `docker-rasenmaeher-integration.`

   **d.** Change directory to submodule to-be-updated, eg: `cd ui`.

   **e.** See `git status` to see on which branch you are right now. It will be like:: ``` bg@Ompputunkki takintegration % git status HEAD detached at f2c93f1`` ``` This means, that you are at specific pointer. In a freshly-cloned docker-rasenmaeher-integration, the pointer to a latest version of that submodule the integration repo knows. Thisis NOT automatically new main at that submodule, even after you merge to it

   **f.** So change the submodule branch to 'main' as you have had your submodule PR freshly merged to that submodule's main: `git checkout main`.

   **g.** See `git status`to confirm we are at the main branch of this submodule now.

   **h**. `cd ..` to the integration repo folder.

   **j.** Using `git status` here, you can now see you got your submodule updated. Commit this saying "chore: pointer update to (yourmodule, eg. ui)".

   **Nice, pointer is updated now.**

   \
3. ### **Run bump2version to upgrade the Version Tags**. 

   We use bump2version to upgrade the Version Tags automatically.  By Github Actions, when your integration PR is ultimately merged, it is by these Version Tags the new version is released to Docker Hub, and so ultimately to the users. It works like this:

   **a.** If not already, install bump2version: `pip install bump2version`

   **b.** bump2version has three categories of versions: **major, minor and patch**. Eg. 1.4.2, 1 (major), 4 (minor), 2 (patch). Run `bump2version (versioncategory)` after the consensus of which level of update it's going to be. Eg. `bump2version patch`.

   **c.** bump2version runs, nice, we got **New Version Tags** now.

   **d.** When your PR is merged to main, [.github/workflows/release.yml](https://github.com/pvarki/docker-rasenmaeher-integration/blob/main/.github/workflows/release.yml) runs so that we get brand new Version Tags to the version you've set up using bump2version.

   \
4. ### Make Changes to docker-compose.ymls, if applicable:

   **a.** If your new feature calls for edits in docker-compose.yml files, make them now. Eg. new env variable.

   **b.** MAKE SURE to discuss these both with the **Product Team** AND **Infra Team**, as changes here affect our Infra as well.

   \


5. ### Call for Review.

   Fo changes according to review, if applicable.

   \


6. ### Merge! 

   Upon Merge, github actions will bake fresh versions with your Version Tag to our Docker Hub. Congratulations - new release has been shipped.

## Product Team

* Review the PR throughly. As an integration repo PR is a release candidate, be meticulous. If it's going to go in now, it's harder to fix later.

## Product Tech Lead

* Either review yourself or really trust who does the reviews.

## Product Owner

* Arrange Systems Tests with people capable of doing testing for the intended target user group.
* Inform when tests take place and make sure the test results & observations are known.
