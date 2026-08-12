import { Worker } from "bullmq";
import { connection } from "../configs/redis.config.js";
import { VerifyMail, forgetPasswordMail, PasswordChangeMail, logger } from "../utils/index.js";

import type { ForgetPasswordJobData, PasswordChangeJobData, VerifyEmailJobData } from "../interfaces/index.js"


const worker = new Worker( 'EmailQueue', async ( job ) =>
{
    switch ( job.name )
    {
        case "send-verification-email":
            const { token, userEmail, userName } = job.data as VerifyEmailJobData;
            await VerifyMail( userEmail, token, userName );
            break;
        case "send-forget-password-email":
            const { link, userEmail: email, userName: name } = job.data as ForgetPasswordJobData;
            await forgetPasswordMail( email, name, link );
        case "send-password-change-email":
            const { userEmail: email2, userName: name2 } = job.data as PasswordChangeJobData;
            await PasswordChangeMail( email2, name2 );
            break;
        default:
            logger.warn( `Unknown job name: ${ job.name }` );
            break;
    }

}, { connection, concurrency: 5 } )


worker.on( "completed", ( job ) =>
{
    logger.info( `Email job completed: ${ job.id }` );

} )
worker.on( "failed", ( job, err ) =>
{
    logger.error( `Email job failed: ${ job?.id }`, err );

} )