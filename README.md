# Amazon Web Services (AWS) Transcribe Notification Utilities 
Automatically transcribe audio files added to an AWS S3 bucket and receive notification emails when the transcriptions are complete.

## Table of Contents

+ [Description](./README.md#description)
+ [Deployment Steps (Installation and use of software)](./README.md#deployment-steps)
  1. [Creating an IAM User](./README.md#)
  2. [Creating an S3 Bucket](./README.md#)
  3. [Collecting Account Credentials](./README.md#)
  4. [Running Deployment Script](./README.md#)
  5. [Subscribing to Email Notificaitons](./README.md#)
  6. [Cleaning/Reverting Account Changes ](./README.md#)
+ [Tips to Monitor Functions](./README.md#tips-to-monitor-functions)
+ [Documentation for Repository Files](./README.md#documentation-for-repository-files)
  + [credentials](./README.md#)
  + [climenthods](./README.md#)
  + [build](./README.md#)
  + [clean ](./README.md#)
  + [transcribeAudio.js](./README.md#)
  + [extractTranscript.js](./README.md#)
  + [policies/](./README.md#)

## Description
This software package is a collection of command line tools (cli methods) that create/manage roles, policies, and permissions for AWS Lambda functions. These functions may be used to easily start and format results from the AWS Transcribe service. Use the "deploy" script to build the service on the specified AWS account. Use the "clean" script to remove the service from the account.

For guidance installing/using this functionality, [please follow the instructions in the "Deployment Steps" section.](./README.md#deployment-steps)

The "transcribeAudio" function initiates the AWS Transcribe service whenever an audio file (mp3, mp4, wav, flac) is added to a user-specified S3 bucket.  AWS Transcribe then places the resulting transcription as a JSON in a user-created S3 bucket.  The "extractTranscript" function responds to this JSON file event, creating a formatted transcript and notifying a specified user by email.

```
        S3          ->          Lambda              ->          Transcribe      ->          S3          ->      Lambda          ->          SNS/S3
"upload audio file" ->  "start transcription job"   -> "transcribe audio file"  ->  "save JSON report"  ->  "format transcript" -> "broadcast formatted transcript"
```

## Deployment Steps
### Creating an S3 Bucket
### Collecting Account Credentials
### Running Deployment Script
### Subscribing to Email Notifications
### Cleaning/Reverting Account Changes
## Tips to Monitor Functions
+ Add cloudwatch alarms for billing.
+ Use checktranscriptionjob funcitons in climethods to monitor AWS Transcribe status.
+ Update Lambda functions with update functions in climethods
+ Don't add credentials to public source control
## Documentation for Repository Files
### credentials
### climethods
### deploy
### clean
### transcribeAudio.js
### extractTranscript.js
### policies/
