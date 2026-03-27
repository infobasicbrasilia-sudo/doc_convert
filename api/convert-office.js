document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink');

    console.log("Brasil IA: Sistema operacional.");

    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${this.files[0].name}`;
            convertBtn.disabled = false;
            statusMsg.innerText = "";
        }
    });

    convertBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;

        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Lendo arquivo... Aguarde.";

        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = async function() {
            try {
                const base64File = reader.result.split(',')[1];
                statusMsg.innerText = "🚀 Enviando para o servidor Brasil IA...";

                const response = await fetch('/api/convert-office', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: base64File,
                        filename: file.name
                    })
                });

                // BLINDAGEM: Verifica se a resposta é JSON antes de tentar ler
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const result = await response.json();
                    
                    if (response.ok && result.jobId) {
                        statusMsg.innerHTML = "✅ <b>Sucesso!</b> Conversão iniciada.";
                        downloadArea.style.display = 'block';
                        fileLink.href = `https://cloudconvert.com/public/jobs/${result.jobId}`;
                    } else {
                        statusMsg.innerText = "❌ Erro na API: " + (result.error || "Falha na CloudConvert");
                    }
                } else {
                    // Se cair aqui, a Vercel mandou um erro em texto/HTML
                    const errorText = await response.text();
                    console.error("Erro bruto do servidor:", errorText);
                    statusMsg.innerText = "❌ Erro 500: O servidor da Vercel falhou.";
                }

            } catch (error) {
                statusMsg.innerText = "❌ Erro de conexão ou sintaxe.";
                console.error("Erro detalhado:", error);
            } finally {
                convertBtn.disabled = false;
            }
        };
    };
});