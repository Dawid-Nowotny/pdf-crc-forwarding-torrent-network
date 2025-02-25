import psutil
from fastapi import HTTPException, status

import subprocess

from src.constants import COMMUNICATION_PORT

def start_communication_websocket() -> None: 
    subprocess.Popen(
        ["cmd", "/c", "start", "py", "domain/node_runner.py", "Node_communication", str(COMMUNICATION_PORT)]
    )

def close_communication_websocket() -> None:
    closed = False

    for conn in psutil.net_connections(kind='tcp'):
        if conn.laddr.port == COMMUNICATION_PORT and conn.status == psutil.CONN_LISTEN:
            try:
                process = psutil.Process(conn.pid)
                process.terminate()
                process.wait(timeout=3)
                closed = True
                break
            except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to terminate process on port {COMMUNICATION_PORT}: {str(e)}"
                )
            except psutil.TimeoutExpired:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Process on port {COMMUNICATION_PORT} did not terminate in the expected time."
                )
    
    if not closed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No listening process found on port {COMMUNICATION_PORT}."
        )