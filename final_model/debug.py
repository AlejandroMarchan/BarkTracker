import numpy as np

labels = np.load('labels.npy')
features = np.load('features.npy')
print("Features and labels found!")

print(labels.shape, features.shape)