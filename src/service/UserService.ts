import * as dotenv from "dotenv";
import * as _ from "lodash";
import { Codes, CONSTANTS } from "../util/SiteConfig";
import { UserMgmtDao } from "../daos/UserMgmtDao";
import { UserProfile } from "../Model/UserProfile";
import { Context } from "vm";
import {
  asyncLambdaCallForCreateEventDirectoryStructure,
  getS3FileUploadSignedURL,
} from "../util/AwsS3SignedUrlUtil";
import * as jwt from "jsonwebtoken";
import {
  isValidString,
  getDefaultResponse,
  getAuthorizerUser,
} from "../util/helper";
import { commonDao } from "../daos/commonDao";
import {
  sendResetPaawordLinkEmail,
  sendNotification_008,
  sendEmailOnCreateNewAccount,
  sendEmailOnCreateNewCompany,
  sendGeneralEmail,
  sendEventNotification
} from "./EmailService";
import { CompanyDao } from "../daos/CompanyDao";
import { Console } from "console";
import moment = require("moment");
export class UserMgmtService {
  constructor() {
    dotenv.config();
    // AWS.config.region = process.env["region"];
  }

  /**
   * add new user
   */
  async addUser(
    userReq: UserProfile,
    event: any,
    context: Context
  ): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (
        !userReq.email ||
        !userReq.password ||
        !userReq.timeZone ||
        !userReq.firstName ||
        !userReq.countryId ||
        !userReq.city
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      userReq.id = 0;
      userReq.roleId = 1;
      result = await new UserMgmtDao().saveUser(userReq);

      if (result && result.msg == "SUCCESS") {
        userReq.id = result.id;

        let company_res = await new UserMgmtDao().makeUserAndHisCompanyPublic(
          userReq.id
        );

        if (
          company_res &&
          company_res[0] &&
          company_res[0][0] &&
          company_res[0][0].companyId
        ) {
          // return company id if amke company and user public

          let kipData = {
            EmailAdress: userReq.email,
            email: userReq.email,
            userName: userReq.firstName,
            KonnectSiteURL: process.env.SITE_URL,
          };
          await sendEmailOnCreateNewAccount(kipData);

          let data = {
            userId: userReq.id,
            CompanyName: result.companyName,
            KonnectSiteURL: process.env.SITE_URL,
            companyId: company_res[0][0].companyId,
          };
          await sendEmailOnCreateNewCompany(data);
        }

        let tokenData = { id: userReq.id, roleId: userReq.roleId };
        let token = jwt.sign(
          {
            data: tokenData,
          },
          process.env.EncryptionKEY,
          {
            expiresIn: "7d",
          }
        );
        userReq.password = null;
        userReq.authrizationToken = token;
        finalResponse.data = { user: userReq };

        // make user and his company verified after user signup
      } else if (result && result.msg == "EXISTS") {
        finalResponse.message = CONSTANTS.EMAIL_ALREADY_EXIST;
        finalResponse.code = Codes.ALREADY_EXIST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * update  user
   */
  async updateUser(
    userReq: UserProfile,
    event: any,
    context: Context
  ): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (
        userReq.id == 0 ||
        !userReq.email ||
        !userReq.timeZone ||
        !userReq.firstName ||
        !userReq.countryId ||
        !userReq.city
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      userReq.roleId = 1;
      result = await new UserMgmtDao().saveUser(userReq);

      if (result && result.msg == "SUCCESS") {
        userReq.id = result.id;
        userReq.password = null;
        userReq.authrizationToken = "";
        finalResponse.data = { user: userReq };
      } else if (result && result.msg == "EXISTS") {
        finalResponse.message = CONSTANTS.EMAIL_ALREADY_EXIST;
        finalResponse.code = Codes.ALREADY_EXIST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * verify user email
   */
  async verifyUserEmail(req: any, event: any, context: Context): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!req.token) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      //userReq.roleId = 1;
      result = await new UserMgmtDao().verifyUserEmail(req.token);
      if (result) {
        finalResponse.data = { user: result };
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   *get S3Bucket Signed URL
   */
  async getS3BucketSignedURL(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    req = event.queryStringParameters;
    let finalResponse: any = {
      message: CONSTANTS.SUCCESS,
      code: Codes.OK,
      data: {},
    };
    try {
      //check validation
      if (!req.fileName || !req.fileType) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await getS3FileUploadSignedURL(req.fileName, req.fileType);

      if (result && result.status == "OK") {
        finalResponse.data = { signedUrlObj: result };
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * login
   */
  async userLogin(req: any, event: any, context: Context): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!req || !isValidString(req.email) || !isValidString(req.password)) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().userLogin(req, false);

      if (result && result.msg == "SUCCESS") {
        let tokenData = { id: result.id, roleId: result.roleId };
        let token = jwt.sign(
          {
            data: tokenData,
          },
          process.env.EncryptionKEY,
          {
            expiresIn: "7d",
          }
        );
        result.timeZone = JSON.parse(result.timeZone);
        result.authrizationToken = token;
        finalResponse.data = { user: result };
      } else {
        finalResponse.message = CONSTANTS.INCORRECT_EMAIL_PASSWORD;
        finalResponse.code = Codes.UNAUTHORIZED;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * forgotPassword
   */
  async forgotPassword(req: any, event: any, context: Context): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!req || !isValidString(req.email)) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().forgotPassword(req.email);

      if (result && result.msg == "SUCCESS") {
        finalResponse.message = CONSTANTS.SUCCESS;
        let emailTemplate = await new commonDao().getEmailTemplateById(
          CONSTANTS.RESET_PASSWORD_TEMPLATE_ID
        );
        let resetLink =
          process.env.SITE_URL + "/forgot-password/reset/" + result.token;

        if (emailTemplate) {
          let data = {
            to: req.email,
            userName: result.userName,
            url: resetLink,
          };
          sendResetPaawordLinkEmail(emailTemplate, data);
        }

        //todo... send forgot password email
      } else if (result && result.msg == "USER_IS_PRIVATE") {
        finalResponse.message = CONSTANTS.USER_IS_PRIVATE;
        finalResponse.code = Codes.BAD_REQUEST;
      } else if (result && result.msg == "EMAIL_NOT_EXIST") {
        finalResponse.message = CONSTANTS.EMAIL_ID_NOT_EXIST;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * reset password
   */
  async resetPassword(req: any, event: any, context: Context): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (
        !req ||
        !isValidString(req.password) ||
        !isValidString(req.resetPasswordToken)
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().resetPassword(
        req.password,
        req.resetPasswordToken
      );

      if (result && result.msg == "SUCCESS") {
        //TODO//change password success email will send if required by client
      } else if (result && result.msg == "INVALID_TOKEN") {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * get user profile with assciated company list
   */
  async getUserProfile(req: any, event: any, context: Context): Promise<any> {
    req = event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!loginUser || loginUser.id == 0) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let user_id = loginUser.id;
      if (req && req.userId > 0) {
        user_id = req.userId;
      }

      let result: any;
      result = await new UserMgmtDao().getUserProfile(user_id);

      if (result && result.length > 0 && result[0].length > 0) {
        finalResponse.data = {};
        finalResponse.data.user = result[0][0];
        finalResponse.data.user.associatedCompanies = result[1];
        finalResponse.data.user.timeZone = JSON.parse(
          finalResponse.data.user.timeZone
        );
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * change password
   */
  async changePassword(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse: any = {
      message: CONSTANTS.SUCCESS,
      code: Codes.OK,
      data: null,
    };
    try {
      //check validation
      if (
        !req ||
        !loginUser.id ||
        !isValidString(req.oldPassword) ||
        !isValidString(req.newPassword)
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().changePassword(
        loginUser.id,
        req.oldPassword,
        req.newPassword
      );

      finalResponse.message = CONSTANTS[result.msg]
        ? CONSTANTS[result.msg]
        : CONSTANTS.FAILED;
      if (result && result.msg == "SUCCESS") {
        //TODO//change password success email will send if required by client
      } else if (result && result.msg == "USER_NOT_FOUND") {
        finalResponse.message = CONSTANTS.USER_NOT_FOUND;
        finalResponse.code = Codes.BAD_REQUEST;
      } else if (result && result.msg == "OLD_PASSWORD_DOESNT_MATCH") {
        finalResponse.message = CONSTANTS.OLD_PASSWORD_DOESNT_MATCH;
        finalResponse.code = Codes.BAD_REQUEST;
      } else if (result && result.msg == "INVALID_TOKEN") {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * delete profile
   */
  async deleteProfile(req: any, event: any, context: Context): Promise<any> {
    let finalResponse: any = {
      message: CONSTANTS.SUCCESS,
      code: Codes.OK,
      data: null,
    };
    try {
      //check validation
      if (!req) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().deleteProfile(req.userId);

      finalResponse.message = CONSTANTS[result.msg]
        ? CONSTANTS[result.msg]
        : CONSTANTS.FAILED;
      if (result && result.msg == "SUCCESS") {
        //TODO//change password success email will send if required by client
      } else if (result && result.msg == "INVALID_TOKEN") {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * add connection
   */
  async addConnection(req: any, event: any, context: Context): Promise<any> {
    // req=event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);

    let finalResponse: any = {
      message: CONSTANTS.SUCCESS,
      code: Codes.OK,
      data: null,
    };
    try {
      //check validation
      if (!req || !req.companyId || !req.connectionId || !req.connectionType) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().addConnection(
        req.companyId,
        req.connectionId,
        req.connectionType,
        loginUser.id
      ); // connectionType 1 for user 2 for company

      finalResponse.message = CONSTANTS[result.msg]
        ? CONSTANTS[result.msg]
        : CONSTANTS.FAILED;
      if (result && result.msg == "SUCCESS") {
        //TODO//change password success email will send if required by client
      } else if (result && result.msg == "INVALID_TOKEN") {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * delete connection
   */
  async deleteConnection(req: any, event: any, context: Context): Promise<any> {
    let finalResponse: any = {
      message: CONSTANTS.SUCCESS,
      code: Codes.OK,
      data: null,
    };
    try {
      //check validation
      if (!req || !req.companyId || !req.connectionId || !req.connectionType) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().deleteConnection(
        req.companyId,
        req.connectionId,
        req.connectionType
      );

      finalResponse.message = CONSTANTS[result.msg]
        ? CONSTANTS[result.msg]
        : CONSTANTS.FAILED;
      if (result && result.msg == "SUCCESS") {
        //TODO//change password success email will send if required by client
      } else if (result && result.msg == "INVALID_TOKEN") {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * list connection
   */
  async listConnection(req: any, event: any, context: Context): Promise<any> {
    let finalResponse: any = {
      message: CONSTANTS.SUCCESS,
      code: Codes.OK,
      data: {},
    };
    let loginUser = getAuthorizerUser(event);
    if (!loginUser || !loginUser.id) loginUser.id = 0;
    try {
      //check validation
      if (!req || !req.companyId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      if (!req.pageNo) {
        req.pageNo = 1;
      }

      if (!req.pageSize) {
        req.pageSize = 10000;
      }

      if (!req.entityType) {
        req.entityType = 0;
      }

      let result: any;
      result = await new UserMgmtDao().listConnection(
        req.companyId,
        req.pageNo,
        req.pageSize,
        req.entityType,
        loginUser.id
      );

      if (result && result[0] && result[1]) {
        //TODO//change password success email will send if required by client

        if (req.entityType == 0) {
          finalResponse.data.userConnection = Array.isArray(result[0])
            ? result[0]
            : [];
          finalResponse.data.companyConnection = Array.isArray(result[1])
            ? result[1]
            : [];
        } else if (req.entityType == 1) {
          finalResponse.data.userConnection = Array.isArray(result[0])
            ? result[0]
            : [];
          finalResponse.data.companyConnection = [];
        } else if (req.entityType == 2) {
          finalResponse.data.userConnection = [];
          finalResponse.data.companyConnection = Array.isArray(result[0])
            ? result[0]
            : [];
        }

        // finalResponse.data.userConnection= Array.isArray(result[0]) ?  result[0] : [];
        // finalResponse.data.companyConnection=  Array.isArray(result[1]) ?  result[1] : [];
      } else if (result && result.msg == "INVALID_TOKEN") {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * search global connection
   */
  async searchGlobalConnection(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    // req=event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);

    let finalResponse: any = {
      message: CONSTANTS.SUCCESS,
      code: Codes.OK,
      data: {},
    };
    try {
      //check validation
      if (!req || !req.companyId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      if (!req.pageNo) {
        req.pageNo = 1;
      }

      if (!req.pageSize) {
        req.pageSize = 1000;
      }
      if (!req.keyword) {
        req.keyword = "";
      }

      if (!req.entityType) {
        req.entityType = 0;
      }

      let result: any;
      result = await new UserMgmtDao().searchGlobalConnection(
        req.companyId,
        req.keyword,
        req.pageNo,
        req.pageSize,
        req.regionId,
        req.isExternal,
        req.entityType,
        loginUser.id
      );

      if (result && result[0] && result[1]) {
        //TODO//change password success email will send if required by client
        if (req.entityType == 0) {
          finalResponse.data.userConnection = Array.isArray(result[0])
            ? result[0]
            : [];
          finalResponse.data.companyConnection = Array.isArray(result[1])
            ? result[1]
            : [];
        } else if (req.entityType == 1) {
          finalResponse.data.userConnection = Array.isArray(result[0])
            ? result[0]
            : [];
          finalResponse.data.companyConnection = [];
        } else if (req.entityType == 2) {
          finalResponse.data.userConnection = [];
          finalResponse.data.companyConnection = Array.isArray(result[0])
            ? result[0]
            : [];
        }
      } else if (result && result.msg == "INVALID_TOKEN") {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * search global connection New with seed data for platform
   */
  async searchGlobalConnectionNew(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    // req=event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);

    let finalResponse: any = {
      message: CONSTANTS.SUCCESS,
      code: Codes.OK,
      data: {},
    };
    try {
      //check validation
      if (!req || !req.companyId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      if (!req.pageNo) {
        req.pageNo = 1;
      }

      if (!req.pageSize) {
        req.pageSize = 1000;
      }
      if (!req.keyword) {
        req.keyword = "";
      }

      if (!req.entityType) {
        req.entityType = 0;
      }

      let result: any;
      result = await new UserMgmtDao().searchGlobalConnectionNew(
        req.companyId,
        req.keyword,
        req.pageNo,
        req.pageSize,
        req.regionId,
        req.isExternal,
        req.entityType,
        loginUser.id
      );

      if (result && result[0] && result[1]) {
        //TODO//change password success email will send if required by client
        if (req.entityType == 0) {
          finalResponse.data.userConnection = Array.isArray(result[0])
            ? result[0]
            : [];
          finalResponse.data.companyConnection = Array.isArray(result[1])
            ? result[1]
            : [];
        } else if (req.entityType == 1) {
          finalResponse.data.userConnection = Array.isArray(result[0])
            ? result[0]
            : [];
          finalResponse.data.companyConnection = [];
        } else if (req.entityType == 2) {
          finalResponse.data.userConnection = [];
          finalResponse.data.companyConnection = Array.isArray(result[0])
            ? result[0]
            : [];
        }
      } else if (result && result.msg == "INVALID_TOKEN") {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * search global connection New with seed data for connection
   */
  async searchGlobalConnectionForCollection(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    // req=event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);

    let finalResponse: any = {
      message: CONSTANTS.SUCCESS,
      code: Codes.OK,
      data: {},
    };
    try {
      //check validation
      if (!req || !req.companyId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      if (!req.pageNo) {
        req.pageNo = 1;
      }

      if (!req.pageSize) {
        req.pageSize = 1000;
      }
      if (!req.keyword) {
        req.keyword = "";
      }

      if (!req.entityType) {
        req.entityType = 0;
      }

      let result: any;
      result = await new UserMgmtDao().searchGlobalConnectionForCollection(
        req.companyId,
        req.keyword,
        req.pageNo,
        req.pageSize,
        req.regionId,
        req.isExternal,
        req.entityType,
        loginUser.id
      );
      if (result && result[0] && result[1]) {
        for (let index = 0; index < result[0].length; index++) {
          const element = result[0][index];
          if (element.isPrivate) {
            result[0][index].firstName = element.contact_user_name
              ? element.contact_user_name
              : result[0][index].firstName;
          }
        }
        //TODO//change password success email will send if required by client
        if (req.entityType == 0) {
          finalResponse.data.userConnection = Array.isArray(result[0])
            ? result[0]
            : [];
          finalResponse.data.companyConnection = Array.isArray(result[1])
            ? result[1]
            : [];
        } else if (req.entityType == 1) {
          finalResponse.data.userConnection = Array.isArray(result[0])
            ? result[0]
            : [];
          finalResponse.data.companyConnection = [];
        } else if (req.entityType == 2) {
          finalResponse.data.userConnection = [];
          finalResponse.data.companyConnection = Array.isArray(result[0])
            ? result[0]
            : [];
        }
      } else if (result && result.msg == "INVALID_TOKEN") {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * search global connection New with seed data for connection
   */
  async checkUserCompanyDomain(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    // req=event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);
    let finalResponse: any = {
      message: CONSTANTS.SUCCESS,
      code: Codes.OK,
      data: {},
    };
    try {
      //check validation
      if (!req || !req.companyId || !req.email) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      if (!req.pageNo) {
        req.pageNo = 1;
      }

      if (!req.pageSize) {
        req.pageSize = 1000;
      }

      let result: any;
      result = await new UserMgmtDao().checkUserCompanyDomain(
        req.companyId,
        req.email,
        loginUser.id
      );

      if (result && result[0]) {
        if (result[0] != "") {
          finalResponse.data.domainMatch = true;
        } else {
          finalResponse.data.domainMatch = false;
        }
      } else if (result && result.msg == "INVALID_TOKEN") {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /***
   * get company Colleagues list with admins,members,join request,invites users
   *
   */
  async getUserDataByUID(req: any, event: any, context: Context): Promise<any> {
    // req=event.queryStringParameters;
    // let loginUser=getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (!req || !req.inviteUID) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().getUserDataByUID(req.inviteUID);
      if (result[0] && result[0][0]) {
        result = result[0][0];

        let tokenData = { id: result.id, roleId: result.roleId };
        let token = jwt.sign(
          {
            data: tokenData,
          },
          process.env.EncryptionKEY,
          {
            expiresIn: "7d",
          }
        );
        result.timeZone = JSON.parse(result.timeZone);
        result.authrizationToken = token;
        finalResponse.data = { user: result };
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  // feed company seed data

  async feedCompanySeedData(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    // req=event.queryStringParameters;
    // let loginUser=getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      let result: any;
      result = await new UserMgmtDao().feedCompanySeedData(req.inviteUID);

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /***
   * invite new company
   *
   */
  async inviteNewCompany(req: any, event: any, context: Context): Promise<any> {
    // req=event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !req ||
        !req.name ||
        !req.countryId ||
        !req.city ||
        !req.contactName ||
        !req.contactEmail ||
        !req.companyId
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().inviteNewCompany(
        req.name,
        req.countryId,
        req.city,
        req.contactName,
        req.contactEmail,
        req.companyId,
        loginUser.id
      );

      if (result) {
        // send email start ************
        let userId;
        let companyId;
        if (result[0] && result[0][0] && result[0][0].userId) {
          userId = result[0][0].userId;
          companyId = result[0][0].companyId;
        }
        if (result[1] && result[1][0] && result[1][0].userId) {
          userId = result[1][0].userId;
          companyId = result[1][0].companyId;
        }
        if (result[2] && result[2][0] && result[2][0].userId) {
          userId = result[2][0].userId;
          companyId = result[2][0].companyId;
        }

        if (companyId && userId) {
          let user: any;

          user = await new UserMgmtDao().getUserById(userId);

          let cmp_admin: any;
          cmp_admin = await new UserMgmtDao().getUserById(loginUser.id);

          let cmp_profile: any;
          cmp_profile = await new CompanyDao().getCompanyById(companyId);

          let emailTemplate = await new commonDao().getEmailTemplateById(
            CONSTANTS.NOTIFICATION_INVITE_COLLEAGUE
          );
        }

        // send email end ****************

        //  finalResponse.data=result;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /***
   * search company contacts by keyword
   *
   */
  async searchCompanyContactsByKeyword(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    // req=event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (!req || !req.companyId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().searchCompanyContactsByKeyword(
        req.keyword,
        req.companyId,
        req.isCrew
      );

      if (result) {
        finalResponse.data = {};
        if (result[0]) {
          finalResponse.data.user = result[0];
        }
        if (result[1]) {
          finalResponse.data.company = result[1];
        }
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /***
   * search company contacts
   *
   */
  async getCompanyContacts(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    // req=event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (!req || !req.companyId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().getCompanyContacts(
        //req.keyword,
        req.companyId,
        req.isCrew,
        loginUser.id,
        req.creatorFromCompanyId
      );

      for (let index = 0; index < result[0].length; index++) {
        const element = result[0][index];
        if (element.isPrivate) {
          result[0][index].firstName = element.contact_user_name
            ? element.contact_user_name
            : element.firstName;
        }
      }

      if (result) {
        finalResponse.data = {};
        if (result[0]) {
          finalResponse.data.user = result[0];
        }
        if (result[1]) {
          finalResponse.data.company = result[1];
        }
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /***
   * search company contacts by keyword
   *
   */
  async searchCompanyByKeyword(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    // req=event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (!req) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().searchCompanyByKeyword(req.keyword);

      if (result) {
        finalResponse.data = result[0];
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /***
   * search company contacts by keyword
   *
   */
  async saveEvent(req: any, event: any, context: Context): Promise<any> {
    // req=event.queryStringParameters;

    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !req ||
        !req.event ||
        !req.event.title ||
        !req.event.createrUserId ||
        !req.event.creatorFromCompanyId ||
        !req.event.client ||
        !req.event.eventManager
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let event_id = 0;
      let result: any;
      if (!req.eventId) {
        let emInternalNotes = req.event.eventManager.emInternalNotes;
        if (!emInternalNotes) emInternalNotes = "";

        result = await new UserMgmtDao().saveBasicEvent(
          req.event.title,
          req.event.description,
          req.event.createrUserId,
          req.event.creatorFromCompanyId,
          req.event.hasExhibitors,
          req.event.client.id,
          req.event.client.isOwnCompany,
          req.event.eventManager.id,
          req.event.eventManager.isOwnCompany,
          req.event.eventManager.requirements,
          0,
          emInternalNotes
        );

        if (result && result[0] && result[0][0] && result[0][0].eventId) {
          event_id = result[0][0].eventId;
          try {
            asyncLambdaCallForCreateEventDirectoryStructure(
              result[0][0].eventUID
            );
          } catch (err) {}
        } else if (
          result &&
          result[0] &&
          result[0][0] &&
          result[0][0].msg == "EVENT_ALREADY_EXISTS"
        ) {
          finalResponse.message = CONSTANTS.EVENT_ALREADY_EXISTS;
          finalResponse.code = Codes.BAD_REQUEST;
          return Promise.resolve(finalResponse);
        }
      } else {
        event_id = req.eventId;
      }

      if (event_id) {
        result = await new UserMgmtDao().saveEventClientContacts(
          event_id,
          req.event.client,
          req.event.createrUserId,
          req.event.creatorFromCompanyId
        );
        result = await new UserMgmtDao().saveEventManagerContacts(
          event_id,
          req.event.eventManager,
          req.event.createrUserId,
          req.event.creatorFromCompanyId,
          0,
          "",
          true
        );
      }

      // save venues
      if (req.event.venues) {
        result = await new UserMgmtDao().saveVenues(
          event_id,
          req.event.venues,
          req.event.createrUserId,
          0,
          req.event.creatorFromCompanyId
        ); // passing 0 for save event

        result = await new UserMgmtDao().getEvent(event_id, 3, loginUser.id); // passing tab type 3 for venues tab
      }

      if (result) {
        let tmp = { eventId: 0, venue: [] };
        // if(result.eventId)
        tmp["eventId"] = event_id; // result.eventId;

        if (result.venues && result.venues.length > 0) {
          let venueObjArr: any = [];
          for (let i = 0; i < result.venues.length; i++) {
            if (result.venues[i] && result.venues[i].venueId) {
              venueObjArr.push({
                venueId: result.venues[i].venueId,
                venueCity: result.venues[i].companyCity,
              });
            }
          }
          tmp.venue = venueObjArr;
        }

        finalResponse.data = tmp;
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /***
   * update event
   *
   */
  async updateEvent(req: any, event: any, context: Context): Promise<any> {
    // req=event.queryStringParameters;

    // sendNotification_008({ user_id: 148, company_id: 348, event_id: 283 });

    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (!req || !req.eventId || !req.eventId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;

      // update type =>  1 for client tab, 2 for event manager tab , 3 for venue tab, 4 for supplier tab, 5 for exhibitor tab
      if (req.event.client) {
        // for client tab

        if (!req.event.title) req.event.title = "";
        if (!req.event.description) req.event.description = "";
        if (!req.event.client.internalCmpNotes)
          req.event.client.internalCmpNotes = "";
        if (!req.event.createrUserId) req.event.createrUserId = "";
        if (!req.event.creatorFromCompanyId)
          req.event.creatorFromCompanyId = "";
        if (!req.event.client.id) req.event.client.id = "";
        if (
          typeof req.event.hasExhibitors === "undefined" ||
          req.event.hasExhibitors === null
        )
          req.event.hasExhibitors = null;
        if (
          typeof req.event.client.isOwnCompany === "undefined" ||
          req.event.client.isOwnCompany === null
        )
          req.event.client.isOwnCompany = null;

        result = await new UserMgmtDao().saveBasicEvent(
          req.event.title,
          req.event.description,
          req.event.createrUserId,
          req.event.creatorFromCompanyId,
          req.event.hasExhibitors,
          req.event.client.id,
          req.event.client.isOwnCompany,
          "",
          null,
          "",
          req.eventId,
          "",
          req.event.client.internalCmpNotes
        ); // sending event manager tab related value as empty value

        result = await new UserMgmtDao().saveEventClientContacts(
          req.eventId,
          req.event.client,
          req.event.createrUserId,
          req.event.creatorFromCompanyId,
          req.eventId
        );
      }

      if (req.event.eventManager) {
        // for event manager tab

        if (!req.event.title) req.event.title = "";
        if (!req.event.description) req.event.description = "";
        if (!req.event.createrUserId) req.event.createrUserId = "";
        if (!req.event.creatorFromCompanyId)
          req.event.creatorFromCompanyId = "";
        if (!req.event.eventManager.id) req.event.eventManager.id = "";
        if (!req.event.eventManager.requirements)
          req.event.eventManager.requirements = "";
        if (
          typeof req.event.hasExhibitors === "undefined" ||
          req.event.hasExhibitors === null
        )
          req.event.hasExhibitors = null;
        if (
          typeof req.event.eventManager.isOwnCompany === "undefined" ||
          req.event.eventManager.isOwnCompany === null
        )
          req.event.eventManager.isOwnCompany = null;

        let emInternalNotes = req.event.eventManager.emInternalNotes;
        if (!emInternalNotes) emInternalNotes = "";

        result = await new UserMgmtDao().saveBasicEvent(
          req.event.title,
          req.event.description,
          req.event.createrUserId,
          req.event.creatorFromCompanyId,
          req.event.hasExhibitors,
          "",
          null,
          req.event.eventManager.id,
          req.event.eventManager.isOwnCompany,
          req.event.eventManager.requirements,
          req.eventId,
          emInternalNotes
        ); // sending client tab related value as empty value

        result = await new UserMgmtDao().saveEventManagerContacts(
          req.eventId,
          req.event.eventManager,
          req.event.createrUserId,
          req.event.creatorFromCompanyId,
          req.eventId,
          "",
          false
        );
      }

      if (req.event.venues) {
        // for venue tab

        result = await new UserMgmtDao().saveVenues(
          req.eventId,
          req.event.venues,
          req.event.createrUserId,
          req.eventId,
          req.event.creatorFromCompanyId
        );
      }

      if (result) {
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /***
   * save and invite event tab
   *
   */
  async saveAndInviteEventTab(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (!req) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().saveAndInviteEventTab(req.keyword);

      if (result) {
        finalResponse.data = result[0];
      } else {
        finalResponse.message = CONSTANTS.SOMETHING_WENT_WRONG;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * get event
   */
  async getEvent(req: any, event: any, context: Context): Promise<any> {
    req = event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (
        !loginUser ||
        loginUser.id == 0 ||
        !req ||
        !req.eventId ||
        !req.tabType
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().getEvent(
        req.eventId,
        req.tabType,
        loginUser.id,
        req.loginCompanyId
      );

      let result1 = await new UserMgmtDao().getEventPermission(
        req.eventId,
        loginUser.id,
        req.tabType
      );

      if (result) {
        finalResponse.data = {};
        /* // commented on 01-06-2022 as not required currently
        if(result1[0][0]){
          let permi = result1[0][0]; 
          let funRole = ""; 
          funRole += permi.isClient ? " Client," : ""; 
          funRole += permi.isEventManager ? " Event Manager," : ""; 
          funRole += permi.isVenue ? " Venue," : ""; 
          funRole += permi.isService ? " Service," : ""; 
          funRole += permi.isExhibitor ? " Exhibitor," : ""; 
          funRole += " "+result.creatorCompanyName; 
          result['ownedByText'] = funRole ; 
        }
        */

        finalResponse.data["userPermission"] = result1[0][0];
        finalResponse.data["eventData"] = result;
        finalResponse.data["commonData"] = result["commonEventData"];
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * get event list
   */
  async getEventList(req: any, event: any, context: Context): Promise<any> {
    req = event.queryStringParameters;

    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!loginUser || loginUser.id == 0) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let isPast = 0;
      if (req && req.isPast == 1) isPast = 1;

      let page_size = req && req.page_size ? req.page_size : 25;
      let page_no = req && req.page_no ? req.page_no : 1;
      let start_page = page_size * (page_no - 1);
      let isArchived = 0;
      if (req && req.isArchived == 1) isArchived = 1;

      let result: any;
      result = await new UserMgmtDao().getEventList(
        loginUser.id,
        start_page,
        page_size,
        isArchived,
        isPast
      );

      if (result) {
        finalResponse.data = result;
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * delete my event
   */
  async deleteMyEvent(req: any, event: any, context: Context): Promise<any> {
    req = event.queryStringParameters;

    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();

    try {
      //check validation
      if (!loginUser || loginUser.id == 0) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new UserMgmtDao().deleteMyEvent(req.eventId, loginUser.id);

      if (result && result[0] && result[0][0].msg == "SUCCESS") {
      } else if (result && result[0] && result[0][0].msg == "NO_PERMISSION") {
        finalResponse.message = CONSTANTS.NOT_AN_ADMIN;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * get events with date
   */
  async getEventsWithDate(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    req = event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!loginUser || loginUser.id == 0) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;

      result = await new UserMgmtDao().getEventsWithDate(loginUser.id);

      if (result) {
        finalResponse.data = result;
      } else if (result && result[0] && result[0][0].msg == "NOT_AN_ADMIN") {
        finalResponse.message = CONSTANTS.NOT_AN_ADMIN;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * get timeline tab data
   */
  async getTimelineTabData(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    req = event.queryStringParameters;

    let eventId = event.pathParameters.id;
    let venueId = event.pathParameters.venueId;

    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();

    let tabType;
    if (req.type == "services") {
      tabType = 1; // 1 for services tab, 2 for exhibitor tab
    } else if (req.type == "exhibitors") {
      tabType = 2;
    }
    //  loginUser.id = 54;
    try {
      //check validation
      if (!loginUser || loginUser.id == 0 || !eventId || !venueId || !tabType) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;

      result = await new UserMgmtDao().getTimelineTabData(
        eventId,
        venueId,
        tabType
      );

      if (result) {
        finalResponse.data = result;
      } else if (result && result[0] && result[0][0].msg == "NOT_AN_ADMIN") {
        finalResponse.message = CONSTANTS.NOT_AN_ADMIN;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * delete event tab parts - venue, serivces, exhibitor
   */
  async acceptDeclineEventTabParts(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    req = event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (
        !loginUser ||
        loginUser.id == 0 ||
        !req.eventId ||
        !req.tabId ||
        !req.tabType
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      if (!req.isAccept) req.isAccept = 0;

      let result: any;
      result = await new UserMgmtDao().acceptDeclineEventTabParts(
        req.eventId,
        req.tabId,
        req.tabType,
        loginUser.id,
        req.isAccept
      );

      if (result && result[0] && result[0][0].msg == "SUCCESS") {
      } else if (
        result &&
        result[0] &&
        result[0][0].msg == "NOT_A_ADMIN_OR_STAFF"
      ) {
        finalResponse.message = CONSTANTS.NOT_A_ADMIN_OR_STAFF;
        finalResponse.code = Codes.BAD_REQUEST;
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * get user by email id
   */
  async getUserByEmailId(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();

    try {
      //check validation
      if (!loginUser || !loginUser.id || !req.emailId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let companyId = 0;
      let tabId = 0;
      let tabType = 1;
      let eventId = 0;
      if (req.companyId) companyId = req.companyId;
      if (req.tabId) tabId = req.tabId;
      if (req.tabType) tabType = req.tabType;
      if (req.eventId) eventId = req.eventId;

      let result: any;

      result = await new UserMgmtDao().getUserByEmailId(
        req.emailId,
        companyId,
        tabId,
        tabType,
        eventId
      );

      if (result) {
        finalResponse.data = result;
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  // Resend Email Verification
  async resendEmailVerificationLink(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      let result: any;
      result = await new UserMgmtDao().getUserById(loginUser.id);
      if (result.is_email_verified == 0) {
        if (
          !result.email_verification_token ||
          result.email_verification_token == null ||
          result.email_verification_token == "null" ||
          result.email_verification_token == undefined
        ) {
          result.email_verification_token =
            await new UserMgmtDao().saveEmailVerificationToken(loginUser.id);
        }
        let kipData = {
          EmailAdress: result.email,
          email: result.email,
          userName: result.firstName,
          KonnectSiteURL: process.env.SITE_URL,
          KonnectVerificationURL:
            process.env.SITE_URL +
            "/verify-email?token=" +
            result.email_verification_token,
        };

        await sendEmailOnCreateNewAccount(kipData);
        finalResponse.message = "Successfully Resend Email Verification";
        return Promise.resolve(finalResponse);
      } else {
        finalResponse.message = "Email already verified!";
        finalResponse.code = 400;
        return Promise.resolve(finalResponse);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * save client access permission
   */
  async saveClientAccessPermission(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();

    try {
      //check validation
      if (!loginUser || !loginUser.id) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;

      result = await new UserMgmtDao().saveClientAccessPermission(
        req.clientAccessPermission,
        loginUser.id,
        req.eventId
      );

      if (result && result.msg == "SUCCESS") {
        finalResponse.data = result;
      } else if (result && result.msg == "INVALID_ACCESS") {
        finalResponse.message =
          CONSTANTS.ONLY_EVENT_MANAGER_CAN_PERFORM_THIS_ACTION;
        finalResponse.code = Codes.UNAUTHORIZED;
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * add event task
   */
  async addEventTask(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (
        !loginUser ||
        !loginUser.id ||
        !req.title ||
        !req.assignToId ||
        !req.assignById ||
        !req.eventId
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().addEventTask(req, loginUser.id);

      if (
        result.permissionFlag == 1 &&
        result.res &&
        result.res[1] &&
        result.res[1][0] &&
        result.res[1][0].msg == "SUCCESS_CREATE"
      ) {
        finalResponse.message = CONSTANTS.TASK_SUCCESSFULLY_CREATED;
      } else if (
        result.permissionFlag == 1 &&
        result.res &&
        result.res[1] &&
        result.res[1][0] &&
        result.res[1][0].msg == "NOT_AN_OWNER"
      ) {
        finalResponse.code = Codes.BAD_REQUEST;
        finalResponse.message = CONSTANTS.NOT_AN_OWNER;
      } else if (
        result.permissionFlag == 1 &&
        result.res &&
        result.res[1] &&
        result.res[1][0] &&
        result.res[1][0].msg == "ASSIGNED_TO_CMP_NOT_IN_EVENT"
      ) {
        finalResponse.code = Codes.BAD_REQUEST;
        finalResponse.message = CONSTANTS.ASSIGNED_TO_CMP_NOT_IN_EVENT;
      } else if (
        result.permissionFlag == 1 &&
        result.res &&
        result.res[1] &&
        result.res[1][0] &&
        result.res[1][0].msg == "SUCCESS_UPDATE"
      ) {
        finalResponse.message = CONSTANTS.TASK_SUCCESSFULLY_UPDATED;
      } else if (result.permissionFlag == 0) {
        finalResponse.code = Codes.BAD_REQUEST;
        finalResponse.message = CONSTANTS.NO_TASK_PERMISSION;
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /************************/

  /************************
   * add Confirmation Date
   */
  async addConfirmationDate(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !loginUser ||
        !loginUser.id
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().addConfirmationDate(req, loginUser.id);
finalResponse.data=result;
finalResponse.code=Codes.OK;
finalResponse.message = CONSTANTS.SENDCONFIRMATION;
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

   /************************
   * Save View Exhibitor 
   */
   async saveViewExhibitor(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !loginUser ||
        !loginUser.id
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().saveViewExhibitor(req, loginUser.id);
// console.log("result by meeeee++++",result);
      
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * Update View Exhibitor 
   */
  async updateViewExhibitor(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !loginUser ||
        !loginUser.id
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().updateViewExhibitor(req, loginUser.id);

      
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

 /************************
   * add Crew Confirmation Date
   */
 async addCrewConfirmationDate(req: any, event: any, context: Context): Promise<any> {
  let loginUser = getAuthorizerUser(event);
  let finalResponse = getDefaultResponse();
  try {
    if (
      !loginUser ||
      !loginUser.id
    ) {
      finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
      finalResponse.code = Codes.BAD_REQUEST;
      return Promise.resolve(finalResponse);
    }
    let result: any;
    result = await new UserMgmtDao().addCrewConfirmationDate(req, loginUser.id);
    
    
    return Promise.resolve(finalResponse);
  } catch (e) {
    return Promise.reject(e);
  }
}

   /************************
    * 
    * 
   * get Letest Date
   */
   async getLetestDate(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !loginUser ||
        !loginUser.id
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().getLetestDate(req, loginUser.id);
      finalResponse.data=result;
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async checkCrewLogin(req: any, event: any, context: Context): Promise<any> {

    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !loginUser ||
        !loginUser.id
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;

      result = await new UserMgmtDao().checkCrewLogin(req, loginUser.id);
      finalResponse.data=result;
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  
   /************************
   * get History Date
   */
   async getSendHistory(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !loginUser ||
        !loginUser.id
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().getSendHistory(req, loginUser.id);
      finalResponse.data=result;
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

   /************************
   * get History Date
   */
   async getViewExhibitor(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !loginUser ||
        !loginUser.id
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().getViewExhibitor(req, loginUser.id);

      finalResponse.data=result;

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

   /************************
   * get History Date
   */
   async getViewExhibitorDetails(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !loginUser ||
        !loginUser.id
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().getViewExhibitorDetails(req, loginUser.id);

      finalResponse.data=result;

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

     /************************
   * get History Date
   */
     async getViewExhibtr(req: any, event: any, context: Context): Promise<any> {
      let loginUser = getAuthorizerUser(event);
      let finalResponse = getDefaultResponse();
      try {
        if (
          !loginUser ||
          !loginUser.id
        ) {
          finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
          finalResponse.code = Codes.BAD_REQUEST;
          return Promise.resolve(finalResponse);
        }
        let result: any;
        result = await new UserMgmtDao().getViewExhibtr(req, loginUser.id);
  
        finalResponse.data=result;
  
        return Promise.resolve(finalResponse);
      } catch (e) {
        return Promise.reject(e);
      }
    }

  /************************
   * get task assign to list
   */
  async getTaskAssignToList(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      // console.log("loginUser ** ", loginUser);
      //check validation
      if (!loginUser || !loginUser.id || !req.eventId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().getTaskAssignToList(req, loginUser.id);

      console.log("result *** ", result);

      let finalResult = {
        isCrew: 0,
        client: {},
        eventManager: {},
        venues: <any>[],
        services: <any>[],
        exhibitors: <any>[],
        taskData: {},
      };

      if (
        result &&
        result[0] &&
        result[1] &&
        result[2] &&
        result[3] &&
        result[4] &&
        result[5]
      ) {
        console.log("result *** ", result);
        let isTaskAssignedYet = 1;
        // console.log("result[0][0].isTaskAssignedYet == 0 , req.creatorFromCompanyId ", result[0][0].isTaskAssignedYet == 0 , req.creatorFromCompanyId);
        if (result[0][0].isTaskAssignedYet == 0 && req.creatorFromCompanyId) {
          isTaskAssignedYet = 0;
        }

        let cont = 0;
        result[2].forEach(function (item) {
          let isChecked = 0;
          let isCrew = 0;
          cont++;
          if (
            !isTaskAssignedYet &&
            req.creatorFromCompanyId == item.companyId
          ) {
            isChecked = 1;
          } else if (req.taskId > 0) {
            isChecked = item.taskId ? 1 : 0;
          }
          if (result[6] && result[6].length) {
            result[6].forEach(function (crew) {
              if (crew.user_type == "Crew") {
                if (item.companyId == crew.companyId) {
                  isCrew = 1;
                  finalResult.isCrew = 1;
                  isChecked = 1;
                }
              } else {
                isCrew = 0;
                finalResult.isCrew = 0;
              }
            });
          }

          item.roleText = item.roleText
            ? item.roleText + ", "
            : "Venue" + cont + ", ";
          if (item.venueCompany) {
            finalResult.venues.push({
              id: item.venueId,
              companyName: item.roleText + " " + item.venueCompany,
              companyId: item.companyId,
              isChecked: isChecked,
              isCrew: isCrew,
              tabType: 3,
              utId: item.ut_id,
              isCompleted: item.status ? item.status : 0,
              isMyCompany: item.isMyCompany,
            });
          }
        });

        result[3].forEach(function (item) {
          let isChecked = 0;
          let isCrew = 0;
          if (
            !isTaskAssignedYet &&
            req.creatorFromCompanyId == item.companyId
          ) {
            isChecked = 1;
          } else if (req.taskId > 0) {
            isChecked = item.taskId ? 1 : 0;
          }
          if (result[7] && result[7].length) {
            result[7].forEach(function (crew) {
              if (crew.user_type == "Crew") {
                if (item.companyId == crew.companyId) {
                  isCrew = 1;
                  finalResult.isCrew = 1;
                  isChecked = 1;
                }
              } else {
                isCrew = 0;
                finalResult.isCrew = 0;
              }
            });
          }

          item.roleText = item.roleText ? item.roleText + ", " : "Service, ";
          if (item.serviceCompany) {
            finalResult.services.push({
              id: item.serviceId,
              companyName: item.roleText + " " + item.serviceCompany,
              companyId: item.companyId,
              isChecked: isChecked,
              isCrew: isCrew,
              tabType: 4,
              utId: item.ut_id,
              isCompleted: item.status ? item.status : 0,
              isMyCompany: item.isMyCompany,
            });
          }
        });

        result[4].forEach(function (item) {
          let isChecked = 0;
          let isCrew = 0;
          if (
            !isTaskAssignedYet &&
            req.creatorFromCompanyId == item.companyId
          ) {
            isChecked = 1;
          } else if (req.taskId > 0) {
            isChecked = item.taskId ? 1 : 0;
          }
          if (result[8] && result[8].length) {
            result[8].forEach(function (crew) {
              if (crew.user_type == "Crew") {
                if (item.companyId == crew.companyId) {
                  isCrew = 1;
                  finalResult.isCrew = 1;
                  isChecked = 1;
                }
              } else {
                isCrew = 0;
                finalResult.isCrew = 0;
              }
            });
          }

          item.roleText = item.roleText ? item.roleText + ", " : "Exhibitor, ";
          if (item.exhibitorCompany) {
            finalResult.exhibitors.push({
              id: item.exhibitorId,
              companyName: item.roleText + " " + item.exhibitorCompany,
              companyId: item.companyId,
              isChecked: isChecked,
              isCrew: isCrew,
              tabType: 5,
              utId: item.ut_id,
              isCompleted: item.status ? item.status : 0,
              isMyCompany: item.isMyCompany,
            });
          }
        });

        /*
      let isCheckedClient = 0 ; 
      let isCheckedEM = 0 ; 
      result[5].forEach(function (item) {
        if(item.tab_no == 1){  // if task created for client
          isCheckedClient = 1; 
        }
        if(item.tab_no == 2){ // if task created for event manager
          isCheckedEM = 1 ; 
        }
      });
      */
        //  console.log("isTaskAssignedYet && req.creatorFromCompanyId == result[1][0].clientCompanyId", isTaskAssignedYet , req.creatorFromCompanyId , result[1][0].clientCompanyId);
        let isClientChecked = 0;
        if (
          !isTaskAssignedYet &&
          req.creatorFromCompanyId == result[1][0].clientCompanyId
        ) {
          isClientChecked = 1;
        } else {
          isClientChecked = result[1][0].isClientTask;
        }
        let isEMChecked = 0;
        if (
          !isTaskAssignedYet &&
          req.creatorFromCompanyId == result[1][0].eventManagerCompanyId
        ) {
          isEMChecked = 1;
        } else {
          isEMChecked = result[1][0].isEMTask;
        }

        if (
          result &&
          result[1] &&
          result[1][0] &&
          result[1][0].clientCompanyName
        ) {
          finalResult.client = {
            id: req.eventId,
            companyName: "Client, " + result[1][0].clientCompanyName,
            isChecked: isClientChecked,
            // isCrew: isClientCrew,
            companyId: result[1][0].clientCompanyId,
            tabType: 1,
            utId: result[1][0].ut_cl_id,
            isCompleted: result[1][0].cl_status ? result[1][0].cl_status : 0,
            isMyCompany: result[1][0].isMyCLCompany,
          }; // result[1][0].clientId   , isChecked: isCheckedClient
        }

        finalResult.eventManager = {
          id: req.eventId,
          companyName: "Event Manager, " + result[1][0].eventManagerName,
          isChecked: isEMChecked,
          // isCrew: isEMCrew,
          companyId: result[1][0].eventManagerCompanyId,
          tabType: 2,
          utId: result[1][0].ut_em_id,
          isCompleted: result[1][0].em_status ? result[1][0].em_status : 0,
          isMyCompany: result[1][0].isMyEMCompany,
        }; // result[1][0].eventManagerId ,  isChecked: isCheckedEM

        finalResult.taskData = {};
        if (result && result[5] && result[5][0]) {
          let temp = result[5][0];
          temp.dueDate = temp.dueDate ? moment(temp.dueDate) : null;
          finalResult.taskData = temp;
        }
      }

      if (
        result &&
        result[0] &&
        result[0][0] &&
        result[0][0].msg == "SUCCESS"
      ) {
        finalResponse.data = finalResult;
        finalResponse.message = CONSTANTS.SUCCESS;
      }
      // else if (result && result[0] && result[0][0] && result[0][0].msg == "NO_ACCESS" ) {
      //   finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
      // }
      else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * delete event task
   */
  async deleteEventTask(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!loginUser || !loginUser.id) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().deleteEventTask(req, loginUser.id);
      if (
        result &&
        result[0] &&
        result[0][0] &&
        result[0][0].msg == "SUCCESS"
      ) {
        finalResponse.message = CONSTANTS.TASK_SUCCESSFULLY_DELETED;
      } else if (
        result &&
        result[0] &&
        result[0][0] &&
        result[0][0].msg == "ALREADY_COMPLETED"
      ) {
        finalResponse.code = Codes.BAD_REQUEST;
        finalResponse.message = CONSTANTS.ALREADY_COMPLETED;
      } else if (
        result &&
        result[0] &&
        result[0][0] &&
        result[0][0].msg == "NO_PERMISSION"
      ) {
        finalResponse.code = Codes.BAD_REQUEST;
        finalResponse.message = CONSTANTS.NO_PERMISSION_TO_DELETE_TASK;
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * list Event Task
   */
  async listEventTask(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!loginUser || !loginUser.id) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().listEventTask(req, loginUser.id);
      // console.log("result *** ", result);

      if (result && result[0] && result[1]) {
        finalResponse.message = CONSTANTS.SUCCESS;
        if (result[0].length == 0 && result[1].length == 0) {
          finalResponse.message = CONSTANTS.NO_TASK_FOUND_FOR_YOUR_COMPANY;
        }

        // let checkDelegatedTaskIds: any = [];
        // if(result[4] && result[4].length > 0){
        //   checkDelegatedTaskIds = _.map(result[4], 'taskId'); // [12, 14, 16, 18]
        // }

        let completedTaskDated: any = [];
        let unCompletedTaskDated: any = [];
        let completedTaskUndated: any = [];
        let uncompletedTaskUndated: any = [];

        result[0].map((obj) => {
          if (obj.status == 1) {
            completedTaskDated.push(obj);
          } else {
            unCompletedTaskDated.push(obj);
          }
        });
        result[1].map((obj) => {
          if (obj.status == 1) {
            completedTaskUndated.push(obj);
          } else {
            uncompletedTaskUndated.push(obj);
          }
        });

        let taskIdOrder = result[2].map((obj) => obj.taskId);
        completedTaskUndated = _.sortBy(completedTaskUndated, function (item) {
          return taskIdOrder.indexOf(item.taskId) != -1
            ? taskIdOrder.indexOf(item.taskId)
            : Infinity;
        }); //   return taskIdOrder.indexOf(item.taskId)
        uncompletedTaskUndated = _.sortBy(
          uncompletedTaskUndated,
          function (item) {
            return taskIdOrder.indexOf(item.taskId) != -1
              ? taskIdOrder.indexOf(item.taskId)
              : Infinity;
          }
        ); //   return taskIdOrder.indexOf(item.taskId)

        let taskIdDateOrder = result[3].map((obj) => obj.taskId);

        completedTaskDated = _.sortBy(completedTaskDated, function (item) {
          return taskIdDateOrder.indexOf(item.taskId) != -1
            ? taskIdDateOrder.indexOf(item.taskId)
            : Infinity;
        }); //   return taskIdDateOrder.indexOf(item.taskId)
        unCompletedTaskDated = _.sortBy(unCompletedTaskDated, function (item) {
          return taskIdDateOrder.indexOf(item.taskId) != -1
            ? taskIdDateOrder.indexOf(item.taskId)
            : Infinity;
        }); //   return taskIdDateOrder.indexOf(item.taskId)

        finalResponse.data = {
          completedTaskDated: completedTaskDated,
          unCompletedTaskDated: unCompletedTaskDated,
          completedTaskUndated: completedTaskUndated,
          uncompletedTaskUndated: uncompletedTaskUndated,
        };
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * list Event Task
   */
  async changeTaskStatus(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!loginUser || !loginUser.id) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().changeTaskStatus(req, loginUser.id);

      let assignedTo = _.map(result[1], "assignedTo");
      // console.log("result *** ", result);
      // console.log("tmp ** ", tmp);
      if (
        result &&
        result[0] &&
        result[0][0] &&
        result[0][0].msg == "SUCCESS" &&
        req.checkOnly == 1
      ) {
        let str = "";
        let cnt = 1;
        for (const element of assignedTo) {
          str += "<br>" + cnt + ".) " + element;
          cnt++;
        }

        finalResponse.message =
          "<p>Are you sure to change status of this task for below role - " +
          str +
          "</p>";
        finalResponse.data = { isUpdated: 0, result: result };
      } else if (
        result &&
        result[0] &&
        result[0][0] &&
        result[0][0].msg == "UPDATED"
      ) {
        finalResponse.message = CONSTANTS.TASK_STATUS_UPDATED_SUCCESSFULLY;
        finalResponse.data = { isUpdated: 1 };
      } else if (
        result &&
        result[0] &&
        result[0][0] &&
        result[0][0].msg == "NO_PERMISSION"
      ) {
        finalResponse.code = Codes.UNAUTHORIZED;
        finalResponse.message = CONSTANTS.NO_PERMISSION_TO_UPDATE_TASK;
      } else {
        finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
        finalResponse.code = Codes.UNAUTHORIZED;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /************************
   * update user task order
   */
  async updateUserTaskOrder(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation

      if (
        !loginUser ||
        !loginUser.id ||
        !req.loginCompanyId ||
        !req.eventId ||
        !req.tasks ||
        req.tasks.length <= 0
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let result: any;
      result = await new UserMgmtDao().updateUserTaskOrder(req, loginUser.id);
      // console.log("result *** ", result);

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }


  async sendEmailFromInvokeFunV1(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
     console.log('req in send email...', req);
      //check validation
      if (!req) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      console.log("invoke lambda ** ** ", req);
      let result: any;
      // result = await sendEmailFromInvoke(req.emailId);
      sendEventNotification( req.userResult, req.userResult, req.eventId, req.tabType, req.companyId );
  

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }



}
