<script lang="ts">
	let pseudocodifica: string;
// 	pseudocodifica = `RIPETI
// FINCHE' CIAO = true
//     Azione1
//     Azione2

//     SE EOF AND TEMPERATURA > 10
//     ALLORA
//         Azione1
//     ALTRIMENTI
//         Azione2
//         Azione3
//     FINE-SE
// FINE-RIPETI`;
pseudocodifica = `Imposta var = 0
SE var < 4
ALLORA
    Azione1
    Azione2
ALTRIMENTI
    Azione3
FINE-SE`;

	let titolo: string;
	titolo = 'Test';

    let author: string;
    author = "Garonzi Marcello";
</script>

<!-- HTML -->
<h1>Pseudo-Carta-Strutturata</h1>

<form method="post" action="/download">
	<input type="text" name="autore" placeholder="Autore" bind:value={author} />
	<input type="text" name="titolo" placeholder="Titolo" bind:value={titolo} />
	<textarea name="pseudocodifica" cols="30" rows="20" bind:value={pseudocodifica} />
	<button type="submit">Genera Carta Strutturata</button>
</form>

<!-- STYLE -->
<style>
	input {
		box-sizing: border-box;
		width: 100%;
		margin-bottom: 5px;
        font-family: inherit;
	}

	textarea {
		box-sizing: border-box;
		width: 100%;
        font-family: inherit;
	}
</style>
