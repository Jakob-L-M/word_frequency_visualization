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
    :param meta_data: meta data to be appended to the main file
    :param category: the associated project
    :return: Array of dictionaries. Each dict contains a word and an Array of Arrays, which represent the days of the
            word occurrence
    """
    word_dic_main = {}
    for day in data:
        for w_ind, word in enumerate(day['words']):
            if word in word_dic_main:
                word_dic_main[word].append(day['day'])
            else:
                word_dic_main[word] = [day['day']]
    main = []
    for i in list(word_dic_main.keys()):
        if len(word_dic_main[i]) < len(data)/100 + 2 or len(word_dic_main[i]) > len(data)/2 + 1:
            continue
        else:
            main_days = []
            day_set = set(word_dic_main[i])
            for j in sorted(word_dic_main[i]):
                if j-1 not in day_set:
                    start_day = j
                if j+1 in day_set:
                    continue
                else:
                    main_days.append([start_day, j + 1])
            main.append({"w": i.upper(), "d": main_days})
    write_json({'meta': meta_data, 'data': main}, "../../visualization/data/" + category + "/main.json")



def export_days(data, category):
    for day in data:
        day_dic = {'words': [i.upper() for i in day['words']], 'weights': day['weights']}
        write_json(day_dic, "../../visualization/data/" + category + "/days/" + str(day['day']) + ".json")


def export_words(data, category):
    word_dic_words = {}
    for day in data:
        for w_ind, word in enumerate(day['words']):
            word = word.upper()
            if word in word_dic_words:
                word_dic_words[word].append(day['weights'][w_ind])
            else:
                word_dic_words[word] = [day['weights'][w_ind]]

    for word in word_dic_words:
        write_json(word_dic_words[word], '../../visualization/data/' + category + '/words/' + word + '.json')


def export(data, start_date, total_days, category):
    """
    data: [{'day': <>, 'words': [<>], 'weights': [<>]]
    """
    meta_data = {'start_date': start_date, 'total_days': len(data)}

    export_days(data, category)

    export_words(data, category)

    export_main(data, meta_data, category)



