import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../lib/database";
import bcrypt from "bcryptjs";

export async function seedDatabase(request: FastifyRequest, reply: FastifyReply) {
  try {
    // 1. Clear existing demo data
    const demoEmail = "admin@careerai.pro";
    
    try {
      await prisma.portfolio.deleteMany({
        where: { slug: "alexdev" },
      });
    } catch (e) {
      // Ignore if not present
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (existingUser) {
      const uId = existingUser.id;
      // Cascade delete is handled by database schemas if defined as cascade.
      // But let's delete manually to be safe and clean.
      await prisma.resume.deleteMany({ where: { userId: uId } });
      await prisma.aTSReport.deleteMany({ where: { userId: uId } });
      await prisma.interviewSession.deleteMany({ where: { userId: uId } });
      await prisma.coverLetter.deleteMany({ where: { userId: uId } });
      await prisma.portfolio.deleteMany({ where: { userId: uId } });
      await prisma.jobApplication.deleteMany({ where: { userId: uId } });
      await prisma.user.delete({ where: { id: uId } });
    }

    // 2. Create hashed password
    const hashedPassword = await bcrypt.hash("password123", 12);

    // 3. Create Admin User
    const adminUser = await prisma.user.create({
      data: {
        name: "Alex Dev",
        email: demoEmail,
        password: hashedPassword,
        role: "admin",
        subscription: "Pro",
      },
    });

    const userId = adminUser.id;

    // 4. Create Resume
    const demoResume = await prisma.resume.create({
      data: {
        userId,
        title: "Senior Full Stack Engineer Resume",
        templateId: "modern",
        personalInfo: {
          name: "Alex Dev",
          email: demoEmail,
          phone: "+1 (555) 0199",
          github: "https://github.com/alexdev",
          linkedin: "https://linkedin.com/in/alexdev",
          website: "https://alexdev.io",
          summary: "Results-oriented Senior Full Stack Engineer with 5+ years of experience constructing scalable React interfaces and Node.js REST APIs. Specialized in Next.js, microservice integrations, and database tuning.",
        },
        skills: ["React", "Next.js 14", "TypeScript", "Node.js", "Express", "FastAPI", "MongoDB", "Mongoose", "Tailwind CSS", "Docker"],
        education: [
          {
            school: "Tech University of California",
            degree: "Bachelor of Science",
            fieldOfStudy: "Computer Science",
            startDate: "2018",
            endDate: "2022",
            description: "Graduated with honors. Specialization in Distributed Database Systems and Interface Design.",
          }
        ],
        experience: [
          {
            company: "CloudSolutions Inc.",
            position: "Full Stack Engineer",
            location: "San Francisco, CA",
            startDate: "June 2022",
            endDate: "Present",
            current: true,
            description: [
              "Architected and deployed responsive client portals using Next.js 14, improving lighthouse SEO scores by 30%.",
              "Designed microservices using FastAPI and Docker, reducing API backend load and cutting request timeouts by 15%.",
              "Optimized MongoDB slow-query indexing strategies, yielding a 40% speedup on dashboard overview aggregations."
            ],
          }
        ],
        projects: [
          {
            title: "E-Commerce Gateway System",
            role: "Lead API Engineer",
            description: "Constructed high-frequency checkout endpoints handling 5,000+ orders/min. Integrated Stripe payments.",
            url: "https://github.com/alexdev/checkout-gateway",
            technologies: ["Node.js", "Express", "MongoDB", "Redis"],
          }
        ],
        certificates: [
          {
            name: "AWS Certified Developer - Associate",
            issuer: "Amazon Web Services",
            date: "Oct 2025",
            url: "https://aws.amazon.com",
          }
        ]
      }
    });

    // 5. Create ATS reports
    await prisma.aTSReport.createMany({
      data: [
        {
          userId,
          resumeId: demoResume.id,
          jobDescription: "Required: Senior Frontend Developer with expertise in Next.js, TypeScript, and Tailwind CSS. Experience in database optimization is a plus.",
          score: 82,
          missingKeywords: ["CI/CD Pipelines", "Jest Testing"],
          formattingSuggestions: ["Consistently align dates to the right-hand margin.", "Ensure page margins do not exceed standard boundaries."],
          skillGapAnalysis: ["No mentions of automated unit tests (Jest/Cypress) or Docker orchestration deployment pipelines on the resume."],
          improvementTips: ["List Docker deployment actions under E-Commerce Gateway project.", "Integrate CI/CD keyword naturally in the CloudSolutions experience bullet points."]
        },
        {
          userId,
          resumeId: demoResume.id,
          jobDescription: "We are looking for a Software Architect who has built checkout gateways and handles high load environments. Requires Node.js and MongoDB tuning.",
          score: 91,
          missingKeywords: ["System Architecture"],
          formattingSuggestions: ["Classic clean format, looks excellent."],
          skillGapAnalysis: ["The resume features excellent checkout gateway details and MongoDB indexing optimizations."],
          improvementTips: ["Add 'System Architecture' role description to checkout gateway title."]
        }
      ]
    });

    // 6. Create completed Interview session
    await prisma.interviewSession.create({
      data: {
        userId,
        role: "Full Stack Developer",
        experienceLevel: "Mid-Level",
        status: "completed",
        questions: [
          {
            question: "Explain the difference between Server and Client Components in Next.js 14 App Router.",
            answer: "Server components are processed on the server to reduce bundle sizes, while Client components are rendered on the browser to support interactivity like hooks.",
            feedback: "Great summary. You detailed the differences in compilation locations and package sizes. Adding details about hydration would make it perfect.",
            scores: { technical: 88, communication: 90, confidence: 85 },
            improvedAnswer: "Next.js Server Components render exclusively on the server, minimizing the client bundle size and allowing secure database calls. Client Components undergo pre-rendering on the server but hydrate on the browser, which allows using React hooks (useState, useEffect) and window APIs."
          },
          {
            question: "How does MongoDB handle indexing, and what strategies would you use to optimize a slow find() query?",
            answer: "MongoDB uses B-Trees for indexes. I would create single-field or compound indexes and check query plans using explain().",
            feedback: "Excellent technical explanation. Good mention of B-Trees and explain() plan checks.",
            scores: { technical: 92, communication: 88, confidence: 90 },
            improvedAnswer: "MongoDB queries use B-Tree indexes to perform index scans rather than collection scans. To optimize slow queries, verify usage with .explain('executionStats'), index fields matched in filters, use compound indexes ordered by Equality, Sort, and Range rule, and project only necessary fields."
          }
        ],
        overallScores: {
          technical: 90,
          communication: 89,
          confidence: 87,
        },
        overallFeedback: "Exceptional performance. You displayed clear technical depth, accurate vocabulary, and confidently structured explanations.",
      }
    });

    // 7. Create Cover Letter
    await prisma.coverLetter.create({
      data: {
        userId,
        companyName: "Stripe",
        role: "Backend Engineer",
        content: `Dear Hiring Team at Stripe,
 
I am writing to express my strong interest in the Backend Engineer position at Stripe. With over 5 years of software development experience and a strong background in gateway payment systems, I am confident in my ability to contribute to Stripe's developer-focused infrastructure.
 
My background includes building scalable backend gateways supporting 5,000+ orders/min using Node.js and MongoDB. I focus on writing clean, self-documenting code and tuning database queries for fast response times. I am highly excited about Stripe's developer first culture and global scale.
 
Thank you for your time and consideration.
 
Sincerely,
Alex Dev`,
      }
    });

    // 8. Create Portfolio
    await prisma.portfolio.create({
      data: {
        userId,
        slug: "alexdev",
        theme: "dark",
        isPublished: true,
        content: {
          heroTitle: "Hi, I'm Alex Dev",
          heroSubtitle: "Building premium Next.js applications and scaling high-load Node.js backend systems.",
          aboutMe: "I am a Full Stack Engineer focused on clean architecture, performance tuning, and interactive user experiences. I specialize in the React ecosystem, TypeScript, FastAPI microservices, and MongoDB optimization.",
          projectSubtitles: {
            "E-Commerce Gateway System": "Designed high-frequency checkout engines handling thousands of orders per minute."
          }
        }
      }
    });

    return reply.status(200).send({
      message: "Database seeded successfully!",
      demoCredentials: {
        email: demoEmail,
        password: "password123",
        role: "admin",
      },
      apiSeedEndpoint: "/api/seed",
    });
  } catch (error: any) {
    console.error("Database seeding error:", error);
    return reply.status(500).send({ error: "Seeding failed", details: error.message });
  }
}
