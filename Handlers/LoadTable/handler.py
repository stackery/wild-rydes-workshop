'''Update with location of backend'''

import json
import logging
import os

import boto3
import cfn_resource

log_level = os.environ.get('LOG_LEVEL', 'INFO')
logging.root.setLevel(logging.getLevelName(log_level))  # type: ignore
_logger = logging.getLogger(__name__)

INITIAL_TABLE_DATA = os.environ.get('INITIAL_TABLE_DATA')
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE')

DDB = boto3.resource('dynamodb')
DDT = DDB.Table(DYNAMODB_TABLE)

handler = cfn_resource.Resource()


def _get_properties_from_event(event):
    '''Return ResourceProperties from event.'''
    return event.get('ResourceProperties')


def _load_table_from_file(filename, ddb_table):
    '''Load a table from a file'''
    with open(filename) as f:
        unicorns = json.load(f)
        for u in unicorns:
            resp = DDT.put_item(
                TableName=DYNAMODB_TABLE,
                Item=u
            )
            _logger.debug('_record_ride({}) -> {}'.format(u, resp))


@handler.create
def create(event, context):
    '''Create'''
    properties = _get_properties_from_event(event)
    _logger.info('Create event: {}'.format(json.dumps(event)))
    _load_table_from_file(INITIAL_TABLE_DATA, DYNAMODB_TABLE)

    # NOTE: The log stream name is what I've seen most commonly sent back in
    # examples. However, due to a race condition with IAM permission
    # propagation, it is possible that the function lacks the permissions to
    # write to CloudWatch and therefore the context.log_stream_name will be
    # None. for that reason, there's a fallback value below.
    resp = {
        "ResourceProperties": properties,
        "PhysicalResourceId": context.log_stream_name or event.get("RequestId")
    }

    _logger.info('Response: {}'.format(json.dumps(resp)))
    return resp

