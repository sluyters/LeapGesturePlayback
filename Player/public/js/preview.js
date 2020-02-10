(function () {

  var controller, initScene;

  window.scene = null;
  window.renderer = null;
  window.camera = null;

  initScene = function (element) {
    var axis, pointLight;
    window.scene = new THREE.Scene();
    window.renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(element.clientWidth, element.clientHeight);
    element.appendChild(renderer.domElement);

    // Axis in the center of the screen
    axis = new THREE.AxisHelper(40);
    scene.add(axis);

    // Ambiant light
    scene.add(new THREE.AmbientLight(0x888888));

    // Light from one direction
    pointLight = new THREE.PointLight(0xFFFFFF);
    pointLight.position = new THREE.Vector3(-20, 10, 0);
    pointLight.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(pointLight);

    window.camera = new THREE.PerspectiveCamera(65, element.clientWidth / element.clientHeight, 1, 1000);
    camera.position.fromArray([0, 180, 500]);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    window.controls = new THREE.TrackballControls(camera, element);
    scene.add(camera);

    // Handle resizing of the window
    window.addEventListener('resize', function () {
      camera.aspect = element.clientWidth / element.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(element.clientWidth, element.clientHeight);
      controls.handleResize();
      return renderer.render(scene, camera);
    }, false);
    return renderer.render(scene, camera);
  };

  // via Detector.js:
  var webglAvailable = (function () { try { var canvas = document.createElement('canvas'); return !!window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')); } catch (e) { return false; } })();

  if (webglAvailable) {
    initScene(document.getElementById("playback-container"));
  }

  window.controller = controller = new Leap.Controller;

  controller.use('handHold').use('transform').use('handEntry').use('screenPosition').use('riggedHand', {
    parent: scene,
    renderer: renderer,
    helper: true,
    renderFn: function () {
      renderer.render(scene, camera);
      return controls.update();
    },
    camera: camera,
    checkWebGL: true
  }).connect();

}).call(this);
