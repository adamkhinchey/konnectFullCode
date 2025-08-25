import { Handler, Context, Callback } from 'aws-lambda';
import { to, renderResponse, parseBody, getToken } from '../util/helper';
import * as _ from 'lodash';
import { UserMgmtService } from '../service/UserService';
import { CompanyService } from '../service/CompanyService';

const searchCompany: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {

      let [err, response] = await to(new CompanyService().searchCompany(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  const searchCompanyForDomain: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {

      let [err, response] = await to(new CompanyService().searchCompanyForDomain(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  const searchCompanyForEvent: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {

      let [err, response] = await to(new CompanyService().searchCompanyForEvent(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const getRegionAndCountryList: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().getRegionAndCountryList(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const assignCompanyToUser: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().assignCompanyToUser(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  const getCategoryList: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().getCategoryList(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  const createCompany: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().createCompany(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  const removeCompanyAssocaition: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().removeCompanyAssocaition(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  const getCompanyProfileAndMembers: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().getCompanyProfileAndMembers(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }


  const makeCompanyAdmin: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().makeCompanyAdmin(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  const approveRejectCompanyJoinRequest: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().approveRejectCompanyJoinRequest(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  const saveColleaguePosition: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().saveColleaguePosition(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const inviteCompanyColleague: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().inviteCompanyColleague(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }


  const getCompanyColleaguesWithSegregation: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().getCompanyColleaguesWithSegregation(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const updateCompanyProfile: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new CompanyService().updateCompanyProfile(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }



  export {searchCompany,searchCompanyForDomain,searchCompanyForEvent,getRegionAndCountryList,assignCompanyToUser,getCategoryList,createCompany,removeCompanyAssocaition,getCompanyProfileAndMembers, makeCompanyAdmin, approveRejectCompanyJoinRequest, saveColleaguePosition, inviteCompanyColleague,getCompanyColleaguesWithSegregation, updateCompanyProfile}


