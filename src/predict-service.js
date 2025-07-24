const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const metadata = require('../model/metadata.json');

class PredictService {
  async predictImage(photo) {
    /*
     * Constructs an absolute file URL pointing to the model.json file on the local file system.
     * The "file://" prefix is required by TensorFlow.js to indicate it's loading from the local file system in Node.js.
     * path.resolve ensures compatibility across operating systems (Windows, macOS, Linux).
     */
    const modelPath = `file://${path.resolve(__dirname, '..', 'model', 'model.json')}`;


    /*
     * Loads a pre-trained model from the specified file URL.
     * Returns a TensorFlow.js LayersModel instance that can be used for inference or further training.
     * In Node.js, loading from the file system requires the "file://" scheme.
     */
    const model = await tf.loadLayersModel(modelPath);

    const tensor = tf.node
      .decodeImage(photo) // Decodes the image buffer into a Tensor, which is the format TensorFlow.js models can process
      .resizeNearestNeighbor([224, 224]) // / Resizes the image to the input size expected by the model (refer to metadata.json → imageSize)
      .expandDims() // Adds a batch dimension, converting the shape from [height, width, channels] to [1, height, width, channels] — required because models expect batched inputs. Reference: https://js.tensorflow.org/api/latest/#expandDims
      .toFloat(); // Converts the tensor data type to float32, which is typically required by models for numerical stability and accurate computation. Reference: https://js.tensorflow.org/api/latest/#cast (used internally in toFloat), https://js.tensorflow.org/api/latest/#tensor.toFloat

    const predict = await model.predict(tensor); // Runs the model prediction on the input tensor. Returns a tensor containing the probability scores for each class.
    const score = await predict.data(); // Extracts the prediction results as a JavaScript array of numbers. This is an asynchronous operation because it reads data from the Tensorflow backend (native C++ binding).
    const confidenceScore = Math.max(...score); // Finds the highest probability value from the prediction scores. This represents how confident the model is in its prediction.
    const label = tf.argMax(predict, 1).dataSync()[0]; // Identifies the index of the highest probability. tf.argMax returns a tensor of indices; dataSync()[0] extracts the single index as a plain number.

    const diseaseLabels = metadata.labels; // Retrieves the array of class labels from the model's metadata. These labels represent the possible disease categories the model can predict.
    const diseaseLabel = diseaseLabels[label]; // Maps the predicted class index (label) to its corresponding human-readable disease name. For example, if label = 2, this selects metadata.labels[2] ("Vascular Lesion").

    return { confidenceScore, diseaseLabel }; // Returns an object containing the prediction result.
  }
}

module.exports = PredictService;