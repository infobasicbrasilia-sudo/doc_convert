document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');

    console.log("Brasil IA: Sistema operacional.");

    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${this.files[0].name}`;
            convertBtn.disabled = false;
        }
    });

    convertBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;

        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Lendo arquivo... Aguarde.";

        try {
            // TRANSFORMA O ARQUIVO EM TEXTO (BASE64)
            const reader = new FileReader();
            reader.readAsDataURL(file);
            
            reader.onload = async function() {
                const base64File = reader.result.split(',')[1];
                statusMsg.innerText = "🚀 Enviando para o servidor Brasil IA...";

                // CHAMADA PARA A SUA API NA VERCEL
                const response = await fetch('/api/convert-office', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: base64File,
                        filename: file.name
                    })
                });

                const result = await response.json();

                if (response.ok && result.jobId) {
                    statusMsg.innerHTML = `✅ <b>Sucesso!</b> Job ID: ${result.jobId}<br>Aguarde a conversão final...`;
                    console.log("Job iniciado:", result.jobId);
                    // Aqui o arquivo já está na CloudConvert!
                    downloadArea.style.display = 'block';
                } else {
                    statusMsg.innerText = "❌ Erro na API: " + (result.error || "Falha desconhecida");
                    console.error("Detalhes do erro:", result);
                    convertBtn.disabled = false;
                }
            };
        } catch (error) {
            statusMsg.innerText = "❌ Erro de conexão.";
            console.error(error);
            convertBtn.disabled = false;
        }
    });
});