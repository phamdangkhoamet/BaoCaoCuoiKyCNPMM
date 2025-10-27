// src/pages/Report.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE } from "../lib/api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Report() {
  const q = useQuery();
  const navigate = useNavigate();

  const typeQuery = q.get("type") || "chapter"; // chapter | novel | other
  const novelId = q.get("novelId") || "";
  const chapterNo = q.get("no") || "";

  const [form, setForm] = useState({
    type: typeQuery,
    novelId,
    chapterNo,
    reason: "Nội dung không phù hợp",
    description: "",
    attachments: [], // {name,url} base64
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [novelTitle, setNovelTitle] = useState("");

  // load tiêu đề truyện nếu có novelId
  useEffect(() => {
    if (!novelId) return;
    const base = API_BASE || window.location.origin;
    fetch(new URL(`/api/novels/${novelId}`, base))
      .then((r) => (r.ok ? r.json() : null))
      .then((n) => setNovelTitle(n?.title || ""))
      .catch(() => {});
  }, [novelId]);

  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () =>
        setForm((s) => ({
          ...s,
          attachments: [...s.attachments, { name: file.name, url: reader.result }],
        }));
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };
  const removeFile = (name) =>
    setForm((s) => ({ ...s, attachments: s.attachments.filter((f) => f.name !== name) }));

  const validate = () => {
    if (!form.description.trim() || form.description.trim().length < 10) {
      setErr("Mô tả tối thiểu 10 ký tự.");
      return false;
    }
    setErr("");
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setErr("");
    try {
      const base = API_BASE || window.location.origin;
      const r = await fetch(new URL("/api/reports", base), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.message || "Gửi báo cáo thất bại");
      alert("Đã gửi báo cáo! Cảm ơn bạn đã đóng góp.");
      // nếu là chapter, quay lại trang đang đọc
      if (form.type === "chapter" && form.novelId && form.chapterNo) {
        navigate(`/novel/${form.novelId}/chuong/${form.chapterNo}`);
      } else if (form.type === "novel" && form.novelId) {
        navigate(`/novel/${form.novelId}`);
      } else {
        navigate("/home");
      }
    } catch (e2) {
      setErr(e2.message || "Gửi báo cáo thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Gửi báo cáo
          </h1>
          <Link to="/home" className="text-purple-600 hover:underline">
            ← Về trang chủ
          </Link>
        </div>

        {/* Target info */}
        <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50/40 px-4 py-3 text-sm text-gray-700">
          {form.type === "chapter" ? (
            <>
              Đối tượng: <b>Chương {form.chapterNo}</b> của truyện{" "}
              <b className="text-gray-900">“{novelTitle || "Đang tải…"}”</b>
            </>
          ) : form.type === "novel" ? (
            <>
              Đối tượng: Truyện{" "}
              <b className="text-gray-900">“{novelTitle || "Đang tải…"}”</b>
            </>
          ) : (
            <>Đối tượng: Khác</>
          )}
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="rounded-2xl border border-purple-200 bg-white shadow-sm p-6 space-y-4">
          {/* Type (ẩn nếu đi từ Reader) */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Loại báo cáo</label>
              <select
                className="w-full rounded-xl border border-purple-300 bg-white focus:border-purple-500 focus:ring-pink-500"
                value={form.type}
                onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
              >
                <option value="chapter">Chương truyện</option>
                <option value="novel">Nội dung truyện</option>
                <option value="other">Khác…</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Lý do</label>
              <select
                className="w-full rounded-xl border border-purple-300 bg-white focus:border-purple-500 focus:ring-pink-500"
                value={form.reason}
                onChange={(e) => setForm((s) => ({ ...s, reason: e.target.value }))}
              >
                <option>Nội dung không phù hợp</option>
                <option>Vi phạm bản quyền</option>
                <option>Spam / quảng cáo</option>
                <option>Khác…</option>
              </select>
            </div>
          </div>

          {/* Hidden/disabled refs */}
          {(form.type === "chapter" || form.type === "novel") && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Novel ID</label>
                <input
                  value={form.novelId || ""}
                  onChange={(e) => setForm((s) => ({ ...s, novelId: e.target.value }))}
                  className="w-full rounded-xl border border-purple-300 bg-gray-50 text-gray-600 focus:border-purple-500 focus:ring-pink-500"
                  placeholder="novelId"
                />
              </div>
              {form.type === "chapter" && (
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">Chương số</label>
                  <input
                    type="number"
                    min={1}
                    value={form.chapterNo || ""}
                    onChange={(e) => setForm((s) => ({ ...s, chapterNo: e.target.value }))}
                    className="w-full rounded-xl border border-purple-300 bg-gray-50 text-gray-600 focus:border-purple-500 focus:ring-pink-500"
                    placeholder="VD: 1"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Mô tả chi tiết</label>
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="Mô tả vấn đề, dẫn chứng… (tối thiểu 10 ký tự)"
              className="w-full rounded-xl border px-3 py-2 focus:border-purple-500 focus:ring-pink-500 border-purple-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Ảnh minh chứng (tùy chọn)</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center rounded-xl border border-purple-300 bg-white px-3 py-2 text-sm hover:bg-purple-50">
                <input type="file" accept="image/*" multiple className="hidden" onChange={onPickFiles} />
                Tải ảnh lên
              </label>
              <span className="text-xs text-gray-500">Có thể chọn nhiều ảnh.</span>
            </div>

            {form.attachments.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {form.attachments.map((f) => (
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

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2 rounded-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 ${
                saving ? "opacity-70" : "hover:opacity-90"
              }`}
            >
              {saving ? "Đang gửi..." : "Gửi báo cáo"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 rounded-xl border border-purple-200 hover:bg-purple-50"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}
