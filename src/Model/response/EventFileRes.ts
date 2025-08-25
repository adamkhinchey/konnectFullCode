import { EventFilesDao } from '../../daos/EventFilesDao';
import { EventFilesType } from '../../enums/EventFilesType';

export class EventFileRes {

    displayName: string = "";
    fileUrl: string="";
    fileId:number;
    mimeType:string;
    constructor(obj: any) {
        Object.assign(this, obj);
    }
}
