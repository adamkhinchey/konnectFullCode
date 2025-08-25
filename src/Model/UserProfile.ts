import { TimeZone } from "./TimeZone";

export class UserProfile {

    id: number = 0;
    email: string = '';
    inviteUID: string = ''; 
    password: any = '';
    roleId:number;
    firstName: string = '';
    lastName: string = '';
    profileImage: string = '';
    countryId: number ;
    city: string = '';
    aboutMe: string= '';
    headline: string='';
    timeZone: TimeZone ;
    mobileNumber: string = '';
    authrizationToken:string;
    defaultCompanyId:number=0;
    constructor(personnel: any) {
        Object.assign(this, personnel);
    }
}
