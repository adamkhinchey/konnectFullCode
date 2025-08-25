import * as dotenv from "dotenv";
import * as _ from "lodash";
import { Codes, CONSTANTS } from "../util/SiteConfig";
import { Context } from "vm";
import * as url from "url";

import {
  isValidString,
  getDefaultResponse,
  getAuthorizerUser,
} from "../util/helper";

import { EventFilesDao } from "../daos/EventFilesDao";
import { AddEventFile } from "../Model/request/AddEventFile";
import {
  getS3FileUploadSignedURL,
  createEventDirectoryStructure,
  asyncLambdaCallForCreateEventDirectoryStructure,
  deleteFileFromS3,
} from "../util/AwsS3SignedUrlUtil";
import { EventFileS3SingnedUrlReq } from "../Model/request/EventFileS3SingnedUrlReq";
import { EventFilesType } from "../enums/EventFilesType";
import { EventFilesResponse } from "../Model/response/EventFilesResponse";
import { VenueFile } from "../Model/response/VenueFile";
import { EventFileRes } from "../Model/response/EventFileRes";
import { SupplierFiles } from "../Model/response/SupplierFiles";
import { ExhibitorFiles } from "../Model/response/ExhibitorFiles";
import { AddEventURL } from "../Model/request/AddEventURL";
import { EventLabel } from "../Model/response/EventLabel";
import { isNull } from "lodash";

export class EventFilesService {
  constructor() {
    dotenv.config();
  }

