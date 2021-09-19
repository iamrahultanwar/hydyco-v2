export interface IConfig {
  cors: Cors;
  job: Job;
  server: Server;
}
export interface Cors {}
export interface Job {
  enable: boolean;
  queueName: string;
}
export interface Server {
  port: number;
  logger: boolean;
  loggerMode: string;
}
