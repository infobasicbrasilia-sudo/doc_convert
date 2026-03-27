export default async function handler(req, res) {
    // 1. BUSCA A CHAVE NO COFRE DA VERCEL
    const API_KEY = process.env.CLOUDCONVERT_KEY;

    // VERIFICAÇÃO DE PERÍCIA: Se a chave não existir no painel da Vercel
    if (!API_KEY) {
        console.error("[Brasil IA] ERRO CRÍTICO: Variável CLOUDCONVERT_KEY não encontrada no servidor.");
        return res.status(500).json({ 
            error: "Configuração incompleta: Chave de API ausente na Vercel." 
        });
    }

    // 2. SEGURANÇA: Bloqueia métodos que não sejam POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    try {
        const { file, filename } = req.body;

        // 3. VALIDAÇÃO: Verifica se o arquivo chegou ao servidor
        if (!file || !filename) {
            return res.status(400).json({ error: 'Arquivo ou nome do arquivo não recebido.' });
        }

        console.log(`[Brasil IA] Motor acionado para: ${filename}`);

        // 4. CHAMADA À API DA CLOUDCONVERT
        const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY, // A chave deve ser: Bearer [TOKEN]
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

        // 5. RESPOSTA AO FRONTEND
        if (response.ok && data.data && data.data.id) {
            console.log(`[Brasil IA] Sucesso! Job ID gerado: ${data.data.id}`);
            return res.status(200).json({ jobId: data.data.id });
        } else {
            // Se cair aqui, a CloudConvert recusou o crachá (Token)
            console.error("[Brasil IA] A CloudConvert negou o acesso:", data);
            return res.status(response.status).json({ 
                error: data.message || "Erro na autenticação com a CloudConvert.",
                details: data.errors || {}
            });
        }

    } catch (error) {
        // Erro catastrófico de rede ou código
        console.error("[Brasil IA] Falha crítica no servidor:", error.message);
        return res.status(500).json({ 
            error: "Erro interno no servidor Brasil IA.",
            details: error.message 
        });
    }
}