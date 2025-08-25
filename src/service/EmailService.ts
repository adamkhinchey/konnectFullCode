import {
  getFileAsString,
  isValidString,
  to,
  replaceEmailTemplateData,
  parseQueryResponse,
} from "../util/helper";
import { EmailSender } from "../util/Emailsender";
import * as dotenv from "dotenv";
import { CONSTANTS } from "../util/SiteConfig";
import { commonDao } from "../daos/commonDao";
import { CompanyDao } from "../daos/CompanyDao";
import { UserMgmtDao } from "../daos/UserMgmtDao";
import { getConnection } from "../util/DBManager";
var moment = require("moment");

dotenv.config();

const tamplatebaseUrl: any = process.env.EMAIL_BASE_TEMPLATE_URL;
/**
 * send email for forgot password link
 * @param template
 * @param data
 */
export const sendResetPaawordLinkEmail = async (template: any, data: any) => {
  const emailSender = new EmailSender();
  try {
    let emailTemplate: string = await getFileAsString(tamplatebaseUrl);

    if (emailTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    emailTemplate = emailTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.to, template.subject, emailTemplate);
  } catch (err) {}
};

/**
 * NOTIFICATION 005
 * send email on creating new company
 *  * @param data
 */
export const sendEmailOnCreateNewCompany = async (data: any) => {
  //email:result.email,userName: result.userName,
  // let is_verified = data.is_verified;
  const emailSender = new EmailSender();
  try {
    let user: any = await new UserMgmtDao().getUserById(data.userId);
    if (!user) return;
    data.email = user.email;
    data.userName = user.firstName;

    let cmp_profile: any;
    cmp_profile = await new CompanyDao().getCompanyById(data.companyId);

    if (!cmp_profile[0][0] && !cmp_profile[0][0].company_name) {
      return;
    }

    data.CompanyName = cmp_profile[0][0].company_name;

    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_005_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
    // send email to user if first company created
    if (data.companyCount && data.companyCount == 1) {
      if (
        !user.email_verification_token ||
        user.email_verification_token == null ||
        user.email_verification_token == "null" ||
        user.email_verification_token == undefined
      ) {
        user.email_verification_token =
          await new UserMgmtDao().saveEmailVerificationToken(user.id);
      }
      let kipData = {
        EmailAdress: data.email,
        email: data.email,
        userName: data.userName,
        KonnectSiteURL: data.KonnectSiteURL,
        KonnectVerificationURL:
          data.KonnectSiteURL +
          "/verify-email?token=" +
          user.email_verification_token,
      };
      // console.log("is_verified && ", is_verified);
     
        await sendEmailOnCreateNewAccount(kipData); // this will go only for private user first time
      
    }
  } catch (err) {}
};

/**
 * TODO ---need to check
 * NOTIFICATION 000
 * send email on creating new account
 *  * @param data
 */
/*export const sendEmailOnCreateNewAccount = async (data: any) => {
    //email:result.email,userName: result.userName,
    const emailSender = new EmailSender();
    try {
      let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
      let template = await new commonDao().getEmailTemplateById(
        CONSTANTS.NOTIFICATION_TEMPLATE_000_ID
      );

      if (baseTemplate == "null") return;
      let htmlBodyContent = replaceEmailTemplateData(template.content, data);
      baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

      emailSender.sendEmail(data.email, template.subject, baseTemplate);
    } catch (err) {}
  };*/

export const sendEmailOnCreateNewAccount = async (data: any) => {
  //email:result.email,userName: result.userName,
  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_020_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);
    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
 * NOTIFICATION 002
 * send email on claim KCP to claiming user
 *  * @param data
 */
export const sendEmailOnClaim = async (data: any) => {
  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_002_ID
    );

    if (baseTemplate == "null") return;
    let user: any = await new UserMgmtDao().getUserById(data.userId);
    if (!user) return;
    if (
      !user.email_verification_token ||
      user.email_verification_token == null ||
      user.email_verification_token == "null" ||
      user.email_verification_token == undefined
    ) {
      user.email_verification_token =
        await new UserMgmtDao().saveEmailVerificationToken(user.id);
    }
    let kipData = {
      EmailAdress: data.email,
      email: data.email,
      userName: data.userName,
      KonnectSiteURL: data.KonnectSiteURL,
      KonnectVerificationURL:
        data.KonnectSiteURL +
        "/verify-email?token=" +
        user.email_verification_token,
    };
 
      await sendEmailOnCreateNewAccount(kipData);
    

    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
 * NOTIFICATION 003
 * NOTIFICATION 010
 * send email on join request to request user and kcp admins
 *  * @param data
 */
