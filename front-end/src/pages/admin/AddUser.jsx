import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import { adminUsers, adminStats, commentKeywords } from "../../data/mockData";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AddUser() {
  const navigate = useNavigate();
  const query = useQuery();
  const preRole = query.get("role"); // nếu từ /admin/users?role=author → add xong quay lại đúng filter

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: preRole === "author" ? "Tác giả" : "Người dùng",
    password: "",
    createdAt: new Date().toISOString().slice(0, 10),
  });

  // Lấy extra hiện có để tính ID mới
  const [extra, setExtra] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("adminUsersExtra");
      setExtra(raw ? JSON.parse(raw) : []);
    } catch {
      setExtra([]);
    }
  }, []);

  const nextId = useMemo(() => {
    const all = [...adminUsers, ...extra];
    const maxId = all.reduce((m, u) => (u.id > m ? u.id : m), 0);
    return maxId + 1;
  }, [extra]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Validate tối thiểu
    if (!form.name.trim()) return alert("Vui lòng nhập tên.");
    if (!form.email.trim() || !form.email.includes("@"))
      return alert("Email không hợp lệ.");
    if (!form.role.trim()) return alert("Vui lòng chọn vai trò.");

    // Lưu tạm vào localStorage (mô phỏng backend)
    const newUser = {
      id: nextId,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      createdAt: form.createdAt,
    };

    try {
      const raw = localStorage.getItem("adminUsersExtra");
      const list = raw ? JSON.parse(raw) : [];
      list.push(newUser);
      localStorage.setItem("adminUsersExtra", JSON.stringify(list));
      alert("Thêm người dùng thành công!");
      // Điều hướng về danh sách, giữ filter nếu là tác giả
      if (newUser.role.toLowerCase() === "tác giả" || newUser.role.toLowerCase() === "author") {
        navigate("/admin/users?role=author");
      } else {
        navigate("/admin/users");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi lưu người dùng mới.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeader
        pendingCount={adminStats.pending}
        approvedCount={5}
        reportCount={adminStats.reports}
        keywordCount={commentKeywords.length}
      />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-4xl font-bold mb-2">Thêm người dùng</h2>
        <p className="text-lg text-gray-600 mb-8">
          Điền thông tin bên dưới để tạo tài khoản mới.
        </p>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-purple-200 bg-white p-6 shadow-sm space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full rounded-xl border border-purple-300 px-4 py-3 focus:border-purple-500 focus:ring-pink-500"
              placeholder="Nguyễn Văn A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="w-full rounded-xl border border-purple-300 px-4 py-3 focus:border-purple-500 focus:ring-pink-500"
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò
              </label>
              <select
                name="role"
                value={form.role}
                onChange={onChange}
                className="w-full rounded-xl border border-purple-300 px-4 py-3 bg-white focus:border-purple-500 focus:ring-pink-500"
              >
                <option>Người dùng</option>
                <option>Tác giả</option>
                <option>Quản trị viên</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày tạo
              </label>
              <input
                type="date"
                name="createdAt"
                value={form.createdAt}
                onChange={onChange}
                className="w-full rounded-xl border border-purple-300 px-4 py-3 focus:border-purple-500 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Mật khẩu*/}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              className="w-full rounded-xl border border-purple-300 px-4 py-3 focus:border-purple-500 focus:ring-pink-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(preRole ? "/admin/users?role=author" : "/admin/users")}
              className="rounded-xl px-5 py-3 text-base border border-purple-300 hover:bg-purple-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl px-6 py-3 text-base text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              Lưu người dùng
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
