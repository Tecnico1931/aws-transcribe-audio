'use strict'
const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const SNS = new AWS.SNS({apiVersion: '2010-12-01'});

exports.parseJSON = function (event) {
    console.log(JSON.stringify(event));

    const filepath = event.Records[0].s3.object.key;
    const directory = filepath.split('/');
    const filename = directory.pop();
    let shortname = filename.split('.');
    const extension = shortname.pop().toLowerCase();
    shortname = shortname.join('');
    const bucket = event.Records[0].s3.bucket.name;
    const processed_on = filename.replace(/.json$/ig, "").split('_').pop()
    const processed_file = filename.replace(/_[^_]*(?![^_]*_)/ig, "");

    const destination_bucket = process.env.TRANSCRIPT_DESTINATION_S3BUCKET_NAME;
    const destination_bucket_url = `s3.console.aws.amazon.com/s3/buckets/${destination_bucket}`;
    const textfilepath = `transcripts/${shortname}.txt`;

    S3.getObject({
        Bucket: destination_bucket,
        Key: filepath,
        ResponseContentType: 'application/json'
    }).promise()
    .then(response => {
        const report = JSON.parse(response.Body.toString());
        const transcript = report.results.transcripts[0].transcript;
        const text = `Transcript for ${processed_file}

Processed on: ${processed_on}
S3 bucket containing transcription results: ${destination_bucket}
Link to bucket: ${destination_bucket_url}
Path to JSON: ${filepath}
Path to text: ${textfilepath}

${transcript}`;

        S3.putObject({
            Body: transcript,
            Bucket: destination_bucket,
            Key: `transcripts/${shortname}.txt`,
            ContentType: 'text/plain'
        }).promise()
            .then(response => console.log(JSON.stringify(response)))
            .catch(error => console.log(JSON.stringify(error)));

        SNS.publish({
            Subject: `Scribe completed: ${shortname}`,
            Message: text,
            TopicArn: process.env.SNS_TOPIC_ARN
        }).promise()
            .then(response => console.log(JSON.stringify(response)))
            .catch(error => console.log(JSON.stringify(error)));
    })
    .catch(error => {
        console.log(error);
    });
}
