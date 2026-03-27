document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink');

    console.log("Brasil IA: Painel de controle carregado.");

    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${file.name}`;
            convertBtn.disabled = false;
            statusMsg.innerText = "";
            downloadArea.style.display = 'none';
        }
    });

    convertBtn.addEventListener('click', function() {
        const file = fileInput.files[0];
        if (!file) return;

        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Processando... Aguarde.";

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async function() {
            try {
                const base64File = reader.result.split(',')[1];
                statusMsg.innerText = "🚀 Enviando para o motor Brasil IA...";

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
                    statusMsg.innerHTML = `✅ <b>Sucesso!</b> ID: ${result.jobId}`;
                    downloadArea.style.display = 'block';
                    fileLink.href = `https://cloudconvert.com/public/jobs/${result.jobId}`; 
                } else {
                    throw new Error(result.error || "Erro na conversão.");
                }

            } catch (error) {
                statusMsg.innerText = "❌ " + error.message;
                convertBtn.disabled = false;
            }
        };
    });
});