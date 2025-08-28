import { useState } from "react";
import { Link } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP, 3: đặt lại mật khẩu
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSendOTP(e) {
    e.preventDefault();
    if (!email.trim()) {
      alert("Vui lòng nhập email");
      return;
    }
    alert("Demo: OTP đã được gửi đến " + email);
    setStep(2);
  }

  function handleVerifyOTP(e) {
    e.preventDefault();
    if (otp === "123456") {
      alert("OTP hợp lệ!");
      setStep(3);
    } else {
      alert("OTP không đúng!");
    }
  }

  function handleResetPassword(e) {
    e.preventDefault();
    if (!newPassword.trim() || !confirmPassword.trim()) {
      alert("Vui lòng nhập đầy đủ mật khẩu");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }
    alert("Mật khẩu đã được đặt lại thành công!");
    setStep(1);
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-pink-500">
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Khôi phục mật khẩu
        </h1>

        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSendOTP}>
            <p className="text-gray-600 text-center text-sm">
              Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để xác thực.
            </p>
            <InputField
              label="Email"
              type="email"
              placeholder="email@vd.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Button type="submit" className="w-full">
              Gửi mã OTP
            </Button>
          </form>
        )}

        {step === 2 && (
          <form className="space-y-4" onSubmit={handleVerifyOTP}>
            <p className="text-gray-600 text-center text-sm">
              Nhập mã OTP đã được gửi tới email:{" "}
              <span className="font-medium">{email}</span>
            </p>
            <InputField
              label="Mã OTP"
              type="text"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <div className="flex justify-between text-sm">
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => alert("Demo: OTP đã được gửi lại")}
              >
                Gửi lại OTP
              </button>
              <button
                type="button"
                className="text-gray-500 hover:underline"
                onClick={() => setStep(1)}
              >
                Sửa email
              </button>
            </div>
            <Button type="submit" className="w-full">
              Xác nhận OTP
            </Button>
          </form>
        )}

        {step === 3 && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <p className="text-gray-600 text-center text-sm">
              Nhập mật khẩu mới cho tài khoản:{" "}
              <span className="font-medium">{email}</span>
            </p>
            <InputField
              label="Mật khẩu mới"
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <InputField
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Đặt lại mật khẩu
            </Button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
