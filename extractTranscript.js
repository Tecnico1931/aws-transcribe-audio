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
    const htmlfilepath = `transcripts/${shortname}.html`;

    S3.getObject({
        Bucket: destination_bucket,
        Key: filepath,
        ResponseContentType: 'application/json'
    }).promise()
    .then(response => {
        const report = JSON.parse(response.Body.toString());
        const transcript = report.results.transcripts[0].transcript;
        const html = `
            <!DOCTYPE html>
            <html>
                <body>
                    <h1>Transcript for <span style="text-decoration:underline">${processed_file}</span></h1>
                    <p><em>Processed on: ${processed_on}</em></p>
                    <p>
                        <div><strong><a href="${destination_bucket_url}">S3 bucket containing transcription results: ${destination_bucket} (Link to bucket)</a></strong></div>
                        <div><strong>Path to JSON:</strong> ${filepath}</div>
                        <div><strong>Path to text:</strong> ${textfilepath}</div>
                        <div><strong>Path to HTML:</strong> ${htmlfilepath}</div>
                    </p>
                    <p>${transcript}</p>
                </body>
            </html>
        `;

        S3.putObject({
            Body: transcript,
            Bucket: destination_bucket,
            Key: `transcripts/${shortname}.txt`,
            ContentType: 'text/plain'
        }).promise()
            .then(response => console.log(JSON.stringify(response)))
            .catch(error => console.log(JSON.stringify(error)));

        S3.putObject({
            Body: html,
            Bucket: destination_bucket,
            Key: `transcripts/${shortname}.html`,
            ContentType: 'text/html'
        }).promise()
            .then(response => console.log(JSON.stringify(response)))
            .catch(error => console.log(JSON.stringify(error)));

        SNS.publish({
            Subject: `Scribe completed: ${shortname}`,
            Message: html,
            TopicArn: process.env.SNS_TOPIC_ARN
        }).promise()
            .then(response => console.log(JSON.stringify(response)))
            .catch(error => console.log(JSON.stringify(error)));
    })
    .catch(error => {
        console.log(error);
    });
}
