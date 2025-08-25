import { Handler, Context, Callback } from 'aws-lambda';
import { to, renderResponse, parseBody, getToken } from '../util/helper';
import * as _ from 'lodash';
import { EventFilesService } from '../service/EventFilesService';

const addEventFiles: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new EventFilesService().addEventFiles(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
const addEventURL: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
        let [err, response] = await to(new EventFilesService().addEventURL(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  const createEventDirectoryStructure: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new EventFilesService().setupEventMediaDirectoryStructure(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }
  
  const getEventFileS3SingnedUrl: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new EventFilesService().getEventFileS3SingnedUrl(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const deleteEventFile: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new EventFilesService().deleteEventFile(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const deleteEventLink: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      console.log('Testes Working')
      let [err, response] = await to(new EventFilesService().deleteEventLink(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  const getEventFiles: Handler = (event: any, context: Context, callback: Callback) => {
    (async () => {
      let [err, response] = await to(new EventFilesService().getEventFiles(parseBody(event), event,context));
      renderResponse(err, response, callback);
    })();
  }

  export {addEventFiles,addEventURL,createEventDirectoryStructure,deleteEventLink,deleteEventFile,getEventFileS3SingnedUrl,getEventFiles}
  
  
  