// src/pages/admin/Reports.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  adminStats,
  commentKeywords,
  adminReports, // dữ liệu mock
} from "../../data/mockData";

// chặn scroll khi có modal
function useLockBody(open) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);
}

export default function Reports() {
  // Filters
  const [q, setQ] = useState("");
  const [type, setType] = useState("Tất cả");

  // trạng thái xử lý demo (không sửa mock)
  const [resolvedIds, setResolvedIds] = useState({});

  // Modal xử lý
  const [openModalFor, setOpenModalFor] = useState(null); // report object
  const [selectedAction, setSelectedAction] = useState(null); // 'delete' | 'ban7d' | 'lock'

  // Modal xem chi tiết
  const [openDetailFor, setOpenDetailFor] = useState(null); // report object

  // khóa body nếu có bất kỳ modal mở
  useLockBody(!!openModalFor || !!openDetailFor);

  // Loại báo cáo
  const reportTypes = useMemo(() => {
    const s = new Set();
    (adminReports || []).forEach((r) => s.add(r.type));
    return ["Tất cả", ...Array.from(s)];
  }, []);

  // Lọc + tìm kiếm
  const list = useMemo(() => {
    let data = adminReports || [];
    if (type !== "Tất cả") data = data.filter((r) => r.type === type);
    if (q.trim()) {
      const kw = q.trim().toLowerCase();
      data = data.filter(
        (r) =>
          (r.type || "").toLowerCase().includes(kw) ||
          (r.target || "").toLowerCase().includes(kw) ||
          (r.id + "").includes(kw)
      );
    }
    return data;
  }, [q, type]);

  // Handlers
  const handleViewDetail = (r) => setOpenDetailFor(r);
  const closeDetailModal = () => setOpenDetailFor(null);

  const openProcessModal = (r) => {
    setOpenModalFor(r);
    setSelectedAction(null);
  };
  const closeProcessModal = () => {
    setOpenModalFor(null);
    setSelectedAction(null);
  };

  const confirmProcess = () => {
    if (!selectedAction || !openModalFor) {
      return alert("Vui lòng chọn 1 mức xử lý.");
    }
    const r = openModalFor;
    if (selectedAction === "delete") {
      alert(`🧹 Xóa nội dung vi phạm liên quan báo cáo #${r.id} (demo)`);
    } else if (selectedAction === "ban7d") {
      alert(`⛔ Cấm tác giả tương tác 1 tuần cho báo cáo #${r.id} (demo)`);
    } else if (selectedAction === "lock") {
      alert(`🔒 Khóa tài khoản liên quan báo cáo #${r.id} (demo)`);
    }
    setResolvedIds((prev) => ({ ...prev, [r.id]: true }));
    closeProcessModal();
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeader
        pendingCount={adminStats.pending}
        approvedCount={5}
        reportCount={adminStats.reports}
        keywordCount={commentKeywords.length}
      />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-4xl font-bold">Báo cáo vi phạm</h2>
            <p className="text-lg text-gray-600 mt-1">
              Xem chi tiết và xử lý các báo cáo từ người dùng.
            </p>
          </div>
          <Link
            to="/admin/process-guide"
            className="rounded-xl px-4 py-2 text-sm sm:text-base border border-purple-300 hover:bg-purple-50"
          >
            Quy trình xử lý
          </Link>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-purple-200 bg-white p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo loại, đối tượng hoặc ID..."
              className="rounded-xl border border-purple-300 px-4 py-3 focus:border-purple-500 focus:ring-pink-500"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-purple-300 px-4 py-3 bg-white focus:border-purple-500 focus:ring-pink-500"
            >
              {reportTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-purple-200 shadow-sm">
          <table className="min-w-full text-lg">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr className="text-gray-700">
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Loại</th>
                <th className="py-3 px-4 text-left">Đối tượng</th>
                <th className="py-3 px-4 text-left">Thời gian</th>
                <th className="py-3 px-4 text-left">Trạng thái</th>
                <th className="py-3 px-4 text-center w-64">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const isResolved = !!resolvedIds[r.id];
                return (
                  <tr
                    key={r.id}
                    className="border-t border-purple-100 hover:bg-purple-50/40 transition"
                  >
                    <td className="py-3 px-4 text-gray-700">#{r.id}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{r.type}</td>
                    <td className="py-3 px-4 text-gray-700">{r.target}</td>
                    <td className="py-3 px-4 text-gray-600">{r.createdAt}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                          isResolved
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-pink-50 text-pink-700 border border-pink-200"
                        }`}
                      >
                        {isResolved ? "Đã xử lý" : "Chưa xử lý"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(r)}
                          className="px-4 py-2 rounded-lg border border-purple-300 hover:bg-purple-50"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => openProcessModal(r)}
                          className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                        >
                          Xử lý
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-500 text-lg italic">
                    Không có báo cáo phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Gợi ý quy trình */}
        <div className="mt-8 bg-purple-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Gợi ý quy trình xử lý</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>Xem chi tiết báo cáo và bằng chứng.</li>
            <li>Chọn mức xử lý phù hợp (xóa, cấm 1 tuần, khóa tài khoản).</li>
            <li>
              Gắn nhãn <b>đã xử lý</b> và ghi chú nội bộ (nếu cần).
            </li>
          </ol>
          <div className="mt-4">
            <Link
              to="/admin/process-guide"
              className="inline-block rounded-xl px-5 py-3 border border-purple-300 hover:bg-purple-100 text-sm"
            >
              Xem đầy đủ quy trình →
            </Link>
          </div>
        </div>
      </main>

      {/* ===== Modal XEM CHI TIẾT ===== */}
      {openDetailFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={closeDetailModal} />
          <div className="relative z-10 w-[min(760px,92vw)] max-h-[88vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-purple-200 p-6">
            <header className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Chi tiết báo cáo #{openDetailFor.id}
              </h3>
              <p className="text-gray-600">
                Loại: <b>{openDetailFor.type}</b> — Đối tượng: <i>{openDetailFor.target}</i>
              </p>
            </header>

            <div className="grid sm:grid-cols-2 gap-4 text-gray-800">
              <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
                <div className="text-sm text-gray-600">Mã báo cáo</div>
                <div className="text-lg font-semibold">#{openDetailFor.id}</div>
              </div>
              <div className="rounded-xl bg-purple-50 border border-purple-200 p-4">
                <div className="text-sm text-gray-600">Thời gian</div>
                <div className="text-lg font-semibold">{openDetailFor.createdAt}</div>
              </div>

              {openDetailFor.reporter && (
                <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 sm:col-span-2">
                  <div className="text-sm text-gray-600">Người báo cáo</div>
                  <div className="text-lg font-semibold">{openDetailFor.reporter}</div>
                </div>
              )}

              <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 sm:col-span-2">
                <div className="text-sm text-gray-600">Mô tả / Lý do</div>
                <div className="mt-1">
                  {openDetailFor.description ? (
                    <p className="text-base leading-relaxed">{openDetailFor.description}</p>
                  ) : (
                    <p className="text-base italic text-gray-600">Không có mô tả chi tiết.</p>
                  )}
                </div>
              </div>

              {Array.isArray(openDetailFor.evidence) && openDetailFor.evidence.length > 0 && (
                <div className="rounded-xl bg-purple-50 border border-purple-200 p-4 sm:col-span-2">
                  <div className="text-sm text-gray-600">Bằng chứng đính kèm</div>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {openDetailFor.evidence.map((ev, i) => (
                      <li key={i}>
                        {/* Nếu là link hình/đường dẫn, cứ hiển thị như text/link bình thường */}
                        <a href={ev} target="_blank" rel="noreferrer" className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 underline">
                          {ev}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeDetailModal}
                className="rounded-xl px-5 py-2 border border-purple-300 hover:bg-purple-50"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  closeDetailModal();
                  openProcessModal(openDetailFor);
                }}
                className="rounded-xl px-5 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              >
                Chuyển tới xử lý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Modal XỬ LÝ ===== */}
      {openModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/30" onClick={closeProcessModal} />
          <div className="relative z-10 w-[min(680px,92vw)] rounded-2xl bg-white shadow-2xl border border-purple-200 p-6">
            <header className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Chọn mức xử lý</h3>
              <p className="text-gray-600">
                Áp dụng cho: <b>{openModalFor.type}</b> — <i>{openModalFor.target}</i>
              </p>
            </header>

            {/* lựa chọn */}
            <div className="grid gap-3">
              <label
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  selectedAction === "delete"
                    ? "border-pink-400 bg-pink-50"
                    : "border-purple-200 hover:bg-purple-50/60"
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  className="mr-2"
                  checked={selectedAction === "delete"}
                  onChange={() => setSelectedAction("delete")}
                />
                <span className="font-semibold">🧹 Xóa nội dung vi phạm</span>
                <div className="text-sm text-gray-600 mt-1">
                  Gỡ bài/chapter/bình luận bị báo cáo.
                </div>
              </label>

              <label
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  selectedAction === "ban7d"
                    ? "border-pink-400 bg-pink-50"
                    : "border-purple-200 hover:bg-purple-50/60"
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  className="mr-2"
                  checked={selectedAction === "ban7d"}
                  onChange={() => setSelectedAction("ban7d")}
                />
                <span className="font-semibold">⛔ Cấm tương tác 1 tuần</span>
                <div className="text-sm text-gray-600 mt-1">
                  Chặn đăng truyện/bình luận, like… với tài khoản liên quan.
                </div>
              </label>

              <label
                className={`cursor-pointer rounded-xl border p-4 transition ${
                  selectedAction === "lock"
                    ? "border-pink-400 bg-pink-50"
                    : "border-purple-200 hover:bg-purple-50/60"
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  className="mr-2"
                  checked={selectedAction === "lock"}
                  onChange={() => setSelectedAction("lock")}
                />
                <span className="font-semibold">🔒 Khóa tài khoản</span>
                <div className="text-sm text-gray-600 mt-1">
                  Khóa đăng nhập và mọi hoạt động của tài khoản vi phạm.
                </div>
              </label>
            </div>

            {/* actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeProcessModal}
                className="rounded-xl px-5 py-2 border border-purple-300 hover:bg-purple-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmProcess}
                className="rounded-xl px-5 py-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
