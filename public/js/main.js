import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000);
let object;
let controls;
const loader = new GLTFLoader();
const splashScreen = document.getElementById("splash-screen");
const meshBoxes = [];



let roomData = [];

fetch('/json/Data.json')
  .then(response => response.json())
  .then(data => {
    roomData = data;
  })
  .catch(error => console.error('Failed to load room data:', error));



async function screenload() {
  await loader.load('/eye/KitBase_new.glb', function (gltf) {
  
      splashScreen.style.display = "none";
    object = gltf.scene;
    scene.add(object);

    object.traverse((child) => {
      if (child.isMesh) {
       
        const meshBox = new THREE.Box3().setFromObject(child);
        const helper = new THREE.Box3Helper(meshBox, 0xff0000); // red box
        meshBoxes.push({ name: child.name, box: meshBox }); 
      }
      
    });
  },
  function (xhr) {
                                        // Optional: track loading progress
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
);
}
setTimeout(screenload, 8000);



const renderer = new THREE.WebGLRenderer({ alpha: true }); //Alpha: true allows for the transparent background
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement); //Add the renderer to the DOM

camera.position.z = 100; //Set how far the camera will be from the 3D model
//Add lights to the scene
const topLight = new THREE.DirectionalLight("white", 2); // (color, intensity)
topLight.position.set(500, 500, 500); //top-left-ish
topLight.castShadow = true;
scene.add(topLight);
const ambientLight = new THREE.AmbientLight(0x333333, 2);
scene.add(ambientLight);

//This adds controls to the camera, so we can rotate / zoom it with the mouse
controls = new OrbitControls(camera, renderer.domElement);

//Save the original camera position
const original_position = camera.position.clone();
//Save the original camera rotation (as a quaternion)
const original_quaternion = camera.quaternion.clone();


let lastMeshInside;
function animate() {
                                        
  requestAnimationFrame(animate);
  let direction = new THREE.Vector3();
  camera.getWorldDirection(direction);
  direction.normalize();

  let insideMesh = null;
  let  r_name;

  for (const { name, box } of meshBoxes) {
    if (box.containsPoint(camera.position)) {
      insideMesh = name;
      break; 
    }
  }

  if (insideMesh !== lastMeshInside) {
    lastMeshInside = insideMesh;
      console.log("here :"+ insideMesh);
      
    switch (insideMesh) {
      case 'Cube469': r_name = 'MBA Department';
        break;
      case 'f1':
      case 'f2':
      case 'fg':
        r_name = 'Boys Hostel';
        break;
      case 'Cube047': r_name = 'CSELAB02';
        break;
      case 'Cube048': r_name = 'CSCR03';
        break;
      case 'Cube049': r_name = 'CSCR04';
        break;
      case 'Cylinder029':  r_name = 'Library';
        break;
      case 'Cube454':  r_name = 'Biotech Department'; 
        break;
      case 'EntranceWhiteSidebarOOTop1001':  r_name = 'Biotech Department';
        break;
      case 'EntranceWhiteSidebarOOTop1':  r_name =   'Biotech Department';
        break;
      case 'Cube462':  r_name = 'Biotech Department';
        break;
      case 'Cube052':  r_name = 'CSE HOD Cabin';
        break;
      case 'Cube053':  r_name = 'CSE HOD Cabin';
        break;
      case 'Cube062':  r_name = 'BSHCR06';
        break;
      case 'Cube061':  r_name = 'BSH DEPT OFFICE';
        break;
      case 'Cube403':  r_name = 'BSHCR04';
        break;
      case 'Cube060':  r_name = 'BSHCR05';
        break;
      case 'Cube404':  r_name = 'Iot Department';
        break;
      case 'KAMAN' : r_name = 'kaman';
        break; 
      case 'wihir' : r_name = 'wihir';
        break;     
      default:
        r_name = insideMesh;
    }
  
    
    const infoBtn = document.getElementById('icon3');
    const tooltip = document.getElementById('tooltip');

if (r_name) {
  const roomDetails = roomData.find(item => item.name === r_name);

  if (roomDetails && infoBtn && tooltip) {
    infoBtn.style.display = 'inline-block';

    
    const tooltipText = `
      <strong>${roomDetails.name}</strong><br><br>
      Type : ${roomDetails.roomType}<br><br>
      Dept : ${roomDetails.department}<br><br>
      Capacity :${roomDetails.features.seatingCapacity}<br/><br/>
      No of PC's :${roomDetails.features.numberOfPCs}<br/><br/>
      <em>${roomDetails.features.description}</em>
    `;

    
    infoBtn.onmouseenter = () => {
      tooltip.innerHTML = tooltipText;
      tooltip.style.display = 'block';
    };
    infoBtn.onmouseleave = () => {
      tooltip.style.display = 'none';
    };

  } else {
    console.log(`No data found in JSON for: ${r_name}`);
    if (infoBtn) infoBtn.style.display = 'none';
    if (tooltip) tooltip.style.display = 'none';
  }

  } else {
    console.log("Outside all target zones");
    if (infoBtn) infoBtn.style.display = 'none';
    if (tooltip) tooltip.style.display = 'none';
  }
  
}
  
  const distance = 1;
  const newTarget = camera.position
    .clone()
    .add(direction.multiplyScalar(distance));
  controls.target.copy(newTarget);

  controls.update();
  renderer.render(scene, camera);
}



