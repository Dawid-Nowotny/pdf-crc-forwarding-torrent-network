import libtorrent as lt

import os

def create_torrent(file_path: str, save_path: str) -> str:
    fs = lt.file_storage()
    lt.add_files(fs, file_path)
    
    if fs.num_files() == 0:
        raise RuntimeError("No files found for torrent creation")

    t = lt.create_torrent(fs)
    t.set_creator("PDF Transfer System")
    t.set_comment("PDF transfer using libtorrent")

    lt.set_piece_hashes(t, os.path.dirname(file_path))

    torrent_file = os.path.join(save_path, "file.torrent")
    with open(torrent_file, "wb") as f:
        f.write(lt.bencode(t.generate()))
    
    return torrent_file