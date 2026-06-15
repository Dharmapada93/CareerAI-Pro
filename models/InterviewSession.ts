import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestionResponse {
  question: string;
  answer?: string;
  feedback?: string;
  scores?: {
    technical: number;
    communication: number;
    confidence: number;
  };
  improvedAnswer?: string;
}

export interface IInterviewSession extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  experienceLevel: string;
  questions: IQuestionResponse[];
  overallFeedback?: string;
  overallScores?: {
    technical: number;
    communication: number;
    confidence: number;
  };
  status: "pending" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const QuestionResponseSchema = new Schema<IQuestionResponse>({
  question: { type: String, required: true },
  answer: { type: String, default: "" },
  feedback: { type: String, default: "" },
  scores: {
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
  },
  improvedAnswer: { type: String, default: "" },
});

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    questions: [QuestionResponseSchema],
    overallFeedback: { type: String, default: "" },
    overallScores: {
      technical: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
    },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
  },
  { timestamps: true }
);

const InterviewSession: Model<IInterviewSession> =
  mongoose.models.InterviewSession || mongoose.model<IInterviewSession>("InterviewSession", InterviewSessionSchema);
export default InterviewSession;
