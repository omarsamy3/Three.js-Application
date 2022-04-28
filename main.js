function init() {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        100,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    
    camera.position.x = 1;
    camera.position.y = 10;
    camera.position.z = 10;

    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //#region Create Objects
            //###############################################//
            //-----------------Create Objects-----------------//
            //###############################################//
        let Light = getSpotLight(1, 'rgb(255, 255, 255)');//Change between(Point - Spot - Directional)
        Light.position.set(-7.5, 10, 10);
        let sphereLight = getSphere(0.1, 32, getMaterial('basic', 'rgb(250, 250, 0)'));
        let sphereMaterial = getMaterial('standard', 'rgb(100, 0, 150)');
        let sphere = getSphere(2, 32, sphereMaterial);
        let planeMaterial = getMaterial('standard', 'rgb(128, 128, 128)');
        let plane = getPlane(20, planeMaterial);
        let boxGrid = getBoxGrid(10, 2);
//#endregion

    //#region Add to Scene
            //###############################################//
            //-----------------Add to Scene-----------------//
            //###############################################//
    scene.add(camera);
    //scene.add(box);
    sphereLight.add(Light);
    scene.add(sphereLight);
    scene.add(plane);
    //scene.add(boxGrid);
    scene.add(sphere);
//#endregion

    //#region GUI
                //###############################################//
            //-----------------GUI-----------------------------//
            //###############################################//
            const gui = new dat.GUI();
            lightFolder = gui.addFolder('Light Controls');

            gui.add(Light.position, 'x', -10, 10);
            gui.add(Light.position, 'y', -10, 10);
            gui.add(Light.position, 'z', -10, 10);
            gui.add(Light, 'intensity', 0.1, 2);

            const cameraPosition = gui.addFolder('Camera Position');

            cameraPosition.add(camera.position, 'x', -10, 10);
            cameraPosition.add(camera.position, 'y', -10, 10);
            cameraPosition.add(camera.position, 'z', -10, 10);
    //#endregion

 //#region Create Objects
            //###############################################//
            //-----------------Cube Map-----------------//
            //###############################################//
            var path = './assets/cubemab/';
            var format = '.jpg';
            var urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ];
            var reflectionCube = new THREE.CubeTextureLoader().load( urls );
            reflectionCube.format = THREE.RGBFormat;

            scene.background = reflectionCube;

            var loader = new THREE.TextureLoader();
            planeMaterial.map = loader.load('./assets/textures/concrete.jpg');
            planeMaterial.bumpMap = loader.load('./assets/textures/checkerboard.jpg');
            planeMaterial.roughnessMap = loader.load('./assets/textures/scratch.jpg');
            planeMaterial.bumpScale = 0.01;
            planeMaterial.metalness = 0.1;
            planeMaterial.roughness = 0.7;
            planeMaterial.envMap = reflectionCube;
            sphereMaterial.roughnessMap = loader.load('./assets/textures/fingerprints.jpg');
            sphereMaterial.envMap = reflectionCube;

            var maps = [
            'map',
            'bumpMap',
            'roughnessMap'
            ];
            maps.forEach(function(mapName) {
                var texture = planeMaterial[mapName];
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(1, 1);
            });
    //#endregion

    //#region Renderer
    //Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(color = 'rgb(40, 159, 167)');
    renderer.shadowMap.enabled = true;

    //Use OrbitControls library.
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    //Append the scene to the div element.
    document.getElementById("container").appendChild(renderer.domElement);
    
//Update for each frame.
 update(renderer, scene, camera, controls);

    function update(renderer, scene, camera, controls) {
        renderer.render(scene, camera);
        controls.update();

        requestAnimationFrame(function() {
            update(renderer, scene, camera, controls);
        });
    }
    //#endregion
}

init();

            //###############################################//
            //-----------------Custom functions-----------------//
            //###############################################//

//Geometry functions
function getBox(w, h, d, material = getMaterial()) {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = h / 2;
    mesh.castShadow = true; // Shadows
    return mesh;
}
//Create sphere
function getSphere(radius = 1, Segments = 32, material = getMaterial()) {
    const geometry = new THREE.SphereGeometry(radius, Segments, Segments);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, radius, 0);
    mesh.castShadow = true;
    return mesh;
}

//Material functions
function getMaterial(type = 'basic', color = 'rgb(128, 0, 0)') {
    
    let materialOptions = {
        color: color,
        side: THREE.DoubleSide,
    };

    switch(type) {
        case 'basic':
            return new THREE.MeshBasicMaterial(materialOptions);
            break;
        case 'lambert':
            return new THREE.MeshLambertMaterial(materialOptions);
            break;
        case 'phong':
            return new THREE.MeshPhongMaterial(materialOptions);
            break;
        case 'standard':
            return new THREE.MeshStandardMaterial(materialOptions);
            break;
        default:
            return new THREE.MeshBasicMaterial(materialOptions);
            break;
    }
}

//Create a plane
function getPlane(length, material = getMaterial()) {
    const geometry = new THREE.PlaneGeometry(length, length);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true; // Shadows
    return mesh;
}

//Box Grid
function getBoxGrid(count, spacing) {
    const group = new THREE.Group();
    for(let i = 0; i < count; i++) { 
        for(let j = 0; j < count; j++) {
            let box  = getBox(1, 1, 1, getMaterial('standard', 'rgb(200, 128, 128)'));
            box.position.x = i * spacing;
            box.position.z = j * spacing;
            group.add(box);
        }
    }
        group.position.x = -(count - 1) * (spacing / 2);
        group.position.z = -(count - 1) * (spacing / 2);
return group;
}

//#region Light Functions
//Point Light
function getPointLight(intensity, color = 'rgb(255, 255, 255)') {
    let light = new THREE.PointLight(color, intensity);
    light.castShadow = true;
    return light;
}

//Spot Light
function getSpotLight(intensity, color = 'rgb(255, 255, 255)') {
    let light = new THREE.SpotLight(color, intensity);
    light.castShadow = true;
    // light.shadow.mapSize.width = 2048;
    return light;
}

//Directional Light
function getDirectionalLight(intensity, color = 'rgb(255, 255, 255)') {
    let light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    return light;
}
//#endregion

