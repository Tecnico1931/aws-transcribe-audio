'use strict'
const AWS = require('aws-sdk');
const Scribe = new AWS.TranscribeService({apiVersion: '2017-10-26'});
const pt = require('./parseTranscript.js');

exports.transcribe = async event => {
    console.log(JSON.stringify(event));

    const filepath = event.Records[0].s3.object.key;
    const directory = filepath.split('/');
    const filename = directory.pop();
    const extension = filename.split('.').pop().toLowerCase();

    const sourceBucket = event.Records[0].s3.bucket.name;
    const sourceUri = ["https://s3.amazonaws.com", sourceBucket, filepath]
        .join('/');

    const transcriptBucket = process.env.TRANSCRIPT_DESTINATION_S3BUCKET_NAME;
    const transcriptEmail = process.env.TRANSCRIPT_DESTINATION_EMAIL;
    const transcriptName = filepath
        .replace(/\//g, "...")
        .replace(/[^0-9a-zA-Z._-]+/g, "");

    //add random job number, AWS doesn't allow for matching job names.
    const getRandomInt = (ceiling) => Math.floor(Math.random() * ceiling);
    const randomizedJobName = transcriptName + '.' + getRandomInt(999999999);

    const vocab_param = {
        LanguageCode: 'en-US',
        Phrases: [],
        VocabularyName: ''
    }

    const scribe_param = {
        LanguageCode: "en-US",
        Media: {
            MediaFileUri: sourceUri,
        },
        MediaFormat: extension,
        TranscriptionJobName: randomizedJobName,
        OutputBucketName: transcriptBucket,
        Settings: {
            ShowSpeakerLabels: true,
            MaxSpeakerLabels: process.env.NUMBER_OF_SPEAKERS,
            VocabularyName: process.env.VOCABULARY_NAME
        }
    };

    console.log(JSON.stringify(scribe_param));

    return Scribe.startTranscriptionJob(scribe_param).promise()
        .then(data => {
            console.log(JSON.stringify(data));
        })
        .catch(error => {
            console.log(JSON.stringify(error));
        });
}
