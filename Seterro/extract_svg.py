import cv2
import json
import numpy as np
from pathlib import Path
from xml.dom import minidom

from matplotlib import pyplot as plt

doc = minidom.parse("worldHigh.svg")

# {'M': 1643, 'Z': 1643, 'V': 346, 'L': 637, 'H': 325}
N_STATES = len(doc.getElementsByTagName("path"))

states = []
min_x, min_y = np.inf, np.inf
max_x, max_y = -np.inf, -np.inf
for i, elem in enumerate(doc.getElementsByTagName("path")):
    path_str = elem.getAttribute("d")
    id = elem.getAttribute("id")
    title = elem.getAttribute("title")
    className = elem.getAttribute("class")
    polygons = []
    curr_istr = ""
    for instr in path_str.split(" "):
        if instr.isalpha():
            curr_istr = instr
            if instr == "M":
                polygons.append([])
                curr_istr = "L"
            elif instr == "Z":
                polygons[-1] = np.array(polygons[-1])
        else:
            if curr_istr == "L":
                x, y = instr.split(",")
                x = float(x)
                y = float(y)
                polygons[-1].append([x, y])
            elif curr_istr == "Z":
                polygons[-1].append(polygons[-1][0])
            elif curr_istr == "V":
                y = float(instr)
                polygons[-1].append([polygons[-1][-1][0], y])
            elif curr_istr == "H":
                x = float(instr)
                polygons[-1].append([x, polygons[-1][-1][1]])
    states.append({"id": id, "title": title, "class": className, "polygons": polygons})


def mercator_inverse(p, lon0 = 0, r=160.7, equator=462.3, w=1010):
    x = p[:, 0]
    y = p[:, 1]
    lat = 2 * np.arctan(np.exp((-y + equator)/r)) - np.pi/2
    lon = 2 * np.pi * x / w
    return np.stack([lat, lon], axis=1)

def polar_to_cartesian(p, r=1):
    lat = p[:, 0]
    lon = p[:, 1]
    x = r * np.cos(lat) * np.cos(lon)
    y = r * np.cos(lat) * np.sin(lon)
    z = r * np.sin(lat)

    return np.stack([x, y, z], axis=1)

def rotate(p, dx, dy, dz):
    x = p[:, 0]
    y = p[:, 1]
    z = p[:, 2]
    x2 = x * np.cos(dz) - y * np.sin(dz)
    y2 = x * np.sin(dz) + y * np.cos(dz)
    z2 = z
    x = x2
    y = y2
    z = z2
    x2 = x * np.cos(dy) - z * np.sin(dy)
    y2 = y
    z2 = x * np.sin(dy) + z * np.cos(dy)
    x = x2
    y = y2
    z = z2
    x2 = x
    y2 = y * np.cos(dx) - z * np.sin(dx)
    z2 = y * np.sin(dx) + z * np.cos(dx)
    return np.stack([x2, y2, z2], axis=1)

def generate_json(states):
    data = {}
    for state in states:
        polys = state["polygons"]
        for i in range(len(polys)):
            points = polys[i]
            points = mercator_inverse(points)
            points = polar_to_cartesian(points)
            polys[i] = points.tolist()
        data[state["id"]] = {
            "title": state["title"],
            "class": state["class"],
            "polys": polys
        }
    with open("world.json", "w") as f:
        json.dump(data, f, indent=4)

def generate_obj(states):
    for state in states:
        polys = state["polygons"]
        obj_path = Path("objs")
        obj_path.mkdir(exist_ok=True)
        with open(obj_path / f"{state['id']}.obj", "w") as f:
            for points in polys:
                points = mercator_inverse(points)
                points = polar_to_cartesian(points)
                for p in points:
                    f.write(f"v {p[0]} {p[1]} {p[2]}\n")
                f.write("f")
                for i in range(len(points)):
                    f.write(f" {i+1}")
                f.write("\n")
        

def draw():
    canvas = np.zeros((1000, 1000, 3), dtype=np.uint8)
    lon0 = cv2.getTrackbarPos("lon0", "canvas") * 2 * np.pi / 1000
    dx = cv2.getTrackbarPos("dx", "canvas") * 2 * np.pi / 1000
    dy = cv2.getTrackbarPos("dy", "canvas") * 2 * np.pi / 1000
    dz = cv2.getTrackbarPos("dz", "canvas") * 2 * np.pi / 1000
    r0 = cv2.getTrackbarPos("r0", "canvas") / 10
    r1 = cv2.getTrackbarPos("r1", "canvas") / 10
    _x = cv2.getTrackbarPos("_x", "canvas")
    _y = cv2.getTrackbarPos("_y", "canvas")
    for state in states:
        polys = state["polygons"]
        for points in polys:
            points = mercator_inverse(points)
            points = polar_to_cartesian(points, r1)
            points = rotate(points, dx, dy, dz)
            points = np.floor(points[:,:2] + [_x, _y]).astype(np.int32)
            cv2.polylines(canvas, [points], isClosed=True, color=(255, 255, 255), thickness=1)
    cv2.imshow("canvas", canvas)

def show():
    cv2.namedWindow("canvas")
    cv2.createTrackbar("lon0", "canvas", 0, 1000, lambda x: None)
    cv2.createTrackbar("r0", "canvas", 1, 10000, lambda x: None)
    cv2.createTrackbar("r1", "canvas", 1, 10000, lambda x: None)
    cv2.createTrackbar("dx", "canvas", 0, 1000, lambda x: None)
    cv2.createTrackbar("dy", "canvas", 0, 1000, lambda x: None)
    cv2.createTrackbar("dz", "canvas", 0, 1000, lambda x: None)
    cv2.createTrackbar("_x", "canvas", 589, 1000, lambda x: None)
    cv2.createTrackbar("_y", "canvas", 544, 1000, lambda x: None)

    while True:
        draw()
        if cv2.pollKey() == 27 or cv2.getWindowProperty("canvas", cv2.WND_PROP_VISIBLE) < 1:
            break
    cv2.destroyAllWindows()

# generate_json(states)
# show()
generate_obj(states)

doc.unlink()