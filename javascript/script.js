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

    convertBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;

        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Criando ordem de conversão...";

        try {
            // PASSO 1: Criar o Job e pegar autorização de upload
            const authRes = await fetch('/api/convert-office', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name })
            });

            const jobData = await authRes.json();
            if (!authRes.ok) throw new Error(jobData.error);

            // PASSO 2: Upload DIRETO para a CloudConvert
            statusMsg.innerText = "🚀 Enviando arquivo pesado...";
            
            const formData = new FormData();
            Object.entries(jobData.upload.parameters).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('file', file);

            const uploadRes = await fetch(jobData.upload.url, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error("Falha no upload.");

            statusMsg.innerHTML = `⚙️ <b>Arquivo recebido!</b><br>Convertendo para PDF agora...`;

            // PASSO 3: Link para o aluno baixar
            // Para simplificar a aula, mandamos para o status do Job público
            downloadArea.style.display = 'block';
            fileLink.href = `https://cloudconvert.com/public/jobs/${jobData.jobId}`;
            fileLink.innerText = "CLIQUE AQUI PARA BAIXAR O PDF";
            fileLink.classList.add('btn-ready'); // Adicione um estilo de destaque se quiser

        } catch (error) {
            statusMsg.innerText = "❌ Erro: " + error.message;
            convertBtn.disabled = false;
        }
    });
});