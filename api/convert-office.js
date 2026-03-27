export default async function handler(req, res) {
    // Busca a chave das variáveis de ambiente da Vercel (Segurança)
    // Se ainda não setou na Vercel, pode manter a string "Bearer ..." aqui temporariamente
    const API_KEY = process.env.CLOUDCONVERT_KEY || "CLOUDCONVERT_KEY";

    // 1. Bloqueia métodos que não sejam POST Bearer SEU_TOKEN_AQUI
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    try {
        const { file, filename } = req.body;

        // 2. Validação de dados (Evita erro 500 por falta de arquivo)
        if (!file || !filename) {
            return res.status(400).json({ error: 'Arquivo ou nome do arquivo ausente.' });
        }

        console.log(`Iniciando conversão para: ${filename}`);

        // 3. Chamada para a CloudConvert
        const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "tasks": {
                    "import-1": { 
                        "operation": "import/base64", 
                        "file": file, 
                        "filename": filename 
                    },
                    "task-1": { 
                        "operation": "convert", 
                        "input": "import-1", 
                        "output_format": "pdf" 
                    },
                    "export-1": { 
                        "operation": "export/url", 
                        "input": "task-1" 
                    }
                }
            })
        });

        const data = await response.json();

        // 4. Resposta para o seu Frontend (script.js)
        if (response.ok && data.data && data.data.id) {
            return res.status(200).json({ 
                jobId: data.data.id,
                status: "processing" 
            });
        } else {
            console.error("Erro CloudConvert:", data);
            return res.status(response.status).json({ 
                error: data.message || "Erro na API CloudConvert",
                details: data.errors || {}
            });
        }

    } catch (error) {
        console.error("Erro no Servidor:", error);
        return res.status(500).json({ error: "Erro interno no servidor: " + error.message });
    }
}