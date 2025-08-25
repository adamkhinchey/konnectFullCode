import * as dotenv from "dotenv";
import * as _ from "lodash";
import * as jwt from "jsonwebtoken";

export class AuthService {
  public commonARN = ["assignCompanyToUser"];

  public connectAppUserARN = [
    "assignCompanyToUser",
    "changePassword",
    "deleteProfile",
    "me",
    "updateUserProfile",
    "createCompany",
    "removeCompanyAssocaition",
    "getCompanyProfileDetails",
    "getCompanyColleaguesWithSegregation",
    "makeCompanyAdmin",
    "approveRejectCompanyJoinRequest",
    "saveColleaguePosition",
    "addConnection",
    "deleteConnection",
    "listConnection",
    "searchGlobalConnection",
    "searchGlobalConnectionNew",
    "searchGlobalConnectionForCollection",
    "checkUserCompanyDomain",
    "inviteCompanyColleague",
    "searchCompanyContactsByKeyword",
    "searchCompanyByKeyword",
    "getCompanyContacts",
    "inviteNewCompany",
    "saveEvent",
    "updateEvent",
    "saveAndInviteEventTab",
    "updateCompanyProfile",
    "getEvent",
    "addEventFiles",
    "addEventURL",
    "getEventList",
    "getEventFileUploadS3SingnedUrl",
    "event/{id}/files",
    "event/{id}/files/{fileId}",
    "event/{id}/file/{fileId}",
    "deleteMyEvent",
    "getEventsWithDate",
    "getTimelineTabData",
    "event/{id}/venue/{venueId}/timeline",
    "acceptDeclineEventTabParts",
    "adminLogin",
    "listUsers",
    "getUserDtail",
    "getCurrentEventsList",
    "changeAdminPassword",
    "changeUserStatus",
    "updateAdminProfile",
    "getUserByEmailId",
    "resendEmailVerificationLink",
    "importExportServicesAndExhibitors",
    "deleteBucketFileByKey",
    "saveClientAccessPermission",
    "addEventTask",
    "addConfirmationDate",
    "saveViewExhibitor",
    "updateViewExhibitor",
    "addCrewConfirmationDate",
    "getLetestDate",
    "checkCrewLogin",
    "getSendHistory",
    "getViewExhibitor",
    "getViewExhibitorDetails",
    "getViewExhibtr",
    "getTaskAssignToList",
    "deleteEventTask",
    "listEventTask",
    "changeTaskStatus",
    "updateUserTaskOrder"
  ];

  public adminARN = ["adminDashboard"];

  constructor() {
    dotenv.config();
  }

  async authorize(event: any, context: any, callback: any): Promise<any> {
    const token = event.headers.Authorization;

    try {
      // Verify JWT
      const decoded = jwt.verify(token, process.env.EncryptionKEY);

      const user: any = decoded.data;

      let method = event.resource.substring(1);
      let scopes = user.role_id != 1 ? this.connectAppUserARN : this.adminARN;
      scopes = scopes.concat(this.commonARN);
      // Checks if the user's scopes allow her to call the current function
      const isAllowed = scopes.indexOf(method) > -1 ? true : false;

      const effect = isAllowed ? "Allow" : "Deny";
      const userId = user.id;
      const authorizerContext = {
        user: JSON.stringify(user),
      };
      // Return an IAM policy document for the current endpoint
      const policyDocument = this.buildIAMPolicy(
        userId,
        effect,
        event.methodArn,
        authorizerContext
      );
      callback(null, policyDocument);
    } catch (e) {
      callback("Unauthorized"); // Return a 401 Unauthorized response
    }
  }

  authorizeUser(userScopes: any, methodArn: any): any {
    const hasValidScope = _.some(userScopes, (scope) =>
      _.endsWith(methodArn, scope)
    );
    return hasValidScope;
  }

  buildIAMPolicy(userId, effect, resource, context): any {
    const policy = {
      principalId: userId,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: "*",
          },
        ],
      },
      context,
    };

    return policy;
  }
}
