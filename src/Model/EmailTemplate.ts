export class EmailTemplate {

    id: number = 0;
    subject: string = "";
    body: string = "";
    constructor(personnel: any) {
        Object.assign(this, personnel);
    }
}
