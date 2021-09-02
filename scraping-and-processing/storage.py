import os
import json

import pandas as pd
from glob import glob
from processing import analyser
from processing import exporter
from tqdm import tqdm
from datetime import datetime


class Storage:
    def __init__(self, path):

        self.path = path
        self.categories = {}

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
                temp = Category(path)
                self.categories[temp.name] = temp
    
    def __str__(self):
        return 'Path:\t' + self.path + '\nEntries:' + str(len(self.main))

    def update(self, temp_path):
        temp_files = glob(temp_path + "*.txt")
        for j in tqdm(temp_files, desc="Updating main.csv"):

            f = open(j, mode="r", encoding="utf-8")

            user_tweets = []

            for i in f.readlines():

                temp = json.loads(i[:-1])

                if temp['retweetedTweet'] is None:

                    s = temp['date']
                    # String to datetime.date
                    dt = datetime(int(s[:4]), int(s[5:7]), int(s[8:10]), int(
                        s[11:13]), int(s[14:16]), int(s[17:19]))

                    dic = {}

                    dic['date'] = pd.to_datetime(dt)
                    dic['text'] = temp['content']
                    dic['id'] = temp['id']
                    dic['user'] = temp['user']['username']

                    user_tweets.append(dic)
            # Closing file
            f.close()

            self.main = self.main.append(user_tweets)

        self.main = self.main.drop_duplicates(subset=['id'])

        self.main.to_csv(self.path + 'main.csv', index=False)

    def create_category(self, name):
        df = pd.DataFrame(columns=['id', 'date', 'text'])

        try:
            os.mkdir(self.path+name+"/")
        except FileExistsError:
            pass

        df.to_csv(self.path + name + '/data.csv', index=False)

        with open(self.path + name + '/keywords.json', 'x', encoding='utf-8') as f:
            json.dump(['Write', 'your', 'keywords', 'here'], f)
        f.close()

        with open(self.path + name + '/stopwords.json', 'x', encoding='utf-8') as f:
            json.dump(['Write', 'your', 'stopwords', 'here'], f)
        f.close()

        with open(self.path + name + '/config.json', 'x') as f:
            json.dump({'start_date': '2000-01-01', 'end_date': '2001-01-01',
                      'day_smoothing': 3, 'k': 15}, f)
        f.close()


class Category:

    def __init__(self, path):

        self.name = path[path[:-1].rindex('\\') + 1:-1]
        self.path = path
        with open(self.path + 'config.json', 'r', encoding='utf-8') as f:
            self.config = json.load(f)
        with open(self.path + 'stopwords.json', 'r', encoding='utf-8') as f:
            self.stopwords = json.load(f)
        with open(self.path + 'keywords.json', 'r', encoding='utf-8') as f:
            self.keywords = json.load(f)
        self.data = pd.read_csv(path + 'data.csv')

    def __repr__(self):
        return self.name

    def __str__(self):
        return 'Category:\t' + self.name + '\nLang:\t\t' + self.config['lang'] + '\nKeywords:\t' + str(len(self.keywords)) + '\nStopwords:\t' + str(len(self.stopwords)) + '\nText entries:\t' + str(len(self.data)) + '\nDates:\t\t' + self.config['start_date'] + ' -- ' + self.config['end_date']

    def analyse(self):
        self.analysed_data = analyser.analyse(self)

    def export(self):
        try:
            os.mkdir(self.path + 'export\\')
            os.mkdir(self.path + 'export\\days\\')
            os.mkdir(self.path + 'export\\words\\')
        except FileExistsError:
            pass

        if hasattr(self, 'analysed_data'):
            exporter.export(self)
        else:
            print("Could not find any analysed data. Try running Catogory.analyse() first")

    def update(self, main_data):

        main_data['date'] = pd.to_datetime(main_data['date'])

        use_filter = True
        if self.keywords[0] != "":
            def keyword_filter(x): return any(
                word.lower() in analyser.format_text(x['text']).lower() for word in self.keywords)
        else:
            use_filter = False

        if self.config['start_date'] != '':
            main_data = main_data[main_data['date'] > pd.to_datetime(self.config['start_date'])]

        if self.config['end_date'] != '':
            main_data = main_data[main_data['date'] < pd.to_datetime(self.config['end_date'])]
        
        # if there already exsists data, we will slice the main file first to only check for new entries
        if len(self.data['date']) != 0:
            main_data = main_data[pd.to_datetime(main_data['date']) > pd.to_datetime(max(self.data['date']))]

        if use_filter:
            main_data = main_data[main_data.apply(keyword_filter, axis=1)]

        # append new data
        self.data = self.data.append(main_data, ignore_index=True)

        # Just to be 100% safe
        self.data = self.data.drop_duplicates(subset=['id'])

        self.data.to_csv(self.path+'data.csv', index=False)

