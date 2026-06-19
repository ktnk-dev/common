# Common-libs
Здесь собрана коллекция разработанных мною библиотек для их удобного импорта без надобности лезть в прошлые проекты

## `snwlib`
Ультрабыстрая client-side vanillajs библиотека "пародия" на jsx с типизацией и некоторыми вспомонательными функциями которая используется почти во всех моих фронтенд проектах. В планах сделать стейты 

Зависимости: нет
```js
$.tag_name(
    {
        ...tag_attributes
        style: StyleProps //оьектом как в jsx
    }? // этот обьект опционален, первым аргом можно дать уже html тег вместо пропов
    ...HTML_TAGS // далее variatic args с бесконечным числом аргументов принимающих child html теги, можно также и $.tag_name
)

Body.overwrite(
    $.h1({
        style: {
            color: '#f00'
        },
        class: 'hello'
    }, 'Hello world'),
    
    ...['1','2','3'].map(i => $.span(i)),
    
    test ? $.button('test') : null
)
const Button = (...props) => $.button(props, 'Простой компонент кнопки')
```

## `gicons`
Ультрабыстрая сlient-side vanillajs библиотека, импортирующая иконки из [библиотеки гугла в Rounded стиле](https://fonts.google.com/icons?icon.style=Rounded) 

Зависимости: `snwlib`

```js
//    названия всех 3-х тысяч иконок типизированы в jsdocs
Icons.icon_name({
    weight: 100..700,
    fill: bool,
    grade: 'low' | 'default' | 'high',
    optical_size: 20..48,
    size: number,
    color: string
})
DEFAULT_ICON_OPTIONS = {}     // если создать иконку без пропов, пропы будут взяты от сюда
DEFAULT_ICON_SIZE = 24        // если не указано иначе в пропах
DEFAULT_ICON_COLOR = '#000' // если не указано иначе в пропах
```
Все иконки создаются с классами `material-symbols-rounded` `icon`, можно в css редачить как span элемент 