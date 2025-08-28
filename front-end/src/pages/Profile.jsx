import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function Profile() {
  const navigate = useNavigate();
  function handleLogout() {
    navigate("/login");
  }

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white shadow-sm rounded-2xl p-6 flex items-center gap-6">
          <img
            src="https://cdn-media.sforum.vn/storage/app/media/ctv_seo3/meme-meo-cuoi-51.jpg"
            alt="avatar"
            className="w-24 h-24 rounded-full border-4 border-gradient-to-r from-blue-400 to-pink-400"
          />
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">Doanh Doanh</h2>
            <p className="text-sm text-gray-500">Tác giả • Thành viên từ 2025</p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 text-white font-medium shadow hover:opacity-90 transition whitespace-nowrap">
              Chỉnh sửa hồ sơ
            </Button>
            <Button variant="ghost" className="px-5 py-2 rounded-xl border border-gradient-to-r from-blue-500 to-pink-500 text-blue-500 font-medium hover:bg-gradient-to-r hover:from-blue-500 hover:to-pink-500 hover:text-white transition" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>


        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: "Truyện đã đăng", value: "12" },
            { label: "Truyện đã đọc", value: "48" },
            { label: "Người theo dõi", value: "1.2k" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-sm rounded-2xl p-5 text-center"
            >
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
                {item.value}
              </p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="bg-white shadow-sm rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Giới thiệu</h3>
          <p className="text-gray-600">
            Yêu thích sáng tác fantasy, huyền huyễn. Mục tiêu 1 chương/ngày.
          </p>
        </div>
      </div>
    </div>
  );
}
