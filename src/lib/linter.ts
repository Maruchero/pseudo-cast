import type exceljs from 'exceljs';

// Colors
const orange = 'fff5aa00';
const bold = true;

// Keywords
type LinterKeywords = {
    specialWords: string[]
}

export const PSEUDOCODE_KW = {
	specialWords: [
		'SE',
		'ALLORA',
		'ALTRIMENTI',
		'RIPETI',
		"FINCHE'",
		'INIZIO',
		'FINE',
		'OR',
		'AND',
		'NOT',
		'FINE-SE',
		'FINE-RIPETI',
		'RICHIAMA'
	]
};

export const STRUCTURED_PAPER_KW = {
	specialWords: [
		'(',
		')',
		'ELSE',
		'SE',
		'UNTIL',
		'INIZIO',
		'FINE',
		'OR',
		'AND',
		'NOT',
		'RICHIAMA',
		'SKIP'
	]
};

// Functions ******************************************************************
const getRichtexts = (line: string, keywords: LinterKeywords): exceljs.RichText[] => {
	const richTexts = [];
	const splitted = line.split(/(?=[ ()])|(?<=[ ()])/);

	for (const word of splitted) {
		if (keywords.specialWords.includes(word.toUpperCase())) {
			richTexts.push({ text: word, font: { color: { argb: orange }, bold } });
		} else {
			richTexts.push({ text: word });
		}
	}

	return richTexts;
};

export const getRichtextValue = (
	line: string,
	keywords: LinterKeywords
): { richText: exceljs.RichText[] } => {
	return { richText: getRichtexts(line, keywords) };
};