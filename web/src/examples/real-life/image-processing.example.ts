import { PublicUrl } from "@/utils/link.util";
import { createTask, createTaskGroup, ExecutionMode, TaskManager, TaskManagerFlag } from "@lilbunnyrabbit/task-manager";

const loadImage = createTask<string, { image: HTMLImageElement; dataUrl: string }>({
  name: "Load Image",

  parse() {
    if (this.isStatus("success") && this.result.isPresent()) {
      return {
        result: this.result.get().dataUrl,
      };
    }
  },

  async execute(src: string) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;

        canvas.width = image.width;
        canvas.height = image.height;

        ctx.drawImage(image, 0, 0);

        this.logger.info(`Image loaded! ${image.width}x${image.height} px`);

        resolve({
          image,
          dataUrl: canvas.toDataURL("image/jpeg"),
        });
      };
      image.onerror = () => reject(`Unable to load "${src}"`);

      image.src = src;
      image.crossOrigin = "Anonymous";

      this.logger.info(`Loading image from "${src}"`);
    });
  },
});

const resizeTask = createTask<void, { ctx: CanvasRenderingContext2D; dataUrl: string }>({
  name: "Resize Image",

  parse() {
    if (this.isStatus("success") && this.result.isPresent()) {
      return {
        result: this.result.get().dataUrl,
      };
    }
  },

  async execute() {
    const { image } = this.query.getLastResult(loadImage);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = 100;
    canvas.height = 100;

    this.logger.info(`Resizing ${image.width}x${image.height} px image to 100x100 px`);

    ctx.drawImage(image, 0, 0, 100, 100);

    return {
      ctx,
      dataUrl: canvas.toDataURL("image/jpeg"),
    };
  },
});

const convertTask = createTask<void, { ctx: CanvasRenderingContext2D; dataUrl: string }>({
  name: "Convert Image",

  parse() {
    if (this.isStatus("success") && this.result.isPresent()) {
      return {
        result: this.result.get().dataUrl,
      };
    }
  },

  async execute() {
    const { ctx } = this.query.getLastResult(resizeTask);

    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.logger.info("Converting image to b/w");

    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4) {
      const grayscale = (pixels[i] * 6966 + pixels[i + 1] * 23436 + pixels[i + 2] * 2366) >> 15;

      if (grayscale < 127) {
        pixels[i] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
      } else {
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    return {
      ctx,
      dataUrl: ctx.canvas.toDataURL("image/jpeg"),
    };
  },
});

const watermarkTask = createTask<void, { ctx: CanvasRenderingContext2D; dataUrl: string }>({
  name: "Watermark",

  parse() {
    if (this.isStatus("success") && this.result.isPresent()) {
      return {
        result: this.result.get().dataUrl,
      };
    }
  },

  async execute() {
    const { ctx } = this.query.getLastResult(convertTask);

    this.logger.info('Adding "@lilbunnyrabbit" watermark');

    ctx.fillStyle = "red";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("@lilbunnyrabbit", ctx.canvas.width / 2, ctx.canvas.height / 2);

    return {
      ctx,
      dataUrl: ctx.canvas.toDataURL("image/jpeg"),
    };
  },
});

const processImageGroup = createTaskGroup({
  name: "Process Image",

  tasks(src: string) {
    return [loadImage(src), resizeTask(), convertTask(), watermarkTask()];
  },
});

export default function () {
  const manager = new TaskManager().setMode(ExecutionMode.PARALLEL).addFlag(TaskManagerFlag.CONTINUE_ON_ERROR);

  manager.addTasks(
    processImageGroup(PublicUrl("/img/test1.jpg")),
    processImageGroup(PublicUrl("/img/test2.jpg")),
    processImageGroup(PublicUrl("/img/test3.jpg"))
  );

  return manager;
}
