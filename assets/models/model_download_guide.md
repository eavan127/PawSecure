# TFLite Model Download & Setup Guide

This guide helps you obtain and validate the required TensorFlow Lite models for PawGuardAI.

## Quick Start Options

### Option A: Download Pre-trained Models (Recommended)
Download ready-to-use models from these sources and place them in `assets/models/`:

### Option B: Train Custom Models
Use the training scripts provided below to create models tailored to your needs.

### Option C: Use Placeholders
The app will run with fallback implementations if models are missing (limited accuracy).

---

## Required Models

### 1. Breed Classifier (`breed_classifier.tflite`)

**Purpose**: Identifies dog and cat breeds from images  
**Input**: 224×224 RGB image, normalized [-1, 1]  
**Output**: 70+ breed probabilities  
**Target Size**: 10-15 MB

#### Download Pre-trained:
```bash
# MobileNetV2 from TensorFlow Hub
wget https://tfhub.dev/google/lite-model/aiy/vision/classifier/breeds_V1/1?lite-format=tflite -O breed_classifier.tflite

# Move to assets
mv breed_classifier.tflite c:/Users/ASUS/Downloads/club-website-2018-master/pawguard-ai/pawguard_ai/PawGuardAI/assets/models/
```

#### Train Custom Model:
```python
import tensorflow as tf
import tensorflow_hub as hub

# Load MobileNetV2 base
base_model = hub.KerasLayer("https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/feature_vector/5")
base_model.trainable = False

# Build classifier
model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(224, 224, 3)),
    base_model,
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(70, activation='softmax')  # 70 breeds
])

# Compile
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Train on Oxford Pets dataset
# Dataset: https://www.robots.ox.ac.uk/~vgg/data/pets/
# (Add your training code here)

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open('breed_classifier.tflite', 'wb') as f:
    f.write(tflite_model)
```

---

### 2. Activity Detector (`activity_detector.tflite`)

**Purpose**: Recognizes pet activities (sitting, running, playing, etc.)  
**Input**: 224×224 RGB image, normalized [-1, 1]  
**Output**: 7 activity probabilities  
**Target Size**: 8-12 MB

#### Pre-trained Alternative:
```bash
# Use PoseNet for pose-based activity estimation
wget https://tfhub.dev/google/lite-model/movenet/singlepose/lightning/tflite/int8/4?lite-format=tflite -O activity_detector.tflite
```

#### Custom Training:
```python
# Fine-tune MobileNetV2 for activity classification
model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(224, 224, 3)),
    tf.keras.applications.MobileNetV2(weights='imagenet', include_top=False),
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(7, activation='softmax')  # 7 activities
])

# Train on labeled pet activity videos
# Labels: sitting, standing, walking, running, playing, eating, sleeping
```

---

### 3. Health Detector (`health_detector.tflite`)

**Purpose**: Visual health screening (skin, injuries, parasites)  
**Input**: 224×224 RGB image, normalized [-1, 1]  
**Output**: 6 health scores (0-1 each)  
**Target Size**: 12-18 MB

> [!WARNING]
> Health detection requires veterinary expertise for labeling. Results should only be used as preliminary screening, not diagnosis.

#### Training Required:
```python
# Multi-output model for health assessment
input_layer = tf.keras.Input(shape=(224, 224, 3))
base = tf.keras.applications.MobileNetV2(include_top=False, weights='imagenet')(input_layer)
pooled = tf.keras.layers.GlobalAveragePooling2D()(base)

# Multiple outputs
overall_score = tf.keras.layers.Dense(1, activation='sigmoid', name='overall_score')(pooled)
skin_condition = tf.keras.layers.Dense(1, activation='sigmoid', name='skin_condition')(pooled)
injury = tf.keras.layers.Dense(1, activation='sigmoid', name='injury')(pooled)
abnormality = tf.keras.layers.Dense(1, activation='sigmoid', name='abnormality')(pooled)
parasite = tf.keras.layers.Dense(1, activation='sigmoid', name='parasite')(pooled)
malnutrition = tf.keras.layers.Dense(1, activation='sigmoid', name='malnutrition')(pooled)

model = tf.keras.Model(
    inputs=input_layer,
    outputs=[overall_score, skin_condition, injury, abnormality, parasite, malnutrition]
)
```

---

### 4. Pet Feature Extractor (`pet_feature_extractor.tflite`)

**Purpose**: Extract 128-D feature vectors for similarity matching  
**Input**: 224×224 RGB image, normalized [-1, 1]  
**Output**: 128-dimensional float vector  
**Target Size**: 8-10 MB

#### Download:
```bash
# MobileNetV2 embeddings from TensorFlow Hub
wget https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/feature_vector/5?lite-format=tflite -O pet_feature_extractor.tflite
```

#### Custom Extraction:
```python
# Remove classification head, keep embeddings
base_model = tf.keras.applications.MobileNetV2(include_top=False, weights='imagenet')
model = tf.keras.Sequential([
    base_model,
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dense(128, activation=None)  # 128-D embeddings
])

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
```

---

## Model Validation

After downloading or training, validate each model:

```bash
# Run validation script (create this in next step)
flutter test test/model_validation_test.dart
```

### Manual Python Validation:
```python
import numpy as np
from PIL import Image
import tflite_runtime.interpreter as tflite

# Load model
interpreter = tflite.Interpreter(model_path="breed_classifier.tflite")
interpreter.allocate_tensors()

# Get input/output info
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print("Input shape:", input_details[0]['shape'])
print("Input type:", input_details[0]['dtype'])
print("Output shape:", output_details[0]['shape'])

# Test inference with dummy image
test_img = np.random.rand(1, 224, 224, 3).astype(np.float32) * 2 - 1
interpreter.set_tensor(input_details[0]['index'], test_img)
interpreter.invoke()
output = interpreter.get_tensor(output_details[0]['index'])

print("Output shape:", output.shape)
print("Sum of probabilities:", np.sum(output))  # Should be ~1.0 for softmax
```

---

## Model Optimization

### Quantization (Reduce Size, Increase Speed)

```python
# Float16 quantization (50% size reduction)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float16]

# Int8 quantization (75% size reduction, faster)
def representative_dataset():
    for _ in range(100):
        yield [np.random.rand(1, 224, 224, 3).astype(np.float32)]

converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.representative_dataset = representative_dataset
```

---

## Troubleshooting

### Model Not Loading
- Check file exists: `ls assets/models/*.tflite`
- Verify file size is not 0 bytes
- Ensure pubspec.yaml includes model in assets

### Inference Fails
- Verify input shape matches model expectations
- Check normalization range ([-1, 1] vs [0, 1] vs [0, 255])
- Test with known-good test image

### Poor Accuracy
- Verify model is trained on relevant dataset
- Check if quantization degraded accuracy too much
- Ensure preprocessing matches training pipeline

---

## Dataset Resources

- **Oxford-IIIT Pets**: http://www.robots.ox.ac.uk/~vgg/data/pets/
- **Stanford Dogs**: http://vision.stanford.edu/aditya86/ImageNetDogs/
- **Cats vs Dogs**: https://www.kaggle.com/c/dogs-vs-cats
- **MS COCO (animals)**: https://cocodataset.org/

---

## Next Steps

1. Download/train models and place in `assets/models/`
2. Update `pubspec.yaml` to include model files
3. Run model validation utility
4. Test in-app with real pet images
5. Benchmark performance on target devices

---

**Need Help?** Check the main README or create an issue with:
- Model name
- Error messages
- Device specs
- Flutter/TFLite versions
