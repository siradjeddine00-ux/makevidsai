export interface IImageProvider {
  name: string;
  generateImage(prompt: string, options?: { aspectRatio?: string }): Promise<string>;
}
