import computeShader from './compute.wgsl?raw';
import renderShader from './render.wgsl?raw';
import './style.scss';
import { resizeCanvasToDisplaySize } from '../../utils/webgl';

type MousePosition = {
  x: number;
  y: number;
};

let mousePosition: MousePosition | null = null;

const POINT_SIZE = 32;

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

    const POINT_COUNT = 3;

    const input = new Float32Array(
      [...new Array(POINT_COUNT)]
        .map(() => {
          const position = [Math.random() * 2 - 1, Math.random() * 2 - 1];
          return position;
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

    // Uniforms
    const UNIFORM_BUFFER_SIZE = 2 * 4 + 2 * 4 + 1 * 4 + 1 * 4;

    const uniformBuffer = device.createBuffer({
      label: 'uniform buffer',
      size: UNIFORM_BUFFER_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false,
    });

    const uniformValues = new Float32Array(UNIFORM_BUFFER_SIZE / 4);

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

    const vertexBufferLayout: GPUVertexBufferLayout = {
      arrayStride: 8,
      stepMode: 'instance',
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

    const uniformBindGroup = device.createBindGroup({
      layout: renderPipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
    });

    const render = (time: number) => {
      resizeCanvasToDisplaySize(canvas);
      
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
      uniformValues.set([time], 0); // time
      uniformValues.set([POINT_SIZE], 1); // pointSize
      uniformValues.set([canvas.width, canvas.height], 2); // resolution
      uniformValues.set([mousePosition?.x || 0, mousePosition?.y || 0], 4); // mousePosition
      device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
      renderPass.setBindGroup(0, uniformBindGroup);
      renderPass.setVertexBuffer(0, workBuffer);
      renderPass.setIndexBuffer(indexBuffer, 'uint32');
      renderPass.drawIndexed(6, input.length / 2);
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
