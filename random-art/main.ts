import vertex from './vertex.glsl?raw';
import fragment from './fragment.glsl?raw';
import {
  compileShader,
  createProgram,
  resizeCanvasToDisplaySize,
} from '../utils/webgl';
import './style.scss';
import { matrix3 } from '../utils/math';

const canvas = document.querySelector('canvas')!;
const gl = canvas.getContext('webgl2');

if (!gl) {
  throw new Error('No WebGL2 support');
}

resizeCanvasToDisplaySize(canvas);

const vertexShader = compileShader(gl, vertex, gl.VERTEX_SHADER);
const fragmentShader = compileShader(gl, fragment, gl.FRAGMENT_SHADER);
const program = createProgram(gl, vertexShader, fragmentShader);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.useProgram(program);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
const timeLocation = gl.getUniformLocation(program, 'u_time');

const draw = (time: number) => {
  resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -canvas.width,
      -canvas.height,
      canvas.width,
      -canvas.height,
      -canvas.width,
      canvas.height,
      -canvas.width,
      canvas.height,
      canvas.width,
      -canvas.height,
      canvas.width,
      canvas.height,
    ]),
    gl.STATIC_DRAW,
  );
  gl.uniform2fv(resolutionLocation, [canvas.width, canvas.height]);
  gl.uniform1f(timeLocation, time / 1000);
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(draw);
};

requestAnimationFrame(draw);
