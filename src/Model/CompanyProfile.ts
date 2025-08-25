import { TimeZone } from "./TimeZone";

export class CompanyProfile {

    id: number = 0;
    companyName: string = '';
    categoryIds: any=[];
    countryId:number;
    city: string = '';
    website: string = '';
    description: string = '';
    companyProfileImage: number ;
    companyType: string = '';
    userId:number;
    isSeed:number;
    constructor(personnel: any) {
        Object.assign(this, personnel);
    }
}
