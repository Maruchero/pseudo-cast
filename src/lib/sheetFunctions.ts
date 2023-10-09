import { Workbook, type Worksheet } from 'exceljs';
import { getRowTree, computeTreeSize } from './rowTree';
import type { RowTree } from './rowTree';

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
	console.dir(getRowTree(code), { depth: null });
	writeStructuredPaper(worksheet, nextStartingRow, code, title);

	return workbook;
};

const writeStructuredPaper = (
	worksheet: Worksheet,
	startingRow: number,
	code: string,
	title: string
) => {
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
	const rows = getRowTree(code);
	const rowTree: RowTree = {
		value: title,
		size: computeTreeSize(rows) + 2,
		content: rows
	};
	worksheet.getCell(startingRow + 1, 1).value = title;
	destructureRowTree(worksheet, startingRow + 1, rowTree);
};

/**
 * Draws a parenthesis given the position and the height
 * @param worksheet worksheet where to draw the border
 * @param startingRow starting row
 * @param column column
 * @param height height of the parenthesis
 */
const drawBlockParenthesis = (
	worksheet: Worksheet,
	startingRow: number,
	column: number,
	height: number
) => {
	// worksheet.getCell(startingRow, DESTRUCTURE_SPAN * (nesting + 1)).value = rowTree.size;
	// Top cell
	worksheet.getCell(startingRow, column).border = {
		left: { style: 'thin' },
		top: { style: 'thin' }
	};
	// Middle cells
	for (let i = 1; i < height; i++) {
		worksheet.getCell(startingRow + i, column).border = { left: { style: 'thin' } };
	}
	// Bottom cell
	worksheet.getCell(startingRow + height, column).border = {
		left: { style: 'thin' },
		bottom: { style: 'thin' }
	};
	// Central point
	const centralY = startingRow + height / 2;
	worksheet.getCell(centralY, column - 1).border = { bottom: { style: 'thin' } };
};

const DESTRUCTURE_SPAN = 8;
const destructureRowTree = (
	worksheet: Worksheet,
	startingRow: number,
	rowTree: RowTree,
	nesting = 0
) => {
	// Block name
	if (rowTree.size && rowTree.content)
		worksheet.getCell(startingRow, DESTRUCTURE_SPAN * nesting + 1).value = 'Nome Azione';

	// Variables
	const ifBlock = rowTree.value.startsWith('SE');
	const elseBlock = rowTree.value.startsWith('ALTRIMENTI');
	const untilBlock = rowTree.value.startsWith("FINCHE'");
	const conditionBlockWithoutNesting =
		(rowTree.value.startsWith('ALLORA') || rowTree.value.startsWith('ALTRIMENTI')) &&
		rowTree.content &&
		rowTree.content.length == 1;

	// Write block content
	if (ifBlock) {
		worksheet.getCell(startingRow + 1, DESTRUCTURE_SPAN * nesting + 1).value = `(${rowTree.value})`;
	} else if (elseBlock) {
		worksheet.getCell(startingRow + 1, DESTRUCTURE_SPAN * nesting + 1).value = `(ELSE)`;
	} else if (untilBlock) {
		worksheet.getCell(
			startingRow + 1,
			DESTRUCTURE_SPAN * nesting + 1
		).value = `(UNTIL ${rowTree.value.substring("FINCHE' ".length)})`;
	}

	if (conditionBlockWithoutNesting && rowTree.content) {
		worksheet.getCell(startingRow, DESTRUCTURE_SPAN * nesting + 1).value = rowTree.content[0].value;
	} else if (rowTree.content) {
		// Recursion / Nesting
		// Draw borders
		drawBlockParenthesis(
			worksheet,
			startingRow,
			DESTRUCTURE_SPAN * (nesting + 1),
			rowTree.size - 1
		);

		// Write
		let nestedStartingRow = startingRow + 1;
		for (let block of rowTree.content) {
			destructureRowTree(worksheet, nestedStartingRow, block, nesting + 1);
			nestedStartingRow += block.size;
		}
	} else if (rowTree.size != 0) {
		worksheet.getCell(startingRow, DESTRUCTURE_SPAN * nesting + 1).value = rowTree.value;
	}

	// Go to next row
	startingRow += rowTree.size;
};

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
};

export type Row = {
	indentation: number;
	value: string;
};

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
