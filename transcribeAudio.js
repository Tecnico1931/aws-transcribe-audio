const AWS = require('aws-sdk');
const Scribe = new AWS.TranscribeService({apiVersion: '2017-10-26'});

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

    const param = {
        LanguageCode: "en-US",
        Media: {
            MediaFileUri: sourceUri,
        },
        MediaFormat: extension,
        TranscriptionJobName: transcriptName,
        OutputBucketName: transcriptBucket,
        Settings: {
            ShowSpeakerLabels: false
        }
    };

    console.log(JSON.stringify(param));

    return Scribe.startTranscriptionJob(param).promise()
        .then(data => {
            console.log(JSON.stringify(data));
        })
        .catch(error => {
            console.log(JSON.stringify(error));
        });
}
