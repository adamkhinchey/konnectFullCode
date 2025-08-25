import * as _ from "lodash";
import {
  to,
  parseQueryResponse,
  isValidString,
} from "../util/helper";
import { getConnection } from "../util/DBManager";
import { AddEventFile } from '../Model/request/AddEventFile';
import { AddEventURL } from "../Model/request/AddEventURL";

export class EventFilesDao {


/***
 * add event files
 *
 */
  async addEventFiles(req:AddEventFile, loginUserId: number =0): Promise<any> {


    let connection: any;
    try {
      let err: Error;
      let result: any;
      let filesResponselist:any=[];
      let fileRes:any;
       connection = await getConnection();
      let query = `Call addEventFiles(?,?,?,?,?,?,?,?,?)`;

      if(req.filesList && req.filesList.length > 0){
        for (let i = 0; i < req.filesList.length; i++) {
          let value=[req.filesList[i].displayName,req.filesList[i].fileUrl,req.eventFileType,req.eventId,req.venueId,req.supplierId,req.exhibitorId,loginUserId,req.filesList[i].mimeType];
          [err, result] = await to(
            connection.query(query, value)
          );
          if (err) {
            return Promise.reject(err);
          }
          result = parseQueryResponse(result);
          fileRes= req.filesList[i];
          if(result && result[0] &&result[0][0] && result[0][0].eventFileId>0){
            fileRes.fileId=result[0][0].eventFileId;
            fileRes.code=200;
            fileRes.success=true;
        }else{
            fileRes.fileId=null;
            fileRes.code=400;
            fileRes.success=false;
        }
        filesResponselist.push(fileRes);
        }
      }
      req.filesList=filesResponselist;
      return Promise.resolve(req);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      if (connection) {
        connection.end();
      }
    }
  }


