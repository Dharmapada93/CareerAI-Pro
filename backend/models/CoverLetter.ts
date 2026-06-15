import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoverLetter extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  role: string;
  content: string;
  createdAt: Date;
}

const CoverLetterSchema = new Schema<ICoverLetter>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const CoverLetter: Model<ICoverLetter> =
  mongoose.models.CoverLetter || mongoose.model<ICoverLetter>("CoverLetter", CoverLetterSchema);
export default CoverLetter;
