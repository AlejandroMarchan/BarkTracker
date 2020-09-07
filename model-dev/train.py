import glob
import os
import librosa
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
from tensorflow import keras
import time
from sklearn.model_selection import StratifiedShuffleSplit


def extract_features(file_name):
    X, sample_rate = librosa.load(file_name)
    stft = np.abs(librosa.stft(X))
    mfccs = np.array(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=8).T)
    chroma = np.array(librosa.feature.chroma_stft(S=stft, sr=sample_rate).T)
    mel = np.array(librosa.feature.melspectrogram(X, sr=sample_rate).T)
    contrast = np.array(librosa.feature.spectral_contrast(S=stft, sr=sample_rate).T)
    tonnetz = np.array(librosa.feature.tonnetz(y=librosa.effects.harmonic(X), sr=sample_rate).T)
    return mfccs,chroma,mel,contrast,tonnetz


def parse_audio_files(parent_dir,sub_dirs,file_ext='*.wav'):
    ignored = 0
    # Declare variables to store the features and labels of every sound
    features, labels = np.empty((0,161)), np.empty(0)
    # Iterate through the subdirectories
    for sub_dir in sub_dirs:
        print(sub_dir)
        # Find all the .wav files in the directory an iterate through them
        for fn in glob.glob(os.path.join(parent_dir, sub_dir, file_ext)):
            try:
                # Extract the sound features of the file
                mfccs, chroma, mel, contrast, tonnetz = extract_features(fn)
                # Join the features together in an array of [x, 161]
                # x depends on the length of the file
                # 161 is the sum of the number of columns of each of the features arrays
                # 8 (mfccs) + 12 (chorma) + 128 (mel) + 7 (contrast) + 6 (tonnetz) = 161 (TOTAL)
                ext_features = np.hstack([mfccs, chroma, mel, contrast, tonnetz])
                # Append the features of the current file to the end of  
                # the array of features of the files already processed
                features = np.vstack([features,ext_features])
                # Extract the label from the second number of the file name and create an array 
                # with the same length as the features from the file
                l = [fn.split('-')[1].split('.')[0]] * (ext_features.shape[0])
                # Append the labels of the current file to the end of  
                # the array of labels of the files already processed
                labels = np.append(labels, l)
            except (KeyboardInterrupt, SystemExit):
                raise 
            except:
                    ignored += 1
                    print(f'There was a problem parsing the file: {fn}')
    print(f'Ignored files: {ignored}')
    return np.array(features), np.array(labels, dtype = np.int)


parent_dir = 'Data/'

sub_dirs = ['otros', 'perros']

try:
    labels = np.load('labels.npy')
    features = np.load('features.npy')
    print("Features and labels found!")
except:
    print("Extracting features...")
    features, labels = parse_audio_files(parent_dir,sub_dirs)
    with open('features.npy', 'wb') as f1:
	    np.save(f1,features)
    with open('labels.npy', 'wb') as f2:
	    np.save(f2, labels)


print("Fitting!")

sc = StandardScaler()
# Compute the mean and std
sc.fit(features)

# Perform standardization by centering and scaling
features = sc.transform(features)

counts = np.unique(labels, return_counts=True)

labels[labels==3] = 1

# print(counts)

features = features[counts[1][0]-counts[1][1]:]
labels = labels[counts[1][0]-counts[1][1]:]

# print(np.unique(labels, return_counts=True))

# Spliting data in a balanced way
X_train = []
y_train = []
X_test = []
y_test = []
X = features
y = labels
stratSplit = StratifiedShuffleSplit(n_splits=1, train_size=0.7, random_state=4)
for train_idx, test_idx in stratSplit.split(X, y):
    X_train, X_test = X[train_idx], X[test_idx]
    y_train, y_test = y[train_idx], y[test_idx]

# Command to activate Tensorboard: tensorboard --logdir='logs/'

layer1_size = 256
layer2_size = 256
epochs = 10

model_name = f'bark_recognition_{layer1_size}-{layer2_size}_{epochs}-epochs_{int(time.time())}'
tensorboard = keras.callbacks.TensorBoard(log_dir=f'logs/{model_name}')

model = keras.Sequential()
model.add(keras.layers.Dense(layer1_size, input_shape=(features.shape[1:]), activation='relu'))
model.add(keras.layers.Dropout(0.2))
model.add(keras.layers.BatchNormalization())

model.add(keras.layers.Dense(layer1_size, activation='relu'))
model.add(keras.layers.Dropout(0.1))
model.add(keras.layers.BatchNormalization())

model.add(keras.layers.Dense(layer2_size, activation='relu'))
model.add(keras.layers.Dropout(0.1))
model.add(keras.layers.BatchNormalization())


model.add(keras.layers.Dense(2, activation='tanh'))

opt = keras.optimizers.Adam(learning_rate=0.001)

model.compile(optimizer=opt,
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

filepath = "RNN_Final-{epoch:02d}-{val_acc:.3f}"  # unique file name that will include the epoch and the validation acc for that epoch
checkpoint = keras.callbacks.ModelCheckpoint("models/{}.model".format(filepath, monitor='val_acc', verbose=1, save_best_only=True, mode='max')) # saves only the best ones
# model.save(f'{layer_size}x{layer_number}-DNN.model')

model.fit(X_train, y_train, epochs=epochs, validation_data=(X_test, y_test), callbacks=[tensorboard, checkpoint])