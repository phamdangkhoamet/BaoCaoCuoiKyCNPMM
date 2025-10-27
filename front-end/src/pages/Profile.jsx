import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { api, API_BASE } from "../lib/api";

const pickArray = (res) => (Array.isArray(res) ? res : (res?.items || res?.data || []));

function getSessionUser() {
  try { return JSON.parse(localStorage.getItem("sessionUser") || "null"); } catch { return null; }
}

export default function Profile() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);          // {_id, name, avatar, ...}
  const [loadingMe, setLoadingMe] = useState(true);
  const [books, setBooks] = useState([]);      // novels authored by me
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [err, setErr] = useState("");

  // Load current user
  useEffect(() => {
    let mounted = true;
    setLoadingMe(true);
    setErr("");

    const fromLS = getSessionUser();
    if (fromLS) {
      if (mounted) { setMe(fromLS); setLoadingMe(false); }
      return () => {};
    }

    const base = API_BASE || window.location.origin;
    fetch(new URL("/api/auth/me", base))
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => { if (mounted) setMe(u && (u._id || u.id) ? u : null); })
      .catch((e) => mounted && setErr(e.message || "Lỗi tải người dùng"))
      .finally(() => mounted && setLoadingMe(false));

    return () => { mounted = false; };
  }, []);

  // Load ONLY books authored by this user (no fallback to name, no library)
  useEffect(() => {
    if (!me) { setBooks([]); setLoadingBooks(false); return; }
    let mounted = true;
    setLoadingBooks(true);
    setErr("");

    const base = API_BASE || window.location.origin;
    const url = new URL("/api/novels", base);
    url.searchParams.set("authorId", me._id || me.id);  // strict by authorId

    fetch(url.toString())
      .then((r) => (r.ok ? r.json() : []))
      .then((res) => {
        if (!mounted) return;
        const arr = pickArray(res);
        const norm = arr.map((n) => ({
          id: n._id || n.id,
          title: n.title || "",
          cover: n.cover || n.image || "",
          author:
            n.authorName ||
            (typeof n.author === "string" ? n.author : n?.author?.name) ||
            "",
          description: n.description || "",
        }));
        setBooks(norm);
      })
      .catch((e) => { if (mounted) setErr(e.message || "Lỗi tải tác phẩm"); })
      .finally(() => mounted && setLoadingBooks(false));

    return () => { mounted = false; };
  }, [me]);

  const authorName = useMemo(() => me?.name || me?.fullname || me?.username || "Không tên", [me]);

  // ====== VIP status ======
  const isVip = useMemo(() => {
    if (!me) return false;
    if (me.isVip) return true;
    if (me.vipUntil) {
      try {
        const until = new Date(me.vipUntil);
        return until.getTime() > Date.now();
      } catch { return false; }
    }
    return false;
  }, [me]);

  const vipLabel = isVip ? "Tài khoản VIP" : "Tài khoản thường";
  const vipBadgeCls = isVip
    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
    : "bg-gray-100 text-gray-700 border-gray-200";
  const vipUntilText = isVip && me?.vipUntil
    ? (() => {
        try { return new Date(me.vipUntil).toLocaleString(); } catch { return ""; }
      })()
    : "";

  function handleLogout() {
    try { api?.auth?.logout?.(); } catch {}
    localStorage.removeItem("sessionUser");
    navigate("/login");
  }

  return (
    <>
      <Header />

      <div className="min-h-screen p-6 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white shadow-sm rounded-2xl p-6 flex items-center gap-6">
            <img
              src={me?.avatar || "https://api.dicebear.com/7.x/thumbs/svg?seed=dkstory"}
              alt="avatar"
              className="w-24 h-24 rounded-full ring-2 ring-purple-200 object-cover"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-800 truncate">
                  {loadingMe ? "Đang tải..." : authorName}
                </h2>

                {/* VIP badge */}
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${vipBadgeCls}`}>
                  {isVip ? "⭐ VIP" : "Thường"}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Tác giả • Thành viên từ {me?.createdAt?.slice(0, 4) || "2025"}
              </p>

              {/* VIP detail line (nếu VIP có hạn) */}
              {isVip && vipUntilText && (
                <p className="text-xs text-gray-600 mt-1">
                  Hiệu lực VIP đến: <span className="font-medium text-gray-900">{vipUntilText}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Nút VIP */}
              <Link
                to="/vip"
                className={`px-5 py-2 rounded-xl font-medium shadow transition whitespace-nowrap inline-block ${
                  isVip
                    ? "border border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                }`}
                title={isVip ? "Gia hạn VIP" : "Nâng cấp VIP"}
              >
                {isVip ? "Gia hạn VIP" : "Nâng cấp VIP"}
              </Link>

              {/* Giữ nguyên các nút cũ */}
              <NavLink
                to="/profile/edit"
                className="px-5 py-2 rounded-xl border border-purple-200 text-gray-800 hover:bg-purple-50 transition whitespace-nowrap inline-block text-center"
              >
                Chỉnh sửa hồ sơ
              </NavLink>
              <Link
                to="/studio"
                className="px-5 py-2 rounded-xl border border-purple-200 text-gray-800 hover:bg-purple-50 transition whitespace-nowrap inline-block text-center"
              >
                Sáng tác
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { label: "Truyện đã đăng", value: loadingBooks ? "…" : String(books.length) },
              { label: "Người theo dõi", value: me?.followersCount || "—" },
            ].map((item, index) => (
              <div key={index} className="bg-white shadow-sm rounded-2xl p-5 text-center">
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {item.value}
                </p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>

          {/* About */}
          <div className="bg-white shadow-sm rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Giới thiệu</h3>
            <p className="text-gray-600">
              {me?.bio || "Yêu thích sáng tác fantasy, huyền huyễn. Mục tiêu 1 chương/ngày."}
            </p>
          </div>

          {/* Tác phẩm của tác giả (ONLY authored books) */}
          <div className="bg-white shadow-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Tác phẩm của {authorName}
              </h3>
              <span className="text-sm text-gray-500">
                Tổng: <span className="font-medium">{books.length}</span> truyện
              </span>
            </div>

            {err && (
              <div className="mb-4 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3">
                {err}
              </div>
            )}

            {loadingBooks ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-200 p-3">
                    <div className="h-48 bg-purple-100/60 rounded" />
                    <div className="mt-2 h-4 bg-purple-100/60 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="text-gray-600">Chưa có tác phẩm nào được đăng.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {books.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
                  >
                    <Link to={`/novel/${b.id}`} className="block">
                      <img
                        src={b.cover}
                        alt={b.title}
                        className="w-full h-48 object-cover"
                      />
                    </Link>

                    <div className="p-4 flex-1 flex flex-col">
                      <Link
                        to={`/novel/${b.id}`}
                        className="font-semibold hover:underline line-clamp-2"
                        title={b.title}
                      >
                        {b.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{b.description}</p>

                      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                        <Link
                          to={`/novel/${b.id}`}
                          className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition"
                        >
                          Chi tiết
                        </Link>
                        <Link
                          to={`/novel/${b.id}/chuong/1`}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow transition"
                        >
                          Đọc ngay
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
