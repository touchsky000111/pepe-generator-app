export const convertImageToDataURL = (url: string): Promise<string> => {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = function () {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      var dataURL = canvas.toDataURL('image/png');

      res(dataURL);
    };

    img.onerror = function () {
      rej(null);
    };

    img.src = url;
  });
};
