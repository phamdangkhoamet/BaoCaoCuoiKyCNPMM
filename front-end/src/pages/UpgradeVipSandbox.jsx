import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api, API_BASE } from "../lib/api";

const QR_5K = "/5k.jpg";     
const QR_20K = "/20k.jpg";   
export default function UpgradeVipSandbox() {
  const [plan, setPlan] = useState(null); // "vip1d" | "vip1m"
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const sessionUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("sessionUser") || "null"); } catch { return null; }
  }, []);

  const qrSrc = plan === "vip1m" ? QR_20K : plan === "vip1d" ? QR_5K : "";
  const planMeta = plan === "vip1d"
    ? { title: "VIP 1 ngày", price: "5,000đ", code: "VIP 1D" }
    : plan === "vip1m"
    ? { title: "VIP 1 tháng", price: "20,000đ", code: "VIP 1M" }
    : null;

  async function onConfirmPaid() {
    setErr(""); setMsg("");
    if (!sessionUser) {
      setErr("Bạn cần đăng nhập trước khi nâng cấp VIP.");
      return;
    }
    if (!plan) {
      setErr("Vui lòng chọn gói trước khi xác nhận.");
      return;
    }

    setPaying(true);
    try {
      const res = await fetch(
        new URL("/api/payments/sandbox/pay", API_BASE || window.location.origin),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(api?.auth?.getToken?.() ? { Authorization: "Bearer " + api.auth.getToken() } : {})
          },
          body: JSON.stringify({ plan }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Thanh toán thất bại");

      const updated = {
        ...(sessionUser || {}),
        isVip: true,
        vipUntil: data?.user?.vipUntil || sessionUser?.vipUntil,
      };
      localStorage.setItem("sessionUser", JSON.stringify(updated));
      setMsg("🎉 Nâng cấp VIP thành công! Bạn có thể đọc chương VIP ngay.");
    } catch (e) {
      setErr(e.message || "Có lỗi khi nâng cấp VIP");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex flex-col items-center px-4 py-10">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent text-center mb-6">
          Nâng cấp VIP
        </h1>

        {!sessionUser && (
          <div className="mb-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 px-4 py-3 text-center max-w-md">
            Bạn chưa đăng nhập. Hãy <Link className="underline" to="/login">đăng nhập</Link> trước khi nâng cấp VIP.
          </div>
        )}

        {err && (
          <div className="mb-4 rounded-xl border border-pink-200 bg-pink-50 text-pink-700 px-4 py-3 text-center max-w-md">
            {err}
          </div>
        )}
        {msg && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-center max-w-md">
            {msg}
          </div>
        )}

        {/* Bước chọn gói */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <PlanCard
            active={plan === "vip1d"}
            title="VIP 1 ngày"
            price="5,000đ"
            desc="Đọc mọi chương trong 24 giờ."
            onClick={() => setPlan("vip1d")}
          />
          <PlanCard
            active={plan === "vip1m"}
            title="VIP 1 tháng"
            price="20,000đ"
            desc="Đọc mọi chương trong 30 ngày."
            onClick={() => setPlan("vip1m")}
          />
        </div>

        {/* Hiện QR khi chọn gói */}
        {plan && (
          <div className="flex flex-col items-center mt-10">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Quét mã QR để thanh toán
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Gói bạn chọn: <span className="font-medium">{planMeta.title}</span> —{" "}
                <span className="font-medium text-purple-600">{planMeta.price}</span>
              </p>
            </div>

            <div className="mt-6 p-4 bg-white rounded-2xl shadow-lg border border-purple-100">
              <img
                src={qrSrc}
                alt="QR Thanh toán"
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
              />
            </div>

            

            <button
              onClick={onConfirmPaid}
              disabled={paying || !sessionUser}
              className={`mt-8 px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-500 to-pink-500 ${
                paying || !sessionUser
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:opacity-90 shadow-lg"
              }`}
            >
              {paying ? "Đang kích hoạt..." : "Tôi đã chuyển, nâng cấp VIP"}
            </button>

            <Link
              to="/home"
              className="mt-3 text-sm text-gray-500 hover:underline"
            >
              ← Về trang chủ
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* Card chọn gói */
function PlanCard({ active, title, price, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-64 sm:w-72 text-left rounded-2xl border p-5 transition shadow-sm hover:shadow-md ${
        active ? "border-purple-400 bg-purple-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="text-sm text-gray-600">Gói</div>
      <div className="text-xl font-bold text-gray-900 mt-1">{title}</div>
      <div className="mt-2 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        {price}
      </div>
      <div className="mt-2 text-sm text-gray-600">{desc}</div>
      {active && (
        <div className="mt-3 text-xs inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700">
          ✓ Đã chọn
        </div>
      )}
    </button>
  );
}
