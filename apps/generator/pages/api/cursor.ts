import { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const size = Number(req.query.size);
  const zoom = Number(req.query.zoom);

  const scaledSize = size * zoom;

  const canvasSize = scaledSize + 2;
  const halfCanvasSize = canvasSize / 2;
  const halfSize = scaledSize / 2;

  res
    .status(200)
    .setHeader('Content-Type', 'image/svg+xml')
    .send(
      `<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg"><circle cx="${halfCanvasSize}" cy="${halfCanvasSize}" r="${halfSize}" fill="none" stroke="black" stroke-width="1" /></svg>`,
    );
}
