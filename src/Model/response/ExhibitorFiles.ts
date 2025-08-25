export class ExhibitorFiles {

    name: string;
    exhibitorId:number;
    EBSF:{
        key:'EBSF',
        list:[]
    };
    EBIF:{
        key:'EBIF',
        list:[]
    }
    constructor(personnel: any) {
        Object.assign(this, personnel);
    }

    getDefaultExhbitorResponse(name:string,id:number){
        return {

            name:name,
            exhibitorId:id,
          
            EBSF:{
                key:'EBSF',
                list:[],
                linklist:[]
            },
            EBIF:{
                key:'EBIF',
                list:[],
                linklist:[]
            }
        }
    }
}
