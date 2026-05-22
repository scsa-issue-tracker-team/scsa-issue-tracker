const TOKEN_KEY = "scsaIssueTrackerAccessToken";
const ACTIVE_PROJECT_KEY = "scsaIssueTrackerActiveProjectId";
const ACTIVE_ISSUE_KEY = "scsaIssueTrackerActiveIssueId";

const state = {
  token: localStorage.getItem(TOKEN_KEY) ?? "",
  currentUser: null,
  projects: [],
  users: [],
  recentIssues: [],
  activeProjectId: localStorage.getItem(ACTIVE_PROJECT_KEY) ?? "",
  activeIssueId: localStorage.getItem(ACTIVE_ISSUE_KEY) ?? "",
  log: [],
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  signupForm: $("#signupForm"),
  loginForm: $("#loginForm"),
  projectForm: $("#projectForm"),
  issueCreateForm: $("#issueCreateForm"),
  issueUpdateForm: $("#issueUpdateForm"),
  commentForm: $("#commentForm"),
  tokenOutput: $("#tokenOutput"),
  resultOutput: $("#resultOutput"),
  lastRequestLabel: $("#lastRequestLabel"),
  serverStatusDot: $("#serverStatusDot"),
  serverStatusText: $("#serverStatusText"),
  currentUserPill: $("#currentUserPill"),
  projectList: $("#projectList"),
  activeProjectLabel: $("#activeProjectLabel"),
  projectIdInput: $("#projectIdInput"),
  issueIdInput: $("#issueIdInput"),
  recentIssueList: $("#recentIssueList"),
  commentList: $("#commentList"),
  usersTableBody: $("#usersTableBody"),
  requestLog: $("#requestLog"),
};

elements.tokenOutput.value = state.token;
elements.projectIdInput.value = state.activeProjectId;
elements.issueIdInput.value = state.activeIssueId;

function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function toNumberOrNull(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  const number = Number(trimmed);
  return Number.isNaN(number) ? null : number;
}

function dropEmptyFields(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );
}

function setActiveProject(projectId) {
  state.activeProjectId = String(projectId ?? "");
  elements.projectIdInput.value = state.activeProjectId;
  localStorage.setItem(ACTIVE_PROJECT_KEY, state.activeProjectId);
  renderProjects();
}

function setActiveIssue(issueId) {
  state.activeIssueId = String(issueId ?? "");
  elements.issueIdInput.value = state.activeIssueId;
  localStorage.setItem(ACTIVE_ISSUE_KEY, state.activeIssueId);
  renderRecentIssues();
}

function getToken() {
  return elements.tokenOutput.value.trim();
}

function saveToken(accessToken) {
  state.token = accessToken;
  localStorage.setItem(TOKEN_KEY, accessToken);
  elements.tokenOutput.value = accessToken;
}

function clearToken() {
  state.token = "";
  state.currentUser = null;
  localStorage.removeItem(TOKEN_KEY);
  elements.tokenOutput.value = "";
  renderCurrentUser();
}

function renderCurrentUser() {
  if (!state.currentUser) {
    elements.currentUserPill.textContent = "로그인 필요";
    elements.currentUserPill.classList.remove("ok");
    return;
  }

  elements.currentUserPill.textContent = `${state.currentUser.username} · ID ${state.currentUser.userId}`;
  elements.currentUserPill.classList.add("ok");
}

function renderResult(label, data) {
  elements.lastRequestLabel.textContent = label;
  elements.resultOutput.textContent = JSON.stringify(data, null, 2);
}

function pushLog(entry) {
  state.log = [entry, ...state.log].slice(0, 8);
  elements.requestLog.innerHTML = state.log
    .map(
      (item) => `
        <div class="log-item ${item.ok ? "ok" : "error"}">
          <span>${item.method}</span>
          <strong>${item.path}</strong>
          <em>${item.status}</em>
        </div>
      `
    )
    .join("");
}

function setServerStatus(stateName, text) {
  elements.serverStatusDot.classList.remove("ok", "error");
  elements.serverStatusDot.classList.add(stateName);
  elements.serverStatusText.textContent = text;
}

