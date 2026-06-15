import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJobChecklist {
  text: string;
  completed: boolean;
}

export interface IJobEmail {
  subject: string;
  body: string;
  sentAt?: Date;
}

export interface IJob extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  company: string;
  status: "Applied" | "Interview" | "Selected" | "Rejected";
  appliedDate: Date;
  notes?: string;
  checklist: IJobChecklist[];
  reminders: Date[];
  emails: IJobEmail[];
  createdAt: Date;
  updatedAt: Date;
}

const JobChecklistSchema = new Schema<IJobChecklist>({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const JobEmailSchema = new Schema<IJobEmail>({
  subject: { type: String, required: true },
  body: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
});

const JobSchema = new Schema<IJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    status: {
      type: String,
      enum: ["Applied", "Interview", "Selected", "Rejected"],
      default: "Applied",
    },
    appliedDate: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    checklist: { type: [JobChecklistSchema], default: [] },
    reminders: { type: [Date], default: [] },
    emails: { type: [JobEmailSchema], default: [] },
  },
  { timestamps: true }
);

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
export default Job;
