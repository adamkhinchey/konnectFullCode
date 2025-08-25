import * as dotenv from "dotenv";
import * as _ from "lodash";
import { to, parseQueryResponse, formatTaskFilterData } from "../util/helper";
import { getConnection } from "../util/DBManager";
import { UserProfile } from "../Model/UserProfile";
const readXlsxFile = require('read-excel-file/node')
import * as CryptoJS from "crypto-js";
var moment = require("moment");
import {
  sendConfirmationMail,
  sendConfirmationMailForCrew,
  sendEventNotification,
} from "../service/EmailService";
import { integer } from "aws-sdk/clients/cloudfront";
let AWS = require("aws-sdk");

export class UserMgmtDao {
  constructor() {
    dotenv.config();
    AWS.config.region = process.env["region"];
  }

  /***
   * add/edit user profie
   *
   */
  async saveUser(userReq: UserProfile): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let inviteUID = userReq.inviteUID ? userReq.inviteUID : "";
      connection = await getConnection();
      let query = `Call saveUserV1(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      userReq.password = CryptoJS.SHA512(
        userReq.password,
        process.env.EncryptionKEY
      ).toString();
      [err, result] = await to(
        connection.query(query, [
          userReq.id,
          userReq.roleId,
          userReq.email,
          userReq.password,
          JSON.stringify(userReq.timeZone),
          userReq.mobileNumber,
          userReq.firstName,
          userReq.lastName,
          userReq.city,
          userReq.countryId,
          userReq.headline,
          userReq.aboutMe,
          userReq.profileImage,
          userReq.defaultCompanyId,
          inviteUID,
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * verify user email
   *
   */
  async verifyUserEmail(token: string): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call verifyUserEmail(?)`;
      [err, result] = await to(
        connection.query(query, [
          token
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      console.log(result[0], 'result');
      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * make user and company public
   *
   */
  async makeUserAndHisCompanyPublic(userId, companyId = 0): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call makeUserAndHisCompanyPublic(?,?)`;
      [err, result] = await to(connection.query(query, [userId, companyId]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   */
  async userLogin(userReq: UserProfile, isSystemAdmin: boolean): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call loginUser(?,?,?)`;
      userReq.password = CryptoJS.SHA512(
        userReq.password,
        process.env.EncryptionKEY
      ).toString();

      [err, result] = await to(
        connection.query(query, [
          userReq.email,
          userReq.password,
          isSystemAdmin,
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * forgot password
   *
   */
  async forgotPassword(email: string): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call forgotPassword(?)`;
      [err, result] = await to(connection.query(query, [email]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * reset password
   *
   */
  async resetPassword(
    password: string,
    resetPasswordToken: string
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call resetPassword(?,?)`;
      password = CryptoJS.SHA512(
        password,
        process.env.EncryptionKEY
      ).toString();
      [err, result] = await to(
        connection.query(query, [password, resetPasswordToken])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * reset password
   *
   */
  async changePassword(
    userId: number,
    old_password: string,
    new_password: string
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call changePassword(?,?,?)`;
      old_password = CryptoJS.SHA512(
        old_password,
        process.env.EncryptionKEY
      ).toString();

      [err, result] = await to(
        connection.query(query, [userId, old_password, new_password])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * delete profile
   *
   */
  async deleteProfile(userId: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call deleteProfile(?)`;
      [err, result] = await to(connection.query(query, [userId]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }



  // feed company seed data

  async feedCompanySeedData(userId: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let query: any;
      connection = await getConnection();


      let data: any = [];
      let i = 0;

      await readXlsxFile('D:\\konnectappapi\\src\\daos\\cmpny_seed_data.xlsx').then(async (rows) => {
        console.log("rows ** ", rows);
        query = `INSERT INTO company_profile (company_name, company_tax_number, street_address_1, street_address_2, city, state, country_id, postcode, phone, website, isSeed) VALUES ?`;
        [err, result] = await to(connection.query(query, [rows]));
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        console.log("result ** ", result);




        // query = `INSERT INTO company_profile (company_name, company_tax_number, street_address_1, street_address_2, city, state, country_id, postcode, phone, website, company_profile_image, description) VALUES ?`;
        // [err, result] = await to(connection.query(query, [rows]));
        // if (err) {
        //   return Promise.reject(err);
        // }
        // result = parseQueryResponse(result);
        // console.log("result ** ", result);
        return;
      });


      // console.log("hello ** ");

      // let data = [["abc", "wertqw", "abc addr1", "abc addr2", "Jaipur", "Raj", "2", "321234", "9812345123", "www.google.com","","toiwer sdf"],["abc12", "wertqw", "abc addr1", "abc addr2", "Jaipur", "Raj", "2", "321234", "9812345123", "www.google.com","","toiwer sdf"]] ;

      // query = `INSERT INTO company_profile (company_name, company_tax_number, street_address_1, street_address_2, city, state, country_id, postcode, phone, website, company_profile_image, description) VALUES ?`;
      // [err, result] = await to(connection.query(query, [data]));
      // if (err) {
      //   return Promise.reject(err);
      // }
      // result = parseQueryResponse(result);

      // console.log("result ** ", result);

      /*
      let query = `Call deleteProfile(?)`;
      [err, result] = await to(connection.query(query, [userId]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      */

      return Promise.resolve("");
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }





  /***
   * add connection
   *
   */
  async addConnection(
    companyId: number,
    connectionId: number,
    connectionType: number,
    loginUserId: number
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call addConnection(?, ?, ?, ?,?)`;
      [err, result] = await to(
        connection.query(query, [
          companyId,
          connectionId,
          connectionType,
          loginUserId,
          ''
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * delete connection
   *
   */
  async deleteConnection(
    companyId: number,
    connectionId: number,
    connectionType: number
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call deleteConnection(?, ?, ?)`;
      [err, result] = await to(
        connection.query(query, [companyId, connectionId, connectionType])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * list connection
   *
   */
  async listConnection(
    companyId: number,
    pageNo: number,
    pageSize: number,
    entityType: any,
    loginUserId: number = 0
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call listConnection(?, ?, ?, ?, ?)`;
      [err, result] = await to(
        connection.query(query, [companyId, pageNo, pageSize, entityType, loginUserId])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * search global  connection
   *
   */
  async searchGlobalConnection(
    companyId: number,
    keyword: string,
    pageNo: number,
    pageSize: number,
    regionId: any,
    isExternal: number,
    entityType: any,
    loginUserId: number
  ): Promise<any> {
    let connection: any;

    // if(!regionId) regionId = 0;
    if (!regionId || regionId.length == 0) {
      regionId = 0;
    } else {
      regionId = regionId.toString();
    }
    if (isExternal) {
      isExternal = 1;
    } else {
      isExternal = 0;
    }

    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call searchGlobalConnection(?, ?, ?, ?, ?, ?, ?, ?)`;
      [err, result] = await to(
        connection.query(query, [
          companyId,
          keyword,
          pageNo,
          pageSize,
          regionId,
          isExternal,
          entityType,
          loginUserId,
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * search global  connection new with seed data for platform
   *
   */
  async searchGlobalConnectionNew(
    companyId: number,
    keyword: string,
    pageNo: number,
    pageSize: number,
    regionId: any,
    isExternal: number,
    entityType: any,
    loginUserId: number
  ): Promise<any> {
    let connection: any;

    // if(!regionId) regionId = 0;
    if (!regionId || regionId.length == 0) {
      regionId = 0;
    } else {
      regionId = regionId.toString();
    }
    /*if (isExternal) {*/
    isExternal = 1;
    /*} else {
      isExternal = 0;
    }*/

    try {
      console.log(companyId,
        keyword,
        pageNo,
        pageSize,
        regionId,
        isExternal,
        entityType,
        loginUserId, 'searchGlobalConnectionNew');
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call searchGlobalConnectionNew(?, ?, ?, ?, ?, ?, ?, ?)`;
      [err, result] = await to(
        connection.query(query, [
          companyId,
          keyword,
          pageNo,
          pageSize,
          regionId,
          isExternal,
          entityType,
          loginUserId,
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * search global  connection new with seed data for connection
   *
   */
  async searchGlobalConnectionForCollection(
    companyId: number,
    keyword: string,
    pageNo: number,
    pageSize: number,
    regionId: any,
    isExternal: number,
    entityType: any,
    loginUserId: number
  ): Promise<any> {
    let connection: any;

    // if(!regionId) regionId = 0;
    if (!regionId || regionId.length == 0) {
      regionId = 0;
    } else {
      regionId = regionId.toString();
    }
    /*if (isExternal) {*/
    isExternal = 1;
    /*} else {
      isExternal = 0;
    }*/

    try {
      console.log(companyId,
        keyword,
        pageNo,
        pageSize,
        regionId,
        isExternal,
        entityType,
        loginUserId, 'searchGlobalConnectionForCollection');
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call searchGlobalConnectionForCollection(?, ?, ?, ?, ?, ?, ?, ?)`;
      [err, result] = await to(
        connection.query(query, [
          companyId,
          keyword,
          pageNo,
          pageSize,
          regionId,
          isExternal,
          entityType,
          loginUserId,
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
   * Match user and company domain.
   *
   */
  async checkUserCompanyDomain(
    companyId: number,
    email: string,
    loginUserId: number
  ): Promise<any> {
    let connection: any;
    const slitedEmail = email.split("@");
    // console.log(companyId,email,loginUserId,'asdasda',slitedEmail);
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call checkUserCompanyDomain(?, ?, ?)`;
      [err, result] = await to(
        connection.query(query, [
          companyId,
          slitedEmail[1],
          loginUserId,
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * get user profile
   */
  async getUserProfile(userId: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call getUserProfile(?)`;
      [err, result] = await to(connection.query(query, [userId]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      if (result[0] && result[1]) {
        if (result[1].length == 1 && result[0][0].defaultCompanyId != result[1][0].id) {
          connection = await getConnection();
          let query = `Call updateUserDefaultCompany(?,?)`;
          await to(connection.query(query, [userId, result[1][0].id]));
        }
      }
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * get company admin users by company id
   */
  async getCompanyAdminUsersByCompanyId(compnayId: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call getCompanyAdminListByCompanyId(?)`;
      [err, result] = await to(connection.query(query, [compnayId]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * get user by id
   */
  async getUserById(userId: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call getUser(?)`;
      [err, result] = await to(connection.query(query, [userId]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }


  /**
  * get user by id for send 
  */
  async getUserByIdforSend(userId: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call getUserforSendConfirm(?)`;
      const idArray = userId.map(item => `'${item}'`).join(' , ');
      // console.log("userId++++ by dddd+++",idArray);
      [err, result] = await to(connection.query(query, [idArray]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      //  console.log("result++++ by userId+++",result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * get user by UID
   */
  async getUserDataByUID(userId: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let err2: Error;
      let result: any;
      let result2: any;
      connection = await getConnection();
      let query = `Call getUserDataByUID(?)`;
      [err, result] = await to(connection.query(query, [userId]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      result[0][0].companyIsSeed = false;
      if (result && result[0][0].defaultCompanyId) {
        let query2 = `Call getCompanyById(?)`;
        [err2, result2] = await to(connection.query(query2, [result[0][0].defaultCompanyId]));
        if (err2) {
          return Promise.reject(err2);
        }
        result2 = parseQueryResponse(result2);
        result.companyIsSeed = result2[0][0].isSeed;
      }

      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * get user by Email
   */
  async getUserDataByEmail(email: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call getUserDataByEmail(?)`;
      [err, result] = await to(connection.query(query, [email]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * invite new company
   */
  async inviteNewCompany(
    name: string,
    countryId: number,
    city: string,
    contactName: string,
    contactEmail: string,
    companyId: number,
    loginUserId: number
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call inviteNewCompany(?,?,?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [
          name,
          countryId,
          city,
          contactName,
          contactEmail,
          companyId,
          loginUserId,
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * get event
   */
  async getEvent(
    eventId: number,
    tabType: number,
    loginUserId: number,
    loginCompanyId: number = 0
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call getEvent(?,?,?)`;

      [err, result] = await to(
        connection.query(query, [eventId, (tabType >= 3 ? 3 : tabType), loginCompanyId]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      let eventData = {};
      if (result && result[0][0]) {
        let basicEvent = result[0][0];
        eventData["eventId"] = basicEvent.id;
        eventData["title"] = basicEvent.title;
        eventData["description"] = basicEvent.description;
        eventData["hasExhibitors"] = basicEvent.hasExhibitors;
        eventData["createrUserId"] = basicEvent.createdBy;
        eventData["creatorFromCompanyId"] = basicEvent.createdFromCompanyId;
        eventData["creatorCompanyName"] = basicEvent.creatorCompanyName;
        eventData["creatorCompanyPhone"] = basicEvent.creatorCompanyPhone;
        eventData["creatorCompanyWebsite"] = basicEvent.creatorCompanyWebsite;
        eventData["creatorCompanyProfileImage"] =
          basicEvent.creatorCompanyProfileImage;
        eventData["creatorCompanyCity"] = basicEvent.creatorCompanyCity;
        eventData["creatorCompanyState"] = basicEvent.creatorCompanyState;
        eventData["eventCreatedDate"] = basicEvent.eventCreatedDate;
        eventData["isDeleted"] = basicEvent.isDeleted;

        eventData["ownedByText"] = basicEvent.ownedByText;

        if (tabType == 1 || tabType == 2) {
          // for client and event manager

          let contact_rs;
          query = `Call getEventContacts(?,?,?)`;
          [err, contact_rs] = await to(
            connection.query(query, [eventId, 0, tabType]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
          );
          if (err) {
            return Promise.reject(err);
          }
          contact_rs = parseQueryResponse(contact_rs);
          if (tabType == 1) {
            let clientData = {};
            clientData["companyId"] = basicEvent.clientCompanyId;
            clientData["isOwnCompany"] = basicEvent.clientCompanyIsMy;
            clientData["clientCompanyName"] = basicEvent.clientCompanyName;
            clientData["clientCompanyPhone"] = basicEvent.clientCompanyPhone;
            clientData["clientCompanyWebsite"] =
              basicEvent.clientCompanyWebsite;
            clientData["clientCompanyProfileImage"] =
              basicEvent.clientCompanyProfileImage;
            clientData["clientCompanyCity"] = basicEvent.clientCompanyCity;
            clientData["clientCompanyState"] = basicEvent.clientCompanyState;
            clientData["isPrivate"] = basicEvent.isClientPrivate;
            clientData["internalCmpNotes"] = basicEvent.internalCmpNotes;

            let emContacts: any = [];

            emContacts = this.formatEventContactResult(contact_rs);
            clientData["contacts"] = emContacts;

            let resCmp;
            query = `Call getEventCompanyPermission(?,?,?,?)`;
            [err, resCmp] = await to(
              connection.query(query, [
                eventId,
                null,  // null is passed as no id for client tab
                loginUserId,
                1,
              ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
            );
            if (err) {
              return Promise.reject(err);
            }
            resCmp = parseQueryResponse(resCmp);
            clientData["isViewPermission"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isViewPermisssion : 0;
            clientData["isStaffOrAdmin"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isViewPermisssion : 0; // currently view permission is same as staff or admin of the company


            clientData["isSelfIncludedInTab"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isSelfIncludedInTab : 0;
            clientData["isSelfIncludedInSection"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isSelfIncludedInSection : 0;

            eventData["client"] = clientData;



          } else if (tabType == 2) {
            let eventManager = {};
            eventManager["companyId"] = basicEvent.eventManagerCompanyId;
            eventManager["isOwnCompany"] = basicEvent.eventManagerCompanyIsMy;
            eventManager["requirements"] =
              basicEvent.eventManagementRequirements;
            eventManager["emCompanyName"] = basicEvent.emCompanyName;
            eventManager["emCompanyPhone"] = basicEvent.emCompanyPhone;
            eventManager["emCompanyWebsite"] = basicEvent.emCompanyWebsite;
            eventManager["emCompanyProfileImage"] =
              basicEvent.emCompanyProfileImage;
            eventManager["emCompanyCity"] = basicEvent.emCompanyCity;
            eventManager["emCompanyState"] = basicEvent.emCompanyState;
            eventManager["emInternalNotes"] = basicEvent.emInternalNotes;
            eventManager["isPrivate"] = basicEvent.isEMPrivate;
            eventManager["clientAccessPermission"] = basicEvent.clientAccessPermission ? basicEvent.clientAccessPermission.toString() : "0";



            let emContacts: any = [];

            emContacts = this.formatEventContactResult(contact_rs);
            eventManager["contacts"] = emContacts;

            let resCmp;
            query = `Call getEventCompanyPermission(?,?,?,?)`;
            [err, resCmp] = await to(
              connection.query(query, [
                eventId,
                null,  // null is passed as no id for client tab
                loginUserId,
                2,
              ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
            );
            if (err) {
              return Promise.reject(err);
            }
            resCmp = parseQueryResponse(resCmp);
            eventManager["isViewPermission"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isViewPermisssion : 0;
            eventManager["isStaffOrAdmin"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isViewPermisssion : 0; // currently view permission is same as staff or admin of the company

            eventManager["isSelfIncludedInTab"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isSelfIncludedInTab : 0;
            eventManager["isSelfIncludedInSection"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isSelfIncludedInSection : 0;

            eventData["eventManager"] = eventManager;


            let resevenmgr;
                query = `Call getEventCompanyPermissionBtn(?,?,?,?)`;

                [err, resevenmgr] = await to(
                  connection.query(query, [
                    eventId,
                    null,
                    loginUserId,
                    2,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }


                resevenmgr = parseQueryResponse(resevenmgr);
                eventManager["isViewPermissionBtn"] = resevenmgr && resevenmgr[1] && resevenmgr[1][0] ? resevenmgr[1][0].isViewPermisssionBtn : 0;

          }
        } else {
          // for venue , services , exhibitor

          if (tabType == 3 || tabType == 4 || tabType == 5) {
            // get  services for  venue start

            let services: any = [];
            if (result && result[2] && result[2].length > 0) {
              for (let i = 0; i < result[2].length; i++) {
                let times: any = [];
                // get venue contacts
                let service = {};
                let singleService = result[2][i];

                if (
                  !singleService ||
                  !singleService.serviceId ||
                  !singleService.venueId
                ) {
                  continue;
                }

                service["serviceId"] = singleService.serviceId;
                service["venueId"] = singleService.venueId;
                service["serviceName"] = singleService.serviceName;
                service["serviceRequirements"] =
                  singleService.serviceRequirements;
                service["notes"] = singleService.internalNotes;
                service["serviceCompanyId"] = singleService.serviceCompanyId;
                service["serviceCompanyName"] =
                  singleService.serviceCompanyName;
                service["companyProfileImage"] =
                  singleService.companyProfileImage;

                service["companyPhone"] = singleService.companyPhone;
                service["companyWebsite"] = singleService.companyWebsite;

                service["companyCity"] = singleService.companyCity;
                service["companyState"] = singleService.companyState;

                service["isPrivate"] = singleService.isPrivate;
                service["internalCmpNotes"] = singleService.internalCmpNotes;

                service["status"] = singleService.status; // status - 0 for pending, 1 for accept, 2 for decline

                // get company permssion start

                let resCmp;
                query = `Call getEventCompanyPermission(?,?,?,?)`;

                [err, resCmp] = await to(
                  connection.query(query, [
                    eventId,
                    singleService.serviceId,
                    loginUserId,
                    4,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }

                console.log("resCmp  1*** ", resCmp);

                resCmp = parseQueryResponse(resCmp);

                service["isViewPermission"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isViewPermisssion : 0;

                service["isStaffOrAdmin"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isViewPermisssion : 0; // currently view permission is same as staff or admin of the company


                service["isSelfIncludedInTab"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isSelfIncludedInTab : 0;
                service["isSelfIncludedInSection"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isSelfIncludedInSection : 0;

                let resBtn;
                query = `Call getEventCompanyPermissionBtn(?,?,?,?)`;

                [err, resBtn] = await to(
                  connection.query(query, [
                    eventId,
                    singleService.serviceId,
                    loginUserId,
                    4,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }


                resBtn = parseQueryResponse(resBtn);

                service["isViewPermissionBtn"] = resBtn && resBtn[1] && resBtn[1][0] ? resBtn[1][0].isViewPermisssionBtn : 0;



                // get company permission end
                /* // commented on 06-05-22 as we merged getEventViewPermission into getEventCompanyPermission
                if(!service["isViewPermission"])
                {
                  // get event view permssion start

                  let resEventViewPermission;
                  query = `Call getEventViewPermission(?,?,?,?)`;

                  [err, resEventViewPermission] = await to(
                    connection.query(query, [
                      eventId,
                      singleService.serviceId,
                      loginUserId,
                      4,
                    ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                  );
                  if (err) {
                    return Promise.reject(err);
                  }
                  resEventViewPermission = parseQueryResponse(resEventViewPermission);

                  service["isViewPermission"] = resEventViewPermission[0][0].isViewPermisssion;

                // get event view permission end
              }
              */

                let contact_rs;
                query = `Call getEventContacts(?,?,?)`;
                [err, contact_rs] = await to(
                  connection.query(query, [eventId, singleService.serviceId, 4]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }
                contact_rs = parseQueryResponse(contact_rs);

                // service contacts
                let emContacts: any = [];
                emContacts = this.formatEventContactResult(contact_rs);

                service["contacts"] = emContacts;

                // get service time
                let time_rs;
                query = `Call getEventTime(?,?,?)`;
                [err, time_rs] = await to(
                  connection.query(query, [eventId, singleService.serviceId, 4]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }
                time_rs = parseQueryResponse(time_rs);

                let evt_time;
                service["preEventTime"] = [];
                service["eventTime"] = [];
                service["postEventTime"] = [];

                // venue timings
                if (time_rs && time_rs[0] && time_rs[0].length > 0) {
                  evt_time = this.formatEventTimeResult(time_rs);
                  service["preEventTime"] = evt_time.preEventTime;
                  service["eventTime"] = evt_time.eventTime;
                  service["postEventTime"] = evt_time.postEventTime;
                }

                services.push(service);
              }
            }

            // get services for this venue end

            // get exhibitor for venue start

            let timeWindowsToAll = {};
            let exhibitors: any = [];
            if (result && result[3] && result[3].length > 0) {
              for (let i = 0; i < result[3].length; i++) {
                let times: any = [];
                // get venue contacts
                let exhibitor = {};
                let singleExhibitor = result[3][i];

                if (
                  !singleExhibitor ||
                  !singleExhibitor.exhibitorId ||
                  !singleExhibitor.venueId
                ) {
                  continue;
                }

                exhibitor["exhibitorId"] = singleExhibitor.exhibitorId;
                exhibitor["venueId"] = singleExhibitor.venueId;
                exhibitor["exhibitorName"] = singleExhibitor.exhibitorName;
                exhibitor["exhibitorRequirements"] =
                  singleExhibitor.exhibitorRequirements;
                exhibitor["notes"] = singleExhibitor.notes;
                exhibitor["exhibitorCompanyId"] =
                  singleExhibitor.exhibitorCompanyId;
                exhibitor["exhibitorCompanyName"] =
                  singleExhibitor.exhibitorCompanyName;
                exhibitor["companyProfileImage"] =
                  singleExhibitor.companyProfileImage;

                exhibitor["companyPhone"] = singleExhibitor.companyPhone;
                exhibitor["companyWebsite"] = singleExhibitor.companyWebsite;

                exhibitor["companyCity"] = singleExhibitor.companyCity;
                exhibitor["companyState"] = singleExhibitor.companyState;
                exhibitor["standNumber"] = singleExhibitor.standNumber;

                exhibitor["isPrivate"] = singleExhibitor.isPrivate;

                exhibitor["internalCmpNotes"] =
                  singleExhibitor.internalCmpNotes;

                exhibitor["status"] = singleExhibitor.status; // status - 0 for pending, 1 for accept, 2 for decline

                // get company permssion start

                let resCmp;
                query = `Call getEventCompanyPermission(?,?,?,?)`;

                [err, resCmp] = await to(
                  connection.query(query, [
                    eventId,
                    singleExhibitor.exhibitorId,
                    loginUserId,
                    5,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }

                resCmp = parseQueryResponse(resCmp);
                console.log("resCmp 2*** ", resCmp);

                exhibitor["isViewPermission"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isViewPermisssion : 0;

                exhibitor["isStaffOrAdmin"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isViewPermisssion : 0; // currently view permission is same as staff or admin of the company

                exhibitor["isSelfIncludedInTab"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isSelfIncludedInTab : 0;
                exhibitor["isSelfIncludedInSection"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isSelfIncludedInSection : 0;


                let resexhBtn;
                query = `Call getEventCompanyPermissionBtn(?,?,?,?)`;

                [err, resexhBtn] = await to(
                  connection.query(query, [
                    eventId,
                    singleExhibitor.exhibitorId,
                    loginUserId,
                    5,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }


                resexhBtn = parseQueryResponse(resexhBtn);                              
                exhibitor["isViewPermissionBtn"] = resexhBtn && resexhBtn[1] && resexhBtn[1][0] ? resexhBtn[1][0].isViewPermisssionBtn : 0;

                /* // commented on 06-05-22 as we merged getEventViewPermission into getEventCompanyPermission
                // get company permission end

                if(!exhibitor["isViewPermission"]){
                  // get event view permssion start

                  let resEventViewPermission;
                  query = `Call getEventViewPermission(?,?,?,?)`;

                  [err, resEventViewPermission] = await to(
                    connection.query(query, [
                      eventId,
                      singleExhibitor.exhibitorId,
                      loginUserId,
                      5,
                    ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                  );
                  if (err) {
                    return Promise.reject(err);
                  }
                  resEventViewPermission = parseQueryResponse(resEventViewPermission);

                  exhibitor["isViewPermission"] = resEventViewPermission[0][0].isViewPermisssion;
                }
                // get event view permission end
                */

                eventData["timeWindowsToAll"] = [];

                let contact_rs;
                query = `Call getEventContacts(?,?,?)`;
                [err, contact_rs] = await to(
                  connection.query(query, [
                    eventId,
                    singleExhibitor.exhibitorId,
                    5,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }
                contact_rs = parseQueryResponse(contact_rs);

                // service contacts
                let emContacts: any = [];
                emContacts = this.formatEventContactResult(contact_rs);

                exhibitor["contacts"] = emContacts;
                // get service time
                let time_rs;
                query = `Call getEventTime(?,?,?)`;
                [err, time_rs] = await to(
                  connection.query(query, [
                    eventId,
                    singleExhibitor.exhibitorId,
                    5,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }
                time_rs = parseQueryResponse(time_rs);

                let evt_time;
                exhibitor["preEventTime"] = [];
                exhibitor["eventTime"] = [];
                exhibitor["postEventTime"] = [];

                // venue timings
                if (time_rs && time_rs[0] && time_rs[0].length > 0) {
                  evt_time = this.formatEventTimeResult(time_rs);
                  exhibitor["preEventTime"] = evt_time.preEventTime;
                  exhibitor["eventTime"] = evt_time.eventTime;
                  exhibitor["postEventTime"] = evt_time.postEventTime;

                  if (!timeWindowsToAll["preEventTime"]) {
                    evt_time = this.formatEventTimeResult(time_rs, 1); // for exhibitor all time window

                    timeWindowsToAll["preEventTime"] = evt_time.preEventTime;
                    timeWindowsToAll["eventTime"] = evt_time.eventTime;
                    timeWindowsToAll["postEventTime"] = evt_time.postEventTime;
                  }
                }

                exhibitors.push(exhibitor);
              }
            }

            // get exhibitor for venue end

            let venues: any = [];
            if (result && result[1] && result[1].length > 0) {
              for (let i = 0; i < result[1].length; i++) {
                let venueServices: any = [];
                let venueExhibiotrs: any = [];
                let times: any = [];
                // get venue contacts
                let venue = {};
                let singleVenue = result[1][i];

                if (!singleVenue || !singleVenue.venueId) {
                  continue;
                }

                venue["venueId"] = singleVenue.venueId;
                venue["venueRequirements"] = singleVenue.venueRequirements;
                venue["venueNotesToAll"] = singleVenue.venueNotesToAll;
                venue["venueCompanyId"] = singleVenue.venueCompanyId;
                venue["venueCompanyName"] = singleVenue.venueCompanyName;
                venue["companyProfileImage"] = singleVenue.companyProfileImage;
                venue["companyCity"] = singleVenue.companyCity;

                venue["companyPhone"] = singleVenue.companyPhone;
                venue["companyWebsite"] = singleVenue.companyWebsite;
                venue["companyState"] = singleVenue.companyState;

                venue["isPrivate"] = singleVenue.isPrivate;
                venue["internalCmpNotes"] = singleVenue.internalCmpNotes;
                venue["streetAddress1"] = singleVenue.streetAddress1;
                venue["streetAddress2"] = singleVenue.streetAddress2;



                venue["status"] = singleVenue.status; // status - 0 for pending, 1 for accept, 2 for decline

                // get company permssion start

                let resCmp;
                query = `Call getEventCompanyPermission(?,?,?,?)`;

                [err, resCmp] = await to(
                  connection.query(query, [
                    eventId,
                    singleVenue.venueId,
                    loginUserId,
                    3,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }
                console.log("resCmp 3*** ", resCmp);
                resCmp = parseQueryResponse(resCmp);

                venue["isViewPermission"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isViewPermisssion : 0;

                venue["isStaffOrAdmin"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isViewPermisssion : 0; // currently view permission is same as staff or admin of the company

                venue["isSelfIncludedInTab"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isSelfIncludedInTab : 0;
                venue["isSelfIncludedInSection"] = resCmp && resCmp[1] && resCmp[1][0] ? resCmp[1][0].isSelfIncludedInSection : 0;


                let resvenueBtn;
                query = `Call getEventCompanyPermissionBtn(?,?,?,?)`;

                [err, resvenueBtn] = await to(
                  connection.query(query, [
                    eventId,
                    singleVenue.venueId,
                    loginUserId,
                    3,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }


                resvenueBtn = parseQueryResponse(resvenueBtn);

                venue["isViewPermissionBtn"] = resvenueBtn && resvenueBtn[1] && resvenueBtn[1][0] ? resvenueBtn[1][0].isViewPermisssionBtn : 0;


                /* // commented on 06-05-22 as we merged getEventViewPermission into getEventCompanyPermission
                                // get company permission end
                
                                if(!venue["isViewPermission"]){
                                  // get event view permssion start
                
                                  let resEventViewPermission;
                                  query = `Call getEventViewPermission(?,?,?,?)`;
                
                                  [err, resEventViewPermission] = await to(
                                    connection.query(query, [
                                      eventId,
                                      singleVenue.venueId,
                                      loginUserId,
                                      3,
                                    ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                                  );
                                  if (err) {
                                    return Promise.reject(err);
                                  }
                                  resEventViewPermission = parseQueryResponse(resEventViewPermission);
                
                                  venue["isViewPermission"] = resEventViewPermission[0][0].isViewPermisssion;
                
                                // get event view permission end
                                }
                                */

                let contact_rs;
                query = `Call getEventContacts(?,?,?)`;
                [err, contact_rs] = await to(
                  connection.query(query, [eventId, singleVenue.venueId, 3]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }
                contact_rs = parseQueryResponse(contact_rs);

                // venue contacts
                let emContacts: any = [];
                emContacts = this.formatEventContactResult(contact_rs);
                venue["contacts"] = emContacts;

                // get event time
                let time_rs;
                query = `Call getEventTime(?,?,?)`;
                [err, time_rs] = await to(
                  connection.query(query, [eventId, singleVenue.venueId, 3]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }
                time_rs = parseQueryResponse(time_rs);

                let evt_time;
                venue["preEventTime"] = [];
                venue["eventTime"] = [];
                venue["postEventTime"] = [];

                // venue timings
                if (time_rs && time_rs[0] && time_rs[0].length > 0) {
                  evt_time = this.formatEventTimeResult(time_rs);
                  venue["preEventTime"] = evt_time.preEventTime;
                  venue["eventTime"] = evt_time.eventTime;
                  venue["postEventTime"] = evt_time.postEventTime;
                }

                if (services.length > 0) {
                  for (let l = 0; l < services.length; l++) {
                    if (
                      services[l] &&
                      singleVenue &&
                      services[l].venueId == singleVenue.venueId
                    ) {
                      venueServices.push(services[l]);
                    }
                  }
                }
                if (exhibitors.length > 0) {
                  for (let l = 0; l < exhibitors.length; l++) {
                    if (
                      exhibitors[l] &&
                      singleVenue &&
                      exhibitors[l].venueId == singleVenue.venueId
                    ) {
                      venueExhibiotrs.push(exhibitors[l]);
                    }
                  }
                }

                venueServices = _.uniqBy(venueServices, "serviceId");
                venueExhibiotrs = _.uniqBy(venueExhibiotrs, "exhibitorId");
                if (tabType == 4) venue["services"] = venueServices;
                if (tabType == 5)
                  venue["exhibitorData"] = {
                    timeWindowsToAll: timeWindowsToAll,
                    exhibitors: venueExhibiotrs,
                  };
                // venue time
                venues.push(venue);
              }
            }
            eventData["venues"] = venues;
          } else if (tabType == 4) {
            let services: any = [];
            if (result && result[1] && result[1].length > 0) {
              for (let i = 0; i < result[1].length; i++) {
                let times: any = [];
                // get venue contacts
                let service = {};
                let singleService = result[1][i];

                service["serviceId"] = singleService.serviceId;
                service["serviceName"] = singleService.serviceName;
                service["serviceRequirements"] =
                  singleService.serviceRequirements;
                service["notes"] = singleService.internalNotes;
                service["serviceCompanyId"] = singleService.serviceCompanyId;
                service["serviceCompanyName"] =
                  singleService.serviceCompanyName;
                service["companyProfileImage"] =
                  singleService.companyProfileImage;

                service["companyPhone"] = singleService.companyPhone;
                service["companyWebsite"] = singleService.companyWebsite;

                let contact_rs;
                query = `Call getEventContacts(?,?,?)`;
                [err, contact_rs] = await to(
                  connection.query(query, [
                    eventId,
                    singleService.serviceId,
                    tabType,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }
                contact_rs = parseQueryResponse(contact_rs);

                // service contacts
                let emContacts: any = [];
                emContacts = this.formatEventContactResult(contact_rs);

                service["contacts"] = emContacts;

                // get service time
                let time_rs;
                query = `Call getEventTime(?,?,?)`;
                [err, time_rs] = await to(
                  connection.query(query, [
                    eventId,
                    singleService.serviceId,
                    tabType,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }
                time_rs = parseQueryResponse(time_rs);

                let evt_time;
                service["preEventTime"] = [];
                service["eventTime"] = [];
                service["postEventTime"] = [];

                // venue timings
                if (time_rs && time_rs[0] && time_rs[0].length > 0) {
                  evt_time = this.formatEventTimeResult(time_rs);
                  service["preEventTime"] = evt_time.preEventTime;
                  service["eventTime"] = evt_time.eventTime;
                  service["postEventTime"] = evt_time.postEventTime;
                }

                services.push(service);
              }
            }

            eventData["services"] = services;
          } else if (tabType == 5) {
            eventData["exhibitors"] = [];

            let timeWindowsToAll = {};
            let exhibitors: any = [];
            if (result && result[1] && result[1].length > 0) {
              for (let i = 0; i < result[1].length; i++) {
                let times: any = [];
                // get venue contacts
                let exhibitor = {};
                let singleExhibitor = result[1][i];

                exhibitor["exhibitorId"] = singleExhibitor.exhibitorId;
                exhibitor["exhibitorName"] = singleExhibitor.exhibitorName;
                exhibitor["exhibitorRequirements"] =
                  singleExhibitor.exhibitorRequirements;
                exhibitor["notes"] = singleExhibitor.notes;
                exhibitor["exhibitorCompanyId"] =
                  singleExhibitor.exhibitorCompanyId;
                exhibitor["exhibitorCompanyName"] =
                  singleExhibitor.exhibitorCompanyName;
                exhibitor["companyProfileImage"] =
                  singleExhibitor.companyProfileImage;

                exhibitor["companyPhone"] = singleExhibitor.companyPhone;
                exhibitor["companyWebsite"] = singleExhibitor.companyWebsite;
                exhibitor["standNumber"] = singleExhibitor.standNumber;

                eventData["timeWindowsToAll"] = [];

                let contact_rs;
                query = `Call getEventContacts(?,?,?)`;
                [err, contact_rs] = await to(
                  connection.query(query, [
                    eventId,
                    singleExhibitor.exhibitorId,
                    tabType,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }
                contact_rs = parseQueryResponse(contact_rs);

                // service contacts
                let emContacts: any = [];
                emContacts = this.formatEventContactResult(contact_rs);

                exhibitor["contacts"] = emContacts;
                // get service time
                let time_rs;
                query = `Call getEventTime(?,?,?)`;
                [err, time_rs] = await to(
                  connection.query(query, [
                    eventId,
                    singleExhibitor.exhibitorId,
                    tabType,
                  ]) // tabType - 1 for client, 2 for event manager, 3 - venue, 4 for supplier, 5 for exhibitor
                );
                if (err) {
                  return Promise.reject(err);
                }
                time_rs = parseQueryResponse(time_rs);

                let evt_time;
                exhibitor["preEventTime"] = [];
                exhibitor["eventTime"] = [];
                exhibitor["postEventTime"] = [];

                // venue timings
                if (time_rs && time_rs[0] && time_rs[0].length > 0) {
                  evt_time = this.formatEventTimeResult(time_rs);
                  exhibitor["preEventTime"] = evt_time.preEventTime;
                  exhibitor["eventTime"] = evt_time.eventTime;
                  exhibitor["postEventTime"] = evt_time.postEventTime;

                  if (!timeWindowsToAll["preEventTime"]) {
                    evt_time = this.formatEventTimeResult(time_rs, 1); // for exhibitor all time window

                    timeWindowsToAll["preEventTime"] = evt_time.preEventTime;
                    timeWindowsToAll["eventTime"] = evt_time.eventTime;
                    timeWindowsToAll["postEventTime"] = evt_time.postEventTime;
                  }
                }

                exhibitors.push(exhibitor);
              }
            }
            eventData["exhibitors"] = exhibitors;

            if (eventData["timeWindowsToAll"].length < 1) {
              eventData["timeWindowsToAll"] = timeWindowsToAll;
            }
          }
        }
      }

      // get event common data start

      let res1;
      query = `Call getEventList(?,?,?,?,?,?)`;
      [err, res1] = await to(
        connection.query(query, [eventId, loginUserId, 0, 0, 0, 0])
      );
      if (err) {
        return Promise.reject(err);
      }
      res1 = parseQueryResponse(res1);

      let commonEventData = {};
      commonEventData["venues"] = res1[0];

      if (res1[1]) {
        // time
        commonEventData["eventStartDate"] = res1[1][0].startDateTime;
        commonEventData["eventEndDate"] = res1[1][0].endDateTime;
      }
      if (res1[2]) {
        // event contacts services
        let services: any = [];
        let serviceName = {
          client: "Client",
          event_manager: "Event Manager",
          venue: "Venue",
          supplier: "Supplier",
          exhibitor: "Exhibitor",
        };
        for (let k = 0; k < res1[2].length; k++) {
          let contact = res1[2][k];
          services.push({
            serviceName: serviceName[contact.contactType],
            roleName: contact.roleName,
          });
        }
        commonEventData["services"] = services;
      }
      commonEventData["eventId"] = "";
      commonEventData["title"] = "";
      commonEventData["clientCompanyName"] = "";
      commonEventData["clientCompanyState"] = "";
      commonEventData["clientCompanyCity"] = "";
      if (res1[3][0]) {
        commonEventData["eventId"] = res1[3][0].eventId;
        commonEventData["title"] = res1[3][0].title;
        commonEventData["clientCompanyName"] = res1[3][0].clientCompanyName;
        commonEventData["clientCompanyState"] = res1[3][0].clientCompanyState;
        commonEventData["clientCompanyCity"] = res1[3][0].clientCompanyCity;
      }

      // get event common data end

      eventData["commonEventData"] = commonEventData;
      result = eventData;

      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  formatEventTimeResult(data: any, forAll: number = 0) {
    let time_rs = data;

    let bumpIn: any = [];
    let eventTime: any = [];
    let bumpOut: any = [];

    for (let i = 0; i < time_rs[0].length; i++) {
      let singleTime = time_rs[0][i];

      if (singleTime.timeId) {
        if (forAll == 0) {
          if (singleTime.timeType == "pre") {
            bumpIn.push({
              timeId: singleTime.timeId,
              startDateTime: singleTime.timeStart,
              endDateTime: singleTime.timeEnd,
              notes: singleTime.timeNotes,
              timeType: singleTime.timeType,
              sameAsVenue: singleTime.sameAsVenue,
            });
          } else if (singleTime.timeType == "actual") {
            eventTime.push({
              timeId: singleTime.timeId,
              startDateTime: singleTime.timeStart,
              endDateTime: singleTime.timeEnd,
              notes: singleTime.timeNotes,
              timeType: singleTime.timeType,
              sameAsVenue: singleTime.sameAsVenue,
            });
          } else if (singleTime.timeType == "post") {
            bumpOut.push({
              timeId: singleTime.timeId,
              startDateTime: singleTime.timeStart,
              endDateTime: singleTime.timeEnd,
              notes: singleTime.timeNotes,
              timeType: singleTime.timeType,
              sameAsVenue: singleTime.sameAsVenue,
            });
          }
        } else if (forAll == 1) {
          // for all time exhibitor tab

          if (singleTime.timeType == "preAll") {
            bumpIn.push({
              timeId: singleTime.timeId,
              startDateTime: singleTime.timeStart,
              endDateTime: singleTime.timeEnd,
              notes: singleTime.timeNotes,
              timeType: singleTime.timeType,
              sameAsVenue: singleTime.sameAsVenue,
            });
          } else if (singleTime.timeType == "actualAll") {
            eventTime.push({
              timeId: singleTime.timeId,
              startDateTime: singleTime.timeStart,
              endDateTime: singleTime.timeEnd,
              notes: singleTime.timeNotes,
              timeType: singleTime.timeType,
              sameAsVenue: singleTime.sameAsVenue,
            });
          } else if (singleTime.timeType == "postAll") {
            bumpOut.push({
              timeId: singleTime.timeId,
              startDateTime: singleTime.timeStart,
              endDateTime: singleTime.timeEnd,
              notes: singleTime.timeNotes,
              timeType: singleTime.timeType,
              sameAsVenue: singleTime.sameAsVenue,
            });
          }
        }
      } else {
        return { preEventTime: [], eventTime: [], postEventTime: [] };
      }
    }

    return {
      preEventTime: bumpIn,
      eventTime: eventTime,
      postEventTime: bumpOut,
    };
  }
  formatEventContactResult(data: any) {
    let emContacts: any = [];
    let contact_rs = data;

    if (contact_rs && contact_rs[0] && contact_rs[0].length > 0) {
      for (let i = 0; i < contact_rs[0].length; i++) {
        let singleContact = contact_rs[0][i];
        let firstName = singleContact.contactFirstName;
        if (singleContact.isPrivate) {
          firstName = singleContact.contactUserName ? singleContact.contactUserName : firstName;
        }
        if (singleContact.contactId) {
          emContacts.push({
            id: singleContact.contactUserId,
            email: singleContact.contactEmail,
            firstName: firstName,
            lastName: singleContact.contactLastName,
            contactMobile: singleContact.contactMobile,
            contactLabelId: singleContact.contactRoleId,
            mobile: singleContact.contactMobile ? singleContact.contactMobile : singleContact.mobile,
            //mobile: singleContact.contactMobile ? singleContact.contactMobile : singleContact.mobile,
            contactRole: singleContact.isCrew == 1 ? singleContact.crewRole : singleContact.contactRole,  // assign crew role or contact role
            contactPosition: singleContact.position,
            profileImage: singleContact.profileImage,
            isCrew: singleContact.isCrew,
            isPrivate: singleContact.isPrivate,
          });
        }
      }
    }
    return emContacts;
  }

  /**
   * search company contacts by keyword
   */
  async searchCompanyContactsByKeyword(
    keyword: string,
    companyId: number,
    isCrew: number = 0
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call searchCompanyContactsByKeyword(?,?,?)`;
      [err, result] = await to(connection.query(query, [keyword, companyId, isCrew]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }


  /**
   * search company contacts
   */
  async getCompanyContacts(
    //keyword: string,
    companyId: number,
    isCrew: number = 0,
    loginUserId: number,
    creatorFromCompanyId: number

  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call getCompanyContacts(?,?,?,?)`;
      [err, result] = await to(connection.query(query, [companyId, isCrew, loginUserId, creatorFromCompanyId]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }



  /**
   * search company contacts by keyword
   */
  async searchCompanyByKeyword(keyword: string): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call searchCompanyByKeyword(?)`;
      [err, result] = await to(connection.query(query, [keyword]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * search company contacts by keyword
   */
  async getUserEvent(user_id: number, event_id: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call getUserEvent(?,?)`;
      [err, result] = await to(connection.query(query, [user_id, event_id]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * search company contacts by keyword for send cofirmation
   */
  async getUserEventForSend(user_id: any, event_id: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      const idArray = user_id.map(item => `'${item}'`).join(' , ');
      let query = `Call getUserEventSendConfirm(?,?)`;
      [err, result] = await to(connection.query(query, [idArray, event_id]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      // console.log("result for all userEvent +++++",result)
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * get event list by user id
   */
  async getEventList(
    user_id: number,
    start_page: number,
    page_size: number,
    isArchived: number,
    isPast: number = 0
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();

      let query = `Call getEventList(?,?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [
          0,
          user_id,
          start_page,
          page_size,
          isArchived,
          isPast,
        ]) // pass 0 to get all event of the user
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      if (isPast == 0) {
        for (let i = 0; i < result[1].length; i++) {
          // push event with date after the event without date
          let temp = result[1][i];
          result[0].push(temp);
        }
      } else {
        result[0] = result[1];
      }

      let eventList: any = [];

      if (result && result[0]) {
        for (let i = 0; i < result[0].length; i++) {
          let singleEvent = result[0][i];
          let eventData = {};

          eventData["eventId"] = singleEvent.eventId;
          eventData["title"] = singleEvent.title;
          eventData["clientCompanyName"] = singleEvent.clientCompanyName;
          eventData["clientCompanyState"] = singleEvent.clientCompanyState;
          eventData["clientCompanyCity"] = singleEvent.clientCompanyCity;

          let res1;
          query = `Call getEventList(?,?,?,?,?,?)`;
          [err, res1] = await to(
            connection.query(query, [
              singleEvent.eventId,
              user_id,
              0,
              0,
              isArchived,
              0,
            ]) // pass 0 to get all event of the user
          );
          if (err) {
            return Promise.reject(err);
          }
          res1 = parseQueryResponse(res1);
          eventData["venues"] = res1[0];

          if (res1[1]) {
            // time
            eventData["eventStartDate"] = res1[1][0].startDateTime;
            eventData["eventEndDate"] = res1[1][0].endDateTime;
          }
          if (res1[2]) {
            // event contacts services
            let services: any = [];
            let serviceName = {
              client: "Client",
              event_manager: "Event Manager",
              venue: "Venue",
              supplier: "Supplier",
              exhibitor: "Exhibitor",
            };
            for (let k = 0; k < res1[2].length; k++) {
              let contact = res1[2][k];
              services.push({
                serviceName: contact.contactType == 'supplier' && contact.service_name != '' ? contact.service_name : serviceName[contact.contactType],
                roleName: contact.is_crew != 1 ? contact.roleName : contact.crewRole,
                servicesId: contact.serviceId
              });
            }
            eventData["services"] = services;
          }
          eventList.push(eventData);
        }
      }
      result = eventList;

      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * search company contacts by keyword
   */
  async getEventById(event_id: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call getEventById(?)`;
      [err, result] = await to(connection.query(query, [event_id]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * save event client
   */
  async saveBasicEvent(
    title: string,
    description: string,
    createrUserId: string,
    creatorFromCompanyId: string,
    hasExhibitors: any,
    clientCompanyId: string,
    clientIsOwnCompany: any,
    eventManagerId: string,
    eventManagerIsOwnCompany: any,
    eventManagerRequirements: string,
    updateEventId: number = 0,
    emInternalNotes: string = "",
    clientInternalCmpNotes: string = ""
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();

      let query = `Call saveBasicEvent(?,?,?,?,?,?,?,?,?,?, ?,?,?)`;
      [err, result] = await to(
        connection.query(query, [
          title,
          description,
          createrUserId,
          creatorFromCompanyId,
          hasExhibitors,
          clientCompanyId,
          clientIsOwnCompany,
          eventManagerId,
          eventManagerIsOwnCompany,
          eventManagerRequirements,
          updateEventId,
          emInternalNotes,
          clientInternalCmpNotes,
        ])
      );
      if (err) {
        return Promise.reject(err);
      }

      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * save event client
   */
  async saveEventClientContacts(
    event_id: number,
    client: any,
    createdBy: number,
    creatorFromCompanyId: number,
    updateEventId: number = 0
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();

      let invitedClient;
      if (client.invited) {
        let invited = client.invited;
        let tabId = event_id;
        let tabType = 1;
        let query = `Call inviteNewCompany(?,?,?,?,?,?,?,?,?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            invited.companyName,
            invited.countryId,
            invited.city,
            invited.contactName,
            invited.contactEmail,
            creatorFromCompanyId,
            createdBy,
            tabId,
            tabType,
            event_id,
            1
          ])
        );
        if (err) {
          return Promise.reject(err);
        }

        let userId;
        let companyId;
        if (result[0] && result[0][0] && result[0][0].userId) {
          userId = result[0][0].userId;
          companyId = result[0][0].companyId;
          invitedClient = result[0][0];
        }

        if (!client.contacts) {
          client.contacts = []; // assign empty array if contacts is null
        }
        client.contacts.push({
          id: userId,
          email: null,
          firstName: invited.contactName ? invited.contactName : null,
          contactLabelId: null,
        }); // if invited
      }

      if (client.contacts && client.contacts.length > 0) {
        let contactUserIds: any = [];
        for (let i = 0; i < client.contacts.length; i++) {
          if (client.contacts[i]) {
            let tempContact = client.contacts[i];
            tempContact.id = tempContact.id ? tempContact.id : null;
            tempContact.mobile = tempContact.mobile ? tempContact.mobile : null;
            let contactLabelId =
              tempContact && tempContact.contactLabelId
                ? tempContact.contactLabelId
                : null;

            let addContactCompanyId = client.id ? client.id : null;

            let isCrew = tempContact.isCrew ? 1 : 0;
            let isInvited = client.invited ? 1 : 0;
            let query = `Call saveEventContacts(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            [err, result] = await to(
              connection.query(query, [
                event_id,
                tempContact.id,
                createdBy,
                "client",
                tempContact.email,
                tempContact.firstName,
                null,
                contactLabelId,
                creatorFromCompanyId,
                isCrew,
                null,
                tempContact.mobile,
                0,
                isInvited,
                addContactCompanyId
              ])
            );

            if (result && result[0][0]) {
              contactUserIds.push(result[0][0].userId);

              if (result[0][0].isNotiSent == 0) {
                console.log('save event contacts email', result[0][0])
                // send notification only one time
                sendEventNotification(
                  invitedClient,
                  result[0][0],
                  event_id,
                  "client",
                  client.id
                );
              }
            }

            if (err) {
              return Promise.reject(err);
            }
          }
        }

        // delete other contact in case of update
        if (updateEventId > 0 && contactUserIds.length > 0) {
          let query = `Call deleteEventContacts(?,?,?,?)`;
          [err, result] = await to(
            connection.query(query, [
              event_id,
              contactUserIds.toString(),
              0,
              "client",
            ]) // 0 for client and event manager tab
          );
        }
      }

      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * save event manager
   */
  async saveEventManagerContacts(
    event_id: number,
    eventManager: any,
    createdBy: number,
    creatorFromCompanyId: number,
    updateEventId: number = 0,
    mobile: any = "",
    isNewEvent: boolean,
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();

      let invitedClient;
      console.log('inviteNewCompany manager')
      if (eventManager.invited) {
        let invited = eventManager.invited;
        let tabId = event_id;
        let tabType = 2;
        let query = `Call inviteNewCompany(?,?,?,?,?,?,?,?,?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            invited.companyName,
            invited.countryId,
            invited.city,
            invited.contactName,
            invited.contactEmail,
            creatorFromCompanyId,
            createdBy,
            tabId,
            tabType,
            event_id,
            1
          ])
        );
        if (err) {
          return Promise.reject(err);
        }

        let userId;
        let companyId;
        if (result[0] && result[0][0] && result[0][0].userId) {
          userId = result[0][0].userId;
          companyId = result[0][0].companyId;
          invitedClient = result[0][0];
        }

        if (!eventManager.contacts) {
          eventManager.contacts = []; // assign empty array if contacts is null
        }
        eventManager.contacts.push({
          id: userId,
          email: null,
          firstName: invited.contactName ? invited.contactName : null,
          contactLabelId: null,
        }); // if invited
      }

      if (eventManager.contacts && eventManager.contacts.length > 0) {
        let contactUserIds: any = [];
        for (let i = 0; i < eventManager.contacts.length; i++) {
          if (eventManager.contacts[i]) {
            eventManager.contacts[i].id = eventManager.contacts[i].id
              ? eventManager.contacts[i].id
              : null;

            let addContactCompanyId = eventManager.id ? eventManager.id : null;

            let contactLabelId =
              eventManager.contacts[i] &&
                eventManager.contacts[i].contactLabelId
                ? eventManager.contacts[i].contactLabelId
                : null;
            let isCrew = eventManager.contacts[i].isCrew ? 1 : 0;
            let isInvited = eventManager.invited ? 1 : 0;
            let query = `Call saveEventContacts(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            [err, result] = await to(
              connection.query(query, [
                event_id,
                eventManager.contacts[i].id,
                createdBy,
                "event_manager",
                eventManager.contacts[i].email,
                eventManager.contacts[i].firstName,
                null,
                contactLabelId,
                creatorFromCompanyId,
                isCrew,
                null,
                eventManager.contacts[i].mobile,
                isNewEvent,
                isInvited,
                addContactCompanyId
              ])
            );

            if (result[0][0]) {
              contactUserIds.push(result[0][0].userId);
              if (result[0][0].isNotiSent == 0) {
                // send notification only one time
                sendEventNotification(
                  invitedClient,
                  result[0][0],
                  event_id,
                  "event_manager",
                  eventManager.id
                );
              }
            }

            if (err) {
              return Promise.reject(err);
            }
          }
        }

        // delete other contact in case of update
        if (updateEventId > 0 && contactUserIds.length > 0) {
          let query = `Call deleteEventContacts(?,?,?,?)`;
          [err, result] = await to(
            connection.query(query, [
              event_id,
              contactUserIds.toString(),
              0,
              "event_manager",
            ]) // 0 for cleint and event manager tab
          );
        }
      }

      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * save Venues
   */
  async saveVenues(
    event_id: number,
    venues: any,
    createdBy: number,
    updateEventId: number = 0,
    creatorFromCompanyId: number
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();

      if (venues.list && venues.list.length > 0) {
        for (let i = 0; i < venues.list.length; i++) {
          let inVenueId = 0;
          if (updateEventId > 0 && venues.list[i].venueId) {
            inVenueId = venues.list[i].venueId;
          }

          // check if global event time exists in the data start , this code is to save global time when no exhibitor is created for event. so we need not to change the existing code for global exhibitor all time ( on date - 04-05-2022 )

          if (venues.list[i].timeWindowsToAllExGlobal && false) {  // it is working code but we don't want to run it as  client has not approved 

            // first we delete the global exhibitor time 
            if (event_id > 0) {
              let query = `Call deleteEventTime(?,?,?,?)`;
              [err, result] = await to(
                connection.query(query, [
                  event_id,
                  null,
                  null,
                  "exhibitorGlobalAll",
                ])
              );
              if (err) {
                return Promise.reject(err);
              }
            }



            if (venues.list[i].timeWindowsToAllExGlobal.bumpIn) {
              let bumpIn = venues.list[i].timeWindowsToAllExGlobal.bumpIn;
              if (bumpIn.timings && bumpIn.timings.length > 0) {
                for (let k = 0; k < bumpIn.timings.length; k++) {
                  let item = bumpIn.timings[k];
                  let timeId = item.timeId ? item.timeId : 0;
                  bumpIn.sameAsVenue = bumpIn.sameAsVenue ? 1 : 0;
                  let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                  [err, result] = await to(
                    connection.query(query, [
                      event_id,
                      null,
                      item.startDateTime,
                      item.endDateTime,
                      "preExhibitorGlobalAll",
                      item.notes,
                      timeId,
                      bumpIn.sameAsVenue,
                    ])
                  );
                  if (err) {
                    return Promise.reject(err);
                  }
                }
              }
            }
            if (venues.list[i].timeWindowsToAllExGlobal.eventTime) {
              let eventTime = venues.list[i].timeWindowsToAllExGlobal.bumpIn;
              if (eventTime.timings && eventTime.timings.length > 0) {
                for (let k = 0; k < eventTime.timings.length; k++) {
                  let item = eventTime.timings[k];
                  let timeId = item.timeId ? item.timeId : 0;
                  eventTime.sameAsVenue = eventTime.sameAsVenue ? 1 : 0;
                  let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                  [err, result] = await to(
                    connection.query(query, [
                      event_id,
                      null,
                      item.startDateTime,
                      item.endDateTime,
                      "eventExhibitorGlobalAll",
                      item.notes,
                      timeId,
                      eventTime.sameAsVenue,
                    ])
                  );
                  if (err) {
                    return Promise.reject(err);
                  }
                }
              }
            }
            if (venues.list[i].timeWindowsToAllExGlobal.bumpOut) {
              let bumpOut = venues.list[i].timeWindowsToAllExGlobal.bumpIn;
              if (bumpOut.timings && bumpOut.timings.length > 0) {
                for (let k = 0; k < bumpOut.timings.length; k++) {
                  let item = bumpOut.timings[k];
                  let timeId = item.timeId ? item.timeId : 0;
                  bumpOut.sameAsVenue = bumpOut.sameAsVenue ? 1 : 0;
                  let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                  [err, result] = await to(
                    connection.query(query, [
                      event_id,
                      null,
                      item.startDateTime,
                      item.endDateTime,
                      "postExhibitorGlobalAll",
                      item.notes,
                      timeId,
                      bumpOut.sameAsVenue,
                    ])
                  );
                  if (err) {
                    return Promise.reject(err);
                  }
                }
              }
            }

          }

          // check if global event time exists in the data end 


          // save basic venue detail
          let query = `Call saveBasicVenueDetail(?,?,?,?,?,?,?)`;
          [err, result] = await to(
            connection.query(query, [
              event_id,
              venues.notesToAll,
              venues.list[i].companyId,
              venues.list[i].requirements,
              createdBy,
              inVenueId,
              venues.list[i].internalCmpNotes,
            ])
          );
          if (err) {
            return Promise.reject(err);
          }

          let venueId;
          if (result && result[0] && result[0][0])
            venueId = result[0][0].venueId;

          let invitedClient;

          if (venues.list[i].invited) {
            let result1;
            let tabId = venueId;
            let tabType = 3;
            let invited = venues.list[i].invited;
            let query = `Call inviteNewCompany(?,?,?,?,?,?,?,?,?,?,?)`;
            [err, result1] = await to(
              connection.query(query, [
                invited.companyName,
                invited.countryId,
                invited.city,
                invited.contactName,
                invited.contactEmail,
                creatorFromCompanyId,
                createdBy,
                tabId,
                tabType,
                event_id,
                1
              ])
            );
            if (err) {
              return Promise.reject(err);
            }

            let userId;
            let companyId;
            if (result1[0] && result1[0][0] && result1[0][0].userId) {
              userId = result1[0][0].userId;
              companyId = result1[0][0].companyId;
              invitedClient = result1[0][0];
            }

            if (!venues.list[i].contacts) {
              venues.list[i].contacts = []; // assign empty array if contacts is null
            }
            venues.list[i].contacts.push({
              id: userId,
              email: null,
              firstName: null,
              contactLabelId: null,
            }); // if invited
          }

          // save venue contact ids
          if (venues.list[i].contacts && venues.list[i].contacts.length > 0) {
            let contactUserIds: any = [];
            for (let j = 0; j < venues.list[i].contacts.length; j++) {
              venueId = venueId ? venueId : null;
              if (venues.list[i].contacts[j]) {
                venues.list[i].contacts[j].id = venues.list[i].contacts[j].id
                  ? venues.list[i].contacts[j].id
                  : null;

                let contactLabelId =
                  venues.list[i].contacts[j] &&
                    venues.list[i].contacts[j].contactLabelId
                    ? venues.list[i].contacts[j].contactLabelId
                    : null;


                let addContactCompanyId = venues.list[i].companyId ? venues.list[i].companyId : null;

                let contactRole =
                  venues.list[i].contacts[j] &&
                    venues.list[i].contacts[j].contactRole
                    ? venues.list[i].contacts[j].contactRole
                    : null;

                let isCrew = venues.list[i].contacts[j].isCrew ? 1 : 0;
                if (isCrew == 1) {
                  contactLabelId = null;
                } else {
                  contactRole = null;
                }
                let isInvited = venues.list[i].invited ? 1 : 0;
                let query = `Call saveEventContacts(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                [err, result] = await to(
                  connection.query(query, [
                    event_id,
                    venues.list[i].contacts[j].id,
                    createdBy,
                    "venue",
                    venues.list[i].contacts[j].email,
                    venues.list[i].contacts[j].firstName,
                    venueId,
                    contactLabelId,
                    creatorFromCompanyId,
                    isCrew,
                    contactRole,
                    venues.list[i].contacts[j].mobile,
                    0,
                    isInvited,
                    addContactCompanyId
                  ])
                );

                if (result[0][0]) {
                  contactUserIds.push(result[0][0].userId);
                  try {
                    if (result[0][0].isNotiSent == 0) {

                      // send notification only one time
                      sendEventNotification(
                        invitedClient,
                        result[0][0],
                        event_id,
                        "venue",
                        venues.list[i].companyId
                      );
                    }
                  } catch (e) {
                    console.log("exception ", e);
                  }
                }

                if (err) {
                  return Promise.reject(err);
                }
              }
            }

            // delete other contact in case of update
            if (updateEventId > 0 && contactUserIds.length > 0 && venueId) {
              let query = `Call deleteEventContacts(?,?,?,?)`;
              [err, result] = await to(
                connection.query(query, [
                  event_id,
                  contactUserIds.toString(),
                  venueId,
                  "venue",
                ])
              );
            }
          }

          if (venueId) {
            // save pre time
            let timeIdArr: any = [];

            if (
              venues.list[i].preEventAccessDateTimes &&
              venues.list[i].preEventAccessDateTimes.length > 0
            ) {
              for (
                let k = 0;
                k < venues.list[i].preEventAccessDateTimes.length;
                k++
              ) {
                let item = venues.list[i].preEventAccessDateTimes[k];
                let timeId = item.timeId ? item.timeId : 0;
                let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                [err, result] = await to(
                  connection.query(query, [
                    event_id,
                    venueId,
                    item.startDateTime,
                    item.endDateTime,
                    "preVenue",
                    item.notes,
                    timeId,
                    0,
                  ]) // 0 for venue (sameAsVenue)
                );

                if (err) {
                  return Promise.reject(err);
                }
                if (
                  result &&
                  result[0] &&
                  result[0][0] &&
                  result[0][0].eventTimeId
                ) {
                  timeIdArr.push(result[0][0].eventTimeId);
                }
              }
            }

            // save event time

            if (
              venues.list[i].eventAccessDateTimes &&
              venues.list[i].eventAccessDateTimes.length > 0
            ) {
              for (
                let l = 0;
                l < venues.list[i].eventAccessDateTimes.length;
                l++
              ) {
                let item = venues.list[i].eventAccessDateTimes[l];
                let timeId = item.timeId ? item.timeId : 0;
                let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                [err, result] = await to(
                  connection.query(query, [
                    event_id,
                    venueId,
                    item.startDateTime,
                    item.endDateTime,
                    "eventVenue",
                    item.notes,
                    timeId,
                    0,
                  ]) // 0 for venue (sameAsVenue)
                );
                if (err) {
                  return Promise.reject(err);
                }

                if (
                  result &&
                  result[0] &&
                  result[0][0] &&
                  result[0][0].eventTimeId
                ) {
                  timeIdArr.push(result[0][0].eventTimeId);
                }
              }
            }

            // save post time

            if (
              venues.list[i].postEventAccessDateTimes &&
              venues.list[i].postEventAccessDateTimes.length > 0
            ) {
              for (
                let m = 0;
                m < venues.list[i].postEventAccessDateTimes.length;
                m++
              ) {
                let item = venues.list[i].postEventAccessDateTimes[m];
                let timeId = item.timeId ? item.timeId : 0;
                let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                [err, result] = await to(
                  connection.query(query, [
                    event_id,
                    venueId,
                    item.startDateTime,
                    item.endDateTime,
                    "postVenue",
                    item.notes,
                    timeId,
                    0,
                  ]) // 0 for venue (sameAsVenue)
                );
                if (err) {
                  return Promise.reject(err);
                }
                if (
                  result &&
                  result[0] &&
                  result[0][0] &&
                  result[0][0].eventTimeId
                ) {
                  timeIdArr.push(result[0][0].eventTimeId);
                }
              }
            }

            // delete other event time
            // if (updateEventId > 0 && timeIdArr.length > 0) {
            if (updateEventId > 0) {
              let query = `Call deleteEventTime(?,?,?,?)`;
              [err, result] = await to(
                connection.query(query, [
                  event_id,
                  timeIdArr.toString(),
                  venueId,
                  "venue",
                ])
              );
              if (err) {
                return Promise.reject(err);
              }
            }

            // only for save not for update
            if (updateEventId == 0 || !venues.list[i].venueId) {
              //
              // save supplier
              if (
                venues.list[i].suppliers &&
                venues.list[i].suppliers.length > 0
              ) {
                let ser_result = await new UserMgmtDao().saveSuppliers(
                  event_id,
                  venues.list[i].suppliers,
                  createdBy,
                  creatorFromCompanyId,
                  venueId
                );
              }
              // save exhibitors
              if (
                venues.list[i].exhibitorList &&
                venues.list[i].exhibitorList.length > 0
              ) {
                let ex_result = await new UserMgmtDao().saveExhibitors(
                  event_id,
                  venues.list[i].exhibitorList,
                  createdBy,
                  creatorFromCompanyId,
                  venueId
                );
              }
            } else {
              // for update

              // update suppliers
              if (
                venues.list[i].suppliers &&
                venues.list[i].suppliers.length > 0
              ) {
                let ser_result = await new UserMgmtDao().saveSuppliers(
                  event_id,
                  venues.list[i].suppliers,
                  createdBy,
                  creatorFromCompanyId,
                  venueId,
                  event_id
                );
              }
              // update exhibitors
              if (
                venues.list[i].exhibitorList &&
                venues.list[i].exhibitorList.length > 0
              ) {
                let ex_result = await new UserMgmtDao().saveExhibitors(
                  event_id,
                  venues.list[i].exhibitorList,
                  createdBy,
                  creatorFromCompanyId,
                  venueId,
                  event_id
                );
              }
            }
          }
        }
      }

      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * save and invite event tab
   */
  async saveAndInviteEventTab(keyword: string): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call saveAndInviteEventTab(?)`;
      [err, result] = await to(connection.query(query, [keyword]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * save suppliers
   */
  async saveSuppliers(
    event_id: number,
    suppliers: any,
    createdById: number,
    creatorFromCompanyId: number,
    venueId: number,
    updateEventId: number = 0
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      if (suppliers && suppliers.length > 0) {
        for (let i = 0; i < suppliers.length; i++) {
          let services = suppliers[i].services;
          if (services && services.length > 0) {
            for (let j = 0; j < services.length; j++) {
              let single_service = services[j];

              let inSupplierId = 0;
              if (updateEventId > 0) {
                if (single_service.supplierId)
                  inSupplierId = single_service.supplierId;
                // if(suppliers[i].venueId)
                //   venueId = suppliers[i].venueId;
              }

              // save basic supplier detail
              let query = `Call saveBasicSupplierDetail(?,?,?,?,?,?,?,?,?)`;
              [err, result] = await to(
                connection.query(query, [
                  single_service.name,
                  event_id,
                  venueId,
                  single_service.companyId,
                  single_service.requirement,
                  suppliers[i].notesToAll,
                  createdById,
                  inSupplierId,
                  single_service.internalCmpNotes,
                ])
              );
              if (err) {
                return Promise.reject(err);
              }

              let serviceId;
              if (result && result[0] && result[0][0]) {
                serviceId = result[0][0].serviceId;
              }

              let invitedClient;

              if (single_service.invited) {
                let invited = single_service.invited;
                let tabId = serviceId;
                let tabType = 4;
                let query = `Call inviteNewCompany(?,?,?,?,?,?,?,?,?,?,?)`;
                [err, result] = await to(
                  connection.query(query, [
                    invited.companyName,
                    invited.countryId,
                    invited.city,
                    invited.contactName,
                    invited.contactEmail,
                    creatorFromCompanyId,
                    createdById,
                    tabId,
                    tabType,
                    event_id,
                    1
                  ])
                );
                if (err) {
                  return Promise.reject(err);
                }

                let userId;
                let companyId;
                if (result[0] && result[0][0] && result[0][0].userId) {
                  userId = result[0][0].userId;
                  companyId = result[0][0].companyId;
                  invitedClient = result[0][0];
                }

                if (!single_service.contacts) {
                  single_service.contacts = []; // assign empty array if contacts is null
                }
                single_service.contacts.push({
                  id: userId,
                  email: null,
                  firstName: null,
                  contactLabelId: null,
                }); // if invited
              }

              if (
                single_service.contacts &&
                single_service.contacts.length > 0
              ) {
                let contactUserIds: any = [];
                for (let i = 0; i < single_service.contacts.length; i++) {
                  serviceId = serviceId ? serviceId : null;
                  if (single_service.contacts[i]) {
                    single_service.contacts[i].id = single_service.contacts[i]
                      .id
                      ? single_service.contacts[i].id
                      : null;

                    let contactLabelId = single_service
                      .contacts[i].contactLabelId
                      ? single_service.contacts[i].contactLabelId
                      : null;

                    let contactRole = single_service
                      .contacts[i].contactRole
                      ? single_service.contacts[i].contactRole
                      : null;




                    let addContactCompanyId = single_service.companyId ? single_service.companyId : null;

                    let isCrew = single_service.contacts[i].isCrew ? 1 : 0;

                    if (isCrew == 1) {
                      contactLabelId = null;
                    } else {
                      contactRole = null;
                    }

                    let isInvited = single_service.invited ? 1 : 0;
                    let query = `Call saveEventContacts(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    [err, result] = await to(
                      connection.query(query, [
                        event_id,
                        single_service.contacts[i].id,
                        createdById,
                        "supplier",
                        single_service.contacts[i].email,
                        single_service.contacts[i].firstName,
                        serviceId,
                        contactLabelId,
                        creatorFromCompanyId,
                        isCrew,
                        contactRole,
                        single_service.contacts[i].mobile,
                        0,
                        isInvited,
                        addContactCompanyId
                      ])
                    );
                    if (result[0][0]) {
                      contactUserIds.push(result[0][0].userId);

                      if (result[0][0].isNotiSent == 0) {
                        // send notification only one time
                        sendEventNotification(
                          invitedClient,
                          result[0][0],
                          event_id,
                          "supplier",
                          single_service.companyId
                        );
                      }
                    }
                    if (err) {
                      return Promise.reject(err);
                    }
                  }
                }

                // delete other contact in case of update
                if (
                  updateEventId > 0 &&
                  contactUserIds.length > 0 &&
                  serviceId
                ) {
                  let query = `Call deleteEventContacts(?,?,?,?)`;
                  [err, result] = await to(
                    connection.query(query, [
                      event_id,
                      contactUserIds.toString(),
                      serviceId,
                      "supplier",
                    ])
                  );
                }
              }

              // save time
              let timeIdArr: any = [];
              if (single_service && single_service.timeWindows) {
                let timeWindows = single_service.timeWindows;
                if (timeWindows.bumpIn) {
                  let bumpIn = timeWindows.bumpIn;

                  if (bumpIn.timings && bumpIn.timings.length > 0) {
                    for (let k = 0; k < bumpIn.timings.length; k++) {
                      if (bumpIn.sameAsVenue == 1 && venueId && false) {
                        // false for else condition

                        let query = `Call copyEventTimeFromVenue(?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            venueId,
                            serviceId,
                            "supplier",
                            "pre",
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      } else {
                        let item = bumpIn.timings[k];
                        let timeId = item.timeId ? item.timeId : 0;
                        bumpIn.sameAsVenue = bumpIn.sameAsVenue ? 1 : 0;

                        let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            event_id,
                            serviceId,
                            item.startDateTime,
                            item.endDateTime,
                            "preService",
                            item.notes,
                            timeId,
                            bumpIn.sameAsVenue,
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      }
                      if (
                        result &&
                        result[0] &&
                        result[0][0] &&
                        result[0][0].eventTimeId
                      ) {
                        timeIdArr.push(result[0][0].eventTimeId);
                      }
                    }
                  }
                }

                if (timeWindows.eventTime) {
                  let eventTime = timeWindows.eventTime;
                  if (eventTime.timings && eventTime.timings.length > 0) {
                    for (let k = 0; k < eventTime.timings.length; k++) {
                      if (eventTime.sameAsVenue == 1 && venueId && false) {
                        // false for else condition
                        let query = `Call copyEventTimeFromVenue(?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            venueId,
                            serviceId,
                            "supplier",
                            "actual",
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      } else {
                        let item = eventTime.timings[k];
                        let timeId = item.timeId ? item.timeId : 0;
                        eventTime.sameAsVenue = eventTime.sameAsVenue ? 1 : 0;
                        let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            event_id,
                            serviceId,
                            item.startDateTime,
                            item.endDateTime,
                            "eventService",
                            item.notes,
                            timeId,
                            eventTime.sameAsVenue,
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      }
                      if (
                        result &&
                        result[0] &&
                        result[0][0] &&
                        result[0][0].eventTimeId
                      ) {
                        timeIdArr.push(result[0][0].eventTimeId);
                      }
                    }
                  }
                }

                if (timeWindows.bumpOut) {
                  let bumpOut = timeWindows.bumpOut;
                  if (bumpOut.timings && bumpOut.timings.length > 0) {
                    for (let k = 0; k < bumpOut.timings.length; k++) {
                      if (bumpOut.sameAsVenue == 1 && venueId && false) {
                        // false for else condition
                        let query = `Call copyEventTimeFromVenue(?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            venueId,
                            serviceId,
                            "supplier",
                            "post",
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      } else {
                        let item = bumpOut.timings[k];
                        let timeId = item.timeId ? item.timeId : 0;
                        bumpOut.sameAsVenue = bumpOut.sameAsVenue ? 1 : 0;
                        let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            event_id,
                            serviceId,
                            item.startDateTime,
                            item.endDateTime,
                            "postService",
                            item.notes,
                            timeId,
                            bumpOut.sameAsVenue,
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      }
                      if (
                        result &&
                        result[0] &&
                        result[0][0] &&
                        result[0][0].eventTimeId
                      ) {
                        timeIdArr.push(result[0][0].eventTimeId);
                      }
                    }
                  }
                }

                // delete other event time  in case of update only

                // if (updateEventId > 0 && timeIdArr.length > 0) {
                if (updateEventId > 0) {
                  let query = `Call deleteEventTime(?,?,?,?)`;
                  [err, result] = await to(
                    connection.query(query, [
                      event_id,
                      timeIdArr.toString(),
                      serviceId,
                      "service",
                    ])
                  );
                  if (err) {
                    return Promise.reject(err);
                  }
                }
              }
            }
          }
        }
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * save exhibitors
   */
  async saveExhibitors(
    event_id: number,
    exhibitorList: any,
    createdById: number,
    creatorFromCompanyId: number,
    venueId: number,
    updateEventId: number = 0
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();

      if (exhibitorList && exhibitorList.length > 0) {
        for (let i = 0; i < exhibitorList.length; i++) {
          let exhibitors = exhibitorList[i].exhibitors;
          if (exhibitors && exhibitors.length > 0) {
            for (let j = 0; j < exhibitors.length; j++) {
              let single_exhibitor = exhibitors[j];

              let inExhibitorId = 0;
              if (updateEventId > 0) {
                inExhibitorId = single_exhibitor.exhibitorId;

                // if(exhibitorList[i].venueId)
                //   venueId = exhibitorList[i].venueId;
              }

              // save basic exhibitor detail
              let query = `Call saveBasicExhibitorDetail(?,?,?,?,?,?,?,?,?,?)`;
              [err, result] = await to(
                connection.query(query, [
                  single_exhibitor.name,
                  event_id,
                  venueId,
                  single_exhibitor.companyId,
                  single_exhibitor.requirement,
                  exhibitorList[i].notesToAll,
                  createdById,
                  inExhibitorId,
                  single_exhibitor.standNumber,
                  single_exhibitor.internalCmpNotes,
                ])
              );
              if (err) {
                return Promise.reject(err);
              }

              let exhibitorId;
              if (result && result[0] && result[0][0]) {
                exhibitorId = result[0][0].exhibitorId;
              }

              if (i == 0) {
                // will save in db only one time

                // save time for all exhibitors start

                let timeWindowsToAll = exhibitorList[i].timeWindowsToAll;

                if (timeWindowsToAll) {
                  let timeIdArr: any = [];
                  let timeWindows = timeWindowsToAll;
                  if (timeWindows.bumpIn) {
                    let bumpIn = timeWindows.bumpIn;
                    if (bumpIn.timings && bumpIn.timings.length > 0) {
                      for (let k = 0; k < bumpIn.timings.length; k++) {
                        if (bumpIn.sameAsVenue == 1 && venueId && false) {
                          // false for else condition
                          let query = `Call copyEventTimeFromVenue(?,?,?,?)`;
                          [err, result] = await to(
                            connection.query(query, [
                              venueId,
                              exhibitorId,
                              "exhibitor",
                              "preAll",
                            ])
                          );
                          if (err) {
                            return Promise.reject(err);
                          }
                        } else {
                          let item = bumpIn.timings[k];
                          let timeId = item.timeId ? item.timeId : 0;
                          bumpIn.sameAsVenue = bumpIn.sameAsVenue ? 1 : 0;
                          let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                          [err, result] = await to(
                            connection.query(query, [
                              event_id,
                              exhibitorId,
                              item.startDateTime,
                              item.endDateTime,
                              "preExhibitorAll",
                              item.notes,
                              timeId,
                              bumpIn.sameAsVenue,
                            ])
                          );
                          if (err) {
                            return Promise.reject(err);
                          }
                        }

                        if (
                          result &&
                          result[0] &&
                          result[0][0] &&
                          result[0][0].eventTimeId
                        ) {
                          timeIdArr.push(result[0][0].eventTimeId);
                        }
                      }
                    }
                  }

                  if (timeWindows.eventTime) {
                    let eventTime = timeWindows.eventTime;
                    if (eventTime.timings && eventTime.timings.length > 0) {
                      for (let k = 0; k < eventTime.timings.length; k++) {
                        if (eventTime.sameAsVenue == 1 && venueId && false) {
                          // false for else condition
                          let query = `Call copyEventTimeFromVenue(?,?,?,?)`;
                          [err, result] = await to(
                            connection.query(query, [
                              venueId,
                              exhibitorId,
                              "exhibitor",
                              "actualAll",
                            ])
                          );
                          if (err) {
                            return Promise.reject(err);
                          }
                        } else {
                          let item = eventTime.timings[k];
                          let timeId = item.timeId ? item.timeId : 0;
                          eventTime.sameAsVenue = eventTime.sameAsVenue ? 1 : 0;
                          let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                          [err, result] = await to(
                            connection.query(query, [
                              event_id,
                              exhibitorId,
                              item.startDateTime,
                              item.endDateTime,
                              "eventExhibitorAll",
                              item.notes,
                              timeId,
                              eventTime.sameAsVenue,
                            ])
                          );
                          if (err) {
                            return Promise.reject(err);
                          }
                        }

                        if (
                          result &&
                          result[0] &&
                          result[0][0] &&
                          result[0][0].eventTimeId
                        ) {
                          timeIdArr.push(result[0][0].eventTimeId);
                        }
                      }
                    }
                  }

                  if (timeWindows.bumpOut) {
                    let bumpOut = timeWindows.bumpOut;
                    if (bumpOut.timings && bumpOut.timings.length > 0) {
                      for (let k = 0; k < bumpOut.timings.length; k++) {
                        if (bumpOut.sameAsVenue == 1 && venueId && false) {
                          // false for else condition
                          let query = `Call copyEventTimeFromVenue(?,?,?,?)`;
                          [err, result] = await to(
                            connection.query(query, [
                              venueId,
                              exhibitorId,
                              "exhibitor",
                              "postAll",
                            ])
                          );
                          if (err) {
                            return Promise.reject(err);
                          }
                        } else {
                          let item = bumpOut.timings[k];
                          let timeId = item.timeId ? item.timeId : 0;
                          bumpOut.sameAsVenue = bumpOut.sameAsVenue ? 1 : 0;
                          let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                          [err, result] = await to(
                            connection.query(query, [
                              event_id,
                              exhibitorId,
                              item.startDateTime,
                              item.endDateTime,
                              "postExhibitorAll",
                              item.notes,
                              timeId,
                              bumpOut.sameAsVenue,
                            ])
                          );
                          if (err) {
                            return Promise.reject(err);
                          }
                        }

                        if (
                          result &&
                          result[0] &&
                          result[0][0] &&
                          result[0][0].eventTimeId
                        ) {
                          timeIdArr.push(result[0][0].eventTimeId);
                        }
                      }
                    }
                  }

                  // delete other event time
                  // if (timeIdArr.length > 0) {
                  let query = `Call deleteEventTime(?,?,?,?)`;
                  [err, result] = await to(
                    connection.query(query, [
                      event_id,
                      timeIdArr.toString(),
                      exhibitorId,
                      "exhibitorAll",
                    ])
                  );
                  if (err) {
                    return Promise.reject(err);
                  }
                  // }
                }

                // save time for all exhibitors end
              }

              let invitedClient;
              if (single_exhibitor.invited) {
                let invited = single_exhibitor.invited;
                let tabId = exhibitorId;
                let tabType = 5;
                let query = `Call inviteNewCompany(?,?,?,?,?,?,?,?,?,?,?)`;
                [err, result] = await to(
                  connection.query(query, [
                    invited.companyName,
                    invited.countryId,
                    invited.city,
                    invited.contactName,
                    invited.contactEmail,
                    creatorFromCompanyId,
                    createdById,
                    tabId,
                    tabType,
                    event_id,
                    1
                  ])
                );
                if (err) {
                  return Promise.reject(err);
                }

                let userId;
                let companyId;
                if (result[0] && result[0][0] && result[0][0].userId) {
                  userId = result[0][0].userId;
                  companyId = result[0][0].companyId;
                  invitedClient = result[0][0];
                }

                if (!single_exhibitor.contacts) {
                  single_exhibitor.contacts = []; // assign empty array if contacts is null
                }
                single_exhibitor.contacts.push({
                  id: userId,
                  email: null,
                  firstName: null,
                }); // if invited
              }

              if (
                single_exhibitor.contacts &&
                single_exhibitor.contacts.length > 0
              ) {
                let contactUserIds: any = [];
                for (let i = 0; i < single_exhibitor.contacts.length; i++) {
                  exhibitorId = exhibitorId ? exhibitorId : null;
                  if (single_exhibitor.contacts[i]) {
                    single_exhibitor.contacts[i].id = single_exhibitor.contacts[
                      i
                    ].id
                      ? single_exhibitor.contacts[i].id
                      : null;

                    let contactLabelId =
                      single_exhibitor.contacts[i].contactLabelId
                        ? single_exhibitor.contacts[i].contactLabelId
                        : null;

                    let contactRole =
                      single_exhibitor.contacts[i].contactRole
                        ? single_exhibitor.contacts[i].contactRole
                        : null;

                    let addContactCompanyId = single_exhibitor.companyId ? single_exhibitor.companyId : null;

                    let isCrew = single_exhibitor.contacts[i].isCrew ? 1 : 0;

                    if (isCrew == 1) {
                      contactLabelId = null;
                    } else {
                      contactRole = null;
                    }

                    let isInvited = single_exhibitor.invited ? 1 : 0;
                    let query = `Call saveEventContacts(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
                    [err, result] = await to(
                      connection.query(query, [
                        event_id,
                        single_exhibitor.contacts[i].id,
                        createdById,
                        "exhibitor",
                        single_exhibitor.contacts[i].email,
                        single_exhibitor.contacts[i].firstName,
                        exhibitorId,
                        contactLabelId,
                        creatorFromCompanyId,
                        isCrew,
                        contactRole,
                        single_exhibitor.contacts[i].mobile,
                        0,
                        isInvited,
                        addContactCompanyId
                      ])
                    );

                    if (result[0][0]) {
                      contactUserIds.push(result[0][0].userId);
                      if (result[0][0].isNotiSent == 0) {
                        // send notification only one time
                        sendEventNotification(
                          invitedClient,
                          result[0][0],
                          event_id,
                          "exhibitor",
                          single_exhibitor.companyId
                        );
                      }
                    }

                    if (err) {
                      return Promise.reject(err);
                    }
                  }
                }

                // delete other contact in case of update
                if (
                  updateEventId > 0 &&
                  contactUserIds.length > 0 &&
                  exhibitorId
                ) {
                  let query = `Call deleteEventContacts(?,?,?,?)`;
                  [err, result] = await to(
                    connection.query(query, [
                      event_id,
                      contactUserIds.toString(),
                      exhibitorId,
                      "exhibitor",
                    ])
                  );
                }
              }

              // save time
              let timeIdArr: any = [];

              if (single_exhibitor && single_exhibitor.timeWindows) {
                let timeWindows = single_exhibitor.timeWindows;
                if (timeWindows.bumpIn) {
                  let bumpIn = timeWindows.bumpIn;
                  if (bumpIn.timings && bumpIn.timings.length > 0) {
                    for (let k = 0; k < bumpIn.timings.length; k++) {
                      if (bumpIn.sameAsVenue == 1 && venueId && false) {
                        // false for else condition
                        let query = `Call copyEventTimeFromVenue(?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            venueId,
                            exhibitorId,
                            "exhibitor",
                            "pre",
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      } else {
                        let item = bumpIn.timings[k];
                        let timeId = item.timeId ? item.timeId : 0;
                        bumpIn.sameAsVenue = bumpIn.sameAsVenue ? 1 : 0;
                        let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            event_id,
                            exhibitorId,
                            item.startDateTime,
                            item.endDateTime,
                            "preExhibitor",
                            item.notes,
                            timeId,
                            bumpIn.sameAsVenue,
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      }

                      if (
                        result &&
                        result[0] &&
                        result[0][0] &&
                        result[0][0].eventTimeId
                      ) {
                        timeIdArr.push(result[0][0].eventTimeId);
                      }
                    }
                  }
                }

                if (timeWindows.eventTime) {
                  let eventTime = timeWindows.eventTime;
                  if (eventTime.timings && eventTime.timings.length > 0) {
                    for (let k = 0; k < eventTime.timings.length; k++) {
                      if (eventTime.sameAsVenue == 1 && venueId && false) {
                        // false for else condition
                        let query = `Call copyEventTimeFromVenue(?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            venueId,
                            exhibitorId,
                            "exhibitor",
                            "actual",
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      } else {
                        let item = eventTime.timings[k];
                        let timeId = item.timeId ? item.timeId : 0;
                        eventTime.sameAsVenue = eventTime.sameAsVenue ? 1 : 0;
                        let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            event_id,
                            exhibitorId,
                            item.startDateTime,
                            item.endDateTime,
                            "eventExhibitor",
                            item.notes,
                            timeId,
                            eventTime.sameAsVenue,
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      }

                      if (
                        result &&
                        result[0] &&
                        result[0][0] &&
                        result[0][0].eventTimeId
                      ) {
                        timeIdArr.push(result[0][0].eventTimeId);
                      }
                    }
                  }
                }

                if (timeWindows.bumpOut) {
                  let bumpOut = timeWindows.bumpOut;
                  if (bumpOut.timings && bumpOut.timings.length > 0) {
                    for (let k = 0; k < bumpOut.timings.length; k++) {
                      if (bumpOut.sameAsVenue == 1 && venueId && false) {
                        // false for else condition
                        let query = `Call copyEventTimeFromVenue(?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            venueId,
                            exhibitorId,
                            "exhibitor",
                            "post",
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      } else {
                        let item = bumpOut.timings[k];
                        let timeId = item.timeId ? item.timeId : 0;
                        bumpOut.sameAsVenue = bumpOut.sameAsVenue ? 1 : 0;
                        let query = `Call saveEventTime(?,?,?,?,?,?,?,?)`;
                        [err, result] = await to(
                          connection.query(query, [
                            event_id,
                            exhibitorId,
                            item.startDateTime,
                            item.endDateTime,
                            "postExhibitor",
                            item.notes,
                            timeId,
                            bumpOut.sameAsVenue,
                          ])
                        );
                        if (err) {
                          return Promise.reject(err);
                        }
                      }

                      if (
                        result &&
                        result[0] &&
                        result[0][0] &&
                        result[0][0].eventTimeId
                      ) {
                        timeIdArr.push(result[0][0].eventTimeId);
                      }
                    }
                  }
                }

                // delete other event time
                // if (timeIdArr.length > 0) {
                let query = `Call deleteEventTime(?,?,?,?)`;
                [err, result] = await to(
                  connection.query(query, [
                    event_id,
                    timeIdArr.toString(),
                    exhibitorId,
                    "exhibitor",
                  ])
                );
                if (err) {
                  return Promise.reject(err);
                }
                // }
              }
            }
          }
        }
      }

      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * delete my event
   */
  async deleteMyEvent(event_id: number, user_id: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call deleteMyEvent(?, ?)`;
      [err, result] = await to(connection.query(query, [event_id, user_id]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * get events with date
   */
  async getEventsWithDate(user_id: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;

      let start_date = moment().subtract(6, "month").toDate();
      let end_date = moment().add(6, "month").toDate();

      connection = await getConnection();
      let query = `Call getEventsWithDate(?,?,?)`;
      [err, result] = await to(
        connection.query(query, [user_id, start_date, end_date])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      let dateArr: any = [];

      if (result[0] && result[0].length > 0) {
        let start_date = moment().subtract(6, "month");
        let end_date = moment().add(6, "month");

        while (start_date < end_date) {
          for (let i = 0; i < result[0].length; i++) {
            let singleEvent = result[0][i];

            if (
              moment(singleEvent.startDate) >= start_date &&
              start_date <= moment(singleEvent.endDate)
            ) {
              dateArr.push({
                date: start_date.toDate(),
                eventId: singleEvent.eventId,
                eventTitle: singleEvent.title,
              });
            }
          }

          start_date.add(1, "day");
        }
      }

      result = dateArr;
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * delete my event
   */
  async getEventPermission(event_id: number, user_id: number, tab_type: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();

      let query = `Call getEventPermission(?, ?,?, @isClientOut, @isEventManagerOut, @isVenueOut, @isServiceOut, @isExhibitorOut, @isCrewOut, @clientAccessPermissionOut)`;
      // let query = `Call getEventPermission(?, ?,?)`;
      [err, result] = await to(connection.query(query, [event_id, user_id, tab_type]));
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * get timeline tab data
   */
  async getTimelineTabData(
    eventId: number,
    venueId: number,
    tabType: number
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();

      let query = `Call getTimelineTabData(?,?,?)`;
      [err, result] = await to(
        connection.query(query, [eventId, venueId, tabType]) // pass 0 to get all event of the user
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      let preVenueTime = {};
      let actualVenueTime = {};
      let postVenueTime = {};
      // console.log("result ** ", result);
      let itemContactIds: any = [];


      if (result[1] && result[1].length > 0) {
        for (let i = 0; i < result[1].length; i++) {
          let item = result[1][i];
          if (item.t_type == "pre") {
            preVenueTime = item;
          } else if (item.t_type == "actual") {
            actualVenueTime = item;
          } else if (item.t_type == "post") {
            postVenueTime = item;
          }
        }
      }


      // console.log("result[2] ** ", result[2]);

      let finalResult = {};
      if (result[2].length > 0) {
        // console.log("result[2] ** ", result[2]);
        itemContactIds = this.findMinContactIds(result[2]);
        // console.log("itemContactIds first ** ", itemContactIds); 
        // return; 
        let grouped;
        grouped = _.groupBy(result[2], function (obj) {
          return obj.dateonly;
        });

        // console.log("grouped ** ", grouped);

        finalResult["startDateTime"] = "";
        finalResult["minimumDateTime"] = "";
        finalResult["maxDateTime"] = "";
        if (result[0][0]) {
          finalResult["startDateTime"] = result[0][0].minDateTime;
          finalResult["minimumDateTime"] = result[0][0].minDateTime;
          finalResult["maxDateTime"] = result[0][0].maxDateTime;
        }

        // let pre_grp: any = [];
        // let actual_grp: any = [];
        // let post_grp: any = [];
        let groupArr: any = [];
        // for (var prop in grouped) {   // commented on 16-08-21
        //   if (Object.prototype.hasOwnProperty.call(grouped, prop)) {  // commented on 16-08-21
        // do stuff

        // let objArr = grouped[prop];   // commented on 16-08-21
        let groupObj = {}; // { date: prop };
        let preTime: any = [];
        let eventTime: any = [];
        let postTime: any = [];


        let pre_grp: any = [];
        let actual_grp: any = [];
        let post_grp: any = [];




        // for (let i = 0; i < objArr.length; i++) {   // commented on 16-08-21
        //   let singleTime = objArr[i];   // commented on 16-08-21

        for (let i = 0; i < result[2].length; i++) {   // commented on 16-08-21
          let singleTime = result[2][i];   // commented on 16-08-21

          // console.log("singleTime ** ", singleTime);

          if (singleTime.timeType == "pre") {
            let temp = {};

            temp["id"] = singleTime.itemId; // service or exhibitor id //  singleTime.timeId;
            if (singleTime.itemName) {
              temp["content"] = singleTime.itemName; // service or exhibitor name
            } else {
              temp["content"] = singleTime.standNumber
                ? singleTime.standNumber + " - " + singleTime.companyName
                : singleTime.companyName; // service or exhibitor name
            }

            temp["primaryContact"] = null;
            let p_contact = this.findMinContactIds(itemContactIds, singleTime.itemId); // get first contact

            // console.log("p_contact *** ", p_contact); 
            // console.log("singleTime.primaryContactId *** ", singleTime.primaryContactId); 
            // console.log("singleTime *** ", singleTime); 
            // console.log("itemContactIds *** ", itemContactIds); 
            // console.log("singleTime.itemId *** ",  singleTime.itemId); 

            if (singleTime.primaryContactId && p_contact) {
              temp["primaryContact"] = {
                userId: p_contact.primaryContactId,
                name: p_contact.primaryContactName,
                mobile: p_contact.primaryContactMobile,
                email: p_contact.primaryContactEmail,
              };
            }
            temp["companyWebsite"] = singleTime.companyWebsite;
            temp["companyName"] = singleTime.companyName;
            temp["startDateTime"] = singleTime.startDateTime;
            temp["endDateTime"] = singleTime.endDateTime;
            // temp["group"] = prop;  // commented on 16-08-21
            temp["data"] = [];

            // console.log("temp *** ", temp); 

            // if(moment(singleTime.startDateTime) > moment(preVenueTime['venueMinStartTime']).subtract(1, 'hour') && moment(singleTime.endDateTime) < moment(preVenueTime['venueMaxEndTime']).add(1, 'hour') ){

            if (!pre_grp.includes(singleTime.itemId)) {   // commented on 28-07-21
              // for removing duplicates
              preTime.push(temp);

            } else {
              preTime.forEach(function (tmpitm, index) {
                if (tmpitm.id == temp['id']) {
                  tmpitm['data'].push(temp);
                }
              });
            }

            pre_grp.push(singleTime.itemId);

            // }
          } else if (singleTime.timeType == "actual") {
            let temp = {};
            temp["id"] = singleTime.itemId; // service or exhibitor id  // singleTime.timeId;
            // temp['content'] = singleTime.itemName;

            if (singleTime.itemName) {
              temp["content"] = singleTime.itemName; // service or exhibitor name
            } else {
              temp["content"] = singleTime.standNumber
                ? singleTime.standNumber + " - " + singleTime.companyName
                : singleTime.companyName; // service or exhibitor name
            }

            temp["primaryContact"] = null;
            let p_contact = this.findMinContactIds(itemContactIds, singleTime.itemId); // get first contact
            if (singleTime.primaryContactId && p_contact) {
              temp["primaryContact"] = {
                userId: p_contact.primaryContactId,
                name: p_contact.primaryContactName,
                mobile: p_contact.primaryContactMobile,
                email: p_contact.primaryContactEmail,
              };
            }
            temp["companyWebsite"] = singleTime.companyWebsite;
            temp["companyName"] = singleTime.companyName;
            temp["startDateTime"] = singleTime.startDateTime;
            temp["endDateTime"] = singleTime.endDateTime;
            // temp["group"] = prop;  // commented on 16-08-21
            temp["data"] = [];

            // if(moment(singleTime.startDateTime) > moment(actualVenueTime['venueMinStartTime']).subtract(1, 'hour') && moment(singleTime.endDateTime) < moment(actualVenueTime['venueMaxEndTime']).add(1, 'hour') ){
            if (!actual_grp.includes(singleTime.itemId)) {   // commented on 28-07-21
              // for removing duplicates
              eventTime.push(temp);


            } else {
              eventTime.forEach(function (tmpitm, index) {
                if (tmpitm.id == temp['id']) {
                  tmpitm['data'].push(temp);
                }
              });
            }


            actual_grp.push(singleTime.itemId);

            // }
          }
          if (singleTime.timeType == "post") {
            let temp = {};
            temp["id"] = singleTime.itemId; // service or exhibitor id   // singleTime.timeId;
            // temp['content'] = singleTime.itemName;

            if (singleTime.itemName) {
              temp["content"] = singleTime.itemName; // service or exhibitor name
            } else {
              temp["content"] = singleTime.standNumber
                ? singleTime.standNumber + " - " + singleTime.companyName
                : singleTime.companyName; // service or exhibitor name
            }

            temp["primaryContact"] = null;
            let p_contact = this.findMinContactIds(itemContactIds, singleTime.itemId); // get first contact
            if (singleTime.primaryContactId && p_contact) {
              temp["primaryContact"] = {
                userId: p_contact.primaryContactId,
                name: p_contact.primaryContactName,
                mobile: p_contact.primaryContactMobile,
                email: p_contact.primaryContactEmail,
              };
            }
            temp["companyWebsite"] = singleTime.companyWebsite;
            temp["companyName"] = singleTime.companyName;
            temp["startDateTime"] = singleTime.startDateTime;
            temp["endDateTime"] = singleTime.endDateTime;
            // temp["group"] = prop;  // commented on 16-08-21

            temp["data"] = [];

            // console.log("temp post ", temp);

            // if(moment(singleTime.startDateTime) > moment(postVenueTime['venueMinStartTime']).subtract(1, 'hour') && moment(singleTime.endDateTime) < moment(postVenueTime['venueMaxEndTime']).add(1, 'hour') ){
            // console.log("singleTime contact ** ", singleTime);
            if (!post_grp.includes(singleTime.itemId)) {   // commented on 28-07-21
              // for removing duplicates
              postTime.push(temp);



            } else {
              postTime.forEach(function (tmpitm, index) {
                if (tmpitm.id == temp['id']) {
                  tmpitm['data'].push(temp);
                }
              });
            }



            post_grp.push(singleTime.itemId);
            // console.log("temp ** ", temp);
            // console.log("post_grp ** ", post_grp);
            // console.log("postTime ** ", postTime);


            // }
          }
        }

        let finalPreTime = {};
        finalPreTime["id"] = preVenueTime["venueTimeId"]
          ? preVenueTime["venueTimeId"]
          : 0;

        if (
          preVenueTime["venueMinStartTime"] &&
          preVenueTime["venueMaxEndTime"]
        ) {
          finalPreTime["content"] =
            moment(preVenueTime["venueMinStartTime"]).format("HH.mm") +
            " - " +
            moment(preVenueTime["venueMaxEndTime"]).format("HH.mm"); // `{${startHour_in_24_hr}} - {${endHour_in_24_hr}}`;
        }

        finalPreTime["startDateTime"] = preVenueTime["venueMinStartTime"]
          ? preVenueTime["venueMinStartTime"]
          : "";
        finalPreTime["endDateTime"] = preVenueTime["venueMaxEndTime"]
          ? preVenueTime["venueMaxEndTime"]
          : "";
        finalPreTime["type"] = "background";
        finalPreTime["className"] = "bumpIn";
        // console.log("preTime ** ", preTime);
        preTime = _.orderBy(preTime, ['id'], ['asc']);

        if (tabType == 2) {
          finalPreTime["exhibitors"] = preTime;
        } else {
          finalPreTime["services"] = preTime;
        }

        let finalEventTime = {};
        finalEventTime["id"] = actualVenueTime["venueTimeId"]
          ? actualVenueTime["venueTimeId"]
          : 0;

        if (
          actualVenueTime["venueMinStartTime"] &&
          actualVenueTime["venueMaxEndTime"]
        ) {
          finalEventTime["content"] =
            moment(actualVenueTime["venueMinStartTime"]).format("HH.mm") +
            " - " +
            moment(actualVenueTime["venueMaxEndTime"]).format("HH.mm"); // `{${startHour_in_24_hr}} - {${endHour_in_24_hr}}`;
        }

        finalEventTime["startDateTime"] = actualVenueTime[
          "venueMinStartTime"
        ]
          ? actualVenueTime["venueMinStartTime"]
          : "";
        finalEventTime["endDateTime"] = actualVenueTime["venueMaxEndTime"]
          ? actualVenueTime["venueMaxEndTime"]
          : "";
        finalEventTime["type"] = "background";
        finalEventTime["className"] = "bumpOut";
        eventTime = _.orderBy(eventTime, ['id'], ['asc']);
        if (tabType == 2) {
          finalEventTime["exhibitors"] = eventTime;
        } else {
          finalEventTime["services"] = eventTime;
        }

        let finalPostTime = {};
        finalPostTime["id"] = postVenueTime["venueTimeId"]
          ? postVenueTime["venueTimeId"]
          : 0;
        // finalPostTime['content'] = `{${startHour_in_24_hr}} - {${endHour_in_24_hr}}`;

        if (
          postVenueTime["venueMinStartTime"] &&
          postVenueTime["venueMaxEndTime"]
        ) {
          finalPostTime["content"] =
            moment(postVenueTime["venueMinStartTime"]).format("HH.mm") +
            " - " +
            moment(postVenueTime["venueMaxEndTime"]).format("HH.mm"); // `{${startHour_in_24_hr}} - {${endHour_in_24_hr}}`;
        }

        finalPostTime["startDateTime"] = postVenueTime["venueMinStartTime"]
          ? postVenueTime["venueMinStartTime"]
          : "";
        finalPostTime["endDateTime"] = postVenueTime["venueMaxEndTime"]
          ? postVenueTime["venueMaxEndTime"]
          : "";
        finalPostTime["type"] = "background";
        finalPostTime["className"] = "bumpOut";
        postTime = _.orderBy(postTime, ['id'], ['asc']);
        if (tabType == 2) {
          finalPostTime["exhibitors"] = postTime;
        } else {
          finalPostTime["services"] = postTime;
        }

        groupObj["data"] = {
          preTime: [finalPreTime],
          eventTime: [finalEventTime],
          postTime: [finalPostTime],
        };
        groupArr.push(groupObj);
        //   }  // commented on 16-08-21
        // }  // commented on 16-08-21

        finalResult["groups"] = groupArr;
      }

      result = finalResult;

      // console.log("result.groups[0].data.preTime[0].services ** ", result.groups[0].data.preTime[0].services);
      // console.log("result.groups[0].data.preTime[0].services[0].data ** ", result.groups[0].data.preTime[0].services[0].data);

      /* commented on 12-05-21


       let data: any = [];
       if(result[0].length > 0){
        for (let i = 0; i < result[0].length; i++) {
          let single_event = result[0][i];
          let eventData ;
          if(tabType == 1){
            let serviceArr: any = [];
            let services;
            services = await this.getEvent(single_event.eventId,4);
            // data = services['services'];
            if(services['services'] &&services['services'].length > 0){
              for (let j = 0; j < services['services'].length; j++) {
                let ser = services['services'][j] ;

              if(ser.serviceId){
                serviceArr.push({ serviceId: ser.serviceId, serviceName: ser.serviceName, companyPhone: ser.companyPhone, companyWebsite: ser.companyWebsite, preEventTime: ser.preEventTime, eventTime: ser.eventTime, postEventTime: ser.postEventTime});
              }
              }
            }

            if(serviceArr.length > 0 ){
                eventData = {eventId: single_event.eventId, eventTitle: single_event.title, services: serviceArr} ;
            }
          }else{



            let exhibitorArr: any = [];
            let exhibitors;
            exhibitors = await this.getEvent(single_event.eventId,5);
            // data = services['services'];

            if(exhibitors['exhibitors'] &&exhibitors['exhibitors'].length > 0){
              for (let j = 0; j < exhibitors['exhibitors'].length; j++) {
                let ex = exhibitors['exhibitors'][j] ;

              if(ex.exhibitorId){
                exhibitorArr.push({ exhibitorId: ex.exhibitorId, exhibitorName: ex.exhibitorName,  companyPhone: ex.companyPhone, companyWebsite: ex.companyWebsite, preEventTime: ex.preEventTime, eventTime: ex.eventTime, postEventTime: ex.postEventTime});
              }
              }
            }

            if(exhibitorArr.length > 0 ){
              eventData = {eventId: single_event.eventId, eventTitle: single_event.title, exhibitors: exhibitorArr};
            }
          }
          if(eventData){
            data.push(eventData);
          }
        }
       }

       result = data;
       */
      //  await new UserMgmtDao().getEvent(event_id,3);

      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }


  findMinContactIds(primaryContactIds, itemId = 0) {
    let tempItem;
    let tempPrimaryContactIds: any = [];
    let itemArr: any = [];
    if (itemId > 0) {
      primaryContactIds.forEach(function (it1, index) {
        if (itemId == it1.itemId) {
          tempItem = it1;
        }
      });
      return tempItem;
    } else {
      primaryContactIds.forEach(function (item, index) {
        if (!itemArr.includes(item.itemId)) {
          console.log("in block 1 ");
          tempPrimaryContactIds.push(item);
        }
        // else{  // commented on 15-02-22 as not required 
        console.log("in block 2 ");
        tempPrimaryContactIds.forEach(function (it1, index) {
          if (it1.primaryContactId > item.primaryContactId && it1.itemId == item.itemId) {  // for particular item id pri
            it1.timeId = item.timeId;
            it1.startDateTime = item.startDateTime;
            it1.endDateTime = item.endDateTime;
            it1.timeType = item.timeType;
            it1.itemId = item.itemId;
            it1.itemName = item.itemName;
            it1.companyName = item.companyName;
            it1.companyWebsite = item.companyWebsite;
            it1.dateonly = item.dateonly;
            it1.primaryContactId = item.primaryContactId;
            it1.primaryContactEmail = item.primaryContactEmail;
            it1.primaryContactMobile = item.primaryContactMobile;
            it1.primaryContactName = item.primaryContactName;
          }
        });
        // }
        itemArr.push(item.itemId);
      });
      console.log("tempPrimaryContactIds ** ", tempPrimaryContactIds);
      return tempPrimaryContactIds;
    }
  }

  /**
   * delete event tab parts - venue, serivces, exhibitor
   */
  async acceptDeclineEventTabParts(
    event_id: number,
    tabId: number,
    tabType: number,
    user_id: number,
    isAccept: number = 0
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call acceptDeclineEventTabParts(?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [event_id, tabId, tabType, user_id, isAccept]) // 3 for venue, 4 for services, 5 for exhibitors tab
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /**
   * get user by id
   */
  async getUserByEmailId(
    emailId: string,
    companyId: number,
    tabId: number,
    tabType: number,
    eventId: number
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call getUserByEmailId(?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [emailId, companyId, tabId, tabType, eventId])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
 * Update Email verification token
 *
 */
  async saveEmailVerificationToken(userId: integer): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;

      connection = await getConnection();
      let query = `Call saveEmailVerificationToken(?)`;
      [err, result] = await to(
        connection.query(query, [
          userId
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0][0].token);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
* getEventCompany
*
*/
  async getEventCompany(tabId: integer, contactType): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;

      connection = await getConnection();
      let query = `Call getEventCompany(?,?)`;
      [err, result] = await to(
        connection.query(query, [
          tabId,
          contactType
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }


  /***
* saveClientAccessPermission
*
*/
  async saveClientAccessPermission(clientAccessPermission: integer, loginUserId: integer, eventId: integer): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;

      clientAccessPermission = Number(clientAccessPermission);
      clientAccessPermission = clientAccessPermission >= 0 && clientAccessPermission <= 2 ? clientAccessPermission : 0;

      connection = await getConnection();
      let query = `Call saveClientAccessPermission(?,?,?)`;
      [err, result] = await to(
        connection.query(query, [
          clientAccessPermission,
          loginUserId,
          eventId
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0][0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }


  /***
* addEventTask
*
*/
  async addEventTask(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let permissionFlag = 1;
      req.eventId = req.eventId ? req.eventId : null;
      req.taskId = req.taskId ? req.taskId : null;
      req.title = req.title ? req.title : null;
      req.description = req.description ? req.description : null;
      req.assignToId = req.assignToId ? req.assignToId : [];
      // console.log("req.dueDate ", req.dueDate); 
      if (req.dueDate && req.dueDate.includes("/")) {  // if date in 28/06/2022 format
        req.dueDate = req.dueDate ? moment(req.dueDate, "DD/MM/YYYY").format('YYYY-MM-DD') : null;
      } else {
        req.dueDate = req.dueDate ? req.dueDate : null;
      }

      // console.log("req.dueDate **  ", req.dueDate); 
      req.isCompleted = req.isCompleted ? 1 : 0;
      req.assignById = req.assignById ? req.assignById : null;

      connection = await getConnection();
      if (req.assignToId && req.assignToId.length > 0) {



        // check permission start 
        // permission related code commented on 24-06-2022 as it is not requreired now, in frontend only permitted company will be listed 

        /*
        for(let i = 0; i<req.assignToId.length; i++){
          let assigntoid = req.assignToId[i].id ; 
          let tabType = req.assignToId[i].tabType; 
          
          // let tabType = -1; 
          // if(req.assignToId[i].companyName.indexOf("client") == 0) tabType = 1  ; 
          // if(req.assignToId[i].companyName.indexOf("event-manager") == 0) tabType = 2  ; 
          // if(req.assignToId[i].companyName.indexOf("venue") == 0) tabType = 3  ; 
          // if(req.assignToId[i].companyName.indexOf("service") == 0) tabType = 4  ; 
          // if(req.assignToId[i].companyName.indexOf("exhibitor") == 0) tabType = 5  ; 
           
          
          // console.log("req.taskId, req.eventId, assigntoid, req.assignById, loginUserId ** ", req.taskId, req.eventId, assigntoid, req.assignById, loginUserId); 

          let query = `Call checkTaskPermission(?,?,?,?,?,?,@outpermission)`;
          [err, result] = await to(
            connection.query(query, [
              req.taskId,
              req.eventId,
              assigntoid,
              req.assignById,
              loginUserId,
              tabType
            ])
          );
          if (err) {
            return Promise.reject(err);
          }
          // console.log("result permission ** ", result); 
          if(result && result[1] && result[1][0] && result[1][0].msg == "NOT_PERMITTED"){
            permissionFlag = 0; 
            break ;
          }  // if no access  
        }
        */

        // check permission end 


        // add event task start 
        if (permissionFlag == 1) { // add task only when user has permission to add task
          let createTask = 0;
          let utids = "";
          let utid = 0;
          for (let i = 0; i < req.assignToId.length; i++) {

            // let assignToIds = req.assignToId.map(function(value) {
            //   return value.id;
            // });
            // console.log("assignToIds *** ", assignToIds); 
            // console.log("req.assignToId.length ** ", req.assignToId.length); 

            // let assigntoid = req.assignToId[i] ; 
            let assigntoid = req.assignToId[i].id;
            let tabType = Number(req.assignToId[i].tabType);
            /*
            let tabType = -1; 
            if(req.assignToId[i].companyName.indexOf("client") == 0) tabType = 1  ; 
            if(req.assignToId[i].companyName.indexOf("event-manager") == 0) tabType = 2  ; 
            if(req.assignToId[i].companyName.indexOf("venue") == 0) tabType = 3  ; 
            if(req.assignToId[i].companyName.indexOf("service") == 0) tabType = 4  ; 
            if(req.assignToId[i].companyName.indexOf("exhibitor") == 0) tabType = 5  ; 
            */


            if (req.assignToId[i].utId) {
              utid = req.assignToId[i].utId;
              utids += req.assignToId[i].utId + ",";
            } else {
              utid = 0;
            }

            //  console.log("req ** ** ", req); 
            //  console.log("utid --- ", utid); 
            //  console.log("assignToIds.toString() *** ", assignToIds.toString()); assignToIds

            let query = `Call addEventTask(?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            [err, result] = await to(
              connection.query(query, [
                req.eventId,
                req.taskId,
                req.title,
                req.description,
                assigntoid,
                req.assignById,
                req.dueDate,
                req.isCompleted,
                loginUserId,
                req.assignToId.length == i + 1 && req.taskId > 0 && utids ? utids : null,
                utid,
                tabType,
                createTask // insert task if its value is 0 or task id will be passed here 
              ])
            );
            if (err) {
              return Promise.reject(err);
            }
            result = parseQueryResponse(result);
            // console.log("result *** ", result); 
            if (result && result[1] && result[1][0] && result[1][0].msg == "NOT_AN_OWNER") break;
            createTask = result && result[1] && result[1][0] && result[1][0].taskId ? result[1][0].taskId : null;

            utids += (result && result[1] && result[1][0] && result[1][0].utId ? result[1][0].utId : 0) + ",";

            // assignToIds += ((result && result[1] && result[1][0] && result[1][0].companyId ? result[1][0].companyId : 0) + ",");
            // console.log("utids ** ", utids); 
            // console.log("in_utids ** ", result && result[1] && result[1][0] && result[1][0].in_utids); 

            // if(result[0][0].msg == "INVALID_ACCESS") break ; // if no access  
          }
        }
        // add event task end 
      }

      // console.log("**********************************"); 
      return Promise.resolve({ permissionFlag: permissionFlag, res: result });
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }


  async addConfirmationDate(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    connection = await getConnection();
    let result = "";
    try {


      if (req.type == "servicesTab") {

        let contact_type;
        contact_type = "supplier";
        const values = req.data
        
        .filter((item) => item.isCrew === 0)
        .map((item) => [item.id, contact_type,req.date,req.selectedCompany.supplierId,req.eventId,req.sendtype]);
      
        const query = `INSERT INTO confirmation_date (user_id, contact_type,send_date,services_id,event_id,send_type) VALUES ?`;

        connection.query(query, [values], (error, results, fields) => {
          if (error) {
            console.error('Error', error);
          } else {

            result = results;

            sendConfirmationMail(req.data, req.eventId);

          }
        });
      }


      else if (req.type == "exhibitorTab") {


        let contact_type;
        contact_type = "exhibitor";
        const values = req.data
        
        .filter((item) => item.isCrew === 0)
        .map((item) => [item.id, contact_type,req.date,req.selectedCompany.exhibitorId,req.eventId,req.sendtype]);
      
        const query = `INSERT INTO confirmation_date (user_id, contact_type,send_date,exhibitor_id,event_id,send_type) VALUES ?`;

        connection.query(query, [values], (error, results, fields) => {
          if (error) {
            console.error('Error', error);
          } else {

            result = results;

            sendConfirmationMail(req.data, req.eventId);

          }
        });

      }

      else if (req.type == "venueTab") {


        let contact_type;
        contact_type = "venue";
        const values = req.data
        
        .filter((item) => item.isCrew === 0)
        .map((item) => [item.id, contact_type,req.date,req.selectedCompany.venueId,req.eventId,req.sendtype]);
      
        const query = `INSERT INTO confirmation_date (user_id, contact_type,send_date,venue_id,event_id,send_type) VALUES ?`;

        connection.query(query, [values], (error, results, fields) => {
          if (error) {
            console.error('Error', error);
          } else {

            result = results;

            sendConfirmationMail(req.data, req.eventId);

          }
        });

      }

      else if (req.type == "clientTab") {

        let contact_type;
        contact_type = "client";
        const values = req.data
        
        .filter((item) => item.isCrew === 0)
        .map((item) => [item.id, contact_type,req.date,req.eventId,req.sendtype]);
      
        const query = `INSERT INTO confirmation_date (user_id, contact_type,send_date,event_id,send_type) VALUES ?`;

        connection.query(query, [values], (error, results, fields) => {
          if (error) {
            console.error('Error', error);
          } else {

            result = results;

            sendConfirmationMail(req.data, req.eventId);

          }
        });

      }

      else if (req.type == "eventManagerTab") {

        let contact_type;
        contact_type = "event_manager";
        const values = req.data
        
        .filter((item) => item.isCrew === 0)
        .map((item) => [item.id, contact_type,req.date,req.eventId,req.sendtype]);
      
        const query = `INSERT INTO confirmation_date (user_id, contact_type,send_date,event_id,send_type) VALUES ?`;

        connection.query(query, [values], (error, results, fields) => {
          if (error) {
            console.error('Error', error);
          } else {

            result = results;

            sendConfirmationMail(req.data, req.eventId);

          }
        });

      }


      return Promise.resolve({});

    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }

  async saveViewExhibitor(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    connection = await getConnection();
    let resultcheck: any;

    try {
      const querycheck = `select venue_id from  services where id='${req.selectedCompany}' AND event_id='${req.eventId}'`;
      connection.query(querycheck, (error, results, fields) => {
        if (error) {
          console.error('Error', error);
        } else {

          resultcheck = results;
          console.log("resultcheck by other ++++", resultcheck[0].venue_id);

          this.saveViewExhibitor2(resultcheck[0].venue_id, req.selectedCompany, req.eventId)

        }
      });


      return Promise.resolve({});

    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }

  async saveViewExhibitor2(venue_id, supplierId, eventId): Promise<any> {
    let connection: any;
    connection = await getConnection();
    let resultcheck: any;

    try {
      const querycheck = `select id from  view_exhibitor_supplier where service_id='${supplierId}' AND event_id='${eventId}' AND venue_id='${venue_id}'`;
      connection.query(querycheck, (error, results, fields) => {
        if (error) {
          console.error('Error', error);
        } else {

          resultcheck = results;


          if (resultcheck.length == 1) {
            this.existviewExhibitor(supplierId, eventId, venue_id);
          }
          else if (resultcheck.length == 0) {
            this.insertviewExhibitor(supplierId, eventId, venue_id);


          }

        }
      });


      return Promise.resolve({});

    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }


  async existviewExhibitor(supplierId, eventId, venue_id) {

    let connection: any;
    connection = await getConnection();

    let result;
    try {
      const query = `UPDATE view_exhibitor_supplier SET status = 1 WHERE service_id='${supplierId}' AND event_id='${eventId}' AND venue_id='${venue_id}'`;

      connection.query(query, (error, resultsddd, fields) => {
        if (error) {
          console.error('Error', error);
        } else {

          result = resultsddd;
        }
      });
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }

  async insertviewExhibitor(supplierId, eventId, venue_id) {

    let connection: any;
    connection = await getConnection();

    let result;
    try {
      const queryddd = `INSERT INTO view_exhibitor_supplier (service_id,event_id,venue_id,status) VALUES ('${supplierId}','${eventId}','${venue_id}','1')`;

      connection.query(queryddd, (error, resultdds, fields) => {
        if (error) {
          console.error('Error', error);
        } else {

          result = resultdds;
        }
      });
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }

  async updateViewExhibitor(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    connection = await getConnection();
    let result = "";
    try {

      const query = `UPDATE view_exhibitor_supplier SET status = 0 WHERE service_id='${req.selectedCompany}' AND event_id='${req.eventId}'`;


      connection.query(query, (error, results, fields) => {
        if (error) {
          console.error('Error', error);
        } else {

          result = results;
        }
      });


      return Promise.resolve(result);

    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }


  async addCrewConfirmationDate(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    connection = await getConnection();
    let result = "";
    try {


            if (req.type == "servicesTab") {

              let contact_type;
              contact_type = "supplier";
              const formattedDate = req.date ? moment(req.date, "DD-MM-YYYY, HH:mm").format('YYYY-MM-DD HH:mm') : null;
              const values = req.data
              
              .filter((item) => item.isCrew === 0)
              .map((item) => [item.id, contact_type,formattedDate,req.selectedCompany.supplierId,req.eventId,req.sendtype]);
            
              const query = `INSERT INTO confirmation_date (user_id, contact_type,send_date,services_id,event_id,send_type) VALUES ?`;
      
              connection.query(query, [values], (error, results, fields) => {
                if (error) {
                  console.error('Error', error);
                } else {
      
                  result = results;
      
                  sendConfirmationMailForCrew(req.data, req.eventId);
      
                }
              });

            }


            else if (req.type == "exhibitorTab") {
              let contact_type;
              contact_type = "exhibitor";
              const formattedDate = req.date ? moment(req.date, "DD-MM-YYYY, HH:mm").format('YYYY-MM-DD HH:mm') : null;
              const values = req.data
              
              .filter((item) => item.isCrew === 1)
              .map((item) => [item.id, contact_type,formattedDate,req.selectedCompany.exhibitorId,req.eventId,req.sendtype]);
            
              const query = `INSERT INTO confirmation_date (user_id, contact_type,send_date,exhibitor_id,event_id,send_type) VALUES ?`;
      
              connection.query(query, [values], (error, results, fields) => {
                if (error) {
                  console.error('Error', error);
                } else {
      
                  result = results;
      
                  sendConfirmationMailForCrew(req.data, req.eventId);
      
                }
              });

            }

            else if (req.type == "venueTab") {

              let contact_type;
              contact_type = "venue";
              const formattedDate = req.date ? moment(req.date, "DD-MM-YYYY, HH:mm").format('YYYY-MM-DD HH:mm') : null;
              const values = req.data
              
              .filter((item) => item.isCrew === 1)
              .map((item) => [item.id, contact_type,formattedDate,req.selectedCompany.venueId,req.eventId,req.sendtype]);
            
              const query = `INSERT INTO confirmation_date (user_id, contact_type,send_date,venue_id,event_id,send_type) VALUES ?`;
      
              connection.query(query, [values], (error, results, fields) => {
                if (error) {
                  console.error('Error', error);
                } else {
      
                  result = results;
      
                  sendConfirmationMailForCrew(req.data, req.eventId);
      
                }
              });

            }

            else if (req.type == "clientTab") {
              let contact_type;
              contact_type = "client";
              const formattedDate = req.date ? moment(req.date, "DD-MM-YYYY, HH:mm").format('YYYY-MM-DD HH:mm') : null;
              const values = req.data
              
              .filter((item) => item.isCrew === 1)
              .map((item) => [item.id, contact_type,formattedDate,req.eventId,req.sendtype]);
            
              const query = `INSERT INTO confirmation_date (user_id, contact_type,send_date,event_id,send_type) VALUES ?`;
      
              connection.query(query, [values], (error, results, fields) => {
                if (error) {
                  console.error('Error', error);
                } else {
      
                  result = results;
      
                  sendConfirmationMailForCrew(req.data, req.eventId);
      
                }
              });

   }

            else if (req.type == "eventManagerTab") {
              let contact_type;
              contact_type = "event_manager";
              const formattedDate = req.date ? moment(req.date, "DD-MM-YYYY, HH:mm").format('YYYY-MM-DD HH:mm') : null;
              const values = req.data
              
              .filter((item) => item.isCrew === 1)
              .map((item) => [item.id, contact_type,formattedDate,req.eventId,req.sendtype]);
            
              const query = `INSERT INTO confirmation_date (user_id, contact_type,send_date,event_id,send_type) VALUES ?`;
      
              connection.query(query, [values], (error, results, fields) => {
                if (error) {
                  console.error('Error', error);
                } else {
      
                  result = results;
      
                  sendConfirmationMailForCrew(req.data, req.eventId);
      
                }
              });

            }


      return Promise.resolve({});

    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }

  async getLetestDate(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    connection = await getConnection();

    try {


      if (req.type == "servicesTab") {
        let err: Error;
        let result: any;
        let contact_type;
        contact_type = "supplier";

        let query = `Call getLetestDateFor_Service(?,?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            contact_type,
            req.selectedCompany.supplierId,
            req.eventId,
            req.SendType
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        const output = result[0].map(item => {
          if(item.latest_date !== null){
            const date = new Date(item.latest_date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
            const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            return `${formattedDate} ${formattedTime}`;
          }
         
        });
        return Promise.resolve(output);
      }


      else if (req.type == "exhibitorTab") {
        let err: Error;
        let result: any;
        let contact_type;
        contact_type = "exhibitor";

        let query = `Call getLetestDateFor_Exhibitor(?,?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            contact_type,
            req.selectedCompany.exhibitorId,
            req.eventId,
            req.SendType
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        const output = result[0].map(item => {
          if(item.latest_date !== null){
            const date = new Date(item.latest_date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
            const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            return `${formattedDate} ${formattedTime}`;
          }
         
        });
        return Promise.resolve(output);

      }

      else if (req.type == "venueTab") {
        let err: Error;
        let result: any;
        let contact_type;
        contact_type = "venue";

        let query = `Call getLetestDateFor_Venue(?,?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            contact_type,
            req.selectedCompany.venueId,
            req.eventId,
            req.SendType
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        const output = result[0].map(item => {
          if(item.latest_date !== null){
            const date = new Date(item.latest_date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
            const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            return `${formattedDate} ${formattedTime}`;
          }
         
        });
        return Promise.resolve(output);

      }

      else if (req.type == "clientTab") {
        let err: Error;
        let result: any;
        let contact_type;
        contact_type = "client";

        let query = `Call getLetestDateFor_Client(?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            contact_type,
            req.eventId,
            req.SendType
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        const output = result[0].map(item => {
          if(item.latest_date !== null){
            const date = new Date(item.latest_date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
            const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            return `${formattedDate} ${formattedTime}`;
          }
         
        });

        return Promise.resolve(output);

      }

      else if (req.type == "eventManagerTab") {
        let err: Error;
        let result: any;
        let contact_type;
        contact_type = "event_manager";

        let query = `Call getLetestDateFor_EventManager(?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            contact_type,
            req.eventId,
            req.SendType
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        const output = result[0].map(item => {
          if(item.latest_date !== null){
            const date = new Date(item.latest_date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
            const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            return `${formattedDate} ${formattedTime}`;
          }
         
        });
        return Promise.resolve(output);

      }



    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }

  async checkCrewLogin(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    connection = await getConnection();

    try {


      if (req.type == "servicesTab") {
        let err: Error;
        let result: any;
        let query = `Call checkCrewLoginForSupplier(?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            req.selectedCompany.supplierId,
            req.eventId,
            loginUserId
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        return Promise.resolve(result[0]);
      }


      else if (req.type == "exhibitorTab") {
        let err: Error;
        let result: any;
        let query = `Call checkCrewLoginForExhibitor(?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            req.selectedCompany.exhibitorId,
            req.eventId,
            loginUserId
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        return Promise.resolve(result[0]);

      }

    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }

  async getSendHistory(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    connection = await getConnection();

    try {


      if (req.type == "servicesTab") {
        let err: Error;
        let result: any;
        let contact_type;
        contact_type = "supplier";

        let query = `Call getHistoryFor_Service(?,?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            contact_type,
            req.selectedCompany.supplierId,
            req.eventId,
            req.SendType
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        const newArray = result[0].slice(1);
        
        const output = newArray.map(item => {
          const date = new Date(item.send_date);
          const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
          const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          return `Confirmation Sent : ${formattedDate} ${formattedTime}`;
        }).join('\n');
        return Promise.resolve(output);
      }


      else if (req.type == "exhibitorTab") {
        let err: Error;
        let result: any;
        let contact_type;
        contact_type = "exhibitor";

        let query = `Call getHistoryFor_Exhibitor(?,?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            contact_type,
            req.selectedCompany.exhibitorId,
            req.eventId,
            req.SendType
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        const newArray = result[0].slice(1);
        const output = newArray.map(item => {
          const date = new Date(item.send_date);
          const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
          const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          return `Confirmation Sent : ${formattedDate} ${formattedTime}`;
        }).join('\n');

        return Promise.resolve(output);
      }

      else if (req.type == "venueTab") {
        let err: Error;
        let result: any;
        let contact_type;
        contact_type = "venue";

        let query = `Call getHistoryFor_Venue(?,?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            contact_type,
            req.selectedCompany.venueId,
            req.eventId,
            req.SendType
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        const newArray = result[0].slice(1);
        const output = newArray.map(item => {
          const date = new Date(item.send_date);
          const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
          const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          return `Confirmation Sent : ${formattedDate} ${formattedTime}`;
        }).join('\n');

        return Promise.resolve(output);

      }

      else if (req.type == "clientTab") {
        let err: Error;
        let result: any;
        let contact_type;
        contact_type = "client";

        let query = `Call getHistoryFor_Client(?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            contact_type,
            req.eventId,
            req.SendType
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        const newArray = result[0].slice(1);
        const output = newArray.map(item => {
          const date = new Date(item.send_date);
          const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
          const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          return `Confirmation Sent : ${formattedDate} ${formattedTime}`;
        }).join('\n');

        return Promise.resolve(output);

      }

      else if (req.type == "eventManagerTab") {
        let err: Error;
        let result: any;
        let contact_type;
        contact_type = "event_manager";

        let query = `Call getHistoryFor_EventManager(?,?,?)`;
        [err, result] = await to(
          connection.query(query, [
            contact_type,
            req.eventId,
            req.SendType
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        const newArray = result[0].slice(1);
        const output = newArray.map(item => {
          const date = new Date(item.send_date);
          const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
          const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
          return `Confirmation Sent : ${formattedDate} ${formattedTime}`;
        }).join('\n');

        return Promise.resolve(output);
      }



    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }

  async getViewExhibitor(req: any, loginUserId: integer): Promise<any> {

    let connection: any;
    connection = await getConnection();

    try {

      let err: Error;
      let result: any;

      let query = `Call getloginsupplier(?,?)`;
      [err, result] = await to(
        connection.query(query, [
          loginUserId,
          req.eventId
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0][0]);

    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }

  async getViewExhibitorDetails(req: any, loginUserId: integer): Promise<any> {

    let connection: any;
    connection = await getConnection();

    try {

      let err: Error;
      let result: any;
      let query = `Call getViewExhibitorDetail(?)`;
      [err, result] = await to(
        connection.query(query, [
          req.serviceId
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0][0]);

    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }

  async getViewExhibtr(req: any, loginUserId: integer): Promise<any> {

    let connection: any;
    connection = await getConnection();

    try {

      let err: Error;
      let result: any;
      let query = `Call getViewExhibtr(?)`;
      [err, result] = await to(
        connection.query(query, [
          req.eventId
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);

      return Promise.resolve(result);

    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }


  }

  //   async getViewExhibitorbySP(supplierId,eventId) {

  //     let connection: any;
  //     connection = await getConnection();

  //     try {

  //         let err: Error;
  //         let result: any;

  //         let query = `Call getViewExhibitor(?,?)`;
  //         [err, result] = await to(
  //           connection.query(query, [
  //             supplierId,
  //             eventId
  //           ])
  //         );
  //         if (err) {
  //           return Promise.reject(err);
  //         }
  //         result = parseQueryResponse(result);
  //         return Promise.resolve(result[0][0]);

  //     } catch (e) {
  //       return Promise.reject(e);
  //     } finally {
  //       if (connection) {
  //         connection.end();
  //       }
  //     }



  // }

  /***
* getTaskAssignToList
*
*/
  async getTaskAssignToList(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    try {

      // console.log("req.eventId,  loginUserId *** ", req.eventId,  loginUserId); 
      console.log(" req.eventId, loginUserId, req.taskId ** ", req.eventId, loginUserId, req.taskId);

      let err: Error;
      let result: any;
      req.eventId = req.eventId ? req.eventId : null;
      req.taskId = req.taskId ? req.taskId : null;
      connection = await getConnection();
      let query = `Call getTaskAssignToList(?,?,?)`;
      [err, result] = await to(
        connection.query(query, [
          req.eventId,
          loginUserId,
          req.taskId
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }






  /***
* delete Event Task
*
*/
  async deleteEventTask(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    try {

      // console.log("req.eventId,  loginUserId *** ", req.eventId,  loginUserId); 

      let err: Error;
      let result: any;
      req.taskId = req.taskId ? req.taskId : null;
      connection = await getConnection();
      let query = `Call deleteEventTask(?,?)`;
      [err, result] = await to(
        connection.query(query, [
          loginUserId,
          req.taskId
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      console.log("result ** ", result);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }





  /***
* list Event Task
*
*/
  async listEventTask(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    try {

      // console.log("req.eventId,  loginUserId *** ", req.eventId,  loginUserId); 

      let err: Error;
      let result: any;
      req.id = req.id ? req.id : null;
      req.tabType = req.tabType ? req.tabType : null;
      req.loginCompanyId = req.loginCompanyId ? req.loginCompanyId : null;



      let tab1_ids: any, tab2_ids: any, tab3_ids: any, tab4_ids: any, tab5_ids: any;
      [tab1_ids, tab2_ids, tab3_ids, tab4_ids, tab5_ids] = await formatTaskFilterData(req.filterData);


      console.log("tab1_ids, tab2_ids, tab3_ids, tab4_ids, tab5_ids *** ", tab1_ids, tab2_ids, tab3_ids, tab4_ids, tab5_ids);


      connection = await getConnection();
      let query = `Call listEventTask(?,?,?,?,?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [
          req.eventId,
          req.loginCompanyId,
          loginUserId,
          req.section,
          tab1_ids,
          tab2_ids,
          tab3_ids,
          tab4_ids,
          tab5_ids
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      // console.log("result ** ", result); 
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }





  /***
* list Event Task
*
*/
  async changeTaskStatus(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    try {

      // console.log("req.eventId,  loginUserId *** ", req.eventId,  loginUserId); 

      let err: Error;
      let result: any;
      req.taskId = req.taskId ? req.taskId : null;
      req.companyId = req.companyId ? req.companyId : null;
      req.checkOnly = req.checkOnly ? 1 : 0;
      req.loginCompanyId = req.loginCompanyId ? req.loginCompanyId : null;

      let grouped;
      let tab1_ids: any, tab2_ids: any, tab3_ids: any, tab4_ids: any, tab5_ids: any;
      [tab1_ids, tab2_ids, tab3_ids, tab4_ids, tab5_ids] = await formatTaskFilterData(req.filterData);

      // console.log("tab1_ids, tab2_ids, tab3_ids, tab4_ids, tab5_ids *** ", tab1_ids, tab2_ids, tab3_ids, tab4_ids, tab5_ids); 

      connection = await getConnection();
      let query = `Call changeTaskStatus(?,?,?,?,?,?,?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [
          req.id,
          loginUserId,
          req.status,
          req.checkOnly,
          req.eventId,
          req.loginCompanyId,
          tab1_ids,
          tab2_ids,
          tab3_ids,
          tab4_ids,
          tab5_ids
        ])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      // console.log("result ** ", result); 

      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }



  /***
* update user task order 
*
*/
  async updateUserTaskOrder(req: any, loginUserId: integer): Promise<any> {
    let connection: any;
    try {

      // console.log("req.eventId,  loginUserId *** ", req.eventId,  loginUserId); 

      let err: Error;
      let result: any;


      connection = await getConnection();
      let query = `Call updateUserTaskOrder(?,?,?,?,?)`;

      for (let i = 0; i < req.tasks.length; i++) {
        let record = req.tasks[i];
        [err, result] = await to(
          connection.query(query, [
            req.loginCompanyId,
            req.eventId,
            record.taskId,
            i + 1,   // task order 
            loginUserId
          ])
        );
        if (err) {
          return Promise.reject(err);
        }
      }



      // console.log("result ** ", result); 
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }






}
