import { Queue, Worker } from "bullmq";
import { isRedisAvailable } from "./redis";
import prisma from "./database";

let taskQueue: Queue | null = null;
let taskWorker: Worker | null = null;

if (isRedisAvailable) {
  try {
    const connectionOpts = {
      host: "127.0.0.1",
      port: 6379,
    };
    
    taskQueue = new Queue("ai-tasks", { connection: connectionOpts });
    
    taskWorker = new Worker(
      "ai-tasks",
      async (job) => {
        const { taskType, payload } = job.data;
        console.log(`Processing background job ${job.id} of type ${taskType}`);
        return { success: true, payload };
      },
      { connection: connectionOpts }
    );

    taskWorker.on("completed", (job) => {
      console.log(`Job ${job.id} completed successfully.`);
    });

    taskWorker.on("failed", (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });
  } catch (err) {
    console.error("BullMQ Queue setup error:", err);
  }
}

export async function dispatchTask(taskName: string, data: any, fallbackProcessor: () => Promise<any>) {
  if (isRedisAvailable && taskQueue) {
    try {
      const job = await taskQueue.add(taskName, { taskType: taskName, payload: data });
      
      try {
        await prisma.aIUsageLog.create({
          data: {
            userId: data.userId || null,
            action: "AI_TASK_QUEUED",
            details: `Dispatched AI task: ${taskName} (Job ID: ${job.id})`
          }
        });
      } catch (logErr) {
        console.warn("Could not write task queue log:", logErr);
      }

      // Execute processor
      const result = await fallbackProcessor();
      return result;
    } catch (err) {
      console.warn("Queue dispatch warning, running sync processor:", err);
      return await fallbackProcessor();
    }
  } else {
    // Fallback sync execution
    return await fallbackProcessor();
  }
}
