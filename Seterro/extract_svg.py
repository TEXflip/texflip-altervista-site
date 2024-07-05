import cv2
import numpy as np
from xml.dom import minidom
from svgpathtools import parse_path

from matplotlib import pyplot as plt

doc = minidom.parse("worldHigh.svg")

# {'M': 1643, 'L': 20323, 'z': 1643, 'l': 77501, 'v': 309, 'h': 329, 'V': 6, 'H': 5}
N_STATES = len(doc.getElementsByTagName("path"))

states = []
min_x, min_y = np.inf, np.inf
max_x, max_y = -np.inf, -np.inf
for i, elem in enumerate(doc.getElementsByTagName("path")):
    path_str = elem.getAttribute("d")
    id = elem.getAttribute("id")
    title = elem.getAttribute("title")
    className = elem.getAttribute("class")
    path = parse_path(path_str)
    # get all points of the path
    points = np.array([[seg.start.real, seg.start.imag] for seg in path])
    states.append({"id": id, "title": title, "class": className, "points": points})
    min_x = min(min_x, points[:, 0].min())
    min_y = min(min_y, points[:, 1].min())
    max_x = max(max_x, points[:, 0].max())
    max_y = max(max_y, points[:, 1].max())
    # print(f"Path {i+1}/{N_STATES}", end="\r")

h = np.floor(max_y)
w = np.floor(max_x)
canvas = np.zeros((int(h), int(w), 3), dtype=np.uint8)

for state in states:
    points = state["points"]
    points = np.floor(points).astype(np.int32)
    for i in range(len(points)-1):
        cv2.circle(canvas, tuple(points[i]), 1, (255, 255, 255), 1)

cv2.namedWindow("canvas", cv2.WINDOW_NORMAL)
cv2.imshow("canvas", canvas)
cv2.waitKey(0)
cv2.destroyAllWindows()

doc.unlink()