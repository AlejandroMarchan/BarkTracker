from datetime import datetime
from time import sleep
import json
import numpy as np

def store_time(date, final_time):
    print(date, final_time)
    data = []
    with open('server/barks.json', 'r') as json_file:
        data = json.load(json_file)
    with open('server/barks.json', 'w') as json_file:
        data.append({ 'duration': final_time, 'date': date })
        json.dump(data, json_file)

# start_time = datetime.now()
# sleep(5)
# end_time = datetime.now()
# final_time = end_time - start_time
# store_time(start_time.strftime('%Y-%m-%dT%H:%M:%S'), int(final_time.total_seconds()))

prev = False
suma = 0

while 1:
        y_pred = [1,1,1,1,0,0,0,1,1]
        if (suma % 4 == 0):
            y_pred = [0,0,0,0,0,0,0]
        suma += 1
        print('Sleeping')
        sleep(2)

        print(np.bincount(y_pred).argmax())
        if(np.bincount(y_pred).argmax() == 1 and not prev):
            start_time = datetime.now()
            prev = True
        elif(np.bincount(y_pred).argmax() != 1 and prev):
            end_time = datetime.now()
            final_time = end_time - start_time
            store_time(start_time.strftime('%Y-%m-%dT%H:%M:%S'), int(final_time.total_seconds()))
            prev = False