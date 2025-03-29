# Using Release Please

## Introduction

Release Please is a tool that automates the release process by generating release notes and version bumps based on Conventional Commits. It helps maintain a consistent and automated release workflow, reducing the manual effort required to manage releases.

## How Release Please Works

Release Please works by analyzing the commit history and identifying Conventional Commits. Based on the types of commits, it determines the appropriate version bump (major, minor, or patch) and generates release notes that summarize the changes.

### Key Features

- **Automated Versioning**: Automatically determines the next version based on commit messages.
- **Release Notes Generation**: Generates detailed release notes from commit messages.
- **GitHub Integration**: Integrates with GitHub to create release pull requests and tags.

## Installation

To use Release Please, you need to install it as a GitHub Action.

### GitHub Action

Add the following configuration to your GitHub Actions workflow file (e.g., `.github/workflows/release-please.yml`):

```yaml
name: Release Please

on:
  push:
    branches:
      - main
  pull_request:
    branches-ignore:
      - release-please--branches--main
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - uses: googleapis/release-please-action@v4
        with:
          release-type: node
          package-name: your-package-name
```

## Configuration

Release Please can be configured using a `.release-please-config.json` file in the root of your repository. Here is an example configuration:

```json
{
  "release-type": "node",
  "package-name": "your-package-name",
  "bump-minor-pre-major": true,
  "changelog-sections": [
    {
      "type": "feat",
      "section": "Features"
    },
    {
      "type": "fix",
      "section": "Bug Fixes"
    },
    {
      "type": "docs",
      "section": "Documentation"
    }
  ]
}
```

### Configuration Options

- **release-type**: The type of project (e.g., `node`, `java`, `python`).
- **package-name**: The name of the package.
- **bump-minor-pre-major**: Whether to bump minor version for pre-major releases.
- **changelog-sections**: Custom sections for the changelog.

## Usage

### Creating a Release

To create a release, push your changes to the main branch. The GitHub Action will automatically run and create a release pull request with the version bump and release notes. Once the pull request is merged, Release Please will create a GitHub release and tag.

### Example Workflow

1. **Commit Changes**: Developers commit changes using Conventional Commits.
2. **Push to Main**: Changes are pushed to the main branch.
3. **Release Please Action**: The GitHub Action runs and creates a release pull request.
4. **Merge Pull Request**: The release pull request is reviewed and merged.
5. **GitHub Release**: Release Please creates a GitHub release and tag.

## Conventional Commits and Version Bumps

Release Please uses Conventional Commits to determine the type of version bump required. Here are the common commit types and their corresponding version bumps:

- **feat**: Increments the minor version (e.g., `1.0.0` to `1.1.0`).
- **fix**: Increments the patch version (e.g., `1.0.0` to `1.0.1`).
- **docs**, **style**, **refactor**, **perf**, **test**, **chore**: Do not affect the version number.

### Example

Here is an example of how Release Please works in practice:

1. **Commit Messages**:
   ```
   feat(ui): add dark mode toggle
   fix(api): correct user authentication logic
   docs(readme): update installation instructions
   ```

2. **Release Pull Request**:
   - **Version Bump**: `1.1.0` (minor version bump due to `feat` commit)
   - **Release Notes**:
     ```
     ## 1.1.0 (2025-03-13)

     ### Features
     - **ui**: add dark mode toggle

     ### Bug Fixes
     - **api**: correct user authentication logic

     ### Documentation
     - **readme**: update installation instructions
     ```

3. **GitHub Release**: Once the pull request is merged, a new GitHub release is created with the version `1.1.0` and the generated release notes.

By following these steps, you can automate your release process and ensure that your project maintains a consistent and reliable release workflow.