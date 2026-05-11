import subprocess
import sys
import os
import time
import signal
from datetime import datetime

# ==============================
# ANSI COLORS
# ==============================
RESET = "\033[0m"

BLACK = "\033[30m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
MAGENTA = "\033[35m"
CYAN = "\033[36m"
WHITE = "\033[37m"

BRIGHT_BLACK = "\033[90m"
BRIGHT_RED = "\033[91m"
BRIGHT_GREEN = "\033[92m"
BRIGHT_YELLOW = "\033[93m"
BRIGHT_BLUE = "\033[94m"
BRIGHT_MAGENTA = "\033[95m"
BRIGHT_CYAN = "\033[96m"
BRIGHT_WHITE = "\033[97m"

BOLD = "\033[1m"


# ==============================
# UI HELPERS
# ==============================
def clear():
    os.system("cls" if os.name == "nt" else "clear")


def line(color=BRIGHT_BLACK):
    print(color + "═" * 72 + RESET)


def center(text, color=WHITE):
    width = 72
    print(color + text.center(width) + RESET)


def status(label, message, color=BRIGHT_CYAN):
    print(
        f"{BRIGHT_BLACK}│{RESET} "
        f"{color}{BOLD}{label:<12}{RESET}"
        f"{WHITE}{message}{RESET}"
    )


def print_banner():
    clear()

    line(BRIGHT_MAGENTA)

    center("ARVUS PERSONAL AI OPERATING SYSTEM", BRIGHT_CYAN)
    center("NEXT GEN LOCAL AGENTIC ENVIRONMENT", BRIGHT_BLACK)

    line(BRIGHT_MAGENTA)

    print()

    print(BRIGHT_BLUE + r"""
          █████╗ ██████╗ ██╗   ██╗██╗   ██╗███████╗
         ██╔══██╗██╔══██╗██║   ██║██║   ██║██╔════╝
         ███████║██████╔╝██║   ██║██║   ██║███████╗
         ██╔══██║██╔══██╗╚██╗ ██╔╝██║   ██║╚════██║
         ██║  ██║██║  ██║ ╚████╔╝ ╚██████╔╝███████║
         ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝   ╚═════╝ ╚══════╝
    """ + RESET)

    print()

    center("SYSTEM BOOT SEQUENCE INITIALIZING", BRIGHT_GREEN)

    print()
    line(BRIGHT_BLACK)

    now = datetime.now().strftime("%d %b %Y  •  %I:%M:%S %p")

    status("SYSTEM", "ARVUS CORE ENGINE")
    status("STATUS", "BOOTING SERVICES")
    status("TIME", now)
    status("MODE", "LOCAL AGENT EXECUTION")
    status("SECURITY", "SANDBOX ACTIVE")
    status("AUTHOR", "MOHAMMED ATIF")

    line(BRIGHT_BLACK)
    print()


def print_ready_card():
    print()
    line(BRIGHT_GREEN)

    center("ENGINE CLUSTERS ONLINE", BRIGHT_GREEN)

    line(BRIGHT_GREEN)

    status("FRONTEND", "http://localhost:5173", BRIGHT_CYAN)
    status("BACKEND", "http://localhost:8000", BRIGHT_BLUE)
    status("OLLAMA", "http://localhost:11434", BRIGHT_MAGENTA)

    line(BRIGHT_BLACK)

    print(
        f"{BRIGHT_YELLOW}⚡ Keep this terminal open."
        f" Press Ctrl+C to shutdown ARVUS safely.{RESET}"
    )

    print()


def boot_message(text, color=BRIGHT_YELLOW):
    print(f"{color}[BOOT]{RESET} {WHITE}{text}{RESET}")


# ==============================
# MAIN
# ==============================
def main():
    # Find project root based on location of script
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # Define executable paths explicitly to handle non-venv executions
    venv_python = os.path.join(root_dir, "venv", "Scripts", "python.exe")

    if not os.path.exists(venv_python):
        print(f"{BRIGHT_RED}CRITICAL ERROR:{RESET} Virtual environment not found.")
        print(f"{BRIGHT_BLACK}{venv_python}{RESET}")
        print("Please ensure your venv is created in the root folder.")
        return

    print_banner()

    processes = []

    try:
        # 1. Start Backend via Venv Python
        boot_message("Launching FastAPI Backend Cluster...")

        backend_cmd = [
            venv_python,
            "-m",
            "uvicorn",
            "main:app",
            "--reload",
            "--port", "8000"
        ]

        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=backend_dir,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )

        processes.append(backend_proc)

        print(f"{BRIGHT_GREEN}   └─ Backend online on port 8000{RESET}")

        time.sleep(2)

        # 2. Start Frontend via NPM
        boot_message("Launching React Vite Frontend...")

        frontend_proc = subprocess.Popen(
            "npm run dev -- --port 5173",
            cwd=frontend_dir,
            shell=True,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )

        processes.append(frontend_proc)

        print(f"{BRIGHT_GREEN}   └─ Frontend online on port 5173{RESET}")

        time.sleep(2)

        print_ready_card()

        spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
        idx = 0

        while True:
            uptime = datetime.now().strftime("%I:%M:%S %p")

            print(
                f"\r{BRIGHT_GREEN}●{RESET} "
                f"{BRIGHT_CYAN}ARVUS ACTIVE{RESET} "
                f"{BRIGHT_BLACK}[{uptime}]{RESET} "
                f"{BRIGHT_MAGENTA}{spinner[idx % len(spinner)]}{RESET}",
                end=""
            )

            idx += 1
            time.sleep(0.12)

    except KeyboardInterrupt:
        print("\n")
        line(BRIGHT_RED)

        center("SHUTDOWN SEQUENCE INITIATED", BRIGHT_RED)

        line(BRIGHT_RED)

        print(
            f"{BRIGHT_YELLOW}[SYSTEM]{RESET} "
            f"{WHITE}Terminating engine clusters...{RESET}"
        )

    finally:
        # Cleanup: Kill all spawned processes reliably on Windows
        for p in processes:
            try:
                if os.name == 'nt':
                    subprocess.call(
                        ['taskkill', '/F', '/T', '/PID', str(p.pid)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )
                else:
                    p.terminate()
            except:
                pass

        print(
            f"{BRIGHT_GREEN}[STATUS]{RESET} "
            f"{WHITE}All services offline. Goodbye.{RESET}"
        )


if __name__ == "__main__":
    # Enable color on Windows cmd if needed
    if os.name == 'nt':
        os.system('')

    main()