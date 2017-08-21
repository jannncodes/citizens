var container, scene, camera, renderer, raycaster, objects = [];
var keyState = {};

var otherPlayers = [],
    otherPlayersId = [];

var player, playerId, moveSpeed, turnSpeed;

var playerData;

var loader, objectLoader;

const material = new THREE.MeshPhongMaterial( {
  color: 0xffffff,
  emissive: 0x5f6368,
  shininess: 0.1
});

const createNewProp = function (fileName, x, y, zRotation) {
  let filePath = 'assets/' + fileName + '.js';

  loader.load( filePath, function (geometry) {
    let newProp = new THREE.Mesh(geometry, material);
    newProp.position.x = x;
    newProp.position.y = y;
    newProp.rotation.z = zRotation;
    newProp.castShadow = true;
    objects.push(newProp);
    scene.add(newProp);
  });
};

var checkKeyStates = function () {
    // up - move forward
    if (keyState[38]) {
      player.position.y -= moveSpeed * Math.sin(player.rotation.z);
      player.position.x -= moveSpeed * Math.cos(player.rotation.z);
      updatePlayerData();
      socket.emit('updatePosition', playerData);
    }

    // down - mmove backward
    if (keyState[40]) {
      player.position.y += moveSpeed * Math.sin(player.rotation.z);
      player.position.x += moveSpeed * Math.cos(player.rotation.z);
      updatePlayerData();
      socket.emit('updatePosition', playerData);
    }

    // left - rotate left
    if (keyState[37]) {
      player.rotation.z += turnSpeed;
      updatePlayerData();
      socket.emit('updatePosition', playerData);
    }

    // right - rotate right
    if (keyState[39]) {
      player.rotation.z -= turnSpeed;
      updatePlayerData();
      socket.emit('updatePosition', playerData);
    }
};

const loadWorld = function(){

  init();
  animate();

  function init(){

    //Setup------------------------------------------
    container = document.getElementById('container');
    scene = new THREE.Scene();

    //Camera
    camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(20,20,20);
    camera.up = new THREE.Vector3(0,0,1);
    camera.lookAt(new THREE.Vector3(0,0,0));

    //Light
    const light = new THREE.DirectionalLight(0xffffff, 0.55);
    light.position.set(10, 0, 15);
    light.castShadow = true;
    scene.add(light);
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.left = -15;
    light.shadow.camera.bottom = -15;
    light.shadow.camera.right = 15;
    light.shadow.camera.top = 15;

    //Renderer
    renderer = new THREE.WebGLRenderer( { alpha: true} );
    renderer.setSize( window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //Raycaster
    raycaster = new THREE.Raycaster();

    //Instantiate Loader for files
    loader = new THREE.JSONLoader();
    objectLoader = new THREE.ObjectLoader();

    //Plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20, 1);
    const plane = new THREE.Mesh( planeGeometry, material );
    plane.receiveShadow = true;

    //Add to Scene
    scene.add( plane );

    //Props
    createNewProp('mountain1', -7, 7, -2);
    createNewProp('mountain2', 7, -7, 0);
    createNewProp('mountain3', -4, -6, 6);
    createNewProp('mountain4', 0, 1, 0);
    createNewProp('mountain5', -4, 2, 0);
    createNewProp('mountain6', 8, -2, 2);
    createNewProp('bush1', -6, 5, 0);
    createNewProp('bush2', 2, -8, 0);
    createNewProp('bush3', 5, -1, 0);
    createNewProp('bush4', -3, 4, 0);

    //Event Listeners
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false );

    //Key Presses
    function onKeyDown(event) {
      keyState[event.keyCode || event.which] = true;
    }
    function onKeyUp(event) {
      keyState[event.keyCode || event.which] = false;
    }

    //Add to DOM
    container.appendChild( renderer.domElement );
    document.body.appendChild( container );
  }

  //Animate Scene
  function animate(){
    requestAnimationFrame( animate );
    render();
  }

  //Render Scene
  function render(){
    if ( player ) checkKeyStates();
    renderer.clear();
    renderer.render( scene, camera );
  }

  //Collision Detection NOT WORKING
  // function calculateIntersects(){
  //   var originVector = new THREE.Vector3(player.pastx, player.pasty, 1);
  //   raycaster.ray.set(originVector, player.position.normalize());
  //   var intersects = raycaster.intersectObjects( objects );
  //   return intersects;
  // }
};

const createPlayer = function(data) {
  playerData = data;

  loader.load( 'assets/bug1.js', function (geometry) {
    player = new THREE.Mesh(geometry, material);

    player.position.x = data.x;
    player.position.y = data.y;

    playerId = data.playerID;
    moveSpeed = data.speed;
    turnSpeed = data.turnSpeed;
    player.castShadow = true;
    objects.push(player);
    scene.add(player);
  });
  // objectLoader.load( 'assets/bug1.1.json', function (obj) {
  //   scene.add(obj);
  // });
};

const updatePlayerPosition = function(data){
  var somePlayer = playerForId(data.playerId);
  somePlayer.position.x = data.x;
  somePlayer.position.y = data.y;
  somePlayer.rotation.z = data.r_z;
};

const updatePlayerData = function(){
  playerData.x = player.position.x;
  playerData.y = player.position.y;
  playerData.r_z = player.rotation.z;

};

const addOtherPlayer = function(data){

  loader.load( 'assets/bug1.js', function (geometry) {
    let newPlayer = new THREE.Mesh(geometry, material);

    newPlayer.position.x = data.x;
    newPlayer.position.y = data.y;

    otherPlayersId.push( data.playerId );
    otherPlayers.push( newPlayer );
    newPlayer.castShadow = true;
    objects.push( newPlayer );
    scene.add( newPlayer);
  });
};

const removeOtherPlayer = function(data){
  scene.remove( playerForId(data.playerId) );
};

const playerForId = function(id){
  let index;
  for (let i = 0; i < otherPlayersId.length; i++){
    if (otherPlayersId[i] == id){
      index = i;
      break;
    }
  }
  return otherPlayers[index];
};
