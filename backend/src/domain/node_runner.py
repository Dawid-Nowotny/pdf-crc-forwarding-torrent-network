import asyncio

import sys
import argparse

from CommunicationWebSocket import CommunicationWebSocket

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("name", type=str)
    parser.add_argument("port", type=int)
    return parser.parse_args()

async def run_node() -> None:
    args = parse_args()

    communication_ws = CommunicationWebSocket(port=args.port)
    await communication_ws.start_server()
    return

if __name__ == "__main__":
    node_name = sys.argv[1]
    port = int(sys.argv[2])
    asyncio.run(run_node())