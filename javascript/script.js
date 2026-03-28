console.log("🚀 Motor Brasil IA: Sistema via Proxy Vercel Ativado");

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
            statusMsg.innerHTML = "✅ Arquivo pronto para conversão.";
        }
    });

    convertBtn.addEventListener('click', async function() {
        const file = fileInput.files[0];
        if (!file) return;

        console.log("🖱️ Botão clicado! Enviando para API Vercel...");
        statusMsg.innerHTML = "⏳ <b>Aquecendo motor...</b> (Isso pode levar 15-20 segundos)";
        
        convertBtn.disabled = true;
        downloadArea.style.display = 'none';

        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = async function() {
            const base64Data = reader.result.split(',')[1];

            try {
                console.log("📡 Chamando a ponte segura: /api/convert-office");
                
                const response = await fetch('/api/convert-office', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: file.name,
                        fileBase64: base64Data
                    })
                });

                // Se a Vercel retornar 504 ou 500, o catch vai capturar
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Erro do Servidor (${response.status})`);
                }

                const result = await response.json();

                console.log("✅ Sucesso! PDF gerado.");
                statusMsg.innerHTML = "🎉 <b>Conversão Concluída com Sucesso!</b>";
                downloadArea.style.display = 'block';
                
                fileLink.href = `data:application/pdf;base64,${result.pdfBase64}`;
                fileLink.download = result.filename;
                fileLink.innerText = "BAIXAR MEU PDF";

            } catch (error) {
                console.error("❌ ERRO NA PERÍCIA:", error.message);
                
                // Mensagem didática para os alunos
                statusMsg.innerHTML = `
                    <div style="color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 5px; border: 1px solid #ffeeba;">
                        <b>⚠️ Motor em Partida a Frio:</b><br>
                        O servidor gratuito estava dormindo. Acabamos de acordá-lo!<br>
                        <strong>Aguarde 5 segundos e clique no botão novamente.</strong>
                    </div>
                `;
                convertBtn.disabled = false;
            }
        };
    });
});