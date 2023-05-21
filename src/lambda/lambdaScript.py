import boto3
import json
import awswrangler as wr
import sqlite3 as sl
import shutil



def lambda_handler(event, context):
    
    
    ## Reading the players data and converting it to dataframe
    players = wr.s3.read_csv(
    path="s3://source-bucket-orka-data-challenge/Players_info.csv",
    )

    #df = pd.read_csv("s3://source-bucket-orka-data-challenge/Players_info.csv")
    print(players.head())
    
    ## Reading the matches data
    matches = wr.s3.read_json(
    path="s3://source-bucket-orka-data-challenge/matches.json",
    )
    
    print(matches.head())
    bucket = 'source-bucket-orka-data-challenge'
    key = 'IPL_Deliveries.sqlite'
    
    s3 = boto3.client('s3')
    temp_file_path = '/tmp/IPL_Deliveries.txt'

    # Download the file from S3 to the temporary folder
    s3.download_file(bucket, key, temp_file_path)
    
    connection = sl.connect(temp_file_path)

    cursor = connection.cursor()
    
    cursor.execute("select * from deliveries")
    query = "select * from deliveries"
    result = cursor.fetchall()
    
    cursor.execute(f"PRAGMA table_info(deliveries)")
    columns = cursor.fetchall()
    
    column_names = [column[1] for column in columns]
   
    print(columns)
    df = wr.pandas.read_sql_query(query, connection)
    connection.close()
    print(df)
    
    # Create a bucket for the staging data
    bucket = "staging-bucket-orka-data"

    wr.s3.to_csv(players,path= "s3://staging-bucket-orka-data/players.csv",sep=",", index=False)

    # Save the matches DataFrame to a JSON file in the staging bucket
    wr.s3.to_csv(matches, path ="s3://staging-bucket-orka-data/matches.csv",sep=",", index=False)
    
    # Save the df DataFrame to a CSV file in the staging bucket
    wr.s3.to_csv(df,path="s3://staging-bucket-orka-data/delivery.csv",sep=",", index=False)
        
    return {
        'statusCode': 200,
        'body': json.dumps('Data loaded successfully')
    }
    