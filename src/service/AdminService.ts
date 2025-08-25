import * as dotenv from "dotenv";
import * as _ from "lodash";
import { Codes, CONSTANTS } from "../util/SiteConfig";
import { UserMgmtDao } from "../daos/UserMgmtDao";
import { AdminMgmtDao } from "../daos/AdminMgmtDao";
import { UserProfile } from "../Model/UserProfile";
import { BulkImportExportType } from "../enums/CompanyAssignType";
import { sendEventNotification } from "../service/EmailService";
import { Context } from "vm";
import {
  asyncLambdaCallForCreateEventDirectoryStructure,
  getS3FileUploadSignedURL,
} from "../util/AwsS3SignedUrlUtil";
import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import {
  isValidString,
  getDefaultResponse,
  getAuthorizerUser,
  bucketImageDelete,
  bucketImageUpload,
  sendEmailFromInvoke,
} from "../util/helper";
import { commonDao } from "../daos/commonDao";
import {
  sendResetPaawordLinkEmail,
  inviteCompanyColleague,
  sendNotification_000,
  sendNotification_006,
  sendNotification_007,
  sendNotification_008,
  sendNotification_011,
  sendNotification_012,
  sendNotification_013,
  sendNotification_014,
  sendNotification_002,
  sendNotification_003,
  sendNotification_010,
  sendNotification_004,
  sendNotification_005,
} from "./EmailService";
import { CompanyDao } from "../daos/CompanyDao";
import { Console } from "console";
import moment = require("moment");
export class AdminMgmtService {
  constructor() {
    dotenv.config();
    // AWS.config.region = process.env["region"];
  }

