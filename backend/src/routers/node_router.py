from fastapi import APIRouter, UploadFile, Form, status, HTTPException

from src.services.torrent_service import validate_pdf_request
from src.services.pdf_service import validate_pdf
from src.services.node_service import start_communication_websocket, close_communication_websocket
from src.services.torrent_service import transfer_file
from src.domain.TorrentNode import TorrentNode
from src.schemas.polynomial_request import PolynomialRequest
from src.schemas.faulty_polynomial_request import FaultyPolynomialRequest
from src.constants import NODE_PORTS

router = APIRouter()

torrent_admin = None
network = None

@router.post("/start-torrents", status_code=status.HTTP_204_NO_CONTENT)
async def start_websockets(polynomial: PolynomialRequest):
    global network 
    network = {node: TorrentNode(node, polynomial.polynomial) for node in NODE_PORTS.keys()}
    start_communication_websocket()

@router.post("/start-torrents-with-fault", status_code=status.HTTP_204_NO_CONTENT)
async def start_torrents_with_fault(
    request: FaultyPolynomialRequest,
):
    global network
    network = {}

    for node, port in NODE_PORTS.items():
        if request.faulty_node == node and request.faulty_polynomial:
            network[node] = TorrentNode(node, request.faulty_polynomial)
        else:
            network[node] = TorrentNode(node, request.polynomial)

    start_communication_websocket()

@router.delete("/stop-torrents", status_code=status.HTTP_204_NO_CONTENT)
def stop_websockets():
    global network
    for node in network.values():
        node.shutdown()

    network = {}
    close_communication_websocket()

@router.post("/send-pdf", status_code=status.HTTP_204_NO_CONTENT)
async def send_pdf_to_node(
    file: UploadFile,
    first_seeder: str = Form(...),
    target_node: str = Form(...),
    faulty_node: str = Form(None)
):
    global network

    node_request = validate_pdf_request(first_seeder, target_node)
    await validate_pdf(file)

    file.file.seek(0)

    try:
        await transfer_file(file, node_request.first_seeder, node_request.target_node, network, faulty_node)
        return {"message": "File transferred successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")
    
@router.delete("/stop-torrent/{node_name}", status_code=status.HTTP_204_NO_CONTENT)
def stop_torrent_node(node_name: str):
    if node_name not in network:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")

    network[node_name].shutdown()
    del network[node_name]