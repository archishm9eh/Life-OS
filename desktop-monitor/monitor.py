import time
import threading
from flask import Flask, jsonify
from flask_cors import CORS
import win32gui
import win32process
import psutil

app = Flask(__name__)
CORS(app)  # Enables Cross-Origin requests so your React app can fetch this data

# ==============================================================================
# CONFIGURATION MODULE: Adjust your tracking limits here
# ==============================================================================

# Entire background programs that count as slacking
DISTRACTING_PROCESSES = [
    "discord.exe", 
    "spotify.exe", 
    "steam.exe", 
    "vlc.exe"
]

# Browser keywords that trigger a tracking flag (e.g., watching loops instead of coding)
DISTRACTING_KEYWORDS = [
    "youtube", 
    "netflix", 
    "instagram", 
    "facebook", 
    "reddit", 
    "twitter", 
    "twitch"
]

# Time limit before the system registers a hard protocol violation
# 600 seconds = 10 minutes. Change this to 15 for instant testing!
BREACH_THRESHOLD_SECONDS = 600 

# ==============================================================================
# ENGINE CORE: System Diagnostics & Tracking Thread
# ==============================================================================

system_telemetry = {
    "active_app": "Initialization",
    "active_title": "Booting system diagnostics...",
    "consecutive_distraction_time": 0,
    "breach_detected": False
}

def get_active_window_details():
    """Queries the Windows Kernel to find the exact active application."""
    try:
        hwnd = win32gui.GetForegroundWindow()
        if not hwnd:
            return None, None
            
        # Extract title text of the focused window
        window_title = win32gui.GetWindowText(hwnd)
        
        # Cross-reference window thread to pull the executing system PID
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        process = psutil.Process(pid)
        process_name = process.name()
        
        return process_name, window_title
    except Exception:
        # Prevents script from crashing when switching tabs rapidly or closing apps
        return None, None

def tracking_sentinel_loop():
    """Independent daemon tracking execution metrics continuously."""
    global system_telemetry
    loop_interval = 2  # Checks every 2 seconds to keep CPU overhead at 0%
    
    while True:
        process_name, window_title = get_active_window_details()
        
        if process_name and window_title:
            system_telemetry["active_app"] = process_name
            system_telemetry["active_title"] = window_title
            
            proc_lower = process_name.lower()
            title_lower = window_title.lower()
            
            # Evaluation Scan
            is_distracted = False
            if proc_lower in DISTRACTING_PROCESSES:
                is_distracted = True
            else:
                for keyword in DISTRACTING_KEYWORDS:
                    if keyword in title_lower:
                        is_distracted = True
                        break
            
            # Logic Compilation
            if is_distracted:
                system_telemetry["consecutive_distraction_time"] += loop_interval
            else:
                # Gradual decay reward: Going back to work reduces your warning clock quickly
                system_telemetry["consecutive_distraction_time"] = max(
                    0, 
                    system_telemetry["consecutive_distraction_time"] - (loop_interval * 2)
                )
                
            # Check Threshold Violation
            if system_telemetry["consecutive_distraction_time"] >= BREACH_THRESHOLD_SECONDS:
                system_telemetry["breach_detected"] = True
            else:
                system_telemetry["breach_detected"] = False
                
        time.sleep(loop_interval)

# ==============================================================================
# ROUTING NETWORK: Ports for Life OS Integration
# ==============================================================================

@app.route("/api/telemetry", methods=["GET"])
def stream_telemetry():
    """React UI will poll this endpoint to read real-time desktop usage."""
    return jsonify(system_telemetry)

@app.route("/api/override", methods=["POST"])
def master_override():
    """Resets the warning core when you clear the AI challenge loop."""
    global system_telemetry
    system_telemetry["consecutive_distraction_time"] = 0
    system_telemetry["breach_detected"] = False
    return jsonify({"status": "SUCCESS", "message": "Discipline restored. Core clear."})

if __name__ == "__main__":
    # Mount background loop onto an isolated thread separate from the HTTP listeners
    sentinel_worker = threading.Thread(target=tracking_sentinel_loop, daemon=True)
    sentinel_worker.start()
    
    print("\n" + "="*60)
    print("// LIFE_OS OPERATING SYSTEM AUDITOR: ACTIVE")
    print("// ENDPOINT DEPLOYED: http://localhost:5000/api/telemetry")
    print("="*60 + "\n")
    
    # Run the server on port 5000
    app.run(port=5000, debug=False, use_reloader=False)