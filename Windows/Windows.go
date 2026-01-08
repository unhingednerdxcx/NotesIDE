package main
import (
	"fmt"
	"os"
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

func packet_manager_exist(packetManager string) bool {
	cmd := e1xec.Command(packetManager, "--version") 
	output, err := cmd.CombinedOutput()
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

func main() {
	Output(1, "BUILDING USER INFORMATION")
	Output(2, "Checking if correct os instalation folder used...")
	if (runtime.GOOS == "windows") {
		Output(3, "Correct os was installed")
	} else {
		msg := fmt.Sprintf("INCORRECT INSTALLATION VERSION, PLEASE INSTALL THE CORRECT ONE FOR: %s", runtime.GOOS)
		Output(4, msg)
	}

	Output(2, "Checking package system")
	switch {
	case packet_manager_exist("winget"):
		Output(3, "Detected package manager: winget")
		jsonmanager("data/info.json", "w", "os.packageManager", "winget")
		jsonmanager("data/info.json", "w", "os.type", "Windows")
	case packet_manager_exist("choco"):
		Output(3, "Detected package manager: chocolatey")
		jsonmanager("data/info.json", "w", "os.packageManager", "choco")
		jsonmanager("data/info.json", "w", "os.type", "Windows")
	default:
		Output(4, "PACKAGE MANAGER NOT FOUND, INSTALL winget or chocolatey")
	}
	
	Output(1, "BUILDING APPLICATION RESOURCES")
	Output(2, "Checking browser information")
	browserManager()
	Output(2, "Checking Python information")
	cmd := exec.Command("python", "--version")
    output, err := cmd.CombinedOutput()

    if err != nil {
		cmd = exec.Command("python3", "--version")
		jsonmanager("data/info.json", "w", "os.pythonCommand", "python3")
		output, err = cmd.CombinedOutput()
		if err != nil{
			Output(5, "PYTHON IS NOT INSTALLED")
			Output(3, "Installing python")
			// Installation process
		} else {
			Output(3, "Found python")
		}
    } else{
		jsonmanager("data/info.json", "w", "os.pythonCommand", "python")
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

		cmd := exec.Command(jsonmanager("data/info.json", "r", "os.pythonCommand"), "-m", "venv", "venv")
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
        `venv\Scripts\python.exe`,
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
		`venv\Scripts\python.exe`,
		"app.py"
	)
	cmd.Run()
}