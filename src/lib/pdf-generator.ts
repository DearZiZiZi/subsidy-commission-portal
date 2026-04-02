import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CommissionApplicant } from "@/types/scoring";
import { COMPONENT_KEYS } from "@/types/scoring";
import { formatKZT, formatScoreOneDecimal, getTier } from "@/lib/score-utils";
import type { Lang } from "@/lib/i18n-dict";

const FONT_FILE = "NotoSans-Regular.ttf";
const FONT_FAMILY = "NotoSans";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * jsPDF встроенные шрифты (Helvetica) — только Latin-1. Без встраивания TTF
 * кириллица и казахские буквы превращаются в «кракозябры» (mojibake).
 */
async function embedNotoSans(doc: jsPDF): Promise<void> {
  const path = `/fonts/${FONT_FILE}`;
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Не удалось загрузить шрифт для PDF: ${res.status}`);
  }
  const buf = await res.arrayBuffer();
  const base64 = arrayBufferToBase64(buf);
  doc.addFileToVFS(FONT_FILE, base64);
  doc.addFont(FONT_FILE, FONT_FAMILY, "normal");
  doc.setFont(FONT_FAMILY, "normal");
}

async function loadGerbBase64(): Promise<string | null> {
  try {
    const res = await fetch("/gerb.jpg");
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return arrayBufferToBase64(buf);
  } catch {
    return null;
  }
}

const tableFontStyles = {
  font: FONT_FAMILY,
  fontStyle: "normal" as const,
};

function texts(lang: Lang) {
  if (lang === "kk") {
    return {
      coverTitle: "КОМИССИЯ ҚОРЫТЫНДЫСЫ",
      coverSub:
        "Мал шаруашылығын субсидиялау өтініштерін скорингтеу нәтижелері бойынша",
      date: "Күні",
      reviewed: "Қаралған өтініштер",
      budget: "Бюджет лимиті",
      tableTitle: "Қысқа тізім кестесі",
      rank: "Ранг",
      applicant: "Өтініш иесі",
      direction: "Бағыт",
      region: "Облыс",
      amount: "Сома",
      score: "Балл",
      tier: "Деңгей",
      recommended: "Бекітуге ұсынылады",
      methodology: "Методология қысқаша",
      formula:
        "Соңғы балл стратегиялық, технологиялық, масштаб, сенімділік және аймақтық компоненттерінің қосындысына негізделеді.",
      sources: "Дереккөздер",
      decision:
        "Шешім комиссия скоринг деректеріне сүйене отырып қабылданады.",
      signatures: "Комиссия мүшелері үшін қолтаңбалар",
      seal: "[Қазақстан Республикасы Мемлекеттік елтаңбасы]",
    };
  }
  return {
    coverTitle: "ЗАКЛЮЧЕНИЕ КОМИССИИ",
    coverSub:
      "по результатам скоринга заявок на субсидирование животноводства",
    date: "Дата",
    reviewed: "Заявок рассмотрено",
    budget: "Лимит бюджета",
    tableTitle: "Таблица шортлиста",
    rank: "Ранг",
    applicant: "Заявитель",
    direction: "Направление",
    region: "Область",
    amount: "Сумма",
    score: "Балл",
    tier: "Уровень",
    recommended: "Рекомендовано к одобрению",
    methodology: "Краткая методология",
    formula:
      "Итоговый балл основан на сумме стратегического, технологического, масштабного, надёжности и регионального компонентов с учётом бонусов и штрафов.",
    sources: "Источники данных",
    decision:
      "Решение принимается комиссией на основании данных скоринга.",
    signatures: "Подписи членов комиссии",
    seal: "[Герб Республики Казахстан]",
  };
}

export async function downloadCommissionPdf(
  items: CommissionApplicant[],
  budgetTotal: number,
  lang: Lang
): Promise<void> {
  const T = texts(lang);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  await embedNotoSans(doc);
  const gerbB64 = await loadGerbBase64();

  const dateStr = new Date().toLocaleDateString(lang === "kk" ? "kk-KZ" : "ru-RU");

  let headerY = 25;
  if (gerbB64) {
    const gerbW = 24;
    const gerbH = 24;
    doc.addImage(gerbB64, "JPEG", 105 - gerbW / 2, 10, gerbW, gerbH);
    headerY = 40;
  } else {
    doc.setFontSize(16);
    doc.text(T.seal, 105, headerY, { align: "center" });
    headerY = 32;
  }
  doc.setFontSize(18);
  doc.text(T.coverTitle, 105, headerY + 4, { align: "center" });
  doc.setFontSize(12);
  doc.text(T.coverSub, 105, headerY + 16, { align: "center" });
  doc.setFontSize(11);
  doc.text(`${T.date}: ${dateStr}`, 20, headerY + 32);
  doc.text(`${T.reviewed}: ${items.length}`, 20, headerY + 40);
  doc.text(`${T.budget}: ${formatKZT(budgetTotal)}`, 20, headerY + 48);

  const sorted = [...items].sort((a, b) => b.final_score_100 - a.final_score_100);

  autoTable(doc, {
    startY: headerY + 58,
    head: [
      [
        T.rank,
        T.applicant,
        T.direction,
        T.region,
        T.amount,
        T.score,
        ...COMPONENT_KEYS.map((k) => k.slice(0, 18)),
        T.recommended,
      ],
    ],
    body: sorted.map((row, idx) => {
      const tier = getTier(row.final_score_100);
      const ok = tier === "recommended" || tier === "review";
      return [
        String(idx + 1),
        row.applicant_id,
        row.direction.slice(0, 40),
        row.region,
        formatKZT(row.requested_amount),
        formatScoreOneDecimal(row.final_score_100),
        ...COMPONENT_KEYS.map((k) =>
          formatScoreOneDecimal(row.component_breakdown[k])
        ),
        ok ? "YES" : "NO",
      ];
    }),
    styles: { ...tableFontStyles, fontSize: 7 },
    headStyles: { ...tableFontStyles, fillColor: [13, 21, 48] },
    bodyStyles: tableFontStyles,
    margin: { left: 10, right: 10 },
  });

  doc.addPage();
  let y = 20;
  doc.setFontSize(12);
  doc.text(T.methodology, 14, y);
  y += 8;
  doc.setFontSize(10);
  const formulaLines = doc.splitTextToSize(T.formula, 180);
  doc.text(formulaLines, 14, y);
  y += formulaLines.length * 5 + 6;
  doc.text(`${T.sources}:`, 14, y);
  y += 6;
  const src = [
    "adilet.zan.kz — приказ МСХ РК",
    "Постановление Правительства №51 от 29.01.2026",
    "iszh.gov.kz — ИС идентификации животных",
    "Бюро национальной статистики РК",
  ];
  src.forEach((s) => {
    doc.text(`• ${s}`, 18, y);
    y += 5;
  });
  y += 6;
  doc.text(T.decision, 14, y);
  y += 16;
  doc.text(T.signatures, 14, y);
  y += 10;
  doc.line(14, y, 90, y);
  doc.line(110, y, 186, y);

  doc.save(`commission-report-${dateStr.replace(/\//g, "-")}.pdf`);
}

export async function downloadApplicantPdf(
  applicant_id: string,
  final_score: number,
  explanation: string,
  breakdown: Record<string, number>,
  lang: Lang
): Promise<void> {
  const T = texts(lang);
  const doc = new jsPDF();
  await embedNotoSans(doc);

  doc.setFontSize(14);
  doc.text(T.coverTitle, 105, 20, { align: "center" });
  doc.setFontSize(11);
  doc.text(`${T.applicant}: ${applicant_id}`, 14, 40);
  doc.text(`${T.score}: ${formatScoreOneDecimal(final_score)}`, 14, 50);
  doc.text("Пояснение / Түсіндірме:", 14, 62);
  const lines = doc.splitTextToSize(explanation, 180);
  doc.setFontSize(10);
  doc.text(lines, 14, 70);

  autoTable(doc, {
    startY: 78 + lines.length * 5,
    head: [["Компонент", "Балл"]],
    body: COMPONENT_KEYS.map((k) => [k, formatScoreOneDecimal(breakdown[k] ?? 0)]),
    styles: { ...tableFontStyles, fontSize: 9 },
    headStyles: { ...tableFontStyles, fillColor: [13, 21, 48] },
    bodyStyles: tableFontStyles,
  });

  doc.save(`applicant-${applicant_id}.pdf`);
}
