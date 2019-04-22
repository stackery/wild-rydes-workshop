import json

import cfnresponse

def handler(event, context):
    # Log the event argument for debugging and for use in local development.
    print(json.dumps(event))

    try:
        cfnresponse.send(event, context, cfnresponse.SUCCESS, {}, 'PopulateFrontendContent')

        print('Succeeded in uploading frontend content!')
    except Exception as err:
        print(f'Failed to upload frontend content: {err}')
        cfnresponse.send(event, context, cfnresponse.FAILED, {}, 'PopulateFrontendContent')

    return {}