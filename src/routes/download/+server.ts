import { toWorkbook } from '$lib/sheetFunctions';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.formData();
	const title = data.get('titolo') as string;
	const author = data.get('autore') as string;
	const code = data.get('pseudocodifica') as string;

	// Convert to sheet
	const workbook = toWorkbook(title, author, code);
	
	const buffer = await workbook.xlsx.writeBuffer();
	const headers = {
		'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'Content-Disposition': 'attachment; filename=' + title + '.xlsx'
	};

	// return new Response(buffer, { headers });
	return new Response();
};
