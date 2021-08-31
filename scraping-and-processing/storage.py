import os
import json

import pandas as pd
from glob import glob
from .processing import analyser


class Storage:
    def __init__(self, path):

        self.path = path
        self.categories = []

        if not os.path.isfile(path + 'main.csv'):
            main = pd.DataFrame(columns=['id', 'date', 'text'])
            main.to_csv(path + 'main.csv', index=False)
            with open(path + 'README.txt', 'x') as f:
                # todo: add correct link
                f.write('For instructions visit github.com/Jakob-L-M/')
                f.close()

            self.main = main

        else:
            self.main = pd.read_csv(path + 'main.csv')
            for path in glob(path + '*/'):
                self.categories.append(Category(path))


class Category:

    def __init__(self, path):

        
        self.name = path[path[:-1].rindex('\\') + 1:-1]
        self.path = path
        with open(self.path + 'config.json', 'r') as f:
            self.config = json.load(f)
        with open(self.path + 'stopwords.json', 'r') as f:
            self.stopwords = json.load(f)
        with open(self.path + 'keywords.json', 'r') as f:
            self.keywords = json.load(f)
        self.data = pd.read_csv(path + 'data.csv')

    def __repr__(self):
        return self.name
    
    def __str__(self):
        return 'Category:\t' + self.name + '\nLang:\t\t' + self.config['lang'] + '\nKeywords:\t' + str(len(self.keywords)) + '\nStopwords:\t' + str(len(self.stopwords)) + '\nText entries:\t' + str(len(self.data)) + '\nDates:\t\t' + self.config['start_date'] + ' -- ' + self.config['end_date']

    
