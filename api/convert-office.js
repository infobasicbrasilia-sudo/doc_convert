export default async function handler(req, res) {
    // ⚠️ A URL PRECISA TERMINAR EXATAMENTE ASSIM
    const RENDER_URL = "https://brasil-ia-motor.onrender.com/forms/libreoffice/convert";

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { fileBase64, filename } = req.body;
        
        // Convertendo o Base64 que veio do navegador em um Buffer real
        const buffer = Buffer.from(fileBase64, 'base64');
        
        // Criando o formulário que o Gotenberg entende
        const formData = new FormData();
        const fileBlob = new Blob([buffer]);
        
        // O SEGREDO: O Gotenberg exige o nome do campo como 'files'
        formData.append('files', fileBlob, filename);

        console.log(`📡 Enviando ${filename} para o motor oficial...`);

        const response = await fetch(RENDER_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Resposta do Motor:", errorText);
            throw new Error(`Erro do Motor: ${response.status}`);
        }

        const pdfBuffer = await response.arrayBuffer();
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

        console.log("✅ PDF gerado com sucesso pela ponte!");

        res.status(200).json({ 
            pdfBase64: pdfBase64, 
            filename: filename.replace(/\.[^/.]+$/, "") + ".pdf" 
        });

    } catch (error) {
        console.error("❌ ERRO NA PONTE:", error.message);
        res.status(500).json({ error: "O motor está ocupado ou aquecendo. Tente novamente agora!" });
    }
}