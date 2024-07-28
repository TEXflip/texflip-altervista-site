import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const obj_loader = new OBJLoader();
obj_loader.load(
	'objs/world.obj',
	function (object) {
		scene.add(object);
	},
	function (xhr) {
		// console.log((xhr.loaded / xhr.total * 100) + '% loaded');
	},
	function (error) {
		console.log(error);
	}
);
const mtl_loader = new MTLLoader();
mtl_loader.load(
	'objs/world.mtl',
	function (materials) {
		// materials.preload();
		obj_loader.setMaterials(materials);
	},
	function (xhr) {
		// console.log((xhr.loaded / xhr.total * 100) + '% loaded');
	},
	function (error) {
		console.log(error);
	}
);

function animate() {
	renderer.render(scene, camera);
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);