import * as dotenv from "dotenv";
import * as _ from "lodash";
import {
  to,
  parseQueryResponse,
  isValidString,
} from "../util/helper";
import { getConnection } from "../util/DBManager";
import { UserProfile } from "../Model/UserProfile";
import { CompanyProfile } from "../Model/CompanyProfile";
import { AssignUserToCompany } from "../Model/request/AssignUserToCompany";
let AWS = require("aws-sdk");

export class CompanyDao {


  constructor() {
    dotenv.config();
    AWS.config.region = process.env["region"];
  }

/***
 * search company
 *
 */
  async searchCompany(req:any, loginUserId: number =0): Promise<any> {


    let connection: any;
    try {

      if(!req.includeMyCompanies) { req.includeMyCompanies = 0 } else { req.includeMyCompanies = 1}
      if(!req.includePrivate) { req.includePrivate = 0 } else { req.includePrivate = 1}
      if(req.domain != null && req.domain.indexOf('@') !== -1){
        let domain = req.domain.split('@');
        let doma = domain[1].split('/');
        req.domain = doma[0];
      }
      console.log(loginUserId,req.domain , 'req.domain')
      let err: Error;
      let result: any;
       connection = await getConnection();
      let query = `Call searchCompany(?,?,?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [isValidString(req.searchKeyword)?req.searchKeyword:'',isValidString(req.domain)?req.domain:'',req.pageNumber ? req.pageNumber : 0,req.pageSize? req.pageSize : 0, loginUserId, req.includeMyCompanies,req.includePrivate])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
 * search company For Domain
 *
 */
  async searchCompanyForDomain(req:any, loginUserId: number =0): Promise<any> {


    let connection: any;
    try {

      if(!req.includeMyCompanies) { req.includeMyCompanies = 0 } else { req.includeMyCompanies = 1}
      if(!req.includePrivate) { req.includePrivate = 0 } else { req.includePrivate = 1}
      if(req.domain != null && req.domain.indexOf('@') !== -1){
        let domain = req.domain.split('@');
        let doma = domain[1].split('/');
        req.domain = doma[0];
      }
      console.log(loginUserId,req.domain , 'req.domain');
      let err: Error;
      let result: any;
       connection = await getConnection();
      let query = `Call searchCompanyForDomain(?,?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [isValidString(req.domain)?req.domain:'',req.pageNumber ? req.pageNumber : 0,req.pageSize? req.pageSize : 0, loginUserId, req.includeMyCompanies,req.includePrivate])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      console.log("Domain Result +++++",result);
      return Promise.resolve(result[0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

/***
 * search company for event
 *
 */
  async searchCompanyForEvent(req:any, loginUserId: number =0): Promise<any> {


    let connection: any;
    try {

      if(!req.includeMyCompanies) { req.includeMyCompanies = 0 } else { req.includeMyCompanies = 1}
      if(!req.includePrivate) { req.includePrivate = 0 } else { req.includePrivate = 1}
      if(req.domain != null && req.domain.indexOf('@') !== -1){
        let domain = req.domain.split('@');
        let doma = domain[1].split('/');
        req.domain = doma[0];
      }


      let err: Error;
      let result: any;
       connection = await getConnection();
      let query = `Call searchCompanyForEvent(?,?,?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [isValidString(req.searchKeyword)?req.searchKeyword:'',isValidString(req.domain)?req.domain:'',req.pageNumber ? req.pageNumber : 0,req.pageSize? req.pageSize : 0, loginUserId, req.includeMyCompanies,req.includePrivate])
      );

      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);
      return Promise.resolve(result[0]);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }

  /***
 * get Region And Country List
 *
 */
async getRegionAndCountryList(req:any): Promise<any> {
  let connection: any;
  try {
    let err: Error;
    let result: any;
     connection = await getConnection();
    let query = `Call getRegionAndCountryList(?)`;
    [err, result] = await to(
      connection.query(query, [req.regionId])
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
 * get category list
 *
 */
async getCategoryList(req:any): Promise<any> {
  let connection: any;
  try {
    let err: Error;
    let result: any;
     connection = await getConnection();
    let query = `Call getCategoryList(?)`;
    [err, result] = await to(
      connection.query(query, [0])
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
 * assign user to company
 *
 */
async assignUserToCompany(req:AssignUserToCompany): Promise<any> {

  let connection: any;
  try {
    let err: Error;
    let result: any;
     connection = await getConnection();

    let query = `Call assignCompanyToUser(?,?,?,?,?,?)`;
    [err, result] = await to(
      connection.query(query, [req.userId,req.companyId,req.companyRoleId,req.assignType,req.position,req.createdByUserId])
    );
    if (err) {
      return Promise.reject(err);
    }
    result = parseQueryResponse(result[0][0]);
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
 * create company
 *
 */
async createCompany(req:CompanyProfile): Promise<any> {
  let connection: any;
  try {
    let err: Error;
    let result: any;
     connection = await getConnection();
    let query = `Call createCompany(?,?,?,?,?,?,?,?,?,?)`;
    [err, result] = await to(
      connection.query(query, [req.id,req.userId,req.companyName,req.countryId,req.city,req.categoryIds.toString(),req.website,req.description,req.companyProfileImage,req.companyType])
    );
    if (err) {
      return Promise.reject(err);
    }
    result = parseQueryResponse(result[0][0]);
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
  * remove company association
 */
async removeCompanyAssocaition(userId:number,companyId:number): Promise<any> {

  let connection: any;
  try {
    let err: Error;
    let result: any;
     connection = await getConnection();
    let query = `Call removeCompanyAssociation(?,?)`;

    [err, result] = await to(
      connection.query(query, [userId,companyId])
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
 * get company profile and members
 *
 */
async getCompanyProfileAndMembers(userId:number,companyId:number,companyRoleId:number): Promise<any> {
  let connection: any;
  try {
    let err: Error;
    let result: any;
     connection = await getConnection();
    let query = `Call getCompanyProfile(?,?,?)`;
    [err, result] = await to(
      connection.query(query, [companyId,userId,companyRoleId])
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
 * get company profile and members
 *
 */
   async getCompanyById(companyId:number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
       connection = await getConnection();
      let query = `Call getCompanyById(?)`;
      [err, result] = await to(
        connection.query(query, [companyId])
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

  async getuuidforcrew(userId:any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
       connection = await getConnection();

        const idArray = userId.map(item => `'${item}'`).join(' , ');

      let query = `Call getUuidForCrew(?)`;
      [err, result] = await to(
        connection.query(query, [idArray])
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
 * get company Colleagues list with admins,members,join request,invites users
 *
 */
async getCompanyColleaguesWithSegregation (userId:number,companyId:number): Promise<any> {
  let connection: any;
  try {
    let err: Error;
    let result: any;
     connection = await getConnection();
    let query = `Call getCompanyColleagues(?,?)`;
    [err, result] = await to(
      connection.query(query, [companyId,userId])
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
 * make company admin
 *
 */
   async makeCompanyAdmin(companyId: number, loginUserId: number, userId: number, isAdmin: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
       connection = await getConnection();
      let query = `Call makeCompanyAdmin(?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [companyId, loginUserId, userId, isAdmin])

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
 * make company admin
 *
 */
   async approveRejectCompanyJoinRequest(companyId: number, loginUserId: number, userId: number, status: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
       connection = await getConnection();
      let query = `Call approveRejectCompanyJoinRequest(?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [companyId, loginUserId, userId, status])
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
 * save colleague position
 *
 */
   async saveColleaguePosition(companyId: number, loginUserId: number, positionArray: any): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
       connection = await getConnection();

        for (let step = 0; step < positionArray.length; step++) {
          let query = `Call saveColleaguePosition(?,?,?,?)`;
          [err, result] = await to(
            connection.query(query, [companyId,loginUserId,positionArray[step].colleagueID, positionArray[step].value])
          );
          if (err) {
            return Promise.reject(err);
          }

          if(result && result[0] && result[0][0] && result[0][0].msg != 'SUCCESS'){
            break;
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






  /***
 * make company admin
 *
 */
   async inviteCompanyColleague(name: string, email: string, position: string, companyId: number,  loginUserId: number, inviteUID: string): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
       connection = await getConnection();
      let query = `Call inviteCompanyColleague(?,?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [name, email, position, companyId, loginUserId, inviteUID])

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
 * get company admins
 *
 */
   async getCompanyAdmins(companyId: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
       connection = await getConnection();
      let query = `Call getCompanyAdmins(?)`;
      [err, result] = await to(
        connection.query(query, [companyId])

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
 * update company profile
 *
 */
   async updateCompanyProfile( company_id: number, company_name: string, company_tax_number: string, street_address_1: string, street_address_2: string,  city: string,  state: string, country_id: number, postcode: string, phone: string, website: string, company_profile_image: string, description: string, category: any, loginUserId: number): Promise<any> {
    let connection: any;
    try {
      let err: Error;
      let result: any;
       connection = await getConnection();

      /*
      // save category
       if(category && category.length > 0){
        let all_cat = category.join();


        for (let k = 0; k < category.length; k++) {
          let cat_id = category[k];
          let result1 ;
         let query = `Call updateCompanyCategory(?,?,?)`;
         [err, result1] = await to(
           connection.query(query, [ company_id, cat_id, all_cat])
         );
         if (err) {
           return Promise.reject(err);
         }
        }

       }
       */



      let query = `Call updateCompanyProfile(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      [err, result] = await to(
        connection.query(query, [ company_id, company_name, company_tax_number, street_address_1, street_address_2,  city,  state, country_id, postcode, phone, website, company_profile_image, description, category.toString(), loginUserId])
      );
      if (err) {
        return Promise.reject(err);
      }
      result = parseQueryResponse(result);


      // category




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
