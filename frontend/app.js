const TOKEN_KEY = "scsaIssueTrackerAccessToken";

const signupForm = document.querySelector("#signupForm");
const loginForm = document.querySelector("#loginForm");
const tokenOutput = document.querySelector("#tokenOutput");
const resultOutput = document.querySelector("#resultOutput");
const lastRequestLabel = document.querySelector("#lastRequestLabel");
const serverStatusDot = document.querySelector("#serverStatusDot");
const serverStatusText = document.querySelector("#serverStatusText");

const loadMeButton = document.querySelector("#loadMeButton");
const loadUsersButton = document.querySelector("#loadUsersButton");
const clearTokenButton = document.querySelector("#clearTokenButton");

tokenOutput.value = localStorage.getItem(TOKEN_KEY) ?? "";

function readForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function renderResult(label, data) {
  lastRequestLabel.textContent = label;
  resultOutput.textContent = JSON.stringify(data, null, 2);
}

function setServerStatus(state, text) {
  serverStatusDot.classList.remove("ok", "error");
  serverStatusDot.classList.add(state);
  serverStatusText.textContent = text;
}

function getToken() {
  return tokenOutput.value.trim();
}

function saveToken(accessToken) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  tokenOutput.value = accessToken;
}

async function request(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw {
      status: response.status,
      data,
    };
  }

  return data;
}

async function requestWithAuth(path, options = {}) {
  const token = getToken();

  return request(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const data = await request("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(readForm(signupForm)),
    });

    renderResult("POST /api/v1/users", data);
  } catch (error) {
    renderResult("POST /api/v1/users", error);
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const data = await request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(readForm(loginForm)),
    });

    saveToken(data.accessToken);
    renderResult("POST /api/v1/auth/login", data);
  } catch (error) {
    renderResult("POST /api/v1/auth/login", error);
  }
});

loadMeButton.addEventListener("click", async () => {
  try {
    const data = await requestWithAuth("/api/v1/auth/me");
    renderResult("GET /api/v1/auth/me", data);
  } catch (error) {
    renderResult("GET /api/v1/auth/me", error);
  }
});

loadUsersButton.addEventListener("click", async () => {
  try {
    const data = await requestWithAuth("/api/v1/users");
    renderResult("GET /api/v1/users", data);
  } catch (error) {
    renderResult("GET /api/v1/users", error);
  }
});

clearTokenButton.addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY);
  tokenOutput.value = "";
  renderResult("clear token", { message: "토큰을 삭제했습니다." });
});

async function checkHealth() {
  try {
    await request("/api/health");
    setServerStatus("ok", "backend online");
  } catch {
    setServerStatus("error", "backend offline");
  }
}

checkHealth();
