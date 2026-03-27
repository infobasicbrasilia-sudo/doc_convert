// No evento de clique do convertBtn:
statusMsg.innerText = "🚀 Enviando para o seu servidor particular...";
downloadArea.style.display = 'none';

// ... resto do código do fetch ...

if (response.ok) {
    statusMsg.innerHTML = "✅ <b>Conversão Concluída!</b>";
    downloadArea.style.display = 'block';
    fileLink.href = `data:application/pdf;base64,${result.pdfBase64}`;
    fileLink.download = result.filename;
    fileLink.innerText = "BAIXAR PDF AGORA";
}