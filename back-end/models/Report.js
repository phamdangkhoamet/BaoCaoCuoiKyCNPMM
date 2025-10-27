// back-end/models/Report.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    name: String,
    url: String, // base64 dataURL hoặc link lưu trữ
  },
  { _id: false }
);

const reportSchema = new Schema(
  {
    type: { type: String, enum: ["chapter", "novel", "other"], required: true },
    novelId: { type: Schema.Types.ObjectId, ref: "Novel" },
    chapterNo: Number,

    reason: String,
    description: String,

    attachments: [attachmentSchema],

    userId: { type: Schema.Types.ObjectId, ref: "User" }, // nếu muốn gắn user báo cáo
    status: { type: String, enum: ["pending", "reviewing", "resolved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