async function api(path, options = {}) {
  const method = options.method ?? "GET";
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.auth === false ? {} : getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...options.headers,
  };

  const response = await fetch(path, {
    ...options,
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  const data = text
    ? contentType.includes("application/json")
      ? JSON.parse(text)
      : text
    : null;

  pushLog({ method, path, status: response.status, ok: response.ok });

  if (!response.ok) {
    const error = { status: response.status, data };
    renderResult(`${method} ${path}`, error);
    throw error;
  }

  renderResult(`${method} ${path}`, data ?? { status: response.status, message: "응답 본문 없음" });
  return data;
}

function requireLogin() {
  if (!state.currentUser?.userId) {
    renderResult("로그인 필요", { message: "먼저 로그인하고 내 정보를 불러와야 합니다." });
    return false;
  }
  return true;
}

function requireProjectId() {
  const projectId = toNumberOrNull(elements.projectIdInput.value);
  if (!projectId) {
    renderResult("Project ID 필요", { message: "프로젝트를 선택하거나 Project ID를 입력하세요." });
    return null;
  }
  return projectId;
}

function requireIssueId() {
  const issueId = toNumberOrNull(elements.issueIdInput.value);
  if (!issueId) {
    renderResult("Issue ID 필요", { message: "이슈를 생성하거나 Issue ID를 입력하세요." });
    return null;
  }
  return issueId;
}

function renderProjects() {
  const active = String(state.activeProjectId);
  elements.activeProjectLabel.textContent = active ? `#${active}` : "없음";

  if (!state.projects.length) {
    elements.projectList.innerHTML = `<p class="empty-text">프로젝트가 아직 없습니다.</p>`;
    return;
  }

  elements.projectList.innerHTML = state.projects
    .map(
      (project) => `
        <button class="list-card ${String(project.id) === active ? "active" : ""}" data-project-id="${project.id}">
          <span>#${project.id}</span>
          <strong>${project.name ?? "이름 없음"}</strong>
          <small>${project.description ?? "설명 없음"}</small>
        </button>
      `
    )
    .join("");

  $$("#projectList [data-project-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      setActiveProject(button.dataset.projectId);
      await loadProjectDetail(button.dataset.projectId);
    });
  });
}

function renderUsers() {
  if (!state.users.length) {
    elements.usersTableBody.innerHTML = `<tr><td colspan="3">사용자 데이터가 없습니다.</td></tr>`;
    return;
  }

  elements.usersTableBody.innerHTML = state.users
    .map(
      (user) => `
        <tr>
          <td>${user.id}</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
        </tr>
      `
    )
    .join("");
}

function renderRecentIssues() {
  const active = String(state.activeIssueId);

  if (!state.recentIssues.length) {
    elements.recentIssueList.innerHTML = `<p class="empty-text">생성하거나 조회한 이슈가 여기에 표시됩니다.</p>`;
    return;
  }

  elements.recentIssueList.innerHTML = state.recentIssues
    .map(
      (issue) => `
        <button class="issue-chip ${String(issue.id) === active ? "active" : ""}" data-issue-id="${issue.id}" data-project-id="${issue.projectId}">
          <span>#${issue.id}</span>
          <strong>${issue.title}</strong>
          <em>${issue.status}</em>
        </button>
      `
    )
    .join("");

  $$("#recentIssueList [data-issue-id]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveProject(button.dataset.projectId);
      setActiveIssue(button.dataset.issueId);
    });
  });
}

function renderComments(response) {
  const comments = response?.items ?? [];

  if (!comments.length) {
    elements.commentList.innerHTML = `<p class="empty-text">댓글이 없습니다.</p>`;
    return;
  }

  elements.commentList.innerHTML = comments
    .map(
      (comment) => `
        <article class="comment-card">
          <div>
            <strong>#${comment.id}</strong>
            <span>author ${comment.authorId}</span>
          </div>
          <p>${comment.content}</p>
          <small>${comment.createdAt ?? ""}</small>
        </article>
      `
    )
    .join("");
}

function rememberIssue(issue) {
  if (!issue?.id) return;
  state.recentIssues = [issue, ...state.recentIssues.filter((item) => item.id !== issue.id)].slice(0, 6);
  setActiveProject(issue.projectId);
  setActiveIssue(issue.id);
}

async function loadMe() {
  const data = await api("/api/v1/auth/me");
  state.currentUser = data;
  renderCurrentUser();
  return data;
}

async function loadUsers() {
  const data = await api("/api/v1/users");
  state.users = Array.isArray(data) ? data : [];
  renderUsers();
  return data;
}

async function loadProjects() {
  if (!requireLogin()) return;
  const data = await api(`/api/v1/projects?userId=${state.currentUser.userId}`);
  state.projects = Array.isArray(data) ? data : [];
  renderProjects();
  return data;
}

async function loadProjectDetail(projectId) {
  if (!projectId) return;
  return api(`/api/v1/projects/${projectId}`);
}

