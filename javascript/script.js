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
            statusMsg.innerText = "";
            downloadArea.style.display = 'none';
        }
    });

    convertBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;

        convertBtn.disabled = true;
        statusMsg.innerText = "⏳ Criando ordem de conversão...";
        downloadArea.style.display = 'none';

        try {
            // 1. Solicita o Job e os dados de upload para a nossa API
            const authRes = await fetch('/api/convert-office', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name })
            });

            const jobData = await authRes.json();
            if (!authRes.ok) throw new Error(jobData.error || "Erro ao criar tarefa");

            // 2. Faz o upload DIRETO para evitar o limite de 4.5MB da Vercel
            statusMsg.innerText = "🚀 Enviando arquivo pesado para o motor...";
            
            const formData = new FormData();
            Object.entries(jobData.upload.parameters).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('file', file);

            const uploadRes = await fetch(jobData.upload.url, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error("Falha no envio do arquivo.");

            // 3. Sucesso! Mostra o link público de download
            statusMsg.innerHTML = `✅ <b>Arquivo enviado com sucesso!</b><br>O motor Brasil IA está gerando seu PDF.`;
            downloadArea.style.display = 'block';
            
            // Geramos o link de visualização pública que não exige login
            fileLink.href = `https://cloudconvert.com/public/jobs/${jobData.jobId}`;
            fileLink.innerText = "CLIQUE AQUI PARA ACESSAR SEU PDF";
            fileLink.target = "_blank"; // Abre em nova aba para segurança
            
            // Estilo para o botão de download
            fileLink.style.display = "inline-block";
            fileLink.style.marginTop = "15px";
            fileLink.style.padding = "12px 25px";
            fileLink.style.backgroundColor = "#28a745";
            fileLink.style.color = "white";
            fileLink.style.textDecoration = "none";
            fileLink.style.borderRadius = "8px";
            fileLink.style.fontWeight = "bold";

        } catch (error) {
            statusMsg.innerText = "❌ Erro: " + error.message;
            convertBtn.disabled = false;
        }
    });
});