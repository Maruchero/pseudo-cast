<script lang="ts">
	import { text } from '@sveltejs/kit';

	let pseudocodifica: string;
	// pseudocodifica = `INIZIO
	// Apertura File I/O
	// Lettura fuori ciclo record INPUT

	// SE EOF
	// ALLORA
	//     Stampa "Archivio Vuoto"
	// ALTRIMENTI
	//     RIPETI
	//     FINCHE' CIAO = true
	//         Azione1
	//         Azione2

	//         SE EOF AND TEMPERATURA > 10
	//         ALLORA
	//             Azione1
	//         ALTRIMENTI
	//             Azione2
	//             Azione3
	//         FINE-SE
	//     FINE-RIPETI
	// FINE-SE
	// Chiusura file I/O
	// FINE`;

	let titolo: string;
	// titolo = 'Test';

	let author: string;
	// author = "Garonzi Marcello";
	let textarea: HTMLTextAreaElement;

	const keydownListener = (e: KeyboardEvent) => {
		const cursorPosition = textarea.selectionStart;
		console.log(cursorPosition);

		let discanceFromLineStart = 0;
		while (
			cursorPosition - discanceFromLineStart > 0 &&
			pseudocodifica[cursorPosition - discanceFromLineStart] != '\n'
		) discanceFromLineStart++;
		if (pseudocodifica[cursorPosition - discanceFromLineStart] == '\n') discanceFromLineStart--;

		if (e.key == 'Tab') {
			e.preventDefault();
			let spacesToInsert = discanceFromLineStart % 4 == 0 ? 4 : 0;
			while (discanceFromLineStart % 4 != 0) {
				spacesToInsert++;
				discanceFromLineStart++;
			}
			// Insert spaces
			pseudocodifica = pseudocodifica.substring(0, cursorPosition) + ' '.repeat(spacesToInsert) + pseudocodifica.substring(cursorPosition);
		}
	};
</script>

<!-- HTML -->
<h1>Pseudo Carta Strutturata</h1>

<form method="post" action="/download">
	<div class="badges">
		<div class="badge">v0.0.2</div>
		<div class="badge">
			IT
			<img src="flag-italy.png" alt="" style="border-radius: 2px; height: 1em;" />
		</div>
		<a class="badge" href="https://github.com/Maruchero/pseudo-cast" target="_blank">
			<img src="github.svg" alt="" />
		</a>
	</div>

	<img src="/user.png" alt="" />
	<input type="text" name="autore" placeholder="Autore" bind:value={author} />
	<img src="/rename.png" alt="" />
	<input type="text" name="titolo" placeholder="Titolo" bind:value={titolo} />
	<img src="/code.png" alt="" />
	<textarea
		name="pseudocodifica"
		cols="30"
		rows="20"
		placeholder="Pseudo-codice"
		bind:this={textarea}
		bind:value={pseudocodifica}
		on:keydown={keydownListener}
	/>
	<span class="empty" />

	<div class="submit-button">
		<img src="/excel-icon.svg" alt="" />
		<button type="submit"> Genera Carta Strutturata </button>
	</div>
</form>

<!-- STYLE -->
<style>
	:global(body) {
		margin: 0;
		font-family: 'Segoe UI', 'Calibri', sans-serif;

		display: flex;
		flex-direction: column;
	}

	.badges {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;

		padding: 10px;
		display: flex;
		gap: 10px;

		display: flex;
		justify-content: end;
	}

	.badge {
		display: flex;
		align-items: center;
		padding: 3px 7px;
		gap: 7px;

		border-radius: 5px;
		background: #eee;
	}

	.badge > img {
		height: 1.5em;
		overflow: hidden;
		display: block;
	}

	h1 {
		text-align: center;
		padding-left: 10px;
	}

	form {
		width: 100%;
		max-width: 100vh;
		margin: auto;

		padding: 10px;
		display: grid;
		grid-template-columns: max-content 1fr;
		grid-column-gap: 10px;
		grid-row-gap: 10px;
		/* grid-auto-flow: column; */
	}

	form > img {
		margin-top: 0.35em;
		display: block;
		height: 1.3em;
	}

	input {
		box-sizing: border-box;
		width: 100%;
		margin-bottom: 5px;
		font-family: inherit;
		font-size: inherit;

		border-radius: 7px;
		padding: 5px 10px;
		border: none;
		background: #f0f0f0;
	}

	textarea {
		box-sizing: border-box;
		width: 100%;
		font-family: 'Source Code Pro';
		font-size: inherit;
		text-wrap: nowrap;

		resize: vertical;

		border-radius: 7px;
		padding: 5px 10px;
		border: none;
		background: #f0f0f0;
	}

	.submit-button {
		justify-self: center;

		display: flex;
		align-items: center;
		gap: 10px;
	}

	button {
		cursor: pointer;

		border-radius: 5px;
		padding: 5px 10px;

		border: none;
		background: rgb(56, 180, 73);

		font-family: inherit;
		font-weight: 600;
		font-size: inherit;
		color: #fff;
	}

	.submit-button > img {
		display: block;
		height: 1.5em;
		filter: drop-shadow(0 0 7px #fff9);
	}
</style>
