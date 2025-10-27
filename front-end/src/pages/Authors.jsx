// src/pages/Authors.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE } from "../lib/api";

// ================= Helpers =================
const pickArray = (res) => {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
};

// Lưu danh sách follow theo user (demo: 1 user) vào localStorage
const getFollowSet = () => {
  try {
    const raw = localStorage.getItem("followAuthors") || "[]";
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
};
const saveFollowSet = (set) =>
  localStorage.setItem("followAuthors", JSON.stringify(Array.from(set)));

// ================= Reusable UI bits =================
function Chip({ children, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1 rounded-full text-sm border transition " +
        (active
          ? "text-white border-transparent bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95"
          : "bg-white text-gray-700 border-purple-200 hover:border-pink-300")
      }
    >
      {children}
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <span className="font-medium text-gray-900">{value}</span>
      <span className="opacity-80">{label}</span>
    </div>
  );
}

function AuthorCard({ author, onOpen, isFollowing, onToggleFollow }) {
  return (
    <div className="group rounded-2xl border border-purple-200/70 bg-white p-4 shadow-sm hover:shadow-pink-100 transition-shadow">
      <div className="flex items-start gap-4">
        <button
          onClick={() => onOpen(author)}
          className="shrink-0 focus:outline-none"
          title="Xem nhanh"
        >
          <img
            src={author.avatar}
            alt={author.name}
            className="size-16 rounded-xl object-cover ring-1 ring-purple-100"
            loading="lazy"
          />
        </button>

        <div className="min-w-0 flex-1">
          <h3 className="text/base font-semibold text-gray-900 truncate">
            {author.name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {(author.genres || []).map((g) => (
              <span
                key={g}
                className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-gray-700 border border-purple-200"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-4">
          <Stat label="tác phẩm" value={author.booksCount ?? 0} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFollow(author.id)}
            className={
              "px-3 py-1.5 text-sm rounded-xl border transition " +
              (isFollowing
                ? "border-pink-300 bg-pink-50 text-pink-700 hover:bg-pink-100"
                : "border-purple-200 text-gray-800 hover:bg-purple-50")
            }
            title={isFollowing ? "Bỏ theo dõi" : "Theo dõi tác giả"}
          >
            {isFollowing ? "Đang theo dõi" : "Theo dõi"}
          </button>

          {/* Xem chi tiết -> đi tới trang profile tác giả */}
          <Link
            to={`/author/${author.id}`}
            className="px-3 py-1.5 text-sm rounded-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            title="Đi tới trang hồ sơ tác giả"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}

function Drawer({ open, onClose, author }) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={
          "absolute inset-0 bg-black/30 transition-opacity " +
          (open ? "opacity-100" : "opacity-0")
        }
      />

      {/* Panel */}
      <div
        className={
          "absolute right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl transition-transform duration-300 " +
          (open ? "translate-x-0" : "translate-x-full")
        }
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={author?.avatar}
                alt={author?.name}
                className="size-14 rounded-xl ring-1 ring-purple-100"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {author?.name}
                </h2>
                <p className="text-sm text-gray-600">{author?.country}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm border border-purple-200 hover:bg-purple-50"
            >
              Đóng
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <section>
              <h3 className="text-sm font-medium text-gray-800 mb-2 uppercase tracking-wide">
                Giới thiệu
              </h3>
              <p className="text-gray-700 leading-relaxed">{author?.bio}</p>
            </section>

            <section>
              <h3 className="text-sm font-medium text-gray-800 mb-2 uppercase tracking-wide">
                Thể loại chính
              </h3>
              <div className="flex flex-wrap gap-2">
                {(author?.genres || []).map((g) => (
                  <span
                    key={g}
                    className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-gray-700 border border-purple-200"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-medium text-gray-800 mb-3 uppercase tracking-wide">
                Tác phẩm tiêu biểu
              </h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {(author?.topBooks || []).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              {/* Link tới trang profile tác giả */}
              <Link
                to={`/author/${author?.id}`}
                className="inline-block mt-4 px-3 py-2 rounded-xl text-sm text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                onClick={onClose}
              >
                Tới trang tác giả
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= Page =================
export default function Authors() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("Tất cả");
  const [activeGenres, setActiveGenres] = useState([]);
  const [sortBy, setSortBy] = useState("name-asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // dữ liệu từ API
  const [allAuthors, setAllAuthors] = useState([]); // danh sách tác giả chuẩn hoá
  const [allGenres, setAllGenres] = useState([]);   // danh sách thể loại (từ API /genres nếu có)

  // follow state từ localStorage
  const [followSet, setFollowSet] = useState(() => getFollowSet());
  const toggleFollow = (authorId) => {
    setFollowSet((prev) => {
      const next = new Set(prev);
      if (next.has(String(authorId))) next.delete(String(authorId));
      else next.add(String(authorId));
      saveFollowSet(next);
      return next;
    });
  };

  // load authors + genres
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    const fetchAuthors = async () => {
      const url = new URL("/api/authors", API_BASE || window.location.origin);
      const res = await fetch(url.toString()).then((r) => r.json());
      const rows = pickArray(res);

      // chuẩn hoá dữ liệu author
      const norm = rows.map((a) => ({
        id: a._id || a.id,
        name: a.name || "",
        avatar: a.avatar || "",
        country: a.country || "Việt Nam",
        genres: Array.isArray(a.genres) ? a.genres : [],
        booksCount: Number(a.booksCount) || 0,
        rating: Number(a.rating) || 0,
        followers: Number(a.followers) || 0,
        bio: a.bio || "",
        topBooks: Array.isArray(a.topBooks) ? a.topBooks : [],
      }));
      return norm;
    };

    const fetchGenres = async () => {
      try {
        const url = new URL("/api/genres", API_BASE || window.location.origin);
        const res = await fetch(url.toString()).then((r) => r.json());
        const arr = pickArray(res);
        return arr.map((g) => (typeof g === "string" ? g : g?.name || g?.title)).filter(Boolean);
      } catch {
        return [];
      }
    };

    (async () => {
      try {
        const [authors, genres] = await Promise.all([fetchAuthors(), fetchGenres()]);
        if (!mounted) return;

        setAllAuthors(authors);

        // nếu API genres rỗng, tự suy ra từ tác giả
        if (genres.length) setAllGenres(genres);
        else {
          const fromAuthors = Array.from(
            new Set(authors.flatMap((a) => a.genres || []))
          ).sort((a, b) => a.localeCompare(b, "vi"));
          setAllGenres(fromAuthors);
        }
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Lỗi tải dữ liệu");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // danh sách quốc gia (suy từ authors)
  const countries = useMemo(() => {
    const s = Array.from(new Set(allAuthors.map((a) => a.country).filter(Boolean)));
    return s.sort((a, b) => a.localeCompare(b, "vi"));
  }, [allAuthors]);

  // bộ lọc + sắp xếp
  const filtered = useMemo(() => {
    let list = [...allAuthors];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.country || "").toLowerCase().includes(q) ||
          (a.genres || []).some((g) => (g || "").toLowerCase().includes(q))
      );
    }

    if (country !== "Tất cả") {
      list = list.filter((a) => a.country === country);
    }

    if (activeGenres.length) {
      list = list.filter((a) => activeGenres.every((g) => (a.genres || []).includes(g)));
    }

    switch (sortBy) {
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        break;
      case "name-desc":
        list.sort((a, b) => b.name.localeCompare(a.name, "vi"));
        break;
      case "books-desc":
        list.sort((a, b) => (b.booksCount || 0) - (a.booksCount || 0));
        break;
      case "rating-desc":
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return list;
  }, [query, country, activeGenres, sortBy, allAuthors]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  function toggleGenre(g) {
    setPage(1);
    setActiveGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onSearch={(kw) => setQuery(kw || "")} />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-16">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 mb-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50/80 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-purple-50 supports-[backdrop-filter]:to-pink-50/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Danh sách Tác giả
              </h1>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

                <div>
                  <select
                    className="rounded-xl border-purple-200 focus:border-purple-500 focus:ring-pink-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name-asc">A → Z</option>
                    <option value="name-desc">Z → A</option>
                    <option value="books-desc">Nhiều tác phẩm nhất</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip active={!activeGenres.length} onClick={() => setActiveGenres([])}>
                Tất cả thể loại
              </Chip>
              {allGenres.map((g) => (
                <Chip key={g} active={activeGenres.includes(g)} onClick={() => toggleGenre(g)}>
                  {g}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Tìm thấy{" "}
          <span className="font-semibold text-gray-900">{filtered.length}</span>{" "}
          tác giả · Trang {page}/{totalPages}
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3">
            {err}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: pageSize }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-purple-200/70 p-4 animate-pulse bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-xl bg-purple-100/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-purple-100/60 rounded w-2/3" />
                    <div className="h-3 bg-purple-100/60 rounded w-1/3" />
                    <div className="h-6 bg-purple-100/60 rounded w-1/2 mt-2" />
                  </div>
                </div>
                <div className="mt-4 h-8 bg-purple-100/60 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageData.map((a) => (
              <AuthorCard
                key={a.id}
                author={a}
                onOpen={setSelected}
                isFollowing={followSet.has(String(a.id))}
                onToggleFollow={toggleFollow}
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Hiển thị
            <select
              className="ml-2 rounded-lg border-purple-200 focus:border-purple-500 focus:ring-pink-500"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[6, 12, 18, 24].map((n) => (
                <option key={n} value={n}>
                  {n}/trang
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trước
            </button>
            <span className="text-sm text-gray-700">
              {page}/{totalPages}
            </span>
            <button
              className="px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sau
            </button>
          </div>
        </div>

        <Drawer open={!!selected} onClose={() => setSelected(null)} author={selected} />
      </main>

      <Footer />
    </div>
  );
}
