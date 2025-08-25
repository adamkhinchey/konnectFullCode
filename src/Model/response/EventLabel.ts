import { EventFilesDao } from '../../daos/EventFilesDao';
import { EventFilesType } from '../../enums/EventFilesType';

export class EventLabel {

    label: string = "";
    URL: string="";
    fileId:number=0;
    constructor(obj: any) {
        Object.assign(this, obj);
    }
}