 /***
 * add event URL
 *
 */
 async addEventURL(req:AddEventURL, loginUserId: number =0): Promise<any> {

  let connection: any;
  try {
    let err: Error;
    let result: any;
    let filesResponselist:any=[];
    let fileRes:any;
     connection = await getConnection();
    let query = `Call addEventURL(?,?,?,?,?,?,?,?,?,?,?)`;
    if(req.filelinkdata.fileLinks && req.filelinkdata.fileLinks.length > 0){
      for (let i = 0; i < req.filelinkdata.fileLinks.length; i++) {
        let value=['','',req.eventFileType,req.eventId,req.venueId,req.supplierId,req.exhibitorId,loginUserId,'',req.filelinkdata.fileLinks[i].label,req.filelinkdata.fileLinks[i].URL];
    
        [err, result] = await to(
          connection.query(query, value)
        );
        if (err) {
          return Promise.reject(err);
        }
        result = parseQueryResponse(result);
        fileRes= req.filelinkdata.fileLinks[i];
        if(result && result[0] &&result[0][0] && result[0][0].eventFileId>0){
          fileRes.fileId=result[0][0].eventFileId;
          fileRes.code=200;
          fileRes.success=true;
      }else{
          fileRes.fileId=null;
          fileRes.code=400;
          fileRes.success=false;
      }
      filesResponselist.push(fileRes);
      }
    }
    req.filesList=filesResponselist;
    return Promise.resolve(req);
  } catch (e) {
    return Promise.reject(e);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}


/***
 * add event files
 *
 */
 async getFilePermission(data: any, loginUserId: number, eventId: number): Promise<any> {


  let connection: any;
  try {
    let err: Error;
    let result: any;
    let resultBtn :any;
     connection = await getConnection();

     console.log("file data -- ** ", data); 



    //  Client/Event Manager Shared Files            CEMSF
    //  Client Internal Files                        CIF
    //  Event Management Internal Files              EMIF  
    //  Event Files                                  EF
    //  Files for All Venues                         FFAV           
    //      Floorplan                                  venuesFiles  FLOOR_PLAN
    //      Venue Shared Files                         venuesFiles  VSF
    //      Venue Internal Files                       venuesFiles  VIF
    //  Files for All Suppliers                      FFAS
    //      Supplier Shared Files                      supplierFiles  SSF
    //      Supplier Internal Files                    supplierFiles  SIF
    //  Files for All Exhibitors                     FFAE
    //      Exhibitor Shared Files                     exhibitorFiles  EBSF
    //      Exhibitor Internal Files                   exhibitorFiles  EBIF
     
     
    // data.CEMSF
    // data.CIF
    // data.EMIF
    // data.EF
    // data.FFAV
    // data.FFAS
    // data.FFAE


    let query = `Call getEventFilePermission(?,?,?,?)`;
    [err, result] = await to(connection.query(query, [eventId, loginUserId, null , 1]));  // 1 for getting general permisison 
    if (err) {
      return Promise.reject(err);
    }

    console.log("general permission data ** ", result); 

    let queryBtn = `Call getEventFileBtnPermission(?,?,?,?)`;
    [err, resultBtn] = await to(connection.query(queryBtn, [eventId, loginUserId, null , 1]));  // 1 for getting general permisison 
    if (err) {
      return Promise.reject(err);
    }

    console.log("general permission resultBtn data ** ", resultBtn); 


    // {
    //   isViewPermisssion: 1,
    //   isSelfIncludedInTab: 0,
    //   isSelfIncludedInSection: 0,
    //   isClient: 0,
    //   isEventManager: 1,
    //   isVenue: 1,
    //   isService: 1,
    //   isExhibitor: 1,
    //   isCrew: 0,
    //   clientAccessPermission: 0,
    //   CEMSF: 1,
    //   CIF: 0,
    //   EMIF: 1,
    //   EF: 1,
    //   FFAV: 1,
    //   FFAS: 1,
    //   FFAE: 1
    // }
    if(result && result[1] && result[1][0]){
      let resData = result[1][0] ; 
      let resBtnData= resultBtn[1][0];
      console.log("resData ** ", resData); 
      data.CEMSF.isViewPermission = resData.CEMSF == 1 ? 1 : 0; 
      data.CEMSF.isViewBtnPermission = resBtnData.CEMSF == 1 ? 1 : 0; 
      
      data.CEMSF.isSelfIncludedInTab = resData.isClient == 1 ? 1 : 0; 
      data.CEMSF.isSelfIncludedInSection = resData.isClient == 1 ? 1 : 0; 

      data.CIF.isViewPermission = resData.CIF == 1 ? 1 : 0; 
      data.CIF.isViewBtnPermission = resBtnData.CIF == 1 ? 1 : 0; 
      
      data.CIF.isSelfIncludedInTab = resData.isClient == 1 ? 1 : 0; 
      data.CIF.isSelfIncludedInSection = resData.isClient == 1 ? 1 : 0; 

      data.EMIF.isViewPermission = resData.EMIF == 1 ? 1 : 0; 
      data.EMIF.isViewBtnPermission = resBtnData.EMIF == 1 ? 1 : 0; 
      
      data.EMIF.isSelfIncludedInTab = resData.isEventManager == 1 ? 1 : 0; 
      data.EMIF.isSelfIncludedInSection = resData.isEventManager == 1 ? 1 : 0; 

      data.EF.isViewPermission = resData.EF == 1 ? 1 : 0; 
      data.EF.isViewBtnPermission = resBtnData.EF == 1 ? 1 : 0; 

      data.EF.isSelfIncludedInTab = resData.isClient == 1 || resData.isEventManager == 1 || resData.isVenue == 1 || resData.isService == 1 || resData.isExhibitor == 1  ? 1 : 0; 
      data.EF.isSelfIncludedInSection = resData.isClient == 1 || resData.isEventManager == 1 || resData.isVenue == 1 || resData.isService == 1 || resData.isExhibitor == 1  ? 1 : 0; 

      data.FFAV.isViewPermission = resData.FFAV == 1 ? 1 : 0; 
      data.FFAV.isViewBtnPermission = resBtnData.FFAV == 1 ? 1 : 0; 

      data.FFAV.isSelfIncludedInTab = resData.isVenue == 1 ? 1 : 0; 
      data.FFAV.isSelfIncludedInSection = resData.isVenue == 1 ? 1 : 0; 

      data.FFAS.isViewPermission = resData.FFAS == 1 ? 1 : 0; 
      data.FFAS.isViewBtnPermission = resBtnData.FFAS == 1 ? 1 : 0; 

      data.FFAS.isSelfIncludedInTab = resData.isService == 1 ? 1 : 0; 
      data.FFAS.isSelfIncludedInSection = resData.isService == 1 ? 1 : 0; 

      data.FFAE.isViewPermission = resData.FFAE == 1 ? 1 : 0; 
      data.FFAE.isViewBtnPermission = resBtnData.FFAE == 1 ? 1 : 0; 

      data.FFAE.isSelfIncludedInTab = resData.isExhibitor == 1 ? 1 : 0; 
      data.FFAE.isSelfIncludedInSection = resData.isExhibitor == 1 ? 1 : 0; 

    }

    if(data.FFAV.venuesFiles && data.FFAV.venuesFiles.length > 0){
      for(let i = 0; i <data.FFAV.venuesFiles.length;  i++ ){
        let obj = data.FFAV.venuesFiles[i];
        let query = `Call getEventFilePermission(?,?,?,?)`;
        [err, result] = await to(connection.query(query, [eventId, loginUserId, obj.venueId , 3]));
        if (err) {
          return Promise.reject(err);
        }

        let query2 = `Call getEventFileBtnPermission(?,?,?,?)`;
        [err, resultBtn] = await to(connection.query(query2, [eventId, loginUserId, obj.venueId , 3]));
        if (err) {
          return Promise.reject(err);
        }

        obj.isViewPermission = result[1][0].isViewPermisssion;
        obj.isViewBtnPermission = resultBtn[1][0].isViewBtnPermission;
        obj.isSelfIncludedInTab = result[1][0].isSelfIncludedInTab;
        obj.isSelfIncludedInSection = result[1][0].isSelfIncludedInSection;

      }

    }
    if(data.FFAS.supplierFiles && data.FFAS.supplierFiles.length > 0){

      for(let i = 0; i <data.FFAS.supplierFiles.length;  i++ ){
        let obj = data.FFAS.supplierFiles[i];

        let query = `Call getEventFilePermission(?,?,?,?)`;
        [err, result] = await to(connection.query(query, [eventId, loginUserId, obj.serviceId , 4]));
        if (err) {
          return Promise.reject(err);
        }

        let queryBtn = `Call getEventFileBtnPermission(?,?,?,?)`;
        [err, resultBtn] = await to(connection.query(queryBtn, [eventId, loginUserId, obj.serviceId , 4]));
        if (err) {
          return Promise.reject(err);
        }
        obj.isViewPermission = result[1][0].isViewPermisssion;
        obj.isViewBtnPermission = resultBtn[1][0].isViewBtnPermission;

        obj.isSelfIncludedInTab = result[1][0].isSelfIncludedInTab;
        obj.isSelfIncludedInSection = result[1][0].isSelfIncludedInSection;

      }


    }


    if(data.FFAE.exhibitorFiles && data.FFAE.exhibitorFiles.length > 0){

      for(let i = 0; i <data.FFAE.exhibitorFiles.length;  i++ ){
        let obj = data.FFAE.exhibitorFiles[i];
        let query = `Call getEventFilePermission(?,?,?,?)`;
        [err, result] = await to(connection.query(query, [eventId, loginUserId, obj.exhibitorId , 5]));
        if (err) {
          return Promise.reject(err);
        }

        let queryBtn = `Call getEventFileBtnPermission(?,?,?,?)`;
        [err, resultBtn] = await to(connection.query(queryBtn, [eventId, loginUserId, obj.exhibitorId , 5]));
        if (err) {
          return Promise.reject(err);
        }

        obj.isViewPermission = result[1][0].isViewPermisssion;
        obj.isViewBtnPermission = resultBtn[1][0].isViewBtnPermission;
        obj.isSelfIncludedInTab = result[1][0].isSelfIncludedInTab;
        obj.isSelfIncludedInSection = result[1][0].isSelfIncludedInSection;
      }
    }


    return Promise.resolve(data);
  } catch (e) {
    return Promise.reject(e);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}


/***
 * get event files
 *
 */
async getEventFiles(eventId: number): Promise<any> {


  let connection: any;
  try {
    let err: Error;
    let result: any;
     connection = await getConnection();
    let query = `Call getEventFiles(?)`;
    [err, result] = await to(connection.query(query, [eventId]));

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
 * get event files by file id
 *
 */
async getEventFilesByid(fileId: number): Promise<any> {


  let connection: any;
  try {
    let err: Error;
    let result: any;
     connection = await getConnection();
    let query = `SELECT id,file_url AS fileUrl,uploaded_by AS createdByUserId FROM event_files WHERE id=?`;
    [err, result] = await to(connection.query(query, [fileId]));

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
 * delete event files by file id
 *
 */
async deleteEventFilesByid(fileId: number): Promise<any> {


  let connection: any;
  try {
    let err: Error;
    let result: any;
     connection = await getConnection();
    let query = `Call deleteEventFile(?)`;
    [err, result] = await to(connection.query(query, [fileId]));

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
 * delete event Links by file id
 *
 */
async deleteEventLinksByid(fileId: number): Promise<any> {


  let connection: any;
  try {
    console.log("file daos")
    let err: Error;
    let result: any;
     connection = await getConnection();
    let query = `Call deleteEventFile(?)`;
    [err, result] = await to(connection.query(query, [fileId]));

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
