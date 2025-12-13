import * as THREE from 'three';

// ===== Scene Setup =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

// ===== Lighting =====
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x00d4ff, 2, 100);
pointLight1.position.set(10, 10, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x7c3aed, 2, 100);
pointLight2.position.set(-10, -10, 10);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0xf43f5e, 1.5, 100);
pointLight3.position.set(0, 10, -10);
scene.add(pointLight3);

// ===== Materials =====
const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.9,
    roughness: 0.1,
});

const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0x00d4ff,
    emissive: 0x00d4ff,
    emissiveIntensity: 0.3,
    metalness: 0.5,
    roughness: 0.3,
});

const proteinMaterial = new THREE.MeshStandardMaterial({
    color: 0x7c3aed,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.2,
    metalness: 0.6,
    roughness: 0.4,
});

// ===== Create Dumbbell =====
function createDumbbell() {
    const group = new THREE.Group();

    // Bar (handle)
    const barGeometry = new THREE.CylinderGeometry(0.15, 0.15, 4, 32);
    const bar = new THREE.Mesh(barGeometry, chromeMaterial);
    bar.rotation.z = Math.PI / 2;
    group.add(bar);

    // Grip texture on bar
    const gripGeometry = new THREE.CylinderGeometry(0.17, 0.17, 1.5, 32);
    const gripMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.3,
        roughness: 0.8,
    });
    const grip = new THREE.Mesh(gripGeometry, gripMaterial);
    grip.rotation.z = Math.PI / 2;
    group.add(grip);

    // Weight plates
    const plateGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32);

    // Left plates
    for (let i = 0; i < 3; i++) {
        const plate = new THREE.Mesh(plateGeometry, glowMaterial);
        plate.rotation.z = Math.PI / 2;
        plate.position.x = -1.6 - (i * 0.35);
        group.add(plate);
    }

    // Right plates
    for (let i = 0; i < 3; i++) {
        const plate = new THREE.Mesh(plateGeometry, glowMaterial);
        plate.rotation.z = Math.PI / 2;
        plate.position.x = 1.6 + (i * 0.35);
        group.add(plate);
    }

    // End caps
    const capGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const leftCap = new THREE.Mesh(capGeometry, chromeMaterial);
    leftCap.position.x = -2.7;
    group.add(leftCap);

    const rightCap = new THREE.Mesh(capGeometry, chromeMaterial);
    rightCap.position.x = 2.7;
    group.add(rightCap);

    return group;
}

// ===== Create Protein Helix =====
function createProteinHelix() {
    const group = new THREE.Group();

    const helixPoints = [];
    const numPoints = 100;
    const radius = 1;
    const height = 6;
    const turns = 3;

    for (let i = 0; i < numPoints; i++) {
        const t = i / numPoints;
        const angle = t * Math.PI * 2 * turns;
        const x = Math.cos(angle) * radius;
        const y = (t - 0.5) * height;
        const z = Math.sin(angle) * radius;
        helixPoints.push(new THREE.Vector3(x, y, z));
    }

    // Create helix backbone
    const helixCurve = new THREE.CatmullRomCurve3(helixPoints);
    const tubeGeometry = new THREE.TubeGeometry(helixCurve, 100, 0.08, 16, false);
    const helix = new THREE.Mesh(tubeGeometry, proteinMaterial);
    group.add(helix);

    // Add amino acid spheres along helix
    const sphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    for (let i = 0; i < numPoints; i += 5) {
        const sphere = new THREE.Mesh(sphereGeometry, glowMaterial);
        sphere.position.copy(helixPoints[i]);
        group.add(sphere);
    }

    // Add connecting bonds
    const bondMaterial = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xf43f5e,
        emissiveIntensity: 0.15,
        metalness: 0.4,
        roughness: 0.5,
    });

    for (let i = 0; i < numPoints - 25; i += 10) {
        const start = helixPoints[i];
        const end = helixPoints[i + 25];

        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const bondGeometry = new THREE.CylinderGeometry(0.03, 0.03, length, 8);
        const bond = new THREE.Mesh(bondGeometry, bondMaterial);

        bond.position.copy(start.clone().add(end).multiplyScalar(0.5));
        bond.lookAt(end);
        bond.rotateX(Math.PI / 2);

        group.add(bond);
    }

    return group;
}

// ===== Create Particle System =====
function createParticles() {
    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorOptions = [
        new THREE.Color(0x00d4ff),
        new THREE.Color(0x7c3aed),
        new THREE.Color(0xf43f5e),
    ];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
    });

    return new THREE.Points(geometry, material);
}

// ===== Add Objects to Scene =====
const dumbbell = createDumbbell();
dumbbell.position.set(5, 1, -2);
dumbbell.scale.set(0.8, 0.8, 0.8);
scene.add(dumbbell);

const proteinHelix = createProteinHelix();
proteinHelix.position.set(-4, 0, -3);
proteinHelix.scale.set(0.7, 0.7, 0.7);
scene.add(proteinHelix);

const particles = createParticles();
scene.add(particles);

// ===== Camera Position =====
camera.position.z = 10;
camera.position.y = 2;

// ===== Mouse Interaction =====
let mouseX = 0;
let mouseY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;
});

// ===== Animation Loop =====
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Animate dumbbell
    dumbbell.rotation.y = elapsedTime * 0.5;
    dumbbell.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;
    dumbbell.position.y = 1 + Math.sin(elapsedTime * 0.8) * 0.3;

    // Animate protein helix
    proteinHelix.rotation.y = elapsedTime * 0.3;
    proteinHelix.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;

    // Animate particles
    particles.rotation.y = elapsedTime * 0.05;
    particles.rotation.x = elapsedTime * 0.03;

    // Subtle camera movement based on mouse
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 2 + 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    // Animate lights
    pointLight1.position.x = Math.sin(elapsedTime * 0.7) * 10;
    pointLight1.position.z = Math.cos(elapsedTime * 0.7) * 10;

    pointLight2.position.x = Math.sin(elapsedTime * 0.5 + Math.PI) * 10;
    pointLight2.position.z = Math.cos(elapsedTime * 0.5 + Math.PI) * 10;

    renderer.render(scene, camera);
}

// ===== Handle Resize =====
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ===== Start Animation =====
animate();

console.log('🏋️ MuscleForge 3D Scene Loaded');
