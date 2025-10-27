import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import { adminUsers, adminStats, commentKeywords } from "../../data/mockData";

// Lấy query param
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Users() {
  const query = useQuery();
  const navigate = useNavigate();
  const roleFilter = query.get("role"); // "author" | "tác giả" | null
  const [extraUsers, setExtraUsers] = useState([]);

  // Đọc bổ sung từ localStorage (mô phỏng backend)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("adminUsersExtra");
      setExtraUsers(raw ? JSON.parse(raw) : []);
    } catch {
      setExtraUsers([]);
    }
  }, []);

  // Gộp data từ mock + localStorage
  const allUsers = useMemo(() => {
    return [...adminUsers, ...extraUsers];
  }, [extraUsers]);

  // Lọc theo role khi có ?role=author
  const filteredUsers = useMemo(() => {
    if (roleFilter === "author" || roleFilter?.toLowerCase() === "tác giả") {
      return allUsers.filter(
        (u) =>
          (u.role || "").toLowerCase() === "tác giả" ||
          (u.role || "").toLowerCase() === "author"
      );
    }
    return allUsers;
  }, [allUsers, roleFilter]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeader
        pendingCount={adminStats.pending}
        approvedCount={5}
        reportCount={adminStats.reports}
        keywordCount={commentKeywords.length}
      />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-4xl font-bold">
              {roleFilter ? "Danh sách Tác giả" : "Quản lý Người dùng"}
            </h2>
            <p className="text-lg text-gray-600 mt-1">
              {roleFilter
                ? "Hiển thị các tài khoản có vai trò Tác giả."
                : "Danh sách toàn bộ người dùng trong hệ thống."}
            </p>
          </div>
          <button
            onClick={() =>
              navigate(roleFilter ? "/admin/users/add?role=author" : "/admin/users/add")
            }
            className="rounded-xl px-5 py-3 text-base text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
          >
            + Thêm người dùng
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-purple-200 shadow-sm">
          <table className="min-w-full text-lg">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
              <tr className="text-gray-700">
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">Tên người dùng</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Vai trò</th>
                <th className="py-3 px-4 text-left">Ngày tạo</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr
                  key={`${u.id}-${u.email}`}
                  className="border-t border-purple-100 hover:bg-purple-50/40 transition"
                >
                  <td className="py-3 px-4 text-gray-700">#{u.id}</td>
                  <td className="py-3 px-4 font-semibold text-gray-900">{u.name}</td>
                  <td className="py-3 px-4 text-gray-700">{u.email}</td>
                  <td className="py-3 px-4 text-gray-700">{u.role}</td>
                  <td className="py-3 px-4 text-gray-600">{u.createdAt || "—"}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="px-4 py-2 mr-2 rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                      onClick={() => alert(`Chỉnh sửa người dùng #${u.id} (demo)`)}
                    >
                      Sửa
                    </button>
                    <button
                      className="px-4 py-2 border border-purple-300 rounded-lg hover:bg-purple-50 text-gray-800"
                      onClick={() => alert(`Xóa người dùng #${u.id} (demo)`)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 text-lg italic">
                    Không có người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!roleFilter && (
          <div className="mt-6 text-sm text-gray-600">
            Gợi ý: Lọc theo tác giả bằng{" "}
            <Link
              to="/admin/users?role=author"
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 font-semibold"
            >
              /admin/users?role=author
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
