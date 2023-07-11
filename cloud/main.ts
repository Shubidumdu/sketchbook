import shader from './shader.wgsl?raw';
import './style.scss';
import { resizeCanvasToDisplaySize } from '../utils/webgl';

const canvas = document.querySelector('canvas')!;

resizeCanvasToDisplaySize(canvas);

if (!navigator.gpu) {
  throw new Error('WebGPU not supported on this browser.');
}

const adapter = await navigator.gpu.requestAdapter();

if (!adapter) {
  throw new Error('No appropriate GPUAdapter found.');
}

const device = await adapter.requestDevice();

if (!device) {
  throw new Error('need a browser that supports WebGPU');
}

const context = canvas.getContext('webgpu')!;

if (!context) {
  throw new Error('need a browser that supports WebGPU');
}

const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
  device: device,
  format: canvasFormat,
});

const encoder = device.createCommandEncoder();

const pass = encoder.beginRenderPass({
  colorAttachments: [
    {
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
    },
  ],
});

const vertices = new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]);

const vertexBuffer = device.createBuffer({
  label: 'vertices',
  size: vertices.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  mappedAtCreation: false,
});

device.queue.writeBuffer(vertexBuffer, 0, vertices);

const vertexBufferLayout = {
  arrayStride: 8,
  attributes: [
    {
      format: 'float32x2' as const,
      offset: 0,
      shaderLocation: 0, // Position, see vertex shader
    },
  ],
};

const cloudShaderModule = device.createShaderModule({
  label: 'Cloud shader',
  code: shader,
});

const cloudPipeline = device.createRenderPipeline({
  label: 'Cloud pipeline',
  layout: 'auto',
  vertex: {
    module: cloudShaderModule,
    entryPoint: 'vertexMain',
    buffers: [vertexBufferLayout],
  },
  fragment: {
    module: cloudShaderModule,
    entryPoint: 'fragmentMain',
    targets: [
      {
        format: canvasFormat,
      },
    ],
  },
});

pass.setPipeline(cloudPipeline);
pass.setVertexBuffer(0, vertexBuffer);
pass.draw(vertices.length / 2);

pass.end();

device.queue.submit([encoder.finish()]);
