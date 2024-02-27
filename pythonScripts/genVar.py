import cv2
import numpy as np
import os

# Load your image
original_image_path = './roi/roi.png'
image = cv2.imread(original_image_path)

output_directory = 'output_variations'
if not os.path.exists(output_directory):
    os.makedirs(output_directory)

number_of_variations = 100  # Specify the desired number of variations

for i in range(number_of_variations):
    # Random adjustments
    brightness = np.random.uniform(0.8, 1.2)  # between 0.8 and 1.2
    saturation_change = np.random.uniform(0.8, 1.2)  # between 0.8 and 1.2
    zoom_factor = np.random.uniform(0.9, 1.1)  # Zoom factor between 0.9 and 1.1
    angle = np.random.choice([0, 90, 180, 270])  # Constrained rotation angles
    
    # Rotation
    image_center = tuple(np.array(image.shape[1::-1]) / 2)
    rot_mat = cv2.getRotationMatrix2D(image_center, angle, 1.0)
    rotated_image = cv2.warpAffine(image, rot_mat, image.shape[1::-1], flags=cv2.INTER_LINEAR)
    
    # Zoom
    resized_image = cv2.resize(rotated_image, None, fx=zoom_factor, fy=zoom_factor, interpolation=cv2.INTER_LINEAR)
    
    # Brightness and Saturation
    hsv_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv_image)
    s = np.clip(s * saturation_change, 0, 255).astype(h.dtype)
    v = np.clip(v * brightness, 0, 255).astype(h.dtype)
    adjusted_hsv_image = cv2.merge([h, s, v])
    adjusted_image = cv2.cvtColor(adjusted_hsv_image, cv2.COLOR_HSV2BGR)
    
    # Save variations
    cv2.imwrite(f'{output_directory}/variation_{i+1}.jpg', adjusted_image)
    print(f'Generated variation_{i+1}.jpg')

print('All variations generated.')
