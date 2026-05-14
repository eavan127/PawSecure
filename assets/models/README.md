# AI Models Directory

This directory contains TensorFlow Lite models for PawGuardAI's AI features.

## Required Models

### 1. breed_classifier.tflite
**Purpose**: Dog and cat breed classification  
**Input**: 224x224 RGB image (normalized -1 to 1)  
**Output**: Probability distribution over 70+ breeds  
**Recommended**: MobileNetV2 or EfficientNet-Lite  
**Size**: ~10-15 MB

**Sources**:
- Train custom model on [Oxford-IIIT Pet Dataset](http://www.robots.ox.ac.uk/~vgg/data/pets/)
- Use [TensorFlow Hub](https://tfhub.dev/) pre-trained models
- Convert from PyTorch using [tf2onnx](https://github.com/onnx/tensorflow-onnx)

### 2. activity_detector.tflite
**Purpose**: Pet activity recognition  
**Input**: 224x224 RGB image  
**Output**: 7 activity probabilities (sitting, standing, walking, running, playing, eating, sleeping)  
**Recommended**: MobileNetV2 + custom classifier head  
**Size**: ~8-12 MB

**Training**:
- Collect/annotate pet activity videos
- Extract frames and label with activities
- Fine-tune MobileNetV2 on activity dataset

### 3. health_detector.tflite
**Purpose**: Visual health screening  
**Input**: 224x224 RGB image  
**Output**: 6 values (overall_score, skin_condition, injury, abnormality, parasite, malnutrition)  
**Recommended**: Custom CNN or ResNet-Lite  
**Size**: ~12-18 MB

**Training**:
- Requires veterinary expertise for labeling
- Dataset of healthy vs. unhealthy pets
- Multi-label classification approach

### 4. pet_feature_extractor.tflite
**Purpose**: Extract visual features for similarity matching  
**Input**: 224x224 RGB image  
**Output**: 128-dimensional feature vector  
**Recommended**: MobileNetV2 or ResNet without classification head  
**Size**: ~8-10 MB

**Sources**:
- Use MobileNetV2 backbone from TensorFlow Hub
- Remove classification layers, keep embeddings
- Can use existing ImageNet pre-trained models

## Model Conversion Guide

### From TensorFlow/Keras to TFLite

```python
import tensorflow as tf

# Load your trained model
model = tf.keras.models.load_model('model.h5')

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# Save
with open('model.tflite', 'wb') as f:
    f.write(tflite_model)
```

### From PyTorch to TFLite

```python
import torch
import tf2onnx
import tensorflow as tf

# Export PyTorch to ONNX
torch.onnx.export(model, dummy_input, "model.onnx")

# Convert ONNX to TF
python -m tf2onnx.convert --onnx model.onnx --output model.pb

# Convert TF to TFLite
converter = tf.lite.TFLiteConverter.from_saved_model('model.pb')
tflite_model = converter.convert()
```

## Quick Start with Pre-trained Models

If you don't have custom models, you can use these alternatives:

1. **Breed Classification**: Use object detection to identify "dog"/"cat", then use fallback breed database
2. **Activity Detection**: Implement rule-based detection using pose estimation
3. **Health Monitoring**: Use visual heuristics (brightness, color variance)
4. **Feature Extraction**: Use MobileNetV2 from TensorFlow Hub

## Model Testing

Test your models before deployment:

```bash
# Install TFLite interpreter
pip install tflite-runtime

# Test inference
python test_model.py --model breed_classifier.tflite --image test_dog.jpg
```

Example test script:

```python
import numpy as np
from PIL import Image
import tflite_runtime.interpreter as tflite

# Load model
interpreter = tflite.Interpreter(model_path="breed_classifier.tflite")
interpreter.allocate_tensors()

# Get input/output details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Prepare image
img = Image.open('test_dog.jpg').resize((224, 224))
input_data = np.array(img, dtype=np.float32) / 127.5 - 1.0
input_data = np.expand_dims(input_data, axis=0)

# Run inference
interpreter.set_tensor(input_details[0]['index'], input_data)
interpreter.invoke()
output = interpreter.get_tensor(output_details[0]['index'])

print("Predictions:", output)
```

## Performance Optimization

### Quantization

Reduce model size and improve inference speed:

```python
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]  # FP16 quantization
# OR
converter.representative_dataset = representative_dataset_gen  # INT8 quantization
```

### GPU Acceleration

Models in this directory can use GPU acceleration automatically via the ModelManager service if:
- Device supports OpenGL ES 3.1+
- TFLite GPU delegate is available
- Model is compatible (most CNNs are)

## Model Metadata

Each model should include:
- Input shape and type
- Output shape and type
- Preprocessing requirements
- Label mapping file
- Performance metrics (accuracy, speed)
- Training dataset info
- License information

## Security Notes

- Validate model file integrity before deployment
- Models should be signed/checksummed
- Don't load models from untrusted sources
- Monitor model performance for anomalies

## Support

For model-related issues:
1. Check model file exists and is not corrupted
2. Verify input/output shapes match expectations
3. Test with known-good images
4. Check TFLite version compatibility
5. Review preprocessing pipeline

---

**Note**: This directory currently contains placeholder READMEs. Add actual model files when available.
