
import Nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import { logger } from './logger.js';

const transporter = Nodemailer.createTransport( {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL as string,
        pass: process.env.EMAIL_PASSWORD as string
    }
} );

const mailGenerator = new Mailgen( {
    theme: 'default',
    product: {
        name: 'URL Shortener',
        link: 'https://mailgen.js/'
    },
} );

const VerifyMail = async ( userEmail: string, token: string, userName: string, link: string = "" ) =>
{
    const email = {
        body: {
            name: userName,
            intro: 'Welcome to URL Shortener! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with URL Shortener, please verify your email:',
                button: {
                    color: '#22BC66',
                    text: token,
                    link: link
                }
            },
            outro: 'This code will expire in 10 minutes.\nNeed help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };

    const mailOptions = {
        from: process.env.EMAIL as string,
        to: userEmail,
        subject: 'Email Verification',
        html: mailGenerator.generate( email ),
        text: mailGenerator.generatePlaintext( email )
    };
    try
    {
        await transporter.sendMail( mailOptions );
        logger.info( `Email sent to ${ userEmail }` );
    } catch ( error )
    {
        logger.error( `Error sending email to ${ userEmail }: ${ { error: error instanceof Error ? error.message : "Unknown error" } }` );
        throw error instanceof Error ? error : new Error( 'Error sending email' );
    }

}

const PasswordChangeMail = async ( userEmail: string, userName: string ) =>
{
    const email = {
        body: {
            name: userName,
            intro:
                "Your URL Shortener account password has been changed successfully.",
            outro:
                "If you made this change, no further action is required.\n\nIf you did not change your password, your account may be at risk. Please reset your password immediately or contact our support team for assistance.\n\nThanks,\nThe URL Shortener Team",
        },
    }
    const mailOptions = {
        from: process.env.EMAIL as string,
        to: userEmail,
        subject: 'Password Change Notification',
        html: mailGenerator.generate( email ),
        text: mailGenerator.generatePlaintext( email )
    };
    try
    {
        await transporter.sendMail( mailOptions );
        logger.info( `Email sent to ${ userEmail }` );
    } catch ( error )
    {
        logger.error( `Error sending email to ${ userEmail }: ${ { error: error instanceof Error ? error.message : "Unknown error" } }` );
        throw error instanceof Error ? error : new Error( 'Error sending email' );
    }
}


const forgetPasswordMail = async ( userEmail: string, userName: string, link: string ) =>
{

    const email = {
        body: {
            name: userName,
            intro:
                "We received a request to reset the password for your URL Shortener account.",
            action: {
                instructions:
                    "Click the button below to create a new password. If the button doesn't work, you can copy and paste the link into your browser.",
                button: {
                    color: "#FF6B35",
                    text: "Reset Password",
                    link: link,
                },
            },
            outro:
                "This password reset link will expire in 15 minutes.\n\nIf you didn't request a password reset, you can safely ignore this email. Your account will remain secure, and no changes will be made unless you complete the reset process.\n\nIf you need any assistance, simply reply to this email or contact our support team.\n\nThanks,\nThe URL Shortener Team ",
        },
    };

    const mailOptions = {
        from: process.env.EMAIL as string,
        to: userEmail,
        subject: 'Password Reset Notification',
        html: mailGenerator.generate( email ),
        text: mailGenerator.generatePlaintext( email )
    };
    try
    {
        await transporter.sendMail( mailOptions );
        logger.info( `Email sent to ${ userEmail }` );
    } catch ( error )
    {
        logger.error( `Error sending email to ${ userEmail }: ${ { error: error instanceof Error ? error.message : "Unknown error" } }` );
        throw error instanceof Error ? error : new Error( 'Error sending email' );
    }

}

export { VerifyMail, PasswordChangeMail, forgetPasswordMail }