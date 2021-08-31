from treetaggerwrapper import TreeTagger
from tqdm import tqdm
from sklearn.feature_extraction.text import TfidfVectorizer

import pandas as pd
import heapq
import numpy as np
import re


def analyse(Category):
    
    df = Category.data
    date_range = pd.date_range(min(df['date'].unique()), max(df['date'].unique()))
    
    day_smoothing = Category.config['day_smoothing']
    k = Category.config['k']

    stemmed_tweets = build_stemed_day_array(df, date_range, Category.stop_words, Category.lang)

    X, X_words = calculate_tfidf(stemmed_tweets)

    date_arr = []
    for day in tqdm(range(0, len(date_range))):
        arr = list(np.sum(list(np.array(X.todense()[max(0,day - day_smoothing):min(len(date_range), day + day_smoothing)])), axis = 0))
        top_k_ind = list(map(arr.index, heapq.nlargest(k, arr)))
        top_k_w = heapq.nlargest(k, arr)
        top_k_w = list(np.array(top_k_w)/sum(top_k_w))
        temp = {'day': day, 'words': [], 'weights': []}
        for i, word in enumerate(top_k_ind):
            temp['words'].append(X_words[word])
            temp['weights'].append(top_k_w[i])
        date_arr.append(temp)

    return date_arr


def build_stemed_day_array(df, date_range, stop_words, lang):
    tagger = TreeTagger(TAGLANG=lang, TAGDIR='./TreeTagger')
    dates = pd.to_datetime(df['date']).dt.round('D')
    res = []
    for i in tqdm(date_range):
        sentence = []
        for tweet in df[dates == i]['text']:
            tweet = format_text(tweet)
            if tweet != '':
                for word in [j.split('\t')[2] for j in tagger.tag_text(tweet)]:
                    if len(word) < 3:
                        continue
                    if word in stop_words:
                        continue
                    if any(number in word for number in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']):
                        continue
                    sentence.append(word)
        res.append(" ".join(sentence))
    return res

def calculate_tfidf(stemmed_tweets):
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(stemmed_tweets)
    X_words = vectorizer.get_feature_names()
    return X, X_words


def format_text(text):
    # remove Uni-Code
    t = text.encode('latin-1', 'ignore').decode('latin-1')

    # Hashtags entfernen
    t = re.sub(r'#', '', t)

    # Links entfernen
    t = re.sub(r'http\S+', '', t)

    # remove Steuersymbole/andere Zeichen
    t = re.sub(r'[\n\t\ \"\':+?!]+', ' ', t)

    # remove \xad
    t = re.sub(r'\xad', '', t)

    return t