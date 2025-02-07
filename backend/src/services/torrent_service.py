from fastapi import HTTPException, UploadFile, status

import shutil
import os
import time
import asyncio

from src.domain.network import create_network
from src.schemas.PDFRequest import PDFRequest

transfer_status = {}

def save_uploaded_file(file: UploadFile, first_seeder: str) -> str:
    file_path = f"nodes/{first_seeder}_uploads/{file.filename}"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return file_path

async def wait_for_previous_node(previous_node) -> None:
    while previous_node not in transfer_status or not transfer_status[previous_node]:
        await asyncio.sleep(0.1)

async def transfer_file(file: UploadFile, first_seeder: str, target_node: str, network: dict):
    global transfer_status
    graph = create_network()

    if network is None:
        error_message = {
            "current_node": first_seeder,
            "status": "CONNECTION_FAILED",
            "details": {
                "failed_node": first_seeder,
                "target_node": target_node,
                "message": "Network is not initialized."
            }
        }
        asyncio.create_task(network[first_seeder].send_to_communication_port(error_message))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Network is not initialized")

    file_path = save_uploaded_file(file, first_seeder)
    initial_crc = network[first_seeder].calculate_crc(file_path)

    torrent_path = network[first_seeder].seed_file(file_path)
    path = graph.dijkstra(first_seeder, target_node)

    if not path:
        error_message = {
            "current_node": first_seeder,
            "status": "ERROR",
            "details": {
                "message": "No valid path found."
            }
        }
        asyncio.create_task(network[first_seeder].send_to_communication_port(error_message))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid path found")

    transfer_status.clear()

    for i in range(len(path) - 1):
        sender = path[i]
        receiver = path[i + 1]

        if i > 0:
            previous_node = path[i - 1]
            await wait_for_previous_node(previous_node)

        try:
            if receiver not in network:
                raise Exception(f"Node {receiver} is unavailable.")

            handle = network[receiver].add_torrent(torrent_path)

            while not handle.status().is_seeding:
                time.sleep(1)

            receiver_file_path = f"{network[receiver].save_path}/{file.filename}"
            network[receiver].seed_file(receiver_file_path)

            received_crc_value = network[receiver].calculate_crc(receiver_file_path)
            crc_success = received_crc_value == initial_crc

            transfer_log = {
                "node": sender,
                "status": "TRANSFER_SUCCESS" if crc_success else "CRC_ERROR",
                "details": {
                    "target_node": receiver,
                    "crc_value": received_crc_value,
                    "expected_crc": initial_crc,
                    "polynomial": network[receiver].polynomial,
                    "message": "File transferred successfully." if crc_success else "CRC mismatch detected!"
                }
            }
            await network[receiver].send_to_communication_port(transfer_log)

            transfer_status[sender] = True

            if not crc_success:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"CRC mismatch at {receiver}")

        except Exception as e:
            error_message = {
                "current_node": sender,
                "status": "CONNECTION_FAILED",
                "details": {
                    "failed_node": receiver,
                    "target_node": target_node,
                    "message": str(e)
                }
            }
            await network[sender].send_to_communication_port(error_message)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Transfer failed at {receiver}: {str(e)}")

    final_node = path[-1]
    await wait_for_previous_node(path[-2])

    final_log = {
        "node": final_node,
        "status": "TRANSFER_SUCCESS",
        "details": {
            "message": "Final node received the file successfully.",
            "crc_value": initial_crc,
            "polynomial": network[final_node].polynomial
        }
    }
    await network[final_node].send_to_communication_port(final_log)

    print("File has been successfully transferred!")

def validate_pdf_request(first_seeder: str, target_node: str) -> PDFRequest:
    try:
        return PDFRequest(first_seeder=first_seeder, target_node=target_node)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )