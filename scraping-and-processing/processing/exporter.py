from tqdm import tqdm
import json


def write_json(data, file):
    with open(file, mode='w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)
        f.close()


def export_main(data, meta_data, category):
    """
    Exports main.json
    :param data: [{'day': <>, 'words': [<>], 'weights': [<>]]
    :param meta_data: meta date to be appended to the main file
    :param category: the associated project
    :return: Array of dictionaries. Each dict contains a word and an Array of Arrays, which represent the days of the
            word occurrence
    """
    word_dic_main = {}
    for d_ind, day in enumerate(data):
        for w_ind, word in enumerate(day['words']):
            if word in word_dic_main:
                word_dic_main[word].append(d_ind)
    print("main", word_dic_main)


def export_days(data, category):
    for d_ind, day in enumerate(data):
        day_dic = {'words': day['words'], 'weights': day['weights']}
        write_json(day_dic, '../../data/' + category + '/days/' + str(d_ind) + '.json')


def export_words(data, category):
    word_dic_words = {}
    for d_ind, day in enumerate(data):
        for w_ind, word in enumerate(day['words']):
            if word in word_dic_words:
                word_dic_words[word].append(day['weights'][w_ind])

    print("main", word_dic_words)
    #for word in word_dic_words:
    #    write_json(word_dic_words[word], '../../data/' + category + '/days/' + word + '.json')


def export(data, start_date, category):
    """
    data: [{'day': <>, 'words': [<>], 'weights': [<>]]
    """
    meta_data = {'start_date': start_date, 'max_day': len(data) - 1}

    export_days(data, category)

    export_words(data, category)

    export_main(data, meta_data, category)



