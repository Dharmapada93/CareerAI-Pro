import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  templateId: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    github?: string;
    linkedin?: string;
    website?: string;
    summary?: string;
  };
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string[];
  }>;
  projects: Array<{
    title: string;
    role: string;
    description: string;
    url?: string;
    technologies: string[];
  }>;
  skills: string[];
  certificates: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled Resume" },
    templateId: { type: String, default: "modern" },
    personalInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
      summary: { type: String, default: "" },
    },
    education: [
      {
        school: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        description: { type: String, default: "" },
      },
    ],
    experience: [
      {
        company: { type: String, required: true },
        position: { type: String, required: true },
        location: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        current: { type: Boolean, default: false },
        description: [{ type: String }],
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        role: { type: String, default: "" },
        description: { type: String, default: "" },
        url: { type: String, default: "" },
        technologies: [{ type: String }],
      },
    ],
    skills: [{ type: String }],
    certificates: [
      {
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        date: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

const Resume: Model<IResume> = mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);
export default Resume;
