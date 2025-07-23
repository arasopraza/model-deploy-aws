const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const metadata = require('../model/metadata.json');

class PredictService {
  async predictImage(photo) {
    const modelPath = `file://${path.resolve(__dirname, '..', 'model', 'model.json')}`;
    const model = await tf.loadLayersModel(modelPath);

    const tensor = tf.node
      .decodeImage(photo)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat();

    const predict = await model.predict(tensor);
    const score = await predict.data();
    const confidenceScore = Math.max(...score);
    const label = tf.argMax(predict, 1).dataSync()[0];

    const diseaseLabels = metadata.labels;
    const diseaseLabel = diseaseLabels[label];

    return { confidenceScore, diseaseLabel };
  }
}

module.exports = PredictService;