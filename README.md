# ИС скоринга субсидий животноводства — Merit Score v2

> **Team Spirit** · Decentrathon 5.0 · inDrive & Gov KZ Track

Портал комиссии для меритократического ранжирования заявок на субсидирование животноводства в Республике Казахстан. Система заменяет субъективное принятие решений объективным скорингом 0–100 по пяти компонентам, основанным на нормативно-правовых актах и статистических данных.

| Ресурс | Ссылка |
|--------|--------|
| **Исходный код (этот репозиторий)** | [DearZiZiZi/subsidy-commission-portal](https://github.com/DearZiZiZi/subsidy-commission-portal) |
| **Демо (Vercel)** | [subsidy-commission-portal.vercel.app](https://subsidy-commission-portal.vercel.app/) |
| **Модель скоринга (FastAPI, анализ)** | [silvermete0r/merit-based-scoring-model-for-animal-husbandry-indrive-gov-kz](https://github.com/silvermete0r/merit-based-scoring-model-for-animal-husbandry-indrive-gov-kz/) |

---

## Архитектура скоринга

```
Данные заявки → 5 компонентов (×20 каждый) → BASE_SCORE → правила → FINAL_SCORE
```

| Компонент | Макс. | Источник |
|---|---|---|
| Стратегический приоритет (Госплан) | 20 | Комплексный план 2026–2030, strategic_weights.json |
| Технологический уровень заявки | 20 | Эвристика по тексту цели субсидирования |
| Масштаб производства (Поголовье) | 20 | cbrt(requested_amount / standard) |
| Надёжность заявителя (по 2025) | 20 | hist_acceptance_rate_map.json |
| Региональная специализация | 20 | region_specialization_map.json (ИСЗХ) |

**Правила:** штраф −10% при сумме ≥ 100 млн ₸ · бонус +7 для овцеводства в янв–апр

---

## Страницы портала

| Маршрут | Назначение |
|---|---|
| `/` | Дашборд — KPI по 28 627 заявкам, распределение баллов, графики по направлениям/регионам/месяцам |
| `/evaluate` | Оценка одной заявки — форма → балл с gauge, радар, разбивка, бонус/штраф бейджи, PDF экспорт |
| `/shortlist` | Шортлист комиссии — фильтры, пагинация, бюджет-трекер, экспорт Excel/PDF с гербом РК |
| `/batch` | Пакетная обработка — загрузка CSV, скоринг всех строк, прогресс-бар, экспорт результатов |
| `/methodology` | Методология — архитектура расчёта, веса направлений, нормализация cbrt, источники данных |
| `/settings` | Настройки — переключение языка (Русский / Қазақша) |
| `/api-docs` | API для разработчиков — подключение, живой плейграунд POST /evaluate, cURL, сниппеты |

---

## Технологии

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts, Framer Motion
- **Backend (scoring API):** FastAPI, Python — [отдельный репозиторий](https://github.com/silvermete0r/merit-based-scoring-model-for-animal-husbandry-indrive-gov-kz/)
- **Экспорт:** jsPDF + jspdf-autotable (PDF с гербом), SheetJS (Excel)
- **State:** Zustand (шортлист + фильтры, persist в localStorage)
- **i18n:** Русский / Қазақша (полный перевод)

---

## Быстрый старт

```bash
# Клонировать
git clone https://github.com/DearZiZiZi/subsidy-commission-portal.git
cd subsidy-commission-portal

# Установить зависимости
npm install

# Запустить в демо-режиме (без бэкенда)
cp .env.local.example .env.local
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

### Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL FastAPI сервиса | `http://127.0.0.1:8000` |
| `NEXT_PUBLIC_DEMO_MODE` | `true` — скоринг на клиенте без API | `true` |

### Запуск с бэкендом

```bash
# В отдельном терминале — FastAPI
cd ../merit-based-scoring-model-for-animal-husbandry-indrive-gov-kz
pip install -r requirements.txt
uvicorn service:app --port 8000 --reload

# Во фронтенде — выключить демо
# .env.local: NEXT_PUBLIC_DEMO_MODE=false
npm run dev
```

---

## Данные

Портфель из **28 627 успешных заявок** за 2025–2026 гг. загружен из CSV и хранится в компактном формате (кортежи с индексами направлений/регионов). Агрегаты:

- Общая сумма: **100.3 млрд ₸**
- Средний балл: **71.2**
- Прогноз одобрения (>60 баллов): **90.5%**

---

## Нормативная база

- [Приказ МСХ РК №V1900018404](https://adilet.zan.kz) — Правила субсидирования
- Постановление Правительства №51 от 29.01.2026 — Комплексный план 2026–2030
- [ИС ИСЗХ](https://iszh.gov.kz) — Поголовье по регионам
- [Бюро национальной статистики](https://stat.gov.kz) — Макроэкономические данные

---

## Команда

**Team Spirit** — Decentrathon 5.0, inDrive & Gov KZ Track

## Лицензия

MIT
