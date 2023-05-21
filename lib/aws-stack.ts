import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as glue from 'aws-cdk-lib/aws-glue';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';


// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    //1. Create a S3 Bucket to store the Datas
    const sourceBucket = new s3.Bucket(this, "S3AnotherBucket", {
      bucketName: "source-bucket-440022-7588-aniruddha",
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    //2. Create a Staging bucket to store the pre-processed data
    const stagingBucket = new s3.Bucket(this, "S3OtherBucket", {
      bucketName: "staging-bucket-440022-7588-aniruddha",
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    //3. Create a Lambda function to run from S3 to staging S3 data
    const lambdaRole = new iam.Role(this, 'lambdaRole',{
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),

    })

    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['*'],
      resources: ['*']
    }))

    const lambdaFunction = new lambda.Function(this,'lambda',{
      handler: 'lambda_handler',
      runtime :lambda.Runtime.PYTHON_3_10,
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/lambda')), 
      role : lambdaRole
    })

    //4. Create an IAM role to run the Lambda function
    const adminRole = new iam.Role(this, "AdminRole", {
      assumedBy: new iam.ServicePrincipal('sns.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });

    //5. Create a Glue Crawler
    const glueRole = new iam.Role(this, "GlueRole", {
      assumedBy: new iam.ServicePrincipal('sns.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });

    //6. Crawler to crawl through the database to create tables
    // Create a new IAM role for the Glue crawler.
    const crawlerRole = new iam.Role(this, "CrawlerRole", {
      assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
     
    });

   crawlerRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"));
    const glueCrawler = new glue.CfnCrawler(this, "GlueCrawler", {
      name: "AWSCrawler",
      role: crawlerRole.roleArn,
      targets: {
        s3Targets:[
          {
            path:"s3://staging-bucket-orka-data",
            exclusions: []
          }
        ] 
      },
      databaseName: "my-database"

    });

    //7. Create a Glue job to do that
    const glueJob = new glue.CfnJob(this, 'PythonSparkStreamingJob', {
        role: glueRole.roleArn,
        command: {
          name: 'Tempname',
          scriptLocation: 'src/pysparkscript.py',
        },
        workerType: 'G.1X',
        numberOfWorkers: 2,


    });

    




  }
}
