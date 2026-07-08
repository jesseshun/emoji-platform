# Development Rules

1. Before every development task, run `git status`.
2. Only work on the current requested phase.
3. Do not develop future phases unless explicitly requested.
4. Do not change the planned architecture without confirmation.
5. Do not convert the project into a pure static HTML generator.
6. Do not remove apps/web, apps/admin, apps/api once created.
7. Do not bypass Prisma/PostgreSQL once introduced.
8. Do not copy competitor code, UI, content, database, or images.
9. Do not make large refactors without first explaining the reason.
10. Do not delete files unless the user explicitly confirms.
11. After each phase, update PROJECT_HANDOFF.md.
12. After each phase, update CHANGELOG.md.
13. After each phase, run available checks such as lint, typecheck, and build.
14. After each phase, commit changes.
15. After each important phase, create a git tag.
16. After each commit or tag, push to the remote repository.
17. If a new conversation starts, read PROJECT_HANDOFF.md, DEVELOPMENT_RULES.md, ROADMAP.md, and CHANGELOG.md before making changes.
18. If the current directory is not the project root, stop and ask for confirmation.
19. If `git status` is not clean before starting a new phase, explain the current state first.
20. Prefer small, reversible changes over large one-shot changes.
