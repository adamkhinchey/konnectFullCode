import * as aws from 'aws-sdk'
import { EventFilesType } from '../enums/EventFilesType';
import { invokeLambda } from './helper';


//const s3 = new AWS.S3();
const S3_BUCKET = process.env.MEDIA_BUCKET_NAME;




/***get singend url of s3 bucket */
export async function getS3FileUploadSignedURL(fileName: any, fileType: any): Promise<any> {


  const s3 = new aws.S3(); // Create a new instance of S3
  /*s3.listBuckets(function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.Buckets);
    }
  });
*/
  // Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 50000,
    ContentType: fileType,
    ACL: 'public-read'
  };


  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', s3Params, (err, data) => {

      if (err) {
        reject({
          status: 'ERROR',
          error: err
        });
      }
      resolve({
        status: 'OK',
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
      })

    });

  });

}

/*** create event directory Structure on s3 bucket */
export async function createEventDirectoryStructure(eventUid: any): Promise<any> {


  const s3 = new aws.S3(); // Create a new instance of S3
 const eventMediaFolder='event_media/';
 let keyName=eventMediaFolder+eventUid+'/';
 //create envet root folder
  await createDirectoryOnS3(keyName,s3);

  await createDirectoryOnS3(keyName+EventFilesType.ClientOrEventManagerSharedFiles+'/',s3);
  await createDirectoryOnS3(keyName+EventFilesType.ClientInternalFiles+'/',s3);
  await createDirectoryOnS3(keyName+EventFilesType.EventManagementInternalFiles+'/',s3);
  await createDirectoryOnS3(keyName+EventFilesType.EventFiles+'/',s3);
  await createDirectoryOnS3(keyName+EventFilesType.FilesForAllVenues+'/',s3);
  await createDirectoryOnS3(keyName+EventFilesType.FilesForAllSuppliers+'/',s3);
  await createDirectoryOnS3(keyName+EventFilesType.FilesForAllExhibitors+'/',s3);

}

/*** create directory on s3 bucket */
 async function createDirectoryOnS3(key: any,s3): Promise<any> {
  // Set up the payload of what we are sending to the S3 api
  const s3Params :any= {
    Bucket: S3_BUCKET,
    Key: key,
    Expires: 50000,
    ACL: 'public-read',
    Body:''
  };

  return new Promise((resolve, reject) => {
    s3.upload( s3Params, (err, data) => {
      if (err) {

        reject({
          status: 'ERROR',
          error: err
        });
      }
      resolve({
        status: 'OK'
      })

    });

  });
}
/** async Lambda call for create directory structure for event  */
export function asyncLambdaCallForCreateEventDirectoryStructure(eventUid:string) {
  let payload: any = { eventUid };
  var lparams = {
    FunctionName: process.env['KONNECT_SERVICE_NAME'] + 'createEventDirectoryStructure',
    InvocationType: 'Event',
    LogType: 'Tail',
    Payload: `{"body" : ${JSON.stringify(payload)}}`
  };

  invokeLambda(lparams);
}

/*** delete file from  s3 bucket */
export function  deleteFileFromS3(key: any): Promise<any> {
  const s3 = new aws.S3();
  const s3Params :any= {
    Bucket: S3_BUCKET,
    Key: key
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject( s3Params, (err, data) => {
      if (err) {

        reject({
          status: 'ERROR',
          error: err
        });
      }
      resolve({
        status: 'OK'
      })

    });

  });
}