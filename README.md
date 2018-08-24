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
These deployment steps install AWS's command line interface, create AWS assets, and specify permissions for accessing Amazon services.

### 1. Installing the AWS CLI SDK and copying the git repository.
**Quick Install:** (requires "pip", a Python package manager)
```bash
pip install awscli --upgrade --user
```

To copy the project files, clone this git respository.
```bash
git clone https://github.com/couetilc/aws-transcribe-audio.git
```

**Installation Guide (pip):** https://docs.aws.amazon.com/cli/latest/userguide/installing.html

**Installation Guide (MacOS):** https://docs.aws.amazon.com/cli/latest/userguide/cli-install-macos.html#awscli-install-osx-path

**Installation Guide (Linux):** https://docs.aws.amazon.com/cli/latest/userguide/awscli-install-linux.html#awscli-install-linux-path

**Installation Guide (Windows):** https://docs.aws.amazon.com/cli/latest/userguide/awscli-install-windows.html#awscli-install-windows-path

**Installation Guide (git):** https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

### 2. Creating an IAM User
This user will manage our use of AWS Services.

1. Navigate to the IAM page in AWS Console: https://console.aws.amazon.com/iam/
2. Click the "Add user" button.
3. Fill in "User name" with "scribe" and check the box enabling "Programmatic access"
4. Click the "Next: permissions" button.
5. Add user to AdministratorAccessGroup by checking its box.
6. Click the "Next: review" button. Review your permissions to make sure the user can access S3, Lambda, Transcribe, SNS, and CloudWatch.
7. Click the "Create user" button. You will be brought to the Success page.
8. BE SURE TO RECORD THE ACCESS KEY ID AND SECRET ACCESS KEY PROVIDED ON THIS PAGE. Download the .csv containing the credentials or retrieve and write down the credentials listed at the bottom on the Success page.


Using the AWS CLI (and opting for stricter permissions):
```bash
aws iam create-user --user-name scribe 
aws iam create-access-key --user-name scribe
aws iam create-group --group-name ScribeGroup
aws iam create-policy --policy-name "ScribePolicy" --policy-document "file://policies/transcribeAudioPolicy.json"
aws iam attach-group-policy --group-name ScribeGroup --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/ScribePolicy"
aws iam add-user-to-group --group-name ScribeGroup --user-name scribe
```

### 3. Creating an S3 Bucket
This bucket will be the destination for both raw and formatted transcripts created by AWS Transcribe.

1. Navigate to the S3 page in AWS Console at https://console.aws.amazon.com/s3.
2. Click on the "+ Create Bucket" button.
3. At the "Name and region" section, fill in "Bucket name" and confirm AWS Region. Click "Next."
4. At the "Configure options" section, click "Next."
5. At the "Set permissions" section, click "Next."
6. At the "Review" section, click "Create bucket."

Using the AWS CLI:
```bash
aws s3api create-bucket --bucket "transcript.results"
```

### 4. Collecting Account Credentials
**DO NOT COMMIT CREDENTIALS TO PUBLIC SOURCE CONTROL**

We will store account credentials needed for the AWS CLI SDK in the file "credentials" located in the projects root directory. Please copy the corresponding values below into the "credentials" file.

#### AWS Credential Configuration

1. "AWS_ACCOUNT_ID": In AWS Console, click on your account name at the top right of the screen.  From the dropdown menu, select "My Account." You will be brought to the Account Dashboard, at the top of which is a 12 digit Account ID.
2. "AWS_ACCESS_KEY_ID": This ID was created with the User in Step 1 where it was called "AccessKeyId."
3. "AWS_SECRET_ACCESS_KEY": This ID was created with the User in Step 1 where it was called "SecretAccessKey."
4. "AWS_REGION": This corresponds to the region the S3 bucket created in Step 2 resides in.

#### User Configuration
1. "AUDIO_SOURCE_S3BUCKET_NAME": The name of the S3 bucket into which you are placing audio files you want transcribed.
2. "TRANSCRIPT_DESTINATION_S3BUCKET_NAME": The name of the S3 bucket created in Step 2.
3. "TRANSCRIPT_DESTINATION_EMAIL": The email to be notified when transcription jobs are completed.

### 5. Running Deployment Script
The deployment script creates a user, role, and policy for our Lambda functions before uploading the code, initializing notification events, and creating an SNS topic.

Execute by running "./deploy".  You may need to run it twice if any errors occur, AWS is weird when you quickly make CLI requests.  I recommend those with patience to type each line of the "deploy" script into a terminal to avoid this problem.
```bash
./deploy
```

### 6. Subscribing to Email Notifications

The email address "TRANSCRIPT_DESTINATION_EMAIL" has been sent a subscription notification. Please confirm your subscription to the SNS topic created in the "deploy" script.

### 7. Cleaning/Reverting Account Changes

Running the "clean" script will remove users, roles, policies, Lambda functions, and SNS topics generated by the "deploy" script. This will not remove the user made in Step 1, or the S3 bucket made in Step 2.
```bash
./clean
```

## Tips to Monitor Functions
+ Add cloudwatch alarms for billing.
refer to https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/monitor-charges.html for monitoring charges.
refer to https://aws.amazon.com/transcribe/pricing/ for AWS Transcribe priing.
refer to https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/logging-using-cloudtrail.html for creating trails.
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
