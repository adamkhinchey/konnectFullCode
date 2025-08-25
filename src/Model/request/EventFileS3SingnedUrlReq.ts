import { EventFilesDao } from '../../daos/EventFilesDao';
import { EventFilesType } from '../../enums/EventFilesType';
import { EventFile } from './EventFile';

export class EventFileS3SingnedUrlReq {

    fileName: '';
    key: EventFilesType;
    eventId:number;
    venueId:number;
    serviceId:number;
    exhibitorId:number; 
    mimeType:string;
    eventUid:string;
    constructor(obj: any) {
        Object.assign(this, obj);
    }
}