export const sendEmailOnJoinRequest = async (data: any) => {
  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_003_ID
    );
    if (baseTemplate == "null" || !template) return;
    let user: any = await new UserMgmtDao().getUserById(data.userId);
    if (!user) return;

    if (
      !user.email_verification_token ||
      user.email_verification_token == null ||
      user.email_verification_token == "null" ||
      user.email_verification_token == undefined
    ) {
      user.email_verification_token =
        await new UserMgmtDao().saveEmailVerificationToken(user.id);
    }

    // send email to user if first company created

    let kipData = {
      EmailAdress: data.email,
      email: data.email,
      userName: data.userName,
      KonnectSiteURL: data.KonnectSiteURL,
      KonnectVerificationURL:
        data.KonnectSiteURL +
        "/verify-email?token=" +
        user.email_verification_token,
    };
  
      await sendEmailOnCreateNewAccount(kipData);
    

    //send email to company admins
    let companyAdmins: any;
    companyAdmins = await new UserMgmtDao().getCompanyAdminUsersByCompanyId(
      data.companyId
    );

    if (
      !companyAdmins ||
      !(companyAdmins.length > 0) ||
      !(companyAdmins[0].length > 0)
    )
      return;

    let emailTemplateAdmin = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_010_ID
    );

    for (let i = 0; i < companyAdmins[0].length; i++) {
      let dataAdmin = {
        email: companyAdmins[0][i].email,
        userName: companyAdmins[0][i].firstName,
        CompanyName: data.CompanyName,
        KonnectSiteURL: process.env.SITE_URL,
      };
      let htmlBodyContentAdmin = replaceEmailTemplateData(
        emailTemplateAdmin.content,
        dataAdmin
      );
      let adminContent = baseTemplate.replace(
        /{{bodyContent}}/g,
        htmlBodyContentAdmin
      );

      emailSender.sendEmail(
        dataAdmin.email,
        emailTemplateAdmin.subject,
        adminContent
      );
    }
  } catch (err) {}
};

/**
 * Invite colleague
 * <h2>Hi {Name},</h2><p>{AdminName} would like to invite you to join the company, {CompanyName} on the Konnect Platform to assist manage and deliver events.<br/>To accept the invite and create a profile use the URL below:<br/> <a href="{VerificationUrl}">{VerificationUrl}</a> </p>
 */