elements.signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = readForm(elements.signupForm);
  await api("/api/v1/users", { method: "POST", body, auth: false });
});

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = readForm(elements.loginForm);
  const data = await api("/api/v1/auth/login", { method: "POST", body, auth: false });
  saveToken(data.accessToken);
  await loadMe();
  await loadUsers();
  await loadProjects();
});

$("#clearTokenButton").addEventListener("click", () => {
  clearToken();
  renderResult("logout", { message: "브라우저에 저장된 토큰을 삭제했습니다." });
});

$("#loadMeButton").addEventListener("click", loadMe);
$("#loadUsersButton").addEventListener("click", loadUsers);
$("#loadProjectsButton").addEventListener("click", loadProjects);
$("#clearLogButton").addEventListener("click", () => {
  state.log = [];
  elements.requestLog.innerHTML = "";
});

elements.projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!requireLogin()) return;

  const form = readForm(elements.projectForm);
  const body = {
    createdById: state.currentUser.userId,
    name: form.name,
    description: form.description,
  };

  await api("/api/v1/projects", { method: "POST", body });
  await loadProjects();
});

elements.issueCreateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!requireLogin()) return;
  const projectId = requireProjectId();
  if (!projectId) return;

  const form = readForm(elements.issueCreateForm);
  const body = {
    reporterId: state.currentUser.userId,
    assigneeId: toNumberOrNull(form.assigneeId),
    title: form.title,
    content: form.content,
    issueType: form.issueType,
    status: form.status,
    priority: form.priority,
  };

  const issue = await api(`/api/v1/projects/${projectId}/issues`, {
    method: "POST",
    body,
  });
  rememberIssue(issue);
});

$("#getIssueButton").addEventListener("click", async () => {
  const projectId = requireProjectId();
  const issueId = requireIssueId();
  if (!projectId || !issueId) return;

  const issue = await api(`/api/v1/projects/${projectId}/issues/${issueId}`);
  rememberIssue(issue);
});

elements.issueUpdateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const projectId = requireProjectId();
  const issueId = requireIssueId();
  if (!projectId || !issueId) return;

  const form = readForm(elements.issueUpdateForm);
  const body = dropEmptyFields({
    assigneeId: toNumberOrNull(form.assigneeId),
    title: form.title,
    content: form.content,
    issueType: form.issueType,
    status: form.status,
    priority: form.priority,
  });

  const issue = await api(`/api/v1/projects/${projectId}/issues/${issueId}`, {
    method: "PATCH",
    body,
  });
  rememberIssue(issue);
});

$("#deleteIssueButton").addEventListener("click", async () => {
  const projectId = requireProjectId();
  const issueId = requireIssueId();
  if (!projectId || !issueId) return;

  await api(`/api/v1/projects/${projectId}/issues/${issueId}`, { method: "DELETE" });
  state.recentIssues = state.recentIssues.filter((issue) => String(issue.id) !== String(issueId));
  setActiveIssue("");
});

elements.commentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!requireLogin()) return;
  const projectId = requireProjectId();
  const issueId = requireIssueId();
  if (!projectId || !issueId) return;

  const form = readForm(elements.commentForm);
  await api(`/api/v1/projects/${projectId}/issues/${issueId}/comments`, {
    method: "POST",
    body: {
      authorId: state.currentUser.userId,
      content: form.content,
    },
  });
  const comments = await api(`/api/v1/projects/${projectId}/issues/${issueId}/comments?limit=20&offset=0`);
  renderComments(comments);
});

$("#loadCommentsButton").addEventListener("click", async () => {
  const projectId = requireProjectId();
  const issueId = requireIssueId();
  if (!projectId || !issueId) return;

  const comments = await api(`/api/v1/projects/${projectId}/issues/${issueId}/comments?limit=20&offset=0`);
  renderComments(comments);
});

elements.projectIdInput.addEventListener("change", (event) => setActiveProject(event.target.value));
elements.issueIdInput.addEventListener("change", (event) => setActiveIssue(event.target.value));
elements.tokenOutput.addEventListener("input", (event) => {
  state.token = event.target.value.trim();
  localStorage.setItem(TOKEN_KEY, state.token);
});

async function checkHealth() {
  try {
    await api("/api/health", { auth: false });
    setServerStatus("ok", "backend online");
  } catch {
    setServerStatus("error", "backend offline");
  }
}

async function bootstrap() {
  renderCurrentUser();
  renderProjects();
  renderUsers();
  renderRecentIssues();
  await checkHealth();

  if (state.token) {
    try {
      await loadMe();
      await loadUsers();
      await loadProjects();
    } catch {
      clearToken();
    }
  }
}

bootstrap();
