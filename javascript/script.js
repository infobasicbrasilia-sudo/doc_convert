export default async function handler(req, res) {
    // 1. BUSCA O TOKEN DO COFRE (Configurado como CLOUDCONVERT_KEY na Vercel)
    const API_KEY = process.env.CLOUDCONVERT_KEY;

    if (!API_KEY) {
        console.error("[Brasil IA] ERRO: Chave de API não configurada no painel da Vercel.");
        return res.status(500).json({ error: "Configuração de servidor ausente." });
    }

    // 2. BLOQUEIO DE SEGURANÇA
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    try {
        const { file, filename } = req.body;

        // 3. VALIDAÇÃO DE DADOS
        if (!file || !filename) {
            return res.status(400).json({ error: 'Dados do arquivo incompletos.' });
        }

        console.log(`[Brasil IA] Iniciando conversão de: ${filename}`);

        // 4. CHAMADA À CLOUDCONVERT (USANDO O TOKEN 'doc_convert')
        const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY, // Deve conter "Bearer eyJ..."
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

        // 5. RESPOSTA PARA O FRONTEND
        if (response.ok && data.data && data.data.id) {
            return res.status(200).json({ jobId: data.data.id });
        } else {
            console.error("[CloudConvert Reject]", data);
            return res.status(response.status).json({ 
                error: data.message || "A API recusou o processamento.",
                details: data.errors || {}
            });
        }

    } catch (error) {
        console.error("[Server Crash]", error);
        return res.status(500).json({ 
            error: "Erro interno no servidor Brasil IA.",
            details: error.message 
        });
    }
}