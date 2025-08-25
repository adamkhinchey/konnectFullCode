import { CompanyRole } from "../../enums/ComanyRole";
import { CompanyAssignType } from "../../enums/CompanyAssignType";

export class AssignUserToCompany {
   
    id: number =0;
    companyId: number;
    userId: number;
    companyRoleId: CompanyRole; 
    position: string = '';
    assignType: CompanyAssignType;
    createdByUserId: number;
    
    constructor(param: any) {
        Object.assign(this, param);
    }
}
