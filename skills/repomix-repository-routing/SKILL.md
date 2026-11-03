---
name: repomix-repository-routing
description: >-
  An add-on to repomix-explorer that broadens its triggering criteria when
  exploring remote Git repositories on GitLab (including self-hosted instances
  and nested groups), Bitbucket, Azure DevOps, and other supported Git hosting
  services via HTTPS, SSH, or web links to branches, tags, commits, files,
  and directories.
---

# Extended Triggers for repomix-explorer

Repomix already supports the Git hosting services and address formats listed
below. This add-on broadens the criteria for selecting `repomix-explorer` so
that the agent uses these capabilities.

If a task falls within the scope of `repomix-explorer`, select and load it for
GitLab (including self-hosted instances and nested groups), Bitbucket, Azure
DevOps, and other supported Git hosting services as well.

Treat the following address formats as triggers for selecting the skill:

- An HTTPS repository URL, such as
  `https://gitlab.example.com/group/subgroup/project.git`.
- An SCP-style SSH address, such as
  `git@gitlab.example.com:group/subgroup/project.git`.
- A GitLab SSH URL in the form `ssh://git@host/group/repo.git` without an
  explicitly specified port.
- Web links to a repository branch, tag, commit, file, or directory.

All other applicability criteria are defined by `repomix-explorer`; if it is
already loaded, reuse the existing context.
