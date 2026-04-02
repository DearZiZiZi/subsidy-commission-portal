/** Веса и обоснования — dicts/strategic_weights.json + Комплексный план 2026–2030. */
export interface StrategicWeightRow {
  direction: string;
  weight: number;
  shortLabel: string;
  justification: string;
}

export const STRATEGIC_WEIGHT_ROWS: StrategicWeightRow[] = [
  {
    direction: "Субсидирование в птицеводстве",
    weight: 15,
    shortLabel: "Птицеводство",
    justification:
      "Импортозамещение: снижение зависимости от импорта мяса птицы и яиц.",
  },
  {
    direction: "Субсидирование затрат по искусственному осеменению",
    weight: 15,
    shortLabel: "Искусственное осеменение",
    justification:
      "Биотехнологии размножения: ускорение генетического прогресса стада.",
  },
  {
    direction: "Субсидирование в скотоводстве",
    weight: 14,
    shortLabel: "Скотоводство",
    justification:
      "Базовое направление: молоко и мясо КРС, продовольственная безопасность.",
  },
  {
    direction: "Субсидирование в овцеводстве",
    weight: 11,
    shortLabel: "Овцеводство",
    justification:
      "Развитие тонкорунного сектора и мясного овцеводства в регионах.",
  },
  {
    direction: "Субсидирование в коневодстве",
    weight: 9,
    shortLabel: "Коневодство",
    justification: "Племенное коневодство и сохранение казахской генетики.",
  },
  {
    direction: "Субсидирование в свиноводстве",
    weight: 6,
    shortLabel: "Свиноводство",
    justification: "Локальное производство свинины, снижение импорта.",
  },
  {
    direction: "Субсидирование в верблюдоводстве",
    weight: 5,
    shortLabel: "Верблюдоводство",
    justification: "Традиционные отрасли южных и западных регионов.",
  },
  {
    direction: "Субсидирование в козоводстве",
    weight: 4,
    shortLabel: "Козоводство",
    justification: "Нишевое молочное направление и экспортный потенциал.",
  },
  {
    direction: "Субсидирование в пчеловодстве",
    weight: 4,
    shortLabel: "Пчеловодство",
    justification: "Опыление и мёд: поддержка малых форм хозяйствования.",
  },
];
