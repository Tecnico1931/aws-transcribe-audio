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
    const processed_on = filename.replace(/.json/ig, "").split('_').pop()
    const processed_file = filename.replace(/_[^_]*(?![^_]*_)/ig, "");
    console.log(processed_on);
    console.log(processed_file);

    S3.getObject({
        Bucket: bucket,
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
                    <h1>Transcript for ${processed_file}</h1>
                    <p>${transcript}</p>
                    <p>
                        <div>Processed on: ${processed_on}</div>
                        <div>Path to transcript JSON: ${filepath}</div>
                        <div>Path to transcript text: </div>
                        <div>Path to transcript HTML: </div>
                    </p>
                </body>
            </html>
        `;

        S3.putObject({
            Body: transcript,
            Bucket: process.env.TRANSCRIPT_DESTINATION_S3BUCKET_NAME,
            Key: `transcripts/${shortname}.txt`,
            ContentType: 'text/plain'
        });

        S3.putObject({
            Body: html,
            Bucket: process.env.TRANSCRIPT_DESTINATION_S3BUCKET_NAME,
            Key: `transcripts/${shortname}.html`,
            ContentType: 'text/html'
        });

        SNS.publish({
            Subject: `Scribe completed: ${shortname}`,
            Message: html,
            TopicArn: process.env.SNS_TOPIC_ARN
        });
    })
    .catch(error => {
        console.log(error);
    });
}
