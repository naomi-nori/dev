const vscode = require('vscode');
const gitLabService = require('./gitlab_service');
const openers = require('./openers');
const { getCurrentWorkspaceFolderOrSelectOne } = require('./services/workspace_service');
const { createGitService } = require('./git_service_factory');

const parseQuery = (query, noteableType) => {
  const params = {};
  const tokens = query
    .replace(/: /g, ':') // Normalize spaces after tokens.
    .replace(/\s[a-z]*:/gi, t => `\n${t}`) // Get tokens and add new line.
    .split('\n') // Create array from tokens.
    .map(t => t.trim().split(':')); // Return new array with token and value arrays.

  // If there is no token it's a basic text search.
  if (tokens.length === 1 && tokens[0][1] === undefined) {
    // eslint-disable-next-line prefer-destructuring
    params.search = tokens[0][0];
  } else {
    tokens.forEach(t => {
      const [token, value] = t;

      switch (token) {
        // Merge value of `labels` token with previous labels.
        // By doing this we will be able to use `labels` and `label` token together.
        case 'labels':
          params.labels = (params.labels || []).concat(value.replace(/, /g, ',').split(','));
          break;

        // Labels can be multiple and should be comma separated.
        case 'label':
          params.labels = params.labels || [];
          params.labels.push(value);
          break;

        // GitLab requires Title and Description in `search` query param.
        // Since we are passing this as search query, GL will also search in issue descriptions too.
        case 'title':
          params.search = value;
          break;

        // GitLab UI requires milestone as milestone_title.
        case 'milestone':
          delete params.milestone;
          params.milestone_title = value;
          break;

        // GitLab requires author name as author_username.
        // `author` is syntatic sugar of extension.
        case 'author':
          delete params.author;

          if (value === 'me') {
            params.scope = 'created-by-me';
          } else {
            params.author_username = value;
          }
          break;

        // GitLab requires assignee name as assignee_username[] for issues.
        // and as assignee_username for merge requests `assignee` is syntatic sugar of extension.
        // We currently don't support multiple assignees for issues.
        case 'assignee':
          delete params.assignee;

          if (value === 'me') {
            params.scope = 'assigned-to-me';
          } else {
            const key =
              noteableType === 'merge_requests' ? 'assignee_username' : 'assignee_username[]';
            params[key] = value;
          }
          break;

        // Add other tokens. If there is a typo in token name GL either ignore it or won't find any issue.
        default:
          params[token] = value;
          break;
      }
    });
  }

  // URL encode keys and values and return a new array to build actual query string.
  const queryParams = Object.keys(params).map(k =>
    params[k] ? `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}` : '',
  );

  return queryParams.length ? `?${queryParams.join('&')}` : '';
};

async function getSearchInput(description) {
  return await vscode.window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: description,
  });
}

async function showSearchInputFor(noteableType) {
  const workspaceFolder = await getCurrentWorkspaceFolderOrSelectOne();
  const project = await gitLabService.fetchCurrentProject(workspaceFolder);
  const query = await getSearchInput(
    'Search in title or description. (Check extension page for search with filters)',
  );
  const queryString = await parseQuery(query, noteableType);

  await openers.openUrl(`${project.web_url}/${noteableType}${queryString}`);
}

async function showIssueSearchInput() {
  showSearchInputFor('issues');
}

async function showMergeRequestSearchInput() {
  showSearchInputFor('merge_requests');
}

async function showProjectAdvancedSearchInput() {
  const workspaceFolder = await getCurrentWorkspaceFolderOrSelectOne();
  const project = await gitLabService.fetchCurrentProject(workspaceFolder);
  const query = await getSearchInput(
    'Project Advanced Search. (Check extension page for Advanced Search)',
  );
  const queryString = await encodeURIComponent(query);
  const instanceUrl = await createGitService(workspaceFolder).fetchCurrentInstanceUrl();

  // Select issues tab by default for Advanced Search
  await openers.openUrl(
    `${instanceUrl}/search?search=${queryString}&project_id=${project.id}&scope=issues`,
  );
}

exports.showIssueSearchInput = showIssueSearchInput;
exports.showMergeRequestSearchInput = showMergeRequestSearchInput;
exports.showProjectAdvancedSearchInput = showProjectAdvancedSearchInput;
