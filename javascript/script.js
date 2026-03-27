document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink');

    fileInput.addEventListener('change', function() {
        if (this.files[0]) {
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${this.files[0].name}`;
            convertBtn.disabled = false;
        }
    });

    // FUNÇÃO DE RASTREIO (Polling)
    async function checkStatus(jobId) {
        statusMsg.innerText = "⚙️ Convertendo... (Não feche esta página)";
        
        const interval = setInterval(async () => {
            try {
                // Consultamos o status do Job via URL pública
                const res = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobId}`, {
                    headers: { 'Authorization': 'Bearer SEU_TOKEN_AQUI_OU_VIA_API' } 
                });
                // Nota: Para segurança em aula, o ideal é o status passar pela sua API.
                // Mas vamos usar o link de exportação que a CloudConvert gera:
                
                statusMsg.innerText = "⏳ O motor Brasil IA está finalizando seu PDF...";
            } catch (e) { console.log("Aguardando..."); }
        }, 3000);
    }

    convertBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;

        convertBtn.disabled = true;
        statusMsg.innerText = "🚀 Enviando arquivo...";
        downloadArea.style.display = 'none';

        try {
            const authRes = await fetch('/api/convert-office', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const jobData = await authRes.json();
            if (!authRes.ok) throw new Error(jobData.error);

            const formData = new FormData();
            Object.entries(jobData.upload.parameters).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('file', file);

            const uploadRes = await fetch(jobData.upload.url, { method: 'POST', body: formData });
            if (!uploadRes.ok) throw new Error("Falha no envio.");

            // VITÓRIA: Em vez de abrir página, damos o link direto de espera
            statusMsg.innerHTML = `✅ <b>Upload 100%!</b><br>Seu PDF está sendo gerado.`;
            downloadArea.style.display = 'block';
            
            // Este link "Public" da CloudConvert tem um botão de download automático assim que termina
            fileLink.href = `https://cloudconvert.com/public/jobs/${jobData.jobId}`;
            fileLink.innerText = "CLIQUE AQUI PARA PEGAR SEU PDF";
            
            // DICA DE OURO: Abrir o link em uma nova aba para o aluno não perder o site
            fileLink.target = "_blank";

        } catch (error) {
            statusMsg.innerText = "❌ Erro: " + error.message;
            convertBtn.disabled = false;
        }
    });
});