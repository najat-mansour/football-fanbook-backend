import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import dotenv from 'dotenv/config';

const s3 = new S3({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION
});

/**
 * @param {string} id 
 * @param {Blob} buffer 
 */
export const uploadImageToAwsS3 = async (id, buffer) => {
    const params = {
        Body: buffer,
        Bucket: 'football-fanbook-user-images',
        Key: `${id}`,
        ContentType: 'image/jpeg'
    };

    await s3.putObject(params);
};

/**
 * @param {string} id 
 */
export const deleteImageFromAwsS3 = async (id) => { 
    const params = {
        Bucket: 'football-fanbook-user-images',
        Key: `${id}`,
        ContentType: 'image/jpeg'
    };

    await s3.deleteObject(params);
};

/**
 * @param {string} id 
 */
export const getImageUrlInAwsS3 = async (id) => {
    const url = await getSignedUrl(s3, new GetObjectCommand({
        Bucket: 'football-fanbook-user-images',
        Key: `${id}`,
    }));

    return url;
};