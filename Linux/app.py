## === IMPORTS === ##
import logging
logging.basicConfig(level=logging.INFO)
import os
import eel
from pathlib import Path
import json
import subprocess
import serial.tools.list_ports
import shutil
from datetime import datetime
import traceback
import platform
import base64
from io import BytesIO
from PIL import Image
import signal
import sys
import pty
import select
import threading
import fcntl
import termios
import struct
import pexpect
import ptyprocess
import serial
import time
import getpass
import yaml


## === GLOABAL VARS === ##

FOLDER = os.path.dirname(os.path.abspath(__file__))  # Directory where app.py is located
LFOLDER = os.path.join(FOLDER, 'notes.txt') # notes file
NFOLDER = os.path.join(FOLDER, 'Notes')  # 'Notes' folder
DFOLDER = os.path.join(FOLDER, 'Dict')  # 'Dict' folder
DAFOLDER = os.path.join(FOLDER, 'data')  # 'data' folder
WFOLDER = os.path.join(FOLDER, 'web')  # 'web' folder
IFOLDER = os.path.join(WFOLDER, 'img')  # 'img' folder inside 'web'

# Print all the paths
print(FOLDER)
print(LFOLDER)		
print(NFOLDER)
print(DFOLDER)
print(DAFOLDER)
print(WFOLDER)
print(IFOLDER)

status = False
available = False
i = 0
si = 0
si_lock = threading.Lock()
#test

class idecmds_class():
    class note:
        @staticmethod
        def pull(file, note):
            try:
                name = []
                content = []
                filepath = os.path.join(NFOLDER, file)
                if os.path.isfile(filepath):
                    with open(filepath, 'r') as f:
                        data = yaml.safe_load(f) or []
                    for block in data:
                        name.append(block["name"])
                        content.append(block["content"])
                    for i in name:
                        if i == note:
                            return 1, name, content
                else:
                    return 2, 'No such file found'
                    
            except Exception as e:
                log('py', 'HJFBDSUFGYKF', f'HERE: {e}')
                return 3, e
            
        @staticmethod
        def push(file, note, val):
            try:
                filepath = os.path.join(NFOLDER, file)
                if os.path.isfile(filepath):
                    with open(filepath, 'r') as f:
                        data = yaml.safe_load(f) or []
                    new_entry = {
                        'name': note,
                        'content': val
                    }
                    data.append(new_entry)
                    with open(filepath, 'w') as f:
                        yaml.dump(data, f, default_flow_style=False, sort_keys=False)
                    
                    return 1, ''
                else:
                    return 2, ''
            except Exception as e:
                return 3, e
            
        @staticmethod
        def clear(file, note):
            try:
                filepath = os.path.join(NFOLDER, file)
                if os.path.isfile(filepath):
                    with open(filepath, 'r') as f:
                        data = yaml.safe_load(f) or []
                    for i, block in enumerate(data):
                        if block.get("name") == note:
                            del data[i]
                            with open(filepath, 'w') as f:
                                yaml.dump(data, f, default_flow_style=False, sort_keys=False)
                            return 1, '' 
                    return 4, ''
                else:
                    return 2, ''
            except Exception as e:
                return 3, e, ''
            
        @staticmethod
        def delete(file):
            try:
                filepath = os.path.join(NFOLDER, file)
                if os.path.isfile(filepath):
                    os.remove(filepath)
                    return 1, ''
                return 2, ''
            except Exception as e:
                return 3, e
        
        @staticmethod
        def clearAll(file):
            try:
                filepath = os.path.join(NFOLDER, file)
                if os.path.isfile(filepath):
                    open(filepath, 'w').close()
                    return 1, '' 
                return 2, ''
            except Exception as e:
                return 3, e 

    class dict:
        @staticmethod
        def pull(file):
            try:
                filepath = os.path.join(DFOLDER, file)
                if os.path.isfile(filepath):
                    with open(filepath, 'r') as f:
                        data = yaml.safe_load(f) or {}
                    return 1, data
                else:
                    return 2, ''
            except Exception as e:
                return 3, e
        
        @staticmethod
        def push(file, name, disc):
            try:
                filepath = os.path.join(DFOLDER, file)
                if os.path.isfile(filepath):
                    with open(filepath, 'r') as f:
                        data = yaml.safe_load(f) or {}
                    data[name] = disc
                    with open(filepath, 'w') as f:
                        yaml.dump(data, f, default_flow_style=False, sort_keys=False)
                    return 1, ''
                return 2, ''
            except Exception as e:
                return 3, e
        
        @staticmethod
        def clear(file, word):
            try:
                filepath = os.path.join(DFOLDER, file)
                if os.path.isfile(filepath):
                    with open(filepath, 'r') as f:
                        data = yaml.safe_load(f)
                    if word in data and data[word] != '':
                        data[word] = ""
                        with open(filepath, 'w') as f:
                            yaml.dump(data, f, default_flow_style=False, sort_keys=False)
                        return 1, ''
                    else:
                        return 4, ''
                return 2, ''
            except Exception as e:
                return 3, e
        
        
        @staticmethod
        def clearAll(file):
            try:
                filepath = os.path.join(DFOLDER, file)
                if os.path.isfile(filepath):
                    open(filepath, 'w').close()
                    return 1, ''
                return 2, ''
            except Exception as e:
                return 3, e, ''
        
        @staticmethod
        def delete(file):
            try:
                filepath = os.path.join(DFOLDER, file)
                if os.path.isfile(filepath):
                    os.remove(filepath)
                    return 1, ''
                return 2, ''
            except Exception as e:
                return 3, e
        
    class sys:
        @staticmethod
        def clossApp():
            eel.spawn(eel.closewindow())
            sys.exit()
  

