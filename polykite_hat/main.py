import numpy as np
import sympy


def generate_polykite(pos: np.ndarray, angle: float):
    """Generate a polykite shape with the given position and angle.

    Args:
        pos (np.ndarray): position of the polykite in 2D space.
        angle (float): angle of rotation in radians.
    """
    H = np.sqrt(1 - 0.25)
    c30 = np.cos(30 * np.pi / 180) * H
    s30 = np.sin(30 * np.pi / 180) * H

    # Define the vertices of the polykite shape
    vertices = np.array(
        [
            [0, 0],
            [1, 0],
            [0.5 + c30, H - s30],
            [2, 0],
            [2 + c30, s30],
            [2.5, H],
            [2, H],
            [2, 2 * H],
            [2 - c30, 2 * H + s30],
            [1, 2 * H],
            [0.5, 2 * H],
            [0.5, H],
            [0.5 - c30, H - s30],
        ]
    )

    # Create a rotation matrix
    rotation_matrix = np.array(
        [[np.cos(angle), -np.sin(angle)], [np.sin(angle), np.cos(angle)]]
    )

    # Rotate and translate the vertices
    rotated_vertices = vertices @ rotation_matrix + pos

    return rotated_vertices


def path_to_svg(path: np.ndarray, color: str = "black", filename: str = None):
    """Convert a path to an SVG image and optionally save it to a file.

    Args:
        path (np.ndarray): Path of the shape.
        color (str): Color of the shape.
        filename (str, optional): If provided, save SVG to this file.

    Returns:
        str: Complete SVG string.
    """
    # Calculate bounding box for viewBox
    min_x = np.min(path[:, 0])
    max_x = np.max(path[:, 0])
    min_y = np.min(path[:, 1])
    max_y = np.max(path[:, 1])

    # Add some padding
    padding = 0.1
    width = max_x - min_x + 2 * padding
    height = max_y - min_y + 2 * padding
    viewBox = f"{min_x - padding} {min_y - padding} {width} {height}"

    # Create path string
    path_data = f"M {path[0, 0]} {path[0, 1]} "
    for i in range(1, len(path)):
        path_data += f"L {path[i, 0]} {path[i, 1]} "
    path_data += "Z"

    # Create full SVG document
    svg = f'''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="{width * 30}px" height="{height * 30}px" viewBox="{viewBox}" xmlns="http://www.w3.org/2000/svg">
  <path d="{path_data}" fill="white" stroke="black" stroke-width="0.02" />
</svg>'''

    # Optionally save to file
    if filename:
        with open(filename, "w") as f:
            f.write(svg)

    return svg


v = generate_polykite(np.array([0, 0]), 0)

svg = path_to_svg(v, "black", "polykite.svg")
