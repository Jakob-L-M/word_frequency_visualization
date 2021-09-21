from treetaggerwrapper import TreeTagger
from tqdm import tqdm
from sklearn.feature_extraction.text import TfidfVectorizer

import pandas as pd
import heapq
import numpy as np
import re


def analyse(Category):
    
    df = Category.data

    # Making sure 'date' is comparable
    df['date'] = pd.to_datetime(df['date'])

    # Creating a date range form the earlyes day to the most recent day
    # Each entry is a date at midnight and we increment by full days
    date_range = pd.date_range(str(min(df['date']))[:10], str(max(df['date']))[:10])
    
    # reading config parameters
    day_smoothing = Category.config['day_smoothing']
    k = Category.config['k']
    lang = Category.config['lang']

    # formating and lemmatization
    stemmed_tweets = build_stemed_day_array(df, date_range, set(Category.stopwords), lang)
    
    X, X_words = calculate_tfidf(stemmed_tweets)
    
    date_arr = []

    # iterate over date range index
    for day in tqdm(range(0, len(date_range)), desc='building output'):
        
        # sum up all rows around current day index
        arr = np.array(np.sum(X[max(0, day - day_smoothing): min(len(date_range), day + 1 + day_smoothing)], axis=0))[0]
        
        # remove all zero entries to speed up top k selection
        words = X_words[arr != 0]
        arr = arr[arr != 0]
        top_k_ind = heapq.nlargest(k, enumerate(arr), key=lambda x: x[1])
        
        # separate the wrights and normalize them
        top_k_w = [i[1] for i in top_k_ind]
        top_k_w = list(np.array(top_k_w)/sum(top_k_w))
        
        # add all data to the output array
        temp = {'day': day, 'words': [], 'weights': []}
        for i in range(0, len(top_k_ind)):
            # transform to uppercase for uniform appearance
            temp['words'].append(words[top_k_ind[i][0]].upper())
            
            # round to 5 digits to save space in export
            temp['weights'].append(float(f'{top_k_w[i]:.5f}'))
        
        date_arr.append(temp)

    return date_arr


def build_stemed_day_array(df, date_range, stop_words, lang):
    
    # init TreeTagger
    tagger = TreeTagger(TAGLANG=lang, TAGDIR='./TreeTagger')

    res = []
    # iterating over all days in the given day range
    for i in tqdm(date_range, desc='Stemming Tweets'):
        sentence = []

        # selecting all tweets of a certain day
        for tweet in df[np.logical_and(df['date'] > i, df['date'] < i+pd.DateOffset(1))]['text']:
            
            tweet = format_text(tweet)
            
            # if the tweet has content left after cleaning, lemmatization will start
            if tweet != '':
                for word in [j.split('\t')[2] for j in tagger.tag_text(tweet)]:
                    if len(word) < 3:
                        continue
                    if word.lower() in stop_words:
                        continue
                    
                    # +,| and @ are added by TreeTagger for multiple meanings or composed words.
                    # Will be ignored to prevend impurities
                    if "+" in word or "|" in word or "@" in word:
                        continue
                    
                    sentence.append(word)
        res.append(" ".join(sentence))
    return res

def calculate_tfidf(stemmed_tweets):
    
    print('calculating tfidf')

    # using sklearn to calculate tfidf matrix
    vectorizer = TfidfVectorizer(ngram_range=(1, 1))
    X = vectorizer.fit_transform(stemmed_tweets)
    X_words = np.array(vectorizer.get_feature_names())
    return X, X_words


def format_text(text):
    # remove Uni-Code
    t = text.encode('latin-1', 'ignore').decode('latin-1')

    # Hashtags entfernen
    t = re.sub(r'#', '', t)

    # Links entfernen
    t = re.sub(r'http\S+', '', t)

    # remove Steuersymbole/andere Zeichen
    t = re.sub(r'[\n\t\ \"\':+?!.]+', ' ', t)

    # remove \xad
    t = re.sub(r'\xad', '', t)

    return t