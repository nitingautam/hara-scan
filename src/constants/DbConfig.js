import AWS from "aws-sdk";
import { DataMapper } from '@aws/dynamodb-data-mapper';

const AWSaccesssKeyId = process.env.AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID : "not-important";
const AWSsecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY ? process.env.AWS_SECRET_ACCESS_KEY : "not-important";
const AWSregion = process.env.REGION ? process.env.REGION : "local";
const AWSendpoint = "http://192.168.99.100:8000";

export const configDB = () => {
  let config = {
    accessKeyId: AWSaccesssKeyId,
    secretAccessKey: AWSsecretAccessKey,
    region: AWSregion,
  }

  if(process.env.IS_DEV) {
    config = {
      ...config,
      endpoint: AWSendpoint,
      credentials: false,
    }
  }

  return config;
}

export const InitDB = () => {
  AWS.config.update(configDB());

  return new AWS.DynamoDB.DocumentClient();
};

const client = new AWS.DynamoDB(configDB());
export const Mapper = new DataMapper({client});

export const TB_HARA_BLOCK = process.env.TB_HARA_BLOCK ? process.env.TB_HARA_BLOCK : "hara_block_dev" ;

