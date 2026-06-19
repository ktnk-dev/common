# `snwlib`
Ультрабыстрая client-side vanillajs библиотека с JSX-подобным API для создания DOM-элементов, рендера и простой работы с уже существующими узлами.

Зависимости: нет

## Что есть
- `$.tagName(props?, ...children)` для создания HTML-элементов
- `select(selector)` и `selectAll(selector)` для поиска в DOM
- `wrap(element)` для обёртки существующего элемента
- `Body` как обёртка над `document.body`
- методы `overwrite`, `append`, `clear`, `animate`, `classes`, `styles`, `remove`

## Пример использования
```js
const Button = (text, onclick) =>
    $.button(
        {
            class: 'primary',
            onclick,
            style: {
                padding: '8px 12px',
                borderRadius: '8px'
            }
        },
        text
    )

await Body.overwrite(
    $.main(
        $.h1({ class: 'title' }, 'Hello world'),
        $.div(
            { className: 'list' },
            ...['1', '2', '3'].map(i => $.span(i))
        ),
        Button('Click me', () => console.log('clicked'))
    )
)

select('.title').classes('title', 'active')
await select('.list').append($.span('4'))
```

`props.style` принимает объект в camelCase, события передаются через `onclick`, `oninput` и другие `on*`-поля. Первым аргументом вместо `props` можно передать строку, число или уже готовый DOM-узел.
