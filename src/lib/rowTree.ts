/**
 * TYPE
 */
export type RowTree = {
	value: string;
	size: number;
	content?: RowTree[];
};

/**
 * CLOSURE KEYWORDS
 */
const codeBlocksKeywords: { [key: string]: string[] } = {
	INIZIO: ['FINE'],
	ALLORA: ['FINE-SE', 'ALTRIMENTI'],
	ALTRIMENTI: ['FINE-SE'],
	"FINCHE'": ['FINE-RIPETI']
};
const closeKeywordsArray = Object.values(codeBlocksKeywords).flat();
const openKeywordsArray = Object.keys(codeBlocksKeywords);

/**
 * Checks if the row is a closure tag of an already opened tag
 * @param row row
 * @param openKeyword keyword that started the block
 * @returns boolean
 */
const rowClosesCodeBlock = (row: string, openKeyword: string) => {
	for (const c of codeBlocksKeywords[openKeyword]) {
		if (row.trim().endsWith(c)) return true;
	}
	return false;
};

/**
 * Converts a pseudo-code to a nested tree of rows
 * @param code pseudo-code to convert
 * @param startKeyword starting keyword of program
 * @returns row tree
 */
export const getRowTree = (code: string): RowTree[] => {
	const rows = code.split('\n');
	const res = getTree(rows);
	return res;
};

/**
 * Computes the size of the tree
 * @param rows tree of rows
 * @returns tree size
 */
const computeTreeSize = (rows: RowTree[]): number => {
	return rows.reduce((sum, current) => sum + current.size, 0);
};

/**
 * Adds spaces before and after the block
 * Applies a minimum size to if-else rows if they're a single row
 * @param keyword keyword to examinate
 * @param size computed block size
 * @returns new block size
 */
const getSpacedSize = (keyword: string, size: number) => {
	console.log(keyword == 'ALLORA', size < 2);
	if (keyword == 'ALLORA' && size < 2) return 2;
	if (keyword == 'ALTRIMENTI' && size < 2) return 2;
	return size + 2; // Span code block above and below
};

/**
 * If keyword == 'ALTRIMENTI' adds intermedium OR block
 * @param resultTree tree where to push the or block
 * @param keyword keyword to be checked
 */
const addOrToConditionBlock = (resultTree: RowTree[], keyword: string) => {
	// If 'ALTRIMENTI' add 'OR
	if (keyword == 'ALTRIMENTI') {
		resultTree.push({
			value: 'OR',
			size: 1
		});
	}
};

/**
 * Adds a ELSE-SKIP block where there's an IF block without an ELSE
 * @param blockOpeningRow row that opened the block
 * @param blockClosingRow row that closed the block
 * @param resultTree tree where to push the changes
 */
const addDefaultSkipBlock = (
	blockOpeningRow: string,
	blockClosingRow: string,
	resultTree: RowTree[]
) => {
	// If 'SE' and not 'ALTRIMENTI' insert default 'SKIP' block
	if (blockClosingRow.trim().endsWith('FINE-SE') && blockOpeningRow.trim() == 'ALLORA') {
		resultTree.push({ value: 'OR', size: 1 });
		resultTree.push({ value: 'ALTRIMENTI', content: [{ value: 'SKIP', size: 1 }], size: 2 });
	}
};

/**
 * Checks if a row is a block excluded from size counting
 * @param row row to analyze
 * @returns boolean excluded block
 */
const isExcludedBlock = (row: string): boolean => {
	if (closeKeywordsArray.includes(row.split(' ')[0])) return true; // It's a closure keyword
	if (row.startsWith('SE') || row.startsWith('RIPETI')) return true;
	return false;
};

/**
 * Explodes rows recursively to create a tree of nested code blocks
 * @param rows list of rows
 * @param index object with an attribute 'i' (for referenced paramenter)
 * @param openingKeyword starting keyword of the code block
 * @returns RowTree[]
 */
export const getTree = (
	rows: string[],
	index: { i: number } = { i: 0 },
	openingKeyword?: string
): RowTree[] => {
	const resultTree: RowTree[] = [];
	// let index.i = index.i;
	for (; index.i < rows.length; index.i++) {
		const row = rows[index.i];
		const value = row.trim();

		// Check if the code block is closed
		if (openingKeyword && rowClosesCodeBlock(row, openingKeyword)) return resultTree;

		// Check if there is a new code block
		let isACodeBlock = false;

		for (const openKeyword of openKeywordsArray) {
			if (value.startsWith(openKeyword)) {
				isACodeBlock = true;
				index.i++;

				// Starting of the sub-block
				const content = getTree(rows, index, openKeyword);
				const blockClosingRow = rows[index.i];
				let size = computeTreeSize(content);

				// Pre-checks
				size = getSpacedSize(value, size);
				addOrToConditionBlock(resultTree, value);

				// Push row
				resultTree.push({ value, content, size });

				// Post-checks
				addDefaultSkipBlock(row, blockClosingRow, resultTree);

				// Include also 'FINE-...' keyword
				// In this way the last checked row will be re-examinated
				index.i--;

				break;
			}
		}

		// Normal line
		if (!isACodeBlock) {
			let size = isExcludedBlock(value) ? 0 : 1;
			resultTree.push({ value, size });
		}
	}
	return resultTree;
};
