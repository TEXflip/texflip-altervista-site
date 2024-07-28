import json
from xml.dom import minidom
from pathlib import Path
from colorsys import hsv_to_rgb
from cProfile import Profile

import numpy as np
from scipy.spatial import Delaunay
from shapely.geometry import Polygon
from shapely.strtree import STRtree

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


def mercator_inverse(p, lon0=0, r=160.7, equator=462.3, w=1010):
    x = p[:, 0]
    y = p[:, 1]
    lat = 2 * np.arctan(np.exp((-y + equator) / r)) - np.pi / 2
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
            "polys": polys,
        }
    with open("world.json", "w") as f:
        json.dump(data, f, indent=4)


def generate_world_obj(states):
    material_tmpl = """
newmtl {0}
Ns 0.000000
Ka 1.000000 1.000000 1.000000
Kd {1} {2} {3}
Ks 0.500000 0.500000 0.500000
Ke 0.000000 0.000000 0.000000
Ni 1.000000
d 1.000000
illum 2"""
    obj_path = Path("objs")
    obj_path.mkdir(exist_ok=True)
    obj_file = open(obj_path / "world.obj", "w")
    obj_file.write("mtllib world.mtl\n")

    # Generate vertices
    points = [np.concatenate(state["polygons"]) for state in states]
    points = np.concatenate(points)
    points = mercator_inverse(points)
    points = polar_to_cartesian(points)
    points_str_obj = "\n".join(
        [f"v {point[0]} {point[1]} {point[2]}" for point in points]
    )
    normalized_points = -points / np.linalg.norm(points, axis=1)[:, None]
    normals_str_obj = "\n".join(
        [f"vn {point[0]} {point[1]} {point[2]}" for point in normalized_points]
    )
    obj_file.write(points_str_obj + "\n")
    obj_file.write(normals_str_obj + "\n")
    material_str_obj = "\n".join(
        [
            material_tmpl.format(state["id"], *hsv_to_rgb(n / N_STATES, 1, 1))
            for n, state in enumerate(states)
        ]
    )
    with open(obj_path / "world.mtl", "w") as mtl_file:
        mtl_file.write(material_str_obj)

    profiler = Profile()
    profiler.enable()
    i = 0
    # Generate faces
    for n, state in enumerate(states):
        print(f"{n+1}/{N_STATES}: {state['title']:<50}", end="\r")
        obj_file.write(f"g {state['id']} {state['title']}\n")
        obj_file.write(f"usemtl {state['id']}\n")
        polys = state["polygons"]
        poly_tri = [Delaunay(poly).simplices for poly in polys]
        shapely_poly = [Polygon(poly) for poly in polys]
        for tri, poly, shapely_poly in zip(poly_tri, polys, shapely_poly):
            tri_center = [Polygon(poly[t]).centroid for t in tri]
            mask = [shapely_poly.contains(center) for center in tri_center]
            obj_str = "\n".join(
                [f"f {t[0]+1+i}//{t[0]+1+i} {t[1]+1+i}//{t[1]+1+i} {t[2]+1+i}//{t[2]+1+i}" for t, m in zip(tri, mask) if m]
            )
            obj_file.write(obj_str + "\n")
            i += len(poly)

    profiler.disable()
    print("Number of vertices:", i)
    obj_file.close()

    profiler.dump_stats("profiling.prof")


generate_world_obj(states)

doc.unlink()
