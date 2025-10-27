// src/pages/admin/ProcessGuide.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import { adminStats, commentKeywords } from "../../data/mockData";

export default function ProcessGuide() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AdminHeader
        pendingCount={adminStats.pending}
        approvedCount={5}
        reportCount={adminStats.reports}
        keywordCount={commentKeywords.length}
      />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-3 text-gray-900">
          Quy trình xử lý báo cáo vi phạm
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Quy trình chuẩn dùng để đánh giá, xử lý và ghi nhận các báo cáo vi phạm từ người dùng
          trong hệ thống quản lý truyện. Mọi quyết định cần dựa trên bằng chứng cụ thể và đảm bảo
          tính công bằng, minh bạch.
        </p>

        {/* Giai đoạn 1 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            1️⃣ Thẩm định ban đầu
          </h2>
          <p className="text-gray-700 mb-3">
            Khi có báo cáo gửi đến, người kiểm duyệt thực hiện các bước sau:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Đọc nội dung báo cáo và xem lại bằng chứng người dùng cung cấp.</li>
            <li>
              Kiểm tra đối tượng bị báo cáo (truyện, chương, bình luận, tác giả) trong hệ thống.
            </li>
            <li>
              Đánh giá sơ bộ mức độ nghiêm trọng của vi phạm dựa trên nội dung và tần suất tái phạm.
            </li>
          </ul>
          <div className="mt-3 bg-purple-50 border-l-4 border-purple-400 p-4 rounded-xl text-gray-800">
            💡 <b>Ví dụ:</b> Người dùng báo cáo một bình luận có chứa ngôn từ xúc phạm.  
            → Kiểm tra nội dung gốc của bình luận, xác nhận có thật sự chứa từ cấm hay không.
          </div>
        </section>

        {/* Giai đoạn 2 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            2️⃣ Phân loại mức độ vi phạm
          </h2>
          <p className="text-gray-700 mb-3">
            Sau khi xác minh, báo cáo được phân loại theo 3 mức độ để áp dụng biện pháp phù hợp:
          </p>

          <div className="space-y-5">
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <h3 className="text-xl font-semibold text-yellow-800">🟡 Mức độ nhẹ</h3>
              <p className="text-gray-800 mt-1">
                Vi phạm nhỏ, không gây ảnh hưởng nghiêm trọng. Thường do thiếu hiểu biết hoặc sơ ý.
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Chỉ cần <b>chỉnh sửa hoặc nhắc nhở</b> người đăng.</li>
                <li>
                  Không cần gỡ nội dung nếu sau khi chỉnh sửa đáp ứng quy tắc.
                </li>
              </ul>
              <div className="mt-3 bg-white border-l-4 border-yellow-400 p-3 rounded-xl">
                💬 <b>Ví dụ:</b> Tác giả đăng truyện thiếu phần cảnh báo độ tuổi cho nội dung 18+.  
                → Nhắc nhở bổ sung cảnh báo, không cần xóa truyện.
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
              <h3 className="text-xl font-semibold text-orange-800">🟠 Mức độ trung bình</h3>
              <p className="text-gray-800 mt-1">
                Vi phạm rõ ràng quy tắc cộng đồng, nhưng chưa gây ảnh hưởng nghiêm trọng hoặc cố ý.
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>
                  <b>Xóa hoặc ẩn</b> nội dung vi phạm (bình luận, chương, hình ảnh…).
                </li>
                <li>
                  <b>Cảnh cáo người đăng</b> và yêu cầu cam kết không tái phạm.
                </li>
              </ul>
              <div className="mt-3 bg-white border-l-4 border-orange-400 p-3 rounded-xl">
                💬 <b>Ví dụ:</b> Bình luận chứa từ ngữ xúc phạm người khác.  
                → Xóa bình luận, cảnh cáo tài khoản đăng.
              </div>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="text-xl font-semibold text-red-800">🔴 Mức độ nghiêm trọng</h3>
              <p className="text-gray-800 mt-1">
                Nội dung mang tính thù ghét, bạo lực, vi phạm pháp luật, hoặc tài khoản tái phạm nhiều lần.
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li><b>Khóa tài khoản</b> ngay lập tức hoặc <b>cấm tương tác 1 tuần</b>.</li>
                <li>
                  Nếu là nội dung chứa yếu tố nhạy cảm nghiêm trọng, tiến hành báo cáo cho quản trị cấp cao.
                </li>
              </ul>
              <div className="mt-3 bg-white border-l-4 border-red-400 p-3 rounded-xl">
                💬 <b>Ví dụ:</b> Truyện có nội dung bạo lực cực đoan hoặc bình luận mang yếu tố phân biệt chủng tộc.  
                → Gỡ truyện, khóa tài khoản và báo cáo lên ban điều hành.
              </div>
            </div>
          </div>
        </section>

        {/* Giai đoạn 3 */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            3️⃣ Biện pháp xử lý tương ứng
          </h2>
          <p className="text-gray-700 mb-3">
            Các biện pháp được áp dụng tùy theo mức độ đã phân loại:
          </p>

          <ol className="list-decimal list-inside text-gray-800 space-y-3">
            <li>
              <b>Xóa nội dung vi phạm:</b> Gỡ bỏ bài, chương, bình luận hoặc hình ảnh không phù hợp.
              <div className="text-sm text-gray-600 mt-1">
                Ví dụ: “Chương 3 – Hành trình định mệnh” chứa từ khóa vi phạm → xóa hoặc ẩn chương.
              </div>
            </li>
            <li>
              <b>Cấm tương tác 1 tuần:</b> Ngăn tác giả hoặc người bình luận đăng bài, bình luận, hoặc thích.
              <div className="text-sm text-gray-600 mt-1">
                Ví dụ: Người dùng A liên tục spam bình luận quảng cáo → bị cấm tương tác 7 ngày.
              </div>
            </li>
            <li>
              <b>Khóa tài khoản:</b> Áp dụng với trường hợp tái phạm hoặc cố tình lan truyền nội dung độc hại.
              <div className="text-sm text-gray-600 mt-1">
                Ví dụ: Tác giả B bị khóa tài khoản vì đăng truyện sao chép trái phép 3 lần.
              </div>
            </li>
          </ol>
        </section>

        {/* Giai đoạn 4 */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            4️⃣ Ghi nhận & thông báo
          </h2>
          <p className="text-gray-700 mb-3">
            Sau khi xử lý, cần cập nhật trạng thái báo cáo và ghi nhận kết quả:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Đánh dấu báo cáo là <b>“Đã xử lý”</b> trong hệ thống.</li>
            <li>Ghi chú ngắn gọn lý do và hành động đã thực hiện.</li>
            <li>Thông báo cho người báo cáo và người bị xử lý (nếu cần).</li>
            <li>Lưu log xử lý để phục vụ thống kê và kiểm tra định kỳ.</li>
          </ul>
          <div className="mt-3 bg-purple-50 border-l-4 border-purple-400 p-4 rounded-xl text-gray-800">
            💡 <b>Ví dụ:</b> Báo cáo #R-8897 “Tác giả Nguyễn K” → đã xử lý, khóa 1 tuần, ghi chú:
            “Spam truyện vi phạm nội dung lặp lại”.
          </div>
        </section>

        {/* Nút quay lại */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl px-6 py-3 text-base border border-purple-300 hover:bg-purple-50"
          >
            ← Quay lại
          </button>
        </div>

        <footer className="mt-10 text-center text-gray-500 text-sm">
          * Quy trình này được ban hành nội bộ nhằm đảm bảo công bằng và an toàn nội dung trong hệ thống.
        </footer>
      </main>
    </div>
  );
}
