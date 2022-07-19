gsap.to(".stage", { opacity: 1, ease: "power2.inOut", duration: 3 });

const starCount = 10000;
const spinDuration = 75;

// scene setup
const scene = new THREE.Scene(),
  textureLoader = new THREE.TextureLoader(),
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 50),
  renderer = new THREE.WebGLRenderer({ canvas: c, alpha: true });
camera.position.z = 2;


// glow plane
// const glowGeometry = new THREE.PlaneGeometry(1, 1),
//   glowTexture = textureLoader.load(
//     "https://assets.codepen.io/721952/globeGlow.png",
//     (t) => {
//       t.image.crossOrigin = "anonomous";
//       t.minFilter = THREE.LinearFilter;
//     }
//   ),
//   glowMaterial = new THREE.MeshBasicMaterial({ map: glowTexture, transparent:true }),
//   glow = new THREE.Mesh(glowGeometry, glowMaterial)
// glow.position.z = 0.67

// globe
const globeGeometry = new THREE.SphereGeometry(0.6, 32, 32),
  globeTexture = textureLoader.load(
    "https://assets.codepen.io/721952/globeBlue.jpg",
    (t) => {
      t.image.crossOrigin = "anonomous";
      t.minFilter = THREE.LinearFilter;
    }
  ),
  globeMaterial = new THREE.MeshBasicMaterial({ map: globeTexture }),
  globe = new THREE.Mesh(globeGeometry, globeMaterial)
  

// clouds
const cloud1Geometry = new THREE.SphereGeometry(0.607, 32, 32),
  cloud1Texture = textureLoader.load(
    "https://assets.codepen.io/721952/satClouds.png",
    (t) => {
      t.image.crossOrigin = "anonomous";
      t.minFilter = THREE.LinearFilter;
    }
  ),
  cloud1Material = new THREE.MeshBasicMaterial({
    map: cloud1Texture,
    transparent: true
  }),
  cloud1 = new THREE.Mesh(cloud1Geometry, cloud1Material),
  cloud2Geometry = new THREE.SphereGeometry(0.612, 32, 32),
  cloud2Texture = textureLoader.load(
    "https://assets.codepen.io/721952/cloud.png",
    (t) => {
      t.image.crossOrigin = "anonomous";
      t.minFilter = THREE.LinearFilter;
    }
  ),
  cloud2Material = new THREE.MeshBasicMaterial({
    map: cloud2Texture,
    transparent: true
  }),
  cloud2 = new THREE.Mesh(cloud2Geometry, cloud2Material);
cloud1Texture.repeat.set(4, 4);
cloud1Texture.wrapS = cloud1Texture.wrapT = THREE.RepeatWrapping;
cloud1Material.opacity = 0.7;

cloud2Texture.repeat.set(4, 3);
cloud2Texture.wrapS = cloud2Texture.wrapT = THREE.RepeatWrapping;  


// stars
const starTexture = textureLoader.load(  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAAAAACN7WTCAAABFUlEQVR4AdXWR7kFIQwFYHZnHQExEQ+IiAAsoCE+IgMJo2IszPo1vtv7HfJ69v93Qif9qQL+DSQKQuafhiI/DXOOOURhUg0mlhJMrDWUl5JZQhQGJAB3AMOMwO4MAgbjmKQ1IQYwlMciOk0qwgQMOS02z1Z0RHaX1bwtS3PT3OXaQJbupvl1macuhYG1fW7c8rqVq7rFRkrZul5dFtm4p6mbRtvO9cy2afbOohGzSM5aqpl728dtZG+3uZvVojmLMBOAFfD1Pry4gOlWq5TS81HempwVq3FvOTCyAV5HNkB8y8U3efxYbWToIMevjvhlFb4eN2UWvMlrjQWm6KMD1RSrHIb5hz8PYPk3PyuiKPzTH90fqA/xJsnHZ8DX6wAAAABJRU5ErkJggg=="
);

const starGeometry = new THREE.BufferGeometry();

const positions = new Float32Array(starCount * 3);
const colors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  const i3 = i * 3;
  const angle = Math.random() * Math.PI * 2;
  const radius = 2.5 + Math.random() * 4;

  positions[i3] = Math.sin(angle) * radius; // x
  positions[i3 + 1] = (Math.random() - 0.5) * 12; // y
  positions[i3 + 2] = Math.cos(angle) * radius; // z

  colors[i3] = 1;
  colors[i3 + 1] = 1; //Math.random()
  colors[i3 + 2] = 1; //Math.random()
}

starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
starGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const starMaterial = new THREE.PointsMaterial({
  size: 0.07,
  sizeAttenuation: true,
  color: new THREE.Color("#cdf"),
  transparent: true,
  alphaMap: starTexture,
  depthWrite: false
});

const stars = new THREE.Points(starGeometry, starMaterial);


scene.add(globe, cloud1, cloud2, stars, camera);



// earth spin animation
const tl = gsap
  .timeline({
    defaults: { repeat: -1, ease: "none" },
    onUpdate: () => renderer.render(scene, camera)
  })
  .to(globe.rotation, { duration: spinDuration, y: 2 * Math.PI }, 0)
  .to(cloud1.rotation, { duration: spinDuration / 1.3, y: 2 * Math.PI }, 0)
  .to(cloud2.rotation, { duration: spinDuration / 1.9, y: 2 * Math.PI }, 0);



function onResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

window.addEventListener("resize", onResize);
onResize();

// horizontal dragging
let xPos = 0;

window.onmousedown = window.ontouchstart = dragStart;
window.onmouseup = window.ontouchend = dragEnd;

function dragStart(e) {
  if (e.touches) e.clientX = e.touches[0].clientX;
  xPos = Math.round(e.clientX);
  gsap.set(".stage", { cursor: "grabbing" });
  window.onmousemove = window.ontouchmove = drag;
}

function drag(e) {
  if (e.touches) e.clientX = e.touches[0].clientX;

  let x = camera.position.x,
    z = camera.position.z,
    delta = (Math.round(e.clientX) - xPos) * 0.003;

  camera.position.x = x * Math.cos(delta) - z * Math.sin(delta);
  camera.position.z = z * Math.cos(delta) + x * Math.sin(delta);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  
  
  // glow.lookAt(camera.position);  

  xPos = Math.round(e.clientX);
}

function dragEnd(e) {
  window.onmousemove = window.ontouchmove = null;
  gsap.set(".stage", { cursor: "grab" });
}