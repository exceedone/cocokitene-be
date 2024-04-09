# Development Rule

### Branch name

#### Some default branches

- master: production mode
- develop: development mode
- staging: testing mode

#### Other branches

The branch name follow format: type/branch-name
"type" is defined in commit rule below.

### Commit name

- [Commit rules](https://github.com/a/master/docs/commit-conversion.md)

### Folder name, file name

- apps folder: contains applications of system
- libs folder: contains reuse libraries
- Normal folders: cores, database, module, ...
- File: main.ts, block.entity.ts, block.controller.ts, block.service.ts,...
- Constants variables have to be upppercase ex: ENDPOINT_URL = "http://localhost:4000"
- Import: use '@api/' stands for src folder apps/api/src,... (tsconfig.json alias path)

### Develop

```sh
git checkout develop
```

```sh
git pull origin develop
```

```sh
git checkout -b feat/branch-name
```

```sh
git add .
```

```sh
git commit -m "feat: commit description"
```

```sh
git push origin feat/branch-name
```

Create pull request from feat/branch-name to develop. Reviewer will review code and merge.

### Fix conflict

Fix confict with branch that is checkouted from one.

```sh
git checkout develop
```

```sh
git pull origin develop
```

```sh
git checkout feat/branch-name
```

```sh
git rebase develop
```

Fix conflict and

```sh
git add .
```

```sh
git rebase --continue
```
