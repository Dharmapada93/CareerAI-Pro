import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  type: "bug" | "feature" | "feedback";
  subject: string;
  message: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["bug", "feature", "feedback"], default: "feedback" },
    subject: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
export default Feedback;
