import { EventFilesDao } from '../../daos/EventFilesDao';
import { EventFilesType } from '../../enums/EventFilesType';
import { EventFile } from './EventFile';

export class AddEventFile {

    filesList: EventFile[];
    eventFileType: EventFilesType;
    eventId:number;
    venueId:number;
    supplierId:number;
    exhibitorId:number; 
    uploadedByUserId:number;
    constructor(obj: any) {
        Object.assign(this, obj);
    }
}
