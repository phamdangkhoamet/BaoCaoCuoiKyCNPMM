// src/pages/AuthorProfile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { authors, novels } from "../data/mockData";

// ========= LocalStorage follow helpers =========
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

// ========= LocalStorage report helpers (mock gửi admin) =========
const loadUserReports = () => {
  try {
    return JSON.parse(localStorage.getItem("userReports") || "[]");
  } catch {
    return [];
  }
};
const saveUserReports = (arr) =>
  localStorage.setItem("userReports", JSON.stringify(arr));

// ========= Small UI bits =========
function Pill({ children }) {
  return (
    <span className="text-xs px-2 py-1 rounded-full bg-white border border-purple-200 text-gray-800">
      {children}
    </span>
  );
}

export default function AuthorProfile() {
  const { id } = useParams();              // /author/:id (id dạng string)
  const navigate = useNavigate();

  // Tìm tác giả
  const author = useMemo(
    () => authors.find((a) => String(a.id) === String(id)),
    [id]
  );

  // Gom tất cả truyện thuộc tác giả từ object novels (nhiều thể loại)
  const authorBooks = useMemo(() => {
    if (!author) return [];
    const results = [];
    for (const genre in novels) {
      for (const b of novels[genre]) {
        if ((b.author || "").toLowerCase() === author.name.toLowerCase()) {
          results.push({ ...b, genre });
        }
      }
    }
    return results;
  }, [author]);

  // Follow state
  const [followSet, setFollowSet] = useState(() => getFollowSet());
  const isFollowing = followSet.has(String(id));
  const toggleFollow = () => {
    setFollowSet((prev) => {
      const next = new Set(prev);
      if (next.has(String(id))) next.delete(String(id));
      else next.add(String(id));
      saveFollowSet(next);
      return next;
    });
  };

  // Loading skeleton rất nhẹ
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, [id]);

  // Gợi ý tác giả liên quan (cùng thể loại, loại trừ bản thân)
  const relatedAuthors = useMemo(() => {
    if (!author) return [];
    const setGenres = new Set(author.genres || []);
    return authors
      .filter(
        (a) =>
          a.id !== author.id && a.genres?.some((g) => setGenres.has(g))
      )
      .slice(0, 6);
  }, [author]);

  // ---------- Report modal state ----------
  const [openReport, setOpenReport] = useState(false);
  const [reportType, setReportType] = useState("Hành vi không phù hợp");
  const [reportText, setReportText] = useState("");
  const [reportFiles, setReportFiles] = useState([]); // {name, url, file}
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});

  const resetReportForm = () => {
    setReportType("Hành vi không phù hợp");
    setReportText("");
    setReportFiles([]);
    setErrors({});
  };

  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    // Tạo preview
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setReportFiles((prev) => [
          ...prev,
          { name: file.name, url: reader.result, file },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = ""; // reset để lần sau có thể chọn lại cùng file
  };

  const removeFile = (name) => {
    setReportFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const validateReport = () => {
    const err = {};
    if (!reportText.trim() || reportText.trim().length < 10) {
      err.reportText = "Vui lòng mô tả tối thiểu 10 ký tự.";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submitReport = async () => {
    if (!author) return;
    if (!validateReport()) return;

    setSending(true);
    try {
      const idNum = Date.now();
      const payload = {
        id: `UR-${idNum}`, // user report id (local)
        type: "Tác giả",
        target: `Tác giả ${author.name} (ID: ${author.id})`,
        reason: `${reportType} – ${reportText.trim()}`,
        attachments: reportFiles.map((f) => ({ name: f.name, url: f.url })),
        createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        status: "pending",
      };
      const list = loadUserReports();
      list.unshift(payload);
      saveUserReports(list);
      // Có thể show toast/alert
      alert("Đã gửi báo cáo tới quản trị viên (demo). Cảm ơn bạn!");
      setOpenReport(false);
      resetReportForm();
    } catch (e) {
      console.error(e);
      alert("Gửi báo cáo thất bại. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  // Không tìm thấy
  if (!author) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Không tìm thấy tác giả
          </h1>
          <p className="text-gray-600 mt-2">
            Tác giả với mã <span className="font-semibold">#{id}</span> không tồn tại.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 rounded-xl px-4 py-2 border border-purple-300 hover:bg-purple-50"
          >
            Quay lại
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-50 to-pink-50" />
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              src={author.avatar}
              alt={author.name}
              className="h-24 w-24 rounded-2xl ring-2 ring-white shadow"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900">
                {author.name}
              </h1>
              <p className="text-gray-700 mt-1">{author.country}</p>

              {/* ✅ Hiển thị số người theo dõi (từ mockData) */}
              <div className="mt-1 text-sm text-gray-700">
                {(author.followers ?? 0).toLocaleString()} người theo dõi
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {author.genres.map((g) => (
                  <Pill key={g}>{g}</Pill>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleFollow}
                className={
                  "rounded-xl px-4 py-2 transition " +
                  (isFollowing
                    ? "bg-pink-50 border border-pink-300 text-pink-700 hover:bg-pink-100"
                    : "bg-white border border-purple-300 text-gray-800 hover:bg-purple-50")
                }
              >
                {isFollowing ? "Đang theo dõi" : "Theo dõi tác giả"}
              </button>

              {/* Nút báo cáo tác giả */}
              <button
                onClick={() => setOpenReport(true)}
                className="rounded-xl px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              >
                Báo cáo tác giả
              </button>

            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 mx-auto w-full max-w-7xl px-6 pb-16">
        {/* Thông tin chính */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <section className="lg:col-span-2 rounded-2xl border border-purple-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Giới thiệu
            </h2>
            <p className="text-gray-700 leading-relaxed">{author.bio}</p>

            {author.topBooks?.length ? (
              <>
                <h3 className="mt-6 text-sm font-semibold text-gray-800 uppercase tracking-wide">
                  Tác phẩm tiêu biểu
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
                  {author.topBooks.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <aside className="rounded-2xl border border-purple-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Thống kê nhanh
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tác phẩm</span>
                <span className="font-semibold text-gray-900">
                  {author.booksCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Điểm đánh giá</span>
                <span className="font-semibold text-gray-900">
                  {author.rating}
                </span>
              </div>

              {/* ✅ Thêm hàng hiển thị người theo dõi */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Người theo dõi</span>
                <span className="font-semibold text-gray-900">
                  {(author.followers ?? 0).toLocaleString()}
                </span>
              </div>

              <div className="pt-3 border-t border-purple-100">
                <div className="text-sm text-gray-600">
                  Truyện có trên hệ thống:
                </div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {authorBooks.length}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Danh sách truyện của tác giả */}
        <section className="mt-8">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Tác phẩm của {author.name}
            </h2>
            <div className="text-sm text-gray-600">
              Tổng: <span className="font-semibold text-gray-900">{authorBooks.length}</span>
            </div>
          </header>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-purple-200 p-3 animate-pulse">
                  <div className="h-44 rounded-xl bg-purple-100/60" />
                  <div className="mt-3 h-4 bg-purple-100/60 rounded w-3/4" />
                  <div className="mt-2 h-3 bg-purple-100/60 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : authorBooks.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {authorBooks.map((b) => (
                <Link
                  key={b.id}
                  to={`/novel/${b.id}`}
                  className="group rounded-2xl border border-purple-200/70 bg-white p-3 hover:shadow-pink-100 transition block"
                  title={b.title}
                >
                  <img
                    src={b.cover}
                    alt={b.title}
                    className="h-44 w-full object-cover rounded-lg"
                    loading="lazy"
                  />
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {b.title}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {b.genre}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-purple-200 p-8 text-center text-gray-600">
              Chưa có truyện nào của tác giả trong hệ thống.
            </div>
          )}
        </section>

        {/* Tác giả liên quan */}
        {relatedAuthors.length ? (
          <section className="mt-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Tác giả liên quan
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {relatedAuthors.map((a) => (
                <Link
                  key={a.id}
                  to={`/author/${a.id}`}
                  className="rounded-2xl border border-purple-200/70 bg-white p-3 hover:shadow-pink-100 transition block text-center"
                >
                  <img
                    src={a.avatar}
                    alt={a.name}
                    className="h-20 w-20 mx-auto rounded-xl ring-1 ring-purple-100 object-cover"
                  />
                  <div className="mt-2 text-sm font-medium text-gray-900 line-clamp-1">
                    {a.name}
                  </div>
                  <div className="text-[11px] text-gray-600 line-clamp-1">{a.country}</div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <Footer />

      {/* ================== REPORT MODAL ================== */}
      <div className={`fixed inset-0 z-50 ${openReport ? "" : "pointer-events-none"}`}>
        {/* backdrop */}
        <div
          onClick={() => setOpenReport(false)}
          className={
            "absolute inset-0 bg-black/40 transition-opacity " +
            (openReport ? "opacity-100" : "opacity-0")
          }
        />
        {/* panel */}
        <div
          className={
            "absolute left-1/2 top-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 transform rounded-2xl border border-purple-200 bg-white shadow-2xl transition " +
            (openReport ? "scale-100 opacity-100" : "scale-95 opacity-0")
          }
          role="dialog"
          aria-modal="true"
        >
          <div className="p-5 border-b border-purple-100">
            <h3 className="text-xl font-semibold text-gray-900">Báo cáo tác giả</h3>
            <p className="text-sm text-gray-600">
              Đối tượng: <span className="font-medium text-gray-900">{author.name}</span>
            </p>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Loại vi phạm
              </label>
              <select
                className="w-full rounded-xl border border-purple-300 bg-white focus:border-purple-500 focus:ring-pink-500"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option>Hành vi không phù hợp</option>
                <option>Spam / Quảng cáo</option>
                <option>Ngôn ngữ thù ghét / công kích</option>
                <option>Nội dung vi phạm bản quyền</option>
                <option>Khác…</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Mô tả chi tiết (bắt buộc)
              </label>
              <textarea
                rows={5}
                placeholder="Nêu rõ nội dung vi phạm, thời điểm, liên kết hoặc bằng chứng liên quan…"
                className={
                  "w-full rounded-xl border px-3 py-2 focus:border-purple-500 focus:ring-pink-500 " +
                  (errors.reportText ? "border-pink-400" : "border-purple-300")
                }
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
              />
              {errors.reportText && (
                <div className="text-sm text-pink-600 mt-1">{errors.reportText}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Ảnh minh chứng (tùy chọn)
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm hover:bg-purple-50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onPickFiles}
                  />
                  Tải ảnh lên
                </label>
                <span className="text-xs text-gray-500">
                  Có thể chọn nhiều ảnh. Dung lượng lớn có thể tải lâu hơn.
                </span>
              </div>

              {reportFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {reportFiles.map((f) => (
                    <div key={f.name} className="relative group">
                      <img
                        src={f.url}
                        alt={f.name}
                        className="h-24 w-full object-cover rounded-lg border border-purple-100"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(f.name)}
                        className="absolute right-1 top-1 hidden group-hover:inline-flex rounded-md bg-white/90 px-2 py-1 text-xs border border-purple-200 hover:bg-white"
                        title="Xóa ảnh"
                      >
                        ×
                      </button>
                      <div className="mt-1 text-[11px] text-gray-600 line-clamp-1" title={f.name}>
                        {f.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-5 border-t border-purple-100">
            <button
              onClick={() => {
                setOpenReport(false);
                resetReportForm();
              }}
              className="rounded-xl px-4 py-2 border border-purple-300 hover:bg-purple-50"
              disabled={sending}
            >
              Hủy bỏ
            </button>
            <button
              onClick={submitReport}
              disabled={sending}
              className={
                "rounded-xl px-4 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 " +
                (sending ? "opacity-70 cursor-not-allowed" : "hover:opacity-90")
              }
            >
              {sending ? "Đang gửi..." : "Gửi báo cáo"}
            </button>
          </div>
        </div>
      </div>
      {/* =============== END REPORT MODAL =============== */}
    </div>
  );
}
