
import json
import requests

with open("/home/cleo/cash-mine/cash-pay/services.json") as file:
    config = json.load(file)
    httpprovider = config['httpprovider']


import sys

def get_tx_list():
    response = requests.post(
        httpprovider,
        data=json.dumps(
            {
                "jsonrpc": "2.0",
                "id": 6,
                "method": "tx_list",
            })).json()

    return response

def get_tx_from_list(val):
    retVal = "Not Found"
    for x in get_tx_list()['result']:
        if x['txId'] == val:
          retVal = x['status_string']
          break
    print(retVal)
get_tx_from_list(str(sys.argv[1]))
