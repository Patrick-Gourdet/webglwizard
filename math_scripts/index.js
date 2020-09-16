
import * as THREE from '../pages/node_modules/three/build/three.module.js';
import {GLTFLoader} from '../pages/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from '../pages/node_modules/three/examples/jsm/controls/OrbitControls.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 45;
  const aspect = 2.1;  // the canvas default
  const near = 0.01;
  const far = 20;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(-9, -10, 20);
 

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 1);
  controls.update();

  const scene = new THREE.Scene();
  
  scene.background = new THREE.Color('white');
 
  {
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('http://1.bp.blogspot.com/-w04of58DWwM/VhrcWfrWyVI/AAAAAAAAIUI/FKOyG_5vnSk/s1600/Wavy%2Brock%2Bwall%2Btexture.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    scene.add(mesh);
  }

  {
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 1;
    
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    light.castShadow = true;
    scene.add(light);
  }


  {
    const color = 0xFFFFFF;
    const intensity = 0.8;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(1, 1, 0);
    scene.add(light);
    scene.add(light.target);
  }
  function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = (new THREE.Vector3())
        .subVectors(camera.position, boxCenter)
        .multiply(new THREE.Vector3(1, 0, 1))
        .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance +0.25).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;
    
    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('./objects/one.glb', (gltf) => {
      const root = gltf.scene;
root.castShadow =true;
      root.position.y += 0.25;
      scene.add(root);
      scene.castShadow = true;
      
      // compute the box that contains all the stuff
      // from root and below
      const box = new THREE.Box3().setFromObject(root);
      const color = 0xFFFFFF;
      const intensity = 0.8;
      const light = new THREE.DirectionalLight(color, intensity);
    
      light.position.set(0, 0, 1);
      scene.add(light);
      scene.add(light.target);
      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());
      // set the camera to frame the box
      frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

      // update the Trackball controls to handle the new size
      controls.maxDistance = boxSize * 10;
      controls.target.copy(boxCenter);
      controls.update();
    });
  }

var needResize = true;
  function resizeRendererToDisplaySize(renderer) {
    var scale = 500;
    const canvas = renderer.domElement;
    const width = canvas.clientWidth + scale;
    const height = canvas.clientHeight  + scale * ( (canvas.clientHeight + scale)/width);
    canvas.width !== canvas.clientWidth  || canvas.height !== canvas.clientHeight ;
       

    if (needResize) {
      needResize = false;
       renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

// to antialias the shadow
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
