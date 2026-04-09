const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializa o cliente com configurações para evitar travamento
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', 
            '--disable-gpu'
        ]
    }
});

// Lista para controlar quem está em atendimento humano
const atendimentoHumano = new Set();

// =========================================================
// EVENTOS DE CONEXÃO E AUTENTICAÇÃO
// =========================================================

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escaneie o QR Code abaixo com seu WhatsApp:');
});

client.on('authenticated', () => {
    console.log('✅ QR Code escaneado e autenticado com sucesso! Carregando o WhatsApp...');
});

client.on('auth_failure', msg => {
    console.error('❌ Falha na autenticação:', msg);
});

client.on('ready', () => {
    console.log('🚁 Droninho da Academia de Pilotos Online e Pronto para decolar!');
});

// =========================================================
// EVENTO DE RECEBIMENTO DE MENSAGENS
// =========================================================

client.on('message', async (msg) => {
    // Ignora mensagens de status e de grupos
    if (msg.isStatus || msg.from.includes('@g.us')) return;

    const remetente = msg.from;
    const texto = msg.body.trim().toUpperCase(); // Transforma em maiúsculo para facilitar a leitura

    // =========================================================
    // LÓGICA DE SILENCIAR O BOT (HANDOFF)
    // =========================================================
    if (atendimentoHumano.has(remetente)) {
        // Se o instrutor digitar /BOT, o Droninho volta a responder esse cliente
        if (texto === '/BOT') {
            atendimentoHumano.delete(remetente);
            await client.sendMessage(remetente, "O Droninho voltou! 🤖 Digite *MENU* para ver as opções.");
        }
        return; // Bot ignora o restante das mensagens para não atrapalhar o instrutor
    }

    // =========================================================
    // FLUXO DE RESPOSTAS DO DRONINHO
    // =========================================================
    
    // Se digitar ATENDENTE ou 8, transfere e silencia o bot
    if (texto === 'ATENDENTE' || texto === '8') {
        let resposta8 = `estou te transferindo para o instrutor Jams. Ele vai te passar todos os detalhes para sua inscrição agora mesmo. Por favor, aguarde! 👍`;
        await client.sendMessage(remetente, resposta8);
        
        // Adiciona o cliente na lista de silêncio (atendimento humano)
        atendimentoHumano.add(remetente);
        return;
    }

    switch (texto) {
        case '1':
            await client.sendMessage(remetente, "❓ *Como funciona o curso?*\n\nNosso curso é intensivo e acontece em apenas 3 dias:\n📅 2 dias de teoria + 1 dia de prática (mão na massa!)");
            break;

        case '2':
            await client.sendMessage(remetente, "❓ *O que vou aprender?*\n\n📚 Você vai aprender do básico ao avançado:\n✔ Fundamentos completos sobre drones\n✔ Técnicas de voo profissional\n✔ Segurança e boas práticas\n✔ Configurações e controle do equipamento");
            break;

        case '3':
            await client.sendMessage(remetente, "❓ *Preciso ter drone?*\n\nNão! Você pode fazer o curso mesmo sem ter um drone. Nós temos os drones para você realizar os treinamentos e orientamos em tudo.");
            break;

        case '4':
            await client.sendMessage(remetente, "❓ *Onde será realizado o curso?*\n\n📍 *Localização:*\nAprove Marine em frente a Smoke\nAvenida Alípio Barbosa da Silva, 321, Pontal da Barra.\nCEP: 57010-810 Maceió - Alagoas");
            // Envia o link separado como solicitado
            await client.sendMessage(remetente, "https://share.google/QEW4Dn0nJX3nEtidY");
            break;

        case '5':
            await client.sendMessage(remetente, "❓ *Qual a duração total?*\n\n⏱ São 10 horas intensivas de treinamento.");
            break;

        case '6':
            await client.sendMessage(remetente, "❓ *O que está incluso?*\n\n🎓 Você recebe:\n✔ Certificado de conclusão\n✔ Camisa exclusiva\n✔ Boné personalizado");
            break;

        case '7':
            await client.sendMessage(remetente, "❓ *Vou sair preparado para trabalhar?*\n\n🔥 Com certeza! Você entra como aluno e sai pronto para atuar com:\n📸 Filmagens\n🔍 Inspeções\n🚧 Projetos profissionais");
            break;

        default:
            // MENSAGEM INICIAL (MENU PRINCIPAL)
            const menuPrincipal = `Olá! 👋 Seja bem-vindo(a)!\nEu sou o *Droninho* o mascote da *Academia de Pilotos*\nEscolha uma das opções abaixo para saber mais sobre o curso de drone 🚁👇\n\n1️⃣ Como funciona o curso?\n2️⃣ O que vou aprender?\n3️⃣ Preciso ter drone?\n4️⃣ Onde será realizado o curso?\n5️⃣ Duração do curso\n6️⃣ O que está incluso?\n7️⃣ Vou sair preparado para trabalhar?\n8️⃣ Como me inscrever e quanto custa?\n\n✍️ *Digite o número da opção desejada* que te respondemos automaticamente!\n\nSe preferir, digite *ATENDENTE* para falar com o nosso instrutor Jams`;
            await client.sendMessage(remetente, menuPrincipal);
            break;
    }
});

client.initialize();