/*********controls *********************/
window.addEventListener("resize", function () {
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("keydown", function (event) {
  const moveSpeed = 0.1;
  const rotateSpeed = 0.05;
  

  let moved = false;
  let forward = new THREE.Vector3();
  camera.getWorldDirection(forward);

  forward.normalize();

  let right = new THREE.Vector3();
  right.crossVectors(camera.up, forward).normalize();

  switch (event.key) {
    case "ArrowUp":
      camera.position.addScaledVector(forward, moveSpeed);
      break;
    case "ArrowDown":
      camera.position.addScaledVector(forward, -moveSpeed);
      break;

    case "ArrowLeft":
      camera.rotateY(rotateSpeed);
      break;
    case "ArrowRight":
      camera.rotateY(-rotateSpeed);
      break;
    case "w":
      camera.rotateX(-rotateSpeed);
      break;
    case "s":
      camera.rotateX(rotateSpeed);
      break;

    case "a":
      camera.position.addScaledVector(right, moveSpeed);
      moved = true;
      break;
    case "d":
      camera.position.addScaledVector(right, -moveSpeed);
      moved = true;
      break;
    case "q":
      camera.position.y += moveSpeed;
      moved = true;
      break;
    case "e":
      camera.position.y -= moveSpeed;
      moved = true;
      break;
  }


  // If camera moved, update orbit target
  if (moved) {
    
    let dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.normalize();
    const target = camera.position.clone().add(dir.multiplyScalar(10));
    controls.target.copy(target);
    controls.update();
  }
});
animate();




let isPlaying = false;
const audio = new Audio("/audio/daredevil_theme.mp3");
// loop the audio
audio.loop = true;

window.handleClick = function handleClick() {
  if (!isPlaying) {
    audio
      .play()
      .then(() => {
        isPlaying = true;
        console.log("Music started");
      })
      .catch((err) => {
        console.error("Failed to play:", err);
      });
  } else {
    audio.pause();
    isPlaying = false;
    console.log("Music paused");
  }
};




/***************functions ******/
window.vkit = function vkit() {
  console.log("vkit button clicked");

  window.location.href = "http://localhost:3000/homepage/VKIT";
};

window.profile = function profile() {
  console.log("Profile button clicked");
  window.location.href = "http://localhost:3000/profile";
  
};

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const logo = document.getElementsByClassName("logo_name")[0];
  const toggleIcon = document.getElementById("icon1")?.querySelector("i"); 
  const musicIcon = document.getElementById("icon2")?.querySelector("i");
  const profileIcon = document.getElementById("icon4")?.querySelector("i");
  const i_btn = document.getElementById("icon3")?.querySelector("i");

  // Check if the sidebar is currently open (or considered open)
  if (sidebar.style.left === "0px") {
    // ---- CLOSE SIDEBAR ----
    sidebar.style.left = "-300px"; // Close sidebar (adjust value if CSS width changes)

    if (logo) logo.style.color = "black";
    if (toggleIcon) toggleIcon.style.color = "black"; // Change toggle icon color
    if (musicIcon) musicIcon.style.color = "black";
    if (profileIcon) profileIcon.style.color = "black";
    if (i_btn) i_btn.style.color = "black";

  } else {
    sidebar.style.left = "0px"; // Open sidebar

    if (logo) logo.style.color = "white";
    if (toggleIcon) toggleIcon.style.color = "white"; // Change toggle icon color
    if (musicIcon) musicIcon.style.color = "white";
    if (profileIcon) profileIcon.style.color = "white";
    if (i_btn) i_btn.style.color = "white";
  }
}

window.toggleSidebar = toggleSidebar;



window.Biotech = function () {
  const moveDistance = 47;
  const rotateAngle = Math.PI+Math.PI/2;

  camera.position.copy(original_position.clone());
  camera.quaternion.copy(original_quaternion.clone());

  let forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
  camera.position.addScaledVector(forward, 20);

  let up = new THREE.Vector3(0, 1, 0);
  let left = new THREE.Vector3().crossVectors(up, forward).normalize();
  camera.position.addScaledVector(left, moveDistance);

  camera.lookAt(original_position.clone());
  camera.rotateY(rotateAngle);

  let direction = new THREE.Vector3();
  camera.getWorldDirection(direction).normalize();
  const newTarget = camera.position.clone().add(direction.multiplyScalar(10));
  controls.target.copy(newTarget);
  controls.update();
};

  


window.hostel = function () {
  const forwardDistance = 115;
  const downwardDistance = 12;
  const leftRotationAngle = 75 * (Math.PI / 180);
  const finalForwardPush = 15;

  camera.position.copy(original_position.clone());
  camera.quaternion.copy(original_quaternion.clone());

  let forward = new THREE.Vector3();
  camera.getWorldDirection(forward).normalize();
  camera.position.addScaledVector(forward, forwardDistance);
  camera.position.y -= downwardDistance;

  camera.rotateY(leftRotationAngle);

  let newForward = new THREE.Vector3();
  camera.getWorldDirection(newForward).normalize();
  camera.position.addScaledVector(newForward, finalForwardPush);

  const newTarget = camera.position.clone().add(newForward.multiplyScalar(10));
  controls.target.copy(newTarget);
  controls.update();
};

window.kaman = function () {
  const forwardDistance = 160;
  const rightwardDistance = 69;
  const downwardDistance = 13;
  const rightRotationAngle = -190 * (Math.PI / 180); 

  // Reset camera to original position and rotation
  camera.position.copy(original_position.clone());
  camera.quaternion.copy(original_quaternion.clone());

  // Move forward
  let forward = new THREE.Vector3();
  camera.getWorldDirection(forward).normalize();
  camera.position.addScaledVector(forward, forwardDistance);

  // Move right
  let right = new THREE.Vector3();
  right.crossVectors(forward, camera.up).normalize();
  camera.position.addScaledVector(right, rightwardDistance);

  // Move downward
  camera.position.y -= downwardDistance;

  // Rotate right
  camera.rotateY(rightRotationAngle);

  // Update controls target
  let newForward = new THREE.Vector3();
  camera.getWorldDirection(newForward).normalize();
  const newTarget = camera.position.clone().add(newForward.multiplyScalar(10));
  controls.target.copy(newTarget);
  controls.update();
};


window.cse = function () {
  
  camera.position.copy(original_position.clone());
  camera.quaternion.copy(original_quaternion.clone());

  
  let direction = new THREE.Vector3();
  camera.getWorldDirection(direction).normalize();
  const newTarget = camera.position.clone().add(direction.multiplyScalar(10));
  controls.target.copy(newTarget);
  controls.update();
};


  
  
  

  
  

