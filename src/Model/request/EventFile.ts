import { EventFilesDao } from '../../daos/EventFilesDao';
import { EventFilesType } from '../../enums/EventFilesType';

export class EventFile {

    displayName: string = "";
    fileUrl: string="";
    mimeType:string;
    constructor(obj: any) {
        Object.assign(this, obj);
    }
}
