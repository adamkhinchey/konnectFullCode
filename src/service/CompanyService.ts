import * as dotenv from "dotenv";
import * as _ from "lodash";
import { Codes, CONSTANTS } from "../util/SiteConfig";
import { Context } from "vm";
import { CompanyDao } from "../daos/CompanyDao";
import { UserMgmtDao } from "../daos/UserMgmtDao";
import {
  isValidString,
  getDefaultResponse,
  getAuthorizerUser,
} from "../util/helper";
import { CompanyProfile } from "../Model/CompanyProfile";
import { AssignUserToCompany } from "../Model/request/AssignUserToCompany";
import { CompanyAssignType } from "../enums/CompanyAssignType";
import { CompanyRole } from "../enums/ComanyRole";
import { commonDao } from "../daos/commonDao";
import {
  sendEmailOnClaim,
  sendEmailOnJoinRequest,
  sendEmailOnCreateNewCompany,
  inviteCompanyColleague,
  sendNotification_003,
  sendNotification_004,
  sendNotification_007,
  sendNotification_008
} from "./EmailService";
import * as jwt from "jsonwebtoken";

export class CompanyService {
  constructor() {
    dotenv.config();
    // AWS.config.region = process.env["region"];
  }

  /**
   * search company
   */
  async searchCompany(req: any, event: any, context: Context): Promise<any> {
    let loginUserId = 0;
    if (event.headers.Authorization) {
      var decoded = jwt.verify(
        event.headers.Authorization,
        process.env.EncryptionKEY
      );

      if (decoded.data.id) {
        loginUserId = decoded.data.id;
      }
    }

    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!req) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new CompanyDao().searchCompany(req, loginUserId);
      if (result && result.length > 0) {
        /*if (isValidString(req.domain)) {
          finalResponse.data = { company: result[0] };
        } else {*/
          finalResponse.data = { companyList: result };
        /*}*/
      } else {
        finalResponse.data = [];
      }


      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }
/**
   * search company For Domain
   */
