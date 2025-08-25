let GenericFields = {
  fielExists: {
    required: true
  },
  requiredField: {
    required: true
  },
  email: {
    required: true,
    escape: true,
    trim: true,
    validate: function (name, path) {
      //you can have custom validator too
      let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (regexp.test(name)) {
        return {
          isValid: true,
          message: 'correct'
        };
      } else {
        return {
          isValid: false,
          message: 'email is not valid'
        };
      }

    },
  },
  password: {
    required: true,
    isLength: [6, 100]
  },
  user_type_id: {
    required: true,
    enum: [3]
  },
  business_type_id: {
    required: true,
    enum: [2]
  },
  name: {
    required: true,
    trim: true,
    validate: function (name, path) {
      if (name) {
        return {
          isValid: true,
          message: 'correct'
        };
      } else {
        return {
          isValid: false,
          message: 'name can not be empty'
        };
      }

    },
  },

  radius: {
    validate: function (name, path) {
      //you can have custom validator too
      let regexp = new RegExp(/^\d*(\.\d+)?$/);
      if (regexp.test(name)) {
        return {
          isValid: true,
          message: 'correct'
        };
      } else {
        return {
          isValid: false,
          message: 'Radius must be numeric value.'
        };
      }

    }
  },
  dob: {
    trim: true,
    validate: function (name, path) {
      //you can have custom validator too
      let regexp = new RegExp(/^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/);
      if (regexp.test(name)) {
        return {
          isValid: true,
          message: 'correct'
        };
      } else {
        return {
          isValid: false,
          message: 'Invalid date.'
        };
      }

    }
  },
  mobile_number: {
    required: true,
    validate: function (name, path) {
      //you can have custom validator too
      let regexp = new RegExp(/^(\+\d{1,3}[- ]?)?\d{10}$/);
      if (regexp.test(name)) {
        return {
          isValid: true,
          message: 'correct'
        };
      } else {
        return {
          isValid: false,
          message: 'Invalid mobile number.'
        };
      }

    }
  }
  ,
  time: {
    required: true,
    validate: function (name, path) {
      //you can have custom validator too
      let regexp = new RegExp(/^([01][0-9]|2[0-3]):[0-5][0-9]$/);
      if (regexp.test(name)) {
        return {
          isValid: true,
          message: 'correct'
        };
      } else {
        return {
          isValid: false,
          message: 'Invalid time.'
        };
      }

    }
  }
}