  /************************
   * login
   */
  async adminLogin(req: any, event: any, context: Context): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!req || !isValidString(req.email) || !isValidString(req.password)) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new AdminMgmtDao().adminLogin(req, true); // true for admin login

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
   * list users
   */
  async listUsers(req: any, event: any, context: Context): Promise<any> {
    let finalResponse = getDefaultResponse();
    let loginUser = getAuthorizerUser(event);
    try {
      //check validation
      if (!req) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new AdminMgmtDao().listUsers(loginUser.id); // true for admin login

      if (result && result[0] && result[0][0] && result[0][0].isAdmin == 1) {
        finalResponse.data = result[1];
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
   * get user detail
   */
  async getUserDtail(req: any, event: any, context: Context): Promise<any> {
    req = event.queryStringParameters;
    let finalResponse = getDefaultResponse();
    let loginUser = getAuthorizerUser(event);
    try {
      //check validation
      if (!req || !req.userId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new AdminMgmtDao().getUserDtail(loginUser.id, req.userId); // true for admin login

      if (result && result[0] && result[0][0] && result[0][0].isAdmin == 1) {
        finalResponse.data = result[1];
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
   * get user detail
   */
  async getCurrentEventsList(req: any, event: any, context: Context): Promise<any> {
    req = event.queryStringParameters;
    let finalResponse = getDefaultResponse();
    let loginUser = getAuthorizerUser(event);
let {eventId}=event.queryStringParameters
    if (
        !loginUser.id ||
        !eventId
      ) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

    try {
    
      let result: any;
      result = await new AdminMgmtDao().getCurrentEventsList( eventId,loginUser.id); // true for admin login

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
   * update admin profile
   */
  async updateAdminProfile(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let finalResponse = getDefaultResponse();
    let loginUser = getAuthorizerUser(event);

    try {
      //check validation
      if (!req || !loginUser.id || !req) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new AdminMgmtDao().updateAdminProfile(loginUser.id, req); // true for admin login

      if (result && result[0] && result[0][0] && result[0][0].isAdmin == 1) {
        // finalResponse.data=result[1];
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
   * change admin password
   */
  async changeAdminPassword(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
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
      result = await new AdminMgmtDao().changeAdminPassword(
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
   * change user status
   */
  async changeUserStatus(req: any, event: any, context: Context): Promise<any> {
    req = event.queryStringParameters;
    let finalResponse = getDefaultResponse();
    let loginUser = getAuthorizerUser(event);
    try {
      //check validation
      if (!req || !req.userId) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new AdminMgmtDao().changeUserStatus(
        loginUser.id,
        req.userId,
        req.status
      ); // true for admin login

      if (result && result[0] && result[0][0] && result[0][0].isAdmin == 1) {
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
   * import export services and exhibitors
   */

  async importExportServicesAndExhibitors(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    console.log("req...", req);
    let finalResponse = getDefaultResponse();
    // let loginUser = getAuthorizerUser(event);
    let loginUser = { id: req.userId };
    try {
      //check validation
      if (
        !req ||
        !loginUser.id ||
        !req.eventId ||
        !req.tabType ||
        !req.actionType
      ) {
        // tabType = 4 for services , tabType = 5 for exhibitors, actionType = 1 for import, actionType = 2 for export
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;

      const readXlsxFile = require("read-excel-file/node");

      const https = require("https");
      const url = req.url; //   "https://dev-konnectapp-media.s3.ap-southeast-2.amazonaws.com/konnect_services.xlsx"; // "https://dev-konnectapp-media.s3.ap-southeast-2.amazonaws.com/konnect_exhibitors.xlsx" ; //

      // 'https://dev-konnectapp-media.s3.ap-southeast-2.amazonaws.com/SampleFiles/konnect_exhibitors.xlsx'; //  'https://dev-konnectapp-media.s3.ap-southeast-2.amazonaws.com/SampleFiles/konnect_services.xlsx';

      let cont;
      let errorData: any = null;
      let fileData: any = null;
      let userProfileData: any = [];
      let emailMobile: any = [];
      let companyProfileData: any = [];
      let serviceData: any = [];
      let exhibitorData: any = [];
      let serviceExhibitorData: any = [];
      if (
        (req.tabType == BulkImportExportType.services ||
          req.tabType == BulkImportExportType.exhibitors) &&
        req.actionType == BulkImportExportType.import
      ) {
        await new Promise(function (resolve, reject) {
          https.get(url, (stream) => {
            readXlsxFile(stream).then((rows) => {
              // , { sheet: 2 } for sheet number
              console.log("rows *** ", rows);
              fileData = rows;
              // let re = new RegExp(
              //   /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/
              // );
              let re = new RegExp(
                /^(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[\w]{2,}(\/\S*)?$/
              );
              // return domain.match(re);
              let phrx = new RegExp(/[^a-zA-Z]+/g);

              let EMAIL_REGEX =
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

              for (cont = 1; cont < rows.length; cont++) {
                console.log("in loop", rows[cont]);
                let record = rows[cont];
                // record[10] = "testfst_20_03_2022@yopmail.com";
                // record[1] = "www.testcmp2022.com";

                if (req.tabType == BulkImportExportType.services) {
                  // [ 'Service Name', 'Website', 'Company Name', 'Country', 'City',  'Address 1', 'Address 2', 'Postcode','State/Region', 'Phone', 'Email', 'First Name', 'Second Name', 'Mobile'  ],
                  errorData =
                    record[0] &&
                      (typeof record[0] === "string" ||
                        record[0] instanceof String)
                      ? null
                      : "Service Name";
                  if (errorData) break; // for service name
                } else if (req.tabType == BulkImportExportType.exhibitors) {
                  // [ 'Stand Number', 'Website', 'Company Name', 'Country', 'City', 'Address 1', 'Address 2', 'Postcode', 'State/Region', 'Phone', 'Email', 'First Name', 'Second Name',  'Mobile'  ],
                  errorData =
                    !record[0] ||
                    typeof record[0] === "string" ||
                    record[0] instanceof String
                      ? null
                      : "Stand Number";
                  if (errorData) break; // for Stand Number
                }
                console.log("record 1...", record[1]);
                console.log("type of...", typeof record[1] === "string");
                console.log("instanceof...", record[1] instanceof String);
                // console.log('match...', record[1].match(re));
                errorData =
                  record[1] &&
                    (typeof record[1] === "string" ||
                      record[1] instanceof String) &&
                    record[1].match(re)
                    ? null
                    : "Website"; // for Website
                if (errorData) break;
                errorData =
                  record[2] &&
                    (typeof record[2] === "string" || record[2] instanceof String)
                    ? null
                    : "Company Name";
                if (errorData) break; // for Company Name

                let cntry = Math.floor(Number(record[3]));
                // console.log("cntry *** ", cntry);
                errorData =
                  cntry &&
                    cntry !== Infinity &&
                    String(cntry) === String(record[3]) &&
                    cntry >= 0
                    ? null
                    : "Country";
                if (errorData) break; // for Country

                errorData =
                  record[4] &&
                    (typeof record[4] === "string" || record[4] instanceof String)
                    ? null
                    : "City";
                if (errorData) break; // for City
                errorData =
                  !record[5] ||
                    typeof record[5] === "string" ||
                    record[5] instanceof String
                    ? null
                    : "Address 1";
                if (errorData) break; // for Address 1
                errorData =
                  !record[6] ||
                    typeof record[6] === "string" ||
                    record[6] instanceof String
                    ? null
                    : "Address 2";
                if (errorData) break; // for Address 2
                errorData =
                  !record[7] ||
                    typeof record[7] === "string" ||
                    record[7] instanceof String ||
                    Number.isInteger(record[7])
                    ? null
                    : "Postcode";
                if (errorData) break; // for Postcode
                errorData =
                  !record[8] ||
                    typeof record[8] === "string" ||
                    record[8] instanceof String
                    ? null
                    : "State/Region";
                if (errorData) break; // for State/Region

                errorData =
                  !record[9] ||
                    ((typeof record[9] === "string" ||
                      record[9] instanceof String ||
                      Number.isInteger(record[9])) &&
                      String(record[9]).match(phrx))
                    ? null
                    : "Phone";
                if (errorData) break; // for Phone
                errorData =
                  record[10] &&
                    (typeof record[10] === "string" ||
                      record[10] instanceof String) &&
                    record[10].match(EMAIL_REGEX)
                    ? null
                    : "Email";
                if (errorData) break; // for Email

                errorData =
                  record[11] &&
                    (typeof record[11] === "string" ||
                      record[11] instanceof String)
                    ? null
                    : "First Name";
                if (errorData) break; // for First Name
                errorData =
                  !record[12] ||
                    typeof record[12] === "string" ||
                    record[12] instanceof String
                    ? null
                    : "Second Name";
                if (errorData) break; // for Second Name
                errorData =
                  !record[13] ||
                    ((typeof record[13] === "string" ||
                      record[13] instanceof String ||
                      Number.isInteger(record[13])) &&
                      String(record[13]).match(phrx))
                    ? null
                    : "Mobile";
                if (errorData) break; // for Mobile
                emailMobile.push({
                  email: record[10],
                  mobile: record[13],
                });
                userProfileData.push({
                  email: record[10],
                  country_id: record[3],
                  city: record[4],
                  first_name: record[11],
                  last_name: record[12],
                });
                companyProfileData.push({
                  email: record[10],
                  website: record[1],
                  company_name: record[2],
                  street_address_1: record[5],
                  street_address_2: record[6],
                  postcode: record[7],
                  phone: record[9],
                  state: record[8],
                  country_id: record[3],
                  city: record[4],
                });
                serviceData.push({
                  email: record[10],
                  website: record[1],
                  event_id: req.eventId,
                  venue_id: req.venueId,
                  service_name: record[0],
                  created_by: loginUser.id,
                  sameAsVenueFlag: record[14],
                });
                exhibitorData.push({
                  email: record[10],
                  website: record[1],
                  event_id: req.eventId,
                  venue_id: req.venueId,
                  standNumber: record[0],
                  created_by: loginUser.id,
                  sameAsVenueFlag: record[14],
                });
              }
              if (errorData) {
                // file has wrong data
                console.log("in error data...", errorData);
              }
              resolve(1);
            });
          });
        });
        console.log("file data length...", fileData.length);
        if (errorData) {
          // if getting error in file then delete file and send error
          let key = url.substring(url.lastIndexOf("/") + 1); // "SampleFiles/" +
          bucketImageDelete(key); // "SampleFiles/" + key

          finalResponse.message =
            CONSTANTS.IMPORTED_FILE_IS_NOT_VALID +
            " Please recheck and make correction in the column '" +
            errorData +
            "' at line no. - " +
            cont +
            " in the imported excel sheet.";
          finalResponse.code = Codes.BAD_REQUEST;
          return Promise.resolve(finalResponse);
        } else if (fileData && fileData.length <= 1) {
          finalResponse.message = CONSTANTS.BLANK_FILE_UPLOADED;
          finalResponse.code = Codes.BAD_REQUEST;
          return Promise.resolve(finalResponse);
        }
        //console.log('email mobiles...', emailMobile);
        let emails = emailMobile.map((val, i) => {
          //emails += `${`${val.email}` + (i+1<emailMobile.length ?",":"")}`
          return val.email;
        });
        console.log("emails...", emails);
        let websites = companyProfileData.map((val, i) => {
          return val.website;
        });
        console.log("websites...", websites);
        let result: any;
        let result1: any;
        let result2: any;
        let result3: any;
        let companyResult: any;
        let companies: any;
        let expData: any;
        let companyData: any;
        let newCompanies: any = [];
        let exhibitorDataResult: any = [];
        let serviceDataResult: any = [];
        result = await new AdminMgmtDao().checkEmailExists(emails);
        console.log("result...", result);
        if (result && result.length) {
          let resultF = result.map((val, i) => {
            return val.email;
          });
          console.log("resultF...", resultF);
          let emailsFinal = emails.filter((val) => !resultF.includes(val));
          console.log("email finals...", emailsFinal);
          if (emailsFinal && emailsFinal.length) {
            let emMobData = emailsFinal.map((email) => {
              return emailMobile.find((o) => o.email === email);
            });
            console.log("emmobdata...", emMobData);
            if (emMobData && emMobData.length) {
              let insertEmailMobResult: any =
                await this.insertUserEmailMobileData(emMobData);
              console.log("insertEmailMobResult...", insertEmailMobResult);
              if (insertEmailMobResult && insertEmailMobResult.insertId) {
                let usersByEmailResult: any = await this.getUsersByEmail(
                  emailsFinal
                );
                console.log("usersByEmailResult...", usersByEmailResult);
                if (usersByEmailResult && usersByEmailResult.length) {
                  expData = usersByEmailResult.map((user) => {
                    let found = userProfileData.find(
                      (u) => u.email === user.email
                    );
                    found.user_id = user.user_id;
                    found.user_uuid = user.user_uuid;
                    return found;
                  });
                  if (expData && expData.length) {
                    console.log("exp data...", expData);
                    let insertUserProfileDataResult =
                      await this.insertUserProfileData(expData);
                    console.log(
                      "insertUserProfileDataResult...",
                      insertUserProfileDataResult
                    );
                  }
                }
              }
            }
          } else {
            let usersByEmailResult: any = await this.getUsersByEmail(resultF);
            console.log("usersByEmailResult...", usersByEmailResult);
            if (usersByEmailResult && usersByEmailResult.length) {
              expData = usersByEmailResult.map((user) => {
                let found = userProfileData.find((u) => u.email === user.email);
                found.user_id = user.user_id;
                found.user_uuid = user.user_uuid;
                return found;
              });
              // if (expData && expData.length) {
              //   console.log("exp data...", expData);
              //   let insertUserProfileDataResult =
              //     await this.insertUserProfileData(expData);
              //   console.log(
              //     "insertUserProfileDataResult...",
              //     insertUserProfileDataResult
              //   );
              // }
            }
          }
        } else {
          let insertEmailMobResult: any = await this.insertUserEmailMobileData(
            emailMobile
          );
          console.log("insertEmailMobResult...", insertEmailMobResult);
          if (insertEmailMobResult && insertEmailMobResult.insertId) {
            let usersByEmailResult: any = await this.getUsersByEmail(emails);
            console.log("usersByEmailResult...", usersByEmailResult);
            if (usersByEmailResult && usersByEmailResult.length) {
              expData = usersByEmailResult.map((user) => {
                let found = userProfileData.find((u) => u.email === user.email);
                found.user_id = user.user_id;
                found.user_uuid = user.user_uuid;
                return found;
              });
              if (expData && expData.length) {
                console.log("exp data...", expData);
                let insertUserProfileDataResult =
                  await this.insertUserProfileData(expData);
                console.log(
                  "insertUserProfileDataResult...",
                  insertUserProfileDataResult
                );
              }
            }
          }
        }

        companies = await new AdminMgmtDao().checkCompanyExists(websites);
        console.log("companies...", companies);
        if (companies && companies.length) {
          let companyResultF = companies.map((val, i) => {
            return val.website;
          });
          console.log("companyResultF...", companyResultF);
          console.log("websites...", websites);
          let websitesFinal = websites.filter(
            (val) => !companyResultF.includes(val)
          );
          console.log("website final...", websitesFinal);
          if (websitesFinal && websitesFinal.length) {
            companyData = websitesFinal.map((website) => {
              return companyProfileData.find((w) => w.website === website);
            });
            console.log("companyData...", companyData);
            if (companyData && companyData.length) {
              newCompanies = companyData;
              companyResult = await this.insertCompanyProfileData(companyData);
            }
          } else {
            companyData = await this.getCompaniesByWebsite(companyResultF);
            console.log("companyData...", companyData);
          }
        } else {
          newCompanies = companyProfileData;
          companyData = companyProfileData;
          companyResult = await this.insertCompanyProfileData(
            companyProfileData
          );
        }

        if (req.tabType == BulkImportExportType.services) {
          // let webs: any = companyData.map((c) => {
          //   return c.website;
          // });
          let companyFound: any = await this.getCompaniesByWebsite(websites);
          console.log("companyFound...", companyFound);
          if (companyFound && companyFound.length) {
            serviceDataResult = companyFound.map((company) => {
              let found = serviceData.find(
                (s) => s.website === company.website
              );
              found.supplier_company_id = company.companyId;
              return found;
            });
          }
          console.log("serviceDataResult...", serviceDataResult);
          if (serviceDataResult && serviceDataResult.length) {
            let saveServiceResult: any = await this.saveServices(
              serviceDataResult
            );
            console.log("saveServiceResult...", saveServiceResult);
            if (saveServiceResult && saveServiceResult.insertId) {
              let getServicesResult: any = await this.getServicesById(
                serviceDataResult
              );
              console.log("getServicesResult...", getServicesResult);
              if (getServicesResult && getServicesResult.length) {
                let contactData: any = [];
                let usersResult: any = await this.getUsersByEmail(emails);
                console.log("usersResult...", usersResult);
                if (usersResult && usersResult.length) {
                  contactData = usersResult.map((user) => {
                    let found = serviceDataResult.find(
                      (service) => service.email === user.email
                    );
                    found.user_id = user.user_id;
                    found.mobile = user.mobile;
                    found.contact_user_name = user.first_name;
                    return found;
                  });
                }
                console.log("contactData...", contactData);
                if (contactData && contactData.length) {
                  let serviceContactData: any = getServicesResult.map(
                    (getService) => {
                      let found = contactData.find(
                        (contact) =>
                          contact.event_id === getService.event_id &&
                          contact.venue_id === getService.venue_id &&
                          contact.supplier_company_id ===
                          getService.supplier_company_id
                      );
                      if (found) {
                        found.services_id = getService.services_id;
                        return found;
                      }
                    }
                  );
                  console.log("serviceContactData...", serviceContactData);
                  if (serviceContactData && serviceContactData.length) {
                    serviceContactData = serviceContactData.filter((val) => {
                      return val != undefined;
                    });
                    serviceContactData = serviceContactData.filter(
                      (value, index, self) =>
                        index ===
                        self.findIndex(
                          (t) =>
                            t.user_id === value.user_id &&
                            t.services_id === value.services_id
                        )
                    );
                  }
                  let serviceContacts: any = await this.saveServiceContacts(
                    serviceContactData
                  );

                  let serviceSameAsVenue: any = serviceDataResult.filter(
                    (service) => {
                      console.log('service...', service);
                      console.log('service.sameAsVenueFlag....', service.sameAsVenueFlag);
                      return service.sameAsVenueFlag == "y";
                    }
                  );
                  console.log("serviceSameAsVenue...", serviceSameAsVenue);
                  if (serviceSameAsVenue && serviceSameAsVenue.length) {
                    let venueTime: any = await this.getVenueTimesForServices(
                      req.venueId
                    );
                    console.log('venueTime...',venueTime);
                    if (venueTime && venueTime.length) {
                      let venueTimesWithServiceId: any = [];
                      let servicesAdded: any = await this.getServicesById(
                        serviceSameAsVenue
                      );
                      console.log('servicesAdded',servicesAdded);
                      if (servicesAdded && servicesAdded.length) {
                        let findedServices:any;
                        let found: any[]  = [];
                         findedServices = servicesAdded.map(
                          (addedService) => {
                              serviceSameAsVenue.map(
                              (sameAsService) =>{
                                if(sameAsService.event_id ===
                                  addedService.event_id &&
                                sameAsService.venue_id ===
                                  addedService.venue_id &&
                                sameAsService.supplier_company_id ===
                                  addedService.supplier_company_id){
                                    found.push(addedService);
                                  }

                           }
                              );
                              if(found.length>0){
                                console.log('found inside ',found);
                                return found;
                              }
                             
                          }
                        );
                        if (found && found.length) {
                          await new Promise(function (resolve, reject) {
                            
                            for (
                              let index = 0;
                              index < found.length;
                              index++
                            ) {
                              venueTime.map((time) => {
                                  time.service_id =
                                  found[index].services_id;
                                  time.sameAsVenue = 1;
                                  venueTimesWithServiceId.push({ ...time });
                                });
                              }
                            resolve(1);
                          });
                          let saveEventTimeResult: any =
                            await this.saveEventTimeForServices(
                              venueTimesWithServiceId
                            );
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (req.tabType == BulkImportExportType.exhibitors) {
          // let webs:any = companyData.map((c)=>{
          //   return c.website;
          // })
          let companyFound: any = await this.getCompaniesByWebsite(websites);
          console.log("companyFound...", companyFound);
          if (companyFound && companyFound.length) {
            exhibitorDataResult = companyFound.map((company) => {
              let found = exhibitorData.find(
                (e) => e.website === company.website
              );
              found.company_id = company.companyId;
              return found;
            });
          }
          console.log("exhibitor data result...", exhibitorDataResult);
          if (exhibitorDataResult && exhibitorDataResult.length) {
            let saveExhibitorResult: any = await this.saveExhibitors(
              exhibitorDataResult
            );
            console.log("saveExhibitorResult...", saveExhibitorResult);
            if (saveExhibitorResult && saveExhibitorResult.insertId) {
              let getExhibitorsResult: any = await this.getExhibitorsById(
                exhibitorDataResult
              );
              console.log("getExhibitorsResult...", getExhibitorsResult);
              if (getExhibitorsResult && getExhibitorsResult.length) {
                let contactData: any = [];
                console.log("exp data in exhibitor...", expData);
                let usersResult: any = await this.getUsersByEmail(emails);
                if (usersResult && usersResult.length) {
                  contactData = usersResult.map((user) => {
                    let found: any = exhibitorDataResult.find(
                      (exhibitor) => exhibitor.email === user.email
                    );
                    found.user_id = user.user_id;
                    found.mobile = user.mobile;
                    found.contact_user_name = user.first_name;
                    return found;
                  });
                }

                console.log("contact data...", contactData);
                console.log("getExhibitorsResult...", getExhibitorsResult);
                if (contactData && contactData.length) {
                  let exhibitorsContactData: any = getExhibitorsResult.map(
                    (getExhibitor) => {
                      let exhibitorContactFound: any = contactData.find(
                        (contact) =>
                          contact.event_id === getExhibitor.event_id &&
                          contact.venue_id === getExhibitor.venue_id &&
                          contact.company_id === getExhibitor.company_id
                      );
                      console.log(
                        "exhibitorContactFound...",
                        exhibitorContactFound
                      );
                      if (exhibitorContactFound) {
                        exhibitorContactFound.exhibitor_id =
                          getExhibitor.exhibitor_id;
                        return exhibitorContactFound;
                      }
                    }
                  );
                  console.log(
                    "exhibitorsContactData...",
                    exhibitorsContactData
                  );
                  if (exhibitorsContactData && exhibitorsContactData.length) {
                    exhibitorsContactData = exhibitorsContactData.filter(
                      (val) => {
                        return val != undefined;
                      }
                    );
                    exhibitorsContactData = exhibitorsContactData.filter(
                      (value, index, self) =>
                        index ===
                        self.findIndex(
                          (t) =>
                            t.user_id === value.user_id &&
                            t.exhibitor_id === value.exhibitor_id
                        )
                    );
                  }
                  console.log(
                    "exhibitorsContactData again...",
                    exhibitorsContactData
                  );
                  let exhibitorsContacts: any =
                    await this.saveExhibitorContacts(exhibitorsContactData);
                  let exhibitorSameAsVenue: any = exhibitorDataResult.filter(
                    (exhibitor) => {
                      return exhibitor.sameAsVenueFlag == "y";
                    }
                  );
                  console.log("exhibitorSameAsVenue...", exhibitorSameAsVenue);
                  if (exhibitorSameAsVenue && exhibitorSameAsVenue.length) {
                    let exhibitorTimeExistOrNot: any =
                      await this.checkExhibitorTimeExistOrNot(req.eventId);

                    if (
                      exhibitorTimeExistOrNot &&
                      exhibitorTimeExistOrNot.length
                    ) {
                      let exhibitionTime: any =
                        await this.getExhibitorEventTimeAll(req.eventId);
                      console.log("exhibition time....", exhibitionTime);
                      let exhibitionTimeForEach: any =
                        await this.getExhibitorEventTimeAllEach(req.eventId);
                      console.log(
                        "exhibitionTimeForEach...",
                        exhibitionTimeForEach
                      );
                      if (exhibitionTime && exhibitionTime.length) {
                        let exhibitorGlobalTimesWithExhibitorId: any = [];
                        let newExhibitorGlobalTimesWithExhibitorId: any = [];
                        let exhibitorsAdded: any = await this.getExhibitorsById(
                          exhibitorSameAsVenue
                        );
                        console.log("exhibitorsAdded...", exhibitorsAdded);
                        if (exhibitorsAdded && exhibitorsAdded.length) {
                          let findedExhibitors: any = exhibitorsAdded.map(
                            (addedExhibitors) => {
                              let found = exhibitorSameAsVenue.find(
                                (sameAsExhibitor) =>
                                  sameAsExhibitor.event_id ===
                                  addedExhibitors.event_id &&
                                  sameAsExhibitor.venue_id ===
                                  addedExhibitors.venue_id &&
                                  sameAsExhibitor.company_id ===
                                  addedExhibitors.company_id
                              );
                                found.exhibitor_id = addedExhibitors.exhibitor_id;
                                return found;
                            }
                          );
                          console.log("findedExhibitors...", findedExhibitors);
                          if (findedExhibitors && findedExhibitors.length) {
                            await new Promise(function (resolve, reject) {
                              for (
                                let index = 0;
                                index < findedExhibitors.length;
                                index++
                              ) {
                                for (
                                  let j = 0;
                                  j < exhibitionTime.length;
                                  j++
                                ) {
                                  const element = exhibitionTime[j];
                                  element.exhibitor_id =
                                    findedExhibitors[index].exhibitor_id;
                                  element.sameAsVenue = 1;
                                  newExhibitorGlobalTimesWithExhibitorId.push({
                                    ...element,
                                  });
                                }
                                // exhibitionTime.map((time) => {
                                //   time.exhibitor_id =
                                //     findedExhibitors[index].exhibitor_id;
                                //     time.sameAsVenue = 1;
                                //     // console.log('time...', time);
                                //     console.log('exhibitor id..', findedExhibitors[index].exhibitor_id);
                                //     newExhibitorGlobalTimesWithExhibitorId.push(time)
                                //     console.log("newExhibitorGlobalTimesWithExhibitorId;;;",newExhibitorGlobalTimesWithExhibitorId)
                                // });
                              }
                              resolve(1);
                            });
                            // exhibitorGlobalTimesWithExhibitorId.map(
                            //   (firstArray) => {
                            //     firstArray.map((secondArray) => {
                            //       newExhibitorGlobalTimesWithExhibitorId.push(
                            //         secondArray
                            //       );
                            //     });
                            //   }
                            // );
                            console.log(
                              "newExhibitorGlobalTimesWithExhibitorId...",
                              newExhibitorGlobalTimesWithExhibitorId
                            );
                            let saveGlobalAllTime: any =
                              await this.saveGlobalAllTime(
                                newExhibitorGlobalTimesWithExhibitorId
                              );
                          }
                        }
                      }
                      if (
                        exhibitionTimeForEach &&
                        exhibitionTimeForEach.length
                      ) {
                        let exhibitorGlobalTimesForEachWithExhibitorId: any =
                          [];
                        let newExhibitorGlobalTimesForEachWithExhibitorId: any =
                          [];
                        let exhibitorsAddedEach: any =
                          await this.getExhibitorsById(exhibitorSameAsVenue);
                        console.log(
                          "exhibitorsAddedEach...",
                          exhibitorsAddedEach
                        );
                        if (exhibitorsAddedEach && exhibitorsAddedEach.length) {
                          let findedExhibitorsEach: any =
                            exhibitorsAddedEach.map((addedExhibitorsEach) => {
                              let found = exhibitorSameAsVenue.find(
                                (sameAsExhibitorEach) =>
                                  sameAsExhibitorEach.event_id ===
                                  addedExhibitorsEach.event_id &&
                                  sameAsExhibitorEach.venue_id ===
                                  addedExhibitorsEach.venue_id &&
                                  sameAsExhibitorEach.company_id ===
                                  addedExhibitorsEach.company_id
                              );
                              found.exhibitor_id =
                                addedExhibitorsEach.exhibitor_id;
                              return found;
                            });
                          console.log(
                            "findedExhibitorsEach...",
                            findedExhibitorsEach
                          );
                          if (
                            findedExhibitorsEach &&
                            findedExhibitorsEach.length
                          ) {
                            await new Promise(function (resolve, reject) {
                              for (
                                let index = 0;
                                index < findedExhibitorsEach.length;
                                index++
                              ) {
                                // exhibitionTimeForEach.map((time) => {
                                //   time.t_type = time.t_type.replace(
                                //     "All",
                                //     ""
                                //   );
                                //   time.exhibitor_id =
                                //     findedExhibitorsEach[index].exhibitor_id;
                                //     time.sameAsVenue = 1;
                                //     console.log('second condition time...', time);
                                //   newExhibitorGlobalTimesForEachWithExhibitorId.push(time);
                                // });
                                for (
                                  let j = 0;
                                  j < exhibitionTimeForEach.length;
                                  j++
                                ) {
                                  const element = exhibitionTimeForEach[j];
                                  element.t_type = element.t_type.replace(
                                    "All",
                                    ""
                                  );
                                  element.exhibitor_id =
                                    findedExhibitorsEach[index].exhibitor_id;
                                  element.sameAsVenue = 1;
                                  newExhibitorGlobalTimesForEachWithExhibitorId.push(
                                    { ...element }
                                  );
                                }
                              }
                              resolve(1);
                            });
                            // exhibitorGlobalTimesForEachWithExhibitorId.map(
                            //   (firstArray) => {
                            //     firstArray.map((secondArray) => {
                            //       newExhibitorGlobalTimesForEachWithExhibitorId.push(
                            //         secondArray
                            //       );
                            //     });
                            //   }
                            // );
                            console.log(
                              "newExhibitorGlobalTimesForEachWithExhibitorId...",
                              newExhibitorGlobalTimesForEachWithExhibitorId
                            );
                            let saveGlobalAllTimeEach: any =
                              await this.saveGlobalAllTime(
                                newExhibitorGlobalTimesForEachWithExhibitorId
                              );
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        let newUserData: any = [];
        let oldUserData: any = [];
        let newCompanyData: any = [];
        let oldCompanyData: any = [];
        let newUsers: any = [];
        let oldUsers: any = [];
        let newCompany: any = [];
        let oldCompany: any = [];
        let newCompanyWebsites: any = [];
        let oldCompanyWebsites: any = [];
        if (expData && expData.length) {
          console.log("expData before newUserEmails...", expData);
          let newUserEmails = expData.map((val, i) => {
            return val.email;
          });
          console.log("newUserEmails...", newUserEmails);
          let oldUserEmails = userProfileData.filter(
            ({ email: id1 }) => !expData.some(({ email: id2 }) => id2 === id1)
          );
          if (oldUserEmails && oldUserEmails.length) {
            oldUserEmails = oldUserEmails.map((email) => {
              return email.email;
            });
          }
          //  expData.map((user) => {
          //   let found = userProfileData.find((u) => u.email != user.email);
          //   console.log('found old user...', found);
          //   return found?.email;
          // });
          console.log("oldUserEmails...", oldUserEmails);
          if (newUserEmails && newUserEmails.length) {
            newUsers = await new AdminMgmtDao().getNewOldUsersByEmail(
              newUserEmails
            );
          }
          if (oldUserEmails && oldUserEmails.length) {
            oldUsers = await new AdminMgmtDao().getNewOldUsersByEmail(
              oldUserEmails
            );
          }
          console.log("new users...", newUsers);
          if (newUsers && newUsers.length) {
            newUserData = newUsers.map((user) => {
              let found = userProfileData.find((u) => u.email === user.email);
              found.user_id = user.user_id;
              found.user_uuid = user.user_uuid;
              found.isNewUser = 1;
              return found;
            });
          }
          if (oldUsers && oldUsers.length) {
            oldUserData = oldUsers.map((user) => {
              let found = userProfileData.find((u) => u.email == user.email);
              found.user_id = user.user_id;
              found.user_uuid = user.user_uuid;
              found.isNewUser = 0;
              return found;
            });
          }
          console.log("old users...", oldUsers);
        }
        console.log("newUserData...", newUserData);
        console.log("oldUserData...", oldUserData);
        if (newCompanies && newCompanies.length) {
          newCompanyWebsites = newCompanies.map((val, i) => {
            return val.website;
          });
          console.log("newCompanyWebsites...", newCompanyWebsites);
          oldCompanyWebsites = companyProfileData.filter(
            ({ website: id1 }) =>
              !newCompanies.some(({ website: id2 }) => id2 === id1)
          );
          if (oldCompanyWebsites && oldCompanyWebsites.length) {
            oldCompanyWebsites = oldCompanyWebsites.map((web) => {
              return web.website;
            });
          }
          // newCompanies.map((c) => {
          //   let found = companyProfileData.find(
          //     (cp) => cp.website != c.website
          //   );
          //   return found?.website;
          // });
          console.log("oldCompanyWebsites...", oldCompanyWebsites);
        } else if (newCompanies && !newCompanies.length) {
          oldCompanyWebsites = companyProfileData.map((val, i) => {
            return val.website;
          });
        }
        if (newCompanyWebsites && newCompanyWebsites.length) {
          newCompany = await new AdminMgmtDao().getCompaniesByWebsite(
            newCompanyWebsites
          );
          console.log("newCompany...", newCompany);
        }
        if (oldCompanyWebsites && oldCompanyWebsites.length) {
          oldCompany = await new AdminMgmtDao().getCompaniesByWebsite(
            oldCompanyWebsites
          );
          console.log("oldCompany...", oldCompany);
        }
        if (newCompany && newCompany.length) {
          newCompanyData = newCompany.map((c) => {
            let found = companyProfileData.find(
              (cp) => cp.website === c.website
            );
            found.companyId = c.companyId;
            found.isNewCompany = 1;
            return found;
          });
        }
        if (oldCompany && oldCompany.length) {
          oldCompanyData = oldCompany.map((c) => {
            let found = companyProfileData.find(
              (cp) => cp.website == c.website
            );
            found.companyId = c.companyId;
            found.isNewCompany = 0;
            return found;
          });
        }

        console.log("newCompanyData...", newCompanyData);
        console.log("oldCompanyData...", oldCompanyData);
        let users = [...newUserData, ...oldUserData];
        let mergedCompanies = [...newCompanyData, ...oldCompanyData];
        console.log("users...", users);
        console.log("mergedCompanies...", mergedCompanies);
        let userCompanyMailData: any = mergedCompanies.map((company) => {
          let found = users.find((user) => user.email == company.email);
          found.companyId = company.companyId;
          found.isNewCompany = company.isNewCompany;
          return found;
        });
        console.log("userCompanyMailData...", userCompanyMailData);
        if (userCompanyMailData && userCompanyMailData.length) {
          await new Promise(function (resolve, reject) {
            for (let mailI = 0; mailI < userCompanyMailData.length; mailI++) {
              let data = {
                userResult: userCompanyMailData[mailI],
                eventId: req.eventId,
                tabType:
                  req.tabType == BulkImportExportType.services
                    ? "supplier"
                    : "exhibitor",
                companyId: userCompanyMailData[mailI].companyId,
              };
              sendEmailFromInvoke(data);
            }
            resolve(1);
          });
        }
        // return Promise.resolve(finalResponse);
        // for (cont = 1; cont < fileData.length; cont++) {
        //   let record = fileData[cont];
        //   // [ 'Service Name', 'Website', 'Company Name', 'Country', 'City',  'Address 1', 'Address 2', 'Postcode','State/Region', 'Phone', 'Email', 'First Name', 'Second Name', 'Mobile'  ],
        //   let result: any;
        //   result = await new AdminMgmtDao().importBulkServicesAndExhibitors(
        //     loginUser.id,
        //     req.tabType,
        //     req.eventId,
        //     req.venueId,
        //     record[0],
        //     record[1],
        //     record[2],
        //     record[3],
        //     record[4],
        //     record[5],
        //     record[6],
        //     record[7],
        //     record[8],
        //     record[9],
        //     record[10],
        //     record[11],
        //     record[12],
        //     record[13],
        //     record[14]
        //   ); // true for admin login
        //   console.log("aftear upload", result);

        //   let userResult = result[0][0];

        //   // console.log("userResult ** ", userResult);

        //   let data = {
        //     userResult: userResult,
        //     eventId: req.eventId,
        //     tabType:
        //       req.tabType == BulkImportExportType.services
        //         ? "supplier"
        //         : "exhibitor",
        //     companyId: userResult.companyId,
        //   };
        //   //sendEmailFromInvoke(data);

        //   /*
        //   if(req.tabType == BulkImportExportType.services){
        //     // console.log("supplier**************************************************************");
        //     sendEventNotification( userResult, userResult, req.eventId, "supplier", userResult.companyId );

        //   }

        //   if(req.tabType == BulkImportExportType.exhibitors){
        //     // console.log("exhibitors**************************************************************");
        //     sendEventNotification( userResult, userResult, req.eventId, "exhibitor", userResult.companyId );

        //   }

        //   */
        // }
      } else if (
        (req.tabType == BulkImportExportType.services ||
          req.tabType == BulkImportExportType.exhibitors) &&
        req.actionType == BulkImportExportType.export
      ) {
        console.log(" second condtion");
        let result: any;
        result = await new AdminMgmtDao().exportBulkServicesAndExhibitors(
          loginUser.id,
          req.tabType,
          req.eventId,
          req.venueId
        ); // true for admin login
        //  console.log("result ** ", result);

        // write to file start **************************************************
        let schema;
        if (req.tabType == BulkImportExportType.services) {
          // for services
          schema = [
            { value: "Service Name" },
            { value: "Website" },
            { value: "Company Name" },
            { value: "Country" },
            { value: "City" },
            { value: "Address 1" },
            { value: "Address 2" },
            { value: "Postcode" },
            { value: "State/Region" },
            { value: "Phone" },
            { value: "Email" },
            { value: "First Name" },
            { value: "Second Name" },
            { value: "Mobile" },
          ];
        } else {
          schema = [
            { value: "Stand Number" },
            { value: "Website" },
            { value: "Company Name" },
            { value: "Country" },
            { value: "City" },
            { value: "Address 1" },
            { value: "Address 2" },
            { value: "Postcode" },
            { value: "State/Region" },
            { value: "Phone" },
            { value: "Email" },
            { value: "First Name" },
            { value: "Second Name" },
            { value: "Mobile" },
          ];
        }

        // console.log("result[0] ** ", result[0]);
        // console.log("schema *** ", schema);

        const writeXlsxFile = require("write-excel-file/node");
        // When passing `objects` and `schema`.

        let data: any = [];
        data.push(schema);
        let event_name = "";
        let event_id = 0;
        for (let j = 0; j < result[0].length; j++) {
          let single = result[0][j];
          event_name = single.eventName;
          let tmpObj: any = [];
          if (req.tabType == BulkImportExportType.services) {
            // for services
            tmpObj.push({ type: String, value: single.serviceName });
          } else {
            tmpObj.push({ type: String, value: single.standNumber });
          }
          tmpObj.push({ type: String, value: single.website });
          tmpObj.push({ type: String, value: single.companyName });
          tmpObj.push({
            type: String,
            value: single.country ? single.country.toString() : "",
          });
          tmpObj.push({ type: String, value: single.city });
          tmpObj.push({ type: String, value: single.streetAddress1 });
          tmpObj.push({ type: String, value: single.streetAddress2 });
          tmpObj.push({ type: String, value: single.postcode });
          tmpObj.push({ type: String, value: single.state });
          tmpObj.push({ type: String, value: single.phone });
          tmpObj.push({ type: String, value: single.email });
          tmpObj.push({ type: String, value: single.firstName });
          tmpObj.push({ type: String, value: single.lastName });
          tmpObj.push({ type: String, value: single.mobile });

          data.push(tmpObj);
        }

        // console.log("data ** ", data);

        let filename = uuidv4();
        // console.log("filename", filename);
        console.log("before xlsx file");
        // When passing `data` for each cell.
        await writeXlsxFile(data, {
          filePath: "/tmp/file" + filename + ".xlsx",
        });

        let upRes;
        console.log("before uplaod xlsx file");
        await bucketImageUpload(
          "/tmp/file" + filename + ".xlsx",
          loginUser.id,
          true,
          req.tabType,
          event_name
        ).then(async (data: any) => {
          // console.log("data &&**", data);
          upRes = data;
        });
        console.log("After uplaod xlsx file", upRes);
        // write to file end ********************************************************
        finalResponse.data = { fileData: result[0], uploadRes: upRes };
      }

      // if (result ) {
      //   // finalResponse.data=result[1];
      // } else {
      //   finalResponse.message = CONSTANTS.UNAUTHORIZED_ACCESS;
      //   finalResponse.code = Codes.UNAUTHORIZED;
      // }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async insertUserEmailMobileData(emMobData: any) {
    return await new AdminMgmtDao().insertEmailMobile(emMobData);
  }

  async getUsersByEmail(emailsFinal: any) {
    return await new AdminMgmtDao().getUsersByEmail(emailsFinal);
  }

  async insertUserProfileData(profileData: any) {
    return await new AdminMgmtDao().insertUserProfileData(profileData);
  }

  async getCompaniesByWebsite(websites: any) {
    return await new AdminMgmtDao().getCompaniesByWebsite(websites);
  }

  async insertCompanyProfileData(companyProfileData: any) {
    return await new AdminMgmtDao().insertCompanyProfileData(
      companyProfileData
    );
  }

  async saveServices(serviceData: any) {
    return await new AdminMgmtDao().saveService(serviceData);
  }

  async saveServiceContacts(serviceContactData: any) {
    return await new AdminMgmtDao().saveServiceContacts(serviceContactData);
  }

  async saveExhibitors(exhibitorData: any) {
    return await new AdminMgmtDao().saveExhibitor(exhibitorData);
  }

  async saveExhibitorContacts(exhibitorContactData: any) {
    return await new AdminMgmtDao().saveExhibitorContacts(exhibitorContactData);
  }

  async getServicesById(serviceData: any) {
    return await new AdminMgmtDao().getServicesByEventVenueCompanyId(
      serviceData
    );
  }

  async getExhibitorsById(exhibitorData: any) {
    return await new AdminMgmtDao().getExhibitorsByEventVenueCompanyId(
      exhibitorData
    );
  }

  async getVenueTimesForServices(service) {
    return await new AdminMgmtDao().getVenueTimeForService(service);
  }

  async getExhibitorEventTimeAll(eventId) {
    return await new AdminMgmtDao().getExhibitorEventTimeAll(eventId);
  }

  async getExhibitorEventTimeAllEach(eventId) {
    return await new AdminMgmtDao().getExhibitorEventTimeAllEach(eventId);
  }

  async saveEventTimeForServices(eventTimes) {
    return await new AdminMgmtDao().saveEventTimeForService(eventTimes);
  }

  async checkExhibitorTimeExistOrNot(event_id) {
    return await new AdminMgmtDao().checkExhibitorTimeExistOrNot(event_id);
  }

  async saveGlobalAllTime(globalAllTimes) {
    return await new AdminMgmtDao().saveGlobalAllTime(globalAllTimes);
  }

  /************************
   * delete bucket file by key
   */
  async deleteBucketFileByKey(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let finalResponse = getDefaultResponse();
    let loginUser = getAuthorizerUser(event);
    try {
      //check validation
      if (!req || !req.key) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      bucketImageDelete(req.key);

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
