# Conventional Commits

## Introduction

Conventional Commits is a specification for writing commit messages that are easy to read and understand. By following this convention, you can automate the release process, generate changelogs, and maintain a consistent commit history. This project uses the Conventional Commits specification to ensure that all commit messages are structured and meaningful.

## Commit Message Format

A commit message consists of a header, an optional body, and an optional footer. The header has a specific format that includes a type, an optional scope, and a subject.

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Types

The type indicates the nature of the change. Common types include:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (e.g., formatting, missing semicolons)
- **refactor**: Code refactoring (neither fixes a bug nor adds a feature)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Changes to the build process or auxiliary tools

### Scope

The scope is optional and provides additional context about the change. It should be a noun describing what is affected (e.g., `ui`, `backend`, `docs`).

### Subject

The subject is a brief description of the change. It should be concise and written in the imperative mood (e.g., "add", "fix", "update").

### Body

The body is optional and provides a more detailed explanation of the change. It should include any relevant information that helps understand the change.

### Footer

The footer is optional and can include references to issues or breaking changes. Use the `BREAKING CHANGE:` prefix to indicate a breaking change.

## Examples

Here are some examples of Conventional Commits:

- **Feature**:
  ```
  feat(ui): add dark mode toggle

  This commit adds a dark mode toggle to the user interface, allowing users to switch between light and dark themes.
  ```

- **Bug Fix**:
  ```
  fix(api): correct user authentication logic

  This commit fixes the user authentication logic to properly handle edge cases where the user token is expired.
  ```

- **Documentation**:
  ```
  docs(readme): update installation instructions

  This commit updates the installation instructions in the README to include steps for setting up the project on Windows.
  ```

- **Style**:
  ```
  style(css): format CSS files

  This commit formats the CSS files to ensure consistent indentation and spacing.
  ```

- **Refactor**:
  ```
  refactor(auth): simplify authentication middleware

  This commit refactors the authentication middleware to reduce complexity and improve readability.
  ```

- **Performance**:
  ```
  perf(api): optimize database queries

  This commit optimizes the database queries to improve the performance of the API endpoints.
  ```

- **Test**:
  ```
  test(auth): add unit tests for authentication module

  This commit adds unit tests for the authentication module to ensure that all edge cases are covered.
  ```

- **Chore**:
  ```
  chore(deps): update dependencies

  This commit updates the project dependencies to their latest versions.
  ```

## Using Release Please

We use [Release Please](https://github.com/googleapis/release-please) to automate the release process. Release Please generates release notes and version bumps based on the Conventional Commits in the repository. By following the Conventional Commits specification, you ensure that Release Please can accurately determine the changes and generate the appropriate release notes.