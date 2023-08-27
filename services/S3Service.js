const AWS = require('aws-sdk');
exports.uploadToS3 = async (fileDetail, fileName, fileType) => {
    try {
        console.log(fileType);
        const bucketName = process.env.BUCKET_NAME;
        const userKey = process.env.IAM_USER_KEY;
        const userSecretKey = process.env.IAM_USER_SECRET_KEY;

        let s3Bucket = new AWS.S3({
            region: 'us-east-1',
            accessKeyId: userKey,
            secretAccessKey: userSecretKey
        });

        var params = {
            Bucket: bucketName,
            Key: fileName,
            Body: fileDetail,
            ACL: 'public-read',
            ContentType: fileType
        };

        return new Promise((resolve, reject) => {
            s3Bucket.upload(params, (err, s3Response) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(s3Response.Location);
                }
            })
        })
    }
    catch (err) {
        console.log(err);
    }
}