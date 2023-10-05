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
	size: number,
    content?: RowTree[]
}

const closureKeywords: {[key: string]: string[]} = {
	"INIZIO": ["FINE"],
	"ALLORA": ["FINE-SE", "ALTRIMENTI"],
	"ALTRIMENTI": ["FINE-SE"],
	"FINCHE'": ["FINE-RIPETI"]
};
const closureKeywordsArray = Object.values(closureKeywords).flat();


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
	const res: RowTree[] = [];
	for (; index.i < rows.length; index.i++) {
		const row = rows[index.i];

		// Check if the code block is closed
		if (startKeyword && isClosureOf(row, startKeyword)) return res;

		// Check if there is a new code block
		let startsWithKeyword = false;
		const startKeywords = Object.keys(closureKeywords);
		for (const startKeyword of startKeywords) {
			if (row.trim().startsWith(startKeyword)) {
				// Starting of a sub-block
				startsWithKeyword = true;

				const value = row.trim();
				index.i++;
				const content = expandTree(rows, index, startKeyword);
				let size = content.reduce((sum, current) => sum + current.size, 0);
				if (value == "ALLORA" && size < 2) size = 2; 
				else if (value == "ALTRIMENTI" && size < 2) size = 2; 
				else size += 2;  // Span code block above and below

				res.push({
					value,
					content,
					size
				});

				// If 'SE' and not 'ALTRIMENTI' insert default 'SKIP' block
				if (rows[index.i].trim().endsWith("FINE-SE") && value == "ALLORA") {
					res.push({
						value: "ALTRIMENTI",
						content: [{ value: "SKIP", size: 1 }],
						size: 2
					});
				}
				index.i--;  // Include also 'FINE-...' keyword

				break;
			}
		}

		// Normal line
		if (!startsWithKeyword) {	
			let value = row.trim();
			let size = 1;
			if (closureKeywordsArray.includes(value.split(' ')[0])) size = 0; // It's a closure keyword
			else if (value.startsWith('SE') || value.startsWith('RIPETI')) size = 0;
			res.push({
				value,
				size
			});
		}
	}
	return res;
}
