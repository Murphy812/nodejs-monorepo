# Монорепозиторий для всех сервисов, написанных на Node.JS/Typescript

![](https://github.com/sr-2020/nodejs-monorepo/workflows/CI/badge.svg)
[![codecov](https://codecov.io/gh/sr-2020/nodejs-monorepo/branch/master/graph/badge.svg)](https://codecov.io/gh/sr-2020/nodejs-monorepo)
[![Coverage Status](https://coveralls.io/repos/github/sr-2020/nodejs-monorepo/badge.svg?branch=master)](https://coveralls.io/github/sr-2020/nodejs-monorepo?branch=master)

## Установка глобальных зависимостей

Для разработки/сборки необходимы следующие глобальные зависимости:

- [Node.JS](https://nodejs.org). Версия 10.
- [yarn](https://yarnpkg.com/en/). Менеджер зависимостей (как `npm`, но с бонусами).
- [lerna](https://github.com/lerna/lerna). Утилита, упрощающая работу с nodejs-монорепозиториями. Установка: `yarn global add lerna`.
- [Visual Studio Code](https://code.visualstudio.com/) с установленными плагинами

  - ESLint
  - Prettier - Code formatter
  - TypeScript Hero
  - (опционально) npm
  - (опционально) npm Intellisense

  Использование другого редактора (или неиспользование плагинов) скорее всего приведет к нестандартному форматированию файлов
  (отступы, ...), что сломает Travis-тесты.

Все остальные зависимости (включая Typescript) будут установлены локально c правильными версиями посредством `yarn`.

## Разработка

1. Склонировать репозиторий (`git clone https://github.com/sr-2020/nodejs-monorepo.git`) и перейти в соответствующую папку
   (`cd nodejs-monorepo`).
2. Установить локальные зависимости: `yarn`. Рекомендуется делать каждый раз после `git pull`,
   т.к. набор зависимостей может (и будет) меняться.
3. (опционально) Проверить, что все компилируется (`lerna run build`) и что тесты проходятся (`lerna run test`).

Перед тем, как пушить в репозиторий, необходимо проверить что следующие команды не выдают ошибок:

- Сборка: `lerna run build`.
- Тесты: `lerna run test`.
- Linter (проверка форматирования, стиля, отсутствия неиспользованных переменных и т.п.): `lerna run lint`.
  При редакторировании кода в Visual Studio Code с рекомендованным набором плагинов все файлы должны правильно форматироваться
  при сохранении. Если этого почему-то не случилось, можно запустить `lerna run lint:fix`, что должно все исправить
  (или выдать ошибку о том, что нужно исправить вручную).

### Требования к организации кода

- JavaScript-файлы (т.е. файлы с расширением .js) запрещены. Только TypeScript (.ts).
- Название всех файлов с тестами должно оканчиваться на .spec.ts.

## Packages

Каждая папка в [packages](https://github.com/sr-2020/nodejs-monorepo/tree/master/packages) соответствует одному "подпроекту" -
микросервису или библиотеке.

### interface

Содержит модели данных и прочие интерфейсы, использующиеся различными сервисами и библиотеками.

### push

Микросервис отвечающий за пуш-нотификациии. [Swagger-страница](http://push.evarun.ru/explorer/).

### alice-model-engine

Библиотека, модельный движок A.L.I.C.E. Отвечает за исполнение модельных скриптов. Не завязан на модели какой-либо конкретной
игры, может применяться для решения широкого спектра задач. Также не завязан на конкретную БД.

### alice-qr-lib

Библиотека, реализущая кодирование/декодирование QR-кодов и микросервис предоставляющий аналогичный функционал. [Страница генерации ценника](http://qr.aerem.in/).

### import-server

Микросервис импорта персонажей из [JoinRPG](https://joinrpg.ru) и табличных данных из Google Sheets.

### deus-model-engine

Модельные скрипты для ролевой игры [Deus Ex Machina](http://deus.rpg.ru). Можно использовать как источник вдохновения/пример
взаимодействия с API.

### magellan-model-engine

Модельные скрипты для ролевой игры [Магеллан 2018](http://magellan2018.ru/). Можно использовать как источник вдохновения/пример
взаимодействия с API (но модели там гораздо проще, чем в deus-model-engine).

### utility-scripts

Разнообразные скрипты.

### telegram-bot

Экспериментальный Telegram-бот (демонстрирующий функционал вроде генерации QR-кодов).
