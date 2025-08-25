import { EventFilesDao } from '../../daos/EventFilesDao';
import { VenueFile } from './VenueFile';
import { SupplierFiles } from './SupplierFiles';


export class EventFilesResponse {

    eventId:number;
    eventUid:string;
    files:any;
    constructor() {
    }
    
   getDefaultEventFilesResponse(){
       return {
        CEMSF:{
            key:'CEMSF',
            list:[],
            linklist:[]
         },
        CIF:{
            key:'CIF',
            list:[]	,
            linklist:[]
        },
        EMIF:{
            key:'EMIF',
            list:[]	,
            linklist:[]
        },
        EF:{
            key:'EF',
            list:[]	,
            linklist:[]
        },
        FFAV:{
            key:'FFAV',
            list:[],
            linklist:[],
            venuesFiles:[]
        },
        FFAS:{
            key:'FFAS',
            list:[]	,
            linklist:[],
            supplierFiles:[]
        },
        FFAE:{
            key:'FFAE',
            list:[],
            linklist:[],
            exhibitorFiles:[]
        },
    };
   }
}
