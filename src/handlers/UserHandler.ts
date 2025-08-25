import { Handler, Context, Callback } from 'aws-lambda';
import { to, renderResponse, parseBody, getToken } from '../util/helper';
import * as _ from 'lodash';
import { UserMgmtService } from '../service/UserService';
import { AuthService } from '../service/AuthService';

const authorize: Handler = (event: any,context: Context,callback: Callback) => {
  (async () => {
    new AuthService().authorize(event, context, callback);
  })();
};

/**signup user */
const addUser: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().addUser(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  /** user login  */
  const userLogin: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().userLogin(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  /** get s3 sign url for file upload */
  const getS3BucketSignedURL: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().getS3BucketSignedURL(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  /** send reset password link */
  const sendResetPasswordLink: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().forgotPassword(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  /** reset password */
  const resetPassword: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().resetPassword(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  /**update user profile*/
const updateUserProfile: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().updateUser(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}


  /** change password */
  const changePassword: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().changePassword(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }


  /** Verify User Email */
  const verifyUserEmail: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().verifyUserEmail(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  /** delete profile */
  const deleteProfile: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().deleteProfile(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

 const addConnection: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().addConnection(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  const deleteConnection: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().deleteConnection(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  const listConnection: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().listConnection(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const searchGlobalConnection: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().searchGlobalConnection(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const searchGlobalConnectionNew: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().searchGlobalConnectionNew(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const searchGlobalConnectionForCollection: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().searchGlobalConnectionForCollection(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const checkUserCompanyDomain: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().checkUserCompanyDomain(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }


/**get user profile*/
  const getUserProfile: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().getUserProfile(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const getUserDataByUID: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().getUserDataByUID(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }



  const inviteNewCompany: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().inviteNewCompany(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }



  const searchCompanyContactsByKeyword: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().searchCompanyContactsByKeyword(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }


  const getCompanyContacts: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().getCompanyContacts(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }


  const searchCompanyByKeyword: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().searchCompanyByKeyword(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }


  const saveEvent: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().saveEvent(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }



  const updateEvent: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new UserMgmtService().updateEvent(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }





const saveAndInviteEventTab: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().saveAndInviteEventTab(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}




const getEvent: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().getEvent(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}



const getEventList: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().getEventList(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}



const deleteMyEvent: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().deleteMyEvent(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const getEventsWithDate: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().getEventsWithDate(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const getTimelineTabData: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().getTimelineTabData(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}




const acceptDeclineEventTabParts: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().acceptDeclineEventTabParts(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}


const getUserByEmailId: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().getUserByEmailId(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const feedCompanySeedData: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().feedCompanySeedData(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const resendEmailVerificationLink: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().resendEmailVerificationLink(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}



const saveClientAccessPermission: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().saveClientAccessPermission(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}


const addEventTask: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().addEventTask(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}


const addConfirmationDate: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().addConfirmationDate(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const saveViewExhibitor: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().saveViewExhibitor(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const updateViewExhibitor: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().updateViewExhibitor(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const addCrewConfirmationDate: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().addCrewConfirmationDate(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const getLetestDate: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().getLetestDate(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const checkCrewLogin: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().checkCrewLogin(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const getSendHistory: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().getSendHistory(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const getViewExhibitor: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().getViewExhibitor(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const getViewExhibitorDetails: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().getViewExhibitorDetails(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const getViewExhibtr: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().getViewExhibtr(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}

const getTaskAssignToList: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().getTaskAssignToList(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}



const deleteEventTask: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().deleteEventTask(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}



const listEventTask: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().listEventTask(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}


const changeTaskStatus: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().changeTaskStatus(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}




const updateUserTaskOrder: Handler = (event: any, context: Context, callback: Callback) => {
  (async () => {
    let [err, response] = await to(new UserMgmtService().updateUserTaskOrder(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}


const sendEmailFromInvokeFunV1: Handler = (event: any, context: Context, callback: Callback) => {
  console.log('send email invoke event...', event);
  (async () => {
    let [err, response] = await to(new UserMgmtService().sendEmailFromInvokeFunV1(parseBody(event), event,context));
    renderResponse(err, response, callback);
  })();
}




  export {authorize,addUser,userLogin,sendResetPasswordLink,resetPassword,getS3BucketSignedURL,updateUserProfile, changePassword,verifyUserEmail, deleteProfile, addConnection, deleteConnection, listConnection, searchGlobalConnection,searchGlobalConnectionNew,searchGlobalConnectionForCollection,checkUserCompanyDomain,getUserProfile, getUserDataByUID, inviteNewCompany, searchCompanyContactsByKeyword, searchCompanyByKeyword, getCompanyContacts, saveEvent, updateEvent, saveAndInviteEventTab, getEvent, getEventList,getViewExhibtr, deleteMyEvent, getEventsWithDate, getTimelineTabData, getViewExhibitorDetails,acceptDeclineEventTabParts, getUserByEmailId,getViewExhibitor, feedCompanySeedData,resendEmailVerificationLink,getSendHistory,checkCrewLogin,updateViewExhibitor, saveClientAccessPermission,getLetestDate,addCrewConfirmationDate,saveViewExhibitor,addConfirmationDate, addEventTask, getTaskAssignToList, deleteEventTask, listEventTask, changeTaskStatus, updateUserTaskOrder, sendEmailFromInvokeFunV1}

