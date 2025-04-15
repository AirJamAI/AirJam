import asyncio
import base64
import json
import math
import os
import time
import uuid
from pathlib import Path

import cv2
import mediapipe as mp
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from ultralytics.models import YOLO


class Rectangle:
    name = ""
    x1 = 0
    y1 = 0
    x2 = 0
    y2 = 0
    collided = 0

    def __init__(self, name, x1, y1, x2, y2):
        self.name = name
        self.x1 = x1
        self.x2 = x2
        self.y1 = y1
        self.y2 = y2


mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.4, min_tracking_confidence=0.4, model_complexity=0)
mp_draw2 = mp.solutions.drawing_utils

mp_pose = mp.solutions.pose
mp_pose_model = mp_pose.Pose(static_image_mode=False, model_complexity=2, enable_segmentation=False, min_detection_confidence=0.8, min_tracking_confidence=0.8)
mp_draw = mp.solutions.drawing_utils

pose = YOLO("yolo11n-pose.pt")
app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

w, h = 320, 180


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    random_filename = f"{uuid.uuid4().hex}.png"
    file_path = os.path.join(UPLOAD_DIR, random_filename)

    try:
        while True:
            # Take JSON
            data = await websocket.receive_text()
            # Parse JSON
            payload = json.loads(data)

            multiplayer = payload["multiplayer"] == "true"
            base64_data = payload["data"]

            # Get proper payload from base64 data
            if base64_data.startswith("data:image"):
                base64_data = base64_data.split(",")[1]  # Strip metadata

            # Decode and save the image
            image_bytes = base64.b64decode(base64_data)
            with open(file_path, "wb") as f:
                f.write(image_bytes)

            send_data = await asyncio.to_thread(alter_image, file_path, multiplayer)
            await websocket.send_text(json.dumps({"data": send_data["data"], "cols": send_data["cols"]}))
    except WebSocketDisconnect:
        if os.path.exists(file_path):
            os.remove(file_path)
        else:
            print(f"[Missing] File was not found: {random_filename}")


def alter_yolo(img_rgb, handPts):
    poseRes = pose(img_rgb, conf=0.3)
    pts = poseRes[0].keypoints.data

    skeleton = [
        # (5, 7),
        (7, 9),  # Left arm
        # (6, 8),
        (8, 10),  # Right arm
        # (5, 6),  # Shoulders
        # (5, 11),
        # (6, 12),  # Torso to hips
        # (11, 12),  # Hips
        # (11, 13),
        # 13, 15),  # Left leg
        # (12, 14),
        # (14, 16),  # Right leg
    ]

    for person in pts:
        kps = person.cpu().numpy()
        if kps.size == 0:  # Skip if no keypoints are detected
            continue

        # Draw keypoints
        for i in range(9, 11):
            kp = kps[i]
            handPts.append(kp)
            if len(kp) == 3:  # Ensure keypoint has (x, y, confidence)
                x, y, conf = kp
                if conf > 0.3:  # Confidence threshold
                    x, y = int(x), int(y)
                    # Ensure the coordinates are within the image bounds
                    if 0 <= x < img_rgb.shape[1] and 0 <= y < img_rgb.shape[0]:
                        draw_pulsing_circle(img_rgb, x, y, 3)


def alter_mediapipe(img_rgb, handPts):
    result = mp_pose_model.process(img_rgb)

    HAND_LANDMARKS = [
        mp_pose.PoseLandmark.LEFT_WRIST,
        mp_pose.PoseLandmark.RIGHT_WRIST,
    ]

    # Draw pose landmarks
    if result.pose_landmarks:
        for idx in HAND_LANDMARKS:
            landmark = result.pose_landmarks.landmark[idx]
            h, w, _ = img_rgb.shape
            x, y = int(landmark.x * w), int(landmark.y * h)
            handPts.append((x, y, landmark.visibility))
            draw_pulsing_circle(img_rgb, x, y, 3)


def is_index_finger_up(landmarks):
    # Check if the index finger is extended: tip (8) is above the PIP joint (6)
    index_extended = landmarks.landmark[8].y < landmarks.landmark[6].y

    # Check that the other fingers (middle, ring, pinky) are folded
    other_fingers_folded = True
    for tip, pip in [(12, 10), (16, 14), (20, 18)]:
        # If the tip is above its PIP joint, the finger is considered extended
        if landmarks.landmark[tip].y < landmarks.landmark[pip].y:
            other_fingers_folded = False
    return index_extended and other_fingers_folded


