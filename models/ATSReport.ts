import mongoose, { Schema, Document, Model } from "mongoose";

export interface IATSReport extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId?: mongoose.Types.ObjectId;
  jobDescription: string;
  score: number;
  missingKeywords: string[];
  formattingSuggestions: string[];
  skillGapAnalysis: string[];
  improvementTips: string[];
  createdAt: Date;
}

const ATSReportSchema = new Schema<IATSReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume" },
    jobDescription: { type: String, required: true },
    score: { type: Number, required: true },
    missingKeywords: [{ type: String }],
    formattingSuggestions: [{ type: String }],
    skillGapAnalysis: [{ type: String }],
    improvementTips: [{ type: String }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ATSReport: Model<IATSReport> = mongoose.models.ATSReport || mongoose.model<IATSReport>("ATSReport", ATSReportSchema);
export default ATSReport;
