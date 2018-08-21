'use strict';
const AWS = require('aws-sdk');
const Scribe = new AWS.TranscribeService({apiVersion: '2017-10-26'});

module.exports.transcribe = async event => {
    console.log(JSON.stringify(event));

    const audioFilepath = event.Records[0].s3.object.key;
    const audioFilename = audioFilepath.split('/').pop();
    const audioExtension = audioFilename.split('.').pop().toLowerCase();
    const audioBucket = event.Records[0].s3.bucket.name;
    const audioURI = ["https://s3.amazonaws.com", audioBucket, audioFilepath]
        .join('/');

    const transcriptBucket = process.env.TRANSCRIPT_DESTINATION_S3BUCKET_NAME;
    const transcriptEmail = process.env.TRANSCRIPT_DESTINATION_EMAIL;
    const date = new Date();
    const transcriptName = [audioFilepath, date.toJSON()]
        .join("_")
        .replace(/[^0-9a-zA-Z._-]+/g, "-");

    const jobParam = {
        LanguageCode: "en-US",
        Media: {
            MediaFileUri: audioURI,
        },
        MediaFormat: audioExtension,
        TranscriptionJobName: transcriptName,
        OutputBucketName: transcriptBucket,
        Settings: {
            ShowSpeakerLabels: true,
            MaxSpeakerLabels: 5
        }
    };

    console.log(JSON.stringify(jobParam));

    return Scribe.startTranscriptionJob(jobParam).promise()
        .then(data => {
            console.log(JSON.stringify(data));
        })
        .catch(err => {
            console.log(JSON.stringify(err));
        });
}
