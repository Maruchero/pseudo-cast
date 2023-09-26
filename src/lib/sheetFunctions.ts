import { Workbook, type Worksheet } from 'exceljs';

const white = 'ffffffff';
const gray = 'ffb4b4b4';
const orange = 'fff5aa00';

export const toWorkbook = (title: string, author: string, code: string): Workbook => {
	let workbook = new Workbook();
	let worksheet = workbook.addWorksheet(title);

	// Shape cells to squares
	for (let i = 0; i < 100; i++) {
		const col = worksheet.getColumn(i);
		if (col) col.width = 3;
	}

	// Insert author and title
	let richTextValue = {
		richText: [{ text: author + ' - ' + title, font: { name: 'Segoe UI', bold: true } }]
	};
	worksheet.getCell('A1').value = richTextValue;

	// Pseudocodifica
	const rows = splitRows(code);
	const startingRow = 3;
    writePseudoCode(worksheet, startingRow, rows);

    const nextStartingRow = startingRow + rows.length + 2;
	console.dir(getRowTree(code), {depth: null});
	writeStructuredPaper(worksheet, nextStartingRow, rows);

	return workbook;
};

const writeStructuredPaper = (worksheet: Worksheet, startingRow: number, rows: Row[]) => {
	worksheet.getCell(startingRow, 1).value = {
		richText: [{ text: 'CARTA STRUTTURATA', font: { name: 'Segoe UI', color: { argb: white } } }]
	};

	const row = worksheet.getRow(startingRow);
	row.fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: gray }
	};

    startingRow++;
	// Write rows
}

const writePseudoCode = (worksheet: Worksheet, startingRow: number, rows: Row[]) => {
	worksheet.getCell(startingRow, 1).value = {
		richText: [{ text: 'PSEUDOCODIFICA', font: { name: 'Segoe UI', color: { argb: white } } }]
	};

	const row = worksheet.getRow(startingRow);
	row.fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: gray }
	};

    startingRow++;
	// Write rows
	rows.forEach((row, i) => {
		worksheet.getCell(startingRow + i, row.indentation + 1).value = {
			richText: [{ text: row.value, font: { name: 'Segoe UI' } }]
		};
	});
}

type Row = {
    indentation: number,
    value: string
}

const splitRows = (str: string): Row[] => {
	const rows = str.split('\n');
	const res = [];
	for (const row of rows) {
		res.push({
			indentation: getIndentation(row),
			value: row.trim()
		});
	}
	return res;
};

const getIndentation = (str: string) => {
	let spaces = 0;
	for (const char of str) {
		if (char != ' ') break;
		spaces++;
	}
	return Math.floor(spaces / 4);
};

type RowTree = {
    value: string,
    content?: RowTree[]
}

const closureKeywords: {[key: string]: string[]} = {
	"INIZIO": ["FINE"],
	"ALLORA": ["FINE-SE", "ALTRIMENTI"],
	"ALTRIMENTI": ["FINE-SE"],
	"FINCHE'": ["FINE-RIPETI"]
}

const isClosureOf = (str: string, startKeyword: string) => {
	for (const c of closureKeywords[startKeyword]) {
		if (str.trim().endsWith(c)) return true;
	}
	return false;
}

export const getRowTree = (code: string, startKeyword="INIZIO"): RowTree[] => {
	const rows = code.split('\n');
	
	const res = expandTree(rows, {i: 0});
	return res;
}

const expandTree = (rows: string[], index: {i: number}, startKeyword?: string): RowTree[] => {
	const res = [];
	for (; index.i < rows.length; index.i++) {
		const row = rows[index.i];

		// Check if the code block is closed
		if (startKeyword && isClosureOf(row, startKeyword)) return res;

		// Check if there is a new code block
		let startsWithKeyword = false;
		for (const startKeyword of Object.keys(closureKeywords)) {
			if (row.trim().startsWith(startKeyword)) {
				startsWithKeyword = true;
				index.i++;
				res.push({
					value: row.trim(),
					content: expandTree(rows, index, startKeyword)
				});
				index.i--;
			}
		}
		// Normal line
		if (!startsWithKeyword) {	
			res.push({
				value: row.trim()
			});
		}
	}
	return res;
}
