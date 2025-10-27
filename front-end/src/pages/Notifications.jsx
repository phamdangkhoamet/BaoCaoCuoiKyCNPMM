// src/pages/Notifications.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api, API_BASE } from "../lib/api";

// ===== Helpers giữ nguyên hành vi cũ =====
const pickArray = (res) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

const readSessionUser = () => {
  try {
    return JSON.parse(localStorage.getItem("sessionUser") || "null");
  } catch {
    return null;
  }
};

const getToken = () =>
  api.auth.getToken?.() || localStorage.getItem("authToken") || "";

const authedFetch = async (path, init = {}) => {
  const headers = { "Content-Type": "application/json", ...(init.headers || {}) };
  const tk = getToken();
  if (tk) headers.Authorization = `Bearer ${tk}`;
  const url = new URL(path, API_BASE || window.location.origin);
  const res = await fetch(url.toString(), { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
  return data;
};

// ===== UI components (y như cũ) =====
function Badge({ children, tone = "pink" }) {
  const toneCls =
    tone === "pink"
      ? "bg-pink-100 text-pink-700 border-pink-200"
      : "bg-purple-100 text-purple-700 border-purple-200";
  return (
    <span className={`inline-flex items-center px-2 h-6 text-xs rounded-full border ${toneCls}`}>
      {children}
    </span>
  );
}

export default function Notifications() {
  const navigate = useNavigate();

  // user hiện tại (giống cách cũ dùng localStorage, nhưng ưu tiên sessionUser của login)
  const sessionUser = readSessionUser();
  const currentUserId =
    sessionUser?._id || sessionUser?.id || Number(localStorage.getItem("currentUserId") || "1");

  // dữ liệu & trạng thái
  const [allNoti, setAllNoti] = useState([]); // [{id,title,content,createdAt,type,link,read?}]
  const [loading, setLoading] = useState(true);

  // Trạng thái đã đọc theo từng user (đồng bộ với Header như cũ)
  const readKey = `readNotiIds_user_${currentUserId}`;
  const [readIds, setReadIds] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(readKey) || "[]"));
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    localStorage.setItem(readKey, JSON.stringify(Array.from(readIds)));
  }, [readIds, readKey]);

  // Tab lọc: all | unread (giữ như cũ)
  const [tab, setTab] = useState("all");
  const list = useMemo(() => {
    if (tab === "unread") return allNoti.filter((n) => !readIds.has(n.id));
    return allNoti;
  }, [tab, allNoti, readIds]);

  const unreadCount = useMemo(
    () => allNoti.filter((n) => !readIds.has(n.id)).length,
    [allNoti, readIds]
  );

  // ====== Tải thông báo theo user, giữ giao diện cũ ======
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const normalize = (rows) =>
      rows.map((n) => ({
        id: n._id || n.id,
        title: n.title || "",
        content: n.content || "",
        type: n.type || "",
        link: n.link || "",
        // Giữ cách hiển thị thời gian giống cũ (chuỗi), nếu có ISO thì format nhẹ
        createdAt: n.createdAt
          ? new Date(n.createdAt).toLocaleString()
          : (n.time || ""),
        read: !!n.read,
      }));

    const load = async () => {
      // 1) /api/notifications (auth)
      try {
        const r1 = await authedFetch("/api/notifications", { method: "GET" });
        const a1 = normalize(pickArray(r1));
        if (a1.length) return a1;
      } catch {}

      // 2) /api/notifications?userId=
      try {
        const url = new URL("/api/notifications", API_BASE || window.location.origin);
        url.searchParams.set("userId", String(currentUserId));
        const r2 = await fetch(url.toString()).then((r) => r.json());
        const a2 = normalize(pickArray(r2));
        if (a2.length) return a2;
      } catch {}

      // 3) fallback localStorage (để dev nhanh, vẫn giữ giao diện)
      try {
        const raw = JSON.parse(localStorage.getItem(`mockNotifications:${currentUserId}`) || "[]");
        return normalize(raw);
      } catch {
        return [];
      }
    };

    (async () => {
      const rows = await load();
      if (!mounted) return;
      setAllNoti(rows);

      // nếu server có cờ read=true, đồng bộ vào readIds (giữ đúng giao diện)
      const serverReads = rows.filter((x) => x.read).map((x) => x.id);
      if (serverReads.length) {
        setReadIds((prev) => {
          const next = new Set(prev);
          serverReads.forEach((id) => next.add(id));
          return next;
        });
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [currentUserId]);

  // ===== Hành động giữ nguyên nút & text =====
  const markAsRead = async (id) => {
    setReadIds((prev) => new Set(prev).add(id)); // optimistic
    try {
      await authedFetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        body: JSON.stringify({ read: true }),
      }).catch(() =>
        authedFetch(`/api/notifications/${id}/mark-read`, { method: "POST" })
      );
    } catch {}
  };

  const toggleRead = async (id) => {
    const willRead = !readIds.has(id);
    setReadIds((prev) => {
      const next = new Set(prev);
      willRead ? next.add(id) : next.delete(id);
      return next;
    });
    try {
      await authedFetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        body: JSON.stringify({ read: willRead }),
      }).catch(() =>
        authedFetch(`/api/notifications/${id}/${willRead ? "mark-read" : "mark-unread"}`, {
          method: "POST",
        })
      );
    } catch {}
  };

  const markAllAsRead = async () => {
    setReadIds(new Set(allNoti.map((n) => n.id))); // optimistic
    try {
      await authedFetch(`/api/notifications/mark-all-read`, {
        method: "POST",
        body: JSON.stringify({ userId: currentUserId }),
      }).catch(() =>
        authedFetch(`/api/notifications`, {
          method: "PATCH",
          body: JSON.stringify({ userId: currentUserId, read: true, all: true }),
        })
      );
    } catch {}
  };

  const onOpenItem = (n) => {
    markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  // ====== UI giống hệt trang cũ ======
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        {/* Toolbar (giữ style sticky & gradient) */}
        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 mb-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50/80 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-purple-50 supports-[backdrop-filter]:to-pink-50/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Thông báo</h1>
                <div className="text-sm text-gray-600">
                  Tổng: <span className="font-semibold text-gray-900">{allNoti.length}</span> ·
                  {" "}Chưa đọc:{" "}
                  <span className="font-semibold text-pink-600">{unreadCount}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-xl border border-purple-200 bg-white p-1">
                  <button
                    onClick={() => setTab("all")}
                    className={
                      "px-3 py-1.5 text-sm rounded-lg transition " +
                      (tab === "all"
                        ? "text-white bg-gradient-to-r from-purple-500 to-pink-500"
                        : "text-gray-700 hover:bg-purple-50")
                    }
                  >
                    Tất cả
                  </button>
                </div>
                <div className="inline-flex rounded-xl border border-purple-200 bg-white p-1">
                  <button
                    onClick={() => setTab("unread")}
                    className={
                      "px-3 py-1.5 text-sm rounded-lg transition " +
                      (tab === "unread"
                        ? "text-white bg-gradient-to-r from-purple-500 to-pink-500"
                        : "text-gray-700 hover:bg-purple-50")
                    }
                  >
                    Chưa đọc
                  </button>
                </div>

                <button
                  onClick={markAllAsRead}
                  className="rounded-xl px-3 py-1.5 text-sm border border-purple-200 hover:bg-purple-50"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* List giữ layout cũ */}
        {loading ? (
          <ul className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="rounded-2xl border border-purple-200 p-4 bg-white animate-pulse">
                <div className="h-4 w-2/3 bg-purple-100/60 rounded" />
                <div className="h-3 w-1/2 bg-purple-100/60 rounded mt-2" />
                <div className="h-3 w-1/3 bg-purple-100/60 rounded mt-2" />
              </li>
            ))}
          </ul>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-purple-200 p-10 text-center text-gray-600">
            {tab === "unread" ? "Không còn thông báo chưa đọc." : "Chưa có thông báo nào."}
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((n) => {
              const unread = !readIds.has(n.id);
              return (
                <li
                  key={n.id}
                  className={
                    "rounded-2xl border p-4 transition " +
                    (unread
                      ? "border-pink-200 bg-pink-50/60 hover:bg-pink-50"
                      : "border-purple-200 bg-white hover:bg-purple-50/40")
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">{n.title}</h3>
                        {unread ? <Badge>Chưa đọc</Badge> : <Badge tone="purple">Đã đọc</Badge>}
                        {n.type ? <Badge tone="purple">{n.type}</Badge> : null}
                      </div>
                      <p className="text-gray-700 mt-1">{n.content}</p>
                      <div className="text-xs text-gray-500 mt-1">{n.createdAt}</div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => toggleRead(n.id)}
                          className="rounded-xl px-3 py-1.5 text-sm border border-purple-200 hover:bg-purple-50"
                        >
                          {unread ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc"}
                        </button>
                      </div>
                    </div>

                    {/* dot unread (giữ nguyên) */}
                    {unread && <span className="mt-1 inline-block w-2 h-2 rounded-full bg-pink-500 shrink-0" />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Footer actions (giống cũ) */}
        <div className="mt-8 flex items-center justify-between text-sm text-gray-600">
          <div>
            Hiển thị: <b>{list.length}</b> / {allNoti.length}
          </div>
          <Link to="/home" className="text-purple-600 hover:underline">
            ← Về trang chủ
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