async searchCompanyForDomain(req: any, event: any, context: Context): Promise<any> {
  let loginUserId = 0;
  if (event.headers.Authorization) {
    var decoded = jwt.verify(
      event.headers.Authorization,
      process.env.EncryptionKEY
    );

    if (decoded.data.id) {
      loginUserId = decoded.data.id;
    }
  }

  let finalResponse = getDefaultResponse();
  try {
    //check validation
    if (!req) {
      finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
      finalResponse.code = Codes.BAD_REQUEST;
      return Promise.resolve(finalResponse);
    }

    let result: any;
    result = await new CompanyDao().searchCompanyForDomain(req, loginUserId);
    if (result && result.length > 0) {
      /*if (isValidString(req.domain)) {
        finalResponse.data = { company: result[0] };
      } else {*/
        finalResponse.data = { companyList: result };
      /*}*/
    } else {
      finalResponse.data = [];
    }


    return Promise.resolve(finalResponse);
  } catch (e) {
    return Promise.reject(e);
  }
}
  /**
   * search company for event
   */
  async searchCompanyForEvent(req: any, event: any, context: Context): Promise<any> {
    let loginUserId = 0;
    if (event.headers.Authorization) {
      var decoded = jwt.verify(
        event.headers.Authorization,
        process.env.EncryptionKEY
      );

      if (decoded.data.id) {
        loginUserId = decoded.data.id;
      }
    }

    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!req) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new CompanyDao().searchCompanyForEvent(req, loginUserId);

      if (result && result.length > 0) {
        /*if (isValidString(req.domain)) {
          finalResponse.data = { company: result[0] };
        } else {*/
          finalResponse.data = { companyList: result };
        /*}*/
      } else {
        finalResponse.data = [];
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * get Region And Country List
   */
  async getRegionAndCountryList(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    req = event.queryStringParameters;

    let finalResponse = getDefaultResponse();
    try {
      let result: any;
      result = await new CompanyDao().getRegionAndCountryList(req);

      if (result && result.length > 0) {
        finalResponse.data = { regionList: result[0], countryList: result[1] };
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
   * assign company to user
   */
  async assignCompanyToUser(
    req: AssignUserToCompany,
    event: any,
    context: Context
  ): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!req) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      req.createdByUserId = getAuthorizerUser(event).id; //get login user id from jwt token
      if (req.assignType == CompanyAssignType.claim) {
        req.companyRoleId = CompanyRole.company_admin;
      } else {
        req.companyRoleId = CompanyRole.company_member;
      }
      let result: any;
      result = await new CompanyDao().assignUserToCompany(req);

      if (result && result.msg == "SUCCESS") {

        //send notification for claiming user
        if (req.assignType == CompanyAssignType.claim) {
          let data = {
            email: result.email,
            userName: result.userName,
            CompanyName: result.companyName,
            KonnectSiteURL: process.env.SITE_URL,
            companyId: req.companyId,
            userId: req.userId
          };
          await sendEmailOnClaim(data);
        } else if (req.assignType == CompanyAssignType.join_request) {
          //send notification for join request user and admin
          let data = {
            email: result.email,
            userName: result.userName,
            CompanyName: result.companyName,
            KonnectSiteURL: process.env.SITE_URL,
            companyId: req.companyId,
            userId: req.userId
          };
          //send emai to join requester and company admins
          await sendEmailOnJoinRequest(data);
        }

        if(req.assignType != CompanyAssignType.join_request){
          await new UserMgmtDao().makeUserAndHisCompanyPublic(req.userId);
        }

      } else {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * get category List
   */
  async getCategoryList(req: any, event: any, context: Context): Promise<any> {
    req = event.queryStringParameters;

    let finalResponse = getDefaultResponse();
    try {
      let result: any;
      result = await new CompanyDao().getCategoryList(req);

      if (result && result.length > 0) {
        finalResponse.data = { categoryList: result[0] };
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
   * create company
   */
  async createCompany(
    req: CompanyProfile,
    event: any,
    context: Context
  ): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
      //check validations
      if (
        !req.companyName ||
        !req.companyType ||
        !req.userId ||
        !req.city ||
        !req.countryId ||
        !req.categoryIds
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      // let user: any = await new UserMgmtDao().getUserById(req.userId);

      // let is_verified = user.is_verified;
      let result: any;
      result = await new CompanyDao().createCompany(req);

      if (result && result.msg == "SUCCESS" && result.id > 0) {
        req.id = result.id;
        finalResponse.data = { company: req };
        //send email
        let data = {
          userId: req.userId,
          CompanyName: result.companyName,
          KonnectSiteURL: process.env.SITE_URL,
          companyId: req.id,
          companyCount: result.companyCount,
          // is_verified: is_verified
        };
        await sendEmailOnCreateNewCompany(data);

        await new UserMgmtDao().makeUserAndHisCompanyPublic(req.userId,result.id);
      } else if (result && result.msg == "COMPANY_EXISTS") {
        finalResponse.message = CONSTANTS.COMPANY_ALREADY_EXIST;
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
   * remove company association
   */
  async removeCompanyAssocaition(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!req || !req.companyId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let userId: number;
      if (!req.userId || req.userId == 0) {
        userId = getAuthorizerUser(event).id;
      } else {
        userId = req.userId;
      }

      let result: any;
      result = await new CompanyDao().removeCompanyAssocaition(
        userId,
        req.companyId
      );

      if (result && result.msg == "SUCCESS") {
        // TODO send email according to the assign type
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
   * get company profile and members
   *
   */
  async getCompanyProfileAndMembers(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    req = event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      // loginUser.id = 54;
      let result: any;
      result = await new CompanyDao().getCompanyProfileAndMembers(
        loginUser.id,
        req.companyId,
        CompanyRole.company_member
      );

      if (result && result.length > 0 && result[0].length > 0) {
        result[0][0]["category"] = null;
        if (result[2][0].cat_ids) {
          let cat_arr = result[2][0].cat_ids.split(",").map(function (x) {
            return parseInt(x, 10);
          });
          result[0][0]["category"] = cat_arr;
        }

        let isCompanyAdmin = 0;
        if (result[3].length > 0) {
          isCompanyAdmin = 1;
        }

        finalResponse.data = {
          company: result[0][0],
          staff: result[1],
          isCompanyAdmin: isCompanyAdmin,
        };
      } else {
        finalResponse.message = CONSTANTS.NOT_A_ADMIN_OR_STAFF;
        finalResponse.code = Codes.BAD_REQUEST;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /***
   * make company admin
   *
   */
  async makeCompanyAdmin(req: any, event: any, context: Context): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (!req || !req.companyId || !loginUser.id || !req.userId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      // loginUser.id = req.loginUserId ;

      let result: any;
      result = await new CompanyDao().makeCompanyAdmin(
        req.companyId,
        loginUser.id,
        req.userId,
        req.isAdmin
      );

      if (result && result[0] && result[0][0]) {
        result = result[0][0];

        finalResponse.message = CONSTANTS[result.msg]
          ? CONSTANTS[result.msg]
          : CONSTANTS.FAILED;
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
   * accept reject company join request
   *
   */
  async approveRejectCompanyJoinRequest(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (!req || !req.companyId || !loginUser.id || !req.userId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new CompanyDao().approveRejectCompanyJoinRequest(
        req.companyId,
        loginUser.id,
        req.userId,
        req.status
      );

      if (result && result[0] && result[0][0]) {
        result = result[0][0];

        if (result && result.msg == "SUCCESS") {
          let user: any;

          user = await new UserMgmtDao().getUserById(req.userId);
          let cmp_profile: any;
          cmp_profile = await new CompanyDao().getCompanyById(req.companyId);
          // user.email = 'testabc1@getnada.com';
          let emailTemplate;
          let data;

          if (req.status == 1) {
            // approve
            sendNotification_003({
              user_id: user.id,
              company_id: cmp_profile[0][0].id,
            });

            // if request approved make user public
            await new UserMgmtDao().makeUserAndHisCompanyPublic(req.userId);
          } else if (req.status == 0) {
            // reject
            sendNotification_004({
              user_id: user.id,
              company_id: cmp_profile[0][0].id,
            });
          }
        }

        finalResponse.message = CONSTANTS[result.msg]
          ? CONSTANTS[result.msg]
          : CONSTANTS.FAILED;
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
   * save colleague position
   *
   */
  async saveColleaguePosition(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !req ||
        !req.companyID ||
        !loginUser.id ||
        !req.positionArray ||
        req.positionArray.length < 1
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      // loginUser.id = 3;
      let result: any;
      result = await new CompanyDao().saveColleaguePosition(
        req.companyID,
        loginUser.id,
        req.positionArray
      );

      if (result && result[0] && result[0][0]) {
        result = result[0][0];

        finalResponse.message = CONSTANTS[result.msg]
          ? CONSTANTS[result.msg]
          : CONSTANTS.FAILED;
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
   * invite company colleague
   *
   */
  async inviteCompanyColleague(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !req ||
        !req.name ||
        !loginUser.id ||
        !req.email ||
        !req.position ||
        !req.companyId ||
        !req.inviteUID
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new CompanyDao().inviteCompanyColleague(
        req.name,
        req.email,
        req.position,
        req.companyId,
        loginUser.id,
        req.inviteUID
      );

      if (result && result[0] && result[0][0]) {
        result = result[0][0];

        if (result.msg == "NOT_A_MEMBER" || result.msg == "ALREADY_INVITED") {
          finalResponse.code = Codes.BAD_REQUEST;
        }

        let user_id;
        if (result.otherUserId) {
          user_id = result.otherUserId;


          if (user_id && loginUser.id && req.companyId) {
            // commented on 13-08-21 as not required
            /*
            inviteCompanyColleague({
              user_id: user_id,
              admin_id: loginUser.id,
              companyId: req.companyId,
              UID: req.inviteUID,
            });
            */

            sendNotification_008({
              user_id: user_id,
              company_id: req.companyId,
              loginUserId: loginUser.id,
              pri_user_uuid: req.inviteUID,
            }); // commentd on 29-04-21 as not required according to client

          }

        } else if (result.newUserId) {
          user_id = result.newUserId;



          if (user_id && loginUser.id && req.companyId) {
            // commented on 13-08-21 as not required

            /*
            inviteCompanyColleague({
              user_id: user_id,
              admin_id: loginUser.id,
              companyId: req.companyId,
              UID: req.inviteUID,
            });
            */

            sendNotification_007({
              user_id: user_id,
              company_id: req.companyId,
              loginUserId: loginUser.id,
              pri_user_uuid: req.inviteUID,
            }); // commentd on 29-04-21 as not required according to client



          }



        }





        // email send end
        finalResponse.message = CONSTANTS[result.msg]
          ? CONSTANTS[result.msg]
          : CONSTANTS.FAILED;
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
  async getCompanyColleaguesWithSegregation(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    req = event.queryStringParameters;
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      let result: any;
      result = await new CompanyDao().getCompanyColleaguesWithSegregation(
        loginUser.id,
        req.companyId
      );

      if (result && result.length > 0) {
        finalResponse.data = {
          admins: result[0],
          colleagues: result[1],
          joinRequests: result[2],
          invitesPending: result[3],
        };
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
  async updateCompanyProfile(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      if (
        !req ||
        !req.companyId ||
        !req.companyName ||
        !req.city ||
        !req.countryId ||
        // !req.website ||
        !req.category
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new CompanyDao().updateCompanyProfile(
        req.companyId,
        req.companyName,
        req.companyTaxNumber,
        req.streetAddress1,
        req.streetAddress2,
        req.city,
        req.state,
        req.countryId,
        req.postCode,
        req.phone,
        req.website,
        req.companyProfileImage,
        req.description,
        req.category,
        loginUser.id
      ); // category will be array of id

      if (result && result[0][0].msg == "SUCCESS") {
        // && result[0][0]
      } else if (result && result[0][0].msg == "NOT_AN_ADMIN") {
        finalResponse.message = CONSTANTS.NOT_AN_ADMIN;
        finalResponse.code = Codes.BAD_REQUEST;
      } else if (result && result[0][0].msg == "COMPANY_EXISTS") {
        finalResponse.message = CONSTANTS.DOMAIN_ALREADY_EXISTS;
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
}
