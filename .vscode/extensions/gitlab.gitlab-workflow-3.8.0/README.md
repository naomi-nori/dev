# <img src="https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/logo.png" width="64" align="center" /> [GitLab VS Code Extension](https://gitlab.com/gitlab-org/gitlab-vscode-extension)

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version/GitLab.gitlab-workflow.svg)](https://marketplace.visualstudio.com/items?itemName=GitLab.gitlab-workflow) [![Installs](https://vsmarketplacebadge.apphb.com/installs/GitLab.gitlab-workflow.svg)](https://marketplace.visualstudio.com/items?itemName=GitLab.gitlab-workflow) [![Downloads](https://vsmarketplacebadge.apphb.com/downloads/GitLab.gitlab-workflow.svg)](https://marketplace.visualstudio.com/items?itemName=GitLab.gitlab-workflow) [![Rating](https://vsmarketplacebadge.apphb.com/rating/GitLab.gitlab-workflow.svg)](https://marketplace.visualstudio.com/items?itemName=GitLab.gitlab-workflow)

**GitLab Workflow changes its main branch from `master` to `main`.** More details on the reasoning are on this [GitLab issue](https://gitlab.com/gitlab-org/gitlab/-/issues/221164).
If you are an existing contributor please run locally: `git fetch && git checkout main && git branch -D master`.

This extension integrates GitLab to VS Code by adding a new GitLab sidebar where you can find issues and merge requests created by you or assigned to you. It also extends VS Code command palette and status bar to provide more information about your project.

## Features

_You need to set up your access token to use these features, please see [Setup](#setup) section below._

### Sidebar

See your issues, MRs (including changed files) and other [custom search results](#custom-queries) on a dedicated panel in the VS Code sidebar. [Read more](#sidebar---details)

### Status bar

See pipeline status, open MR and closing issue links in the status bar. [Read more](#status-bar---details).
This pipeline status automatically updates so you don't need to open GitLab to see your pipeline status.

Advanced pipeline actions allow you to view pipeline on GitLab, create a new pipeline, retry or cancel current pipeline. [Read more](#pipeline-actions).

![_status_bar.gif](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/_status-bar.gif)

### Commands

- `GitLab: Search project issues (Supports filters)`. [Read more](#search-with-filters)
- `GitLab: Search project merge requests (Supports filters)`. [Read more](#search-with-filters)
- `GitLab: Project Advanced Search (Issues, MR's, commits, comments...)`. [Read more](#search-with-advanced-search)
- `GitLab: Create snippet` - Create public, internal or private snippet from entire file or selection. [Read more](#create-snippet).
- `GitLab: Insert snippet` - Insert a project snippet, supports multi-file snippets. [Read more](#insert-snippet).
- `GitLab: Compare current branch with master` - Compare your branch with master and view changes on GitLab. [Read more](#compare-with-master).
- `GitLab: Open active file on GitLab` - View active file on GitLab with highlighting active line number and selected text block. [Read more](#open-active-file).
- `GitLab: Validate GitLab CI config` - Validate GitLab CI configuration file `.gitlab-ci.yml`. [Read more](#validate-gitlab-ci-configuration).
- `GitLab: Open merge request for current branch`
- `GitLab: Show issues assigned to me` - Open issues assigned to you on GitLab.
- `GitLab: Show merge requests assigned to me` - Open MRs assigned to you on GitLab.
- `GitLab: Open current pipeline on GitLab`
- `GitLab: Open current project on GitLab`
- `GitLab: Create new issue on current project`
- `GitLab: Create new merge request on current project` - Open the merge request page to create a merge request.

### Other features

Supports [multi-root workspaces](https://code.visualstudio.com/docs/editor/multi-root-workspaces). The extension doesn't work well if you just open folder with multiple repositories without configuring [multi-root workspace](https://code.visualstudio.com/docs/editor/multi-root-workspaces).

Supports multiple GitLab instances [Read more](#multiple-gitlab-instances).

Published also on [Open VSX Registry](https://open-vsx.org/extension/GitLab/gitlab-workflow).

#### View issue and MR details and comments in VS Code

![_issues-in-vscode](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/_issues-in-vscode.png)

GitLab Workflow allows you to view issue details and comments right in the VS Code. Click an issue link from the sidebar and VS Code will open a new tab to show the issue details. You can also comment to the issue from VS Code. Currently, replying to discussions are not supported.

Updating assignees and labels are also not implemented. However, you can use [GitLab Slash Commands](https://docs.gitlab.com/ee/integration/slash_commands.html) to perform actions directly from VS Code. For example, to assign an issue to `@fatihacet`, simply add a comment `/assign @fatihacet` inside VS Code.

## Setup

To use this extension, you need to create a GitLab Personal Access Token and give it to the extension.

##### Step 1: Create your Personal Access Token

- If you are using
  - GitLab.com [click to open Personal Access Tokens page](https://gitlab.com/profile/personal_access_tokens).
  - Self-hosted GitLab instance go to "Settings" and click "Access Tokens" on the left navigation menu
- On "Add a personal access token" form
  - Give a name to your token.
  - Select an expiry date.
  - Select "api" and "read_user" permissions.
  - Hit "Create personal access token" button.
- Copy the token. _Remember you won't be able to see the value of this token ever again for security reasons._

##### Step 2: Add token to GitLab Workflow Extension

- Open up Command Palette by pressing `Cmd+Shift+P`.
- Search for "GitLab: Set GitLab Personal Access Token" and hit Enter.
- Enter the URL to the Gitlab instance the PAT should apply to and hit Enter.
- Extension will ask for your PAT. Paste your PAT and hit Enter. _It won't be visible and accessible to others._
- If you want to connect to GitLab hosted on a custom domain, additionally set
  `gitlab.instanceUrl` in your user or workspace settings, otherwise the extension
  will try to connect to gitlab.com. See [Configuration Options](#configuration-options) for more information.

That's it. 🏁

You can start using this extension right away. If your project has a pipeline for last commit and a MR from your current branch, you should see them on VS Code status bar. 🎉

#### Multiple Gitlab instances

If you want to use multiple GitLab instances you may want to configure each workspace separately. See `gitlab.instanceUrl` config option in [Configuration Options](#configuration-options) section.

## Configuration options

**`gitlab.instanceUrl`** _(required: false, default: "https://gitlab.com")_

If you are using GitLab on a custom domain, you must add this to your user settings file. Example: `"gitlab.instanceUrl": "https://my-gitlab-domain.com"`

To enable Gitlab Workflow extension to work with different Gitlab instances, each token is assigned to a Gitlab instance URL. For the extension to selected the correct token for a specific workspace, the option [`gitlab.instanceUrl`](#configuration-options) can be used. This option can be set in the current workspace's `.vscode/settings.json` file.

**`gitlab.showStatusBarLinks`** _(required: false, default: true)_

If you don't want to see GitLab related links on the status bar, you can set this option to `false`. If you are using version 1.0.0 or above you can also find the same links in sidebar. You should restart your VS Code after updating this option.

**`gitlab.showIssueLinkOnStatusBar`** _(required: false, default: true)_

If you are not using GitLab's issue tracker, you can set this option to `false` to remove related issue link on the status bar. You should restart your VS Code after updating this option.

**`gitlab.showMrStatusOnStatusBar`** _(required: false, default: true)_

You can toggle visibility of MR link in your sidebar. You can always find MR link in GitLab Workflow sidebar. You should restart your VS Code after updating this option.

**`gitlab.ca`** _(required: false, default: null)_

If your self-hosted GitLab instance has a self-signed SSL certificate you would probably need to set this option in to point your certificate file. More discussion can be found [in this issue](https://gitlab.com/gitlab-org/gitlab-vscode-extension/issues/26).

**`gitlab.cert`** _(required: false, default: null)_

If your self-hosted GitLab instance requires a custom cert/key pair you would probably need to set this option in to point your certificate file. Please also see `gitlab.certKey` option. More information [here](https://gitlab.com/gitlab-org/gitlab-vscode-extension/merge_requests/29#note_132284448).

**`gitlab.certKey`** _(required: false, default: null)_

If your self-hosted GitLab instance requires a custom cert/key pair you would probably need to set this option in to point your certificate key file. Please also see `gitlab.cert` option. More information [here](https://gitlab.com/gitlab-org/gitlab-vscode-extension/merge_requests/29#note_132284448).

**`gitlab.ignoreCertificateErrors`** _(required: false, default: false)_

If you are using a self-hosted GitLab instance with no SSL certificate or having certificate issues and unable to use the extension you may want to set this option to `true` to ignore certificate errors. More information can be found [here](https://gitlab.com/gitlab-org/gitlab-vscode-extension/issues/26#note_61312786).

> You can open User Settings file by pressing `Cmd+,` on Mac OS or following `Code > Preferences > User Settings`. You can simply add extension configuration values to your User Settings file. This won't break or change anything on your VS Code.

**`gitlab.remoteName`** _(required: false, default: null)_

The name of the git remote link corresponding to the GitLab repositiory with your MR and issues. If no setting is provided, the extension will detect it. For example: origin.

**`gitlab.pipelineGitRemoteName`** _(required: false, default: null)_

The name of the git remote link corresponding to the GitLab repositiory with your pipelines. If no setting is provided, the extension will detect it. For example: origin.

**`gitlab.enableExperimentalFeatures`** _(required: false, default: false)_

To enable experimental features set this flag to `true`. List of experiemental features and details can be found [here](#experiemental-features)

**`gitlab.customQueries`** _(required: false)_

Defines the search queries that retrives the items shown on the Gitlab Panel. See [#custom-queries] for more details.

### Custom Queries

You can define custom queries in your VS Code configuration.

Example:

```json
{
  "gitlab.customQueries": [
    {
      "name": "Issues assigned to me",
      "type": "issues",
      "scope": "assigned_to_me",
      "noItemText": "There is no issue assigned to you.",
      "state": "opened"
    }
  ]
}
```

Each query is an entry of the json array. Each entry can have the following values:

**`name`** _(required: true)_ : The label to show in the GitLab panel

**`type`** _(required: false, default: merge\_requests)_ : The type of GitLab items to return. If snippets is selected, none of the other filter will work. Epics will work only on GitLab ultimate/gold. Possible values: issues, merge_requests, epics, snippets, vulnerabilities.

**`noItemText`** _(required: false, default: "No items found.")_ : The text to show if the query returns no items.

**`maxResults`** _(required: false, default: 20)_ : The maximum number of results to show

**`orderBy`** _(required: false, default: created\_at)_ : Return issues ordered by the selected value. It is not applicable for vulnerabilities. Possible values: created_at, updated_at, priority, due_date, relative_position, label_priority, milestone_due, popularity, weight.

**`sort`** _(required: false, default: desc)_ : Return issues sorted in ascending or descending order. It is not applicable for vulnerabilities. Possible values: asc, desc.

**`scope`** _(required: false, default: all)_ : Return Gitlab items for the given scope. It is not applicable for epics. Possible values: assigned_to_me, created_by_me, dismissed, all. "assigned_to_me" and "created_by_me" are not applicable for vulnerabilities. "dismissed" is not applicable for issues and merge requests.

**`state`** _(required: false, default: opened)_ : "Return "all" issues or just those that are "opened" or "closed". It is not applicable for vulnerabilities. Possible values: all, opened, closed.

**`labels`** _(required: false, default: [])_ : Array of label names, Gitlab item must have all labels to be returned. "None" lists all GitLab items with no labels. "Any" lists all GitLab issues with at least one label. Predefined names are case-insensitive. It is not applicable for vulnerabilities.

**`excludeLabels`** _(required: false, default: [])_ : Array of label names, Gitlab item must not have to be returned. Predefined names are case-insensitive. Works only with issues

**`milestone`** _(required: false)_ : The milestone title. None lists all GitLab items with no milestone. Any lists all GitLab items that have an assigned milestone. It is not applicable for epics and vulnerabilities.

**`excludeMilestone`** _(required: false)_ : The milestone title to exclude. Works only with issues.

**`author`** _(required: false)_ : Return GitLab items created by the given username. It is not applicable for vulnerabilities.

**`excludeAuthor`** _(required: false)_ : Return GitLab items not created by the given username. Works only with issues.

**`assignee`** _(required: false)_ : Returns GitLab items assigned to the given username. "None" returns unassigned GitLab items. "Any" returns GitLab items with an assignee. It is not applicable for epics and vulnerabilities.

**`excludeAssignee`** _(required: false)_ : ": Returns GitLab items not assigned to the given username. Works only with issues.

**`search`** _(required: false)_ : Search GitLab items against their title and description. It is not applicable for vulnerabilities.

**`excludeSearch`** _(required: false)_ : Search GitLab items that doesn't have the search key in their title or description. Works only with issues.

**`searchIn`** _(required: false, default: all)_ : Modify the scope of the search attribute. It is not applicable for epics and vulnerabilities. Possible values: all, title, description.

**`searchIn`** _(required: false, default: all)_ :  Modify the scope of the excludeSearch attribute. Works only with issues. Possible values: all, title, description.

**`createdAfter`** _(required: false)_ : Return GitLab items created after the given date. It is not applicable for vulnerabilities.

**`createdBefore`** _(required: false)_ : Return GitLab items created before the given date. It is not applicable for vulnerabilities.

**`updatedAfter`** _(required: false)_ : Return GitLab items updated after the given date. It is not applicable for vulnerabilities.

**`updatedBefore`** _(required: false)_ : Return GitLab items updated before the given date. It is not applicable for vulnerabilities.

**`wip`** _(required: false, default: no)_ : Filter merge requests against their wip status. "yes" to return only WIP merge requests, "no" to return non WIP merge requests. Works only with merge requests.

**`confidential`** _(required: false, default: false)_ : Filter confidential or public issues. Works only with issues.

**`reportTypes`** _(required: false)_ : Returns vulnerabilities belonging to specified report types. Works only with vulnerabilities. Possible values: sast, dast, dependency_scanning, container_scanning.

**`severityLevels`** _(required: false)_ : Returns vulnerabilities belonging to specified severity levels. Defaults to all. Works only with vulnerabilities. Possible values: undefined, info, unknown, low, medium, high, critical.

**`confidenceLevels`** _(required: false)_ : Returns vulnerabilities belonging to specified confidence levels. Defaults to all. Works only with vulnerabilities. Possible values: undefined, ignore, unknown, experimental, low, medium, high, confirmed.

**`pipelineId`** _(required: false)_ : Returns vulnerabilities belonging to specified pipeline. "branch" returns vulnerabilities belonging to latest pipeline of the current branch. Works only with vulnerabilities.

## Usage

- Open up Command Palette by pressing `Cmd+Shift+P`.
- Search for `GitLab:` and you will see all the commands provided by the extension.

![https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/gitlab-vscode.png](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/gitlab-vscode.png)

![https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/pipeline-actions.png](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/pipeline-actions.png)

## Features in-depth

### Sidebar - details

Extension will add a GitLab Workflow panel to sidebar of your VS Code. The dedicated panel will allow you to see the list of your issues and MRs. Also you will be able to see pipeline, MR and issue links for your current branch.

You can see the issue and MR details by clicking on the issue item or by expanding the MR item and clicking on "Description". When you expand the MR, you can see all the changed files. When you click on a changed file, the extension opens the MR diff.

![_sidebar.gif](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/_sidebar.gif)

### Pipeline actions

One of the real power features of this extension is pipeline actions. This feature can be accessible from the status bar by clicking the pipeline status text or command palette and allows you to,

- View the latest pipeline on GitLab
- Create a new pipeline for your current branch
- Retry the last pipeline
- Cancel the last pipeline

![_pipeline_actions.gif](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/_pipeline_actions.gif)

### Status bar - details

If your current project is a GitLab project, the extension will do the following things:

- Fetch pipeline of the last commit and show it on the status bar. Clicking this item will open the pipeline actions menu.
- Show open MR for current branch and show it on the status bar. Clicking this item will open MR on GitLab.
- Fetch closing issue of that MR and show it on the status bar. Clicking this item will open Issue on GitLab.

### Search

GitLab Workflow extension provides you two types of search. Search with filters and Advanced Search.

#### Search with filters
It allows users to search issues/MRs against their title and description fields. In the search input, you can type your search term and hit Enter, for example, `Inconsistent line endings for HEX files` or `Pipelines should ignore retried builds`.

It can become more powerful by allowing you to filter issues/MRs by author, assignee, milestone, title etc. Below is the full list of supported filter tokens

| Token     | Description                                                                                                                             | Example                                                            |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| title     | Search issues/MRs against their title and description. You don't need to add quotes around multiple words. See Important notes section. | discussions refactor                                               |
| labels    | Comma separated label list for multiple labels.                                                                                         | `labels: frontend, Discussion, performance`                        |
| label     | To search with a single label. You can also have multiple `label` tokens.                                                               | `label: frontend` or `label:frontend label: Discussion`            |
| milestone | Milestone title without `%`.                                                                                                            | `milestone: 9.5`                                                   |
| scope     | Searches issues/MRs for the given scope. Values can be `created-by-me`, `assigned-to-me` or `all`. Defaults to `created-by-me`.         | `scope: created-by-me` or `scope: assigned-to-me` or `scope: all`. |
| author    | Username of the author without `@`.                                                                                                     | `author: fatihacet`                                                |
| assignee  | Username of the assignee without `@`.                                                                                                   | `assignee: timzallmann`                                            |

**Examples**

- `title: new merge request widget author: fatihacet assignee: jschatz1 labels: frontend, performance milestone: 10.5`
- `title: multiple group page author: annabeldunstone assignee: timzallmann label: frontend`

**Important notes**

- `:` after the token name is necessary. `label :` is not a valid token name and may return parsing error. Hence `label:` should be used. However, space after the token name is optional. Both `label: frontend` and `label:frontend` is valid. This rule is valid for all tokens above.
- You don't need to add quotes around multiple words for `title` token. `title:"new merge request widget"` may return parsing error. `title: new merge request widget` should be used.
- You can have `labels` and `label` tokens at the same time. `labels: fronted discussion label: performance` is a valid query and all labels will be included in your search query. It's equal with `labels: fronted discussion performance`. You can also have multiple `label` tokens. `label: frontend label: discussion label: performance` is valid and equals to `labels: fronted discussion performance`.

![_advanced-search.gif](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/_advanced-search.gif)

#### Search with Advanced Search
GitLab provides [Advanced Search feature which is backed by Elasticsearch](https://docs.gitlab.com/ee/integration/elasticsearch.html). Please see [Advanced Search syntax](https://docs.gitlab.com/ee/user/search/advanced_search_syntax.html) for more details.

### Create snippet

You can create a snippet from selection or entire file. You can also select visibility level of your snippet.

![_create-snippet.gif](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/_create-snippet.gif)

### Insert snippet

You can insert public and private project snippets. The insert supports [multi-file snippets](https://docs.gitlab.com/ee/user/snippets.html#multiple-files-by-snippet).

![insert-multi-file-snippet](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/insert-multi-file-snippet.gif)

### Compare with master

You can see changes in your branch by comparing with `master` and see them on GitLab.

![_compare-with-master.gif](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/_compare-with-master.gif)

> Soon extension will support comparing your current branch with other branches.

### Open active file

This command allows you to see active file on GitLab. Extension sends active line number and selected text block to GitLab UI so you can see them highlighted.

![_open_active_file.gif](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/_open_active_file.gif)

### Validate GitLab CI Configuration

Using this command, you can quickly validate GitLab CI configuration.

![_validate-ci-config.gif](https://gitlab.com/gitlab-org/gitlab-vscode-extension/raw/main/src/assets/_validate-ci-config.gif)

---

## Contribution

This extension is open source and [hosted on GitLab](https://gitlab.com/gitlab-org/gitlab-vscode-extension). Contributions are more than welcome. Feel free to fork and add new features or submit bug reports.

[Here](https://gitlab.com/gitlab-org/gitlab-vscode-extension/-/blob/main/CONTRIBUTORS.md) is the list of great people who contributed this project and make it even more awesome. Thank you all 🎉
