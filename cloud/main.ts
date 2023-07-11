// import '@webgpu/types';
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
      clearValue: { r: 0, g: 0.2, b: 0.4, a: 1 }, // New line
      storeOp: 'store',
    },
  ],
});

pass.end();

device.queue.submit([encoder.finish()]);
