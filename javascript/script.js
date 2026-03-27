console.log("🚀 Motor Brasil IA: Sistema de Conexão Direta Ativado");

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameLabel = document.getElementById('fileName');
    const convertBtn = document.getElementById('convertBtn');
    const statusMsg = document.getElementById('status');
    const downloadArea = document.getElementById('downloadArea');
    const fileLink = document.getElementById('fileLink');

    // O SEU LINK DIRETO DO RENDER (Sem a Vercel no meio)
    const RENDER_DIRECT_URL = "https://brasil-ia-converter.onrender.com/forms/libreoffice/convert";

    fileInput.addEventListener('change', function() {
        if (this.files[0]) {
            fileNameLabel.innerHTML = `<b>Selecionado:</b> ${this.files[0].name}`;
            convertBtn.disabled = false;
        }
    });

    convertBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;

        console.log("🖱️ Botão clicado! Iniciando Conexão Direta com o Render...");
        statusMsg.innerHTML = "⏳ <b>Iniciando...</b> (O motor leva até 30s para ligar)";
        
        convertBtn.disabled = true;
        downloadArea.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('files', file, file.name);

            console.log("📡 Enviando arquivo diretamente para o Render...");
            
            // Aqui o navegador vai esperar o tempo que for preciso (sem o corte da Vercel)
            const response = await fetch(RENDER_DIRECT_URL, {
                method: 'POST',
                body: formData
            });

            console.log("📩 Resposta do Render recebida! Status:", response.status);

            if (response.ok) {
                const pdfBlob = await response.blob();
                const pdfUrl = URL.createObjectURL(pdfBlob);
                
                console.log("✅ Sucesso! PDF gerado localmente.");
                statusMsg.innerHTML = "✅ <b>Documento Convertido!</b>";
                downloadArea.style.display = 'block';
                
                fileLink.href = pdfUrl;
                fileLink.download = file.name.replace(/\.[^/.]+$/, "") + ".pdf";
                fileLink.innerText = "BAIXAR MEU PDF AGORA";
            } else {
                throw new Error("O servidor Render está ocupado ou ligando.");
            }

        } catch (error) {
            console.error("❌ ERRO:", error.message);
            statusMsg.innerHTML = "❌ <b>O motor está acordando...</b><br>Aguarde 10 segundos e clique em GERAR novamente.";
            convertBtn.disabled = false;
        }
    });
});