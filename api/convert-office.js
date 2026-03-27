export default async function handler(req, res) {
    // ⚠️ CERTIFIQUE-SE DE QUE ESTE É O SEU LINK ATUAL DO RENDER
    const RENDER_URL = "https://brasil-ia-converter.onrender.com/forms/libreoffice/convert";

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    try {
        const { fileBase64, filename } = req.body;
        const buffer = Buffer.from(fileBase64, 'base64');
        
        const formData = new FormData();
        // O Gotenberg exige que o campo se chame 'files'
        const fileBlob = new Blob([buffer]);
        formData.append('files', fileBlob, filename);

        console.log("📡 Encaminhando para o Render...");

        const response = await fetch(RENDER_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro no motor: ${response.status}`);
        }

        const pdfBuffer = await response.arrayBuffer();
        
        res.status(200).json({ 
            pdfBase64: Buffer.from(pdfBuffer).toString('base64'),
            filename: filename.replace(/\.[^/.]+$/, "") + ".pdf" 
        });

    } catch (error) {
        console.error("ERRO:", error.message);
        res.status(500).json({ error: "O motor está aquecendo. Tente clicar novamente em 10 segundos!" });
    }
}