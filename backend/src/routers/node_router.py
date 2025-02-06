from fastapi import APIRouter, UploadFile, Form, status, HTTPException

from src.services.torrent_service import validate_pdf_request
from src.services.pdf_service import validate_pdf
from src.services.torrent_service import transfer_file
from src.domain.TorrentNode import TorrentNode
from src.constants import NODE_PORTS

router = APIRouter()

torrent_admin = None
network = None

@router.post("/start-torrents", status_code=status.HTTP_204_NO_CONTENT)
async def start_websockets():
    global network 
    network = {node: TorrentNode(node) for node in NODE_PORTS.keys()}

@router.post("/send-pdf", status_code=status.HTTP_204_NO_CONTENT)
async def send_pdf_to_node(
    file: UploadFile,
    first_seeder: str = Form(...),
    target_node: str = Form(...),
    polynomial: str = Form(...)
):
    global network
    node_request = validate_pdf_request(first_seeder, target_node, polynomial)
    print(node_request.polynomial)

    try:
        await transfer_file(file, node_request.first_seeder, node_request.target_node, network)
        return {"message": "File transferred successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")