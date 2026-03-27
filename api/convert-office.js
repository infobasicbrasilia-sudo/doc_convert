export default async function handler(req, res) {
    // 1. BUSCA A CHAVE EXCLUSIVAMENTE NO AMBIENTE DA VERCEL
    const API_KEY = process.env.CLOUDCONVERT_KEY;

    // SEGURANÇA: Se a chave não estiver no painel da Vercel, o código para aqui e avisa o erro
    if (!API_KEY) {
        console.error("[Brasil IA] ERRO: Variável CLOUDCONVERT_KEY não configurada.");
        return res.status(500).json({ 
            error: "Configuração de servidor incompleta (Chave ausente no cofre)." 
        });
    }

    // 2. Bloqueio de métodos não permitidos
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    try {
        const { file, filename } = req.body;

        // 3. Validação de dados recebidos
        if (!file || !filename) {
            return res.status(400).json({ error: 'Arquivo ou nome ausente.' });
        }

        console.log(`[Brasil IA] Iniciando tarefa para: ${filename}`);

        // 4. Conexão externa com a CloudConvert
        const response = await fetch('https://api.cloudconvert.com/v2/jobs', {
            method: 'POST',
            headers: {
                'Authorization': API_KEY, // O valor já deve vir com "Bearer ..." da Vercel
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "tasks": {
                    "import-1": { "operation": "import/base64", "file": file, "filename": filename },
                    "task-1": { "operation": "convert", "input": "import-1", "output_format": "pdf" },
                    "export-1": { "operation": "export/url", "input": "task-1" }
                }
            })
        });

        const data = await response.json();

        // 5. Retorno para o frontend
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
        return res.status(500).json({ error: "Erro interno no servidor Brasil IA." });
    }
}