import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { IConfig } from "../core/types/config";
import { event } from "../core/ioc/index";

interface IRedisConfig {
  port: number; // Redis port
  host: String; // Redis host
  family: [4, 6]; // 4 (IPv4) or 6 (IPv6)
  password: "auth";
  db: 0;
}

export class JobQueue {
  private queue: Queue;
  private worker: Worker;
  private workerFunctions: Object = {};

  constructor({ config }: { config: IConfig }) {
    const connection = new IORedis();
    const queueName = config.job.queueName;

    this.queue = new Queue(queueName, { connection });

    this.worker = new Worker(
      queueName,
      async (job) => {
        if (
          this.workerFunctions[job.name] &&
          typeof this.workerFunctions[job.name] === "function"
        ) {
          this.workerFunctions[job.name](...job.data);
        }
        console.log("Processing::job", job.name);
      },
      { connection }
    );
  }

  async addTask(name: string, config: Object) {
    await this.queue.add(name, config);
  }

  async addWorkerFunctions(name: string, worker: Function) {
    this.workerFunctions[name] = worker;
  }
}
