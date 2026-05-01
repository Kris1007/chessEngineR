import asyncio
import websockets
import cv2
import numpy as np
import base64
import json

baseline_grid = None
prev_grid = None
stable_frames_count = 0

def log(msg):
    print(msg, flush=True)

def get_board_grid(frame, corners):
    h, w = frame.shape[:2]
    pts = np.array([[c['x'] * w, c['y'] * h] for c in corners], dtype=np.float32)
    
    side_len = 400
    dst_pts = np.array([
        [0, 0], [side_len - 1, 0], [side_len - 1, side_len - 1], [0, side_len - 1]
    ], dtype=np.float32)
    
    matrix = cv2.getPerspectiveTransform(pts, dst_pts)
    warped = cv2.warpPerspective(frame, matrix, (side_len, side_len))
    
    gray = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    
    sq_size = side_len // 8
    
    files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    ranks = ['8', '7', '6', '5', '4', '3', '2', '1']
    
    # Store mean intensity per square instead of full image
    squares = []
    for row in range(8):
        for col in range(8):
            sq_img = gray[row*sq_size:(row+1)*sq_size, col*sq_size:(col+1)*sq_size]
            square_name = files[col] + ranks[row]
            mean_val = float(np.mean(sq_img))
            squares.append((square_name, mean_val))
            
    return squares

def compare_grids(grid_a, grid_b):
    """Compare two grids and return list of (square_name, abs_change) sorted by change descending."""
    differences = []
    for i in range(64):
        name = grid_a[i][0]
        diff = abs(grid_a[i][1] - grid_b[i][1])
        differences.append((name, diff))
    differences.sort(key=lambda x: x[1], reverse=True)
    return differences

async def handle_connection(websocket):
    global baseline_grid, prev_grid, stable_frames_count
    log("Client connected!")
    frame_count = 0
    
    # Reset state for new connection
    baseline_grid = None
    prev_grid = None
    stable_frames_count = 0
    
    try:
        async for message in websocket:
            data = json.loads(message)
            
            if data.get("type") == "frame":
                img_data = data.get("image", "")
                corners = data.get("corners", None)
                
                if not corners or len(corners) != 4:
                    continue
                    
                if "," in img_data:
                    img_data = img_data.split(",")[1]
                    
                img_bytes = base64.b64decode(img_data)
                np_arr = np.frombuffer(img_bytes, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                
                if frame is None:
                    log("ERROR: Could not decode frame!")
                    continue

                current_grid = get_board_grid(frame, corners)
                frame_count += 1
                
                if baseline_grid is None:
                    baseline_grid = current_grid
                    prev_grid = current_grid
                    stable_frames_count = 0
                    log(f"Baseline captured! Frame shape: {frame.shape}")
                    await websocket.send(json.dumps({"status": "calibrated"}))
                    continue
                
                # Compare current frame to BASELINE
                diffs_from_baseline = compare_grids(baseline_grid, current_grid)
                
                # Compare current frame to PREVIOUS frame (to detect stability)
                diffs_from_prev = compare_grids(prev_grid, current_grid)
                prev_grid = current_grid
                
                sq1, ch1 = diffs_from_baseline[0]
                sq2, ch2 = diffs_from_baseline[1]
                sq3, ch3 = diffs_from_baseline[2]
                
                # How much the frame changed from the PREVIOUS frame (motion detection)
                max_motion = diffs_from_prev[0][1]
                
                # A piece move changes the mean intensity of a square significantly
                # (piece appears or disappears from a square)
                MOVE_THRESHOLD = 15  # Mean intensity difference
                NOISE_THRESHOLD = 8  # Below this, it's just camera noise
                MOTION_THRESHOLD = 5  # If frame-to-frame change is small, the scene is stable
                
                if frame_count % 5 == 0:
                    log(f"Frame #{frame_count} | {sq1}={ch1:.1f}, {sq2}={ch2:.1f}, {sq3}={ch3:.1f} | motion={max_motion:.1f} | stable={stable_frames_count}")
                
                # Send debug info
                await websocket.send(json.dumps({
                    "debug": True,
                    "top": [
                        {"sq": sq1, "change": round(ch1, 1)},
                        {"sq": sq2, "change": round(ch2, 1)},
                        {"sq": sq3, "change": round(ch3, 1)},
                    ],
                    "stable": stable_frames_count,
                    "motion": round(max_motion, 1)
                }))
                
                # Check: top 2 squares changed significantly, and scene is stable (no hand moving)
                if ch1 > MOVE_THRESHOLD and ch2 > MOVE_THRESHOLD and max_motion < MOTION_THRESHOLD:
                    # Normal move (or castling where up to 4 squares change)
                    # Even if 10 squares changed due to camera shake/exposure, we trust the top 2
                    # squares are the source and destination. chess.js will reject it if it's an illegal move.
                    stable_frames_count += 1
                    if stable_frames_count >= 3:
                        # Find all squares that changed significantly
                        changed_squares = [name for name, diff in diffs_from_baseline if diff > MOVE_THRESHOLD]
                        # Ensure we at least include the top 2 if thresholds were barely missed
                        if sq1 not in changed_squares: changed_squares.append(sq1)
                        if sq2 not in changed_squares: changed_squares.append(sq2)
                        
                        log(f"MOVE DETECTED: candidates {changed_squares}")
                        await websocket.send(json.dumps({
                            "move": True,
                            "squares": changed_squares
                        }))
                        # Update baseline to new board state
                        baseline_grid = current_grid
                        stable_frames_count = 0
                elif max_motion > MOTION_THRESHOLD:
                    # Hand is moving in the frame, reset stability counter
                    stable_frames_count = 0
                else:
                    # Scene is stable, but no move is detected. Reset counter so previous half-moves don't bleed over.
                    stable_frames_count = 0

    except Exception as e:
        log(f"Client disconnected or error: {e}")

async def main():
    log("Starting OpenCV WebSocket Server on ws://localhost:8765")
    async with websockets.serve(handle_connection, "localhost", 8765):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
