'use strict'
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

exports.parseJSON = function (event) {
    console.log(JSON.stringify(event));

    const filepath = event.Records[0].s3.object.key;
    const directory = filepath.split('/');
    const filename = directory.pop();
    const extension = filename.split('.').pop().toLowerCase();
    const bucket = event.Records[0].s3.bucket.name;

    S3.getObject({
        Bucket: bucket,
        Key: filepath
    }).promise()
    .then(data => {
        console.log(data);
        //grab transcript
        //store as text/html object in s3
        //email
    })
    .catch(error => {
        console.log(error);
    });
}
