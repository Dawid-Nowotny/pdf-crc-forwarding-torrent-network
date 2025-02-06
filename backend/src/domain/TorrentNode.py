import libtorrent as lt

import os
import time

from src.constants import NODE_PORTS
from .create_torrent import create_torrent
from .CRC import CRC

class TorrentNode:
    def __init__(self, node_name: str, polynomial: str):
        self.node_name = node_name
        self.polynomial = polynomial
        self.crc = CRC()
        self.session = lt.session()
        self.session.listen_on(NODE_PORTS[node_name], NODE_PORTS[node_name] + 10)
        self.save_path = f"nodes/{node_name}_downloads"
        os.makedirs(self.save_path, exist_ok=True)
        print(f"Node {node_name} running")

    def add_torrent(self, torrent_path: str) -> None:
        info = lt.torrent_info(torrent_path)
        handle = self.session.add_torrent({'ti': info, 'save_path': self.save_path})

        while True:
            s = handle.status()
            print(f"Status {self.node_name}: {s.state}, {s.progress * 100:.2f}% complete")

            if s.is_seeding:
                print(f"{self.node_name} has finished downloading and is becoming a seed!")
                break
            time.sleep(1)

        return handle

    def seed_file(self, file_path: str) -> str:
        save_path = f"nodes/{self.node_name}_torrents"
        os.makedirs(save_path, exist_ok=True)

        torrent_path = create_torrent(file_path, save_path)

        info = lt.torrent_info(torrent_path)
        self.session.add_torrent({'ti': info, 'save_path': os.path.dirname(file_path)})

        return torrent_path
    
    def calculate_crc(self, file_path: str) -> int:
        crc_function = self.crc.get_crc_function(self.polynomial)
        with open(file_path, "rb") as f:
            data = f.read()
        return crc_function(self.polynomial, data)
    
    def shutdown(self) -> None:
        print(f"Node {self.node_name} closed")
        self.session.pause()
        del self.session