## === FUNCTIONS === ##

def open_native_folder_dialog():
    system = platform.system()  # 'Linux', 'Windows', 'Darwin' (macOS)
    
    # --- Linux ---
    if system == "Linux":
        # Try GNOME
        if shutil.which("zenity"):
            result = subprocess.run(['zenity', '--file-selection', '--directory'], capture_output=True, text=True)
        # Try KDE
        elif shutil.which("kdialog"):
            result = subprocess.run(['kdialog', '--getexistingdirectory'], capture_output=True, text=True)
        else:
            # Fallback to console input
            print("No native dialog available. Please enter folder path:")
            return input().strip()

        if result.returncode == 0:
            return result.stdout.strip()
        return None

    # --- Windows ---
    elif system == "Windows":
        try:
            # Use PowerShell to show native folder dialog
            script = '''
            Add-Type -AssemblyName System.Windows.Forms
            $folder = New-Object System.Windows.Forms.FolderBrowserDialog
            $result = $folder.ShowDialog()
            if ($result -eq "OK") {
                $folder.SelectedPath
            }
            '''
            result = subprocess.run(['powershell', '-Command', script], capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip()
            return None
        except:
            # Fallback to console input
            print("Failed to open native dialog. Please enter folder path:")
            return input().strip()

    # --- macOS ---
    elif system == "Darwin":
        try:
            # AppleScript for native folder selection
            script = 'POSIX path of (choose folder)'
            result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip()
            return None
        except:
            # Fallback to console input
            print("Failed to open native dialog. Please enter folder path:")
            return input().strip()

    else:
        # Unknown system → fallback to console input
        print("Unknown system. Please enter folder path:")
        return input().strip()

def open_native_file_dialog():
    system = platform.system()  # 'Linux', 'Windows', 'Darwin' (macOS)
    
    # --- Linux ---
    if system == "Linux":
        # Try GNOME
        if shutil.which("zenity"):
            result = subprocess.run(['zenity', '--file-selection'], capture_output=True, text=True)
        # Try KDE
        elif shutil.which("kdialog"):
            result = subprocess.run(['kdialog', '--getopenfilename'], capture_output=True, text=True)
        else:
            # Fallback to console input
            print("No native dialog available. Please enter file path:")
            return input().strip()

        if result.returncode == 0:
            return result.stdout.strip()
        return None

    # --- Windows ---
    elif system == "Windows":
        try:
            # Use PowerShell to show native file dialog
            script = '''
            Add-Type -AssemblyName System.Windows.Forms
            $file = New-Object System.Windows.Forms.OpenFileDialog
            $result = $file.ShowDialog()
            if ($result -eq "OK") {
                $file.FileName
            }
            '''
            result = subprocess.run(['powershell', '-Command', script], capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip()
            return None
        except:
            # Fallback to console input
            print("Failed to open native dialog. Please enter file path:")
            return input().strip()

    # --- macOS ---
    elif system == "Darwin":
        try:
            # AppleScript for native file dialog
            script = 'POSIX path of (choose file)'
            result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip()
            return None
        except:
            # Fallback to console input
            print("Failed to open native dialog. Please enter file path:")
            return input().strip()

    else:
        # Unknown system → fallback to console input
        print("Unknown system. Please enter file path:")
        return input().strip()

def open_native_pic_file_dialog():
    system = platform.system()  # 'Linux', 'Windows', 'Darwin' (macOS)

    # --- Allowed extensions ---
    allowed_extensions = "*.jpeg *.jpg *.png *.bmp *.svg *.webp *.tiff *.tif"

    # --- Linux ---
    if system == "Linux":
        # Try GNOME
        if shutil.which("zenity"):
            result = subprocess.run(
                ['zenity', '--file-selection', '--file-filter=Images | *.jpeg *.jpg *.png *.bmp *.svg *.webp *.tiff *.tif'],
                capture_output=True, text=True
            )
        # Try KDE
        elif shutil.which("kdialog"):
            result = subprocess.run(
                ['kdialog', '--getopenfilename', '.', '*.jpeg *.jpg *.png *.bmp *.svg *.webp *.tiff *.tif'],
                capture_output=True, text=True
            )
        else:
            # Fallback to console input
            print(f"No native dialog available. Please enter image file path ({allowed_extensions}):")
            return input().strip()

        if result.returncode == 0:
            return result.stdout.strip()
        return None

    # --- Windows ---
    elif system == "Windows":
        try:
            # Use PowerShell to show native file dialog with filter
            script = f'''
            Add-Type -AssemblyName System.Windows.Forms
            $file = New-Object System.Windows.Forms.OpenFileDialog
            $file.Filter = "Image files|{allowed_extensions}|All files|*.*"
            $result = $file.ShowDialog()
            if ($result -eq "OK") {{
                $file.FileName
            }}
            '''
            result = subprocess.run(['powershell', '-Command', script], capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip()
            return None
        except:
            # Fallback to console input
            print(f"Failed to open native dialog. Please enter image file path ({allowed_extensions}):")
            return input().strip()

    # --- macOS ---
    elif system == "Darwin":
        try:
            # AppleScript for native file dialog
            script = 'POSIX path of (choose file)'
            result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
            if result.returncode == 0:
                path = result.stdout.strip()
                if path.lower().endswith(('.jpeg', '.jpg', '.png', '.bmp', '.svg', '.webp', '.tiff', '.tif')):
                    return path
                else:
                    print(f"Selected file is not a supported image format ({allowed_extensions})")
                    return None
            return None
        except:
            # Fallback to console input
            print(f"Failed to open native dialog. Please enter image file path ({allowed_extensions}):")
            return input().strip()

    else:
        # Unknown system → fallback to console input
        print(f"Unknown system. Please enter image file path ({allowed_extensions}):")
        return input().strip()

def open_native_file_ports_dialog(multiple=False):
    """
    Opens a native file dialog for uploading files.
    
    Args:
        multiple (bool): If True, allow selecting multiple files.
        
    Returns:
        str or list[str] or None: Path(s) of selected file(s), or None if cancelled.
    """
    system = platform.system()  # 'Linux', 'Windows', 'Darwin' (macOS)

    # --- Linux ---
    if system == "Linux":
        # Try GNOME
        if shutil.which("zenity"):
            cmd = ['zenity', '--file-selection']
            if multiple:
                cmd.append('--multiple')
                cmd.append('--separator=:')  # custom separator
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                files = result.stdout.strip()
                return files.split(':') if multiple else files
            return None
        
        # Try KDE
        elif shutil.which("kdialog"):
            cmd = ['kdialog', '--getopenfilename']
            if multiple:
                cmd.append('--multiple')
                cmd.append('--separate-output')
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                files = result.stdout.strip()
                return files.split('\n') if multiple else files
            return None
        else:
            # Fallback to console input
            if multiple:
                print("No native dialog available. Please enter file paths (one per line, empty line to finish):")
                paths = []
                while True:
                    path = input().strip()
                    if not path:
                        break
                    paths.append(path)
                return paths if paths else None
            else:
                print("No native dialog available. Please enter file path:")
                return input().strip()

    # --- Windows ---
    elif system == "Windows":
        try:
            if multiple:
                # Use PowerShell to show native file dialog with multiple selection
                script = '''
                Add-Type -AssemblyName System.Windows.Forms
                $file = New-Object System.Windows.Forms.OpenFileDialog
                $file.Multiselect = $true
                $result = $file.ShowDialog()
                if ($result -eq "OK") {
                    $file.FileNames -join "`n"
                }
                '''
                result = subprocess.run(['powershell', '-Command', script], capture_output=True, text=True)
                if result.returncode == 0 and result.stdout.strip():
                    return result.stdout.strip().split('\n')
                return None
            else:
                # Use PowerShell to show native file dialog
                script = '''
                Add-Type -AssemblyName System.Windows.Forms
                $file = New-Object System.Windows.Forms.OpenFileDialog
                $result = $file.ShowDialog()
                if ($result -eq "OK") {
                    $file.FileName
                }
                '''
                result = subprocess.run(['powershell', '-Command', script], capture_output=True, text=True)
                if result.returncode == 0 and result.stdout.strip():
                    return result.stdout.strip()
                return None
        except:
            # Fallback to console input
            if multiple:
                print("Failed to open native dialog. Please enter file paths (one per line, empty line to finish):")
                paths = []
                while True:
                    path = input().strip()
                    if not path:
                        break
                    paths.append(path)
                return paths if paths else None
            else:
                print("Failed to open native dialog. Please enter file path:")
                return input().strip()

    # --- macOS ---
    elif system == "Darwin":
        try:
            if multiple:
                # AppleScript for multiple file selection
                script = '''
                set selectedFiles to choose file with multiple selections allowed
                set posixPaths to {}
                repeat with aFile in selectedFiles
                    set end of posixPaths to POSIX path of aFile
                end repeat
                return posixPaths as string
                '''
                result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
                if result.returncode == 0:
                    # Parse the result to get individual file paths
                    files_str = result.stdout.strip()
                    return files_str.split(', ') if files_str else None
                return None
            else:
                # AppleScript for single file selection
                script = 'POSIX path of (choose file)'
                result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)
                if result.returncode == 0:
                    return result.stdout.strip()
                return None
        except:
            # Fallback to console input
            if multiple:
                print("Failed to open native dialog. Please enter file paths (one per line, empty line to finish):")
                paths = []
                while True:
                    path = input().strip()
                    if not path:
                        break
                    paths.append(path)
                return paths if paths else None
            else:
                print("Failed to open native dialog. Please enter file path:")
                return input().strip()

    else:
        # Unknown system → fallback to console input
        if multiple:
            print("Unknown system. Please enter file paths (one per line, empty line to finish):")
            paths = []
            while True:
                path = input().strip()
                if not path:
                    break
                paths.append(path)
            return paths if paths else None
        else:
            print("Unknown system. Please enter file path:")
            return input().strip()


## === EXPOSED FUNCTIONS === ##

@eel.expose
def log(file, info, other, err=False):
    if jsonmanager('g', 'app', 'log') == "off":
        return
    elif jsonmanager('g', 'app', 'log') == "error":
        if not(err):
            return
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    global i
    i = i + 1
    msg = f" ${i} ${file} ${info}  ${other} ${err}"
    with open(LFOLDER, 'a', encoding='utf-8') as f:
        f.write(msg + "\n")

@eel.expose
def openFolder():
    file_path = open_native_folder_dialog()
    with open(f'{DAFOLDER}/info.json', 'r') as f:
        data = json.load(f)
    data['LastWorkspace'] = file_path
    log('py', '', data)
    with open(f'{DAFOLDER}/info.json', 'w') as f:
        json.dump(data, f, indent=4)
    log("py", f"successfully gave {file_path}", "")
    return {"success": True, "path": file_path}

@eel.expose
def openFile():
    try:
        file_path = open_native_file_dialog()
        log("py", f"successfully gave {file_path}", "")
        return {"success": True, "path": file_path}
    except Exception as e:
        trace = traceback.format_exc()
        log("py", e, trace, True)
        return {"success": False, "message": str(e)}

@eel.expose
def saveFile(content, file_path):
    try:
        with open(file_path, 'w') as f:
            f.write(content)
        return {"success": True}
    except Exception as e:
        trace = traceback.format_exc()
        log("py", e, trace, True)
        return {"success": False, "message": str(e)}



@eel.expose
def listFiles(directory):
    try:
        objects = []
        for obj in os.listdir(directory):
            obj_path = os.path.join(directory, obj)
            if os.path.isfile(obj_path):
                objects.append({"name": obj, "type": "file", "path": obj_path})
            else:
                objects.append({"name": obj, "type": "folder", "path": obj_path})
        log('py', 'sent dicts', objects)
        return {"success": True, "files": objects} 
    except Exception as e:
        trace = traceback.format_exc()
        log("py", e, trace, True)
        return {"success": False, "error": str(e)}

@eel.expose
def loadFile(file_path):
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        return {"success": True, "content": content}
    except Exception as e:
        trace = traceback.format_exc()
        log("py", e, trace, True)
        return {"success": False, "message": str(e)}

@eel.expose
def makeFile(path, fileName):
    try:
        file_path = os.path.join(path, fileName)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write("Lets get to coding!")
            log('py', 'Made file at:', file_path)
        return {"success": True}
    except Exception as e:
        trace = traceback.format_exc()
        log("py", e, trace, True)
        return {"success": False, "message": str(e)}

@eel.expose
def makeNewFolder(path):
    try:
        folder_path = os.path.join(path, "NewFolder")
        os.makedirs(folder_path, exist_ok=True)
        return {"success": True}
    except Exception as e:
        trace = traceback.format_exc()
        log("py", e, trace, True)
        return {"success": False, "message": str(e)}

@eel.expose
def readFile(path, name):
    try:
        with open(path, 'r') as f:
            content = f.read()
            log('py', '', 'here')
            log('py', '', content)
        filename = os.path.basename(path) 
        ext = filename.split('.')[-1].lower()
        language = None
        match ext:
            case "py":
                language = "python"
            case "js":
                language = "javascript"
            case "ts":
                language = "typescript"
            case "java":
                language = "java"
            case "c":
                language = "c"
            case "cpp" | "cc" | "cxx":
                language = "cpp"
            case "html" | "htm":
                language = "html"
            case "css":
                language = "css"
            case "json":
                language = "json"
            case "rs":
                language = "rust"
            case "go":
                language = "go"
            case "bash":
                language = "shell"
            case _:
                language = "text"
        log('py', 'extension', language)
        return {"success": True, "content": content, "language": language}
    except Exception as e:
        trace = traceback.format_exc()
        log('py', e, trace, True)
        return {"success": False, "error": str(e)}

@eel.expose
def renameFile(newName, oldPath, oldName=''):
    log('py', 'rename', 'Came')
    log('py', 'rename got', f"{newName}, {oldName}, {oldPath}")
    try:
        if oldPath == 'NFOLDER':
            global NFOLDER
            oldPath = NFOLDER
            log('py', 'dict', oldPath)
            newPath = os.path.join(oldPath, newName)
            oldPath = os.path.join(oldPath, oldName)
            log('py', '', newPath)
            os.rename(oldPath, newPath)
            return {"success": True, "newPath": newPath}
   
        elif oldPath == 'DFOLDER':
            global DFOLDER
            oldPath = DFOLDER
            log('py', 'dict', oldPath)
            newPath = os.path.join(oldPath, newName)
            oldPath = os.path.join(oldPath, oldName)
            log('py', '', newPath)
            os.rename(oldPath, newPath)
            return {"success": True, "newPath": newPath}

        directory = os.path.dirname(oldPath)
        newPath = os.path.join(directory, newName)
        log('py', '', newPath)
        os.rename(oldPath, newPath)
        log('py', '', newPath)
        return {"success": True, "newPath": newPath}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def deleteFile(path):
    try:
        os.remove(path)
        return {"success": True}
    except IsADirectoryError:
        shutil.rmtree(path)
        return {"success": True}
    except Exception as e:
        trace = traceback.format_exc()
        log("py", e, trace, True)
        return {"success": False, "message": str(e)}

## == Notes == ##

@eel.expose
def newNote(fileName):
    if not fileName:
        return {"success": False, "error": "No file name provided"}

    try:
        file_path = os.path.join(NFOLDER, fileName)
        with open(file_path, 'w') as f:
            f.write(
                f"Write anything here then copy it to your many project (anytime, anywhere) "
                f"by writing\n notes.bring('{fileName}')"
            )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}




@eel.expose
def listNotes():
    notes = []
    try:
        for note in os.listdir(NFOLDER):
            path = os.path.join(NFOLDER, note)
            notes.append({"name": note, "path": path})
    except Exception as e:
        trace = traceback.format_exc()
        log("py", e, trace, True)
        return {"success": False, "error": str(e)}
    return {"success": True, "Notes": notes}

@eel.expose
def saveNote(name, content):
    try:
        path = os.path.join(NFOLDER, name)
        with open(path, 'w') as f:
            f.write(content)
        return {"success": True}
    except Exception as e:
        trace = traceback.format_exc()
        log("py", e, trace, True)
        return {"success": False, "w": str(e)}

## == Dict == ##

@eel.expose
def listDict():
    dictionary = []
    try:
        for dic in os.listdir(DFOLDER):
            path = os.path.join(DFOLDER, dic)
            dictionary.append({"name": dic, "path": path})
    except Exception as e:
        trace = traceback.format_exc()
        log("py", e, trace, True)
        return {"success": False, "error": str(e)}
    return {"success": True, "Dict": dictionary}

@eel.expose
def saveDict(name, content):
    try:
        path = os.path.join(DFOLDER, name)
        with open(path, 'w') as f:
            f.write(content)
        return {"success": True}
    except Exception as e:
        trace = traceback.format_exc()
        log("py", e, trace, True)
        return {"success": False, "w": str(e)}

@eel.expose
def newDict(fileName):
    try:
        file_path = os.path.join(DFOLDER, fileName)
        with open(file_path, 'w') as f:
            f.write(
                f"Use the syntax\n"
                f"function() | description\n"
                f"to make your dictionaries then insert them for example\n"
                f"print() | to output\n"
                f"then you can use notes.info({fileName}) to get the dicts"
            )
        return {"success": True}
    except Exception as e:
        log('py', 'at newDict', e, True)
        return {"success": False, "error": str(e)}

## == Circuit Viewer == ##

@eel.expose
def displayPic():
    for fn in os.listdir(IFOLDER):
        os.remove(os.path.join(IFOLDER, fn))

    filePath = open_native_pic_file_dialog()
    if not filePath:
        return {"success": False, "error": "Canceled request"}

    filename = os.path.basename(filePath)
    Ipath = os.path.join(IFOLDER, filename)
    shutil.copy(filePath, IFOLDER)
    log('py', Ipath, '\n')
    return {"success": True, "img": f"img/{filename}"}

## == Ports == ##


serials = set()

@eel.expose
def UploadToDevice(chip, port, firmware):
    with open(f"{DAFOLDER}/mcu.json", 'r') as f:
        file = json.load(f)
    cmd = file[chip]["upload_command"]
    cmd = cmd.replace("{port}", port).replace("{file}", firmware)
    if chip == "RP2040":
        cmd = cmd.replace("$(whoami)", getpass.getuser())
    log("py", "COMMAND:", cmd)

@eel.expose
def readDevice(port_in, baud):
    if port_in in serials:
        return

    serials.add(port_in)

    ser = serial.Serial(
        port=port_in,
        baudrate=baud,
        timeout=1
    )

    try:
        while port_in in serials:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8').strip()
                eel.spawn(eel.portData(f'{port_in}: {line}'))
    finally:
        ser.close() 

@eel.expose
def stopread(port_in):
    serials.discard(port_in)



## == Terminal == ##

virtual_cwd = os.getcwd()
home_dir = os.path.expanduser("~")  # For ~ support
shell = None


@eel.expose
def run_command(cmd, sudo_password=""):
    global virtual_cwd
    try:
        # handle 'cd'
        if cmd.startswith("cd "):
            path = cmd[3:].strip()
            path = os.path.expanduser(path)
            if not os.path.isabs(path):
                path = os.path.join(virtual_cwd, path)
            if os.path.isdir(path):
                virtual_cwd = os.path.abspath(path)
                return {"ok": True, "output": virtual_cwd}
            else:
                return {"ok": False, "output": f"No such directory: {path}"}

        # sudo commands
        if cmd.startswith("sudo"):
            process = subprocess.Popen(
                cmd,
                shell=True,
                executable=shell,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=virtual_cwd
            )
            stdout, stderr = process.communicate(sudo_password + "\n")
            if process.returncode != 0:
                return {"ok": False, "output": stderr.strip()}
            return {"ok": True, "output": stdout.strip()}

        # normal commands
        output = subprocess.check_output(
            cmd,
            shell=True,
            executable=shell,
            stderr=subprocess.STDOUT,
            text=True,
            cwd=virtual_cwd
        )
        return {"ok": True, "output": output.strip()}

    except subprocess.CalledProcessError as e:
        return {"ok": False, "output": e.output.strip()}


@eel.expose
def get_cwd():
    return virtual_cwd



## == Ports ==##

def next_id():
    global si
    with si_lock:
        si += 1
        return si
    
@eel.expose
def getPorts():
    active_ports = []
    ports = serial.tools.list_ports.comports()

    for port in ports:
        try:
            # Try to open and immediately close the port
            s = serial.Serial(port.device)
            s.close()
            active_ports.append(port.device)
        except (OSError, serial.SerialException):
            pass
    return {"success": True, "ports": active_ports}

@eel.expose
def readPort(port, baud):
    def reader():
        try:
            ser = serial.Serial(port, baud, timeout=1)
            while True:
                if ser.in_waiting:
                    line = ser.readline().decode(errors="ignore").strip()
                    line = f"{next_id()}$ {line}"
                    log('py', 'Line:', line)
                    eel.spawn(eel.Out, line)
        except Exception as e:
            eel.spawn(eel.Out, str(e), True)
            log('py', "got error:", e, True)
    
    threading.Thread(target=reader, daemon=True).start()

@eel.expose
def upload(port, baud, firmware):
    def uploader():
        try:
            ser = serial.Serial(port, baud)
            with open(firmware, 'rb') as f:
                while True:
                    chunk = f.read(1024)
                    if not chunk:
                        break
                    ser.write(chunk)
                    ser.flush()
                    time.sleep(0.01)
            eel.spawn(eel.Out, "Upload complete.")
        except Exception as e:
            eel.spawn(eel.Out, str(e), True)
            log('py', 'got error', e, True)

    threading.Thread(target=uploader, daemon=True).start()


@eel.expose
def test():
    for i in range(1, 300):
        line1 = f"{next_id()}$ Test output"
        line2 = f"{next_id()}$ Test fail"
        eel.spawn(eel.Out, line1)
        eel.spawn(eel.Out, line2, True)

## == Settings == ##


@eel.expose
def jsonmanager(proc, grp="", subgrp="", setto=""):
    with open(f"{DAFOLDER}/settings.json", 'r') as f:   
        data = json.load(f)
    if proc == 'g':
        value = data[grp][subgrp]
        return value
    
    elif proc == 's':
        data[grp][subgrp] = setto
        with open(f"{DAFOLDER}/settings.json", 'w') as f:
            json.dump(data, f, indent= 4)
        return {"success": True}
    elif proc == 'ga':
        return data

@eel.expose
def getLastWorkspace():
    with open(f'{DAFOLDER}/info.json', 'r') as f:
        data = json.load(f)
    path = data['LastWorkspace']
    return path

@eel.expose
def getKeybinds():
    with open(f'{DAFOLDER}/keybinds.json', 'r') as f:
        return json.load(f)
    
@eel.expose
def s(name, val, subgrp=""):
    with open(f'{DAFOLDER}/keybinds.json', 'r') as f:
        data = json.load(f)

    if subgrp == "":
        # If data[name] exists and is a dict, merge instead of overwrite
        if name in data and isinstance(data[name], dict) and isinstance(val, dict):
            data[name].update(val)
        else:
            data[name] = val
    else:
        if name not in data or not isinstance(data[name], dict):
            data[name] = {}
        data[name][subgrp] = val

    with open(f'{DAFOLDER}/keybinds.json', 'w') as f:
        json.dump(data, f, indent=4)


@eel.expose
def deleteKey(name):
    with open(f'{DAFOLDER}/keybinds.json', 'r') as f:
        data = json.load(f)
    
    del data[name]

    with open(f'{DAFOLDER}/keybinds.json', 'w') as f:
        json.dump(data, f, indent=4)

@eel.expose
def addKey(name, key, action):
    with open(f'{DAFOLDER}/keybinds.json', 'r') as f:
        data = json.load(f)
    data[name] = {
        "keyBind": key,
        "command": action
    }
    with open(f'{DAFOLDER}/keybinds.json', 'w') as f:
        json.dump(data, f, indent=4)

@eel.expose
def startshell(currentdict):
    global shell
    system = platform.system()
    shell_setting = jsonmanager('g', 'terminal', 'Shell')

    if shell_setting.lower() == "auto":
        if system in ("Linux", "Darwin"):
            shell = os.environ.get("SHELL", "/bin/bash")

        elif system == "Windows":
            shell = (
                shutil.which("pwsh")
                or shutil.which("powershell")
                or shutil.which("cmd")
                or r"C:\Windows\System32\cmd.exe"
            )

    else:
        if system == "Windows":
            if shell_setting.lower() == "cmd":
                shell = r"C:\Windows\System32\cmd.exe"
            elif shell_setting.lower() in ("powershell", "pwsh"):
                shell = (
                    shutil.which(shell_setting)
                    or r"C:\Program Files\PowerShell\7\pwsh.exe"
                )
            else:
                shell = r"C:\Windows\System32\cmd.exe"
        else:
            shell = f"/bin/{shell_setting}"

    log("py", "SHELL", shell)
    run_command(f"cd {currentdict}")


@eel.expose
def GetCmdForFile(filename):
    log('py', 'filename', filename)
    try:
        filenameTrue = filename.rsplit(".", 1)[0]
    except:
        return None
    parts = filename.split('.')
    cmd = None
    match parts[-1]:
        case "py":
            cmd = f"python3 {filename}"
        case "js":
            cmd = f"node {filename}"
        case "ts":
            cmd = f"ts-node {filename}"
        case "java":
            cmd = f"javac {filename} && java {filenameTrue}"
        case "c":
            cmd = f"gcc {filename} -o {filenameTrue} && ./{filenameTrue}"
        case "cpp" | "cc" | "cxx":
            cmd = f"gcc {filename} -o {filenameTrue} && ./{filenameTrue}"
        case "html" | "htm":
            language = "html"
        case "rs":
            cmd = f"rustc {filename} -o {filenameTrue} && ./{filenameTrue}"
        case "go":
            cmd = f"go run {filename}"
        case "bash":
            cmd = f"bash {filename}"
    return cmd

@eel.expose
def idecmds(inner, method, *args):
    inner_class = getattr(idecmds_class, inner)
    method = getattr(inner_class, method)
    try:
        a = None
        b = None
        result = method(*args)
        success = result[0]
        a = result[1] if len(result) > 1 else None
        b = result[2] if len(result) > 2 else None
        if success == 1:
            return {'success': success, 'a': a, 'b': b}
        elif success == 2:
            return {'success': success}
        elif success == 3:
            return {'success': success, 'e': a}
        elif success == 4:
            return {'success': success}
    except TypeError as e:
        log('py', 'dywrwm', e)
        return {"success": 3, 'e': e}

eel.init(WFOLDER)
eel.start('index.html', size=(1200, 800), port=0, mode="chrome")


