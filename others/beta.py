import eel
from pathlib import Path
import os
import json
import subprocess
import serial.tools.list_ports
import shutil
from datetime import datetime
import tkinter as tk
from tkinter import filedialog

# Set web files folder
WEB_FOLDER = 'web'

# Expose Python functions to JavaScript
@eel.expose
def open_folder():
    # Implement folder opening logic
    folder_path = eel.browseFolder()()  # This will show a folder browser
    return folder_path

@eel.expose
def save_file(content, file_path):
    try:
        with open(file_path, 'w') as f:
            f.write(content)
        return {"success": True, "message": "File saved successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def load_file(file_path):
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        return {"success": True, "content": content}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def getFileList(directory):
    try:
        files = []
        for item in os.listdir(directory):
            item_path = os.path.join(directory, item)
            if os.path.isfile(item_path):
                files.append({"name": item, "type": "file", "path": item_path})
            else:
                files.append({"name": item, "type": "folder", "path": item_path})
        return {"success": True, "files": files}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def browseFolder():
    """Open a folder browser dialog and return the selected path"""
    root = tk.Tk()
    root.withdraw()
    folder_path = filedialog.askdirectory()
    root.destroy()
    log("py", "","done")
    return folder_path

@eel.expose
def create_folder(folder_path):
    """Create a new folder"""
    try:
        os.makedirs(folder_path, exist_ok=True)
        return {"success": True, "message": "Folder created successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def rename_file(old_path, new_path):
    """Rename a file or folder"""
    try:
        os.rename(old_path, new_path)
        return {"success": True, "message": "Renamed successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def delete_file(file_path):
    """Delete a file or folder"""
    try:
        if os.path.isdir(file_path):
            shutil.rmtree(file_path)
        else:
            os.remove(file_path)
        return {"success": True, "message": "Deleted successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def run_file(file_path):
    """Run a file and return the output"""
    try:
        # Determine the file type and run accordingly
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == '.py':
            result = subprocess.run(['python', file_path], capture_output=True, text=True)
            return result.stdout + result.stderr
        elif ext in ['.js', '.html']:
            # For web files, we might open in browser or use a different runner
            return "Web files cannot be run directly in this environment"
        else:
            return f"Unsupported file type: {ext}"
    except Exception as e:
        return f"Error running file: {str(e)}"

@eel.expose
def get_serial_ports():
    """Get a list of available serial ports"""
    try:
        ports = []
        for port in serial.tools.list_ports.comports():
            ports.append({
                "path": port.device,
                "description": port.description,
                "hwid": port.hwid
            })
        return {"success": True, "ports": ports}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def get_device_types():
    """Get a list of supported device types"""
    try:
        # In a real implementation, this would come from a database or config file
        device_types = [
            {"id": "arduino", "name": "Arduino"},
            {"id": "esp32", "name": "ESP32"},
            {"id": "esp8266", "name": "ESP8266"},
            {"id": "raspberry-pi", "name": "Raspberry Pi"},
            {"id": "stm32", "name": "STM32"}
        ]
        return {"success": True, "device_types": device_types}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def upload_to_device(file_path, port, device_type, verify, verbose):
    """Upload code to a device"""
    try:
        # This is a placeholder implementation
        # In a real application, you would use platform-tools like Arduino CLI, PlatformIO, etc.
        
        output = f"Uploading {file_path} to {device_type} on {port}\n"
        output += "This is a simulated upload process\n"
        
        if verbose:
            output += "Verbose output enabled\n"
        
        output += "Upload completed successfully\n"
        
        if verify:
            output += "Verification passed\n"
        
        return output
    except Exception as e:
        return f"Error uploading to device: {str(e)}"

@eel.expose
def select_file_to_upload():
    """Open a file browser dialog to select a file for upload"""
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(
        title="Select file to upload",
        filetypes=[
            ("All files", "*.*"),
            ("Python files", "*.py"),
            ("C/C++ files", "*.c;*.cpp;*.h;*.hpp"),
            ("Arduino files", "*.ino")
        ]
    )
    root.destroy()
    return {"success": True, "file_path": file_path} if file_path else {"success": False, "message": "No file selected"}

@eel.expose
def select_circuit_image():
    """Open a file browser dialog to select a circuit image"""
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(
        title="Select circuit image",
        filetypes=[
            ("Image files", "*.png;*.jpg;*.jpeg;*.bmp;*.svg"),
            ("All files", "*.*")
        ]
    )
    root.destroy()
    return {"success": True, "image_path": file_path} if file_path else {"success": False, "message": "No image selected"}

@eel.expose
def download_image(image_path):
    """Download an image to a user-selected location"""
    try:
        root = tk.Tk()
        root.withdraw()
        save_path = filedialog.asksaveasfilename(
            title="Save image",
            defaultextension=os.path.splitext(image_path)[1],
            filetypes=[
                ("PNG files", "*.png"),
                ("JPEG files", "*.jpg;*.jpeg"),
                ("All files", "*.*")
            ]
        )
        root.destroy()
        
        if save_path:
            shutil.copy2(image_path, save_path)
            return {"success": True, "message": "Image downloaded successfully"}
        else:
            return {"success": False, "message": "No location selected"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def restart_terminal():
    """Restart the terminal"""
    try:
        # In a real implementation, this would restart the terminal process
        return {"success": True, "message": "Terminal restarted"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def create_note(name, content):
    """Create a new note"""
    try:
        # In a real implementation, this would save to a database or file
        # For now, we'll simulate it
        note_id = f"note_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        return {"success": True, "note_id": note_id, "message": "Note created successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def get_notes_list():
    """Get a list of all notes"""
    try:
        # In a real implementation, this would read from a database or file
        # For now, we'll simulate it
        notes = [
            {
                "id": "note_1",
                "name": "Project Ideas",
                "modified": "2023-06-15T14:30:00"
            },
            {
                "id": "note_2",
                "name": "Meeting Notes",
                "modified": "2023-06-14T10:15:00"
            }
        ]
        return {"success": True, "notes": notes}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def get_note_content(note_id):
    """Get the content of a note"""
    try:
        # In a real implementation, this would read from a database or file
        # For now, we'll simulate it
        content = "<h1>Project Ideas</h1><ul><li>Smart home automation system</li><li>Weather station with data logging</li><li>IoT plant monitoring system</li></ul>"
        return {"success": True, "content": content}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def save_note(note_id, name, content):
    """Save a note"""
    try:
        # In a real implementation, this would save to a database or file
        return {"success": True, "message": "Note saved successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def create_dictionary(name):
    """Create a new dictionary"""
    try:
        # In a real implementation, this would save to a database or file
        # For now, we'll simulate it
        dict_id = f"dict_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        return {"success": True, "dict_id": dict_id, "message": "Dictionary created successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def get_dictionaries_list():
    """Get a list of all dictionaries"""
    try:
        # In a real implementation, this would read from a database or file
        # For now, we'll simulate it
        dictionaries = [
            {
                "id": "dict_1",
                "name": "Electronics Terms",
                "entry_count": 42
            },
            {
                "id": "dict_2",
                "name": "Programming Commands",
                "entry_count": 78
            }
        ]
        return {"success": True, "dictionaries": dictionaries}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def get_dictionary_content(dict_id):
    """Get the content of a dictionary"""
    try:
        # In a real implementation, this would read from a database or file
        # For now, we'll simulate it
        content = "<table><tr><th>Term</th><th>Definition</th></tr><tr><td>Resistor</td><td>A passive two-terminal electrical component that implements electrical resistance as a circuit element.</td></tr></table>"
        return {"success": True, "content": content}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def save_dictionary(dict_id, name, content):
    """Save a dictionary"""
    try:
        # In a real implementation, this would save to a database or file
        return {"success": True, "message": "Dictionary saved successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def get_dictionary_entries(search_term):
    """Get dictionary entries matching the search term"""
    try:
        # In a real implementation, this would search in a database or file
        # For now, we'll simulate it
        entries = [
            {
                "name": "print()",
                "description": "Output text to the console",
                "code": "print('Hello, world!')"
            },
            {
                "name": "for loop",
                "description": "Iterate over a sequence",
                "code": "for i in range(10):\n    print(i)"
            },
            {
                "name": "if statement",
                "description": "Conditional execution",
                "code": "if condition:\n    # do something"
            }
        ]
        
        if search_term:
            entries = [e for e in entries if search_term.lower() in e["name"].lower()]
        
        return entries
    except Exception as e:
        return []

@eel.expose
def save_settings(settings):
    """Save application settings"""
    try:
        # In a real implementation, this would save to a configuration file
        settings_file = os.path.join(os.path.expanduser('~'), '.noteside_settings.json')
        with open(settings_file, 'w') as f:
            json.dump(settings, f)
        return {"success": True, "message": "Settings saved successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def get_settings():
    """Get application settings"""
    try:
        # In a real implementation, this would read from a configuration file
        settings_file = os.path.join(os.path.expanduser('~'), '.noteside_settings.json')
        
        if os.path.exists(settings_file):
            with open(settings_file, 'r') as f:
                settings = json.load(f)
            return {"success": True, "settings": settings}
        else:
            # Return default settings
            default_settings = {
                "appearance": {
                    "theme": "dark",
                    "editorTheme": "vs-dark",
                    "fontFamily": "'Fira Code', 'Consolas', 'Monaco', monospace",
                    "fontSize": 14,
                    "sidebarWidth": 220,
                    "showMinimap": True,
                    "showLineNumbers": True
                },
                "editor": {
                    "tabSize": 4,
                    "insertSpaces": True,
                    "wordWrap": True,
                    "autoCloseBrackets": True,
                    "formatOnSave": False,
                    "trimTrailingWhitespace": False,
                    "cursorStyle": "line",
                    "cursorBlink": True
                },
                "terminal": {
                    "shell": "auto",
                    "fontSize": 14,
                    "theme": "default",
                    "cursorBlink": True,
                    "copyOnSelect": False,
                    "rightClickAction": True
                },
                "application": {
                    "autosaveInterval": 3,
                    "restoreSession": True,
                    "confirmDelete": True,
                    "autoUpdate": True,
                    "telemetry": "on"
                }
            }
            return {"success": True, "settings": default_settings}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def reset_settings_category(category):
    """Reset a specific settings category to default"""
    try:
        # Get current settings
        settings_response = get_settings()
        if not settings_response["success"]:
            return settings_response
        
        settings = settings_response["settings"]
        
        # Get default settings
        default_settings_response = get_settings()
        if not default_settings_response["success"]:
            return default_settings_response
        
        default_settings = default_settings_response["settings"]
        
        # Reset the specified category
        if category in default_settings:
            settings[category] = default_settings[category]
            
            # Save the updated settings
            return save_settings(settings)
        else:
            return {"success": False, "message": f"Invalid settings category: {category}"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def reset_all_settings():
    """Reset all settings to default"""
    try:
        # Get default settings
        default_settings_response = get_settings()
        if not default_settings_response["success"]:
            return default_settings_response
        
        default_settings = default_settings_response["settings"]
        
        # Save the default settings
        return save_settings(default_settings)
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def check_for_updates():
    """Check for application updates"""
    try:
        # In a real implementation, this would check a server for updates
        # For now, we'll simulate it
        return {
            "success": True,
            "update_available": False,
            "current_version": "1.0.0",
            "latest_version": "1.0.0"
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def get_keybindings():
    """Get application keybindings"""
    try:
        # In a real implementation, this would read from a configuration file
        # For now, we'll simulate it
        keybindings = [
            {
                "command": "editor.action.formatDocument",
                "keybinding": "Ctrl+Shift+F",
                "source": "default"
            },
            {
                "command": "editor.action.commentLine",
                "keybinding": "Ctrl+/",
                "source": "default"
            },
            {
                "command": "editor.action.copyLinesDownAction",
                "keybinding": "Ctrl+Alt+Down",
                "source": "default"
            },
            {
                "command": "editor.action.copyLinesUpAction",
                "keybinding": "Ctrl+Alt+Up",
                "source": "default"
            },
            {
                "command": "editor.action.deleteLines",
                "keybinding": "Ctrl+Shift+K",
                "source": "default"
            },
            {
                "command": "editor.action.indentLines",
                "keybinding": "Ctrl+]",
                "source": "default"
            },
            {
                "command": "editor.action.outdentLines",
                "keybinding": "Ctrl+[",
                "source": "default"
            },
            {
                "command": "editor.action.moveLinesDownAction",
                "keybinding": "Alt+Down",
                "source": "default"
            },
            {
                "command": "editor.action.moveLinesUpAction",
                "keybinding": "Alt+Up",
                "source": "default"
            },
            {
                "command": "editor.action.undo",
                "keybinding": "Ctrl+Z",
                "source": "default"
            },
            {
                "command": "editor.action.redo",
                "keybinding": "Ctrl+Y",
                "source": "default"
            },
            {
                "command": "editor.action.selectAll",
                "keybinding": "Ctrl+A",
                "source": "default"
            },
            {
                "command": "editor.action.find",
                "keybinding": "Ctrl+F",
                "source": "default"
            },
            {
                "command": "editor.action.replace",
                "keybinding": "Ctrl+H",
                "source": "default"
            },
            {
                "command": "editor.action.save",
                "keybinding": "Ctrl+S",
                "source": "default"
            },
            {
                "command": "workbench.action.files.saveAll",
                "keybinding": "Ctrl+Shift+S",
                "source": "default"
            },
            {
                "command": "workbench.action.openFolder",
                "keybinding": "Ctrl+K Ctrl+O",
                "source": "default"
            },
            {
                "command": "workbench.action.toggleSidebar",
                "keybinding": "Ctrl+B",
                "source": "default"
            }
        ]
        return {"success": True, "keybindings": keybindings}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def update_keybinding(command, keybinding):
    """Update a keybinding"""
    try:
        # In a real implementation, this would update a configuration file
        # For now, we'll simulate it
        return {"success": True, "message": "Keybinding updated successfully"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def reset_keybindings():
    """Reset all keybindings to default"""
    try:
        # In a real implementation, this would reset a configuration file
        # For now, we'll simulate it
        return {"success": True, "message": "Keybindings reset to default"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def get_last_workspace():
    """Get the last opened workspace"""
    try:
        # In a real implementation, this would read from a configuration file
        # For now, we'll simulate it
        return {"success": True, "workspace_path": "/path/to/last/workspace"}
    except Exception as e:
        return {"success": False, "message": str(e)}

@eel.expose
def get_recent_workspaces():
    """Get a list of recent workspaces"""
    try:
        # In a real implementation, this would read from a configuration file
        # For now, we'll simulate it
        workspaces = [
            {
                "name": "Project1",
                "path": "/path/to/project1"
            },
            {
                "name": "Project2",
                "path": "/path/to/project2"
            },
            {
                "name": "Project3",
                "path": "/path/to/project3"
            }
        ]
        return {"success": True, "workspaces": workspaces}
    except Exception as e:
        return {"success": False, "message": str(e)}



# Start the Eel application
if __name__ == "__main__":
    eel.init(WEB_FOLDER)
    eel.start('index.html', size=(1200, 800))



