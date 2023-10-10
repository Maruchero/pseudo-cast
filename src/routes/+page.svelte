<script lang="ts">
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
</script>

<!-- HTML -->
<h1>Pseudo Carta Strutturata</h1>

<form method="post" action="/download">
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
		bind:value={pseudocodifica}
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
