import { describe, it, expect } from 'vitest';
import { getRowTree } from '$lib/sheetFunctions';

describe('getRowTree test with condition', () => {
	it('tests with a simple condition', () => {
		const res = getRowTree(
			`SE VAR = true
ALLORA
    Azione 1
FINE-SE`
		);

		expect(res).toStrictEqual([
			{ value: 'SE VAR = true', size: 1 },
			{ content: [{ value: 'Azione 1', size: 1 }], value: 'ALLORA', size: 2 },
			{ content: [{ value: 'SKIP', size: 1 }], value: 'ALTRIMENTI', size: 2 },
			{ value: 'FINE-SE', size: 0 }
		]);
	});

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
			{ value: 'SE VAR = true', size: 1 },
			{
				content: [
					{ value: 'Azione 1', size: 1 },
					{ value: 'Azione 2', size: 1 },
					{ value: 'Imposta VAR = false', size: 1 }
				],
				value: 'ALLORA',
				size: 3
			},
			{ content: [{ value: 'SKIP', size: 1 }], value: 'ALTRIMENTI', size: 2 },
			{ value: 'FINE-SE', size: 0 }
		]);
	});

	it('tests with a complete condition', () => {
		const res = getRowTree(
			`INIZIO
    SE VAR = true
    ALLORA
        Azione 1
        Azione 2
    ALTRIMENTI
        Imposta VAR = false
    FINE-SE
FINE`
		);

		expect(res).toStrictEqual([
			{
				value: 'INIZIO',
				content: [
					{ value: 'SE VAR = true', size: 1 },
					{ value: 'ALLORA', content: [{ value: 'Azione 1', size: 1 }, { value: 'Azione 2', size: 1 }], size: 2 },
					{ value: 'ALTRIMENTI', content: [{ value: 'Imposta VAR = false', size: 1 }], size: 2 },
					{ value: 'FINE-SE', size: 0 }
				], size: 5
			},
			{ value: 'FINE', size: 0 }
		]);
	});
});

describe('getRowTree test with cycle', () => {
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
			{ value: 'RIPETI', size: 1 },
			{ content: [{ value: 'Azione1', size: 1 }, { value: 'Azione2', size: 1 }], value: "FINCHE' EOF", size: 2 },
			{ value: 'FINE-RIPETI', size: 0 },
			{ value: 'Imposta END = true', size: 1 }
		]);
	});
});

describe('getRowTree test with full program', () => {
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
			{ value: 'RIPETI', size: 1 },
			{
				value: "FINCHE' CIAO = true",
				content: [
					{ value: 'Azione1', size: 1 },
					{ value: 'Azione2', size: 1 },
					{ value: '', size: 1 },
					{ value: 'SE EOF AND TEMPERATURA > 10', size: 1 },
					{ value: 'ALLORA', content: [{ value: 'Azione1', size: 1 }], size: 2 },
					{ value: 'ALTRIMENTI', content: [{ value: 'Azione2', size: 1 }, { value: 'Azione3', size: 1 }], size: 2 },
					{ value: 'FINE-SE', size: 0 }
				], size: 8
			},
			{ value: 'FINE-RIPETI', size: 0 }
		]);
	});

	it('tests with a medium program', () => {
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
					{ value: 'SE EOF', size: 1 },
					{ value: 'ALLORA', content: [{ value: 'Stampa "Archivio Vuoto"', size: 1 }], size: 2 },
					{
						value: 'ALTRIMENTI',
						content: [
							{ value: 'RIPETI', size: 1 },
							{
								value: "FINCHE' CIAO = true",
								content: [
									{ value: 'Azione1', size: 1 },
									{ value: 'Azione2', size: 1 },
									{ value: '', size: 1 },
									{ value: 'SE EOF AND TEMPERATURA > 10', size: 1 },
									{ value: 'ALLORA', content: [{ value: 'Azione1', size: 1 }], size: 2 },
									{ value: 'ALTRIMENTI', content: [{ value: 'Azione2', size: 1 }, { value: 'Azione3', size: 1 }], size: 2 },
									{ value: 'FINE-SE', size: 0 }
								], size: 8
							},
							{ value: 'FINE-RIPETI', size: 0 }
						], size: 9
					},
					{ value: 'FINE-SE', size: 0 },
					{ value: 'Chiusura file I/O', size: 1 }
				], size: 16
			},
			{ value: 'FINE', size: 0 }
		]);
	});
});

// TODO: missing RICHIAMA tests
