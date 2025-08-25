import * as _ from "lodash";
import {
  to,
  parseQueryResponse,
} from "../util/helper";
import { getConnection } from "../util/DBManager";

export class commonDao {
 


/***
 * Fetech email template 
 * 
 */
async getEmailTemplateById(id: number): Promise < any > {
  let connection: any;
  try {
    let err: Error;
    let result: any;
     connection = await getConnection();
     let query = `select subject, content from email_templates where id =  ?`;
     [err, result] = await to(connection.query(query, [id]));
     if (err) throw err;
     result=parseQueryResponse(result);
     return Promise.resolve(result[0]);
  } catch (e) {
    return Promise.reject(e);
  } finally {
    if (connection) {
      connection.end();
    }
  }
}
 
  

}
