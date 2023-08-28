import computeShader from './compute.wgsl?raw';
import renderShader from './render.wgsl?raw';
import './style.scss';
import { resizeCanvasToDisplaySize } from '../../utils/webgl';

type MousePosition = {
  x: number;
  y: number;
};

let mousePosition: MousePosition | null = null;

const main = async () => {
  try {
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

    // ComputePipeline
    const module = device.createShaderModule({
      label: 'compute shader',
      code: computeShader,
    });

    const ComputePipeline = device.createComputePipeline({
      label: 'compute pipeline',
      layout: 'auto',
      compute: {
        module,
        entryPoint: 'computeMain',
      },
    });

    const POINT_COUNT = 100;
    const POINT_SIZE = 16;

    const input = new Float32Array(
      [...new Array(POINT_COUNT)]
        .map(() => {
          const dpr = window.devicePixelRatio;
          const TEXEL_SIZE = [
            (POINT_SIZE * dpr) / canvas.width,
            (POINT_SIZE * dpr) / canvas.height,
          ];
          const position = [Math.random() * 2 - 1, Math.random() * 2 - 1];

          return [
            position[0] - TEXEL_SIZE[0] / 2,
            position[1] + TEXEL_SIZE[1] / 2,
            position[0] - TEXEL_SIZE[0] / 2,
            position[1] - TEXEL_SIZE[1] / 2,
            position[0] + TEXEL_SIZE[0] / 2,
            position[1] + TEXEL_SIZE[1] / 2,
            position[0] + TEXEL_SIZE[0] / 2,
            position[1] - TEXEL_SIZE[1] / 2,
          ];
        })
        .flat(),
    );

    const indexData = new Uint32Array(
      [...new Array(POINT_COUNT)]
        .map((_, index) => {
          const offset = index * 4;
          return [0, 1, 2, 2, 1, 3].map((i) => i + offset);
        })
        .flat(),
    );

    const indexBuffer = device.createBuffer({
      label: 'index buffer',
      size: indexData.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false
    });

    device.queue.writeBuffer(indexBuffer, 0, indexData);

    const workBuffer = device.createBuffer({
      label: 'work buffer',
      size: input.byteLength,
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
      mappedAtCreation: false,
    });

    device.queue.writeBuffer(workBuffer, 0, input);

    const bindGroup = device.createBindGroup({
      label: 'bindGroup for work buffer',
      layout: ComputePipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: workBuffer } }],
    });

    // RenderPipeline
    const context = canvas.getContext('webgpu')!;
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device,
      format: canvasFormat,
    });

    const renderPassDescriptor = {
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: 'clear' as const,
          storeOp: 'store' as const,
        },
      ],
    };

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

    const shaderModule = device.createShaderModule({
      code: renderShader,
    });

    const renderPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vertexMain',
        buffers: [vertexBufferLayout],
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fragmentMain',
        targets: [
          {
            format: canvasFormat,
          },
        ],
      },
    });

    const render = async (time: number) => {
      // Compute Shader
      const computeEncoder = device.createCommandEncoder({
        label: 'doubling encoder',
      });
      const computePass = computeEncoder.beginComputePass({
        label: 'doubling compute pass',
      });
      computePass.setPipeline(ComputePipeline);
      computePass.setBindGroup(0, bindGroup);
      computePass.dispatchWorkgroups(1);
      computePass.end();

      // Finish encoding and submit the commands
      const commandBuffer = computeEncoder.finish();
      device.queue.submit([commandBuffer]);

      // Render Shader
      renderPassDescriptor.colorAttachments[0].view = context
        .getCurrentTexture()
        .createView();
      const renderEncoder = device.createCommandEncoder();
      const renderPass = renderEncoder.beginRenderPass(renderPassDescriptor);
      renderPass.setPipeline(renderPipeline);
      renderPass.setVertexBuffer(0, workBuffer);
      renderPass.setIndexBuffer(indexBuffer, 'uint32');
      renderPass.drawIndexed(input.length / 2);
      renderPass.end();
      device.queue.submit([renderEncoder.finish()]);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  } catch (err) {
    if (err instanceof Error) {
      document.body.innerHTML = err.message;
    }
  }
};

main();
