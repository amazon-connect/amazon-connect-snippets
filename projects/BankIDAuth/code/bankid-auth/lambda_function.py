import time
import logging
from bankid import BankIDJSONClient

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# NOTE: This sample code is for testing and development only.
# It is STRONGLY recommended that this code is used as reference and proof of value.
client = BankIDJSONClient(certificates=('cert.pem', 'key.pem'), test_server=True)


def lambda_handler(event, context):
    logger.info(event)
    params = event['Details']['Parameters']
    personnummer = params['personnummer']
    order_ref = params.get('orderRef')

    if not order_ref:
        logger.info('No order reference. Initialising a new authentication order.')
        auth = client.authenticate(
            # end_user_ip is a required parameter and must be valid.
            # The location associated with the IP doesn't matter,
            # so long as any valid ip is passed, the call will work.
            # As the customer is calling and we have no access to their IP
            # a dummy IP is recommended for testing.
            end_user_ip='194.168.2.25',
            personal_number=personnummer
        )

        # This order reference is used for repeat invocations of this function
        order_ref = auth['orderRef']
        logger.info({ 'order_ref': order_ref })

    # Lambda Invocations via Amazon Connect have a maximum timeout of 8s
    # This code implements a polling method to check the auth process
    # If the caller fails to authenticate within this 6s cycle, the contact
    # flow will loop another invocation with lambda to re-start polling.
    # The number of loops before terminiating the call is dependant on
    # the contact flow configuration.
    logger.info('Looping: checking status of authentication order.')
    for i in range(0, 6):
        status = status_collect(order_ref)
        logger.debug(status)

        if status['status'] == 'complete':
            logger.info('Status is complete.')
            return {
                'status': status['status'],
                'givenName': status['completionData']['user']['givenName'],
                'orderRef': order_ref
            }

    logger.info('Status is still pending.')
    return {
        'status': status['status'],
        'orderRef': order_ref
    }


def status_collect(order_ref):
    time.sleep(1)
    return client.collect(order_ref=order_ref)
