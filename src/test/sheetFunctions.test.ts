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
			{ value: 'SE VAR = true' },
			{ content: [{ value: 'Azione 1' }], value: 'ALLORA' },
			{ value: 'FINE-SE' }
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
			{ value: 'SE VAR = true' },
			{
				content: [{ value: 'Azione 1' }, { value: 'Azione 2' }, { value: 'Imposta VAR = false' }],
				value: 'ALLORA'
			},
			{ value: 'FINE-SE' }
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
					{ value: 'SE VAR = true' },
					{ value: 'ALLORA', content: [{ value: 'Azione 1' }, { value: 'Azione 2' }] },
					{ value: 'ALTRIMENTI', content: [{ value: 'Imposta VAR = false' }] },
					{ value: 'FINE-SE' }
				]
			},
			{ value: 'FINE' }
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
			{ value: 'RIPETI' },
			{ content: [{ value: 'Azione1' }, { value: 'Azione2' }], value: "FINCHE' EOF" },
			{ value: 'FINE-RIPETI' },
			{ value: 'Imposta END = true' }
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
			{ value: 'RIPETI' },
			{
				value: "FINCHE' CIAO = true",
				content: [
					{ value: 'Azione1' },
					{ value: 'Azione2' },
					{ value: '' },
					{ value: 'SE EOF AND TEMPERATURA > 10' },
					{ value: 'ALLORA', content: [{ value: 'Azione1' }] },
					{ value: 'ALTRIMENTI', content: [{ value: 'Azione2' }, { value: 'Azione3' }] },
					{ value: 'FINE-SE' }
				]
			},
			{ value: 'FINE-RIPETI' }
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
					{ value: 'Apertura File I/O' },
					{ value: 'Lettura fuori ciclo record INPUT' },
					{ value: '' },
					{ value: 'SE EOF' },
					{ value: 'ALLORA', content: [{ value: 'Stampa "Archivio Vuoto"' }] },
					{
						value: 'ALTRIMENTI',
						content: [
							{ value: 'RIPETI' },
							{
								value: "FINCHE' CIAO = true",
								content: [
									{ value: 'Azione1' },
									{ value: 'Azione2' },
									{ value: '' },
									{ value: 'SE EOF AND TEMPERATURA > 10' },
									{ value: 'ALLORA', content: [{ value: 'Azione1' }] },
									{ value: 'ALTRIMENTI', content: [{ value: 'Azione2' }, { value: 'Azione3' }] },
									{ value: 'FINE-SE' }
								]
							},
							{ value: 'FINE-RIPETI' }
						]
					},
					{ value: 'FINE-SE' },
					{ value: 'Chiusura file I/O' }
				]
			},
			{ value: 'FINE' }
		]);
	});
});

// TODO: missing RICHIAMA tests
