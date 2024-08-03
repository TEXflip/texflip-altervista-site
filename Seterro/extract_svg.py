import json
from xml.dom import minidom
from pathlib import Path
from colorsys import hsv_to_rgb
from cProfile import Profile

import numpy as np
from scipy.spatial import Delaunay
from shapely.geometry import Polygon

doc = minidom.parse("worldHigh.svg")

MATERIAL_TEMPL = """
newmtl {0}
Ns 0.000000
Ka 1.000000 1.000000 1.000000
Kd {1} {2} {3}
Ks 0.500000 0.500000 0.500000
Ke 0.000000 0.000000 0.000000
Ni 1.000000
d 1.000000
illum 2"""

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


def rotation_matrix_from_vectors(vec1, vec2):
    """ Find the rotation matrix that aligns vec1 to vec2
    :param vec1: A 3d "source" vector
    :param vec2: A 3d "destination" vector
    :return mat: A transform matrix (3x3) which when applied to vec1, aligns it with vec2.
    """
    a, b = (vec1 / np.linalg.norm(vec1)).reshape(3), (vec2 / np.linalg.norm(vec2)).reshape(3)
    v = np.cross(a, b)
    c = np.dot(a, b)
    s = np.linalg.norm(v)
    kmat = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    rotation_matrix = np.eye(3) + kmat + kmat.dot(kmat) * ((1 - c) / (s ** 2))
    return rotation_matrix


def R_from_angles(th_x, th_y, th_z):
    Rx = np.array(
        [
            [1, 0, 0],
            [0, np.cos(th_x), -np.sin(th_x)],
            [0, np.sin(th_x), np.cos(th_x)],
        ]
    )
    Ry = np.array(
        [
            [np.cos(th_y), 0, np.sin(th_y)],
            [0, 1, 0],
            [-np.sin(th_y), 0, np.cos(th_y)],
        ]
    )
    Rz = np.array(
        [
            [np.cos(th_z), -np.sin(th_z), 0],
            [np.sin(th_z), np.cos(th_z), 0],
            [0, 0, 1],
        ]
    )
    return Rz @ Ry @ Rx


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


def generate_world_obj(states, export_states=False):
    obj_path = Path("objs")
    if export_states:
        states_path = obj_path / "states"
        states_path.mkdir(exist_ok=True)
    obj_path.mkdir(exist_ok=True)
    obj_file = open(obj_path / "world.obj", "w")

    # Generate vertices
    points = np.concatenate([np.concatenate(state["polygons"]) for state in states])
    points = mercator_inverse(points)
    points = polar_to_cartesian(points)

    profiler = Profile()
    profiler.enable()
    i = 0
    # Generate faces
    for n, state in enumerate(states):
        print(f"{n+1}/{N_STATES}: {state['title']:<50}", end="\r")
        polys = state["polygons"]
        state_points = []
        states[n]["faces"] = []
        for poly in polys:
            points_3d_poly = points[i : i + len(poly)]
            center = np.mean(points_3d_poly, axis=0)
            R = rotation_matrix_from_vectors(center, np.array([1, 0, 0]))
            points_rotated = (R @ points_3d_poly.T).T
            if export_states:
                state_points.append(np.append(points_3d_poly, points_rotated * 1.2, axis=0))
            points_proj = points_rotated[:, 1:]
            shap_poly = Polygon(points_proj)
            if shap_poly.area >= 0.04:
                _c = shap_poly.centroid
                center = R.T @ np.array([1, _c.x, _c.y])
                c_norm = np.linalg.norm(center)
                points = np.insert(points, i, center / c_norm, axis=0)
                points_proj = np.insert(points_proj, 0, [_c.x, _c.y], axis=0)
            poly_tri = Delaunay(points_proj).simplices
            tri_centers = [Polygon(points_proj[t]).centroid for t in poly_tri]
            mask = [shap_poly.contains(center) for center in tri_centers]
            obj_str = "\n".join(
                [
                    f"f {t[0]+1+i}//{t[0]+1+i} {t[1]+1+i}//{t[1]+1+i} {t[2]+1+i}//{t[2]+1+i}"
                    for t, m in zip(poly_tri, mask)
                    if m
                ]
            )
            states[n]["faces"].append(obj_str)
            i += len(points_proj)
        if export_states:
            with open(states_path / f"{state['id']}.obj", "w") as f:
                state_points_str = "\n".join(
                    [f"v {point[0]} {point[1]} {point[2]}" for point in np.concatenate(state_points)]
                )
                f.write(state_points_str + "\n")

    points_str_obj = "\n".join(
        [f"v {point[0]} {point[1]} {point[2]}" for point in points]
    )
    normalized_points = points / np.linalg.norm(points, axis=1)[:, None]
    normals_str_obj = "\n".join(
        [f"vn {point[0]} {point[1]} {point[2]}" for point in normalized_points]
    )
    obj_file.write(points_str_obj + "\n")
    obj_file.write(normals_str_obj + "\n")
    for state in states:
        obj_file.write(f"g {state['id']} {state['title']}\n")
        # obj_file.write(f"usemtl {state['id']}\n")
        for face in state["faces"]:
            obj_file.write(face + "\n")

    profiler.disable()
    print("Number of vertices:", i)
    obj_file.close()

    profiler.dump_stats("profiling.prof")


generate_world_obj(states, export_states=False)

doc.unlink()
