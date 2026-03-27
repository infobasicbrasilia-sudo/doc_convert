export default async function handler(req, res) {
    // O SEU LINK DO RENDER
    const RENDER_URL = "https://brasil-ia-converter.onrender.com/forms/libreoffice/convert";

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { fileBase64, filename } = req.body;
        
        // Converte o Base64 para Buffer
        const buffer = Buffer.from(fileBase64, 'base64');
        
        const formData = new FormData();
        const fileBlob = new Blob([buffer]);
        formData.append('files', fileBlob, filename);

        console.log("📡 Enviando para o Render: " + filename);

        // Chamada ao Render com Timeout de 25 segundos (limite da Vercel)
        const response = await fetch(RENDER_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Render Error: ${response.status} - ${errorText}`);
        }

        const pdfBuffer = await response.arrayBuffer();
        const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

        console.log("✅ Conversão concluída com sucesso!");

        res.status(200).json({ 
            pdfBase64: pdfBase64,
            filename: filename.replace(/\.[^/.]+$/, "") + ".pdf" 
        });

    } catch (error) {
        console.error("❌ ERRO NA API:", error.message);
        res.status(500).json({ error: "O servidor demorou. Tente novamente: " + error.message });
    }
}