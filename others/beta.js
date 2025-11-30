
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading indicator and show welcome screen
    setTimeout(() => {
        document.getElementById('loading-indicator').style.display = 'none';
        document.getElementById('welcome-screen').style.display = 'flex';
    }, 1000);
    
    // Set up event listeners for buttons
    document.getElementById('open-folder-btn').addEventListener('click', function() {
        eel.open_folder()(function(folder_path) {
            if (folder_path) {
                // Load the folder content
                loadWorkspace(folder_path);
            }
        });
    });
    
    // Save file functionality
    document.getElementById('save-btn').addEventListener('click', function() {
        const content = editor.getValue();  // Assuming you have Monaco Editor
        const file_path = document.getElementById('current-file-name').dataset.path;
        
        if (file_path) {
            eel.save_file(content, file_path)(function(response) {
                if (response.success) {
                    showNotification('Success', 'File saved successfully');
                } else {
                    showNotification('Error', response.message);
                }
            });
        } else {
            // Show save as dialog
            showSaveAsDialog();
        }
    });
    
    // File tree functionality
    function loadWorkspace(folder_path) {
        eel.get_file_list(folder_path)(function(response) {
            if (response.success) {
                // Hide welcome screen and show app
                document.getElementById('welcome-screen').style.display = 'none';
                document.querySelector('.app-container').style.display = 'block';
                
                // Update workspace name
                document.getElementById('workspace-name').textContent = 
                    folder_path.split('/').pop() || folder_path.split('\\').pop();
                
                // Populate file tree
                populateFileTree(response.files);
            } else {
                showNotification('Error', response.message);
            }
        });
    }
    
    function populateFileTree(files) {
        const fileTree = document.getElementById('file-tree');
        fileTree.innerHTML = '';
        
        files.forEach(file => {
            const li = document.createElement('li');
            li.className = 'file-tree-item';
            
            if (file.type === 'folder') {
                li.innerHTML = `
                    <i></i>
                    <span>${file.name}</span>
                `;
            } else {
                li.innerHTML = `
                    <i class="fas fa-file"></i>
                    <span>${file.name}</span>
                `;
            }
            
            li.dataset.path = file.path;
            li.dataset.type = file.type;
            
            li.addEventListener('click', function() {
                if (file.type === 'file') {
                    openFile(file.path, file.name);
                }
            });
            
            fileTree.appendChild(li);
        });
    }
    
    function openFile(file_path, file_name) {
        eel.load_file(file_path)(function(response) {
            if (response.success) {
                // Update editor content
                editor.setValue(response.content);
                // Update current file name
                document.getElementById('current-file-name').textContent = file_name;
                document.getElementById('current-file-name').dataset.path = file_path;
                
                // Update status bar
                document.getElementById('status-file').textContent = file_name;
                
                // Add file tab if not exists
                addFileTab(file_name, file_path);
            } else {
                showNotification('Error', response.message);
            }
        });
    }
    
    function addFileTab(file_name, file_path) {
        const fileTabs = document.getElementById('file-tabs');
        
        // Check if tab already exists
        let existingTab = Array.from(fileTabs.children).find(tab => 
            tab.dataset.path === file_path
        );
        
        if (existingTab) {
            // Activate existing tab
            document.querySelectorAll('.file-tab').forEach(tab => 
                tab.classList.remove('active')
            );
            existingTab.classList.add('active');
            return;
        }
        
        // Create new tab
        const tab = document.createElement('div');
        tab.className = 'file-tab active';
        tab.dataset.path = file_path;
        tab.innerHTML = `
            <span>${file_name}</span>
            <button class="close-tab-btn">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Remove active class from other tabs
        document.querySelectorAll('.file-tab').forEach(t => 
            t.classList.remove('active')
        );
        
        // Add close functionality
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
            openFile(file_path, file_name);
        });
        
        fileTabs.appendChild(tab);
    }
    
    function showNotification(title, message) {
        const notificationBox = document.getElementById('notification-box');
        document.getElementById('notification-title').textContent = title;
        document.getElementById('notification-message').textContent = message;
        
        notificationBox.classList.add('show');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            notificationBox.classList.remove('show');
        }, 3000);
    }
    
    // Initialize Monaco Editor
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs' }});
    require(['vs/editor/editor.main'], function () {
        window.editor = monaco.editor.create(document.getElementById('editor'), {
            value: '',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace"
        });
        
        // Update cursor position in status bar
        editor.onDidChangeCursorPosition(function(e) {
            document.getElementById('status-position').textContent = 
                `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
        });
        
        // Detect language based on file extension
        editor.onDidChangeModel(function(e) {
            const model = editor.getModel();
            if (model) {
                const path = model.uri.path;
                const ext = path.split('.').pop().toLowerCase();
                
                let language = 'plaintext';
                switch (ext) {
                    case 'js': language = 'javascript'; break;
                    case 'py': language = 'python'; break;
                    case 'html': language = 'html'; break;
                    case 'css': language = 'css'; break;
                    case 'json': language = 'json'; break;
                    case 'md': language = 'markdown'; break;
                    case 'cpp':
                    case 'cc':
                    case 'cxx':
                    case 'c++': language = 'cpp'; break;
                    case 'c': language = 'c'; break;
                    case 'java': language = 'java'; break;
                    case 'go': language = 'go'; break;
                    case 'rs': language = 'rust'; break;
                    case 'php': language = 'php'; break;
                    case 'ts': language = 'typescript'; break;
                    case 'xml': language = 'xml'; break;
                    case 'sql': language = 'sql'; break;
                    case 'sh':
                    case 'bash': language = 'shell'; break;
                    case 'yaml':
                    case 'yml': language = 'yaml'; break;
                }
                
                monaco.editor.setModelLanguage(model, language);
                document.getElementById('status-lang').textContent = 
                    language.charAt(0).toUpperCase() + language.slice(1);
            }
        });
    });
    
    // Update current time in status bar
    function updateTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        
        document.getElementById('current-time').textContent = 
            `${displayHours}:${minutes} ${ampm}`;
    }
    
    updateTime();
    setInterval(updateTime, 60000); // Update every minute
    
    // Terminal setup
    const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
        theme: {
            background: '#1e1e1e',
            foreground: '#d4d4d4'
        }
    });
    
    const fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);
    
    terminal.open(document.getElementById('terminal'));
    fitAddon.fit();
    
    // Ports terminal setup
    const portsTerminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
        theme: {
            background: '#1e1e1e',
            foreground: '#d4d4d4'
        }
    });
    
    const portsFitAddon = new FitAddon.FitAddon();
    portsTerminal.loadAddon(portsFitAddon);
    
    portsTerminal.open(document.getElementById('ports-terminal'));
    portsFitAddon.fit();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        fitAddon.fit();
        portsFitAddon.fit();
    });
    
    // Tab switching functionality
    document.querySelectorAll('.top-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.top-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
            
            // Fit terminal if terminal tab is activated
            if (tabId === 'terminal') {
                setTimeout(() => fitAddon.fit(), 100);
            } else if (tabId === 'ports') {
                setTimeout(() => portsFitAddon.fit(), 100);
            }
        });
    });
    
    // Settings category switching
    document.querySelectorAll('.settings-category').forEach(category => {
        category.addEventListener('click', function() {
            // Remove active class from all categories and panels
            document.querySelectorAll('.settings-category').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked category
            this.classList.add('active');
            
            // Show corresponding panel
            const categoryId = this.getAttribute('data-category');
            document.getElementById(`${categoryId}-settings`).classList.add('active');
        });
    });
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', function() {
        const body = document.body;
        const icon = this.querySelector('i');
        const text = this.querySelector('span');
        
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            text.textContent = 'Dark Theme';
            
            // Update editor theme
            if (window.editor) {
                monaco.editor.setTheme('vs-dark');
            }
        } else {
            body.classList.add('light-theme');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            text.textContent = 'Light Theme';
            
            // Update editor theme
            if (window.editor) {
                monaco.editor.setTheme('vs');
            }
        }
    });
    
    // Modal functionality
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalOk = document.getElementById('modal-ok');
    const modalInput = document.getElementById('modal-input');
    const modalTitle = document.getElementById('modal-title');
    
    let modalCallback = null;
    
    function showModal(title, defaultValue = '', callback = null) {
        modalTitle.textContent = title;
        modalInput.value = defaultValue;
        modal.style.display = 'flex';
        modalInput.focus();
        modalInput.select();
        
        modalCallback = callback;
    }
    
    function hideModal() {
        modal.style.display = 'none';
        modalCallback = null;
    }
    
    modalClose.addEventListener('click', hideModal);
    modalCancel.addEventListener('click', hideModal);
    
    modalOk.addEventListener('click', function() {
        if (modalCallback) {
            modalCallback(modalInput.value);
        }
        hideModal();
    });
    
    modalInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            modalOk.click();
        } else if (e.key === 'Escape') {
            hideModal();
        }
    });
    
    // New file button
    document.getElementById('new-file-btn').addEventListener('click', function() {
        showModal('New File', '', function(filename) {
            if (filename) {
                // Create new file
                const currentPath = document.getElementById('workspace-name').dataset.path || '';
                const filePath = currentPath ? `${currentPath}/${filename}` : filename;
                
                eel.save_file('', filePath)(function(response) {
                    if (response.success) {
                        const workspacePath = document.getElementById('workspace-name').dataset.path;
                        if (workspacePath) {
                            loadWorkspace(workspacePath);
                        }
                        
                        // Open the new file
                        openFile(filePath, filename);
                        showNotification('Success', 'File created successfully');
                    } else {
                        showNotification('Fail', response.message);
                    }
                });
            }
        });
    });
    
    // New folder button
    document.getElementById('new-folder-btn').addEventListener('click', function() {
        showModal('New Folder', '', function(foldername) {
            if (foldername) {
                // Create new folder
                const currentPath = document.getElementById('workspace-name').dataset.path || '';
                const folderPath = currentPath ? `${currentPath}/${foldername}` : foldername;
                
                eel.create_folder(folderPath)(function(response) {
                    if (response.success) {
                        // Refresh file tree
                        const workspacePath = document.getElementById('workspace-name').dataset.path;
                        if (workspacePath) {
                            loadWorkspace(workspacePath);
                        }
                        showNotification('Success', 'Folder created successfully');
                    } else {
                        showNotification('Error', response.message);
                    }
                });
            }
        });
    });
    
    // Context menu functionality
    const contextMenu = document.getElementById('context-menu');
    let contextTarget = null;
    
    document.addEventListener('contextmenu', function(e) {
        // Only show context menu on file tree items
        if (e.target.closest('.file-tree-item')) {
            e.preventDefault();
            contextTarget = e.target.closest('.file-tree-item');
            
            // Position context menu
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
            contextMenu.style.display = 'block';
            
            // Update context menu based on target type
            const isFolder = contextTarget.dataset.type === 'folder';
            document.getElementById('ctx-open').style.display = isFolder ? 'flex' : 'none';
        }
    });
    
    document.addEventListener('click', function() {
        contextMenu.style.display = 'none';
    });
    
    // Context menu actions
    document.getElementById('ctx-open').addEventListener('click', function() {
        if (contextTarget) {
            const path = contextTarget.dataset.path;
            loadWorkspace(path);
        }
    });
    
    document.getElementById('ctx-rename').addEventListener('click', function() {
        if (contextTarget) {
            const oldPath = contextTarget.dataset.path;
            const oldName = contextTarget.querySelector('span').textContent;
            
            showModal('Rename', oldName, function(newName) {
                if (newName && newName !== oldName) {
                    const newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + newName;
                    
                    eel.rename_file(oldPath, newPath)(function(response) {
                        if (response.success) {
                            // Refresh file tree
                            const workspacePath = document.getElementById('workspace-name').dataset.path;
                            if (workspacePath) {
                                loadWorkspace(workspacePath);
                            }
                            showNotification('Success', 'Renamed successfully');
                        } else {
                            showNotification('Error', response.message);
                        }
                    });
                }
            });
        }
    });
    
    document.getElementById('ctx-delete').addEventListener('click', function() {
        if (contextTarget) {
            const path = contextTarget.dataset.path;
            const name = contextTarget.querySelector('span').textContent;
            
            if (confirm(`Are you sure you want to delete "${name}"?`)) {
                eel.delete_file(path)(function(response) {
                    if (response.success) {
                        // Refresh file tree
                        const workspacePath = document.getElementById('workspace-name').dataset.path;
                        if (workspacePath) {
                            loadWorkspace(workspacePath);
                        }
                        showNotification('Success', 'Deleted successfully');
                    } else {
                        showNotification('Error', response.message);
                    }
                });
            }
        }
    });
    
    document.getElementById('ctx-new-file').addEventListener('click', function() {
        if (contextTarget) {
            const folderPath = contextTarget.dataset.path;
            
            showModal('New File', '', function(filename) {
                if (filename) {
                    const filePath = `${folderPath}/${filename}`;
                    
                    eel.save_file('', filePath)(function(response) {
                        if (response.success) {
                            // Refresh file tree
                            const workspacePath = document.getElementById('workspace-name').dataset.path;
                            if (workspacePath) {
                                loadWorkspace(workspacePath);
                            }
                            
                            // Open the new file
                            openFile(filePath, filename);
                            showNotification('Success', 'File created successfully');
                        } else {
                            showNotification('Error', response.message);
                        }
                    });
                }
            });
        }
    });
    
    document.getElementById('ctx-new-folder').addEventListener('click', function() {
        if (contextTarget) {
            const parentPath = contextTarget.dataset.path;
            
            showModal('New Folder', '', function(foldername) {
                if (foldername) {
                    const folderPath = `${parentPath}/${foldername}`;
                    
                    eel.create_folder(folderPath)(function(response) {
                        if (response.success) {
                            // Refresh file tree
                            const workspacePath = document.getElementById('workspace-name').dataset.path;
                            if (workspacePath) {
                                loadWorkspace(workspacePath);
                            }
                            showNotification('Success', 'Folder created successfully');
                        } else {
                            showNotification('Error', response.message);
                        }
                    });
                }
            });
        }
    });
    
    // Notification close button
    document.getElementById('notification-close').addEventListener('click', function() {
        document.getElementById('notification-box').classList.remove('show');
    });
    
    // Dictionary popup functionality
    const dictionaryPopup = document.getElementById('dictionary-popup');
    const popupClose = document.getElementById('popup-close');
    const popupSearch = document.getElementById('popup-search');
    const popupList = document.getElementById('popup-list');
    
    // Show dictionary popup when Ctrl+Space is pressed
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.code === 'Space') {
            e.preventDefault();
            
            // Get current word under cursor
            const selection = editor.getSelection();
            const word = editor.getModel().getWordAtPosition(selection.getPosition());
            
            // Show popup
            dictionaryPopup.style.display = 'block';
            popupSearch.value = word ? word.word : '';
            popupSearch.focus();
            
            // Load dictionary entries
            loadDictionaryEntries(popupSearch.value);
        }
    });
    
    popupClose.addEventListener('click', function() {
        dictionaryPopup.style.display = 'none';
    });
    
    popupSearch.addEventListener('input', function() {
        loadDictionaryEntries(this.value);
    });
    
    function loadDictionaryEntries(searchTerm) {
        // Clear current list
        popupList.innerHTML = '';
        
        // Load dictionary entries from Python backend
        eel.get_dictionary_entries(searchTerm)(function(entries) {
            if (entries && entries.length > 0) {
                entries.forEach(entry => {
                    const li = document.createElement('li');
                    li.className = 'popup-item';
                    li.innerHTML = `
                        <div class="popup-item-title">${entry.name}</div>
                        <div class="popup-item-desc">${entry.description}</div>
                    `;
                    
                    li.addEventListener('click', function() {
                        // Insert the selected entry into the editor
                        const selection = editor.getSelection();
                        const range = selection.getRange();
                        editor.executeEdits('dictionary-insert', [{
                            range: range,
                            text: entry.code || entry.name,
                            forceMoveMarkers: true
                        }]);
                        
                        // Close popup
                        dictionaryPopup.style.display = 'none';
                    });
                    
                    popupList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.className = 'popup-item no-results';
                li.textContent = 'No entries found';
                popupList.appendChild(li);
            }
        });
    }
    
    // Save all button
    document.getElementById('save-all-btn').addEventListener('click', function() {
        const tabs = document.querySelectorAll('.file-tab');
        let savedCount = 0;
        
        tabs.forEach(tab => {
            const filePath = tab.dataset.path;
            const fileName = tab.querySelector('span').textContent;
            
            if (filePath) {
                // Get editor content for this file
                // In a real implementation, you would need to track content for each tab
                // For simplicity, we'll just save the current editor content to all files
                const content = editor.getValue();
                
                eel.save_file(content, filePath)(function(response) {
                    if (response.success) {
                        savedCount++;
                        if (savedCount === tabs.length) {
                            showNotification('Success', `Saved ${savedCount} files`);
                        }
                    } else {
                        showNotification('Error', `Failed to save ${fileName}: ${response.message}`);
                    }
                });
            }
        });
        
        if (tabs.length === 0) {
            showNotification('Info', 'No files to save');
        }
    });
    
    // Run button
    document.getElementById('run-btn').addEventListener('click', function() {
        const filePath = document.getElementById('current-file-name').dataset.path;
        
        if (!filePath) {
            showNotification('Error', 'No file is currently open');
            return;
        }
        
        // Clear terminal
        terminal.clear();
        
        // Run the file
        eel.run_file(filePath)(function(output) {
            terminal.write(output);
        });
    });
    
    // Refresh files button
    document.getElementById('refresh-files-btn').addEventListener('click', function() {
        const workspacePath = document.getElementById('workspace-name').dataset.path;
        if (workspacePath) {
            loadWorkspace(workspacePath);
            showNotification('Success', 'File list refreshed');
        }
    });
    
    // File search
    document.getElementById('file-search').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const fileItems = document.querySelectorAll('.file-tree-item');
        
        fileItems.forEach(item => {
            const fileName = item.querySelector('span').textContent.toLowerCase();
            if (fileName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Notes functionality
    document.getElementById('new-note-btn').addEventListener('click', function() {
        showModal('New Note', '', function(notename) {
            if (notename) {
                // Create new note
                eel.create_note(notename, '')(function(response) {
                    if (response.success) {
                        // Refresh notes list
                        loadNotes();
                        showNotification('Success', 'Note created successfully');
                    } else {
                        showNotification('Error', response.message);
                    }
                });
            }
        });
    });
    
    function loadNotes() {
        eel.get_notes_list()(function(response) {
            if (response.success) {
                const notesList = document.getElementById('notes-list');
                notesList.innerHTML = '';
                
                response.notes.forEach(note => {
                    const noteItem = document.createElement('div');
                    noteItem.className = 'note-item';
                    noteItem.innerHTML = `
                        <div class="note-item-title">${note.name}</div>
                        <div class="note-item-date">${new Date(note.modified).toLocaleString()}</div>
                    `;
                    
                    noteItem.addEventListener('click', function() {
                        loadNote(note.id, note.name);
                    });
                    
                    notesList.appendChild(noteItem);
                });
            } else {
                showNotification('Error', response.message);
            }
        });
    }
    
    function loadNote(noteId, noteName) {
        eel.get_note_content(noteId)(function(response) {
            if (response.success) {
                // Update note editor
                document.getElementById('note-editor').innerHTML = response.content;
                document.getElementById('current-note-name').textContent = noteName;
                document.getElementById('current-note-name').dataset.id = noteId;
            } else {
                showNotification('Error', response.message);
            }
        });
    }
    
    document.getElementById('save-note-btn').addEventListener('click', function() {
        const noteId = document.getElementById('current-note-name').dataset.id;
        const noteName = document.getElementById('current-note-name').textContent;
        const content = document.getElementById('note-editor').innerHTML;
        
        if (noteId) {
            eel.save_note(noteId, noteName, content)(function(response) {
                if (response.success) {
                    loadNotes();
                    showNotification('Success', 'Note saved successfully');
                } else {
                    showNotification('Error', response.message);
                }
            });
        } else {
            showNotification('Error', 'No note is currently open');
        }
    });
    
    // Dictionary functionality
    document.getElementById('new-dictionary-btn').addEventListener('click', function() {
        showModal('New Dictionary', '', function(dictname) {
            if (dictname) {
                // Create new dictionary
                eel.create_dictionary(dictname)(function(response) {
                    if (response.success) {
                        // Refresh dictionaries list
                        loadDictionaries();
                        showNotification('Success', 'Dictionary created successfully');
                    } else {
                        showNotification('Error', response.message);
                    }
                });
            }
        });
    });
    
    function loadDictionaries() {
        eel.get_dictionaries_list()(function(response) {
            if (response.success) {
                const dictionaryList = document.getElementById('dictionary-list');
                dictionaryList.innerHTML = '';
                
                response.dictionaries.forEach(dict => {
                    const dictItem = document.createElement('div');
                    dictItem.className = 'dictionary-item';
                    dictItem.innerHTML = `
                        <div class="dictionary-item-title">${dict.name}</div>
                        <div class="dictionary-item-count">${dict.entry_count} entries</div>
                    `;
                    
                    dictItem.addEventListener('click', function() {
                        loadDictionary(dict.id, dict.name);
                    });
                    
                    dictionaryList.appendChild(dictItem);
                });
            } else {
                showNotification('Error', response.message);
            }
        });
    }
    
    function loadDictionary(dictId, dictName) {
        eel.get_dictionary_content(dictId)(function(response) {
            if (response.success) {
                // Update dictionary editor
                document.getElementById('dictionary-editor').innerHTML = response.content;
                document.getElementById('current-dictionary-name').textContent = dictName;
                document.getElementById('current-dictionary-name').dataset.id = dictId;
            } else {
                showNotification('Error', response.message);
            }
        });
    }
    
    document.getElementById('save-dictionary-btn').addEventListener('click', function() {
        const dictId = document.getElementById('current-dictionary-name').dataset.id;
        const dictName = document.getElementById('current-dictionary-name').textContent;
        const content = document.getElementById('dictionary-editor').innerHTML;
        
        if (dictId) {
            eel.save_dictionary(dictId, dictName, content)(function(response) {
                if (response.success) {
                    loadDictionaries();
                    showNotification('Success', 'Dictionary saved successfully');
                } else {
                    showNotification('Error', response.message);
                }
            });
        } else {
            showNotification('Error', 'No dictionary is currently open');
        }
    });
    
    // Ports functionality
    document.getElementById('refresh-ports-btn').addEventListener('click', function() {
        eel.get_serial_ports()(function(response) {
            if (response.success) {
                const portSelect = document.getElementById('serial-port-select');
                portSelect.innerHTML = '<option value="">Select a port...</option>';
                
                response.ports.forEach(port => {
                    const option = document.createElement('option');
                    option.value = port.path;
                    option.textContent = `${port.path} - ${port.description || 'Unknown device'}`;
                    portSelect.appendChild(option);
                });
                
                // Update ports count
                document.getElementById('ports-count').textContent = `(${response.ports.length} available)`;
                
                showNotification('Success', 'Ports refreshed successfully');
            } else {
                showNotification('Error', response.message);
            }
        });
    });
    
    document.getElementById('select-file-btn').addEventListener('click', function() {
        eel.select_file_to_upload()(function(response) {
            if (response.success) {
                document.getElementById('upload-file-path').value = response.file_path;
            } else {
                showNotification('Error', response.message);
            }
        });
    });
    
    document.getElementById('upload-btn').addEventListener('click', function() {
        const filePath = document.getElementById('upload-file-path').value;
        const port = document.getElementById('serial-port-select').value;
        const deviceType = document.getElementById('device-type-select').value;
        const verify = document.getElementById('verify-upload').checked;
        const verbose = document.getElementById('verbose-output').checked;
        
        if (!filePath) {
            showNotification('Error', 'No file selected for upload');
            return;
        }
        
        if (!port) {
            showNotification('Error', 'No serial port selected');
            return;
        }
        
        if (!deviceType) {
            showNotification('Error', 'No device type selected');
            return;
        }
        
        // Clear terminal
        portsTerminal.clear();
        
        // Upload the file
        eel.upload_to_device(filePath, port, deviceType, verify, verbose)(function(output) {
            portsTerminal.write(output);
        });
    });
    
    // Load device types
    eel.get_device_types()(function(response) {
        if (response.success) {
            const deviceTypeSelect = document.getElementById('device-type-select');
            deviceTypeSelect.innerHTML = '<option value="">Select a device...</option>';
            
            response.device_types.forEach(device => {
                const option = document.createElement('option');
                option.value = device.id;
                option.textContent = device.name;
                deviceTypeSelect.appendChild(option);
            });
        }
    });
    
    // Clear ports terminal
    document.getElementById('clear-ports-terminal-btn').addEventListener('click', function() {
        portsTerminal.clear();
    });
    
    // Circuit/PCB functionality
    document.getElementById('kicad-load-image-btn').addEventListener('click', function() {
        eel.select_circuit_image()(function(response) {
            if (response.success) {
                const preview = document.getElementById('kicad-preview');
                preview.innerHTML = `
                    <img src="${response.image_path}" alt="Circuit Preview" style="max-width: 100%; max-height: 100%;">
                `;
            } else {
                showNotification('Error', response.message);
            }
        });
    });
    
    document.getElementById('kicad-refresh-btn').addEventListener('click', function() {
        // In a real implementation, this would refresh the circuit image
        showNotification('Info', 'Circuit image refreshed');
    });
    
    document.getElementById('kicad-zoom-in-btn').addEventListener('click', function() {
        const img = document.querySelector('#kicad-preview img');
        if (img) {
            const currentWidth = img.clientWidth;
            const currentHeight = img.clientHeight;
            img.style.width = `${currentWidth * 1.2}px`;
            img.style.height = `${currentHeight * 1.2}px`;
        }
    });
    
    document.getElementById('kicad-zoom-out-btn').addEventListener('click', function() {
        const img = document.querySelector('#kicad-preview img');
        if (img) {
            const currentWidth = img.clientWidth;
            const currentHeight = img.clientHeight;
            img.style.width = `${currentWidth / 1.2}px`;
            img.style.height = `${currentHeight / 1.2}px`;
        }
    });
    
    document.getElementById('kicad-download-btn').addEventListener('click', function() {
        const img = document.querySelector('#kicad-preview img');
        if (img) {
            eel.download_image(img.src)(function(response) {
                if (response.success) {
                    showNotification('Success', 'Image downloaded successfully');
                } else {
                    showNotification('Error', response.message);
                }
            });
        } else {
            showNotification('Error', 'No image to download');
        }
    });
    
    // Terminal functionality
    document.getElementById('clear-terminal-btn').addEventListener('click', function() {
        terminal.clear();
    });
    
    document.getElementById('restart-terminal-btn').addEventListener('click', function() {
        terminal.clear();
        eel.restart_terminal()(function(response) {
            if (response.success) {
                showNotification('Success', 'Terminal restarted');
            } else {
                showNotification('Error', response.message);
            }
        });
    });
    
    // Settings functionality
    document.getElementById('save-settings-btn').addEventListener('click', function() {
        const settings = {
            appearance: {
                theme: document.querySelector('.theme-option.active').dataset.theme,
                editorTheme: document.getElementById('editor-theme-select').value,
                fontFamily: document.getElementById('font-family-select').value,
                fontSize: document.getElementById('font-size-slider').value,
                sidebarWidth: document.getElementById('sidebar-width-slider').value,
                showMinimap: document.getElementById('show-minimap-checkbox').checked,
                showLineNumbers: document.getElementById('show-line-numbers-checkbox').checked
            },
            editor: {
                tabSize: document.getElementById('tab-size-slider').value,
                insertSpaces: document.getElementById('insert-spaces-checkbox').checked,
                wordWrap: document.getElementById('word-wrap-checkbox').checked,
                autoCloseBrackets: document.getElementById('auto-close-brackets-checkbox').checked,
                formatOnSave: document.getElementById('format-on-save-checkbox').checked,
                trimTrailingWhitespace: document.getElementById('trim-trailing-whitespace-checkbox').checked,
                cursorStyle: document.getElementById('cursor-style-select').value,
                cursorBlink: document.getElementById('cursor-blink-checkbox').checked
            },
            terminal: {
                shell: document.getElementById('shell-select').value,
                fontSize: document.getElementById('terminal-font-size-slider').value,
                theme: document.getElementById('terminal-theme-select').value,
                cursorBlink: document.getElementById('terminal-cursor-blink-checkbox').checked,
                copyOnSelect: document.getElementById('copy-on-select-checkbox').checked,
                rightClickAction: document.getElementById('right-click-action-checkbox').checked
            },
            application: {
                autosaveInterval: document.getElementById('autosave-interval-slider').value,
                restoreSession: document.getElementById('restore-session-checkbox').checked,
                confirmDelete: document.getElementById('confirm-delete-checkbox').checked,
                autoUpdate: document.getElementById('auto-update-checkbox').checked,
                telemetry: document.getElementById('telemetry-select').value
            }
        };
        
        eel.save_settings(settings)(function(response) {
            if (response.success) {
                showNotification('Success', 'Settings saved successfully');
                applySettings(settings);
            } else {
                showNotification('Error', response.message);
            }
        });
    });
    
    function applySettings(settings) {
        // Apply appearance settings
        if (settings.appearance.theme === 'light') {
            document.body.classList.add('light-theme');
            document.getElementById('theme-toggle').querySelector('i').classList.remove('fa-moon');
            document.getElementById('theme-toggle').querySelector('i').classList.add('fa-sun');
            document.getElementById('theme-toggle').querySelector('span').textContent = 'Light Theme';
            
            if (window.editor) {
                monaco.editor.setTheme('vs');
            }
        } else {
            document.body.classList.remove('light-theme');
            document.getElementById('theme-toggle').querySelector('i').classList.remove('fa-sun');
            document.getElementById('theme-toggle').querySelector('i').classList.add('fa-moon');
            document.getElementById('theme-toggle').querySelector('span').textContent = 'Dark Theme';
            
            if (window.editor) {
                monaco.editor.setTheme('vs-dark');
            }
        }
        
        // Apply editor settings
        if (window.editor) {
            editor.updateOptions({
                fontSize: parseInt(settings.appearance.fontSize),
                fontFamily: settings.appearance.fontFamily,
                tabSize: parseInt(settings.editor.tabSize),
                insertSpaces: settings.editor.insertSpaces,
                wordWrap: settings.editor.wordWrap ? 'on' : 'off',
                autoClosingBrackets: settings.editor.autoCloseBrackets,
                cursorStyle: settings.editor.cursorStyle,
                cursorBlinking: settings.editor.cursorBlink
            });
            
            // Apply minimap setting
            editor.updateOptions({
                minimap: { enabled: settings.appearance.showMinimap }
            });
            
            // Apply line numbers setting
            editor.updateOptions({
                lineNumbers: settings.appearance.showLineNumbers ? 'on' : 'off'
            });
        }
        
        // Apply sidebar width
        document.querySelector('.sidebar').style.width = `${settings.appearance.sidebarWidth}px`;
        
        // Apply terminal settings
        terminal.options.fontSize = parseInt(settings.terminal.fontSize);
        terminal.options.cursorBlink = settings.terminal.cursorBlink;
        
        // Apply terminal theme
        // This would require more complex implementation to change the theme dynamically
        
        // Fit terminals after applying settings
        fitAddon.fit();
        portsFitAddon.fit();
    }
    
    // Theme option selection
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Slider value updates
    document.getElementById('font-size-slider').addEventListener('input', function() {
        document.getElementById('font-size-value').textContent = `${this.value}px`;
    });
    
    document.getElementById('sidebar-width-slider').addEventListener('input', function() {
        document.getElementById('sidebar-width-value').textContent = `${this.value}px`;
    });
    
    document.getElementById('tab-size-slider').addEventListener('input', function() {
        document.getElementById('tab-size-value').textContent = `${this.value} spaces`;
    });
    
    document.getElementById('terminal-font-size-slider').addEventListener('input', function() {
        document.getElementById('terminal-font-size-value').textContent = `${this.value}px`;
    });
    
    document.getElementById('autosave-interval-slider').addEventListener('input', function() {
        document.getElementById('autosave-interval-value').textContent = `${this.value} seconds`;
    });
    
    // Reset settings category
    document.getElementById('reset-settings-category-btn').addEventListener('click', function() {
        const activeCategory = document.querySelector('.settings-category.active').dataset.category;
        
        if (confirm(`Are you sure you want to reset all ${activeCategory} settings to default?`)) {
            eel.reset_settings_category(activeCategory)(function(response) {
                if (response.success) {
                    showNotification('Success', `${activeCategory} settings reset to default`);
                    // Reload settings UI
                    loadSettings();
                } else {
                    showNotification('Error', response.message);
                }
            });
        }
    });
    
    // Reset all settings
    document.getElementById('reset-settings-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            eel.reset_all_settings()(function(response) {
                if (response.success) {
                    showNotification('Success', 'All settings reset to default');
                    // Reload settings UI
                    loadSettings();
                } else {
                    showNotification('Error', response.message);
                }
            });
        }
    });
    
    // Check for updates
    document.getElementById('check-updates-btn').addEventListener('click', function() {
        eel.check_for_updates()(function(response) {
            if (response.success) {
                if (response.update_available) {
                    showNotification('Update Available', `Version ${response.latest_version} is available. You have ${response.current_version}.`);
                } else {
                    showNotification('Up to Date', `You have the latest version (${response.current_version}).`);
                }
            } else {
                showNotification('Error', response.message);
            }
        });
    });
    
    // Load settings when the app starts
    function loadSettings() {
        eel.get_settings()(function(response) {
            if (response.success) {
                const settings = response.settings;
                
                // Apply appearance settings
                if (settings.appearance) {
                    document.querySelector(`.theme-option[data-theme="${settings.appearance.theme}"]`).classList.add('active');
                    document.getElementById('editor-theme-select').value = settings.appearance.editorTheme || 'vs-dark';
                    document.getElementById('font-family-select').value = settings.appearance.fontFamily || "'Fira Code', 'Consolas', 'Monaco', monospace";
                    document.getElementById('font-size-slider').value = settings.appearance.fontSize || 14;
                    document.getElementById('font-size-value').textContent = `${settings.appearance.fontSize || 14}px`;
                    document.getElementById('sidebar-width-slider').value = settings.appearance.sidebarWidth || 220;
                    document.getElementById('sidebar-width-value').textContent = `${settings.appearance.sidebarWidth || 220}px`;
                    document.getElementById('show-minimap-checkbox').checked = settings.appearance.showMinimap !== false;
                    document.getElementById('show-line-numbers-checkbox').checked = settings.appearance.showLineNumbers !== false;
                }
                
                // Apply editor settings
                if (settings.editor) {
                    document.getElementById('tab-size-slider').value = settings.editor.tabSize || 4;
                    document.getElementById('tab-size-value').textContent = `${settings.editor.tabSize || 4} spaces`;
                    document.getElementById('insert-spaces-checkbox').checked = settings.editor.insertSpaces !== false;
                    document.getElementById('word-wrap-checkbox').checked = settings.editor.wordWrap !== false;
                    document.getElementById('auto-close-brackets-checkbox').checked = settings.editor.autoCloseBrackets !== false;
                    document.getElementById('format-on-save-checkbox').checked = settings.editor.formatOnSave || false;
                    document.getElementById('trim-trailing-whitespace-checkbox').checked = settings.editor.trimTrailingWhitespace || false;
                    document.getElementById('cursor-style-select').value = settings.editor.cursorStyle || 'line';
                    document.getElementById('cursor-blink-checkbox').checked = settings.editor.cursorBlink !== false;
                }
                
                // Apply terminal settings
                if (settings.terminal) {
                    document.getElementById('shell-select').value = settings.terminal.shell || 'auto';
                    document.getElementById('terminal-font-size-slider').value = settings.terminal.fontSize || 14;
                    document.getElementById('terminal-font-size-value').textContent = `${settings.terminal.fontSize || 14}px`;
                    document.getElementById('terminal-theme-select').value = settings.terminal.theme || 'default';
                    document.getElementById('terminal-cursor-blink-checkbox').checked = settings.terminal.cursorBlink !== false;
                    document.getElementById('copy-on-select-checkbox').checked = settings.terminal.copyOnSelect || false;
                    document.getElementById('right-click-action-checkbox').checked = settings.terminal.rightClickAction !== false;
                }
                
                // Apply application settings
                if (settings.application) {
                    document.getElementById('autosave-interval-slider').value = settings.application.autosaveInterval || 3;
                    document.getElementById('autosave-interval-value').textContent = `${settings.application.autosaveInterval || 3} seconds`;
                    document.getElementById('restore-session-checkbox').checked = settings.application.restoreSession !== false;
                    document.getElementById('confirm-delete-checkbox').checked = settings.application.confirmDelete !== false;
                    document.getElementById('auto-update-checkbox').checked = settings.application.autoUpdate !== false;
                    document.getElementById('telemetry-select').value = settings.application.telemetry || 'on';
                }
                
                // Apply the settings
                applySettings(settings);
            } else {
                showNotification('Error', response.message);
            }
        });
    }
    
    // Load keybindings
    function loadKeybindings() {
        eel.get_keybindings()(function(response) {
            if (response.success) {
                const tbody = document.getElementById('keybindings-tbody');
                tbody.innerHTML = '';
                
                response.keybindings.forEach(binding => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${binding.command}</td>
                        <td>${binding.keybinding}</td>
                        <td>${binding.source}</td>
                        <td>
                            <button class="keybinding-edit-btn" data-command="${binding.command}" data-keybinding="${binding.keybinding}">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                // Add event listeners to edit buttons
                document.querySelectorAll('.keybinding-edit-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const command = this.dataset.command;
                        const currentKeybinding = this.dataset.keybinding;
                        
                        showModal('Edit Keybinding', currentKeybinding, function(newKeybinding) {
                            if (newKeybinding && newKeybinding !== currentKeybinding) {
                                eel.update_keybinding(command, newKeybinding)(function(response) {
                                    if (response.success) {
                                        loadKeybindings();
                                        showNotification('Success', 'Keybinding updated');
                                    } else {
                                        showNotification('Error', response.message);
                                    }
                                });
                            }
                        });
                    });
                });
            } else {
                showNotification('Error', response.message);
            }
        });
    }
    
    // Reset keybindings
    document.getElementById('reset-keybindings-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all keybindings to default?')) {
            eel.reset_keybindings()(function(response) {
                if (response.success) {
                    loadKeybindings();
                    showNotification('Success', 'Keybindings reset to default');
                } else {
                    showNotification('Error', response.message);
                }
            });
        }
    });
    
    // Keybindings search
    document.getElementById('keybindings-search-input').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#keybindings-tbody tr');
        
        rows.forEach(row => {
            const command = row.cells[0].textContent.toLowerCase();
            const keybinding = row.cells[1].textContent.toLowerCase();
            
            if (command.includes(searchTerm) || keybinding.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
    
    // Initialize the app
    function initApp() {
        // Load settings
        loadSettings();
        
        // Load keybindings when keybindings tab is opened
        document.querySelector('[data-category="keybindings"]').addEventListener('click', function() {
            loadKeybindings();
        });
        
        // Check if we should restore the last session
        eel.get_settings()(function(response) {
            if (response.success && response.settings.application && response.settings.application.restoreSession) {
                eel.get_last_workspace()(function(response) {
                    if (response.success && response.workspace_path) {
                        loadWorkspace(response.workspace_path);
                    }
                });
            }
        });
        
        // Load recent workspaces
        eel.get_recent_workspaces()(function(response) {
            if (response.success && response.workspaces.length > 0) {
                const recentWorkspacesList = document.getElementById('recent-workspaces-list');
                recentWorkspacesList.innerHTML = '';
                
                response.workspaces.forEach(workspace => {
                    const workspaceItem = document.createElement('div');
                    workspaceItem.className = 'recent-workspace-item';
                    workspaceItem.innerHTML = `
                        <i class="fas fa-folder"></i>
                        <span>${workspace.name}</span>
                    `;
                    
                    workspaceItem.addEventListener('click', function() {
                        loadWorkspace(workspace.path);
                    });
                    
                    recentWorkspacesList.appendChild(workspaceItem);
                });
                
                document.getElementById('recent-workspaces').style.display = 'block';
            }
        });
        
        // Load notes
        loadNotes();
        
        // Load dictionaries
        loadDictionaries();
        
        // Get serial ports
        eel.get_serial_ports()(function(response) {
            if (response.success) {
                const portSelect = document.getElementById('serial-port-select');
                portSelect.innerHTML = '<option value="">Select a port...</option>';
                
                response.ports.forEach(port => {
                    const option = document.createElement('option');
                    option.value = port.path;
                    option.textContent = `${port.path} - ${port.description || 'Unknown device'}`;
                    portSelect.appendChild(option);
                });
                
                // Update ports count
                document.getElementById('ports-count').textContent = `(${response.ports.length} available)`;
            }
        });
    }
    
    // Initialize the app when the page is loaded
    initApp();
});