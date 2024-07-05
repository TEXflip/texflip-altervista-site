import os
import ftplib
import argparse
from pathlib import Path

class FTPutils:
    def __init__(self, url, user, psw) -> None:
        self.session = ftplib.FTP(url, user, psw, encoding="latin-1")

    def cd(self, dir):
        self.session.cwd(dir)
    
    def remove_dir_content(self, path):
        if not self.dir_exists(path):
            return
        for (name, properties) in self.session.mlsd(path=path):
            if name in ['.', '..']:
                continue
            elif properties['type'] == 'file':
                self.session.delete(f"{path}/{name}")
        #     elif properties['type'] == 'dir':
        #         self.remove_dir(f"{path}/{name}")
        # self.session.rmd(path)
    
    def copy_remote(self, path_local):
        for subdir, dirs, files in os.walk(path_local):
            for file in files:
                filepath = os.path.join(subdir, file)
                filepath_remote = filepath.replace(f"{path_local}\\", "").replace("\\", "/") # altervista need linux paths
                if len(filepath_remote.split("/")) > 1: # if the file is in a dir, create the dir
                    self.mkdir(filepath_remote.split("/")[0])
                fd = open(filepath, "rb")
                print(f"- {filepath_remote}")
                self.session.storbinary(f"STOR {filepath_remote}", fd) # this will fail if a directory on "filepath_remote" doesn't exist on altervista
                fd.close()
    
    def mkdir(self, dir):
        if not self.dir_exists(dir):
            self.session.mkd(dir)
    
    def dir_exists(self, dir):
        filelist = []
        self.session.retrlines('LIST', filelist.append)
        return any(f.split()[-1] == dir and f.upper().startswith('D') for f in filelist)
    
    def close(self):
        self.session.quit()
    
    def download_dir(self, directory):
        Path(directory).mkdir(parents=True, exist_ok=True)
        for (name, properties) in self.session.mlsd(path=directory):
            if name in ['.', '..']:
                continue
            elif properties['type'] == 'file':
                file = f"{directory}/{name}"
                print(f"- {file}")
                self.session.retrbinary(f"RETR {file}", open(file, 'wb').write)
            elif properties['type'] == 'dir':
                self.download_dir(f"{directory}/{name}")

def deploy(session):
    session.mkdir(dir_remote) # create the dir if not exists
    session.cd(dir_remote) # set the root dir in remote

    session.remove_dir_content("js") # Vue produces different file names each build on the js dir, so delete the content before update

    print(f"UPDATING FILES from {dir_local} to {dir_remote}:")
    session.copy_remote(dir_local)
    session.close()
    print("DONE!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser("mini script to deploy on altervista")
    parser.add_argument("dir", default="pellad_set_creator", help="directory to deploy (default: pellad_set_creator)")
    parser.add_argument("--build", "-b", dest="build", action="store_true", help="build vue project before deploy (default: false)")
    parser.add_argument("--download", "-d", dest="download", action="store_true", help="download remote directory to local")
    args = parser.parse_args()

    dir_local = args.dir # default dir to deploy
    if args.build:
        os.system("npm run build")
        dir_local = "dist"
    
    dir_remote = Path(args.dir).name

    # read credentials from .env file
    with open(".env", 'r') as file:
        env_vars = file.readlines()
        for env_var in env_vars:
            k, v = env_var.split("=")
            os.environ[k] = v.strip()
    user = os.environ.get("FTP_USER")
    psw = os.environ.get("FTP_PSW")

    print("CONNECTING...", end="\r")
    session = FTPutils(f"ftp.{user}.altervista.org", user, psw)
    print("CONNECTED!   ")
    
    if args.download:
        session.download_dir(args.dir)
    else:
        deploy(session)
