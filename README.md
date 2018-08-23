# Amazon Web Services (AWS) Transcription Notification Software
Automatically transcribe audio files added to an AWS S3 bucket and receive notification emails when the transcriptions are complete.

## Table of Contents:

+ Description
+ Deployment Steps (Installation and use of software)
  1. Creating an IAM User
  2. Creating an S3 Bucket
  3. Collecting Account Credentials
  4. Running Deployment Script
  5. Cleaning/Reverting Account Changes 
+ Tips to Monitor Functions
+ Documentation for Repository Files
  + credentials
  + climenthods
  + build
  + clean 
  + policies
  + transcribeAudio.js
  + extractTranscript.js

## Description
This software package is a collection of command line tools (cli tools) that create/manage roles, policies, and permissions for AWS Lambda functions. These functions may be used to easily start and format results from the AWS Transcribe service.  

In order to install/use this functionality, [please follow the instructions in the "Deployment Steps" section.](./README.md#deployment-steps)

The "transcribeAudio" function initiates the AWS Transcribe service whenever an audio file (mp3, mp4, wav, flac) is added to a user-specified S3 bucket.  AWS Transcribe then places the resulting transcription as a JSON in a user-created S3 bucket.  The "extractTranscript" function responds to this JSON file event, creating a formatted trascript and notifying a specified user by email.

        S3          ->          Lambda              ->          Transcribe      ->          S3          ->      Lambda          ->          SNS/S3
"upload audio file" ->  "start transcription job"   -> "transcribe audio file"  ->  "save JSON report"  ->  "format transcript" -> "broadcast formatted transcript"

## Deployment Steps (Installation and use of software)
## Tips to Monitor Functions
## Documentation for Repository Files
