export const workflowParticleVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uStage;
  uniform float uPixelRatio;
  uniform float uInteraction;
  uniform vec2 uPointer;

  attribute vec3 aStream;
  attribute vec3 aNeural;
  attribute vec3 aEmbedding;
  attribute vec3 aCore;
  attribute vec3 aInference;
  attribute vec3 aAgent;
  attribute vec4 aSeed;

  varying float vAlpha;
  varying vec3 vColor;

  float stageWeight(float index) {
    float distanceValue = abs(uStage - index);
    distanceValue = min(distanceValue, 7.0 - distanceValue);
    return exp(-distanceValue * distanceValue * 3.8);
  }

  void main() {
    float w0 = stageWeight(0.0);
    float w1 = stageWeight(1.0);
    float w2 = stageWeight(2.0);
    float w3 = stageWeight(3.0);
    float w4 = stageWeight(4.0);
    float w5 = stageWeight(5.0);
    float w6 = stageWeight(6.0);
    float totalWeight = w0 + w1 + w2 + w3 + w4 + w5 + w6;

    vec3 positionValue = (
      position * w0 +
      aStream * w1 +
      aNeural * w2 +
      aEmbedding * w3 +
      aCore * w4 +
      aInference * w5 +
      aAgent * w6
    ) / totalWeight;

    float breath = sin(uTime * (0.38 + aSeed.x * 0.18) + aSeed.y * 18.0);
    positionValue += normalize(positionValue + vec3(0.001)) * breath * (0.018 + aSeed.z * 0.026);
    positionValue.x += sin(uTime * 0.19 + aSeed.x * 16.0) * w0 * 0.06;
    positionValue.y += sin(uTime * 0.55 + aSeed.y * 20.0) * w1 * 0.075;
    positionValue.z += cos(uTime * 0.31 + aSeed.w * 14.0) * (w2 + w4 + w6) * 0.04;

    vec2 pointerWorld = uPointer * vec2(4.2, 2.8);
    vec2 pointerDelta = pointerWorld - positionValue.xy;
    float curiosity = exp(-dot(pointerDelta, pointerDelta) * 0.72) * uInteraction;
    positionValue.xy += pointerDelta * curiosity * (0.025 + aSeed.w * 0.018);
    positionValue.z += curiosity * 0.08;

    vec4 modelPosition = modelMatrix * vec4(positionValue, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = (1.15 + aSeed.z * 1.7 + curiosity * 0.9) * uPixelRatio * (7.2 / max(1.0, -viewPosition.z));

    vec3 cyan = vec3(0.33, 0.83, 1.0);
    vec3 blue = vec3(0.24, 0.48, 1.0);
    vec3 violet = vec3(0.55, 0.39, 0.9);
    vec3 whiteColor = vec3(0.9, 0.98, 1.0);
    vColor = mix(cyan, blue, aSeed.y);
    vColor = mix(vColor, violet, (w3 + w4 + w6) * (0.22 + aSeed.w * 0.32));
    vColor = mix(vColor, whiteColor, curiosity * 0.55 + w4 * aSeed.z * 0.2);
    vAlpha = 0.16 + aSeed.w * 0.34 + (w2 + w4 + w6) * 0.12;
  }
`;

export const workflowParticleFragmentShader = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float distanceValue = length(centered);
    float body = 1.0 - smoothstep(0.12, 0.48, distanceValue);
    float glow = 1.0 - smoothstep(0.0, 0.5, distanceValue);
    float alpha = (body * 0.82 + glow * 0.3) * vAlpha;
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;
