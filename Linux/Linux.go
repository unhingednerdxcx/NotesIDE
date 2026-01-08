package main

import (
    "fmt"
    "encoding/json"
    "os"
    "strings"
    "strconv"
    "runtime"
	"os/exec"
	"bufio"
	"time"
)

func Output(method int, text string) {
	switch method{
	case 1:
		fmt.Println("== ", text, " ==")
	case 2:
		fmt.Println(">>>> ", text, "...")
	case 3:
		fmt.Println(">> ", text, "...")
	case 4:
		fmt.Println("!!", text, "!!")
		time.Sleep(10 * time.Second)
		os.Exit(1)
	case 5:
		fmt.Println("!", text, "!")
		time.Sleep(10 * time.Second)
	default:
		fmt.Println("UNEXPECTED ERROR...")
		time.Sleep(10 * time.Second)
		os.Exit(1)
	}
}

func jsonmanager(path string, method string, vals ...interface{}) interface{} {
    if len(vals) == 0 {
        Output(4, "key not provided")
        return nil
    }

    key := fmt.Sprint(vals[0])
    parts := strings.Split(key, ".")

    // Read JSON file
    fileBytes, err := os.ReadFile(path)
    if err != nil {
        fmt.Println("Error reading file:", err)
        return nil
    }

    var data map[string]interface{}
    if err := json.Unmarshal(fileBytes, &data); err != nil {
        fmt.Println("Error decoding JSON:", err)
        return nil
    }

    switch method {
    case "r":
        // Traverse nested maps
        current := interface{}(data)
        for _, k := range parts {
            m, ok := current.(map[string]interface{})
            if !ok {
                return nil
            }
            current, ok = m[k]
            if !ok {
                return nil
            }
        }
        return current

    case "w":
        if len(vals) < 2 {
            fmt.Println("Error: value not provided for write")
            return nil
        }
        value := vals[1]

        m := data
        for _, k := range parts[:len(parts)-1] {
            if next, ok := m[k].(map[string]interface{}); ok {
                m = next
            } else {
                m[k] = map[string]interface{}{}
                m = m[k].(map[string]interface{})
            }
        }

        m[parts[len(parts)-1]] = value

        // Save back to file
        jsonBytes, err := json.MarshalIndent(data, "", "  ")
        if err != nil {
            fmt.Println("Error marshalling JSON:", err)
            return nil
        }
        if err := os.WriteFile(path, jsonBytes, 0644); err != nil {
            fmt.Println("Error writing JSON file:", err)
            return nil
        }

        return value

    default:
        fmt.Println("Error: invalid method")
        return nil
    }
}

func packet_manager_exist(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}


func browserManager() {
	Output(3, "Enter browser name (CHROME IS HIGHLY RECOMENDED):- ")
    reader := bufio.NewReader(os.Stdin)
	b, _ := reader.ReadString('\n')
    b = strings.TrimSpace(b)
    b = strings.ToLower(b)
	Browsers := []string{"firefox", "chrome", "chromium", "brave", "opera"}
	for _, Browser := range Browsers {
		if Browser == b {
			// jsonmanager("", "w", "browser.name", b)
			return
		}
	}
	Output(4, "Not acceptable, needed:- \"firefox\", \"chrome\", \"chromium\", \"brave\", \"opera\"")
	Output(3, "Browser in list!")
}

func upgradePython() {
    pmanager := jsonmanager("data/info.json", "r", "os.packageManager")
    var cmd *exec.Cmd
    switch pmanager{
    case "pacman":
        cmd = exec.Command("sudo", "pacman", "-Syu", "python")
    case "apt":
        cmd = exec.Command("bash", "-c", "sudo apt update && sudo apt install --only-upgrade python3 -y")
    case "dnf":
        cmd = exec.Command("sudo", "dnf", "upgrade", "python3")
    default:
		Output(4, "SOMETHING WENT WRONG WITH PACKAGE MANAGER")
    }
    output, err := cmd.CombinedOutput()
    if err != nil {
		msg := fmt.Sprintf("ERROR COULD NOT UPGRADE DUE TO %s", err)
		Output(4, msg)
        fmt.Println(string(output))
    } else {
		Output(3, "Upgraded successfully!")
    }
}


