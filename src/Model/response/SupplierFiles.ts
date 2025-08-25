export class SupplierFiles {

    name: string;
    serviceId:number;
    SSF:{
        key:'SSF',
        list:[],
        linklist:[]
    };
    SIF:{
        key:'SIF',
        list:[],
        linklist:[]
    }
    constructor(personnel: any) {
        Object.assign(this, personnel);
    }

    getDefaultSupplierResponse(name:string,serviceId:number){
        return {

            name:name,
            serviceId:serviceId,
          
            SSF:{
                key:'SSF',
                list:[],
                linklist:[]
            },
            SIF:{
                key:'SIF',
                list:[],
                linklist:[]
            }
        }
    }
}
