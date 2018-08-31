# Amazon Web Services (AWS) Transcribe Notification Utilities 
Automatically transcribe audio files added to an AWS S3 bucket and receive notification emails when the transcriptions are complete.

## Table of Contents

+ [Description](./README.md#description)
+ [Deployment Steps (Installation and use of software)](./README.md#deployment-steps)
  1. [Installing the AWS CLI SDK and copying the git repository](./README.md#1-installing-the-aws-cli-sdk-and-copying-the-git-repository)
  2. [Creating an IAM User](./README.md#2-creating-an-iam-user)
  3. [Creating an S3 Bucket](./README.md#3-creating-an-s3-bucket)
  4. [Collecting Account Credentials](./README.md#4-collecting-account-credentials)
  5. [Running Deployment Script](./README.md#5-running-deployment-script)
  6. [Subscribing to Email Notifications](./README.md#6-subscribing-to-email-notifications)
  7. [Cleaning/Reverting Account Changes ](./README.md#7-cleaningreverting-account-changes)
+ [Tips to Improve Performance](./README.md#tips-to-improve-performance)
+ [Tips to Monitor Functions](./README.md#tips-to-monitor-functions)

## Description
This software package is a collection of command line tools (cli methods) that create/manage roles, policies, and permissions for AWS Lambda functions. These functions may be used to easily start jobs and format results from the AWS Transcribe service. Use the "deploy" script to build the service on the specified AWS account. Use the "clean" script to remove the service from the account.

**For guidance installing/using this functionality, [please follow instructions in the "Deployment Steps" section.](./README.md#deployment-steps)**

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

# IMPORTANT: Stop git from tracking credentials file.
git rm --cached aws-transcribe-audio/credentials
```

[pip installation guide (pip)](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)

[git installation guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

[AWS CLI installation guide (MacOS)](https://docs.aws.amazon.com/cli/latest/userguide/cli-install-macos.html#awscli-install-osx-path)

[AWS CLI installation guide (Linux)](https://docs.aws.amazon.com/cli/latest/userguide/awscli-install-linux.html#awscli-install-linux-path)

[AWS CLI installation guide (Windows)](https://docs.aws.amazon.com/cli/latest/userguide/awscli-install-windows.html#awscli-install-windows-path)

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


Using the AWS CLI:
```bash
aws iam create-user --user-name scribe 
aws iam create-access-key --user-name scribe
aws iam add-user-to-group --group-name Administrator --user-name scribe
```

### 3. Creating an S3 Bucket
This bucket will be the destination for both raw and formatted transcripts created by AWS Transcribe.

1. Navigate to the S3 page in AWS Console at https://console.aws.amazon.com/s3.
2. Click on the "+ Create Bucket" button.
3. At the "Name and region" section, fill in "Bucket name" and confirm AWS Region matches the region of the S3 Bucket containing audio. Click "Next."
4. At the "Configure options" section, click "Next."
5. At the "Set permissions" section, click "Next."
6. At the "Review" section, click "Create bucket."

Using the AWS CLI:
```bash
aws s3api create-bucket --bucket "transcript.results"
```

### 4. Collecting Account Credentials
**DO NOT COMMIT CREDENTIALS TO PUBLIC SOURCE CONTROL**

We will store account credentials needed for the AWS CLI SDK in the file "credentials" located in the project's root directory. Please copy the corresponding values below into the "credentials" file.

#### AWS Credential Configuration

1. "AWS_ACCOUNT_ID": In AWS Console, click on your account name at the top right of the screen.  From the dropdown menu, select "My Account." You will be brought to the Account Dashboard, at the top of which is a 12 digit Account ID.
2. "AWS_ACCESS_KEY_ID": This ID was created with the User in Step 1 where it was called "AccessKeyId."
3. "AWS_SECRET_ACCESS_KEY": This ID was created with the User in Step 1 where it was called "SecretAccessKey."
4. "AWS_REGION": This corresponds to the region the S3 bucket created in Step 2 resides in (and the region your bucket containing audio files resides in).

#### User Configuration
1. "AUDIO_SOURCE_S3BUCKET_NAME": The name of the S3 bucket into which you are placing audio files you want transcribed.
2. "TRANSCRIPT_DESTINATION_S3BUCKET_NAME": The name of the S3 bucket created in Step 2.
3. "TRANSCRIPT_DESTINATION_EMAIL": The email to be notified when transcription jobs are completed.

### 5. Running Deployment Script
The deployment script creates a user, role, and policy for our Lambda functions before uploading the code, initializing notification events, and creating an SNS topic.

Execute by running "./deploy".  You may need to run it twice if any errors occur, AWS is weird when quickly making requests with the CLI.  I recommend those with patience to type each line of the "deploy" script into a terminal to avoid this problem.
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

## Tips to Improve Performance
### Add words to your custom vocabulary list.
AWS Transcribe supports the creation of a "Custom Vocabulary," which trains the transcription service to better recognize listed words.  Fill the text file "phrase_list.txt" with words you would like the service to recognize, and the vocabulary will be created when the "deploy" script is run.  Update the vocabulary list by running the "updateTranscribeVocabulary" function in "climethods."

### Identify the number of speakers in the audio file.
By specifying the exact number of speakers in an audio clip, AWS Transcribe is better able to label the different speakers.  In the "credentials" file, there is an environment variable called "NUMBER_OF_SPEAKERS" where you can specify this value (The maximum value allowed for the variable is 10).

### Edit audio files to remove superfluous noise/speaking.
Cut audio files you would like to transcribe down to the desired sections. Remove unnecessary audio, such as music, introductory segments, and commercials.  This will help AWS Transcribe identify speakers more easily, and improve the quality of the transcription.

### Implement a spelling corrector.
AWS Transcribe prioritizes pronunciation over spelling. Implement a spelling corrector, or train a natural language processing (NLP) algorithm to correct word spelling and grammar.  There is an interface in the "parseTranscript.js" file to implement this.  The "parseTranscriptJson" function returns a list of words uttered by each speaker in a simple format that can be corrected before being passed to the "stringifyTranscriptObject" which produces the final transcript.

## Tips to Monitor Functions
#### Add cloudwatch alarms for billing and enable logging.
CloudWatch has tools to monitor billing and resource usage. In the console, specify an S3 bucket to store your logs. You can also set up "Rules" that will trigger every time an AWS Transcribe job finishes, allowing you closer usage monitoring.
  + [Link to monitoring charges](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/monitor-charges.html)
  + [AWS Transcribe pricing](https://aws.amazon.com/transcribe/pricing/)
  + [Monitor Amazon Transcribe applications with AWS CloudTrail and CloudWatch Events](https://aws.amazon.com/blogs/machine-learning/monitor-amazon-transcribe-applications-with-aws-cloudtrail-and-amazon-cloudwatch-events/)

#### Use functions in climethods to monitor AWS Transcribe status.
There are several functions in climethods to get the current state of your AWS Transcribe jobs. They leverage the AWS CLI commands below.

List All Transcription Jobs
```bash
aws transcribe list-transcription-jobs
```

List Running Transcription Jobs
```bash
aws transcribe list-transcription-jobs --status "IN_PROGRESS"
```

List Lambda Functions
```
aws lambda list-functions
```

### Don't add credentials to public source control!
