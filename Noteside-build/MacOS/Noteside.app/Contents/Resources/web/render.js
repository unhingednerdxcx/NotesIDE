/*
document.getElementById('btn').addEventListener('click', function() {
    // brn
});
*/



document.addEventListener('DOMContentLoaded', function() {
    let zoomRate = 1;
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalOk = document.getElementById('modal-ok');
    const modalInput = document.getElementById('modal-input');
    const modalTitle = document.getElementById('modal-title');
    let modalCallback = null;
    let imgExist = false;
    const contextMenu = document.getElementById('context-menu');
    const contextOpen = document.getElementById('ctx-open');
    const contextRename = document.getElementById('ctx-rename');
    const contextDelete = document.getElementById('ctx-delete');
    const contextCopyPath = document.getElementById('ctx-copy-path');
    const contextNewFile = document.getElementById('ctx-new-file');
    const contextNewFolder = document.getElementById('ctx-new-folder');
    const contextmenuNotes = document.getElementById('context-menu-notes');
    const contextMakeNote = document.getElementById('ctx-new-note');
    const contextRenameNotes = document.getElementById('ctx-rename-notes');
    const contextDeleteNotes = document.getElementById('ctx-delete-notes');
    const contextmenuDict = document.getElementById('context-menu-dict');
    const contextOpenDict = document.getElementById('ctx-open-dict');
    const contextRenameDict = document.getElementById('ctx-rename-dict');
    const contextDeleteDict = document.getElementById('ctx-delete-dict');
    const contextMakeDict = document.getElementById('ctx-new-dict');
    const contextMenuTerminal = document.getElementById('context-menu-t');
    const contextCopyResultTerminal = document.getElementById('ctx-cr-t');
    const contextCopyProductTerminal = document.getElementById('ctx-cp-t');
    const contextCopyTerminal = document.getElementById('ctx-copy-t');
    const contextClearTerminal = document.getElementById('ctx-clear-t');
    let selectedItem = -1;

    window.idecmd =  class{
        static note= class{
            static async pull (file, note){
                await eel.idecmds('note', 'pull', file, note)(function(msg){
                    if (msg.success === 1){
                        const model = editor.getModel();
                        const position = editor.getPosition();
                        const lineNumber = position.lineNumber - 1;

                        const range = new monaco.Range(
                        lineNumber,
                        1,
                        lineNumber,
                        model.getLineMaxColumn(lineNumber)
                        );

                        console.log('Pulling note:', String(msg.b));  // DEBUG LOG

                        model.pushEditOperations([], [
                        { range, text: String(msg.b) }
                        ], () => null);
                        showNotification('Success', 'Pulled note')
                    } else if (msg.success === 2){
                        showNotification('Warning', 'No such file found')
                    } else{
                        showNotification('Fail', `Could not pull note due to ${msg.e}`)
                    }
                })
            }
            static async push(file, note, val){
                await eel.idecmds('note', 'push', file, note, val)(function(msg){
                    if (msg.success === 1){
                        showNotification('Success', 'pushed note')
                    } else if (msg.success === 2){
                        showNotification('Warning', 'No such file found')
                    } else{
                        showNotification('Fail', `Could not push note due to ${msg.e}`)
                    }
                })
            }
            static async clear(file, note){
                await eel.idecmds('note', 'clear', file, note)(function(msg){
                    if (msg.success === 1){
                        showNotification('Success', 'cleared note')
                    } else if (msg.success === 2){
                        showNotification('Warning', 'No such file found')
                    } else if (msg.success === 4){
                        showNotification('Warning', 'No such note file')
                    } else{
                        showNotification('Fail', `Could not clear note due to ${msg.e}`)
                    }
                })
            }
            static async clearAll(file){
                await eel.idecmds('note', 'clearAll', file)(function(msg){
                    if (msg.success === 1){
                        showNotification('Success', 'cleared file')
                    }  else if (msg.success === 2){
                        showNotification('Warning', 'No such file found')
                    } else{
                        showNotification('Fail', `Could not clear file due to ${msg.e}`)
                    }
                });
            }
            static async delete(file){
                await eel.idecmds('note', 'delete', file)(function(msg){
                    if (msg.success === 1){
                        showNotification('Success', 'Deleted note')
                    } else if (msg.success === 2){
                        showNotification('Warning', 'No such file found')
                    } else{
                        showNotification('Fail', `Could not delete note due to ${msg.e}`)
                    }
                })
            }
            static async copy(file, note) {
                await eel.idecmds('note', 'pull', file, note)(function(msg){
                   if (msg.success === 1){
                        navigator.clipboard.writeText(String(msg.b)).then(function() {
                            showNotification('Success', 'Note copied to clipboard');
                        });
                    }
                    else if (msg.success === 2){
                        showNotification('Warning', 'No such file found')
                    } else{
                        showNotification('Fail', `Could not copy note due to ${msg.e}`)
                    }
                })
            }
        }


        static dict= class{
            static async pull (file){
                await eel.idecmds('dict', 'pull', file)(async function(msg){
                    if (msg.success === 1){
                        await dictListDisplay(msg.a)
                        showNotification('Success', 'Pulled dictionary')
                    } else if (msg.success === 2){
                        showNotification('Warning', 'No such file found')
                    } else{
                        showNotification('Fail', `Could not pull dictionary due to ${msg.e}`)
                    }
                })
            }
            static async push(file, name, discription){
                await eel.idecmds('dict', 'push', file, name, discription)(function(msg){
                    if (msg.success === 1){
                        showNotification('Success', 'Pushed dictionary')
                    } else if (msg.success === 2){
                        showNotification('Warning', 'No such file found')
                    } else{
                        showNotification('Fail', `Could not push dictionary due to ${msg.e}`)
                    }
                })
            }
            static async clear(file, word){
                await eel.idecmds('dict', 'clear', file, word)(function(msg){
                    if (msg.success === 1){
                        showNotification('Success', 'Cleared dictionary')
                    } else if (msg.success === 2){
                        showNotification('Warning', 'No such file found')
                    } else if (msg.success === 4){
                        showNotification('Warning', 'No such Keyword found')
                    } else{
                        showNotification('Fail', `Could not clear dictionary due to ${msg.e}`)
                    }
                })
            }
            static async clearAll(file){
                await eel.idecmds('dict', 'clearAll', file)(function(msg){
                    if (msg.success === 1){
                        showNotification('Success', 'Cleared dictionary')
                    } else if (msg.success === 2){
                        showNotification('Warning', 'No such file found')
                    } else{
                        showNotification('Fail', `Could not clear dictionary due to ${msg.e}`)
                    }
                });
            }
            static async delete(file){
                await eel.idecmds('dict', 'delete', file)(function(msg){
                    if (msg.success === 1){
                        showNotification('Success', 'Deleted dictionary')
                    } else if (msg.success === 2){
                        showNotification('Warning', 'No such file found')
                    } else{
                        showNotification('Fail', `Could not delete dictionary due to ${msg.e}`)
                    }
                })
            }
        }

        static sys= class{
            static async closeApp(){
                await eel.idecmds('sys', 'clossApp')()
                window.close();
            }
            static async newFile(name='NewNote'){
                await eel.makeFile(document.getElementById('workspace-name').dataset.path, name)(function(msg){
                    if (msg.success){
                        showNotification('Success', 'Made new file successfully')
                        loadWorkspace(document.getElementById('workspace-name').dataset.path)
                    } else{
                        showNotification('Fail', 'could not make new file successfully')
                    }
                });
            }
        }
    }

    function closewindow(){
        window.close()
    }
    eel.expose(closewindow)

    /* HERE
    CLASS USSAGE MANUEL: (in PSEUDO-dict stucture cuz dict > anything)
    idecmds = {
        notes > {
            pull > idecmdclass.note.pull(file, note), 
            push > idecmdclass.note.push(file, note, value),
            clear > idecmdclass.note.clear(file, note),
            clearAll > idecmdclass.note.clearAll(file),
            delete > idecmdclass.note.delete(file, note),
            info > idecmdclass.note.info(file, note),
            copy > idecmdclass.note.copy(file, note),
            addProperty > idecmdclass.note.addProperty(file, note, property, value),
            removeProperty > idecmdclass.note.removeProperty(file, note, property)
        },
        dict > {
            pull > idecmdclass.dict.pull(file, note), 
            push > idecmdclass.dict.push(file, note, value),
            clear > idecmdclass.dict.clear(file, note),
            clearAll > idecmdclass.dict.clearAll(file),
            delete > idecmdclass.dict.delete(file, note),
            info > idecmdclass.dict.info(file, note),
            copy > idecmdclass.dict.copy(file, note),
            addProperty > idecmdclass.dict.addProperty(file, note, property, value),
            removeProperty > idecmdclass.dict.removeProperty(file, note, property)
        },
        system > {
            closeApp > idecmdclass.closeApp(),
            newFile > () => idecmdclass.newFile()
        }
    }
    */

    contextClearTerminal.addEventListener('click', function(){
        try{
            document.getElementById("command-list").innerHTML = "";
            showNotification('Success', 'Was able to clear terminal')
        } catch (e){
            showNotification('Fail', `Could not clear notification due to ${e}`)
        }
    });

    function togglePopup() {
        document.getElementById('dictionary-popup').classList.toggle('active');
        document.getElementById('popup-overlay').classList.toggle('active');
        const searchInput = document.getElementById('popup-search');
        if (document.getElementById('dictionary-popup').classList.contains('active')) searchInput.focus();
    }



    async function dictListDisplay(data) {
        const popupList = document.getElementById("popup-list");
        const searchInput = document.getElementById('popup-search');
        popupList.innerHTML = ""; // clear previous items

        // Create list items
        Object.entries(data).forEach(([key, value]) => {
            const li = document.createElement('li');
            li.dataset.name = key;

            const titleDiv = document.createElement("div");
            titleDiv.className = "popup-title";

            const icon = document.createElement("i");
            icon.className = "fas fa-pen";
            titleDiv.appendChild(icon);
            titleDiv.appendChild(document.createTextNode(` ${key}`));

            const span = document.createElement("span");
            titleDiv.appendChild(span);

            const descDiv = document.createElement("div");
            descDiv.className = "popup-description";
            descDiv.textContent = value;

            li.addEventListener('click', () => {
                const model = editor.getModel();
                const position = editor.getPosition();

                const lineNumber = position.lineNumber -1;
                const lineContent = model.getLineContent(lineNumber);

                // replace the whole line
                model.pushEditOperations(
                    [],
                    [{
                        range: new monaco.Range(
                            lineNumber,
                            1,
                            lineNumber,
                            lineContent.length + 1
                        ),
                        text: li.dataset.name
                    }],
                    () => null
                );
                togglePopup();
            });

            li.appendChild(titleDiv);
            li.appendChild(descDiv);
            popupList.appendChild(li);
        });

        const listItems = Array.from(document.querySelectorAll('#popup-list li'));



        // Keyboard navigation (attach once)
        searchInput.onkeydown = (e) => {
            const visibleItems = listItems.filter(i => i.style.display !== 'none');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedItem = (selectedItem + 1) % visibleItems.length;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedItem = selectedItem <= 0 ? visibleItems.length - 1 : selectedItem - 1;
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedItem >= 0) visibleItems[selectedItem].click();
            }

            // Update selected class
            listItems.forEach(i => i.classList.remove('selected'));
            if (selectedItem >= 0 && selectedItem < visibleItems.length) {
                visibleItems[selectedItem].classList.add('selected');
            }
        };

        togglePopup();
    }






    // == FREQ USE FUNCTIONS == //

    function log(info, other){
        eel.log('js', info, other);
    }

    window.switchTab = function(tabNumber) {
        const tabs = {
            1: { id: 'main-ide-content', name: 'main-ide', 'func': loadEditor},
            2: { id: 'notes-content', name: 'notes', 'func': loadNotes},
            3: { id: 'dictionary-content', name: 'dictionary', 'func': loadDict},/*
            4: { id: 'ports-content', name: 'ports' }, */
            4: { id: 'circuits-pcb-content', name: 'circuits-pcb' },
            5: { id: 'terminal-content', name: 'terminal' },
            6: { id: 'settings-content', name: 'settings' }
        };

        const tab = tabs[tabNumber];
        if (!tab) return;
        // Terminal-specific visibility
        document.getElementById("terminal-content").style.display = "none";

        if (tab.name === 'terminal') {
            document.getElementById("terminal-content").style.display = "block";
            workspace = document.getElementById('workspace-name');
            const path = workspace.dataset.path;
            eel.startshell(path)();
        }
        if (tab.func) tab.func();

        switch (tabNumber){
            case 4:
                workspace.dataset.tab = "circuit";
                break;
            case 5:
                workspace.dataset.tab = "terminal";
                break;
            case 6:
                workspace.dataset.tab = "settings";
                break;
            default:
                break;
        }


        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.top-tab').forEach(b => b.classList.remove('active'));

        const selectedTab = document.getElementById(tab.id);
        if (!selectedTab) return;

        selectedTab.classList.add('active');
        const activeButton = document.querySelector(`[data-tab="${tab.name}"]`);
        if (activeButton) activeButton.classList.add('active');

       
    };



    function showNotification(title, message) {
        const notificationBox = document.getElementById('notification-box');
        const closeBtn = document.getElementById('notification-close');
        document.getElementById('notification-title').textContent = title;
        document.getElementById('notification-message').textContent = message;
        notificationBox.classList.add('show');
        const timer = setTimeout(() => {
            notificationBox.classList.remove('show');
        }, 4000);
        closeBtn.addEventListener('click', function(){
            clearTimeout(timer);
            notificationBox.classList.remove('show');
        });
    }

    // === ON PRESSED BUTTON FUNCTIONS === //
    // Hide menu on click outside
    document.addEventListener("click", (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = "none";
        }
        if (!contextmenuNotes.contains(e.target)) {
            contextmenuNotes.style.display = "none";
        }
        if (!contextmenuDict.contains(e.target)) {
            contextmenuDict.style.display = "none";
        }
        if (!contextMenuTerminal.contains(e.target)) {
            contextMenuTerminal.style.display = "none";
        }
        if (document.getElementById('dictionary-popup').classList.contains('active') && !document.getElementById('dictionary-popup').contains(e.target)) {
            togglePopup();
        }
        /*
        e.preventDefault();
        e.stopPropagation();
        */
    });

    document.getElementById('open-folder-btn').addEventListener('click', function() {
        eel.openFolder()(function(msg){
            if (msg.success){
                let path = msg.path;
                log(`Sent ${path}`, '');
                wScreen = document.getElementById('welcome-screen');
                wScreen.classList.remove('show');
                loadWorkspace(path);
            } else{
                sendNotification(false, e, 1);
            }
        });
    });

    document.getElementById('workspace-btn').addEventListener('click', function() {
            eel.openFolder()(function(msg){
            if (msg.success){
                path = msg.path;
                log(`Sent ${path}`, ''); 
                loadWorkspace(path);
            } else{
                sendNotification(false, e, 1)
            }
        });
    });

    document.getElementById('save-all-btn').addEventListener('click', function() {
        Array.from(fileTabs.children).forEach(function(file){
            if(file.dataset.type === 'file'){
                let path = file.dataset.path;
                eel.readFile(path, file.dataset.name)(async function(msg){
                    if (msg.success){
                        let content = msg.content
                        eel.saveFile(content)(function(msg){
                            if (msg.success){
                                showNotification('Success', 'Saved all files successfully!');
                            } else {
                                showNotification('Fail', 'Could not save all files successfully!');
                            }
                        });
                    }
                    else{
                        showNotification('Fail', `Could not read all files due to ${msg.error}`);
                    }
                });
            }
        });
    });

    document.getElementById('settings-btn').addEventListener('click', function() {
        switchTab(7)
        log(`Switched to tab 7`, '');
    });

    document.getElementById('open-recent-btn').addEventListener('click', async function() {
        document.querySelector('.app-container').style.display = 'block';
        path = await eel.getLastWorkspace()();
        log("PATH", !path)
        if (!path) {
            eel.jsonmanager('s', 'app', 'Restore', false)();
            showNotification('Info', 'No recent workspace found, please open a folder the next time you use the app');
            setTimeout(() => {
                idecmd.sys.closeApp();
            }, 5000);
        }
        document.getElementById('workspace-name').textContent = path.split('/').pop() || path.split('\\').pop();
        document.getElementById('workspace-name').dataset.path = path;

        eel.listFiles(path)(function(msg){
            populateFiles(msg.files);
        });
    });

    document.getElementById('refresh-files-btn').addEventListener('click', function() {
        loadEditor()
    });

    document.getElementById('new-file-btn').addEventListener('click', async function() {
        workspace = document.getElementById('workspace-name');
        const path = workspace.dataset.path;
        const fileName = await showModal('Enter file name', 'Newfile.txt');
        log('got filename:', fileName)
        eel.makeFile(path, fileName)(function(msg){
            if (msg.success){
                showNotification('Success', 'File made successfully');
                eel.listFiles(path)(function(msg){
                    if (msg.success) {
                        document.getElementById('welcome-screen').style.display = 'none';
                        document.querySelector('.app-container').style.display = 'block';
                        document.getElementById('workspace-name').textContent = path.split('/').pop() || path.split('\\').pop();
                        workspace = document.getElementById('workspace-name');
                        workspace.dataset.path = path;
                        populateFiles(msg.files);
                    } else{
                        showNotification('Fail', msg.error);
                    }
                });
            } else{
                showNotification('Fail', `Could not make file due to ${msg.message}`)
            }
        })
    });

    document.getElementById('new-folder-btn').addEventListener('click', function() {
        workspace = document.getElementById('workspace-name');
        const path = workspace.dataset.path;
        eel.makeFolder(path)(function(msg){
            if (msg.success){
                showNotification('Success', 'File made successfully');
            } else{
                showNotification('Fail', `Could not make file due to ${msg.message}`)
            }
        })
    });

    document.getElementById('run-btn').addEventListener('click', function() {
        cmd = eel.GetCmdForFile(document.getElementById('workspace-name').dataset.filename)(function(msg){
            switchTab(5)
            document.getElementById('command-input').value = String(msg)
        });
    });

    document.getElementById('save-btn').addEventListener('click', async function() {
        content = editor.getValue();
        const file_path = document.getElementById('current-file-name').dataset.path;
        if (file_path) {
            if (await eel.jsonmanager('g', 'editor', 'Trim')() == true){
                content = content.split('\n').map(line => line.replace(/\s+$/g, '')).join('\n');
            }
            eel.saveFile(content, file_path)(function(msg) {
                if (msg.success) {
                    showNotification('Success', 'File saved successfully');
                } else {
                    showNotification('Error', msg.message);
                }
            });
        } else {
            // Show save as dialog
            SaveAs();
        }
    });

    document.getElementById('new-note-btn').addEventListener('click', async function() {
        const fileName = await showModal('Enter file name', 'NewNote');
        eel.newNote(fileName)(function(msg){
            if (!fileName || !fileName.trim()) {
                log('User canceled or entered empty file name', '');
                return; // don't call Python if no input
            }
            log('m', msg);
            if (msg.success){
                showNotification('Success', 'New note made succesfully!');
                eel.listNotes()(function(msg){
                    if (msg.success){
                        populateNotesList(msg.Notes)
                    } else{
                        showNotification('Fail', `Could not display notes due to ${msg.error}`)
                    }
                });
            } else{
                showNotification('Fail', `New note could not be made due to ${msg.error}`);
            }
        });
    });

    document.getElementById('save-note-btn').addEventListener('click', function() {
        const content = noteEditor.getValue();
        const NoteName = document.getElementById('current-note-name').textContent;
        eel.saveNote(NoteName, content)(function(msg){
            if (!msg.success){
                showNotification('Fail', `Could not save note due to ${msg.e}`);
            } else {
                showNotification('Success', 'Saved note')
            }
        });
    });

    document.getElementById('new-dictionary-btn').addEventListener('click', async function() {
        const fileName = await showModal('Enter file name', 'NewDict');
        log('filename for dict:', fileName)
        eel.newDict(fileName)(function(msg){
            log('', msg.success);
            if (msg.success){
                showNotification('Success', 'New Dictionary made succesfully!');
                loadDict()
            } else{
                showNotification('Fail', `New Dictionary could not be made due to ${msg.error}`);
            }
        });
    });

    document.getElementById('save-dictionary-btn').addEventListener('click', function() {
        const content = dictEditor.getValue();
        const dictName = document.getElementById('current-dictionary-name').textContent;
        eel.saveDict(dictName, content)(function(msg){
            if (!msg.success){
                showNotification('Fail', `Could not save note due to ${msg.e}`);
            } else {
                showNotification('Success', 'Saved dictionary')
            }
        });
    });

    document.getElementById('load-image-btn').addEventListener('click', function() {
        eel.displayPic()(async function(msg){
            if (msg.success){
                showNotification('Success', 'Loaded immage successfully');
                try {
                    const imgHolder = document.getElementById("image-preview");
                    const placeholder = document.getElementById("placeholder");

                    const img = document.createElement("img");
                    img.src = msg.img; 
                    img.alt = "Circuit Preview";
                    // Remove placeholder
                    if (placeholder) placeholder.remove();
                    img.id = "placeholder"
                    imgExist = true;
                    // Add image
                    imgHolder.appendChild(img);
                } catch (e){
                    showNotification('Fail', `image could not be loaded due to ${e}`);
                }
            }
            else{
                showNotification('Fail', `Could not loaded immage due to ${msg.e}`);
            }
        });
    });

    document.getElementById('zoom-in-btn').addEventListener('click', function() {
        if(imgExist){
            imgBlock = document.getElementById('placeholder');
            zoomRate += 0.2;
            if (zoomRate >= 0 && zoomRate <= 2.2){
                imgBlock.style.transform = `scale(${zoomRate})`;
            } else {
                zoomRate = 1;
            }
        }
    });

    document.getElementById('zoom-out-btn').addEventListener('click', function() {
        if (imgExist){
            imgBlock = document.getElementById('placeholder');
            zoomRate -= 0.2;
            if (zoomRate >= 0 && zoomRate <= 2.2){
                imgBlock.style.transform = `scale(${zoomRate})`;
            } else {
                zoomRate = 1;
            }
        }
    });


