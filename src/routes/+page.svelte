<script lang="ts">
	import styles from './+page.css';

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
		<button type="submit">
			Genera Carta Strutturata
		</button>
	</div>
</form>
