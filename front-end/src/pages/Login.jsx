import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import SocialButton from "../components/SocialButton";
import Button from "../components/Button";
import { api } from "../lib/api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!email.trim() || !password) {
      setErr("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    try {
      setLoading(true);
      // Đăng nhập qua API -> lưu token + user
      await api.auth.login({ email, password });
      // (tuỳ ý) gọi /me để lấy thông tin user cập nhật
      try {
        const me = await api.auth.me();
        localStorage.setItem("sessionUser", JSON.stringify(me));
      } catch {}
      nav("/home", { replace: true });
    } catch (e) {
      setErr(e?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-pink-500">
      <div className="bg-white rounded-2xl shadow-lg flex w-3/4 max-w-5xl overflow-hidden">

        {/* LEFT SIDE */}
        <div className="w-1/2 p-10">
          <h1 className="text-pink-500 font-bold text-4xl text-center">DKStory</h1>
          <p className="mt-2 text-gray-600 text-center">Nơi câu chuyện bắt đầu</p>
          <h2 className="text-3xl font-bold mt-2 text-center">ĐĂNG NHẬP</h2>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {err && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
                {err}
              </div>
            )}

            <InputField
              label="Email"
              type="email"
              placeholder="login@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              name="email"
            />

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
              <input
                type={showPw ? "text" : "password"}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                name="password"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-xs text-gray-500 hover:underline"
                onClick={() => setShowPw((s) => !s)}
              >
                {showPw ? "Ẩn" : "Hiện"}
              </button>

              <Link
                to="/forgot-password"
                className="absolute right-2 -bottom-6 text-sm text-gray-500 hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" className="!mt-6" variant="primary" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "LOGIN →"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">Đăng nhập với</div>
          <div className="flex justify-center gap-4 mt-4">
            <SocialButton icon="/google.png" alt="Google" onClick={() => alert("Sắp ra mắt")} />
            <SocialButton icon="/facebook.png" alt="Facebook" onClick={() => alert("Sắp ra mắt")} />
          </div>

          <p className="mt-6 text-sm text-gray-500 text-center">
            Bạn chưa có tài khoản?
            <Link to="/register" className="text-pink-500 ml-1 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/2 bg-blue-100 flex items-center justify-center p-10">
          <div className="flex gap-2 items-center">
            <img src="/image_login.png" alt="Illustration 1" className="max-w-[340px] object-contain" />
            <img src="/image_login2.png" alt="Illustration 2" className="max-w-[120px] object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
