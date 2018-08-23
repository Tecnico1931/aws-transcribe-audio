# Amazon Web Services (AWS) Transcribe Notification Utilities 
Automatically transcribe audio files added to an AWS S3 bucket and receive notification emails when the transcriptions are complete.

## Table of Contents

+ [Description](./README.md#description)
+ [Deployment Steps (Installation and use of software)](./README.md#deployment-steps)
  0. [Clone Repository](./README.md#)
  0. [Installing the AWS CLI SDK](./README.md#)
  1. [Creating an IAM User](./README.md#)
  2. [Creating an S3 Bucket](./README.md#)
  3. [Collecting Account Credentials](./README.md#)
  4. [Running Deployment Script](./README.md#)
  5. [Subscribing to Email Notificaitons](./README.md#)
  6. [Cleaning/Reverting Account Changes ](./README.md#)
+ [Tips to Monitor Functions](./README.md#tips-to-monitor-functions)
+ [Documentation for Repository Files](./README.md#documentation-for-repository-files)
  + [credentials](./README.md#credentials)
  + [climethods](./README.md#climethods)
  + [build](./README.md#build)
  + [clean ](./README.md#clean)
  + [transcribeAudio.js](./README.md#transcribeaudiojs)
  + [extractTranscript.js](./README.md#extracttranscriptjs)
  + [policies/](./README.md#policies)

## Description
This software package is a collection of command line tools (cli methods) that create/manage roles, policies, and permissions for AWS Lambda functions. These functions may be used to easily start and format results from the AWS Transcribe service. Use the "deploy" script to build the service on the specified AWS account. Use the "clean" script to remove the service from the account.

For guidance installing/using this functionality, [please follow the instructions in the "Deployment Steps" section.](./README.md#deployment-steps)

The "transcribeAudio" function initiates the AWS Transcribe service whenever an audio file (mp3, mp4, wav, flac) is added to a user-specified S3 bucket.  AWS Transcribe then places the resulting transcription as a JSON in a user-created S3 bucket.  The "extractTranscript" function responds to this JSON file event, creating a formatted transcript and notifying a specified user by email.

```
        S3          ->          Lambda              ->          Transcribe      ->          S3          ->      Lambda          ->          SNS/S3
"upload audio file" ->  "start transcription job"   -> "transcribe audio file"  ->  "save JSON report"  ->  "format transcript" -> "broadcast formatted transcript"
```

## Deployment Steps
These deployment steps install AWS's command line interface, specify permissions for accessing Amazon services, and create functions and notifications.

### 0. Cloning Repository

### 0. Installing the AWS CLI SDK
**Quick Install:** (requires "pip", a Python package manager)
```bash
pip install awscli --upgrade --user
```

**Installation Guide (pip):** https://docs.aws.amazon.com/cli/latest/userguide/installing.html

**Installation Guide (MacOS):** https://docs.aws.amazon.com/cli/latest/userguide/cli-install-macos.html#awscli-install-osx-path

**Installation Guide (Linux):** https://docs.aws.amazon.com/cli/latest/userguide/awscli-install-linux.html#awscli-install-linux-path

**Installation Guide (Windows):** https://docs.aws.amazon.com/cli/latest/userguide/awscli-install-windows.html#awscli-install-windows-path

### 1. Creating an IAM User
This user will manage our use of AWS Services.

1. Navigate to the IAM page in AWS Console: https://console.aws.amazon.com/iam/
2. Click the "Add user" button.
3. Fill in "User name" with "scribe" and check the box enabling "Programmatic access"
4. Click the "Next: permissions" button.
5. Add user to AdministratorAccessGroup by checking its box.
6. Click the "Next: review" button. Review your permissions to make sure the user can access S3, Lambda, Transcribe, SNS, and CloudWatch.
7. Click the "Create user" button. You will be brought to the Success page.
8. BE SURE TO RECORD THE ACCESS KEY ID AND SECRET ACCESS KEY PROVIDED ON THIS PAGE. Download the .csv containing the credentials or retrieve and write down the credentials listed at the bottom on the Success page.


To perform these steps programmatically and with stricter permissions, see below.
```bash
aws iam create-user --user-name scribe 
aws iam create-access-key --user-name scribe
aws iam create-group --group-name ScribeGroup
aws iam create-policy --policy-name "ScribePolicy" --policy-document "file://policies/transcribeAudioPolicy.json"
aws iam attach-group-policy --group-name ScribeGroup --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/ScribePolicy"
aws iam add-user-to-group --group-name ScribeGroup --user-name scribe
```

### 2. Creating an S3 Bucket
This bucket will be the destination for both raw and formatted transcripts created by AWS Transcribe.

1. 

### 3. Collecting Account Credentials
### 4. Running Deployment Script
### 5. Subscribing to Email Notifications
### 6. Cleaning/Reverting Account Changes

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
