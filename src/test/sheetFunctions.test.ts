import { describe, it, expect } from 'vitest';
import { getRowTree } from '$lib/sheetFunctions';

describe('getRowTree test with condition', () => {
	/**
	 * tests with a simple condition
	 */
	it('tests with a simple condition', () => {
		const res = getRowTree(
			`SE VAR = true
ALLORA
    Azione 1
FINE-SE`
		);

		expect(res).toStrictEqual([
			{ value: 'SE VAR = true', size: 0 },
			{ content: [{ value: 'Azione 1', size: 1 }], value: 'ALLORA', size: 2 },
			{ value: 'OR', size: 1 },
			{ content: [{ value: 'SKIP', size: 1 }], value: 'ALTRIMENTI', size: 2 },
			{ value: 'FINE-SE', size: 0 }
		]);
	});

	/**
	 * tests with a multiline condition
	 */
	it('tests with a multiline condition', () => {
		const res = getRowTree(
			`SE VAR = true
ALLORA
    Azione 1
    Azione 2
    Imposta VAR = false
FINE-SE`
		);

		expect(res).toStrictEqual([
			{ value: 'SE VAR = true', size: 0 },
			{
				content: [
					{ value: 'Azione 1', size: 1 },
					{ value: 'Azione 2', size: 1 },
					{ value: 'Imposta VAR = false', size: 1 }
				],
				value: 'ALLORA',
				size: 5
			},
			{ value: 'OR', size: 1 },
			{ content: [{ value: 'SKIP', size: 1 }], value: 'ALTRIMENTI', size: 2 },
			{ value: 'FINE-SE', size: 0 }
		]);
	});

	/**
	 * tests with a simple if-else condition
	 */
	it('tests with a simple if-else condition', () => {
		const res = getRowTree(
			`INIZIO
    SE VAR = true
    ALLORA
        Azione 1
    ALTRIMENTI
        Imposta VAR = false
    FINE-SE
FINE`
		);

		expect(res).toStrictEqual([
			{
				value: 'INIZIO',
				content: [
					{ value: 'SE VAR = true', size: 0 },
					{ value: 'ALLORA', content: [{ value: 'Azione 1', size: 1 }], size: 2 },
					{ value: 'OR', size: 1 },
					{ value: 'ALTRIMENTI', content: [{ value: 'Imposta VAR = false', size: 1 }], size: 2 },
					{ value: 'FINE-SE', size: 0 }
				], size: 7
			},
			{ value: 'FINE', size: 0 }
		]);
	});
});

describe('getRowTree test with cycle', () => {
	/**
	 * tests with a simple cycle
	 */
	it('tests with a simple cycle', () => {
		const res = getRowTree(
			`RIPETI
FINCHE' EOF
    Azione1
    Azione2
FINE-RIPETI
Imposta END = true`
		);

		expect(res).toStrictEqual([
			{ value: 'RIPETI', size: 0 },
			{ content: [{ value: 'Azione1', size: 1 }, { value: 'Azione2', size: 1 }], value: "FINCHE' EOF", size: 4 },
			{ value: 'FINE-RIPETI', size: 0 },
			{ value: 'Imposta END = true', size: 1 }
		]);
	});
});

describe('getRowTree test with full program', () => {
	/**
	 * tests with a small program
	 */
	it('tests with a small program', () => {
		const res = getRowTree(
			`RIPETI
FINCHE' CIAO = true
    Azione1
    Azione2

    SE EOF AND TEMPERATURA > 10
    ALLORA
        Azione1
    ALTRIMENTI
        Azione2
        Azione3
    FINE-SE
FINE-RIPETI`
		);

		expect(res).toStrictEqual([
			{ value: 'RIPETI', size: 0 },
			{
				value: "FINCHE' CIAO = true",
				content: [
					{ value: 'Azione1', size: 1 },
					{ value: 'Azione2', size: 1 },
					{ value: '', size: 1 },
					{ value: 'SE EOF AND TEMPERATURA > 10', size: 0 },
					{ value: 'ALLORA', content: [{ value: 'Azione1', size: 1 }], size: 2 },
					{ value: 'OR', size: 1 },
					{ value: 'ALTRIMENTI', content: [{ value: 'Azione2', size: 1 }, { value: 'Azione3', size: 1 }], size: 4 },
					{ value: 'FINE-SE', size: 0 }
				], size: 12
			},
			{ value: 'FINE-RIPETI', size: 0 }
		]);
	});

	/**
	 * tests with a medium size program
	 */
	it('tests with a medium size program', () => {
		const res = getRowTree(
			`INIZIO
Apertura File I/O
Lettura fuori ciclo record INPUT

SE EOF
ALLORA
	Stampa "Archivio Vuoto"
ALTRIMENTI
	RIPETI
	FINCHE' CIAO = true
		Azione1
		Azione2

		SE EOF AND TEMPERATURA > 10
		ALLORA
			Azione1
		ALTRIMENTI
			Azione2
			Azione3
		FINE-SE
	FINE-RIPETI
FINE-SE
Chiusura file I/O
FINE`
		);

		expect(res).toStrictEqual([
			{
				value: 'INIZIO',
				content: [
					{ value: 'Apertura File I/O', size: 1 },
					{ value: 'Lettura fuori ciclo record INPUT', size: 1 },
					{ value: '', size: 1 },
					{ value: 'SE EOF', size: 0 },
					{ value: 'ALLORA', content: [{ value: 'Stampa "Archivio Vuoto"', size: 1 }], size: 2 },
					{ value: 'OR', size: 1 },
					{
						value: 'ALTRIMENTI',
						content: [
							{ value: 'RIPETI', size: 0 },
							{
								value: "FINCHE' CIAO = true",
								content: [
									{ value: 'Azione1', size: 1 },
									{ value: 'Azione2', size: 1 },
									{ value: '', size: 1 },
									{ value: 'SE EOF AND TEMPERATURA > 10', size: 0 },
									{ value: 'ALLORA', content: [{ value: 'Azione1', size: 1 }], size: 2 },
									{ value: 'OR', size: 1 },
									{ value: 'ALTRIMENTI', content: [{ value: 'Azione2', size: 1 }, { value: 'Azione3', size: 1 }], size: 4 },
									{ value: 'FINE-SE', size: 0 }
								], size: 12
							},
							{ value: 'FINE-RIPETI', size: 0 }
						], size: 14
					},
					{ value: 'FINE-SE', size: 0 },
					{ value: 'Chiusura file I/O', size: 1 }
				], size: 23
			},
			{ value: 'FINE', size: 0 }
		]);
	});
});

// TODO: missing SCEGLI PER
// TODO: missing RICHIAMA tests
