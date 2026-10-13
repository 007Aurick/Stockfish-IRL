from typing import Any


import os
import time
import cv2

import supervision as sv
from inference_sdk import InferenceHTTPClient
from dotenv import load_dotenv

load_dotenv()

MODEL_ID = "irl-chess-piece-detector/1"

CONFIDENCE = 0.5
SEND_EVERY = 0.5

client = InferenceHTTPClient(
    api_url = "https://serverless.roboflow.com",
    api_key = os.environ["ROBOFLOW_API_KEY"],
)

box_annotator = sv.BoxAnnotator()
label_annotator = sv.LabelAnnotator(text_scale=0.5)


cap = cv2.VideoCapture(1, cv2.CAP_DSHOW)

detections = sv.Detections.empty() #start at no pieces found
last_sent = 0 #last time model was called



while True:
    ref, frame = cap.read()
    if not ref:
        break
    now = time.time()# current time in frame
    if now - last_sent > SEND_EVERY: #gets the current time and only continues if more than 0.5 seconds since the last model call
        result = client.infer(frame, model_id=MODEL_ID)#sends frame to your model on roboflow server
        detections = sv.Detections.from_inference(result)#converts the result to a detections object
        detections = detections[detections.confidence >= CONFIDENCE]#filters out detections with confidence less than 0.5
        last_sent = now#updates the last time the model was called
    
    labels = []
    for name, conf in zip(detections.data["class_name"], detections.confidence):
        labels.append(f"{name} {conf:.2f}")
    annotated = box_annotator.annotate(frame.copy(),detections)#draws a bounding box around the detected pieces
    annotated = label_annotator.annotate(annotated, detections ,labels=labels)#adds a label to the detected pieces

    
    cv2.imshow("Chess Detection", annotated)#displays the annotated frame

    

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
    

cap.release()
cv2.destroyAllWindows()