import React, { useMemo, useState } from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  adminStats,
  commentKeywords,
  moderationPending,
  moderationApproved,
  moderationRejected,
} from "../../data/mockData";

export default function Moderation() {
  const [status, setStatus] = useState("pending"); // pending | approved | rejected

  // Dữ liệu hiện tại dựa theo tab
  const currentData = useMemo(() => {
    switch (status) {
      case "approved":
        return moderationApproved;
      case "rejected":
        return moderationRejected;
      default:
        return moderationPending;
    }
  }, [status]);

  // Handler (demo)
  const handleApprove = (id) => alert(`✅ Duyệt truyện #${id}`);
  const handleReject = (id) => alert(`❌ Từ chối truyện #${id}`);
  const handleView = (id) => alert(`👁️ Xem chi tiết truyện #${id}`);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeader
        pendingCount={adminStats.pending}
        approvedCount={moderationApproved.length}
        reportCount={adminStats.reports}
        keywordCount={commentKeywords.length}
      />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-4xl font-bold mb-2">Kiểm duyệt truyện</h2>
        <p className="text-lg text-gray-600 mb-8">
          Quản lý các truyện do tác giả gửi lên hệ thống.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { key: "pending", label: `Chờ duyệt (${moderationPending.length})` },
            { key: "approved", label: `Đã duyệt (${moderationApproved.length})` },
            { key: "rejected", label: `Từ chối (${moderationRejected.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={`px-6 py-3 rounded-xl text-lg font-medium transition-all duration-200
                ${
                  status === t.key
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-purple-50 hover:bg-pink-50 text-gray-700 border border-purple-200"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-purple-200 shadow-sm">
          <table className="min-w-full text-lg">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr className="text-gray-700">
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Tiêu đề</th>
                <th className="py-3 px-4 text-left">Tác giả</th>
                <th className="py-3 px-4 text-left">Thể loại</th>
                <th className="py-3 px-4 text-left">Ngày gửi</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((n) => (
                <tr
                  key={n.id}
                  className="border-t border-purple-100 hover:bg-purple-50/40 transition"
                >
                  <td className="py-3 px-4 text-gray-700">#{n.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">
                    {n.title}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{n.author}</td>
                  <td className="py-3 px-4 text-gray-700">{n.genre}</td>
                  <td className="py-3 px-4 text-gray-600">{n.submittedAt}</td>
                  <td className="py-3 px-4 text-center">
                    {status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(n.id)}
                          className="px-4 py-2 mr-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleReject(n.id)}
                          className="px-4 py-2 border border-purple-300 rounded-lg hover:bg-purple-50 text-gray-800"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    {status !== "pending" && (
                      <button
                        onClick={() => handleView(n.id)}
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                      >
                        Xem chi tiết
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="py-10 text-center text-gray-500 text-lg italic"
                  >
                    Không có truyện nào trong danh sách này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Gợi ý kiểm duyệt */}
        <div className="mt-8 bg-purple-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            Gợi ý kiểm duyệt
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Kiểm tra tiêu đề, nội dung, thể loại và ảnh bìa của truyện.</li>
            <li>
              Không duyệt các truyện có yếu tố phản cảm, vi phạm quy chuẩn văn
              hóa.
            </li>
            <li>
              Khi từ chối, nên ghi rõ lý do để tác giả có thể chỉnh sửa và gửi
              lại.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
