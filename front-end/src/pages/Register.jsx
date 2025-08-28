import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import SocialButton from "../components/SocialButton";

export default function Register() {
  const [step, setStep] = useState(1); // 1: Nhập thông tin, 2: Nhập OTP
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Countdown cho nút Gửi lại OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleSendOtp(e) {
    e.preventDefault();
    if (!email.trim()) return alert("Vui lòng nhập email");
    if (pw !== confirmPw) return alert("Mật khẩu không trùng khớp");
    alert("OTP đã được gửi tới email của bạn!");
    setCountdown(60); // Bắt đầu countdown 60s
    setStep(2);
  }

  function handleVerifyOtp(e) {
    e.preventDefault();
    if (otp.trim() === "123456") { // Demo OTP
      alert("Đăng ký thành công!");
      navigate("/login");
    } else {
      alert("OTP không chính xác!");
    }
  }

  function handleResendOtp() {
    if (countdown === 0) {
      alert("OTP mới đã được gửi!");
      setCountdown(60);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-pink-500">
      <div className="bg-white rounded-2xl shadow-lg w-3/4 max-w-xl p-10 flex flex-col items-center">

        <h1 className="text-pink-500 font-bold text-4xl text-center">DKStory</h1>
        <p className="mt-2 text-gray-600 text-center">Nơi câu chuyện bắt đầu</p>
        <h2 className="text-3xl font-bold mt-2">
          {step === 1 ? "ĐĂNG KÝ" : "XÁC NHẬN OTP"}
        </h2>

        {step === 1 ? (
          <form className="mt-6 w-full space-y-4" onSubmit={handleSendOtp}>
            <InputField
              label="Tên tài khoản"
              placeholder="Bút danh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <InputField
              label="Email"
              type="email"
              placeholder="email@vd.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <InputField
              label="Mật khẩu"
              type="password"
              placeholder="Ít nhất 8 ký tự"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="new-password"
            />
            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
            <button
              type="submit"
              className="w-full mt-2 bg-pink-400 text-white py-2 rounded-full hover:bg-pink-500 transition"
            >
              GỬI OTP →
            </button>
          </form>
        ) : (
          <form className="mt-6 w-full space-y-4" onSubmit={handleVerifyOtp}>
            <InputField
              label="Mã OTP"
              placeholder="Nhập mã OTP 6 số"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              type="submit"
              className="w-full mt-2 bg-pink-400 text-white py-2 rounded-full hover:bg-pink-500 transition"
            >
              XÁC NHẬN →
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0}
              className={`w-full mt-2 text-sm rounded-full border border-pink-400 py-2 transition ${
                countdown > 0
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "text-pink-500 hover:bg-pink-50"
              }`}
            >
              {countdown > 0 ? `Gửi lại OTP sau ${countdown}s` : "Gửi lại OTP"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-2 text-pink-500 text-sm hover:underline"
            >
              ← Quay lại
            </button>
          </form>
        )}

        {step === 1 && (
          <>
            <div className="mt-6 text-center text-sm text-gray-500">
              Hoặc đăng ký với
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <SocialButton icon="/google.png" alt="Google" />
              <SocialButton icon="/facebook.png" alt="Facebook" />
            </div>
          </>
        )}

        <p className="mt-6 text-sm text-gray-500 text-center">
          Đã có tài khoản?
          <Link to="/login" className="text-pink-500 ml-1 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