  /**
   * add Event Files
   */
  async addEventFiles(
    req: AddEventFile,
    event: any,
    context: Context
  ): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!req || !req.filesList || req.filesList.length < 1) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new EventFilesDao().addEventFiles(req, loginUser.id);

      if (result && req.filesList && req.filesList.length > 0) {
        finalResponse.data = req;
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
   * add Event URL
   */
async addEventURL(
  req: AddEventURL,
  event: any,
  context: Context
): Promise<any> {
  let loginUser = getAuthorizerUser(event);
  let finalResponse = getDefaultResponse();
  try {
    //check validation

    if (!req || !req.filelinkdata.fileLinks || req.filelinkdata.fileLinks.length < 1) {
      finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
      finalResponse.code = Codes.BAD_REQUEST;
      return Promise.resolve(finalResponse);
    }

    let result: any;
    result = await new EventFilesDao().addEventURL(req, loginUser.id);

    if (result && req.filelinkdata && req.filelinkdata.fileLinks.length > 0) {
      finalResponse.data = req;
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
   * create event medial directory structure on s3
   */
  async setupEventMediaDirectoryStructure(
    req: any,
    event: any,
    context: Context
  ): Promise<any> {
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!req || !req.eventUid) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await createEventDirectoryStructure(req.eventUid);

      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * get event files s3 singned url
   */
  async getEventFileS3SingnedUrl(
    req: EventFileS3SingnedUrlReq,
    event: any,
    context: Context
  ): Promise<any> {
    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!req || !req.eventUid || !req.key || !req.fileName) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }
      let s3KeyName = "event_media/" + req.eventUid + "/";
      if (
        req.key == EventFilesType.FloorPlan ||
        req.key == EventFilesType.VenueInternalFiles ||
        req.key == EventFilesType.VenueSharedFiles
      ) {
        s3KeyName =
          s3KeyName +
          EventFilesType.FilesForAllVenues +
          "/" +
          req.venueId +
          "/" +
          req.key +
          "/" +
          req.fileName;
      } else if (
        req.key == EventFilesType.SupplierInternalFiles ||
        req.key == EventFilesType.SupplierSharedFiles
      ) {
        s3KeyName =
          s3KeyName +
          EventFilesType.FilesForAllSuppliers +
          "/" +
          req.serviceId +
          "/" +
          req.key +
          "/" +
          req.fileName;
      } else if (
        req.key == EventFilesType.ExhibitorInternalFiles ||
        req.key == EventFilesType.ExhibitorSharedFiles
      ) {
        s3KeyName =
          s3KeyName +
          EventFilesType.FilesForAllExhibitors +
          "/" +
          req.exhibitorId +
          "/" +
          req.key +
          "/" +
          req.fileName;
      } else {
        s3KeyName = s3KeyName + req.key + "/" + req.fileName;
      }

      let result: any;
      result = await getS3FileUploadSignedURL(s3KeyName, req.mimeType);
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

  /**
   * get Event Files
   */
  async getEventFiles(req: any, event: any, context: Context): Promise<any> {
    let finalResponse = getDefaultResponse();
    let eventId = event.pathParameters.id;
    let loginUser = getAuthorizerUser(event);

    try {
      //check validation
      // if(!eventId){
      if (!eventId || eventId < 1 || !loginUser.id) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new EventFilesDao().getEventFiles(eventId);

      // finalResponse.data.event=res;

      if (result && result.length > 0 && result[0] && result[0].length > 0) {
        //set level one response
        let res: EventFilesResponse = await this.setEventFilesLevetOneResponse(
          result[0]
        );
        let vanueResult = result[1];
        console.log('vanueResult',vanueResult);
        let supplierResult = result[2];
        let exbResult = result[3];

        res.files.FFAV.venuesFiles = await this.setEventFilesVenuesResponse(
          vanueResult,
          loginUser.id,
          eventId
        );
        res.files.FFAS.supplierFiles =
          await this.setEventFilesSuppliersResponse(
            supplierResult,
            loginUser.id,
            eventId
          );
        res.files.FFAE.exhibitorFiles =
          await this.setEventFilesExhbitorResponse(
            exbResult,
            loginUser.id,
            eventId
          );

        // let result: any;
        result = await new EventFilesDao().getFilePermission(
          res.files,
          loginUser.id,
          eventId
        );

        finalResponse.data = { event: res };
      } else {
        finalResponse.message = CONSTANTS.RECORD_NOT_FOUND;
        finalResponse.code = Codes.NOT_FOUND;
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /***setup event files Exhbitor response  */
  async setEventFilesExhbitorResponse(
    result: any,
    loginUserId: number,
    eventId: number
  ) {
    if (!result || result.length < 1) {
      return [];
    }
    let exhbitorList: any = [];

    let exhbitorFileRes: any;
    let currentExhbitorId = 0;
    for (let i = 0; i < result.length; i++) {
      if (currentExhbitorId == 0 || currentExhbitorId != result[i].exhbitorId) {
        exhbitorFileRes = new ExhibitorFiles(result).getDefaultExhbitorResponse(
          result[i].name,
          result[i].exhbitorId
        );
        currentExhbitorId = result[i].exhbitorId;
        exhbitorList.push(exhbitorFileRes);
      }
      if (result[i].fileId && result[i].fileId > 0) {
        let file: EventFileRes = {
          displayName: result[i].displayName,
          fileId: result[i].fileId,
          fileUrl: result[i].fileUrl,
          mimeType: result[i].mimeType,
        };
        let lablURL: EventLabel = {
          label: result[i].labelname,
          URL: result[i].URLName,
          fileId:result[i].fileId
        };
        if (result[i].eventFileType == EventFilesType.ExhibitorSharedFiles) {
          if(result[i].displayName!='')
          {
            exhbitorFileRes.EBSF.list.push(file);
          }

          if(result[i].labelname !='undefined'&&result[i].URLName !='undefined'&&result[i].labelname !=isNull&&result[i].URLName !=isNull&&result[i].displayName ==''){
          
            exhbitorFileRes.EBSF.linklist.push(lablURL);
          }

          
        } else if (
          result[i].eventFileType == EventFilesType.ExhibitorInternalFiles
        ) {
          
          if(result[i].displayName!='')
          {
            exhbitorFileRes.EBIF.list.push(file);
          }

          if(result[i].labelname !='undefined'&&result[i].URLName !='undefined'&&result[i].labelname !=isNull&&result[i].URLName !=isNull&&result[i].displayName ==''){
          
            exhbitorFileRes.EBIF.linklist.push(lablURL);
          }
        }
      }
    }
    return exhbitorList;
  }

  /***setup event files suppliers response  */
  async setEventFilesSuppliersResponse(
    result: any,
    loginUserId: number,
    eventId: number
  ) {
    if (!result || result.length < 1) {
      return [];
    }
    let supplierList: any = [];

    let supplierFileRes: any;
    let currentServiceId = 0;
    for (let i = 0; i < result.length; i++) {
      if (currentServiceId == 0 || currentServiceId != result[i].serviceId) {
        supplierFileRes = new SupplierFiles(result).getDefaultSupplierResponse(
          result[i].name,
          result[i].serviceId
        );
        currentServiceId = result[i].serviceId;
        supplierList.push(supplierFileRes);
      }
      if (result[i].fileId && result[i].fileId > 0) {
        let file: EventFileRes = {
          displayName: result[i].displayName,
          fileId: result[i].fileId,
          fileUrl: result[i].fileUrl,
          mimeType: result[i].mimeType,
        };
        let lablURL: EventLabel = {
          label: result[i].labelname,
          URL: result[i].URLName,
          fileId:result[i].fileId
        };
        console.log('result[i]++',result[i]);
        if (result[i].eventFileType == EventFilesType.SupplierSharedFiles) {

          if(result[i].displayName!='')
          {
            supplierFileRes.SSF.list.push(file);
          }

          if(result[i].labelname !='undefined'&&result[i].URLName !='undefined'&&result[i].labelname !=isNull&&result[i].URLName !=isNull&&result[i].displayName ==''){
          
            supplierFileRes.SSF.linklist.push(lablURL);
          }

          
        } else if (

          
          result[i].eventFileType == EventFilesType.SupplierInternalFiles
        ) {
          if(result[i].displayName!='')
          {
            supplierFileRes.SIF.list.push(file);
          }

          if(result[i].labelname !='undefined'&&result[i].URLName !='undefined'&&result[i].labelname !=isNull&&result[i].URLName !=isNull&&result[i].displayName ==''){
          
            supplierFileRes.SIF.linklist.push(lablURL);
          }
          
        }
      }
    }
    return supplierList;
  }

   /***setup event files venues response  */
   async setEventFilesVenuesResponse(
    venueResult: any,
    loginUserId: number,
    eventId: number
  ) {
    if (!venueResult || venueResult.length < 1) {
      return [];
    }
    let venuesList: any = [];

    let venueFileRes: any;
    let currentVenueId = 0;
    for (let i = 0; i < venueResult.length; i++) {
      if (currentVenueId == 0 || currentVenueId != venueResult[i].venueId) {
        venueFileRes = new VenueFile(venueResult).getDefaultVenueResponse(
          venueResult[i].name,
          venueResult[i].venueId
        );
        currentVenueId = venueResult[i].venueId;
        venuesList.push(venueFileRes);
      }
      if (venueResult[i].fileId && venueResult[i].fileId > 0) {
        let file: EventFileRes = {
          displayName: venueResult[i].displayName,
          fileId: venueResult[i].fileId,
          fileUrl: venueResult[i].fileUrl,
          mimeType: venueResult[i].mimeType
        };
        let lablURL: EventLabel = {
          label: venueResult[i].labelname,
          URL: venueResult[i].URLName,
          fileId:venueResult[i].fileId
        };
        console.log('lablURL',lablURL);
        if (venueResult[i].eventFileType == EventFilesType.FloorPlan) {
          console.log('venueResult[i]',venueResult[i]);
          if(venueResult[i].displayName!='')
          {
          venueFileRes.FLOOR_PLAN.list.push(file);
          }

          if(venueResult[i].labelname !='undefined'&&venueResult[i].URLName !='undefined'&&venueResult[i].labelname !=isNull&&venueResult[i].URLName !=isNull&&venueResult[i].displayName ==''){
          
            venueFileRes.FLOOR_PLAN.linklist.push(lablURL);
          }
          
          
        } else if (
          venueResult[i].eventFileType == EventFilesType.VenueSharedFiles
        ) {
          if(venueResult[i].displayName!='')
          {
            venueFileRes.VSF.list.push(file);
          }
         
          // console.log('outsidevxcvxce',venueResult[i]);
          if(venueResult[i].labelname !='undefined'&&venueResult[i].URLName !='undefined'&&venueResult[i].labelname !=isNull&&venueResult[i].URLName !=isNull&&venueResult[i].displayName ==''){
        
            venueFileRes.VSF.linklist.push(lablURL);
          }
          
        
        } else if (
          venueResult[i].eventFileType == EventFilesType.VenueInternalFiles
        ) {

          if(venueResult[i].displayName!='')
          {
          venueFileRes.VIF.list.push(file);
          }

          if(venueResult[i].labelname !='undefined'&&venueResult[i].URLName !='undefined'&&venueResult[i].labelname !=isNull&&venueResult[i].URLName !=isNull&&venueResult[i].displayName ==''){
           
            venueFileRes.VIF.linklist.push(lablURL);
          }
          
          
        }
      }
    }
    return venuesList;
  }

  /***setup event files level one response  */
  async setEventFilesLevetOneResponse(result: any) {
    let res: EventFilesResponse = new EventFilesResponse();
    res.files = res.getDefaultEventFilesResponse();
    
    for (let i = 0; i < result.length; i++) {
      res.eventId = result[i].eventId;
      res.eventUid = result[i].eventUid;

      if (result[i].fileId && result[i].fileId > 0) {
        let file: EventFileRes = {
          displayName: result[i].displayName,
          fileId: result[i].fileId,
          fileUrl: result[i].fileUrl,
          mimeType: result[i].mimeType,
        };
        let lablURL: EventLabel = {
          label: result[i].labelname,
          URL: result[i].URLName,
          fileId:result[i].fileId
        };

        if (
          result[i].eventFileType ==
          EventFilesType.ClientOrEventManagerSharedFiles
        ) {
          if(result[i].displayName!='')
          {
            res.files.CEMSF.list.push(file);
          }

          if(result[i].labelname !='undefined'&&result[i].URLName !='undefined'&&result[i].labelname !=isNull&&result[i].URLName !=isNull&&result[i].displayName ==''){
            
            res.files.CEMSF.linklist.push(lablURL);
          }

          
        } else if (
          result[i].eventFileType == EventFilesType.ClientInternalFiles
        ) {
          if(result[i].displayName!='')
          {
            res.files.CIF.list.push(file);
          }

          if(result[i].labelname !='undefined'&&result[i].URLName !='undefined'&&result[i].labelname != isNull &&result[i].URLName !=isNull&&result[i].displayName ==''){
            res.files.CIF.linklist.push(lablURL);
          }
          
        } else if (
          result[i].eventFileType == EventFilesType.EventManagementInternalFiles
        ) {
          if(result[i].displayName!='')
          {
            res.files.EMIF.list.push(file);
          }

          if(result[i].labelname !='undefined'&&result[i].URLName !='undefined'&&result[i].labelname !=isNull&&result[i].URLName !=isNull&&result[i].displayName ==''){
            res.files.EMIF.linklist.push(lablURL);
          }
          
        } else if (result[i].eventFileType == EventFilesType.EventFiles) {
          if(result[i].displayName!='')
          {
            res.files.EF.list.push(file);
          }

          if(result[i].labelname !='undefined'&&result[i].URLName !='undefined'&&result[i].labelname !=isNull&&result[i].URLName !=isNull&&result[i].displayName ==''){
            
            res.files.EF.linklist.push(lablURL);
          }
          
        } else if (
          result[i].eventFileType == EventFilesType.FilesForAllVenues
        ) {
          if(result[i].displayName!='')
          {
            res.files.FFAV.list.push(file);
          }

          if(result[i].labelname !='undefined'&&result[i].URLName !='undefined'&&result[i].labelname !=isNull&&result[i].URLName !=isNull&&result[i].displayName ==''){
            
            res.files.FFAV.linklist.push(lablURL);
          }
          
        } else if (
          result[i].eventFileType == EventFilesType.FilesForAllSuppliers
        ) {
          if(result[i].displayName!='')
          {
            res.files.FFAS.list.push(file);
          }

          if(result[i].labelname !='undefined'&&result[i].URLName !='undefined'&&result[i].labelname !=isNull&&result[i].URLName !=isNull&&result[i].displayName ==''){
            
            res.files.FFAS.linklist.push(lablURL);
          }
          
        } else if (
          result[i].eventFileType == EventFilesType.FilesForAllExhibitors
        ) {
          if(result[i].displayName!='')
          {
            res.files.FFAE.list.push(file);
          }

          if(result[i].labelname !='undefined'&&result[i].URLName !='undefined'&&result[i].labelname !=isNull&&result[i].URLName !=isNull&&result[i].displayName ==''){
            
            res.files.FFAE.linklist.push(lablURL);
          }
          
          
        }
      }
    }

    
    return res;
  }
  /**
   * delete Event File
   */
  async deleteEventFile(
    req: AddEventFile,
    event: any,
    context: Context
  ): Promise<any> {
    let eventId = event.pathParameters.id;
    let fileId = event.pathParameters.fileId;

    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation
      if (!eventId || !fileId || fileId < 1) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new EventFilesDao().getEventFilesByid(fileId);

      if (result && result.length > 0 && result[0] && result[0].id > 0) {
        await new EventFilesDao().deleteEventFilesByid(fileId);
        let fileKey = url.parse(result[0].fileUrl).pathname?.substring(1);
        let deleteStatus = await deleteFileFromS3(fileKey);
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
   * delete Event File Link
   */
   async deleteEventLink(
    req: AddEventFile,
    event: any,
    context: Context
  ): Promise<any> {
    let eventId = event.pathParameters.id;
    let fileId = event.pathParameters.fileId;
    console.log("service of delete url",eventId,fileId)
    console.log("service of delete url EVENT",event)


    let loginUser = getAuthorizerUser(event);
    let finalResponse = getDefaultResponse();
    try {
      //check validation

      if (!eventId || !fileId || fileId < 1) {
        finalResponse.message = CONSTANTS.REQUIRED_FIELDS_ARE_MISSING;
        finalResponse.code = Codes.BAD_REQUEST;
        return Promise.resolve(finalResponse);
      }

      let result: any;
      result = await new EventFilesDao().getEventFilesByid(fileId);

      if (result && result.length > 0 && result[0] && result[0].id > 0) {
        await new EventFilesDao().deleteEventLinksByid(fileId);
        
      } else {
        finalResponse.message = CONSTANTS.FAILED;
        finalResponse.code = Codes.BAD_REQUEST;
        console.log("deleteEvenLink:::",finalResponse)
      }
      return Promise.resolve(finalResponse);
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
