import json
import mimetypes
import os

import boto3
import cfnresponse

def handler(event, context):
    # Log the event argument for debugging and for use in local development.
    print(json.dumps(event))

    try:
        upload_static_content()

        cfnresponse.send(event, context, cfnresponse.SUCCESS, {}, 'PopulateFrontendContent')

        print('Succeeded in uploading frontend content!')
    except Exception as err:
        print(f'Failed to upload frontend content: {err}')
        cfnresponse.send(event, context, cfnresponse.FAILED, {}, 'PopulateFrontendContent')

    return {}

def upload_static_content():
    session = boto3.Session()
    s3 = session.resource('s3')
    bucket = s3.Bucket(os.environ['BUCKET_NAME'])

    for subdir, _, files in os.walk('static'):
        for file in files:
            local_path = os.path.join(subdir, file)
            key = os.path.relpath(local_path, 'static')
            mimetype = mimetypes.guess_type(key)[0] or 'application/octet-stream'

            print(f'Uploading {key} as {mimetype}')

            with open(local_path, 'rb') as data:
                bucket.put_object(Key=key, Body=data, ContentType=mimetype, ACL='public-read')