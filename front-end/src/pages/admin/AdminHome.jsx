// src/pages/admin/AdminHome.jsx
import React, { useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import AdminHeader from "../../components/admin/AdminHeader";
import {
  adminStats,
  adminTrends,
  adminPending,
  adminReports,
  commentKeywords,
} from "../../data/mockData";

function Section({ title, note, children }) {
  return (
    <section className="min-h-[90vh] flex flex-col justify-center px-6 sm:px-10 py-10 border-b border-purple-100">
      <div className="max-w-6xl mx-auto w-full">
        <header className="mb-6">
          <h2 className="text-4xl font-bold text-gray-900">{title}</h2>
          {note && <p className="text-lg text-gray-600 mt-2">{note}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

// ✅ Card có khả năng điều hướng
function StatCard({ label, value, sub, to }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => to && navigate(to)}
      className="w-full text-left rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-8 shadow hover:shadow-lg transition outline-none border border-transparent hover:border-pink-200 cursor-pointer"
      aria-label={`Đi tới ${label}`}
    >
      <div className="text-5xl font-extrabold text-gray-900 mb-2">
        {value?.toLocaleString?.() ?? value}
      </div>
      <div className="text-xl font-semibold text-gray-800">{label}</div>
      {sub && <p className="text-gray-600 mt-1">{sub}</p>}
    </button>
  );
}

function Bar({ value, max }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-56 w-10 bg-purple-100 rounded-xl overflow-hidden">
        <div
          className="h-full bg-gradient-to-t from-pink-500 to-purple-500 origin-bottom"
          style={{ transform: `scaleY(${pct / 100})` }}
        />
      </div>
    </div>
  );
}

export default function AdminHome() {
  const maxReads = useMemo(() => Math.max(...adminTrends.dailyReads, 1), []);
  const maxUsers = useMemo(() => Math.max(...adminTrends.newUsers, 1), []);
  const approveNovel = useCallback((id) => alert(`Duyệt truyện #${id}`), []);
  const rejectNovel = useCallback((id) => alert(`Từ chối truyện #${id}`), []);

  return (
    <div className="bg-white text-gray-900">
      <AdminHeader
        pendingCount={adminStats.pending}
        approvedCount={5}
        reportCount={adminStats.reports}
        keywordCount={commentKeywords.length}
      />

      {/* --- Section 1: Tổng quan --- */}
      <Section
        title="Tổng quan hệ thống"
        note="Các chỉ số chính của hệ thống quản lý truyện và người dùng."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatCard
            label="Người dùng"
            value={adminStats.users}
            sub="Tổng tài khoản"
            to="/admin/users"
          />
          <StatCard
            label="Tác giả"
            value={adminStats.authors}
            sub="Đang hoạt động"
            to="/admin/users?role=author"
          />
          <StatCard
            label="Truyện"
            value={adminStats.novels}
            sub="Trong hệ thống"
            to="/admin/moderation"
          />
          <StatCard
            label="Chương"
            value={adminStats.chapters}
            sub="Đã xuất bản"
            to="/admin/moderation" 
          />
          <StatCard
            label="Truyện chờ duyệt"
            value={adminStats.pending}
            sub="Cần kiểm duyệt"
            to="/admin/moderation/pending"
          />
          <StatCard
            label="Báo cáo vi phạm"
            value={adminStats.reports}
            sub="Chưa xử lý"
            to="/admin/reports"
          />
        </div>
      </Section>

      {/* --- Section 2: Biểu đồ --- */}
      <Section title="Thống kê hoạt động" note="Theo dõi lượt đọc và người dùng mới trong 7 ngày qua.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Lượt đọc 7 ngày</h3>
            <div className="flex gap-4 justify-center">
              {adminTrends.dailyReads.map((v, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Bar value={v} max={maxReads} />
                  <span className="text-sm text-gray-600 mt-1">D{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4">Người dùng mới</h3>
            <div className="flex gap-4 justify-center">
              {adminTrends.newUsers.map((v, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Bar value={v} max={maxUsers} />
                  <span className="text-sm text-gray-600 mt-1">D{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* --- Section 3: Truyện chờ duyệt --- */}
      <Section title="Truyện chờ duyệt" note="Kiểm tra nội dung và duyệt truyện mới được gửi lên.">
        <div className="overflow-x-auto rounded-2xl border border-purple-200 shadow-sm">
          <table className="min-w-full text-lg">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr className="text-gray-700">
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Tiêu đề</th>
                <th className="py-3 px-4 text-left">Tác giả</th>
                <th className="py-3 px-4 text-left">Thể loại</th>
                <th className="py-3 px-4 text-left">Gửi lúc</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {adminPending.map((n) => (
                <tr key={n.id} className="border-t border-purple-100">
                  <td className="py-3 px-4 text-gray-700">#{n.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{n.title}</td>
                  <td className="py-3 px-4 text-gray-700">{n.author}</td>
                  <td className="py-3 px-4 text-gray-700">{n.genre}</td>
                  <td className="py-3 px-4 text-gray-600">{n.submittedAt}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="rounded-lg px-5 py-2 mr-2 text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                      onClick={() => approveNovel(n.id)}
                    >
                      Duyệt
                    </button>
                    <button
                      className="rounded-lg px-5 py-2 border border-purple-300 hover:bg-purple-50"
                      onClick={() => rejectNovel(n.id)}
                    >
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* --- Section 4: Báo cáo --- */}
      <Section title="Báo cáo vi phạm" note="Các nội dung được người dùng báo cáo.">
        <ul className="divide-y divide-purple-100 bg-white rounded-2xl border border-purple-200">
          {adminReports.map((r) => (
            <li key={r.id} className="p-6 flex items-center justify-between hover:bg-purple-50/40">
              <div>
                <h4 className="text-xl font-semibold text-gray-900">{r.type}</h4>
                <p className="text-lg text-gray-700 mt-1">{r.target}</p>
                <span className="text-sm text-gray-500">{r.createdAt}</span>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-purple-300 rounded-lg hover:bg-purple-50 text-gray-800">
                  Đã xử lý
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90">
                  Chi tiết
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* --- Section 5: Quy tắc bình luận --- */}
      <Section
        title="Quy tắc kiểm duyệt bình luận"
        note="Từ khóa nhạy cảm sẽ giúp tự động ẩn bình luận vi phạm."
      >
        <div className="flex flex-wrap gap-3">
          {commentKeywords.map((k, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-base text-pink-700"
            >
              {k}
              <button className="rounded-full px-2 hover:bg-white/60">×</button>
            </span>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <input
            type="text"
            placeholder="Thêm từ khóa mới..."
            className="flex-1 rounded-xl border border-purple-300 px-4 py-3 text-lg focus:border-purple-500 focus:ring-pink-500"
          />
          <button className="rounded-xl px-6 py-3 text-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
            Thêm
          </button>
        </div>
      </Section>

      {/* --- Section 6: Tác vụ nhanh --- */}
      <Section title="Tác vụ nhanh" note="Các thao tác quản lý thường dùng.">
        <div className="flex flex-col gap-4">
          <Link
            to="/admin/moderation/pending"
            className="rounded-xl px-6 py-4 text-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:text-white hover:font-bold hover:opacity-90 transition text-center"
          >
            Duyệt truyện
          </Link>
          <Link
            to="/admin/reports"
            className="rounded-xl px-6 py-4 text-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:text-white hover:font-bold hover:opacity-90 transition text-center"
          >
            Xem báo cáo
          </Link>
          <Link
            to="/admin/users"
            className="rounded-xl px-6 py-4 text-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:text-white hover:font-bold hover:opacity-90 transition text-center"
          >
            Quản lý người dùng
          </Link>
          <Link
            to="/admin/comment-rules"
            className="rounded-xl px-6 py-4 text-xl text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:text-white hover:font-bold hover:opacity-90 transition text-center"
          >
            Quy tắc bình luận
          </Link>
        </div>
      </Section>
    </div>
  );
}