export const SchemaTemplates = {
  CustomerSignUpSchema: {
    email: GenericFields.email,
    password: GenericFields.password,
    user_type_id: {
      required: true,
      enum: [3]
    },
    name: GenericFields.name,
    //
    dob: GenericFields.requiredField,
    mobile_no: GenericFields.requiredField,
    gender: GenericFields.requiredField,
    /*latitude: GenericFields.latitude,
    longitude: GenericFields.longitude*/
  },
  BusinessSignUpSchema: {
    email: GenericFields.email,
    password: GenericFields.password,
    user_type_id: {
      required: true,
      enum: [2]
    },
    firstName: GenericFields.requiredField
  },
  SocialSignUpSchema: {
    email: GenericFields.email,
    user_role: {
      required: true,
      enum: [2]
    }
  },
  SignInSchema: {
    email: GenericFields.email,
    password: GenericFields.requiredField
  },

  ForgotPasswordSchema: {
    email: GenericFields.email
  },
  VerifyEmailSchema: {
    token: GenericFields.requiredField
  },
  DownloadPersonalDataSchema: {
    export_in: {
      required: true,
      enum: ['json', 'csv', 'excel', 'xml']
    }
  },
  OtpVerifySchema: {
    otp: GenericFields.requiredField
  },
  ResetPasswordSchema: {
    token: GenericFields.requiredField,
    password: GenericFields.password
  },
  UserResetPasswordSchema: {
    otp: GenericFields.requiredField,
    password: GenericFields.password
  },
  UpdateAppSettingSchema: {
    is_receiving_updates: GenericFields.requiredField,
    is_sound_on: GenericFields.requiredField,
    is_vibrate_on_scan: GenericFields.requiredField,
    is_location_reporting: GenericFields.requiredField
  },
  ChangePasswordSchema: {
    password: GenericFields.requiredField,
    new_password: GenericFields.password,
    confirm_password: GenericFields.password,
  },
  ChangeEmailSchema: {
    new_email_address: GenericFields.email,
    old_email_address: GenericFields.email
  },
  UpdateReceivingUpdatesSchema: {
    is_receiving_updates: GenericFields.email
  },
  EditProfileSchema: {
    name: GenericFields.name,
    /*latitude: GenericFields.latitude,
    longitude: GenericFields.longitude,
    dob: GenericFields.dob,
    mobile_number: GenericFields.mobile_number,*/
  },
  BusinessEditProfileSchema: {
    business_name: GenericFields.requiredField,
    business_category_id: GenericFields.requiredField,
    business_info: GenericFields.requiredField,
    business_email_address: GenericFields.email,
    weekday_open_time: GenericFields.requiredField,
    weekday_close_time: GenericFields.requiredField,
    saturday_open_time: GenericFields.requiredField,
    saturday_close_time: GenericFields.requiredField,
    sunday_open_time: GenericFields.requiredField,
    sunday_close_time: GenericFields.requiredField,
    contact_number: GenericFields.requiredField
  },
  BusinessOfferSchema: {
    title: GenericFields.requiredField,
    description: GenericFields.requiredField,
    start_date: GenericFields.requiredField,
    end_date: GenericFields.requiredField,
    redeem_start_time: GenericFields.time,
    redeem_close_time: GenericFields.time,
    scan_per_user_limit: GenericFields.requiredField,
    user_id: GenericFields.requiredField
  },
  BusinessOfferGeoDataSchema: {
    id: GenericFields.requiredField,
    radius: GenericFields.requiredField
  },
  NearByOfferSchema: {
    latitude: GenericFields.requiredField,
    longitude: GenericFields.requiredField,
    radius: {
      required: true,
      enum: [1, 2, 3, 4, 5]
    }
  },
  OfferDetailSchema: {
    business_location_id: GenericFields.requiredField,
    business_location_address_id: GenericFields.requiredField,
    business_offer_id: GenericFields.requiredField
  },
  FavouriteOfferSchema: {
    business_offer_id: GenericFields.requiredField,
    business_location_id: GenericFields.requiredField,
    business_location_address_id: GenericFields.requiredField,
  },
  FavouriteOfferLocationList: {
    /*search_type: {
      required: true,
      enum: ['valid', 'expired']
    }*/
  },
  NotificationListSchema: {
    notification_type: {
      required: true,
      enum: ['sms', 'mail', 'inapp']
    }
  },

  ScanOfferSchema: {
    qr_code: GenericFields.requiredField,
    latitude: GenericFields.requiredField,
    longitude: GenericFields.requiredField
  },
  AddRatingSchema: {
    business_location_address_id: GenericFields.requiredField,
    business_location_id: GenericFields.requiredField,
    rating: {
      required: true,
      enum: [1, 2, 3, 4, 5]
    }
  },
  ReviewListSchema: {
    business_location_address_id: GenericFields.requiredField,
    business_location_id: GenericFields.requiredField
  },
  SaveBusinessRecommendationSchema: {
    business_name: GenericFields.requiredField,
    business_address: GenericFields.requiredField,
    /*business_contact: GenericFields.requiredField,
    business_telephone_number: GenericFields.requiredField,
    business_association: GenericFields.requiredField,
    is_business_aware: GenericFields.requiredField*/
  },
  ProgramListSchema: {
    business_location_id: GenericFields.requiredField
  },
  OfferStatisticsSchema: {
    business_offer_id: GenericFields.requiredField
  },
  LoyaltyProgrammSchema: {
    programm_name: GenericFields.requiredField,
    image: GenericFields.requiredField,
    target_points: GenericFields.requiredField
  },
  NotficationsSchema: {
    event: GenericFields.requiredField,
    text: GenericFields.requiredField,
    schedule_datetime: GenericFields.requiredField,
  },
  LoyaltyProgrammByIdSchema: {
    id: GenericFields.requiredField
  },
  ReportBusinessFeedbackSchema: {
    id: GenericFields.requiredField,
    report_reason: GenericFields.requiredField
  },

  LoyaltyProgrammListSchema: {
    is_active: GenericFields.requiredField
  },
  ActivateOrReplaceProgrammSchema: {
    id: GenericFields.requiredField,
    replacer_id: GenericFields.requiredField
  },
  UpdateBusinessContactSchema: {
    job_title: GenericFields.requiredField,
    contact_name: GenericFields.requiredField,
    telephone_number: GenericFields.requiredField,
    /* mobile_number: GenericFields.requiredField, */
    email_address: GenericFields.email
  },
  UpdateCustomerLocationSchema: {
    latitude: GenericFields.requiredField,
    longitude: GenericFields.requiredField
  },
  offerAndLoyaltyProgramCodeListSchema: {
    type: {
      required: true,
      enum: ['o', 'l']
    }
  },
  SaveInquiryMessageSchema: {
    //message: GenericFields.requiredField,
    category: {
      required: true,
      enum: ['F', 'C']
    }
  },
  editBusinessProfile: {
    name: GenericFields.requiredField,
    address: GenericFields.requiredField,
    time_frame: GenericFields.requiredField,
    open_time: GenericFields.requiredField,
    close_time: GenericFields.requiredField
  },

  editofferedService: {
    name: GenericFields.requiredField,
    price: GenericFields.requiredField,
    time_duration: GenericFields.requiredField
  },
  editMessage: {
    text: GenericFields.requiredField,
    time_interval: GenericFields.requiredField
  },

  AddShopStaff: {
    name: GenericFields.requiredField,
    shop_id: GenericFields.requiredField,
    mobile: GenericFields.requiredField,
    email: GenericFields.requiredField
   /* business_association: GenericFields.requiredField,
    is_business_aware: GenericFields.requiredField*/
  },

};