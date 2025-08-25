import { Handler, Context, Callback } from 'aws-lambda';
import { to, renderResponse, parseBody, getToken, renderResponseForImport } from '../util/helper';
import * as _ from 'lodash';
import { AdminMgmtService } from '../service/AdminService';
import { AuthService } from '../service/AuthService';



const adminLogin: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new AdminMgmtService().adminLogin(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}


const listUsers: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new AdminMgmtService().listUsers(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}


const getUserDtail: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new AdminMgmtService().getUserDtail(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const getCurrentEventsList: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new AdminMgmtService().getCurrentEventsList(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const changeAdminPassword: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new AdminMgmtService().changeAdminPassword(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const changeUserStatus: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new AdminMgmtService().changeUserStatus(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}


const updateAdminProfile: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new AdminMgmtService().updateAdminProfile(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}


const importExportServicesAndExhibitors: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new AdminMgmtService().importExportServicesAndExhibitors(parseBody(event), event,context));
    renderResponseForImport(err, response, callback);
  })();
}

// 

const deleteBucketFileByKey: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new AdminMgmtService().deleteBucketFileByKey(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}


  export {adminLogin, listUsers, getUserDtail,getCurrentEventsList, changeAdminPassword, changeUserStatus, updateAdminProfile, importExportServicesAndExhibitors, deleteBucketFileByKey}
  
  