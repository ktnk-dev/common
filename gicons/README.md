# `gicons`
Client-side библиотека иконок на базе [Google Material Symbols Rounded](https://fonts.google.com/icons?icon.style=Rounded) . Возвращает готовые `span`-элементы, совместимые со `snwlib`.

Зависимости: `snwlib`

## Что есть
- `Icons.icon_name(options?)` для создания иконки по имени
- JSDoc-типизация для имён иконок
- глобальные настройки `DEFAULT_ICON_OPTIONS`, `DEFAULT_ICON_SIZE`, `DEFAULT_ICON_COLOR`
- стили и шрифт в `gicons.lib.css`

## Пример использования
```js
DEFAULT_ICON_SIZE = 20
DEFAULT_ICON_OPTIONS = {
    fill: false,
    weight: 400,
    grade: 'default',
    optical_size: 20
}

await Body.overwrite(
    $.div(
        { class: 'toolbar' },
        Icons.menu(),
        $.span('Dashboard'),
        Icons.settings({ size: 22, color: '#666' }),
        Icons.favorite({ fill: true, color: 'tomato', weight: 700 })
    )
)
```

Все иконки создаются с классами `material-symbols-rounded` `icon`, поэтому их можно дооформлять обычным CSS как `span`.
