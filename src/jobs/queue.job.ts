
import { Queue } from "bullmq"
import { connection } from "../configs/redis.config.js";

const defaultJobOptions = {
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 5000
    },
    removeOnComplete: true,
    removeOnFail: true
}

const EmailQueue = new Queue( 'EmailQueue', {
    connection,
    defaultJobOptions
} )

export { EmailQueue }