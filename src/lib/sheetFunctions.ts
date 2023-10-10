import exceljs from 'exceljs';
import { getRowTree, computeTreeSize } from './rowTree';
import type { RowTree } from './rowTree';
import { PSEUDOCODE_KW, STRUCTURED_PAPER_KW, getRichtextValue } from './linter';

const white = 'ffffffff';
const gray = 'ffb4b4b4';
const orange = 'fff5aa00';

export const toWorkbook = (title: string, author: string, code: string): exceljs.Workbook => {
	let workbook = new exceljs.Workbook();
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
	writeStructuredPaper(worksheet, nextStartingRow, code, title);

	return workbook;
};

/**
 * Writes Structured Paper
 * @param worksheet worksheet
 * @param startingRow starting row
 * @param code plain pseudo-code
 * @param title program title
 */
const writeStructuredPaper = (
	worksheet: exceljs.Worksheet,
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
	worksheet: exceljs.Worksheet,
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

const DESTRUCTURING_LEVEL_WIDTH = 8;
const ifBlockBuffer: { richText: exceljs.RichText[] }[] = []; // Used to store if conditions and write them later

/**
 * Destructures and writes a structured paper on a worksheet
 * @param worksheet worksheet
 * @param startingRow starting row
 * @param rowTree RowTree to write on the sheet
 * @param nesting (default=0) nesting level
 */
const destructureRowTree = (
	worksheet: exceljs.Worksheet,
	startingRow: number,
	rowTree: RowTree,
	nesting = 0
) => {
	// Block name
	const blockCentralCellY = Math.round(startingRow + rowTree.size / 2) - 1;
	if (rowTree.size && rowTree.content) {
		worksheet.getCell(blockCentralCellY, DESTRUCTURING_LEVEL_WIDTH * nesting + 1).value =
			'Nome Azione';
		if (rowTree.value == 'ALLORA' && ifBlockBuffer.length) {
			worksheet.getCell(blockCentralCellY + 1, DESTRUCTURING_LEVEL_WIDTH * nesting + 1).value =
				ifBlockBuffer.pop();
		}
	}

	// Variables
	const ifBlock = rowTree.value.startsWith('SE ');
	const elseBlock = rowTree.value == 'ALTRIMENTI';
	const untilBlock = rowTree.value.startsWith("FINCHE' ");
	const isORKeyword = rowTree.value == 'OR';
	const conditionBlockWithoutNesting =
		(rowTree.value == 'ALLORA' || rowTree.value == 'ALTRIMENTI') &&
		rowTree.content &&
		rowTree.content.length == 1;

	// Write block content
	if (ifBlock) {
		ifBlockBuffer.push(getRichtextValue(`(${rowTree.value})`, STRUCTURED_PAPER_KW));
	} else if (elseBlock) {
		worksheet.getCell(blockCentralCellY + 1, DESTRUCTURING_LEVEL_WIDTH * nesting + 1).value =
			getRichtextValue(`(ELSE)`, STRUCTURED_PAPER_KW);
	} else if (untilBlock) {
		worksheet.getCell(blockCentralCellY + 1, DESTRUCTURING_LEVEL_WIDTH * nesting + 1).value =
			getRichtextValue(
				`(UNTIL ${rowTree.value.substring("FINCHE' ".length)})`,
				STRUCTURED_PAPER_KW
			);
	}

	if (conditionBlockWithoutNesting && rowTree.content) {
		worksheet.getCell(startingRow, DESTRUCTURING_LEVEL_WIDTH * nesting + 1).value =
			getRichtextValue(rowTree.content[0].value, STRUCTURED_PAPER_KW);
	} else if (rowTree.content) {
		// Recursion / Nesting
		// Draw borders
		drawBlockParenthesis(
			worksheet,
			startingRow,
			DESTRUCTURING_LEVEL_WIDTH * (nesting + 1),
			rowTree.size - 1
		);

		// Write
		let nestedStartingRow = startingRow + 1;
		for (let block of rowTree.content) {
			destructureRowTree(worksheet, nestedStartingRow, block, nesting + 1);
			nestedStartingRow += block.size;
		}
	} else if (isORKeyword) {
		// Indent OR keyword
		worksheet.getCell(startingRow, DESTRUCTURING_LEVEL_WIDTH * nesting + 3).value =
			getRichtextValue(rowTree.value, STRUCTURED_PAPER_KW);
	} else if (rowTree.size != 0) {
		// Normal line
		worksheet.getCell(startingRow, DESTRUCTURING_LEVEL_WIDTH * nesting + 1).value =
			getRichtextValue(rowTree.value, STRUCTURED_PAPER_KW);
	}

	// Go to next row
	startingRow += rowTree.size;
};

const writePseudoCode = (worksheet: exceljs.Worksheet, startingRow: number, rows: Row[]) => {
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
		worksheet.getCell(startingRow + i, row.indentation + 1).value = getRichtextValue(
			row.value,
			PSEUDOCODE_KW
		);
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
