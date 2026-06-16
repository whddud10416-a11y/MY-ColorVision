// ═══════════════════════════════════════════
// Liquid Glass — WebGL Background Shader
// Caustics + Liquid Distortion Effect
// ═══════════════════════════════════════════

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  
  varying vec2 vUv;
  
  // Simplex-like noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  // Caustics pattern
  float caustics(vec2 uv, float time) {
    float c = 0.0;
    // Layer 1
    c += snoise(uv * 3.0 + time * 0.15) * 0.5;
    // Layer 2 — rotated
    vec2 uv2 = vec2(uv.x * 0.866 - uv.y * 0.5, uv.x * 0.5 + uv.y * 0.866);
    c += snoise(uv2 * 4.0 - time * 0.12) * 0.35;
    // Layer 3 — fine detail
    c += snoise(uv * 8.0 + time * 0.08) * 0.15;
    
    // Sharpen into caustic pattern
    c = pow(abs(c), 1.5) * 2.0;
    c = smoothstep(0.2, 1.0, c);
    return c;
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 uvAspect = uv * aspect;
    
    // Mouse influence — smooth falloff
    vec2 mouseUV = uMouse * aspect;
    float mouseDist = length(uvAspect - mouseUV);
    float mouseInfluence = smoothstep(0.5, 0.0, mouseDist) * 0.3;
    
    // Liquid distortion near mouse
    float distortX = snoise(uvAspect * 2.0 + uTime * 0.1 + uMouse * 3.0) * mouseInfluence;
    float distortY = snoise(uvAspect * 2.0 + uTime * 0.13 + uMouse * 3.0 + 100.0) * mouseInfluence;
    vec2 distortedUV = uv + vec2(distortX, distortY) * 0.03;
    
    // Caustics
    float c = caustics(distortedUV * aspect, uTime);
    
    // Mouse-reactive caustics brightening
    c *= 1.0 + mouseInfluence * 2.0;
    
    // Color — deep indigo/cyan caustics
    vec3 col1 = vec3(0.25, 0.20, 0.45); // indigo
    vec3 col2 = vec3(0.15, 0.35, 0.45); // cyan
    vec3 col3 = vec3(0.35, 0.20, 0.35); // rose
    
    vec3 color = mix(col1, col2, snoise(uvAspect * 1.5 + uTime * 0.05) * 0.5 + 0.5);
    color = mix(color, col3, snoise(uvAspect * 2.0 - uTime * 0.07 + 50.0) * 0.3 + 0.15);
    
    // Apply caustics
    color += c * vec3(0.06, 0.05, 0.1);
    
    // Vignette
    float vignette = 1.0 - smoothstep(0.4, 1.2, length(uv - 0.5) * 1.5);
    color *= vignette;
    
    // Very subtle overall opacity
    float alpha = 0.12 + c * 0.04 + mouseInfluence * 0.08;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

let scene, camera, renderer, material, animationId;
let mouseTarget = { x: 0.5, y: 0.5 };
let mouseCurrent = { x: 0.5, y: 0.5 };
let startTime;
let isInitialized = false;

function onMouseMove(e) {
  mouseTarget.x = e.clientX / window.innerWidth;
  mouseTarget.y = 1.0 - e.clientY / window.innerHeight;
}

function onResize() {
  if (!renderer) return;
  const canvas = renderer.domElement;
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
}

function animate() {
  animationId = requestAnimationFrame(animate);
  
  // Lerp mouse position
  mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.03;
  mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.03;
  
  material.uniforms.uTime.value = (performance.now() - startTime) * 0.001;
  material.uniforms.uMouse.value.set(mouseCurrent.x, mouseCurrent.y);
  
  renderer.render(scene, camera);
}

export function initLiquidGlass() {
  // Check for Three.js — graceful fallback
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded, skipping WebGL effects');
    return;
  }
  
  if (isInitialized) return;
  
  const canvas = document.getElementById('webgl-bg');
  if (!canvas) return;
  
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'low-power'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      transparent: true,
      depthTest: false
    });
    
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    startTime = performance.now();
    
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    
    isInitialized = true;
    animate();
  } catch (e) {
    console.warn('WebGL init failed:', e);
  }
}

export function destroyLiquidGlass() {
  if (!isInitialized) return;
  
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('resize', onResize);
  
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  
  isInitialized = false;
}