def alter_image(file_path, multiplayer):
    img_rgb = cv2.imread(file_path)
    # img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    active_hands = 0

    handPts = []

    if multiplayer:
        alter_yolo(img_rgb, handPts)
    else:
        result = hands.process(img_rgb)

        alter_mediapipe(img_rgb, handPts)
        if result.multi_hand_landmarks:
            for hand_landmarks in result.multi_hand_landmarks:
                if is_index_finger_up(hand_landmarks):
                    index_finger_indices = [5, 6, 7, 8]
                    h2, w2, _ = img_rgb.shape
                    # Draw only the index finger landmarks
                    for idx in index_finger_indices:
                        x = int(hand_landmarks.landmark[idx].x * w2)
                        y = int(hand_landmarks.landmark[idx].y * h2)
                        draw_pulsing_circle(img_rgb, x, y, 3)
                    active_hands = 1
                else:
                    active_hands = 0
    n = 8
    wOff = int(w / n)
    pad = 4
    rects = []

    sideLengths = int(w / 10)

    res = []  # stores booleans of whether each note is being collided with

    for i in range(0, n):
        rects.append(Rectangle("note" + str(i), w - (wOff * i), h, w - (wOff * (i + 1)) + pad, h - 40))

    padding = 4
    top_box_height = 40
    usable_width = w - 2 * sideLengths
    top_box_width = (usable_width - 2 * padding) // 3
    start_x = sideLengths

    rects.append(Rectangle("right", w, 0, w - sideLengths, h - 80))  # RIGHT
    rects.append(Rectangle("left", 0, 0, sideLengths, h - 80))  # LEFT
    rects.append(Rectangle("topleft", start_x, 0, start_x + top_box_width, top_box_height))
    rects.append(Rectangle("top", start_x + top_box_width + padding, 0, start_x + 2 * top_box_width + padding, top_box_height))
    rects.append(Rectangle("topright", start_x + 2 * (top_box_width + padding), 0, start_x + 3 * top_box_width + 2 * padding, top_box_height))
    for r in rects:
        renderRect(r, handPts, img_rgb, active_hands)
        res.append({"name": r.name, "col": r.collided})

    data = {"data": image_array_to_base64(img_rgb), "cols": res}
    return data


def draw_pulsing_circle(img, x, y, base_radius=3):
    t = time.time() * 5  # speed of pulse
    pulse = int(math.fabs(math.sin(t)) * 2 + base_radius)
    color1 = (29, 53, 51)
    color2 = (16, 17, 25)
    cv2.circle(img, (x, y), base_radius, color1, -1)
    cv2.circle(img, (x, y), pulse, color2, 2, lineType=cv2.LINE_AA)


def renderRect(rect: Rectangle, pts, img, active_hands=0):
    for p in pts:
        x, y, conf = p
        np = [x, y]
        if checkCollide(rect, np):
            rect.collided += 1 + active_hands

    # cv2.rectangle(img, (rect.x1, rect.y1), (rect.x2, rect.y2), (255 if rect.collided == 1 else 0, 0 if rect.collided != 0 else 255, 255 if rect.collided >= 2 else 0), 2)


def checkCollide(rect: Rectangle, p):
    copy = rect
    if copy.x1 < copy.x2:
        copy.x1, copy.x2 = copy.x2, copy.x1
    if copy.y1 < copy.y2:
        copy.y1, copy.y2 = copy.y2, copy.y1

    return p[0] < copy.x1 and p[0] > copy.x2 and p[1] < copy.y1 and p[1] > copy.y2


def image_array_to_base64(image_np, format=".png"):
    # Encode image to memory
    success, encoded_image = cv2.imencode(format, image_np)
    if not success:
        raise ValueError("Could not encode image")

    # Convert to base64
    base64_bytes = base64.b64encode(encoded_image.tobytes())
    base64_string = base64_bytes.decode("utf-8")
    return f"data:image/png;base64,{base64_string}"
