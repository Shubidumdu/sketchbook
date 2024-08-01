import vertex from './vertex.glsl?raw';
import fragment from './fragment.glsl?raw';
import {
  compileShader,
  createProgram,
  resizeCanvasToDisplaySize,
} from '../../utils/webgl';
import './style.scss';

const canvas = document.querySelector('canvas')!;
const gl = canvas.getContext('webgl2');

const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (!gl) {
  throw new Error('No WebGL2 support');
}

resizeCanvasToDisplaySize(canvas, false);

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
const mainColorLocation = gl.getUniformLocation(program, 'u_color1');
const subColorLocation = gl.getUniformLocation(program, 'u_color2');

const draw = (time: number) => {
  resizeCanvasToDisplaySize(canvas, false);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.uniform2fv(resolutionLocation, [canvas.width, canvas.height]);
  gl.uniform3fv(
    mainColorLocation,
    isDarkTheme ? [0.4, 0.8, 0] : [1, 0.9176, 0.8],
  );
  gl.uniform3fv(
    subColorLocation,
    isDarkTheme ? [0.2, 0.2, 1] : [0.6853, 0.9137, 1],
  );
  gl.uniform1f(timeLocation, time);
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(draw);
};

requestAnimationFrame(draw);