/*
    document.getElementById('port-select-btn').addEventListener('click', function() {
        const portFileBtn = this;
        eel.openUploadFile()(function(msg){
            if (msg.success) {
                portFileBtn.dataset.path = msg.path;
                document.getElementById("text-file-path").placeholder = msg.path;
                log('at prts', `${msg.path} and ${portFileBtn.dataset.path}`)
            } else{
                showNotification(`Fail`, `Couldn't open file due to ${msg.e}`)
            }
        });
    });


    document.getElementById('refresh-ports-btn').addEventListener('click', function() {
        loadPorts();
    });

    document.getElementById('verbose-output').addEventListener('change', function() {
        const isChecked = this.checked;  // true or false
        this.dataset.checked = isChecked ? "True" : "False";
        log('verbose', isChecked);
    });

    document.getElementById('verify-upload').addEventListener('change', function() {
        const isChecked = this.checked;
        this.dataset.checked = isChecked ? "True" : "False";
        log("verify-upload", isChecked);
    });
    */


    contextOpen.addEventListener('click', function() {
        const path = contextMenu.dataset.path;
        const name = contextMenu.dataset.name;
        const type = contextMenu.dataset.type;
        
        if (type === 'file') {
            openFile(path, name);
        } else {
            // Handle folder opening
        }
        contextMenu.style.display = "none";
    });

    contextRename.addEventListener('click', async function() {
        const path = contextMenu.dataset.path;
        const name = contextMenu.dataset.name;
        const type = contextMenu.dataset.type;
        
        const newName = await showModal('Enter new name', name);
        if (newName && newName.trim() !== '') {
            eel.renameFile(newName, path, name)(function(msg) {
                if (msg.success) {
                    showNotification('Success', 'Renamed successfully');
                    // Refresh the file tree
                    const workspace = document.getElementById('workspace-name');
                    loadWorkspace(workspace.dataset.path);
                } else {
                    showNotification('Error', msg.message);
                }
            });
        }
        contextMenu.style.display = "none";
    });

    contextDelete.addEventListener('click', async function() {
        const path = contextMenu.dataset.path;
        const name = contextMenu.dataset.name;
        const type = contextMenu.dataset.type;
        if (await confirmBefore(`Are you sure you want to delete ${name}?`)) {
            eel.deleteFile(path)(function(msg) {
                if (msg.success) {
                    showNotification('Success', 'Deleted successfully');
                    const workspace = document.getElementById('workspace-name');
                    loadWorkspace(workspace.dataset.path);
                } else {
                    showNotification('Error', msg.message);
                }
            });
        }
        contextMenu.style.display = "none";
    });

    contextCopyPath.addEventListener('click', function() {
        const path = contextMenu.dataset.path;
        
        // Copy to clipboard
        navigator.clipboard.writeText(path).then(function() {
            showNotification('Success', 'Path copied to clipboard');
        }, function(err) {
            showNotification('Error', 'Could not copy path');
        });
        contextMenu.style.display = "none";
    });


    contextNewFile.addEventListener('click', function(){
        let path = contextMenu.dataset.path;
        path = path.substring(0, path.lastIndexOf('/'));
        eel.makeFile(path, 'NewFile.txt')(function(msg){
            if (!msg.success){
                showNotification('Fail', `Could not load fule due to ${msg.e}`)
            } else{
                showNotification('Success', 'Could make a new file');
                const workspace = document.getElementById('workspace-name');
                loadWorkspace(workspace.dataset.path);
            }
        });
    });

    contextNewFolder.addEventListener('click', function(){
        let path = contextMenu.dataset.path;
        path = path.substring(0, path.lastIndexOf('/'));
        eel.makeNewFolder(path)(function(msg){
            if (msg.success){
                showNotification('Success', 'Was able to load a new folder');
                const workspace = document.getElementById('workspace-name');
                loadWorkspace(workspace.dataset.path);
            } else{
                showNotification('Fail', `Was not able to load file due to ${msg.e}`)
            }
        });
    });

    contextMakeNote.addEventListener('click', function(){
        eel.newNote('NewNote')(function(msg){
            if (msg.success == false){
                showNotification('Fail', `Could not make new note due to: ${msg.e}`);
            }
            else{
                showNotification('Success', 'Renamed successfully');
                // Refresh the file tree
                loadNotes();
            }
        });
    });

    contextRenameNotes.addEventListener('click', async function(){
        const name = contextmenuNotes.dataset.name;

        const newName = await showModal('Enter new name', name);
        if (newName && newName.trim() !== '') {
            eel.renameFile(newName, 'NFOLDER', name)(function(msg) {
                if (msg.success) {
                    showNotification('Success', 'Renamed successfully');
                    // Refresh the file tree
                    loadNotes();
                } else{
                    log('', msg.message);
                    showNotification('Fail', `Could not load notes due to ${msg.message}`)
                }
            });
        }
    });

    contextDeleteNotes.addEventListener('click', async function(){
        const name = contextmenuNotes.dataset.name;
        if (await confirmBefore(`Are you sure you want to delete ${name}?`)){
        eel.deleteFile(contextmenuNotes.dataset.path)(function(msg){
            if (msg.success == true){
                showNotification('Succes', 'Was able to delete Notes');
                loadNotes();
            } else{
                showNotification('Fail', `could not delete file due to ${msg.message}`);
            }
        });
    }
    });


    contextOpenDict.addEventListener('click', function(){
        log('', '')
    });

    contextRenameDict.addEventListener('click', async function(){
        const name = contextmenuDict.dataset.name;

        const newName = await showModal('Enter new name', name);
        if (newName && newName.trim() !== '') {
            eel.renameFile(newName, 'DFOLDER', name)(function(msg) {
                if (msg.success) {
                    showNotification('Success', 'Renamed successfully');
                    // Refresh the file tree
                    loadDict();
                } else{
                    log('', msg.message);
                    showNotification('Fail', `Could not load dictionary due to ${msg.message}`)
                }
            });
        }
    });

    contextDeleteDict.addEventListener('click', async function(){
        const name = contextmenuDict.dataset.name;
        if (await confirmBefore(`Are you sure you want to delete ${name}?`)){
            eel.deleteFile(contextmenuDict.dataset.path)(function(msg){
                if (msg.success == true){
                    showNotification('Succes', 'Was able to delete Dictionary');
                    loadDict();
                } else{
                    showNotification('Fail', `could not delete file due to ${msg.message}`);
                }
            });
        }
    });


    contextMakeDict.addEventListener('click', function(){
        eel.newDict('NewDict')(function(msg){
            if (msg.success == false){
                showNotification('Fail', `Could not make new file due to: ${msg.message}`);
            }
            else{
                showNotification('Success', 'Renamed successfully');
                loadDict();
            }
        });
    });

    contextCopyResultTerminal.addEventListener('click', function(){
        try{
            navigator.clipboard.writeText(contextMenuTerminal.dataset.result);
            showNotification('Success', 'Result copied to clipboard!');
        }
        catch{
            showNotification('Fail', 'Result could not be copied to clipboard');
        }
    });

    contextCopyProductTerminal.addEventListener('click', function(){
        try{
            navigator.clipboard.writeText(contextMenuTerminal.dataset.cmd);
            showNotification('Success', 'Command copied to clipboard!');
        }
        catch{
            showNotification('Fail', 'Command could not be copied to clipboard');
        }
    });

    contextCopyTerminal.addEventListener('click', function(){
        try{
            navigator.clipboard.writeText(`${contextMenuTerminal.dataset.cmd} Result: ${contextMenuTerminal.dataset.result}`);
            showNotification('Success', 'Console copied to clipboard!');
        }
        catch {
            showNotification('Success', 'Console could not be copied to clipboard');
        }
    });

    document.addEventListener('keydown', async function(e){
        if (e.altKey && !isNaN(e.key)) {
            switchTab(Number(e.key));
        }
        if((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault(); 
            switch (document.getElementById('workspace-name').dataset.tab){
                case 'editor':
                    content = editor.getValue();
                    const file_path = document.getElementById('current-file-name').dataset.path;
                    if (file_path) {
                        if (await eel.jsonmanager('g', 'editor', 'Trim')() == true){
                            content = content.split('\n').map(line => line.replace(/\s+$/g, '')).join('\n');
                        }
                        eel.saveFile(content, file_path)(function(msg) {
                            if (msg.success) {
                                showNotification('Success', 'File saved successfully');
                            } else {
                                showNotification('Error', msg.message);
                            }
                        });
                    }
                    break;
                case 'note':
                    content = noteEditor.getValue();
                    const NoteName = document.getElementById('current-note-name').textContent;
                    eel.saveNote(NoteName, content)(function(msg){
                        if (!msg.success){
                            showNotification('Fail', `Could not save note due to ${msg.e}`);
                        } else {
                            showNotification('Success', 'Saved note')
                        }
                    });
                    break;
                case 'dict':
                    content = dictEditor.getValue();
                    const dictName = document.getElementById('current-dictionary-name').textContent;
                    eel.saveDict(dictName, content)(function(msg){
                        if (!msg.success){
                            showNotification('Fail', `Could not save note due to ${msg.e}`);
                        } else {
                            showNotification('Success', 'Saved dictionary')
                        }
                    });
                    break;
                default:
                    break;
            }
        }
    });





    // === MAIN === //
    updateTime();
    setInterval(updateTime, 1000);
    startUp()
   

    // === FUNCTIONS === //
    window.refresh = function(type){
        switch(type){
            case 'Main': loadEditor();
            case 'Note': loadNotes();
            case 'Dict': loadDict();
        }
    }

    async function startUp(){
        if (await eel.jsonmanager('g', 'app', 'Restore')() === true){
            document.querySelector('.app-container').style.display = 'block';
            path = await eel.getLastWorkspace()();
            log("PATH", !path)
            if (!path) {
                eel.jsonmanager('s', 'app', 'Restore', false)();
                idecmd.sys.closeApp();
            }
            document.getElementById('workspace-name').textContent = path.split('/').pop() || path.split('\\').pop();
            document.getElementById('workspace-name').dataset.path = path;

            eel.listFiles(path)(function(msg){
                populateFiles(msg.files);
            });
            
        } else{
            log('RESTORE', eel.jsonmanager('g', 'app', 'Restore')())
            wScreen = document.getElementById('welcome-screen');
            wScreen.style.display = 'flex'
        }
    }
    

    async function idecmdhandeler(lineText){
        try {
            // Improved regular expression for better argument handling
            const match = lineText.match(/^idecmd\.(\w+)\.(\w+)\((.*)\)$/);
            if (!match) {
                showNotification('Fail', "Could not run command due to invalid command format");
                return;
            }

            const clsName = match[1];    // e.g., "note"
            const methodName = match[2]; // e.g., "pull"
            const argsString = match[3]; // e.g., "'file','note'"

            // Safer argument parsing
            let args;
            try {
                // Try to parse directly first
                args = JSON.parse(`[${argsString}]`);
            } catch (e) {
                // If it fails, try replacing single quotes with double quotes
                args = JSON.parse(`[${argsString.replace(/'/g, '"')}]`);
            }

            // Check if the class exists
            if (!idecmd[clsName]) {
                showNotification('Fail', `Class not found: ${clsName}`);
                return;
            }
            
            // Check if the method exists
            if (typeof idecmd[clsName][methodName] !== "function") {
                showNotification('Fail', `Method not found: ${clsName}.${methodName}`);
                return;
            }

            // Call the method and add logging
            console.log(`Executing: idecmd.${clsName}.${methodName}(${args.join(', ')})`);
            await idecmd[clsName][methodName](...args);
            
        } catch (e) {
            console.error('idecmd error:', e);
            showNotification('Fail', `Could not run function due to ${e}`);
        }

    }



    async function editLoad(){
        window.editor = null;
        theme = await eel.jsonmanager('g', 'appear', 'Editortheme')();
        fontsize = await eel.jsonmanager('g', 'appear', 'Fontsize')();1
        miniMap = await eel.jsonmanager('g', 'editor', 'Minimap')();
        lines = await eel.jsonmanager('g', 'editor', 'Linenumber', 'js1')() === true ? "on" : "off";
        tabs = parseInt(String(await eel.jsonmanager('g', 'editor', 'Tabsize')()).trim(), 10) || 4;
        wrap = await eel.jsonmanager('g', 'editor', 'Wordwrap')() === true ? "on" : "off";
        bracket = await eel.jsonmanager('g', 'editor', 'Fillbracket')() === true ? "always" : "never";
        form = await eel.jsonmanager('g', 'editor', 'Formatsave')()
        style = await eel.jsonmanager('g', 'editor', 'Cursorstyle')()
        blink = await eel.jsonmanager('g', 'editor', 'Cursorblink')() == true ? "bink" : "solid"

        log("setting:", `${form}`)

        window.editorReady = new Promise(resolve => {
            require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' }});
            require(['vs/editor/editor.main'], function() {
                window.editor = monaco.editor.create(document.getElementById('editor'), {
                    value: '// Main editor!',
                    language: 'plaintext',
                    theme: theme,
                    automaticLayout: true,
                    fontSize: fontsize,
                    minimap: { enabled: miniMap },
                    lineNumbers: lines,
                    tabSize: tabs,
                    insertSpaces: true,
                    wordWrap: wrap,
                    autoClosingBrackets: bracket,
                    formatOnPaste: form,
                    formatOnType: form,
                    cursorStyle: style, 
                    cursorBlinking: blink,
                });

                window.noteEditor = monaco.editor.create(document.getElementById('note-editor'), {
                    value: '// Notes editor!',
                    language: 'yaml',
                    theme: theme,
                    automaticLayout: true,
                    fontSize: fontsize,
                    minimap: { enabled: miniMap },
                    lineNumbers: lines,
                    tabSize: tabs,
                    insertSpaces: true,
                    wordWrap: wrap,
                    autoClosingBrackets: bracket,
                    formatOnPaste: form,
                    formatOnType: form,
                    cursorStyle: style, 
                    cursorBlinking: blink,
                });

                window.dictEditor = monaco.editor.create(document.getElementById('dictionary-editor'), {
                    value: '// Dictionary editor!',
                    language: 'yaml',
                    theme: theme,
                    automaticLayout: true,
                    fontSize: fontsize,
                    minimap: { enabled: miniMap },
                    lineNumbers: lines,
                    tabSize: tabs,
                    insertSpaces: true,
                    wordWrap: wrap,
                    autoClosingBrackets: bracket,
                    formatOnPaste: form,
                    formatOnType: form,
                    cursorStyle: style, 
                    cursorBlinking: blink,
                });

                // Handler for the note editor
                function handleNoteEditorEnter() {
                    noteEditor.focus();
                    setTimeout(() => {
                        const model = noteEditor.getModel();
                        const position = noteEditor.getPosition();
                        const lineText = model.getLineContent(position.lineNumber).trim();
                        if (!lineText.includes("idecmd")) {
                            noteEditor.trigger('keyboard', 'type', { text: '\n' });
                            return;
                        }
                        noteEditor.trigger('keyboard', 'type', { text: '\n' });
                    }, 10);
                }

                // Handler for the dictionary editor
                function handleDictEditorEnter() {
                    dictEditor.focus();
                    setTimeout(() => {
                        const model = dictEditor.getModel();
                        const position = dictEditor.getPosition();
                        const lineText = model.getLineContent(position.lineNumber).trim();
                        if (!lineText.includes("idecmd")) {
                            dictEditor.trigger('keyboard', 'type', { text: '\n' });
                            return;
                        }
                        console.log("Dict Editor Command Executed");
                        dictEditor.trigger('keyboard', 'type', { text: '\n' });
                    }, 10);
                }
               
                noteEditor.addCommand(monaco.KeyCode.Enter, handleNoteEditorEnter);
                dictEditor.addCommand(monaco.KeyCode.Enter, handleDictEditorEnter);

                editor.onKeyDown(e => {
                    if (e.keyCode === monaco.KeyCode.Enter) {
                        e.stopPropagation();
                        const model = editor.getModel();
                        const position = editor.getPosition();
                        const lineText = model.getLineContent(position.lineNumber).trim();
                        log('Line Text in editor:', lineText);
                        if (!lineText.includes("idecmd")) {
                            return;
                        }
                        idecmdhandeler(lineText);
                        console.log("Main Editor Command Executed");
                    }
                });

                noteEditor.onKeyDown(e => {
                    if (e.keyCode === monaco.KeyCode.Enter) {
                        e.stopPropagation();
                    }
                });

                dictEditor.onKeyDown(e => {
                    if (e.keyCode === monaco.KeyCode.Enter) {
                        e.stopPropagation();
                    }
                });
                resolve(window.editor); // resolves when the main editor is ready
            });
        });
        autosaveLoop();
    }
    
    editLoad();

    
    // == EDITOR == //
    window.loadEditor = function(){
        const workspace = document.getElementById('workspace-name');
        workspace.dataset.tab = "editor";
        const path = workspace.dataset.path;
        dictEditor.getDomNode().style.display = "none";
        noteEditor.getDomNode().style.display = "none";
        editor.getDomNode().style.display = "flex";
        loadWorkspace(path)
    }
    function loadWorkspace(path){
        eel.listFiles(path)(function(msg){
            if (msg.success) {
                document.getElementById('welcome-screen').style.display = 'none';
                document.querySelector('.app-container').style.display = 'block';
                document.getElementById('workspace-name').textContent = path.split('/').pop() || path.split('\\').pop();
                document.getElementById('workspace-name').dataset.path = path;
                populateFiles(msg.files);
            } else{
                showNotification('Fail', msg.error);
            }
        });
    }
    async function confirmBefore(title) {
        if (await eel.jsonmanager('g', 'app', "Confirm")() === false){
            return true;
        }
        log('confirm:', await eel.jsonmanager('g', 'app', "Confirm")())
        return new Promise(resolve => {
            const modalTitle = document.getElementById('modal-title-kn');
            const modal = document.getElementById('modal-kn');
            const modalOk = document.getElementById('modal-ok-kn');
            const modalCancel = document.getElementById('modal-cancel-kn');
            const modalClose = document.getElementById('modal-close-kn');

            modalTitle.textContent = title;
            modal.classList.add('show');

            // Named handlers
            const okHandler = () => {
                resolve(true);
                closeModal();
            };

            const cancelHandler = () => {
                resolve(false);
                closeModal();
            };

            const closeHandler = () => {
                closeModal();
            };

            function closeModal() {
                modal.classList.remove('show');
                removeListeners();
            }

            function removeListeners() {
                modalOk.removeEventListener('click', okHandler);
                modalCancel.removeEventListener('click', cancelHandler);
                modalClose.removeEventListener('click', closeHandler);
            }

            // Attach event listeners
            modalOk.addEventListener('click', okHandler);
            modalCancel.addEventListener('click', cancelHandler);
            modalClose.addEventListener('click', closeHandler);
        });
    }


   

    function populateFiles(files) {
        const fileTree = document.getElementById('file-tree');
        fileTree.innerHTML = '';

        files.forEach(function(object){
            const li = document.createElement('li');
            li.className = 'file-tree-name';

            if (object.type === 'folder'){
                li.innerHTML = `
                <i class="fas fa-folder"></i>
                <span>${object.name}</span>
                `;
            } else {
                li.innerHTML =`
                <i class="fas fa-file"></i>
                <span>${object.name}</span>
                `;
            }

            li.dataset.path = object.path;
            li.dataset.name = object.name;
            li.dataset.type = object.type;

            li.addEventListener('click', function(){
                if (object.type === 'file'){
                    openFile(object.path, object.name);
                    workspace = document.getElementById('workspace-name');
                    workspace.dataset.filename = li.dataset.name;
                }
            });

            // Right-click (context menu)
            li.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Show menu at mouse position
                contextMenu.style.display = "block";
                contextMenu.style.left = `${e.pageX}px`;
                contextMenu.style.top = `${e.pageY}px`;

                // Store details for button actions
                contextMenu.dataset.path = object.path;
                contextMenu.dataset.name = object.name;
                contextMenu.dataset.type = object.type;
            });


            fileTree.appendChild(li);
        });
    }

    function openFile(path, name){
        eel.readFile(path, name)(function(msg){
            if (msg.success){
                // Wait until the editor is ready, then set its content
                window.editorReady.then(() => {
                    editor.setValue(msg.content);
                    const model = editor.getModel();
                    monaco.editor.setModelLanguage(model, msg.language);
                    document.getElementById('current-file-name').textContent = name;
                    document.getElementById('current-file-name').dataset.path = path;
                    document.getElementById('status-file').textContent = name;
                    document.getElementById('status-lang').textContent = msg.language;
                    addTab(name, path);
                });
            } else {
                showNotification('Error', msg.message);
            }
        });
    }


    
    function addTab(name, path){
        const fileTabs = document.getElementById('file-tabs');
        const fileExist = Array.from(fileTabs.children).find(function(tab) {
            return tab.dataset.path === path;
        });

        if(fileExist){
            // Activate existing tab
            document.querySelectorAll('.file-tab').forEach(function(tab){ 
                tab.classList.remove('active');
            });
            fileExist.classList.add('active');
            return; // Exit since we're using an existing tab
        }
        
        // Create new tab if it doesn't exist
        const tab = document.createElement('div');
        tab.className = 'file-tab active';
        tab.dataset.path = path;
        tab.innerHTML = `
            <span class="tab-name">${name}</span>
            <button class="close-tab-btn">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.querySelectorAll('.file-tab').forEach(t => 
            t.classList.remove('active')
        );

        tab.querySelector('.close-tab-btn').addEventListener('click', function(e) {
            e.stopPropagation();
            fileTabs.removeChild(tab);
            
            // If this was the active tab, activate another one
            if (fileTabs.children.length > 0) {
                fileTabs.children[0].classList.add('active');
                // Load the file for the new active tab
                const newPath = fileTabs.children[0].dataset.path;
                const newName = fileTabs.children[0].querySelector('span').textContent;
                openFile(newPath, newName);
            } else {
                // No tabs left, clear editor
                editor.setValue('');
                document.getElementById('current-file-name').textContent = 'Untitled';
                document.getElementById('current-file-name').removeAttribute('data-path');
            }
        });
        
        // Add click to activate tab
        tab.addEventListener('click', function() {
            document.querySelectorAll('.file-tab').forEach(t => 
                t.classList.remove('active')
            );
            tab.classList.add('active');
            openFile(path, name);
        });
        
        fileTabs.appendChild(tab);
    }

    

    function updateTime() {
        const now = new Date();
        const hour = now.getHours().toString().padStart(2, '0');
        const min = now.getMinutes().toString().padStart(2, '0');
        const second = now.getSeconds().toString().padStart(2, '0');
        
        document.getElementById('current-time').textContent = `${hour}:${min}:${second}`;
    }



    async function showModal(title, defaultValue = '') {
        return new Promise(resolve => {
            const modalTitle = document.getElementById('modal-title');
            const modalInput = document.getElementById('modal-input');
            const modal = document.getElementById('modal');
            const modalOk = document.getElementById('modal-ok');
            const modalCancel = document.getElementById('modal-cancel');
            const modalClose = document.getElementById('modal-close');

            modalTitle.textContent = title;
            modalInput.value = defaultValue;

            // show modal
            modal.classList.add('show');
            modalInput.focus();
            modalInput.select();
            

            const okHandler = () => { resolve(modalInput.value); closeModal(); };
            const cancelHandler = () => { resolve(null); closeModal(); };
            const keyHandler = e => {
                if (!modal.classList.contains('show')) {
                    return; // Do nothing if the modal isn't showing
                }
                if (e.key === 'Enter') okHandler();
                else if (e.key === 'Escape') cancelHandler();
            };

            function closeModal() {
                modal.classList.remove('show');
                modalOk.removeEventListener('click', okHandler);
                modalCancel.removeEventListener('click', cancelHandler);
                modalClose.removeEventListener('click', cancelHandler);
                modalInput.removeEventListener('keydown', keyHandler);
            }

            modalOk.addEventListener('click', okHandler);
            modalCancel.addEventListener('click', cancelHandler);
            modalClose.addEventListener('click', cancelHandler);
            modalInput.addEventListener('keydown', keyHandler);
        });
    }



    // == NOTES == //

    window.loadNotes = function(){
        dictEditor.getDomNode().style.display = "none";
        noteEditor.getDomNode().style.display = "flex";
        workspace = document.getElementById('workspace-name');
        workspace.dataset.tab = "note";
        editor.getDomNode().style.display = "none";
        eel.listNotes()(function(msg){
            if (msg.success){
                populateNotesList(msg.Notes)
            } else{
                showNotification('Fail', `Could not display notes due to ${msg.error}`)
            }
        });
    }

    function populateNotesList(notes){
        const NotesList = document.getElementById('notes-list');
        NotesList.innerHTML = '';

        notes.forEach(function(note){
            const li = document.createElement('li');
            li.className = 'note-name';
            li.innerHTML = `
            <i class="fas fa-sticky-note"></i>
            <span>${note.name}</span>
            `;

            li.dataset.path = note.path;
            li.dataset.name = note.name;

            li.addEventListener('click', function(){
                openNote(note.path, note.name);
            });

            li.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Show the Notes context menu
                contextmenuNotes.style.display = "block";
                contextmenuNotes.style.left = `${e.pageX}px`;
                contextmenuNotes.style.top = `${e.pageY}px`;

                // Store details for button actions
                contextmenuNotes.dataset.path = note.path;
                contextmenuNotes.dataset.name = note.name;
            });


            NotesList.appendChild(li);
        });
    }

    function openNote(path, name){
        eel.readFile(path, name)(function(msg){
            if (msg.success){
                noteEditor.setValue(msg.content);
                document.getElementById('current-note-name').textContent = name;
            } else{
                showNotification('Fail', `error while trying to load note due to ${msg.error}`);
            }
        });
    }

    // == DICTIOANRY == //

    window.loadDict = function(){
        dictEditor.getDomNode().style.display = "flex";
        noteEditor.getDomNode().style.display = "none";
        editor.getDomNode().style.display = "none";
        workspace = document.getElementById('workspace-name');
        workspace.dataset.tab = "dict";
        eel.listDict()(function(msg){
            if (msg.success){
                populateDictList(msg.Dict)
            } else{
                showNotification('Fail', `Could not display notes due to ${msg.error}`)
            }
        });
    }

    function populateDictList(dicts) {
        const dictList = document.getElementById('dictionary-list');
        dictList.innerHTML = '';

        dicts.forEach(function(dict) {
            const li = document.createElement('li');
            li.className = 'dict-name';

            li.innerHTML = `
                <i class="fas fa-book-open"></i>
                <span>${dict.name}</span>
            `;

            li.dataset.path = dict.path;
            li.dataset.name = dict.name;

            li.addEventListener('click', function() {
                openDict(dict.path, dict.name);
            });

            li.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Show the Dictionary context menu
                contextmenuDict.style.display = "block";
                contextmenuDict.style.left = `${e.pageX}px`;
                contextmenuDict.style.top = `${e.pageY}px`;

                // Store details for button actions
                contextmenuDict.dataset.path = dict.path;
                contextmenuDict.dataset.name = dict.name;
            });

            dictList.appendChild(li);
        });
    }

    function openDict(path, name){
        eel.readFile(path, name)(function(msg){
            if (msg.success){
                dictEditor.setValue(msg.content);
                document.getElementById('current-dictionary-name').textContent = name;
            } else{
                showNotification('Fail', `error while trying to load note due to ${msg.error}`);
            }
        });
    }
    // == TERMINAL == //
    const inputBox = document.getElementById('command-input');
    const commandList = document.getElementById('command-list');
    const sudoBox = document.getElementById('sudo-password');
    const sudoButton = document.getElementById('sudo-submit');

    let pendingSudoCommand = "";

    inputBox.addEventListener('keydown', function(event) {
        const workspace = document.getElementById('workspace-name');
        if (workspace.dataset.tab !== 'terminal') {
            return; // If we're not in the terminal tab, do nothing and let the event pass through.
        }
        if (event.key === 'Enter') {
            const command = inputBox.value.trim();
            if (command === "") return;

            // Detect sudo commands
            if (command.startsWith('sudo')) {
                pendingSudoCommand = command;
                sudoBox.style.display = "block";
                sudoButton.style.display = "inline";
                sudoBox.focus();
            } else {
                runCommand(command);
            }
            inputBox.value = "";
        }
    });

    sudoButton.addEventListener('click', function() {
        const password = sudoBox.value;
        if (pendingSudoCommand && password) {
            runCommand(pendingSudoCommand, password);
            pendingSudoCommand = "";
            sudoBox.value = "";
            sudoBox.style.display = "none";
            sudoButton.style.display = "none";
        }
    });

    async function runCommand(command, sudoPassword = "") {
        const cwd = await eel.get_cwd()();
        const liPrompt = document.createElement('li');
        liPrompt.textContent = cwd + " $ " + command;
        size = await eel.jsonmanager('g', 'terminal', 'Fontsize')();
        liPrompt.style.fontSize = `${size}px`;
        liPrompt.addEventListener('contextmenu', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (await eel.jsonmanager('g', 'terminal', 'Rightclick')()===true){
                // Show menu at mouse position
                contextMenuTerminal.style.display = "block";
                contextMenuTerminal.style.left = `${e.pageX}px`;
                contextMenuTerminal.style.top = `${e.pageY}px`;

                // Store details for button actions
                contextMenuTerminal.dataset.result = liResult.innerText;
                contextMenuTerminal.dataset.cmd = liPrompt.innerText;
            } else {}
        })
        liPrompt.classList.add("Terminal-i-o");
        commandList.appendChild(liPrompt);


        const result = await eel.run_command(command, sudoPassword)();
        
        const liResult = document.createElement('li');
        liResult.style.fontSize = `${size}px`;
        if (!result.ok) {
            liResult.textContent = "❌ " + result.output;
            liResult.style.color = "red";
        } else {
            liResult.textContent = result.output;
        }
        
        liResult.addEventListener('contextmenu', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (await eel.jsonmanager('g', 'terminal', 'Rightclick')()===true){
                // Show menu at mouse position
                contextMenuTerminal.style.display = "block";
                contextMenuTerminal.style.left = `${e.pageX}px`;
                contextMenuTerminal.style.top = `${e.pageY}px`;

                // Store details for button actions
                contextMenuTerminal.dataset.result = liResult.innerText;
                contextMenuTerminal.dataset.cmd = liPrompt.innerText;
            } else{}
        });
        liResult.classList.add("Terminal-i-o");
        commandList.appendChild(liResult);

        commandList.scrollTop = commandList.scrollHeight;
    }



    // == Ports == //
/*
    window.loadPorts = function() {
        const selectionPort = document.getElementById('serial-port-select');
        eel.getPorts()(function(msg){
            if (msg.success){
                ports = msg.ports;
                ports.forEach(function(port){
                    const option = document.createElement("option");
                    option.value = port;
                    option.textContent = port;
                    selectionPort.appendChild(option);
                    option.addEventListener("change", function(){
                        select.dataset.selectedPort = select.value;
                        log('ports', select.dataset.selectedPort);
                    });
                });

                
            }
        });
    }
    loadPorts()

    function Out(output, error= false){
        pTerminal = document.getElementById('ports-terminal');
        li = document.createElement('li');
        li.textContent = output
        li.classList.add("port-output")
        if (error){
            li.style.color = "red"
        }

        pTerminal.appendChild(li)
        pTerminal.scrollTop = pTerminal.scrollHeight;
    }
    eel.expose(Out)
    */







    // == Setting == //

    async function loadSettingsUI(){
        if (await eel.jsonmanager('g', 'appear', 'Theme')()==='dark'){
            document.getElementById('settings-dark-theme').focus();
        } else{
            document.getElementById('settings-light-theme').focus();
        }

        document.getElementById('editor-theme-select').value = await eel.jsonmanager('g', 'appear', 'Editortheme')();

        document.getElementById('font-family-select').value=  await eel.jsonmanager('g', 'appear', 'Fontfamily')();

        document.getElementById('font-size-slider').value = await eel.jsonmanager('g', 'appear', 'Fontsize')();

        document.getElementById('font-size-value').innerText = `${await eel.jsonmanager('g', 'appear', 'Fontsize')()}px`;

        document.getElementById('sidebar-width-slider').innerText = `${await eel.jsonmanager('g', 'appear', 'Sidebar')()}px`;

        document.getElementById('sidebar-width-slider').value = await eel.jsonmanager('g', 'appear', 'Sidebar')();

        document.getElementById('show-minimap-checkbox').checked = await eel.jsonmanager('g', 'editor', 'Minimap')();

        document.getElementById('show-line-numbers-checkbox').checked = await eel.jsonmanager('g', 'editor', 'Linenumber')();

        document.getElementById('tab-size-slider').value = await eel.jsonmanager('g', 'editor', 'Tabsize')();

        document.getElementById('tab-size-value').innerText = `${await eel.jsonmanager('g', 'editor', 'Tabsize')()} spaces`;

        document.getElementById('insert-spaces-checkbox').checked = await eel.jsonmanager('g', 'editor', 'Space')();

        document.getElementById('word-wrap-checkbox').checked = await eel.jsonmanager('g', 'editor', 'Wordwrap')();

        document.getElementById('auto-close-brackets-checkbox').checked = await eel.jsonmanager('g', 'editor', 'Fillbracket')();

        document.getElementById('trim-trailing-whitespace-checkbox').checked = await eel.jsonmanager('g', 'editor', 'Trim')();

        document.getElementById('format-on-save-checkbox').checked = await eel.jsonmanager('g', 'editor', 'Formatsave')();

        document.getElementById('cursor-style-select').value = await eel.jsonmanager('g', 'editor', 'Cursorstyle')();

        document.getElementById('cursor-blink-checkbox').checked = await eel.jsonmanager('g', 'editor', 'Cursorblink')();

        document.getElementById('shell-select').value=  await eel.jsonmanager('g', 'terminal', 'Shell')();

        document.getElementById('terminal-font-size-slider').value=  await eel.jsonmanager('g', 'terminal', 'Fontsize')();

        document.getElementById('terminal-font-size-value').innerText=  `${await eel.jsonmanager('g', 'terminal', 'Fontsize')()}px`;

        document.getElementById('terminal-theme-select').value = await eel.jsonmanager('g', 'terminal', 'Theme')();
        
        document.getElementById('right-click-action-checkbox').checked = await eel.jsonmanager('g', 'terminal', 'rightclick')();

        document.getElementById('autosave-interval-slider').value=  await eel.jsonmanager('g', 'app', 'Autotime')();

        document.getElementById('autosave-interval-value').innerText=  `${await eel.jsonmanager('g', 'app', 'Autotime')()} seconds`;

        document.getElementById('restore-session-checkbox').checked = await eel.jsonmanager('g', 'app', 'Restore')();

        document.getElementById('confirm-delete-checkbox').checked = await eel.jsonmanager('g', 'app', 'Confirm')();

        document.getElementById('auto-update-checkbox').checked = await eel.jsonmanager('g', 'app', 'Update')();  
        
        document.getElementById('logging-select').value = await eel.jsonmanager('g', 'app', 'log')();  

    }

    document.getElementById('font-size-slider').addEventListener('input', async function(){
        document.getElementById('font-size-value').innerText = `${await eel.jsonmanager('g', 'appear', 'Fontsize')()}px`;
    });

    document.getElementById('sidebar-width-slider').addEventListener('input', async function(){
        document.getElementById('sidebar-width-value').innerText = `${await eel.jsonmanager('g', 'appear', 'Sidebar')()}px`;
    });

    document.getElementById('tab-size-slider').addEventListener('input', async function(){
        document.getElementById('tab-size-value').innerText = `${await eel.jsonmanager('g', 'editor', 'Tabsize')()} spaces`;
    });

    document.getElementById('terminal-font-size-slider').addEventListener('input', async function(){
        document.getElementById('terminal-font-size-value').innerText = `${await eel.jsonmanager('g', 'terminal', 'Fontsize')()}px`;
    });

    document.getElementById('autosave-interval-slider').addEventListener('input', async function(){
        document.getElementById('autosave-interval-value').innerText = `${await eel.jsonmanager('g', 'app', 'Autotime')()} seconds`;
    });
    
    loadSettingsUI()

    window.switchSetting = function(tabNumber) {
        log('Switching to settings tab:', tabNumber);

        const settingsTabs = {
            1: { id: 'appearance-settings', name: 'appearance' },
            2: { id: 'editor-settings', name: 'editor' },
            3: { id: 'terminal-settings', name: 'terminal' },
            4: { id: 'application-settings', name: 'application' },
            5: { id: 'keybindings-settings', name: 'keybindings' }
        };

        const tab = settingsTabs[tabNumber];
        if (!tab) return log('Invalid settings tab number:', tabNumber);

        try {
            // Hide all settings panels
            document.querySelectorAll('.settings-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Remove active class from all settings category buttons
            document.querySelectorAll('.settings-category').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected settings panel
            const selectedPanel = document.getElementById(tab.id);
            if (!selectedPanel) return log('Settings panel not found:', tab.id);

            selectedPanel.classList.add('active');

            // Activate the corresponding settings category button
            const activeButton = document.querySelector(`[onclick="switchSetting(${tabNumber})"]`);
            if (activeButton) activeButton.classList.add('active');

        } catch (e) {
            log(e + '', 'while switching settings tabs');
        }
    }
    
    function applySetting(grp, subgrp, val){
        eel.jsonmanager('s', grp, subgrp, val)();
    }
    const themes = {
        light: {
            "--bg-primary": "#ffffff",
            "--bg-secondary": "#f6f8fa",
            "--bg-tertiary": "#e1e4e8",
            "--bg-shade": "225, 228, 232, 0.2",
            "--bg-elevated": "#afafafff",
            "--border": "#d1d5da",
            "--border-hover": "#959da5",
            "--text": "#24292e",
            "--text-secondary": "#586069",
            "--text-muted": "#6a737d",
            "--accent": "#0366d6",
            "--accent-hover": "#0256cc",
            "--success": "#28a745",
            "--warning": "#ffd33d",
            "--error": "#d73a49",
            "--purple": "#6f42c1",
            "--shadow": "rgba(0, 0, 0, 0.1)",
            "--shadow-lg": "rgba(0, 0, 0, 0.15)"
        },
        dark : {
            "--bg-primary": "#0d1117",
            "--bg-secondary": "#161b22",
            "--bg-tertiary": "#1c2128",
            "--bg-shade:": "28, 33, 40, 0.9",
            "--bg-elevated": "#21262d",
            "--border": "#30363d",
            "--border-hover": "#484f58",
            "--text": "#c9d1d9",
            "--text-secondary": "#8b949e",
            "--text-muted": "#6e7681",
            "--accent": "#58a6ff",
            "--accent-hover": "#79c0ff",
            "--success": "#3fb950",
            "--warning": "#d29922",
            "--error": "#f85149",
            "--purple": "#bc8cff",
            "--shadow": "rgba(0, 0, 0, 0.4)",
            "--shadow-lg": "rgba(0, 0, 0, 0.6)"
        }
    };

    async function applyAllSettings(){
        const settings =  await eel.jsonmanager('ga')();

        /// === APPEAR === //

        // = Theme = // 
        if (settings.appear.Theme === "light"){
            Object.entries(themes.light).forEach(function ([key, value]) {
                document.documentElement.style.setProperty(key, value);
            });
        }
        else{
            Object.entries(themes.dark).forEach(function ([key, value]) {
                document.documentElement.style.setProperty(key, value);
            });
        }

        document.body.style.fontFamily = settings.appear.Fontfamily;
        // document.documentElement.style.setProperty('--Sidebar', settings.appear.Sidebar);

        if (await eel.jsonmanager('g', 'terminal', 'Theme')()=== "light"){
            document.documentElement.style.setProperty('--terminal-background', '#c0b9b9')
            document.documentElement.style.setProperty('--terminal-secondary', '#e0dada')
            document.documentElement.style.setProperty('--terminal-text', '#000000ff')
        }
        
        
    }

    window.set = async function(grp, subgrp, value){
        log('from js', `${grp}, ${subgrp} ${value}`)
        eel.jsonmanager('s', grp, subgrp, value)(function(msg){
            if (msg.success !== true){
                showNotification('Fail', `could not load file due to ${msg.e}`)
            }
        });
        await applySetting(grp, subgrp, value);
        await applyAllSettings()
    }

    applyAllSettings()
    async function getTime() {
        const t = Number(await eel.jsonmanager('g', 'app', 'Autotime')());
        const ms = t * 1000;
        return ms;
    }

    async function autosaveLoop() {
        if (!window.editor || typeof editor.getValue !== 'function') {
            setTimeout(autosaveLoop, 500);
            return;
        }
        const delay = await getTime();
        switch (document.getElementById('workspace-name').dataset.tab){
            case 'editor':
                content = editor.getValue();
                const file_path = document.getElementById('current-file-name').dataset.path;
                if (file_path) {
                    if (await eel.jsonmanager('g', 'editor', 'Trim')() == true){
                        content = content.split('\n').map(line => line.replace(/\s+$/g, '')).join('\n');
                    }
                    eel.saveFile(content, file_path)(function(msg) {
                        if (msg.success) {
                            // showNotification('Success', 'File saved successfully');
                        } else {
                            // showNotification('Error', msg.message);
                        }
                    });
                }
                break;
            case 'note':
                content = noteEditor.getValue();
                const NoteName = document.getElementById('current-note-name').textContent;
                eel.saveNote(NoteName, content)(function(msg){
                    if (!msg.success){
                        // showNotification('Fail', `Could not save note due to ${msg.e}`);
                    }
                });
                break;
            case 'dict':
                content = dictEditor.getValue();
                const dictName = document.getElementById('current-dictionary-name').textContent;
                eel.saveDict(dictName, content)(function(msg){
                    if (!msg.success){
                        // showNotification('Fail', `Could not save note due to ${msg.e}`);
                    }
                });
                break;
            default:
                break;
        }

        setTimeout(autosaveLoop, delay);
    }

    

});