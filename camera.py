import cv2

for i in range(5):
    cap = cv2.VideoCapture(i, cv2.CAP_DSHOW)
    ret, frame = cap.read()
    if ret:
        cv2.imshow(f"Camera {i} - press any key", frame)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    else:
        print(f"Camera {i}: nothing")
    cap.release()