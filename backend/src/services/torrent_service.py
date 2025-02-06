from fastapi import HTTPException, UploadFile, status

import shutil
import os
import time

from src.domain.network import create_network
from src.schemas.PDFRequest import PDFRequest

def save_uploaded_file(file: UploadFile, first_seeder: str) -> str:
    file_path = f"nodes/{first_seeder}_uploads/{file.filename}"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return file_path

async def transfer_file(file, first_seeder: str, target_node: str, network: dict):
    graph = create_network()

    if network is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Network is not initialized")

    if first_seeder not in network or target_node not in network:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid nodes")

    file_path = save_uploaded_file(file, first_seeder)

    initial_crc = network[first_seeder].calculate_crc(file_path)
    print(f"CRC calculated by {first_seeder}: {initial_crc}")

    torrent_path = network[first_seeder].seed_file(file_path)

    path = graph.dijkstra(first_seeder, target_node)
    if not path:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid path found")

    for node in path[1:]:
        handle = network[node].add_torrent(torrent_path)

        while not handle.status().is_seeding:
            time.sleep(1)

        node_file_path = f"{network[node].save_path}/{file.filename}"
        network[node].seed_file(node_file_path)

        node_crc = network[node].calculate_crc(node_file_path)
        print(f"CRC at {node}: {node_crc}")

        if node_crc != initial_crc:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"CRC mismatch at {node}")

    print("File has been successfully transferred!")

def validate_pdf_request(first_seeder: str, target_node: str) -> PDFRequest:
    try:
        return PDFRequest(first_seeder=first_seeder, target_node=target_node)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )