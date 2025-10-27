// src/pages/Reader.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE } from "../lib/api";
import { inLibrary, addToLibrary } from "../utils/library";
import { setProgress } from "../utils/progress";

/* ===== Hook click outside ===== */
function useClickOutside(ref, onClose) {
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ref, onClose]);
}

/* ===== Helpers ===== */
function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("sessionUser") || "null");
  } catch {
    return null;
  }
}
const isUserVIP = (u) => {
  if (!u) return false;
  return !!(u.isVIP || u.vip || u.isVip || u.role === "vip" || u.tier === "vip");
};

export default function Reader() {
  const { id: novelId, no } = useParams();
  const navigate = useNavigate();

  const chapterNo = Number(no || 1);

  const [novel, setNovel] = useState(null); // { id, title, author, cover }
  const [chapters, setChapters] = useState([]); // [{ no, title, locked? }]
  const [chapter, setChapter] = useState(null); // { no, title, content }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI prefs
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.9);
  const [width, setWidth] = useState("md"); // sm | md | lg
  const widthCls =
    width === "sm" ? "max-w-2xl" : width === "lg" ? "max-w-5xl" : "max-w-3xl";

  // menu 3 chấm
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  // lưu UI prefs
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("reader_ui_prefs") || "{}");
    if (saved.fontSize) setFontSize(saved.fontSize);
    if (saved.lineHeight) setLineHeight(saved.lineHeight);
    if (saved.width) setWidth(saved.width);
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "reader_ui_prefs",
      JSON.stringify({ fontSize, lineHeight, width })
    );
  }, [fontSize, lineHeight, width]);

  // Tải novel + danh sách chương + chương hiện tại
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");

    const base = API_BASE || window.location.origin;

    Promise.all([
      fetch(new URL(`/api/novels/${novelId}`, base)).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(new URL(`/api/chapters?novelId=${novelId}`, base)).then((r) =>
        r.ok ? r.json() : []
      ),
      fetch(
        new URL(
          `/api/chapters/one?novelId=${novelId}&no=${chapterNo}`,
          base
        )
      ).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([novelRes, listRes, oneRes]) => {
        if (!mounted) return;

        // novel
        if (novelRes && (novelRes._id || novelRes.id)) {
          setNovel({
            id: novelRes._id || novelRes.id,
            title: novelRes.title || "",
            author:
              novelRes.authorName ||
              (typeof novelRes.author === "string"
                ? novelRes.author
                : novelRes?.author?.name) ||
              "",
            cover: novelRes.cover || novelRes.image || "",
          });
        }

        // chapters
        const rawList = Array.isArray(listRes) ? listRes : [];
        const sorted = rawList.sort(
            (a, b) => Number(a.no) - Number(b.no)
          ) || [];
        setChapters(sorted);

        // chapter content
        if (oneRes && !oneRes?.message && (oneRes?.no || oneRes?.content)) {
          setChapter({
            no: oneRes.no,
            title: oneRes.title,
            content: oneRes.content || "",
          });
        } else {
          setChapter(null);
        }
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e.message || "Lỗi tải dữ liệu");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [novelId, chapterNo]);

  // Thông tin VIP & khoá chương mới nhất nếu không VIP
  const me = getSessionUser();
  const isVIP = isUserVIP(me);
  const total = chapters.length;
  const latestNo = useMemo(
    () => (total ? Math.max(...chapters.map((c) => Number(c.no))) : 0),
    [chapters, total]
  );
  const isLatest = total > 0 && Number(chapterNo) === Number(latestNo);
  const vipLocked = !isVIP && isLatest; // chỉ khóa chương mới nhất nếu không VIP

  // prev/next, progress
  const prev = useMemo(
    () => chapters.find((c) => Number(c.no) === chapterNo - 1),
    [chapters, chapterNo]
  );
  const next = useMemo(
    () => chapters.find((c) => Number(c.no) === chapterNo + 1),
    [chapters, chapterNo]
  );
  const progressPct = total ? Math.round((chapterNo / total) * 100) : 0;

  // Lưu tiến độ + tự thêm vào thư viện ở lần đọc đầu
  useEffect(() => {
    if (!novelId || !chapterNo) return;
    setProgress(novelId, chapterNo);

    if (!inLibrary(novelId)) {
      addToLibrary(novelId);
    }

    window.scrollTo({ top: 0, behavior: "instant" });
  }, [novelId, chapterNo]);

  // phím tắt Alt+←/→
  useEffect(() => {
    const onKey = (e) => {
      if (!e.altKey) return;
      if (e.key === "ArrowLeft" && prev)
        navigate(`/novel/${novelId}/chuong/${chapterNo - 1}`);
      if (e.key === "ArrowRight" && next && !( !isVIP && Number(next.no) === latestNo))
        navigate(`/novel/${novelId}/chuong/${chapterNo + 1}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [novelId, chapterNo, prev, next, navigate, isVIP, latestNo]);

  const onSelectChapter = (e) => {
    const targetNo = Number(e.target.value);
    // Chặn chọn chương mới nhất nếu không VIP
    if (!isVIP && targetNo === latestNo) return;
    navigate(`/novel/${novelId}/chuong/${targetNo}`);
  };

  if (!loading && (!novel || (!chapter && !total))) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy chương</h1>
          <Link
            to="/home"
            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 font-medium hover:font-bold transition"
          >
            ← Về trang chủ
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Top toolbar */}
      <div className={`mx-auto ${widthCls} w-full px-4 sm:px-6 pt-6`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition"
            >
              ← Quay lại
            </button>
            <span className="hidden sm:block">•</span>
            <span className="font-medium text-gray-700">
              {novel?.title || "Đang tải..."}
            </span>
            <span>•</span>
            <span>
              Chương {chapterNo}/{total || "?"}
            </span>
          </div>

          {/* Thanh chọn chương được làm nổi bật + VIP lock */}
          <div className="flex items-center gap-3">
            {/* Prev */}
            <button
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50"
              disabled={!prev}
              onClick={() =>
                navigate(`/novel/${novelId}/chuong/${chapterNo - 1}`)
              }
              title={!prev ? "Không có chương trước" : "Chuyển chương trước"}
            >
              ⟵ Trước
            </button>

            {/* Selector box highlight */}
            <div className="flex items-center gap-2 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 ring-1 ring-purple-100 shadow-sm">
              <span className="text-xs font-medium text-purple-700 tracking-wide uppercase">
                Chọn chương
              </span>
              <div className="h-4 w-px bg-purple-200/70 mx-1" />
              <select
                className="px-3 py-2 rounded-xl border border-purple-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400/60 focus:border-pink-300"
                value={chapterNo}
                onChange={onSelectChapter}
                title="Chọn chương cần đọc"
              >
                {chapters.map((c) => {
                  const isLatestOption = Number(c.no) === latestNo;
                  const locked = !isVIP && isLatestOption;
                  return (
                    <option
                      key={c._id || c.no}
                      value={c.no}
                      disabled={locked}
                    >
                      {`Chương ${c.no}: ${c.title || "Không tiêu đề"}${
                        locked ? "  🔒 VIP" : ""
                      }`}
                    </option>
                  );
                })}
              </select>
              <span className="ml-1 inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">
                🔒 VIP
              </span>
            </div>

            {/* Next */}
            <button
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow hover:shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!next || (!isVIP && Number(next?.no) === latestNo)}
              onClick={() =>
                navigate(`/novel/${novelId}/chuong/${chapterNo + 1}`)
              }
              title={
                !next
                  ? "Không có chương sau"
                  : !isVIP && Number(next?.no) === latestNo
                  ? "Chương sau là chương VIP"
                  : "Chuyển chương sau"
              }
            >
              {!next ? (
                "Sau ⟶"
              ) : !isVIP && Number(next.no) === latestNo ? (
                <span className="inline-flex items-center gap-1">
                  Sau <span>⟶</span> <span className="ml-1">🔒</span>
                </span>
              ) : (
                "Sau ⟶"
              )}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Hoàn thành {progressPct}%
          </div>
        </div>

        {/* VIP banner nếu chapter hiện tại bị khoá */}
        {vipLocked && (
          <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50/90 text-amber-900 px-4 py-3 shadow-sm">
            Chương bạn đang mở là <b>chương mới nhất</b> và chỉ dành cho{" "}
            <b>tài khoản VIP</b>.{" "}
            <Link
              to="/profile"
              className="ml-1 underline font-semibold text-amber-900"
            >
              Nâng cấp VIP ngay
            </Link>
          </div>
        )}

        {/* Error tổng quát (nếu có) */}
        {err && (
          <div className="mt-4 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3">
            {err}
          </div>
        )}
      </div>

      {/* Content */}
      <main className={`mx-auto ${widthCls} w-full px-4 sm:px-6 py-6`}>
        {/* Bộ điều khiển đọc */}
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-3 sm:p-4 flex flex-wrap items-center gap-3">
          <div className="text-sm font-medium text-gray-700">Chế độ đọc</div>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Cỡ chữ</span>
            <button
              className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
              onClick={() => setFontSize((v) => Math.max(14, v - 1))}
            >
              A-
            </button>
            <div className="w-8 text-center">{fontSize}</div>
            <button
              className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
              onClick={() => setFontSize((v) => Math.min(24, v + 1))}
            >
              A+
            </button>
          </div>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Giãn dòng</span>
            {[1.7, 1.9, 2.1].map((v) => (
              <button
                key={v}
                className={`px-3 py-1 rounded border ${
                  lineHeight === v
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setLineHeight(v)}
              >
                {v === 1.7 ? "Thoáng" : v === 1.9 ? "Vừa" : "Rộng"}
              </button>
            ))}
          </div>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Chiều rộng</span>
            {["sm", "md", "lg"].map((w) => (
              <button
                key={w}
                className={`px-3 py-1 rounded border ${
                  width === w
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => setWidth(w)}
              >
                {w === "sm" ? "Hẹp" : w === "md" ? "Vừa" : "Rộng"}
              </button>
            ))}
          </div>
        </div>

        <article className="relative rounded-3xl border border-gray-200 bg-white shadow-sm p-5 sm:p-7">
          {/* menu 3 chấm */}
          <div ref={menuRef} className="absolute right-4 top-4">
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-gray-700 hover:bg-purple-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="currentColor"
                >
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-20 w-56 rounded-xl border border-purple-100 bg-white shadow-xl overflow-hidden">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-0 w-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white" />
                  <Link
                    to={`/report?type=chapter&novelId=${novelId}&no=${chapterNo}`}
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-purple-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    🚩 Báo cáo chương
                  </Link>
                </div>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-extrabold mb-1 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {novel?.title || ""} — Ch. {chapterNo}
            {chapter?.title ? `: ${chapter.title}` : ""}
            {vipLocked ? " 🔒" : ""}
          </h1>
          <div className="text-sm text-gray-500 mb-4">
            Tác giả: <span className="font-medium">{novel?.author || ""}</span>
          </div>

          <div
            className="text-gray-800"
            style={{ fontSize: `${fontSize}px`, lineHeight }}
          >
            <div className="whitespace-pre-wrap leading-relaxed">
              {loading
                ? "Đang tải..."
                : vipLocked
                ? "Chương này chỉ dành cho tài khoản VIP. Hãy nâng cấp để đọc nội dung."
                : chapter?.content?.trim()
                ? chapter.content
                : "Chưa có dữ liệu chương."}
            </div>
          </div>
        </article>

        {/* bottom actions */}
        <div className="flex items-center justify-between gap-2 mt-6">
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              disabled={!prev}
              onClick={() =>
                navigate(`/novel/${novelId}/chuong/${chapterNo - 1}`)
              }
            >
              ⟵ Trước
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow hover:shadow-md transition disabled:opacity-50"
              disabled={!next || (!isVIP && Number(next?.no) === latestNo)}
              onClick={() =>
                navigate(`/novel/${novelId}/chuong/${chapterNo + 1}`)
              }
            >
              {!next
                ? "Sau ⟶"
                : !isVIP && Number(next.no) === latestNo
                ? "Sau ⟶ 🔒"
                : "Sau ⟶"}
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Mẹo: Nhấn{" "}
          <kbd className="px-1 border rounded">Alt</kbd> +{" "}
          <kbd className="px-1 border rounded">←</kbd> /{" "}
          <kbd className="px-1 border rounded">→</kbd> để chuyển chương nhanh.
        </p>
      </main>

      <Footer />
    </>
  );
}
