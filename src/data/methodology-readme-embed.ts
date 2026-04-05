/** Фрагмент README для экрана «Методология» (синхронизировать при изменении корневого README). */
export const METHODOLOGY_README_EMBED = `## Быстрый старт

\`\`\`bash
git clone https://github.com/DearZiZiZi/subsidy-commission-portal.git
cd subsidy-commission-portal
npm install
cp .env.local.example .env.local
npm run dev
\`\`\`

Откройте http://localhost:3000

### Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| NEXT_PUBLIC_API_URL | URL FastAPI | http://127.0.0.1:8000 |
| NEXT_PUBLIC_DEMO_MODE | true — скоринг на клиенте | true |

### Запуск с бэкендом

\`\`\`bash
cd ../merit-based-scoring-model-for-animal-husbandry-indrive-gov-kz
pip install -r requirements.txt
uvicorn service:app --port 8000 --reload
\`\`\`

Во фронтенде: NEXT_PUBLIC_DEMO_MODE=false в .env.local
`;
