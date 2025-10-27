// src/lib/api.js

// Lấy base URL từ env (Vite: import.meta.env.VITE_API_BASE)
const ENV_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE) ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE) ||
  "";

export const API_BASE = ENV_BASE || "";

const TOKEN_KEY = "authToken";

// ===== Token helpers =====
function setToken(t) {
  if (!t) return;
  localStorage.setItem(TOKEN_KEY, t);
}
function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ===== Core request helpers =====
function buildUrl(path, params = {}) {
  const u = new URL(path, API_BASE || window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.searchParams.set(k, v);
  });
  return u.toString();
}

async function request(path, { method = "GET", body, auth = false, params } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const tk = getToken();
    if (tk) headers["Authorization"] = `Bearer ${tk}`;
  }

  const url = params ? buildUrl(path, params) : buildUrl(path);

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

const getJSON = (p, params) =>
  request(p + (params ? "?" + new URLSearchParams(params) : ""), { method: "GET", auth: false });

// ===== Public API =====
export const api = {
  // demo content endpoints available in your project
  getGenres() {
    return getJSON("/api/genres");
  },
  getPosters() {
    return getJSON("/api/posters");
  },
  getNovelsByGenre({ genre, limit, q }) {
    return getJSON("/api/novels", { genre, limit, q });
  },

  // ===== Auth group =====
  auth: {
    // Đăng nhập: { email, password } -> { token, user }
    async login({ email, password }) {
      const data = await request("/api/users/login", {
        method: "POST",
        body: { email, password },
      });
      // Chuẩn hoá theo backend: token có thể là data.token hoặc data.accessToken
      const token = data.token || data.accessToken;
      if (!token) throw new Error("Không nhận được token từ máy chủ.");
      setToken(token);

      // Lưu quick-view user (nếu backend trả về)
      if (data.user) {
        localStorage.setItem("sessionUser", JSON.stringify(data.user));
      }
      return data;
    },

    // Lấy hồ sơ người dùng hiện tại (dựa vào token)
    async me() {
      const data = await request("/api/users/me", { method: "GET", auth: true });
      return data;
    },

    // ===== THÊM MỚI: Đăng ký qua /api/auth/register =====
    async register({ name, email, password }) {
      // endpoint chuẩn mới
      const data = await request("/api/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
      // nếu backend trả token thì lưu luôn
      const token = data.token || data.accessToken;
      if (token) setToken(token);
      if (data.user) {
        localStorage.setItem("sessionUser", JSON.stringify(data.user));
      }
      return data;
    },

    // ===== THÊM MỚI (ALIAS): Đăng nhập qua /api/auth/login =====
    // Giữ nguyên login cũ (/api/users/login); hàm này là lựa chọn thêm
    async loginAuth({ email, password }) {
      const data = await request("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      const token = data.token || data.accessToken;
      if (!token) throw new Error("Không nhận được token từ máy chủ.");
      setToken(token);
      if (data.user) {
        localStorage.setItem("sessionUser", JSON.stringify(data.user));
      }
      return data;
    },

    // ===== THÊM MỚI (ALIAS): Lấy hồ sơ qua /api/auth/me =====
    async meAuth() {
      return request("/api/auth/me", { method: "GET", auth: true });
    },

    logout() {
      clearToken();
      localStorage.removeItem("sessionUser");
    },

    getToken,
  },

  // ===== THÊM MỚI: Users group cho trang chỉnh sửa hồ sơ =====
  users: {
    // Lấy hồ sơ theo id (có auth)
    getById(id) {
      return request(`/api/users/${id}`, { auth: true });
    },
    // Lấy hồ sơ chính mình (alias – nếu backend hỗ trợ)
    me() {
      return request("/api/users/me", { auth: true });
    },
    // Cập nhật theo id
    update(id, body) {
      return request(`/api/users/${id}`, {
        method: "PUT",
        body,
        auth: true,
      });
    },
    // Cập nhật chính mình (nếu backend có /me)
    updateMe(body) {
      return request("/api/users/me", {
        method: "PUT",
        body,
        auth: true,
      });
    },
  },
  // ===== Author Studio (thêm mới, cập nhật) =====
  studio: {
    async createNovel(payload) {
      // payload: { title, description, genre, cover }
      return request("/api/novels", { method: "POST", body: payload, auth: true });
    },
    async updateNovel(id, payload) {
      return request(`/api/novels/${id}`, { method: "PUT", body: payload, auth: true });
    },
    async createChapter(payload) {
      // payload: { novelId, no, title, content }
      return request("/api/chapters", { method: "POST", body: payload, auth: true });
    },
  },
  async isVip() {
    try {
      const me = await request("/api/users/me", { method: "GET", auth: true });
      // backend trả { isVip, vipUntil } (nếu bạn đã seed); fallback an toàn:
      const untilOk = me?.vipUntil && new Date(me.vipUntil) > new Date();
      return Boolean(me?.isVip || untilOk);
    } catch {
      return false;
    }
  },
};
