import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId;
  slug: string;
  theme: string;
  content: {
    heroTitle: string;
    heroSubtitle: string;
    aboutMe: string;
    projectSubtitles: Record<string, string>;
  };
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PortfolioSchema = new Schema<IPortfolio>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slug: { type: String, required: true, unique: true },
    theme: { type: String, default: "dark" },
    content: {
      heroTitle: { type: String, required: true },
      heroSubtitle: { type: String, required: true },
      aboutMe: { type: String, required: true },
      projectSubtitles: { type: Map, of: String, default: {} },
    },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Portfolio: Model<IPortfolio> =
  mongoose.models.Portfolio || mongoose.model<IPortfolio>("Portfolio", PortfolioSchema);
export default Portfolio;
