import * as dotenv from "dotenv";
import * as _ from "lodash";
import { to, parseQueryResponse } from "../util/helper";
import { getConnection } from "../util/DBManager";
import { UserProfile } from "../Model/UserProfile";
import * as CryptoJS from "crypto-js";
import { copyFile } from "fs";

var moment = require("moment");
import {
  sendResetPaawordLinkEmail,
  sendEventNotification,
} from "../service/EmailService";
import { BulkImportExportType } from "../enums/CompanyAssignType";

let AWS = require("aws-sdk");

export class AdminMgmtDao {
  constructor() {
    dotenv.config();
    AWS.config.region = process.env["region"];
  }

  /**
   * admin login
   */
  async adminLogin(userReq: UserProfile, isSystemAdmin: boolean): Promise<any> {
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

  /**
   * user lists
   */
  async listUsers(loginUserId: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call listUsers(?,?)`;
      [err, result] = await to(
        connection.query(query, [loginUserId, 0]) // passing 0 to get list of users
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
   * get user detail
   */
  async getUserDtail(loginUserId: number, userId: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call listUsers(?,?)`;
      [err, result] = await to(connection.query(query, [loginUserId, userId]));
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
   * get get Current Events List detail
   */
  async getCurrentEventsList( eventId: any,userId: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call getCurrentEventList(?,?)`;
      [err, result] = await to(connection.query(query, [ eventId,userId]));

      
      if (err) {
        return Promise.reject(err);
      }
      let eventList: any = [];

      let resultArray:any=[];
      if (result && result[0]) {
          let eventData = {
            
          };
        
          const data = JSON.parse(JSON.stringify(result[0]));
          const venues = JSON.parse(JSON.stringify(result[1]));

  eventData["eventId"] = data[0].eventId;
  eventData["title"] = data[0].title;
  eventData["clientCompanyName"] = data[0].clientCompanyName;
  eventData["clientCompanyState"] = data[0].clientCompanyState;
  eventData["clientCompanyCity"] = data[0].clientCompanyCity;


      
          if (result[2]) {
            const datda = JSON.parse(JSON.stringify(result[2]));
            // time
            eventData["eventStartDate"] = datda[0].startDateTime;
            eventData["eventEndDate"] = datda[0].endDateTime;
          }

          
          

    
          eventList.push(eventData);

           resultArray = eventList.map(event => {
            return {
              ...event,
              venues: [venues[0]]
            };
          });


        
      }
      result = resultArray;
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
   * get user detail
   */
  async updateAdminProfile(loginUserId: number, req: any): Promise<any> {
    req.first_name = req.first_name ? req.first_name : "";
    req.last_name = req.last_name ? req.last_name : "";
    req.mobile = req.mobile ? req.mobile : "";
    req.headline = req.headline ? req.headline : "";
    req.about_me = req.about_me ? req.about_me : "";
    req.profile_image = req.profile_image ? req.profile_image : "";

    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call updateAdminProfile(?,?,?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [
          loginUserId,
          req.first_name,
          req.last_name,
          req.mobile,
          req.headline,
          req.about_me,
          req.profile_image,
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
   * change admin password
   *
   */
  async changeAdminPassword(
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
   * change user status
   *
   */
  async changeUserStatus(
    loginUserId: number,
    userId: number,
    status
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call changeUserStatus(?,?,?)`;
      [err, result] = await to(
        connection.query(query, [loginUserId, userId, status])
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
   * get user detail
   */

  async importExportServicesAndExhibitors(
    loginUserId: number,
    req: any
  ): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call importExportServicesAndExhibitors(?)`;
      [err, result] = await to(connection.query(query, [loginUserId]));
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
   *
   *  import bulk services and exhibitors
   */
  async importBulkServicesAndExhibitors(
    inLoginUserId: number,
    in_tabType: string,
    eventId: number,
    venueId: number,
    serviceNameOrStandNumber: string,
    website: string,
    companyName: string,
    countryId: number,
    cityName: string,
    addressOne: string,
    addressTwo: string,
    postCode: string,
    stateRegion: string,
    phone: string,
    email: string,
    firstName: string,
    lastName: string,
    mobile: string,
    sameAsVenueFlag: string = ""
  ): Promise<any> {
    let connection: any;
    try {
      in_tabType =
        in_tabType == BulkImportExportType.services ? "supplier" : "exhibitor"; // passing tab type as supplier or exhibitor
      sameAsVenueFlag =
        sameAsVenueFlag && (sameAsVenueFlag == "y" || sameAsVenueFlag == "Y")
          ? "y"
          : "n"; // sameAsVenueFlag.toLowerCase() === "y"

      console.log(
        "inLoginUserId, in_tabType, eventId, venueId, serviceNameOrStandNumber, website, companyName, countryId, cityName, addressOne, addressTwo, postCode, stateRegion, phone, email, firstName, lastName, mobile ******* ",
        inLoginUserId,
        in_tabType,
        eventId,
        venueId,
        serviceNameOrStandNumber,
        website,
        companyName,
        countryId,
        cityName,
        addressOne,
        addressTwo,
        postCode,
        stateRegion,
        phone,
        email,
        firstName,
        lastName,
        mobile,
        sameAsVenueFlag
      );

      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call importBulkServicesAndExhibitors(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [
          inLoginUserId,
          in_tabType,
          eventId,
          venueId,
          serviceNameOrStandNumber,
          website,
          companyName,
          countryId,
          cityName,
          addressOne,
          addressTwo,
          postCode,
          stateRegion,
          phone,
          email,
          firstName,
          lastName,
          mobile,
          sameAsVenueFlag,
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

  async checkEmailExists(emails: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `SELECT email from user 
    where user.email in (?) ORDER BY FIELD(user.email,?)`;
      let sql = connection.format(query, [emails,emails]);
      console.log("query checkEmailExists..", sql);
      [err, result] = await to(connection.query(query, [emails,emails]));
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

  async insertEmailMobile(emailMobiles: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let array: any = [];
      connection = await getConnection();
      emailMobiles.map((data: any, i) => {
        array.push([data.email, data.mobile]);
      });
      console.log("array", array);
      let query = `INSERT INTO user (email, mobile) VALUES ?`;
      [err, result] = await to(connection.query(query, [array]));
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

  async insertUserProfileData(profileData: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let array: any = [];
      connection = await getConnection();
      profileData.map((data: any, i) => {
        array.push([
          data.country_id,
          data.city,
          data.first_name,
          data.last_name,
          data.user_id,
          data.user_uuid,
        ]);
      });
      console.log("array", array);
      let query = `INSERT INTO user_profile (country_id, city, first_name, last_name, user_id, user_uuid) VALUES ?`;
      [err, result] = await to(connection.query(query, [array]));
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

  async getUsersByEmail(emails: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `SELECT id as user_id, email, uuid() as user_uuid from user 
    where user.email in (?)`;
      [err, result] = await to(connection.query(query, [emails]));
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

  async getCompaniesByWebsite(websites: any): Promise<any> {
    console.log('websites if already exist.......',websites);
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `SELECT id as companyId, website, company_name, street_address_1, street_address_2, postcode, phone, state, country_id, city from company_profile 
    where company_profile.website in (?) ORDER BY FIELD (company_profile.website,?)`;
   
      [err, result] = await to(connection.query(query, [websites,websites]));

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

  async checkCompanyExists(websites: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `SELECT id as companyId, website FROM company_profile WHERE website in (?)`;
      [err, result] = await to(connection.query(query, [websites]));
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

  async insertCompanyProfileData(companyProfileData: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let array: any = [];
      connection = await getConnection();
      companyProfileData.map((data: any, i) => {
        array.push([
          data.website,
          data.company_name,
          data.street_address_1,
          data.street_address_2,
          data.postcode,
          data.phone,
          data.state,
          data.country_id,
          data.city,
        ]);
      });
      console.log("array", array);
      let query = `INSERT INTO company_profile (website, company_name, street_address_1, street_address_2, postcode, phone, state, country_id, city) VALUES ?`;
      [err, result] = await to(connection.query(query, [array]));
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

  async saveService(serviceData: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let array: any = [];
      connection = await getConnection();
      serviceData.map((data: any, i) => {
        array.push([
          data.event_id,
          data.venue_id,
          data.service_name,
          data.supplier_company_id,
          data.created_by,
        ]);
      });
      console.log("array", array);
      let query = `INSERT INTO services (event_id, venue_id, service_name, supplier_company_id, created_by) VALUES ?`;
      [err, result] = await to(connection.query(query, [array]));
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

  async saveServiceContacts(serviceContactData: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let array: any = [];
      connection = await getConnection();
      serviceContactData.map((data: any, i) => {
        array.push([
          data.event_id,
          data.venue_id,
          data.user_id,
          new Date(),
          data.created_by,
          new Date(),
          "supplier",
          data.services_id,
          data.mobile,
          data.contact_user_name,
        ]);
      });
      console.log("array", array);
      let query = `INSERT INTO event_contacts (event_id, venue_id, user_id, updated_date, created_by, created_date, contact_type, services_id, mobile, contact_user_name) VALUES ?`;
      [err, result] = await to(connection.query(query, [array]));
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

  async saveExhibitor(exhibitorData: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let array: any = [];
      connection = await getConnection();
      exhibitorData.map((data: any, i) => {
        array.push([
          data.event_id,
          data.venue_id,
          data.company_id,
          data.standNumber,
          data.created_by,
        ]);
      });
      console.log("array in save exhibitor...", array);
      let query = `INSERT INTO exhibitor (event_id, venue_id, company_id, standNumber, created_by) VALUES ?`;
      [err, result] = await to(connection.query(query, [array]));
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

  async saveExhibitorContacts(exhibitorContactData: any): Promise<any> {
    console.log('contact data in dao...', exhibitorContactData)
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let array: any = [];
      connection = await getConnection();
      exhibitorContactData.map((data: any, i) => {
        array.push([
          data.event_id,
          data.venue_id,
          data.user_id,
          new Date(),
          data.created_by,
          new Date(),
          "exhibitor",
          data.exhibitor_id,
          data.mobile,
          data.contact_user_name,
        ]);
      });
      console.log("array", array);
      let query = `INSERT INTO event_contacts (event_id, venue_id, user_id, updated_date, created_by, created_date, contact_type, exhibitor_id, mobile, contact_user_name) VALUES ?`;
      let sql = connection.format(query, [array]);
      console.log("saveExhibitorContacts..", sql);
      [err, result] = await to(connection.query(query, [array]));
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

  async getUsersAlreadyExistInEventContact(exhibitorContactData: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let array: any = [];
      connection = await getConnection();
      exhibitorContactData.map((data: any, i) => {
        array.push([
          data.user_id,
          data.exhibitor_id
        ]);
      });
      console.log("array", array);
      let query = `SELECT user_id FROM event_contacts WHERE user_id `;
      [err, result] = await to(connection.query(query, [array]));
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

  async getServicesByEventVenueCompanyId(serviceData: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let eventArray: any = [];
      let venueArray: any = [];
      let companyArray: any = [];
      connection = await getConnection();
      serviceData.map((data: any, i) => {
        eventArray.push([data.event_id]);
        venueArray.push([data.venue_id]);
        companyArray.push([data.supplier_company_id]);
      });
      console.log("array", eventArray, venueArray, companyArray);
      let query = `SELECT id as services_id, event_id, venue_id, supplier_company_id FROM services where event_id IN(?) AND venue_id IN(?) OR supplier_company_id IN(?)`;
      let sql = connection.format(query, [eventArray, venueArray, companyArray]);
      console.log("query get services..", sql);
      [err, result] = await to(connection.query(query, [eventArray, venueArray, companyArray]));
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

  async getExhibitorsByEventVenueCompanyId(exhibitorData: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let eventArray: any = [];
      let venueArray: any = [];
      let companyArray: any = [];
      connection = await getConnection();
      exhibitorData.map((data: any, i) => {
        eventArray.push(data.event_id);
        venueArray.push(data.venue_id);
        companyArray.push(data.company_id);
      });
      let query = `SELECT id as exhibitor_id, event_id, venue_id, company_id FROM exhibitor where event_id IN(?) AND venue_id IN(?) AND company_id IN(?)`;
      let sql = connection.format(query, [
        eventArray,
        venueArray,
        companyArray,
      ]);
      console.log("query getExhibitorsByEventVenueCompanyId..", sql);
      [err, result] = await to(
        connection.query(query, [eventArray, venueArray, companyArray])
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

  async getVenueTimeForService(venueId: any): Promise<any> {
    let connection: any;
    try {
      connection = await getConnection();
      let err: Error;
      let result: any;
      // let venueArray:any=[];
      //  connection = await getConnection();
      //  service.map((data:any,i)=>{
      //   venueArray.push(data.venue_id);
      //  })
      let query = `SELECT * FROM event_time where venue_id = ? AND sameAsVenue=0`;
      let sql = connection.format(query, [venueId]);
      console.log("query get venue times for service..", sql);
      [err, result] = await to(connection.query(query, [venueId]));
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

  async saveEventTimeForService(eventTimes: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
      let array: any = [];
      connection = await getConnection();
      eventTimes.map((data: any, i) => {
        array.push([
          data.event_id,
          data.venue_id,
          data.service_id,
          data.exhibitor_id,
          data.start_date_time,
          data.end_date_time,
          data.created_date,
          data.updated_date,
          data.is_deleted,
          data.notes,
          data.t_type,
          1,
        ]);
      });
      console.log("array", array);
      let query = `INSERT INTO event_time (event_id, venue_id, service_id, exhibitor_id, start_date_time, end_date_time, created_date, updated_date, is_deleted, notes, t_type, sameAsVenue) VALUES ?`;
      let sql = connection.format(query, [array]);
      console.log("query save event times for service..", sql);
      [err, result] = await to(connection.query(query, [array]));
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

  async checkExhibitorTimeExistOrNot(event_id: any): Promise<any> {
    let connection: any;
    try {
      connection = await getConnection();
      let err: Error;
      let result: any;
      let query = `SELECT id FROM event_time WHERE is_deleted = 0 AND venue_id IS NULL AND service_id IS NULL AND exhibitor_id IS NOT NULL AND event_id = ?`;
      let sql = connection.format(query, [event_id]);
      console.log("query check exhibitor time exist or not..", sql);
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

  async getExhibitorEventTimeAll(eventId: any): Promise<any> {
    let connection: any;
    try {
      connection = await getConnection();
      let err: Error;
      let result: any;
      let query = `SELECT * FROM event_time WHERE event_id = ? AND is_deleted = 0 AND venue_id IS NULL 
    AND service_id IS NULL AND t_type LIKE "%All%"  
    AND exhibitor_id = (SELECT MAX(exhibitor_id) FROM event_time ET WHERE ET.event_id = ? AND is_deleted = 0)`;
      let sql = connection.format(query, [eventId, eventId]);
      console.log("query get exhibitor event time all..", sql);
      [err, result] = await to(connection.query(query, [eventId, eventId]));
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

  async saveGlobalAllTime(globalAllTimes: any): Promise<any> {
    let connection: any;
    try {
      connection = await getConnection();
      let err: Error;
      let result: any;
      let array: any = [];
      globalAllTimes.map((data: any, i) => {
        array.push([
          data.event_id,
          data.venue_id,
          data.service_id,
          data.exhibitor_id,
          data.start_date_time,
          data.end_date_time,
          data.created_date,
          data.updated_date,
          data.is_deleted,
          data.notes,
          data.t_type,
          1,
        ]);
      });
      console.log("array", array);
      let query = `INSERT INTO event_time ( event_id, venue_id, service_id, exhibitor_id, start_date_time, end_date_time, created_date, updated_date, is_deleted, notes, t_type, sameAsVenue ) VALUES ?`;
      let sql = connection.format(query, [array]);
      console.log("query saveGlobalAllTime..", sql);
      [err, result] = await to(connection.query(query, [array]));
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

  async getExhibitorEventTimeAllEach(eventId: any): Promise<any> {
    let connection: any;
    try {
      connection = await getConnection();
      let err: Error;
      let result: any;
      let query = `SELECT event_id, venue_id, service_id, exhibitor_id, start_date_time, end_date_time, created_date, updated_date, is_deleted, notes, t_type, sameAsVenue  FROM event_time WHERE  event_id = ? AND is_deleted = 0 AND venue_id IS NULL AND service_id IS NULL  AND t_type LIKE "%All%"  AND exhibitor_id =  (SELECT MAX(exhibitor_id) FROM event_time ET WHERE ET.event_id = ? AND is_deleted = 0 )`;
      let sql = connection.format(query, [eventId, eventId]);
      console.log("query get getExhibitorEventTimeAllEach..", sql);
      [err, result] = await to(connection.query(query, [eventId, eventId]));
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

  async getNewOldUsersByEmail(emails: any): Promise<any> {
    console.log('emails getNewOldUsersByEmail...', emails);
    let connection: any;
    try {
      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `SELECT u.email, up.user_id, up.user_uuid FROM user as u LEFT JOIN user_profile as up ON u.id = up.user_id WHERE u.email in (?)`;
      let sql = connection.format(query, [emails]);
      console.log("query getNewOldUsersByEmail..", sql);
      [err, result] = await to(connection.query(query, [emails]));
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
   *
   *  import bulk services and exhibitors
   */
  async exportBulkServicesAndExhibitors(
    inLoginUserId: number,
    in_tabType: string,
    eventId: number,
    venueId: number
  ): Promise<any> {
    let connection: any;
    try {
      in_tabType =
        in_tabType == BulkImportExportType.services ? "supplier" : "exhibitor"; // passing tab type as supplier or exhibitor

      let err: Error;
      let result: any;
      connection = await getConnection();
      let query = `Call exportBulkServicesAndExhibitors(?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [inLoginUserId, in_tabType, eventId, venueId])
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
}
