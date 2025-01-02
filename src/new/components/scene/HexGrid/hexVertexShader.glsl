varying vec3 localPosition;
varying vec4 worldPosition;

uniform vec3 worldCamProjPosition;
uniform vec3 worldCamTargetPosition;
uniform vec3 worldPlanePosition;
uniform float fadeDistance;
uniform bool infiniteGrid;
uniform bool followCamera;

void main() {
  localPosition = position.xzy;
  if(infiniteGrid)
    localPosition *= 1.0 + fadeDistance;

  worldPosition = modelMatrix * vec4(localPosition, 1.0);
  if(followCamera) {
    worldPosition.xyz += (worldCamProjPosition - worldPlanePosition);
    localPosition = (inverse(modelMatrix) * worldPosition).xyz;
  }

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}