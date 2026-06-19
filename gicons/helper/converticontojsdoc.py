import json
icons: list[set] = []
all_icons = set()
with open('iconlist.json', 'r') as f:
    icon_list = json.load(f)
    for i, icon in enumerate(icon_list):
        if icon in all_icons: continue
        if i%35 == 0:
            icons.append(set())
        icons[-1].add(icon)
        all_icons.add(icon)
    
def generate_replace_value(icons_list):
    return "|".join([f"'{icon}'" for icon in icons_list])


with open('gicons.lib.js', 'r', encoding='utf-8') as r:
    data = r.read()
    output = ''
    for i, icon_set in enumerate(icons):
        replaced = generate_replace_value(icon_set)
        output += '/** @typedef {string} IconSet{i} */\n'.replace('string', replaced).replace('{i}', str(i))

    with open('gicons.lib.js', 'w', encoding='utf-8') as w:
        output += '/** @typedef {'+f'{"|".join([f"IconSet{i}" for i in range(len(icons))])}'+'} IconSet */\n'
        print(output)
        data = data.replace('//! TAG', '//! TAG\n'+output)
        data = data.replace('/** @type {Record<string, (options: IconOptions) => HTMLSpanElement} */', '/** @type {Record<IconSet, (options: IconOptions) => HTMLSpanElement} */')
        w.write(data)