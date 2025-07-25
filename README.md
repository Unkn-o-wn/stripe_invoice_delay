<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.


## 🧪 Stripe Invoice Delay Logic

### 🎯 Цель

Реализовать логику автоматического переноса инвойсов в Stripe при достижении **дневного лимита Gross Volume**, с цикличной схемой задержек.

---

### 📌 Условия

- Время аккаунта Stripe: **GMT+4**
- Время переноса инвойса: **ровно 12:00 (полдень)** по GMT+4
- Дневной лимит Gross Volume: **30 AED**
- Валюта аккаунта: **AED**
- Источник данных: **локальный Gross Volume (day-wise)**, получаемый напрямую из Stripe (не считать вручную)

---

### 🔁 Схема цикличного переноса инвойсов

| Порядковый номер инвойса | Смещение даты |
| --- | --- |
| 1-й инвойс | +1 день |
| 2-й инвойс | +3 дня |
| 3-й инвойс | +5 дней |
| 4-й инвойс | +7 дней |
| 5-й инвойс | +9 дней |
| 6-й и далее | цикл повторяется |

Все новые due dates устанавливаются на **12:00 (GMT+4)**. После окончания суток скрипт запускается заново и работает так же.

---

### ⚙️ Функциональные требования

- Получать **Gross Volume (AED)** за текущие сутки из Stripe (по часовому поясу GMT+4).
- Если объём за день ≥ 30 AED — начинать перенос инвойсов, которые ещё не оплачены.
- Инвойсы переносятся по схеме выше — с цикличным применением смещений.
- Использовать Stripe API для обновления даты инвойса
- Все даты должны быть установлены на **12:00 (GMT+4)**.
- Вести лог перенесённых инвойсов (в консоль или файл).

---

### 🛠 Стек

- Язык: **Node.js**
- Использовать официальную Stripe api
- Учитывать часовой пояс аккаунта (GMT+4) при всех расчётах

---
