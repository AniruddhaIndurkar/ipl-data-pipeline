# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
## Repository

* Download AWS CDK
* Utilise the CDK library to deploy these resources

Commands to Run:
`npm i`
`npm run build`
`npm run test`
`cdk synth`
`cdk deploy`


## Approach:

1. Initially, we have a look at the data and see the requirements
2. From initial glance, a simple Glue job could suffice to use an S3 bucket and load it into RDS
3. We have kept the difference types of files in s3 called a Source S3 bucket
4. Assuming we are building a pipeline, to mimic the real world scenario, we make use of the lambda function to 
do batch runs of the data. This is cheaper than glue if done daily.
5. For a database connection, Glue connection can be created to ingest from a database such as MySql/PostgresSQL. 
6. Next, once our lambda function is created, we move to the storing the data inside a staging bucket.
7. Usually, encryption is used to store the data in S3 bucket to avoid data breaches.
8. Once, we have the data in a uniform staging bucket. Individual datasets can be utilised once pre-processing is done.
9. This layer allows easier access for debugging and checking the datasets.
10. Next step is we create a crawler to crawl through the S3 bucket and create a database with the data catalog.
11. To load the data we use Glue transformation to transform the data. 
12. Simply make use of PySpark to perform the transformation and use Athena to query the data transformed

## Usage
1. We use AWS CDK to configure the resources to be deployed.
2. We can then utilised CodeCommit Repository to manage the code, pipelines are already provided.
3. simple cdk deploy function should suffice using the existing library to do this.

## Limitations
1. This code does not transform the datasets to Players, matches and delivery.
2. Process to do that is to analyse the schema, perform custom aggregations using PySpark. 
3. pysparkscript.py needs to be edited to achieve this. (In Progress)

## In progress
1. Design the schema,
2. Check the datasets to refine them and treat missing values.
3. Check for date formats and uniformity.
4. Schedule the resources to eliminate human intervention
5. Test and query the datasets to understand correctness.
6. Make sure to write, unit tests, integrations tests in the test folder of this repository.