const s3 = require("./s3Config.js");
const { v4: uuid } = require("uuid");

module.exports.uploadToS3 = async (file, folder) => {
  if (!file) return null;

  const fileKey = `${folder}/${Date.now()}-${uuid()}-${file.originalname.replace(/\s/g, "")}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const upload = await s3.upload(params).promise();
  return {
    url: upload.Location,
    public_id: upload.Key
  };
};

module.exports.uploadUrlToS3 = async (url, folder) => {
  if (!url) return null;

  try {
    const protocol = url.startsWith('https') ? require('https') : require('http');
    const path = require('path');

    return new Promise((resolve, reject) => {
      protocol.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch image: ${res.statusCode}`));
          return;
        }

        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            const fileName = path.basename(url) || `imported-image-${Date.now()}`;
            const mimetype = res.headers['content-type'] || 'image/jpeg';

            const fileKey = `${folder}/import-${Date.now()}-${uuid()}-${fileName.replace(/\s/g, "")}`;

            const params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: fileKey,
              Body: buffer,
              ContentType: mimetype,
            };

            const upload = await s3.upload(params).promise();
            resolve({
              url: upload.Location,
              public_id: upload.Key
            });
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', reject);
    });
  } catch (error) {
    console.error("uploadUrlToS3 Error:", error);
    return null;
  }
};

module.exports.updateS3 = async (oldKey, newFile, folder) => {
  console.log("oldKey", oldKey);
  console.log("newFile", newFile);
  console.log("folder", folder);

  if (oldKey) {
    await this.deleteFromS3(oldKey);
  }

  return await this.uploadToS3(newFile, folder);
};

module.exports.deleteFromS3 = async (fileKey) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey
  };

  return await s3.deleteObject(params).promise();
};

module.exports.deleteManyFromS3 = async (keys = []) => {
  if (!keys.length) return;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: {
      Objects: keys.map(key => ({ Key: key }))
    }
  };

  return await s3.deleteObjects(params).promise();
};

module.exports.listBucketObjects = async () => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
  };

  const data = await s3.listObjectsV2(params).promise();

  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_BUCKET_NAME;

  const files = data.Contents.map(file => {
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${file.Key}`;
    return {
      key: file.Key,
      url,
      size: file.Size,
      lastModified: file.LastModified
    };
  });

  return files;

};
