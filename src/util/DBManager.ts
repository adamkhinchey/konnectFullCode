import * as mysql from 'promise-mysql';
import * as dotenv from 'dotenv';
import { to, parseQueryResponse } from './helper';

export async function getConnection(user?: any): Promise<any> {
  dotenv.config();
  try {
    let [err, connection] = await to(mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
      multipleStatements: true
    }));
    if (err) {
      throw err;
    }

    return Promise.resolve(connection);
  } catch (e) {
    throw e;
  }

}