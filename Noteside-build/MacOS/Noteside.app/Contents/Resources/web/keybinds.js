document.addEventListener('DOMContentLoaded', function(){
  window.funcs = {};
  function log(info, other){
    eel.log('js-Key', info, other);
  }
  const keyMap = {}; // maps key combos to function names

  // load JSON from Python
  eel.getKeybinds()(commandsJson => {
  for (const [name, obj] of Object.entries(commandsJson)) {
    // create callable function
    funcs[name] = new Function(obj.command);

    // map key combo to command name
    keyMap[obj.keyBind.toLowerCase()] = name;
  }
  });

  // listen for key presses
  document.addEventListener('keydown', (e) => {
  let combo = '';
  if (e.ctrlKey) combo += 'control+';
  if (e.altKey) combo += 'alt+';
  if (e.shiftKey) combo += 'shift+';
  combo += e.key.toLowerCase();

  if (keyMap[combo]) {
    e.preventDefault(); // stop browser default
    const commandName = keyMap[combo];
    funcs[commandName](); // call the function
  }
  });

    function keybindStart(){
        eel.getKeybinds()(function(cmd){
            const tbody = document.getElementById("keybindings-tbody");
            tbody.innerHTML = "";
            for (const [name, obj] of Object.entries(cmd)) {
                const tr = document.createElement("tr")

                const tdcmd = document.createElement("td")
                tdcmd.textContent = name

                const tdKey = document.createElement("td")
                tdKey.textContent = obj.keyBind

                const tdAct = document.createElement("td")
                tdAct.textContent = obj.command
                tr.addEventListener('click', function(){
                    keybindpopuphandler(name, obj.command)
                });
                tr.classList.add("key-row");
                tr.append(tdcmd, tdKey, tdAct)
                tbody.appendChild(tr);

            }
        });
    }
    keybindStart()

    document.getElementById('add-keybindings-btn').addEventListener('click', function(){
        Newkeybindpopuphandler()
    });

    function Newkeybindpopuphandler(){
        document.getElementById('popup').style.display = "flex"
        document.getElementById('Title').innerText = `New Key`;
        document.getElementById('modal-input-name').placeholder = 'New key';
        document.getElementById('modal-input-action').placeholder = 'New command';
        document.getElementById('save-btn-modal').style.display = "none"
        document.getElementById('delete-btn-modal').style.display = "none"
        const keyBox = document.getElementById('keybind-box');
        const keyDisplay = document.getElementById('key');
        let pressedKeys = new Set();
        let listening = false;

        function clearUp(){
            listening = false;
            pressedKeys = new Set();
            keyDisplay.textContent = '';
            document.getElementById('modal-input-name').value = '';
            document.getElementById('modal-input-action').value = '';
        }
        keyBox.addEventListener('click', () => {
            listening = !listening;
            pressedKeys.clear();
            keyDisplay.textContent = 'Press a key...';
            keyBox.classList.add('active'); // add highlight
        });
        document.addEventListener('keydown', (e) => {
            if (!listening) return;

            pressedKeys.add(e.key); // add pressed key
            keyDisplay.textContent = [...pressedKeys].join(' + ');
        });
        document.getElementById('new-btn-modal').addEventListener('click', async function(){
            await eel.addKey(
                document.getElementById('modal-input-name').value,
                [...pressedKeys].join('+'),
                document.getElementById('modal-input-action').value
            )
            document.getElementById('popup').style.display = "none"
            clearUp();
            keybindStart()
        });

        document.getElementById('cancel-btn-modal').addEventListener('click', function(){
            document.getElementById('popup').style.display = "none";
            clearUp();
        })
    }

    document.getElementById('popup').style.display = "none"

    function keybindpopuphandler(name, cmd){
        document.getElementById('modal-input-action').value = cmd;
        document.getElementById('modal-input-name').value = name;
        document.getElementById('popup').style.display = "flex"
        document.getElementById('Title').innerText = `Editing ${name}`;
        document.getElementById('new-btn-modal').style.display = "none"
        document.getElementById('save-btn-modal').style.display = "flex"
        document.getElementById('delete-btn-modal').style.display = "flex"
        const keyBox = document.getElementById('keybind-box');
        const keyDisplay = document.getElementById('key');
        let pressedKeys = new Set();
        let listening = false;

        function clearUp(){
            listening = false;
            pressedKeys = new Set();
            keyDisplay.textContent = '';
            document.getElementById('modal-input-name').value = '';
            document.getElementById('modal-input-action').value = '';
        }

        // Click to start listening
        keyBox.addEventListener('click', () => {
            listening = !listening;
            pressedKeys.clear();
            keyDisplay.textContent = 'Press a key...';
            keyBox.classList.add('active'); // add highlight
        });

        // Keydown listener
        document.addEventListener('keydown', (e) => {
            if (!listening) return;

            pressedKeys.add(e.key); // add pressed key
            keyDisplay.textContent = [...pressedKeys].join(' + ');
        });

        document.getElementById('save-btn-modal').addEventListener('click', async function(){
            await eel.s(name, document.getElementById('modal-input-name').value, 'command')();
            await eel.s(name, {
                command: document.getElementById('modal-input-action').value,
                keyBind: [...pressedKeys].join('+')
            })();

            log('PRESSED KEYS:', [...pressedKeys].join(' + '));
            document.getElementById('popup').style.display = "none";
            keybindStart()
            clearUp();
        });

        document.getElementById('cancel-btn-modal').addEventListener('click', function(){
            document.getElementById('popup').style.display = "none"
            clearUp();
        });

          document.getElementById('delete-btn-modal').addEventListener('click', async function(){
            await eel.deleteKey(name);
            document.getElementById('popup').style.display = "none"
            clearUp();
        });
    }
})
