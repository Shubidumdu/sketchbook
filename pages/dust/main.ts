import computeShader from './compute.wgsl?raw';
import renderShader from './render.wgsl?raw';
import './style.scss';
import { resizeCanvasToDisplaySize } from '../../utils/webgl';

type MousePosition = {
  x: number;
  y: number;
};

let mousePosition: MousePosition | null = null;

const USE_COMPUTE_SHADER = true;
const POINT_COUNT = 200000;

const POINT_SIZE = 2 * window.devicePixelRatio;

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

    const pointPositions = new Float32Array(
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
      mappedAtCreation: false,
    });

    device.queue.writeBuffer(indexBuffer, 0, indexData);

    const vertexBuffer = device.createBuffer({
      label: 'Vertex buffer',
      size: pointPositions.byteLength,
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
      mappedAtCreation: false,
    });

    device.queue.writeBuffer(vertexBuffer, 0, pointPositions);

    const particleData = new Float32Array(
      [...new Array(POINT_COUNT)]
        .map(() => {
          const angle = (Math.random() * 2 - 1) * Math.PI; // 0 ~ 2PI
          const speed = Math.random() * 0.01; // 0 ~ 0.01
          return [angle, speed];
        })
        .flat(),
    );

    const particleBuffer = device.createBuffer({
      label: 'Agent buffer',
      size: particleData.byteLength,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
      mappedAtCreation: false,
    });

    device.queue.writeBuffer(particleBuffer, 0, particleData);

    const COMPUTE_UNIFORM_BUFFER_SIZE =
      4 * 2 + // deltaTime
      4 * 2 + // mousePosition
      4 * 2; // resolution

    const computeUniformBuffer = device.createBuffer({
      label: 'compute uniform buffer',
      size: COMPUTE_UNIFORM_BUFFER_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: false,
    });

    const bindGroup = device.createBindGroup({
      label: 'bindGroup for computing vertex buffer',
      layout: ComputePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: vertexBuffer } },
        { binding: 1, resource: { buffer: particleBuffer } },
        { binding: 2, resource: { buffer: computeUniformBuffer } },
      ],
    });

    const computeUniformValues = new Float32Array(
      COMPUTE_UNIFORM_BUFFER_SIZE / 4,
    );

    // Uniforms
    const UNIFORM_BUFFER_SIZE =
      2 * 4 + // pointSize
      2 * 4; // resolution

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
          clearValue: { r: 0.2, g: 0.3, b: 0.4, a: 1 },
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

    let time = 0;

    const render = (newTime: number) => {
      const deltaTime = newTime - time;
      time = newTime;
      resizeCanvasToDisplaySize(canvas);

      if (USE_COMPUTE_SHADER) {
        // Compute Shader
        const computeEncoder = device.createCommandEncoder({
          label: 'doubling encoder',
        });
        const computePass = computeEncoder.beginComputePass({
          label: 'doubling compute pass',
        });
        computeUniformValues.set([deltaTime], 0); // deltaTime
        computeUniformValues.set(
          [
            mousePosition?.x || canvas.width / 2,
            canvas.height - (mousePosition?.y || canvas.height / 2),
          ],
          2,
        ); // mousePosition
        computeUniformValues.set([canvas.width, canvas.height], 4); // resolution
        device.queue.writeBuffer(computeUniformBuffer, 0, computeUniformValues);
        computePass.setPipeline(ComputePipeline);
        computePass.setBindGroup(0, bindGroup);
        computePass.dispatchWorkgroups(Math.ceil(POINT_COUNT / 64));
        computePass.end();

        // Finish encoding and submit the commands
        const commandBuffer = computeEncoder.finish();
        device.queue.submit([commandBuffer]);
      } else {
        // Use CPU version
        const resolution = [canvas.width, canvas.height];
        const _mousePosition = [
          mousePosition?.x || canvas.width / 2,
          canvas.height - (mousePosition?.y || canvas.height / 2),
        ].map((v, i) => (v * 2 - resolution[i]) / resolution[i]);
        pointPositions.forEach((_, index) => {
          if (index % 2 === 0) {
            const position = [
              pointPositions[index] - _mousePosition[0],
              pointPositions[index + 1] - _mousePosition[1],
            ];
            const angle = particleData[index * 2];
            const speed = particleData[index * 2 + 1];
            const transform = () => {
              const ratio = resolution[0] / resolution[1];
              const size = 0.125;
              const x =
                ratio * Math.cos(angle) * (position[0] + size) -
                Math.sin(angle) * (position[1] + size) -
                size;
              const y =
                ratio * Math.sin(angle) * (position[0] - size) +
                Math.cos(angle) * (position[1] - size) +
                size;
              return [x, y];
            };
            const transformed = transform();
            pointPositions[index] += transformed[0] * speed * deltaTime;
            pointPositions[index + 1] += transformed[1] * speed * deltaTime;
          }
        });
        device.queue.writeBuffer(vertexBuffer, 0, pointPositions);
      }

      // Render Shader
      renderPassDescriptor.colorAttachments[0].view = context
        .getCurrentTexture()
        .createView();
      const renderEncoder = device.createCommandEncoder();
      const renderPass = renderEncoder.beginRenderPass(renderPassDescriptor);
      renderPass.setPipeline(renderPipeline);
      uniformValues.set([POINT_SIZE], 0); // pointSize
      uniformValues.set([canvas.width, canvas.height], 2); // resolution
      device.queue.writeBuffer(uniformBuffer, 0, uniformValues);
      renderPass.setBindGroup(0, uniformBindGroup);
      renderPass.setVertexBuffer(0, vertexBuffer);
      renderPass.setIndexBuffer(indexBuffer, 'uint32');
      renderPass.drawIndexed(6, pointPositions.length / 2);
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

window.addEventListener('pointermove', (e) => {
  const dpr = window.devicePixelRatio;
  const clientX = e.clientX * dpr;
  const clientY = e.clientY * dpr;
  if (!mousePosition) {
    mousePosition = { x: clientX, y: clientY };
  } else {
    mousePosition.x = clientX;
    mousePosition.y = clientY;
  }
});
