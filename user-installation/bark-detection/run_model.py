import glob
import os
import librosa
import numpy as np
import tensorflow as tf
from tensorflow import keras
import sounddevice
from sklearn.preprocessing import StandardScaler
from joblib import dump, load
from datetime import datetime
import json

duration = 0.1  # seconds
sample_rate=44100

def extract_features():
    X = sounddevice.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1)
    sounddevice.wait()
    X= np.squeeze(X)
    stft = np.abs(librosa.stft(X))
    mfccs = np.array(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=8).T)
    chroma = np.array(librosa.feature.chroma_stft(S=stft, sr=sample_rate).T)
    mel = np.array(librosa.feature.melspectrogram(X, sr=sample_rate).T)
    contrast = np.array(librosa.feature.spectral_contrast(S=stft, sr=sample_rate).T)
    tonnetz = np.array(librosa.feature.tonnetz(y=librosa.effects.harmonic(X), sr=sample_rate).T)
    ext_features = np.hstack([mfccs,chroma,mel,contrast,tonnetz])
    features = np.vstack(ext_features)
    return features

def store_time(date, final_time):
    print(date, final_time)
    data = []
    with open('server/barks.json', 'r') as json_file:
        data = json.load(json_file)
    with open('server/barks.json', 'w') as json_file:
        data.append({ 'duration': date, 'date': final_time })
        print(data)
        json.dump(data, json_file)

# Create a new model instance
try:
    sc = load('std_scaler.bin')
except:
    features = np.load('features.npy')
    sc = StandardScaler()
    sc.fit(features)
    dump(sc, 'std_scaler.bin', compress=True)

layer_size = 128
layer_number = 2
epochs = 10
opt = keras.optimizers.Adam(learning_rate=0.001, decay=1e-6)

model = keras.Sequential()
model.add(keras.layers.Dense(layer_size, input_shape=((161,)), activation='relu'))
model.add(keras.layers.Dropout(0.2))
model.add(keras.layers.BatchNormalization())

for i in range(layer_number-1):
    model.add(keras.layers.Dense(layer_size, activation='relu'))
    model.add(keras.layers.Dropout(0.1))
    model.add(keras.layers.BatchNormalization())

model.add(keras.layers.Dense(2, activation='tanh'))

model.compile(optimizer=opt,
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# Load the previously saved weights
model.load_weights("128x2-DNN.model")
prev = False

while 1:
        feat = extract_features()
        feat = sc.transform(feat)
        y_pred = model.predict_classes(feat)
        print(y_pred)

        if(np.bincount(y_pred).argmax() == 1 and not prev):
            start_time = datetime.now()
            prev = True
        elif(np.bincount(y_pred).argmax() != 1 and prev):
            end_time = datetime.now()
            final_time = end_time - start_time
            store_time(start_time.strftime('%Y-%m-%dT%H:%M:%S'), int(final_time.total_seconds()))
            prev = False
