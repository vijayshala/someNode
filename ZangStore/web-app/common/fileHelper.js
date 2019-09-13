export const getFileExtension = file => file.name.split('.').pop();

export const dataUriToBlob = dataURI => {
  // serialize the base64/URLEncoded data
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0) {
    byteString = atob(dataURI.split(',')[1]);
  } else {
    byteString = decodeURIComponent(dataURI.split(',')[1]);
  }

  // parse the mime type
  var mimeString = dataURI
    .split(',')[0]
    .split(':')[1]
    .split(';')[0];

  // construct a Blob of the image data
  var array = [];
  for (var i = 0; i < byteString.length; i++) {
    array.push(byteString.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: mimeString });
};

export const dataURLToFile = (dataURL, type, name) => {
  let blob = dataUriToBlob(dataURL);
  let file = new File([blob], name + '.' + type.split('/').pop(), {
    type: type,
    size: blob.size
  });

  file.preview = dataURL;
  return file;
};

export const reduceImageSize = (base64, maxW, maxH) =>
  new Promise((resolve, reject) => {
    let cnv = document.createElement('canvas'),
      ctx = cnv.getContext('2d'),
      width = 300,
      height = 300;

    width = maxW ? maxW : width;
    height = maxH ? maxH : height;

    const img = document.createElement('img');
    img.setAttribute('src', base64);
    img.onload = function() {
      let isLandscape = this.width > this.height;
      let isPortrait = this.width < this.height;
      let isSquare = this.width === this.height;

      if (isLandscape) {
        height = this.height * width / this.width;
      } else if (isPortrait) {
        width = this.width * height / this.height;
      } else if (isSquare) {
        width = height;
      }
      cnv.width = width;
      cnv.height = height;
      ctx.drawImage(this, 0, 0, width, height);
      ctx.scale(width, height);
      resolve(cnv.toDataURL());
    };
    img.src = base64;
  });

export const resizeImageToFile = (file, w, h) =>
  new Promise(resolve => {
    let fr = new FileReader();
    fr.addEventListener('load', frEvent => {
      reduceImageSize(frEvent.target.result, w, h).then(function(dataUrl) {
        const blob = dataUriToBlob(dataUrl);
        const parts = file.name.split('.');
        const thumbFilename = parts[0] + '_THUMB.' + parts[1];
        let newFile = new File([blob], thumbFilename, {
          type: file.type,
          size: blob.size
        });
        newFile.preview = window.URL.createObjectURL(newFile);
        resolve(newFile);
      });
    });
    fr.readAsDataURL(file);
  });

export const fileToDataURL = (file, cb) => {
  let fr = new FileReader();
  fr.addEventListener('load', cb);
  fr.readAsDataURL(file);
};
