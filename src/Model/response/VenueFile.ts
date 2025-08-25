export class VenueFile {

    name: string;
    venueId:number;
    FLOOR_PLAN:any={
        key:'FLOOR_PLAN',
        list:[]
    };
    VSF:any={
        key:'VSF',
        list:[]
    };
    VIF:any={
        key:'VIF',
        list:[]
    }
    constructor(personnel: any) {
        Object.assign(this, personnel);
    }

    getDefaultVenueResponse(name:string,venueId:number){
        return {

            name:name,
            venueId:venueId,
            FLOOR_PLAN:{
                key:'FLOOR_PLAN',
                list:[],
                linklist:[]
            },
            VSF:{
                key:'VSF',
                list:[],
                linklist:[]
            },
            VIF:{
                key:'VIF',
                list:[],
                linklist:[]
            }
        }
    }
}
