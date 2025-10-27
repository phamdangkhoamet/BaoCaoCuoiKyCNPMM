// src/components/admin/AdminHeader.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function AdminHeader({
  pendingCount = 0,
  approvedCount = 0,
  reportCount = 0,
  keywordCount = 0,
  onSearch,
}) {
  const navigate = useNavigate();
  const [openMobile, setOpenMobile] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setOpenMobile(false);
        setOpenProfile(false);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  function submitSearch(e) {
    e.preventDefault();
    onSearch?.(query);
    // navigate(`/admin/search?q=${encodeURIComponent(query)}`);
  }

  const NavItem = ({ to, children, end, badge }) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        "relative inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition " +
        (isActive
          ? "text-white bg-gradient-to-r from-purple-500 to-pink-500"
          : "text-gray-800 hover:bg-purple-50")
      }
      onClick={() => setOpenMobile(false)}
    >
      {children}
      {badge ? (
        <span className="ml-1 inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-pink-500/90 px-1 text-[11px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50/80 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-purple-50 supports-[backdrop-filter]:to-pink-50/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand + Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-purple-100 lg:hidden"
              onClick={() => setOpenMobile((v) => !v)}
              aria-label="Toggle Menu"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <Link to="/admin" className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow ring-2 ring-white/70" />
              <div className="text-lg font-bold text-gray-900">Admin Panel</div>
            </Link>
          </div>

          {/* Center: nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavItem to="/admin/users">Người dùng</NavItem>

            <div className="relative group">
              <NavItem to="/admin/moderation" badge={pendingCount || null}>
                Kiểm duyệt truyện
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </NavItem>
              {/* hover dropdown */}
              <div className="invisible absolute left-0 mt-1 min-w-[220px] rounded-xl border border-purple-100 bg-white p-2 shadow-lg opacity-0 transition group-hover:visible group-hover:opacity-100">
                <NavLink
                  to="/admin/moderation/pending"
                  className={({ isActive }) =>
                    "block rounded-lg px-3 py-2 text-sm transition " +
                    (isActive ? "bg-purple-50 text-gray-900" : "hover:bg-purple-50 text-gray-800")
                  }
                >
                  Chờ duyệt{" "}
                  {pendingCount ? (
                    <span className="ml-2 rounded-full bg-pink-500/90 px-2 text-xs font-semibold text-white">
                      {pendingCount}
                    </span>
                  ) : null}
                </NavLink>
                <NavLink
                  to="/admin/moderation/approved"
                  className={({ isActive }) =>
                    "block rounded-lg px-3 py-2 text-sm transition " +
                    (isActive ? "bg-purple-50 text-gray-900" : "hover:bg-purple-50 text-gray-800")
                  }
                >
                  Đã duyệt{" "}
                  {approvedCount ? (
                    <span className="ml-2 rounded-full bg-purple-500/90 px-2 text-xs font-semibold text-white">
                      {approvedCount}
                    </span>
                  ) : null}
                </NavLink>
              </div>
            </div>

            <NavItem to="/admin/reports" badge={reportCount || null}>Báo cáo vi phạm</NavItem>

            {/* ✅ Quy tắc hoạt động – trỏ đúng /admin/rules */}
            <NavItem to="/admin/rules">Quy tắc hoạt động</NavItem>

            {/* (Tuỳ chọn) Nếu vẫn cần trang từ khoá bình luận cũ: */}
            {/* <NavItem to="/admin/comment-rules" badge={keywordCount || null}>Quy tắc bình luận</NavItem> */}
          </nav>

          {/* Right: search + profile */}
          <div className="flex items-center gap-3">
            <form onSubmit={submitSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm người dùng, truyện..."
                  className="w-64 rounded-xl border-purple-200 bg-white/90 pl-10 pr-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-purple-500 focus:ring-pink-500"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-3.5-3.5" />
                  </svg>
                </div>
              </div>
            </form>

            <button
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-gray-700 ring-1 ring-purple-100 hover:bg-purple-50"
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
                <path d="M9 21a3 3 0 0 0 6 0" />
              </svg>
              {reportCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.1rem] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-semibold text-white">
                  {reportCount}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setOpenProfile((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-2 py-1.5 text-sm text-gray-800 ring-1 ring-purple-100 hover:bg-purple-50"
              >
                <img
                  src={`https://api.dicebear.com/7.x/thumbs/svg?seed=admin`}
                  alt="avatar"
                  className="h-6 w-6 rounded-lg ring-1 ring-purple-100"
                />
                <span className="hidden sm:inline">Admin</span>
                <svg className="size-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {openProfile && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-purple-100 bg-white p-2 shadow-lg">
                  <Link to="/" className="block rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-purple-50">
                    Xem trang người dùng
                  </Link>
                  <button
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-gray-800 hover:bg-purple-50"
                    onClick={() => alert("Đăng xuất")}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={submitSearch} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm người dùng, truyện..."
              className="w-full rounded-xl border-purple-200 bg-white/90 pl-10 pr-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-purple-500 focus:ring-pink-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-3.5-3.5" />
              </svg>
            </div>
          </div>
        </form>

        {/* Mobile nav */}
        {openMobile && (
          <div className="pb-4 lg:hidden">
            <div className="space-y-1 rounded-2xl border border-purple-100 bg-white p-2">
              <NavItem to="/admin/users">Người dùng</NavItem>
              <NavItem to="/admin/moderation" badge={pendingCount || null}>
                Kiểm duyệt truyện
              </NavItem>
              <div className="ml-2 flex gap-2">
                <Link
                  to="/admin/moderation/pending"
                  className="flex-1 rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-purple-50"
                  onClick={() => setOpenMobile(false)}
                >
                  Chờ duyệt
                </Link>
                <Link
                  to="/admin/moderation/approved"
                  className="flex-1 rounded-lg px-3 py-2 text-sm text-gray-800 hover:bg-purple-50"
                  onClick={() => setOpenMobile(false)}
                >
                  Đã duyệt
                </Link>
              </div>
              <NavItem to="/admin/reports" badge={reportCount || null}>
                Báo cáo vi phạm
              </NavItem>
              {/* ✅ Dùng NavItem (không dùng NavLink với biến không tồn tại) */}
              <NavItem to="/admin/rules">Quy tắc hoạt động</NavItem>
              {/* (Tuỳ chọn) trang từ khoá bình luận: */}
              {/* <NavItem to="/admin/comment-rules" badge={keywordCount || null}>Quy tắc bình luận</NavItem> */}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
