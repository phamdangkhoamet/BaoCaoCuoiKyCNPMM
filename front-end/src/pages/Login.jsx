import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import Button from "../components/Button";
import SocialButton from "../components/SocialButton";

export default function Login() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-pink-500">
      <div className="bg-white rounded-2xl shadow-lg flex w-3/4 max-w-5xl overflow-hidden">
        
        {/* LEFT SIDE */}
        <div className="w-1/2 p-10">
          <h1 className="text-pink-500 font-bold text-4xl text-center">DKStory</h1>
          <p className="mt-2 text-gray-600 text-center">Nơi câu chuyện bắt đầu</p>
          <h2 className="text-3xl font-bold mt-2 text-center">ĐĂNG NHẬP</h2>

          <form className="mt-6">
            <InputField label="Email" type="email" placeholder="login@gmail.com" />
            <div className="relative">
              <InputField label="Mật khẩu" type="password" placeholder="••••••••" />
              <a
                href="/forgot-password"
                className="absolute right-2 top-1 text-sm text-gray-500 hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-pink-400 text-white py-2 rounded-full hover:bg-pink-500 transition"
            >
              LOGIN →
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">Đăng nhập với</div>
          <div className="flex justify-center gap-4 mt-4">
            <SocialButton icon="/google.png" alt="Google" />
            <SocialButton icon="/facebook.png" alt="Facebook" />
          </div>

          <p className="mt-6 text-sm text-gray-500 text-center">
            Bạn chưa có tài khoản?
            <a href="/register" className="text-pink-500 ml-1 hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/2 bg-blue-100 flex items-center justify-center p-10">
          <div className="flex gap-2 items-center">
            <img
              src="/image_login.png"
              alt="Illustration 1"
              className="max-w-[340px] object-contain"
            />
            <img
              src="/image_login2.png"
              alt="Illustration 2"
              className="max-w-[120px] object-contain"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