export const inviteCompanyColleague = async (data: any) => {
  let email;

  let user: any;

  user = await new UserMgmtDao().getUserById(data.user_id);

  let cmp_admin: any;
  cmp_admin = await new UserMgmtDao().getUserById(data.admin_id);

  let cmp_profile: any;
  cmp_profile = await new CompanyDao().getCompanyById(data.companyId);

  let emailTemplate = await new commonDao().getEmailTemplateById(
    CONSTANTS.NOTIFICATION_INVITE_COLLEAGUE
  );

  if (!user || !cmp_admin || !cmp_profile[0][0]) {
    return;
  }

  data = {
    Name: user.firstName,
    AdminName: cmp_admin.firstName,
    CompanyName: cmp_profile[0][0].company_name,
    VerificationUrl:
      process.env.SITE_URL + "/create-konnect-profile?uid=" + data.UID,
    email: user.email,
  };

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_INVITE_COLLEAGUE
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
 * NOTIFICATION 000
 * <h2>Hi {userName},</h2> <br/> <p>You have created a user in Konnect platform. Remember that your username is <b>{EmailAdress}</b>. To continue using the platform please login in  <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>.</p>
 */
export const sendNotification_000 = async (data: any) => {
  let email;

  let userData = await new UserMgmtDao().getUserById(data.user_id);

  if (!userData) {
    return;
  }

  let redirect_url = data.pri_user_uuid
    ? process.env.SITE_URL + "/create-konnect-profile?uid=" + data.pri_user_uuid
    : process.env.SITE_URL;

  email = userData.email;

  data = {
    userName: userData.firstName,
    EmailAdress: email,
    KonnectSiteURL: redirect_url,
    email: email,
  };

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_000_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
   * NOTIFICATION 002
   * <h2>Hi {userName},</h2><p><br/><br/>
   Congratulations! You’re have claimed the Company <b> {CompanyName} </b>. Please
   login with your access and to start managing your Company.</p>
   */
export const sendNotification_002 = async (data: any) => {
  let email;

  let userData = await new UserMgmtDao().getUserById(data.user_id);
  let companyData = await new CompanyDao().getCompanyById(data.company_id);

  if (!userData || !companyData[0][0] || companyData[0][0].length < 1) {
    return;
  }

  email = userData.email;

  data = {
    userName: userData.firstName,
    CompanyName: companyData[0][0].company_name,
    email: email,
    KonnectSiteURL: process.env.SITE_URL,
  };

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_002_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
   * NOTIFICATION 003
   * <h2>Hi {userName},</h2><p><br/><br/>
   Congratulations! You are part of the Company <b>{CompanyName}</b>. Please login with
   your access and to start creating events.
   Please see more details accessing to  <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>.</p>
   */
export const sendNotification_003 = async (data: any) => {
  let email;

  let userData = await new UserMgmtDao().getUserById(data.user_id);
  let companyData = await new CompanyDao().getCompanyById(data.company_id);

  if (!userData || !companyData[0][0] || companyData[0][0].length < 1) {
    return;
  }

  email = userData.email;

  data = {
    userName: userData.firstName,
    CompanyName: companyData[0][0].company_name,
    KonnectSiteURL: process.env.SITE_URL,
    email: email,
  };

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_003_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
 * NOTIFICATION 004
 * <h2>Hi {userName},</h2><p> Unfortunately, the Company owner did not accept your request to be part of the Company {CompanyName}. You can try creating your own company or joining another. Thanks.</p>
 */
export const sendNotification_004 = async (data: any) => {
  let email;

  let userData = await new UserMgmtDao().getUserById(data.user_id);
  let companyData = await new CompanyDao().getCompanyById(data.company_id);

  if (!userData || !companyData[0][0] || companyData[0][0].length < 1) {
    return;
  }

  email = userData.email;

  data = {
    userName: userData.firstName,
    CompanyName: companyData[0][0].company_name,
    email: email,
    KonnectSiteURL: process.env.SITE_URL,
  };

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_004_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
   * NOTIFICATION 005
   * <h2>Hi {userName},</h2><p> <br/>
   Congratulations! You have created a new Company called <b>{CompanyName}</b>.
   Please login with your access and to start managing your new Company.
   Please see more details accessing to  <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>
   </p>
   */
export const sendNotification_005 = async (data: any) => {
  let email;

  let userData = await new UserMgmtDao().getUserById(data.user_id);
  let companyData = await new CompanyDao().getCompanyById(data.company_id);

  if (!userData || !companyData[0][0] || companyData[0][0].length < 1) {
    return;
  }

  email = userData.email;

  data = {
    userName: userData.firstName,
    CompanyName: companyData[0][0].company_name,
    KonnectSiteURL: process.env.SITE_URL,
    email: email,
  };

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_005_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

// 6 7 8 11 12 13 14

/**
   * NOTIFICATION 006
   * (Can be Client, Event Manager, Venue, Supplier, Exhibitor).
   * <h2> Hi {username},</h2><p>
      Your Company {CompanyName} have been invited to the event {EventName} on
      {EventDate} as {EventFunction}.
      Please check your Dashboard to accept the invitation.
      Please see more details accessing to <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>
      </p>
   */
export const sendNotification_006 = async (data: any) => {
  let email;

  let userData = await new UserMgmtDao().getUserById(data.user_id);
  let companyData = await new CompanyDao().getCompanyById(data.company_id);
  let eventData = await new UserMgmtDao().getUserEvent(
    data.user_id,
    data.event_id
  );

  email = userData.email;

  if (
    !userData ||
    !companyData[0][0] ||
    !eventData[0][0] ||
    companyData[0][0].length < 1 ||
    eventData[0][0].length < 1 ||
    !email
  ) {
    return;
  }

  let startDateTime = eventData[0][0].startDateTime
    ? formatDate(eventData[0][0].startDateTime)
    : "";

  data = {
    username: userData.firstName,
    CompanyName: companyData[0][0].company_name,
    EventName: eventData[0][0].title,
    EventDate: startDateTime,
    EventFunction: eventData[0][0].contactType,
    KonnectSiteURL: process.env.SITE_URL,
    email: email,
  };
  console.log("data ** ", data);
  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_006_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [day, month, year].join("-");
}

/**
   * NOTIFICATION 007
   *
   * old
   *   <h2>Hi {username},</h2><p>
   Congratulations! Your {CompanyName} is part of the Event {EventName} on
   {EventDate} as {EventFunction} (Can be Client, Event Manager, Venue, Supplier,
   Exhibitor).
   Please see more details accessing to {KonnectSiteURL}</p>

    new =>

   <h2>Hi {username},</h2><p><br />{userSendingInviteFirstName} is inviting you to join the company, <b>{CompanyName}</b> on the Konnect Platform to help manage event delivery. You will need to create a user profile first.<br />To start collaborating and delivering events with industry peers, login at <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>. </p>
   *
   */

export const sendNotification_007 = async (data: any) => {
  let email;

  let userData = await new UserMgmtDao().getUserById(data.user_id);
  let companyData = await new CompanyDao().getCompanyById(data.company_id);
  // let eventData = await new UserMgmtDao().getUserEvent(
  //   data.user_id,
  //   data.event_id
  // );
  let loginUser = await new UserMgmtDao().getUserById(data.loginUserId);
  // let evntbyid = await new UserMgmtDao().getEventById(data.event_id);

  email = userData.email;

  if (
    !userData ||
    !loginUser ||
    !companyData[0][0] ||
    // !eventData[0][0] ||
    companyData[0][0].length < 1 ||
    // eventData[0][0].length < 1 ||
    !email
  ) {
    return;
  }

  let redirect_url = data.pri_user_uuid
    ? process.env.SITE_URL + "/create-konnect-profile?uid=" + data.pri_user_uuid
    : process.env.SITE_URL;
  /*
    let startDateTime = eventData[0][0].startDateTime
      ? formatDate(eventData[0][0].startDateTime)
      : "";
    data = {
      username: userData.firstName,
      CompanyName: companyData[0][0].company_name,
      EventName: eventData[0][0].title,
      EventDate: startDateTime,
      EventFunction: eventData[0][0].contactType,
      KonnectSiteURL: redirect_url,
      email: email,
      userSendingInviteFirstName: evntbyid[0][0].first_name
    };

*/
  data = {
    username: userData.firstName,
    CompanyName: companyData[0][0].company_name,
    KonnectSiteURL: redirect_url,
    email: email,
    userSendingInviteFirstName: loginUser.firstName, // evntbyid[0][0].first_name
  };

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_007_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
   * NOTIFICATION 008
   *
   *
   *
   * old
  <h2>Hi {username},</h2><p>
  Congratulations! The {CompanyName} that you’ve invited, is part of the Event
  {EventName} on {EventDate} as {EventFunction} (Can be Client, Event Manager,
  Venue, Supplier, Exhibitor).
  Please see more details accessing to {KonnectSiteURL}
  </p>

  new

  <h2>Hi {username},</h2><p><br/>{userSendingInviteFirstName} is inviting you to join the company, <b>{CompanyName}</b> on the Konnect Platform to help manage event delivery. <br/>To start collaborating and delivering events with industry peers, login at  <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>.

   *
   */

export const sendNotification_008 = async (data: any) => {
  let email;
  // console.log("data ** ", data);
  let userData = await new UserMgmtDao().getUserById(data.user_id);
  let companyData = await new CompanyDao().getCompanyById(data.company_id);
  let loginUser = await new UserMgmtDao().getUserById(data.loginUserId);
  // let eventData = await new UserMgmtDao().getUserEvent(
  //   data.user_id,
  //   data.event_id
  // );

  email = userData.email;

  if (
    !userData ||
    !loginUser ||
    !companyData[0][0] ||
    // !eventData[0][0] ||
    companyData[0][0].length < 1 ||
    // eventData[0][0].length < 1 ||
    !email
  ) {
    return;
  }

  // let startDateTime = eventData[0][0].startDateTime
  //   ? formatDate(eventData[0][0].startDateTime)
  //   : "";

  // data = {
  //   username: userData.firstName,
  //   CompanyName: companyData[0][0].company_name,
  //   EventName: eventData[0][0].title,
  //   EventDate: startDateTime,
  //   EventFunction: eventData[0][0].contactType,
  //   KonnectSiteURL: process.env.SITE_URL,
  //   email: email,
  //   userSendingInviteFirstName: eventData[0][0].creatorFirstName
  // };
  data = {
    username: userData.firstName,
    CompanyName: companyData[0][0].company_name,
    KonnectSiteURL: process.env.SITE_URL,
    email: email,
    userSendingInviteFirstName: loginUser.firstName, //  eventData[0][0].creatorFirstName
  };

  console.log("008 data ", data);
  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_008_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);
    // console.log("data.email, template.subject, baseTemplate ", data.email, template.subject, baseTemplate);
    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
   * NOTIFICATION 010
   *
  <h2>Hi {userName},</h2><p>
   A user wants to join your Company {CompanyName}.
   Please see more details accessing to <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>.</p>
   *
   */

export const sendNotification_010 = async (data: any) => {
  let companyAdmins = await new CompanyDao().getCompanyAdmins(data.company_id);
  console.log("comapny admins...", companyAdmins);
  if (
    companyAdmins &&
    companyAdmins[0] &&
    companyAdmins[0][0] &&
    companyAdmins[0][0].email
  ) {
    for (let i = 0; i < companyAdmins[0].length; i++) {
      let admin = companyAdmins[0][i];
      if (admin.is_verified) {
        data = {
          userName: admin.first_name,
          CompanyName: admin.company_name,
          KonnectSiteURL: process.env.SITE_URL,
          email: admin.email,
        };

        const emailSender = new EmailSender();
        try {
          let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
          let template = await new commonDao().getEmailTemplateById(
            CONSTANTS.NOTIFICATION_TEMPLATE_010_ID
          );

          if (baseTemplate == "null") return;
          let htmlBodyContent = replaceEmailTemplateData(
            template.content,
            data
          );
          baseTemplate = baseTemplate.replace(
            /{{bodyContent}}/g,
            htmlBodyContent
          );
          console.log("baseTemplate notification 10....", baseTemplate);
          emailSender.sendEmail(data.email, template.subject, baseTemplate);
        } catch (err) {}
      }
    }
  }
};

/**
   * NOTIFICATION 011
   *
  <h2>Hi {username},</h2><p>
    You were added as a contact of the Event {EventName} under the Company
    {CompanyName}.
    Please see more details accessing to <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>.</p>

   *
   */

export const sendNotification_011 = async (data: any) => {
  let email;
  // console.log("hello *** ", data);
  let userData = await new UserMgmtDao().getUserById(data.user_id);
  let companyData = await new CompanyDao().getCompanyById(data.company_id);
  let eventData = await new UserMgmtDao().getUserEvent(
    data.user_id,
    data.event_id
  );
  // console.log("userData *** ", userData);
  // console.log("companyData *** ", companyData);
  // console.log("eventData *** ", eventData);

  let evntbyid = await new UserMgmtDao().getEventById(data.event_id);

  email = userData.email;
  // console.log("condition ",  !userData ,
  // !companyData[0][0] ,
  // !eventData[0][0] ,
  // companyData[0][0].length < 1 ,
  // eventData[0][0].length < 1 ,
  // !email);
  if (
    !userData ||
    !companyData[0][0] ||
    !eventData[0][0] ||
    companyData[0][0].length < 1 ||
    eventData[0][0].length < 1 ||
    !email
  ) {
    return;
  }

  let startDateTime = eventData[0][0].startDateTime
    ? formatDate(eventData[0][0].startDateTime)
    : "";

  data = {
    username: userData.firstName,
    CompanyName: companyData[0][0].company_name,
    EventName: eventData[0][0].title,
    KonnectSiteURL: process.env.SITE_URL,
    email: email,
    dashboardEventDate: evntbyid[0][0].startDateTime
      ? moment(evntbyid[0][0].startDateTime).format("D MMMM")
      : "TBC",
  };

  // console.log("data noti 11 -------------- ", data);

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_011_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
   * NOTIFICATION 012
   *
  <h2>Hi {username},</h2><p>
   The Company {CompanyName} wants you to be part of the Event {EventName},
   however, you’ll need to create an account first.
   Please see more details accessing to <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>.
   Thanks</p>

   *
   */

export const sendNotification_012 = async (data: any) => {
  console.log('initial user data...', data);
  let email;

  let userData = await new UserMgmtDao().getUserById(data.user_id);
  let companyData = await new CompanyDao().getCompanyById(data.company_id);
  let eventData = await new UserMgmtDao().getEventById(data.event_id);
  console.log("userData...", userData);
  console.log("companyData...", companyData);
  console.log("eventData...", eventData);
  email = userData.email;
  if (
    !userData ||
    !companyData[0][0] ||
    !eventData[0][0] ||
    companyData[0][0].length < 1 ||
    eventData[0][0].length < 1 ||
    !email
  ) {
    return;
  }

  let redirect_url = data.pri_user_uuid
    ? process.env.SITE_URL + "/create-konnect-profile?uid=" + data.pri_user_uuid
    : process.env.SITE_URL;
  console.log(
    "start date time...",
    eventData[0][0].startDateTime
      ? moment(eventData[0][0].startDateTime).format("D MMMM")
      : "TBC"
  );
  data = {
    username: userData.firstName,
    CompanyName: companyData[0][0].company_name,
    EventName: eventData[0][0].title,
    KonnectSiteURL: redirect_url, // process.env.SITE_URL,
    email: email,
    dashboardEventDate: eventData[0][0].startDateTime
      ? moment(eventData[0][0].startDateTime).format("D MMMM")
      : "TBC",
  };

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_012_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);
    console.log("baseTemplate...", baseTemplate);
    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
   * NOTIFICATION 016
   *
<h2>Hi {username},</h2><p><br/>{userSendingInviteFirstName} from <b>{CompanyName}</b> is inviting you to join the Konnect Platform to help deliver the event <b>{EventName}</b> on {dashboardEventDate},  however you’ll need to create a profile on the Konnect Platform.<br/>To start collaborating and delivering events with industry peers, create a profile at <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>.</p>

   *
   */

export const sendNotification_016 = async (data: any) => {
  let email;

  // console.log(" notification 16  data ** ", data);

  let userData = await new UserMgmtDao().getUserById(data.user_id);
  // let companyData = await new CompanyDao().getCompanyById(data.company_id);
  // let eventData = await new UserMgmtDao().getEventById(data.event_id);
  let eventData = await new UserMgmtDao().getUserEvent(
    data.user_id,
    data.event_id
  );

  email = userData.email;

  if (
    !userData ||
    // !companyData[0][0] ||
    !eventData[0][0] ||
    // companyData[0][0].length < 1 ||
    eventData[0][0].length < 1 ||
    !email
  ) {
    return;
  }

  let redirect_url = data.pri_user_uuid
    ? process.env.SITE_URL + "/create-konnect-profile?uid=" + data.pri_user_uuid
    : process.env.SITE_URL;

  data = {
    username: userData.firstName,
    CompanyName: eventData[0][0].creatorCompanyName, // companyData[0][0].company_name,
    EventName: eventData[0][0].title,
    KonnectSiteURL: redirect_url, // process.env.SITE_URL,
    email: email,
    dashboardEventDate: eventData[0][0].startDateTime
      ? moment(eventData[0][0].startDateTime).format("D MMMM")
      : "TBC",
    userSendingInviteFirstName: eventData[0][0].creatorFirstName,
  };

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_016_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
   * NOTIFICATION 013
   *
  <h2>Hi {username},</h2><p>
   You were added as a part of the crew for the Event {EventName} under the
   Company {CompanyName}.
   Please see more details accessing to <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>.
   Thanks</p>

   *
   */

export const sendNotification_013 = async (data: any) => {
  let email;

  let userData = await new UserMgmtDao().getUserById(data.user_id);
  let companyData = await new CompanyDao().getCompanyById(data.company_id);
  let eventData = await new UserMgmtDao().getEventById(data.event_id);

  email = userData.email;

  if (
    !userData ||
    !companyData[0][0] ||
    !eventData[0][0] ||
    companyData[0][0].length < 1 ||
    eventData[0][0].length < 1 ||
    !email
  ) {
    return;
  }

  data = {
    username: userData.firstName,
    CompanyName: companyData[0][0].company_name,
    EventName: eventData[0][0].title,
    KonnectSiteURL: process.env.SITE_URL,
    email: email,
    dashboardEventDate: eventData[0][0].startDateTime
      ? moment(eventData[0][0].startDateTime).format("D MMMM")
      : "TBC",
  };

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_013_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

/**
   * NOTIFICATION 014
   *
  <h2>Hi {username},</h2><p>
   The Company {CompanyName} wants you to be part of crew for the Event
   {EventName}, however, you’ll need to create an account first.
   Please see more details accessing to <a href="{KonnectSiteURL}">{KonnectSiteURL}</a>.</p>

   *
   */

export const sendNotification_014 = async (data: any) => {
  let email;

  let userData = await new UserMgmtDao().getUserById(data.user_id);
  let companyData = await new CompanyDao().getCompanyById(data.company_id);
  let eventData = await new UserMgmtDao().getEventById(data.event_id);

  email = userData.email;

  if (
    !userData ||
    !companyData[0][0] ||
    !eventData[0][0] ||
    companyData[0][0].length < 1 ||
    eventData[0][0].length < 1 ||
    !email
  ) {
    return;
  }

  data = {
    username: userData.firstName,
    CompanyName: companyData[0][0].company_name,
    EventName: eventData[0][0].title,
    KonnectSiteURL: process.env.SITE_URL,
    email: email,
    dashboardEventDate: eventData[0][0].startDateTime
      ? moment(eventData[0][0].startDateTime).format("D MMMM")
      : "TBC",
  };

  const emailSender = new EmailSender();
  try {
    let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
    let template = await new commonDao().getEmailTemplateById(
      CONSTANTS.NOTIFICATION_TEMPLATE_014_ID
    );

    if (baseTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);

    emailSender.sendEmail(data.email, template.subject, baseTemplate);
  } catch (err) {}
};

export const sendGeneralEmail = async (data: any) => {
  let template = data.emailTemplate;
  const emailSender = new EmailSender();
  try {
    console.log("tamplatebaseUrl ", tamplatebaseUrl);
    let emailTemplate: string = await getFileAsString(tamplatebaseUrl);
    console.log("emailTemplate *** ", emailTemplate);
    if (emailTemplate == "null") return;
    let htmlBodyContent = replaceEmailTemplateData(template.content, data);
    emailTemplate = emailTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);
    // console.log(emailTemplate);
    emailSender.sendEmail(data.to, template.subject, emailTemplate);
  } catch (err) {
    console.log("err ", err);
  }
};

export const sendEventNotification = async (
  invitedClient: any,
  contact: any,
  eventId: number,
  tabName: string,
  companyId: number
) => {
  // notificationNo - email notification number which will be sent
  console.log("send notification ** ", invitedClient);

  // return;
  // test ******************
  /*
sendNotification_007({
  user_id: 19,
  company_id: 13,
  event_id: 12,
  pri_user_uuid: "123",
});

sendNotification_011({
  user_id: 19,
  company_id: 13,
  event_id: 12,
});

sendNotification_012({
  user_id: 19,
  company_id: 13,
  event_id: 12,
});

sendNotification_013({
  user_id: 19,
  company_id: 13,
  event_id: 12,
});

sendNotification_014({
  user_id: 19,
  company_id: 13,
  event_id: 12,
});

*/
  // test ***********

  let pri_user_uuid = "";
  if ((invitedClient && invitedClient.isNewUser) || contact.isNewUser) {
    pri_user_uuid = contact.useruuid ? contact.useruuid : contact.user_uuid;
  }

  if (!companyId && invitedClient) {
    companyId = invitedClient.companyId;
  } else if (!companyId && contact) {
    companyId = contact.companyId;
  }
  //  return;

  if (!companyId) {
    return;
  }

  // console.log("invitedClient ** ", invitedClient);
  // console.log("contact ** ", contact);
  // console.log("eventId * ", eventId);
  // console.log("tabName ** ", tabName);
  // console.log(" companyId ", companyId);

  if (
    tabName == "event_manager" ||
    tabName == "client" ||
    tabName == "venue" ||
    tabName == "supplier" ||
    tabName == "exhibitor"
  ) {
    /* // commented on 25-08-21 as not used now

      if (invitedClient && contact && invitedClient && contact && invitedClient.userId == contact.userId) {
        // 1. notification 006 - event manager creates pkip or pkcp - notification to the pkip user
        if (invitedClient.isNewCompany && invitedClient.isNewUser) {
          console.log("abc email ");

          // commented on 04-08-21  as not needed according to client requirement
          // sendNotification_006({
          //   user_id: contact.userId,
          //   company_id: companyId,
          //   event_id: eventId,
          // }); // commentd on 29-04-21 as not required according to client

          // sendNotification_005({
          //   user_id: contact.userId,
          //   company_id: companyId,
          // });

          // in case of new company notificaiton 000 will not be sent
          // sendNotification_000({
          //   user_id: contact.userId,
          //   pri_user_uuid: pri_user_uuid,
          // });
          // sendNotification_012({
          //   user_id: contact.userId,
          //   company_id: companyId,
          //   event_id: eventId,
          // });


          // sendNotification_010({ "company_id": companyId}); // 010 will not go as this user is creator
        } else if (invitedClient && invitedClient.isNewUser) {
          // 2. notification 007 - event manager creates pkip to join existing KCP
           // notification 007 will not go on event createion as in client feedback 13-08-21
          // sendNotification_007({
          //   user_id: contact.userId,
          //   company_id: companyId,
          //   event_id: eventId,
          //   pri_user_uuid: pri_user_uuid,
          // }); // commentd on 29-04-21 as not required according to client

          sendNotification_010({ company_id: companyId });
          // create mail will not go on event contact
          // sendNotification_000({
          //   user_id: contact.userId,
          //   pri_user_uuid: pri_user_uuid,
          // });
        } else {
          // send notification 2 or 3

          // notification 008 does not go on event createion as in client feedback 13-08-21
          // sendNotification_008({"user_id": contact.userId, "company_id": companyId, "event_id": eventId});  // commentd on 29-04-21 as not required according to client
          // sendNotification_010({ company_id: companyId });   // notification 10 will only go for new user , commented on  25 -08 - 21
        }
      } else if (contact) {
        if (contact.isNewUser) {
          // 2. notification 007 - event manager creates pkip to join existing KCP

           // notification 007 will not go on event createion as in client feedback 13-08-21
          // sendNotification_007({
          //   user_id: contact.userId,
          //   company_id: companyId,
          //   event_id: eventId,
          //   pri_user_uuid: pri_user_uuid,
          // }); // commentd on 29-04-21 as not required according to client

          console.log("notification 7");
          sendNotification_010({ company_id: companyId });
          // sendNotification_000({
          //   user_id: contact.userId,
          //   pri_user_uuid: pri_user_uuid,
          // });
        } else {
          console.log("in 008 and 010");
           // notification 008 does not go on event createion as in client feedback 13-08-21
          // sendNotification_008({
          //   user_id: contact.userId,
          //   company_id: companyId,
          //   event_id: eventId,
          // }); // commentd on 29-04-21 as not required according to client

          console.log("notification 8");
          // sendNotification_010({ company_id: companyId });  // notification 10 will only go for new user , commented on  25 -08 - 21
        }
      }
    // }

*/

    if (
      (invitedClient && invitedClient.isNewUser) ||
      (contact && contact.isNewUser)
    ) {
      // if new user created

      if (!invitedClient || (invitedClient && !invitedClient.isNewCompany)) {
        // if new company not created
        console.log("notification 10 ************************************* ", companyId);
        sendNotification_010({ company_id: companyId }); // notification 10 will only go for new user
      }
    }

    // if (
    //   tabName == "event_manager" ||
    //   tabName == "venue" ||
    //   tabName == "supplier" ||
    //   tabName == "exhibitor"
    // ) {
    // 4. notification 011 - Add Contact (Tabs: Event Manager, Venue, Supplier or Exhibitor tabs) - Send NOTIFICATION 011 to contacts which have a KIP created
    if (
      invitedClient &&
      contact &&
      (invitedClient.userId == contact.userId || invitedClient.user_id == contact.user_id) &&
      invitedClient.isNewCompany &&
      invitedClient.isNewUser &&
      !contact.isCrew
    ) {
      // if both company and user is new then notificaiton 16
      console.log("notification 16 ************************************* ");
      sendNotification_016({
        user_id: contact.userId ? contact.userId : contact.user_id,
        company_id: companyId,
        event_id: eventId,
        pri_user_uuid: pri_user_uuid,
      });
    } else if (
      (invitedClient && invitedClient.isNewCompany && !invitedClient.isCrew) ||
      (contact && contact.isNewUser && !contact.isCrew)
      // invitedClient.userId == contact.userId &&
    ) {
      console.log("notification 12 ************************************* ");
      sendNotification_012({
        user_id: contact.userId ? contact.userId : contact.user_id,
        company_id: companyId,
        event_id: eventId,
        pri_user_uuid: pri_user_uuid,
      });
    } else if (contact && !contact.isCrew && (contact.userId || contact.user_id)) {
      console.log("notification 11 ************************************* ");
      // 5. notification 012 - Add Contact (Tabs: Event Manager, Venue, Supplier or Exhibitor tabs) - Send NOTIFICATION 012 to contacts who don’t have a KIP created
      sendNotification_011({
        user_id: contact.userId ? contact.userId : contact.user_id,
        company_id: companyId,
        event_id: eventId,
      });
    }
    // }

    // if (
    //   tabName == "venue" ||
    //   tabName == "supplier" ||
    //   tabName == "exhibitor"
    // ) {
    // 6. notification 013 - Add Crew (Tabs: Venue, Supplier or Exhibitor tabs) - Send NOTIFICATION 013 to contacts which have a KIP created
    if (
      (invitedClient &&
        invitedClient.isNewUser &&
        (invitedClient.userId || invitedClient.user_id) &&
        invitedClient.isCrew) ||
      (contact && contact.isNewUser && (contact.userId || contact.user_id) && contact.isCrew)
    ) {
      // check user is private or public
      contact.userId = contact.userId ? contact.userId : contact.user_id
      let userData = await new UserMgmtDao().getUserById(contact.userId);
      if (userData.is_verified) {
        console.log("notification 13 ************************************* ");
        sendNotification_013({
          user_id: contact.userId ? contact.userId : contact.user_id,
          company_id: companyId,
          event_id: eventId,
        });
      } else {
        console.log("notification 14 ************************************* ");
        sendNotification_014({
          user_id: contact.userId ? contact.userId : contact.user_id,
          company_id: companyId,
          event_id: eventId,
        });
      }
    } else if (
      (invitedClient && (invitedClient.userId || contact.user_id) && invitedClient.isCrew) ||
      (contact && (contact.userId || contact.user_id) && contact.isCrew)
    ) {
      contact.userId = contact.userId ? contact.userId : contact.user_id
      // 7. notification 014 - .Add Crew (Tabs: Venue, Supplier or Exhibitor tabs) - Send NOTIFICATION 014 to contacts which doesn’t have a KIP created
      let userData = await new UserMgmtDao().getUserById(contact.userId);
      if (userData.is_verified) {
        console.log("notification 13 ************************************* ");
        sendNotification_013({
          user_id: contact.userId ? contact.userId : contact.user_id,
          company_id: companyId,
          event_id: eventId,
        });
      } else {
        console.log("notification 14 ************************************* ");
        sendNotification_014({
          user_id: contact.userId ? contact.userId : contact.user_id,
          company_id: companyId,
          event_id: eventId,
        });
      }
    }
  }
};


export const sendConfirmationMail = async (
  userId: any,
  eventId:any
) => {
  const combinedArray = userId.reduce((result, item) => {
    if (item.isCrew === 0) {
      result.push(item.id);
    }
    return result;
  }, []);
  
 let uuid = await new CompanyDao().getuuidforcrew(combinedArray);
let email;

let userData = await new UserMgmtDao().getUserByIdforSend(combinedArray);

let eventData = await new UserMgmtDao().getUserEventForSend(
  combinedArray,
  eventId
);
for(let i=0;i<uuid[0].length;i++){

  email = userData[0][i].email;
  

  if (
    !userData[0][i] ||
    !eventData[0][0] ||
    eventData[0][0].length < 1 ||
    !email
  ) {
    return;
  }
else{
    if(uuid[0][i].is_verified==0){
      let redirect_url = uuid[0][i].user_uuid
      ? process.env.SITE_URL + "/create-konnect-profile?uid=" + uuid[0][i].user_uuid
      : process.env.SITE_URL;

    let data = {
      username: userData[0][i].firstName,
      CompanyName: eventData[0][0].creatorCompanyName, 
      EventName: eventData[0][0].title,
      KonnectSiteURL: redirect_url, 
      email: email,
      dashboardEventDate: eventData[0][0].startDateTime
        ? moment(eventData[0][0].startDateTime).format("D MMMM YYYY")
        : "TBC",
      userSendingInviteFirstName: eventData[0][0].creatorFirstName,
    };
    
    
    const emailSender = new EmailSender();
    try {
      let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
      let template = await new commonDao().getEmailTemplateById(
        CONSTANTS.NOTIFICATION_TEMPLATE_021_ID
      );
    
      if (baseTemplate == "null") return;
      let htmlBodyContent = replaceEmailTemplateData(template.content, data);
      baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);
    
      emailSender.sendEmail(data.email, template.subject, baseTemplate);
    } catch (err) {}
    }
    else{
        let redirect_url = process.env.SITE_URL;

      let data = {
        username: userData[0][i].firstName,
        CompanyName: eventData[0][0].creatorCompanyName, 
        EventName: eventData[0][0].title,
        KonnectSiteURL: redirect_url, 
        email: email,
        dashboardEventDate: eventData[0][0].startDateTime
          ? moment(eventData[0][0].startDateTime).format("D MMMM YYYY")
          : "TBC",
        userSendingInviteFirstName: eventData[0][0].creatorFirstName,
      };
      
      
      const emailSender = new EmailSender();
      try {
        let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
        let template = await new commonDao().getEmailTemplateById(
          CONSTANTS.NOTIFICATION_TEMPLATE_022_ID
        );
      
        if (baseTemplate == "null") return;
        let htmlBodyContent = replaceEmailTemplateData(template.content, data);
        baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);
      
        emailSender.sendEmail(data.email, template.subject, baseTemplate);
      } catch (err) {}
    
  }
  }
 

}

return ({})

}




export const sendConfirmationMailForCrew = async (
  userId: any,
  eventId:any
) => {
  const combinedArray = userId.reduce((result, item) => {
    if (item.isCrew === 1) {
      result.push(item.id);
    }
    return result;
  }, []);
  
 let uuid = await new CompanyDao().getuuidforcrew(combinedArray);
let email;

let userData = await new UserMgmtDao().getUserByIdforSend(combinedArray);

let eventData = await new UserMgmtDao().getUserEventForSend(
  combinedArray,
  eventId
);
for(let i=0;i<uuid[0].length;i++){

  email = userData[0][i].email;
  

  if (
    !userData[0][i] ||
    !eventData[0][0] ||
    eventData[0][0].length < 1 ||
    !email
  ) {
    return;
  }
else{
    if(uuid[0][i].is_verified==0){
      let redirect_url = uuid[0][i].user_uuid
      ? process.env.SITE_URL + "/create-konnect-profile?uid=" + uuid[0][i].user_uuid
      : process.env.SITE_URL;
    
    let data = {
      username: userData[0][i].firstName,
      CompanyName: eventData[0][0].creatorCompanyName, 
      EventName: eventData[0][0].title,
      KonnectSiteURL: redirect_url, 
      email: email,
      dashboardEventDate: eventData[0][0].startDateTime
        ? moment(eventData[0][0].startDateTime).format("D MMMM YYYY")
        : "TBC",
      userSendingInviteFirstName: eventData[0][0].creatorFirstName,
    };
    
    
    const emailSender = new EmailSender();
    try {
      let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
      let template = await new commonDao().getEmailTemplateById(
        CONSTANTS.NOTIFICATION_TEMPLATE_021_ID
      );
    
      if (baseTemplate == "null") return;
      let htmlBodyContent = replaceEmailTemplateData(template.content, data);
      baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);
    
      emailSender.sendEmail(data.email, template.subject, baseTemplate);
    } catch (err) {}
    }
    else{
        let redirect_url = process.env.SITE_URL;
      
      let data = {
        username: userData[0][i].firstName,
        CompanyName: eventData[0][i].creatorCompanyName, 
        EventName: eventData[0][0].title,
        KonnectSiteURL: redirect_url, 
        email: email,
        dashboardEventDate: eventData[0][0].startDateTime
          ? moment(eventData[0][0].startDateTime).format("D MMMM")
          : "TBC",
        userSendingInviteFirstName: eventData[0][0].creatorFirstName,
      };
      
      
      const emailSender = new EmailSender();
      try {
        let baseTemplate: string = await getFileAsString(tamplatebaseUrl);
        let template = await new commonDao().getEmailTemplateById(
          CONSTANTS.NOTIFICATION_TEMPLATE_022_ID
        );
      
        if (baseTemplate == "null") return;
        let htmlBodyContent = replaceEmailTemplateData(template.content, data);
        baseTemplate = baseTemplate.replace(/{{bodyContent}}/g, htmlBodyContent);
      
        emailSender.sendEmail(data.email, template.subject, baseTemplate);
      } catch (err) {}
    
  }
  }
 

}

return ({})

}


/*

  notification on event -
  1. notification 006 - event manager creates pkip or pkcp - notification to the pkip user
  2. notification 007 - event manager creates pkip to join existing KCP
  3. notificaiton 008 - event manager invites an existing kip to join an existing kcp
  4. notification 011 - Add Contact (Tabs: Event Manager, Venue, Supplier or Exhibitor tabs) - Send NOTIFICATION 011 to contacts which have a KIP created
  5. notification 012 - Add Contact (Tabs: Event Manager, Venue, Supplier or Exhibitor tabs) - Send NOTIFICATION 012 to contacts who don’t have a KIP created
  6. notification 013 - Add Crew (Tabs: Venue, Supplier or Exhibitor tabs) - Send NOTIFICATION 013 to contacts which have a KIP created
  7. notification 014 - .Add Crew (Tabs: Venue, Supplier or Exhibitor tabs) - Send NOTIFICATION 014 to contacts which doesn’t have a KIP created


  */