func main() {
	// VARS:-
	// _, filename, _, ok := runtime.Caller(0)
	// if !ok {
	// 	Output(4, "ERROR COULD NOT FILE LOCATION")
	// }

	Output(1, "BUILDING USER INFORMATION")
	Output(2, "Checking if correct os instalation folder used...")

	if (runtime.GOOS == "linux") {
		Output(3, "Correct os was installed")
	} else {
		msg := fmt.Sprintf("INCORRECT INSTALLATION VERSION, PLEASE INSTALL THE CORRECT ONE FOR: %s", runtime.GOOS)
		Output(4, msg)
	}

	Output(2, "Checking package system")
	switch {
	case packet_manager_exist("/usr/bin/pacman"):
		Output(3, "Detected Arch linux with package manager: pacman")
		jsonmanager("data/info.json", "w", "os.packageManager", "pacman")
		jsonmanager("data/info.json", "w", "os.type", "Arch")

	case packet_manager_exist("/usr/bin/apt"):
		Output(3, "Detected Debian linux with package manager: apt")
		jsonmanager("data/info.json", "w", "os.packageManager", "apt")
		jsonmanager("data/info.json", "w", "os.type", "Debian")

	case packet_manager_exist("/usr/bin/dnf"):
		Output(3, "Detected RedHat linux with package manager: dnf")
		jsonmanager("data/info.json", "w", "os.packageManager", "dnf")
		jsonmanager("data/info.json", "w", "os.type", "RedHat")

	case packet_manager_exist("/usr/bin/zypper"):
		Output(3, "Detected RedHat linux with package manager: zypper")
		jsonmanager("data/info.json", "w", "os.packageManager", "zypper")
		jsonmanager("data/info.json", "w", "os.type", "RedHat")

	case packet_manager_exist("/usr/bin/yum"):
		Output(3, "Detected RedHat linux with package manager: yum")
		jsonmanager("data/info.json", "w", "os.packageManager", "yum")
		jsonmanager("data/info.json", "w", "os.type", "RedHat")
	default:
		Output(4, "PACKAGE MANAGER NOT FOUND, INSTALL {apt or pacman or dnf or zypper or yum}")
	}

	Output(1, "BUILDING APPLICATION RESOURCES")
	Output(2, "Checking browser information")
	browserManager()
	Output(2, "Checking Python information")
	cmd := exec.Command("python3", "--version")
    output, err := cmd.Output()
    if err != nil {
		Output(5, "PYTHON IS NOT INSTALLED")
		Output(3, "Installing python")
        // Installation process
    } else{
		Output(3, "Found python")
    }

	version_str := strings.TrimSpace(string(output))
    version_parts := strings.Split(version_str, " ") 
    versionNumbers_unclean := strings.Split(version_parts[1], ".")
    version_major, _ := strconv.Atoi(versionNumbers_unclean[0])
    version_minor, _ := strconv.Atoi(versionNumbers_unclean[1])
    version_patch, _ := strconv.Atoi(versionNumbers_unclean[2])
    version_clean := fmt.Sprintf("%d.%d.%d", version_major, version_minor, version_patch)

	msg := fmt.Sprintf("Python version:- %s", version_clean)

	if version_major < 3 || (version_major >= 3  && version_minor < 10) {
        Output(5, "PYTHON IS <3.10 WHICH IS BELLOW REQUIREMENT")
		Output(2, "Upgrading python")
        upgradePython()
    } else{
        fmt.Println("Python version meets requirement!")
    }
    
	if _, err := os.Stat(".venv"); os.IsNotExist(err) {
		Output(3, "Building virtual environment")

		cmd := exec.Command("python3", "-m", "venv", ".venv")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr

		if err := cmd.Run(); err != nil {
			msg = fmt.Sprintf("COULD NOT MAKE VIRTUAL ENVIRONEMNT DUE TO:- %s", err)
			Output(4, msg)
		}
		Output(2, "MADE VIRTUAL ENVIRONMENT")
	} else {
		Output(2, "Virtual environment already exists, skipping creation HOWEVER NOT EXPECTED")
	}
	Output(1, "Installing Python libs")

	cmd = exec.Command(
        ".venv/bin/python",
        "-m", "pip",
        "install",
        "-r", "req.txt",
        "--disable-pip-version-check",
        "--no-input",
    )

    cmd.Stdout = os.Stdout
    cmd.Stderr = os.Stderr

    err = cmd.Run()
    if err != nil {
		msg = fmt.Sprintf("COULD NOT INSTALL DUE TO:- %s", err)
		Output(4, msg)
    } else {
		Output(3, "Installed successfully")
    }
    cmd = exec.Command(
        ".venv/bin/python",
        "app.py"
    )
	cmd.Run()
}