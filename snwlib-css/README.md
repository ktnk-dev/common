# `snwlib-css`
Глобальные стили на нативном JS с декларативным деревом селекторов. Библиотека создаёт один общий `<style>` и не дублирует уже добавленные правила при повторном импорте.

Зависимости: нет

## Что есть
- `css(selector, styles?, ...children)` для описания обычных правил
- `cssMedia(query, ...children)` для `@media`
- `cssKeyframes(name, frames)` для `@keyframes`
- `cssScreens.mobile`, `cssScreens.tablet`, `cssScreens.desktop` с готовыми брейкпоинтами

## Пример использования
```js
css('app', {
    display: 'block'
},
    css('button', {
        padding: '8px 12px'
    },
        css(':hover', {
            opacity: 0.8
        })
    ),
    css('> span', {
        color: '#f00'
    })
)

cssKeyframes('fade-in', {
    from: { opacity: 0 },
    to: { opacity: 1 }
})

cssMedia('(max-width: 640px)',
    css('app', {
        padding: '12px'
    })
)

cssMedia(cssScreens.mobile,
    css('app', {
        gap: '8px'
    })
)
```

Особенности:
- пути склеиваются в итоговые CSS селекторы
- повторный импорт не дублирует уже записанные селекторы и `@keyframes`
- для вложенных селекторов поддерживается `:hover`, `[attr]` и `&`
- `cssScreens.mobile`, `cssScreens.tablet`, `cssScreens.desktop` выдают готовые `(max-width: ...)`
