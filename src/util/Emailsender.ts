import * as dotenv from "dotenv";
import * as nodemailer  from 'nodemailer';
export class EmailSender {

  public transporter: any;
  public emailFrom: any;

  /***
   * @summary: This function is use for setup the email Transporter
   *
   */
  private setupTransporter() {
    dotenv.config();
    this.emailFrom = '"Konnect Platform" <updates@konnect.events>'; //  process.env.EMAIL_FROM;
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // 
        pass: process.env.EMAIL_PASS, // 
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }



  /***
   * @summary: This function is use for send email to any users 
   * @param: to
   * @param: sub
   * @param: msg
   */
  public sendEmail(to: string, sub: string, msg: string) {
    // return; // return due to smtp wrong credentials
    this.setupTransporter();
    this.transporter.sendMail({
      from: this.emailFrom, // sender address
      to: to, // list of receivers
      subject: sub, // Subject line
      // text: "Hello world?", // plain text body
      html: msg, // html body
    });
  }



}
