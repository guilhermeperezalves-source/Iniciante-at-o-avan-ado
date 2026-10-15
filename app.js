
"use strict";

(() => {
  const $ = (selector) => document.querySelector(selector);

  const authScreen = $("#auth-screen");
  const dashboard = $("#dashboard");
  const authForm = $("#auth-form");
  const authToggle = $("#auth-toggle");
  const authSubmit = $("#auth-submit");
  const authMessage = $("#auth-message");
  const authTitle = $("#auth-title");
  const authSubtitle = $("#auth-subtitle");
  const authSwitchText = $("#auth-switch-text");
  const authPassword = $("#auth-password");
  const logoutBtn = $("#logout-btn");

  let supabaseClient = null;
  let isSignup = false;
  let currentUser = null;
  let selectedAnswer = null;
  let currentQuestions = [];
  let questionIndex = 0;
  let answeredThisQuestion = false;
  let progress = {
    xp: 0,
    answered: 0,
    correct: 0,
    completed: []
  };

  const LEVEL_XP = 100;
  const MAX_LEVEL = 5;

  const modules = [
    { id: 1, level: 1, subject: "Matemática", title: "Porcentagem", icon: "％", description: "Porcentagens, descontos e aumentos." },
    { id: 2, level: 1, subject: "Matemática", title: "Razão e proporção", icon: "÷", description: "Grandezas e relações proporcionais." },
    { id: 3, level: 1, subject: "Matemática", title: "Regra de três", icon: "∝", description: "Problemas com grandezas." },
    { id: 4, level: 1, subject: "Matemática", title: "Estatística", icon: "▥", description: "Média, mediana e interpretação." },
    { id: 5, level: 1, subject: "Português", title: "Interpretação", icon: "Aa", description: "Leitura e compreensão de textos." },
    { id: 6, level: 2, subject: "Matemática", title: "Funções", icon: "ƒ", description: "Funções e gráficos." },
    { id: 7, level: 2, subject: "Matemática", title: "Geometria plana", icon: "△", description: "Áreas, perímetros e figuras." },
    { id: 8, level: 2, subject: "Matemática", title: "Geometria espacial", icon: "◇", description: "Volumes e áreas de sólidos." },
    { id: 9, level: 2, subject: "Física", title: "Cinemática", icon: "↗", description: "Movimento, velocidade e tempo." },
    { id: 10, level: 2, subject: "Biologia", title: "Ecologia", icon: "♧", description: "Ecossistemas e impactos ambientais." },
    { id: 11, level: 3, subject: "Química", title: "Estequiometria", icon: "⚗", description: "Cálculos e proporções químicas." },
    { id: 12, level: 3, subject: "Física", title: "Dinâmica", icon: "↔", description: "Forças e leis de Newton." },
    { id: 13, level: 3, subject: "Biologia", title: "Genética", icon: "⌘", description: "Hereditariedade e DNA." },
    { id: 14, level: 3, subject: "História", title: "Brasil Colônia", icon: "⌂", description: "Economia e sociedade colonial." },
    { id: 15, level: 3, subject: "Geografia", title: "Climatologia", icon: "☼", description: "Climas, massas de ar e fenômenos." },
    { id: 16, level: 4, subject: "Matemática", title: "Probabilidade", icon: "◉", description: "Eventos aleatórios e chances." },
    { id: 17, level: 4, subject: "Matemática", title: "Análise combinatória", icon: "⠿", description: "Contagem e possibilidades." },
    { id: 18, level: 4, subject: "Química", title: "Química orgânica", icon: "⌬", description: "Funções e compostos orgânicos." },
    { id: 19, level: 4, subject: "Filosofia", title: "Ética", icon: "◈", description: "Pensamento filosófico e moral." },
    { id: 20, level: 4, subject: "Sociologia", title: "Cultura e sociedade", icon: "◎", description: "Instituições e relações sociais." },
    { id: 21, level: 5, subject: "Linguagens", title: "Gêneros textuais", icon: "¶", description: "Finalidade, linguagem e contexto." },
    { id: 22, level: 5, subject: "Interdisciplinar", title: "Simulado final", icon: "★", description: "Pratique conteúdos variados." }
  ];

  // Banco inicial de questões autorais para testar a plataforma.
  // Amplie este banco com novas questões conforme desenvolver os módulos.
  const questions = [
    { id: 1, module: 1, subject: "Matemática", text: "Um produto custa R$ 200 e recebe desconto de 15%. Qual é o preço final?", options: ["R$ 150", "R$ 160", "R$ 170", "R$ 185", "R$ 190"], answer: 2, explanation: "15% de 200 é 30. Então, 200 − 30 = 170." },
    { id: 2, module: 1, subject: "Matemática", text: "Uma conta de R$ 80 teve aumento de 25%. Qual é o novo valor?", options: ["R$ 90", "R$ 95", "R$ 100", "R$ 105", "R$ 120"], answer: 2, explanation: "25% de 80 é 20. O novo valor é 100." },
    { id: 3, module: 1, subject: "Matemática", text: "Em uma turma de 40 alunos, 30% usam óculos. Quantos alunos usam óculos?", options: ["8", "10", "12", "14", "16"], answer: 2, explanation: "0,30 × 40 = 12 alunos." },
    { id: 4, module: 2, subject: "Matemática", text: "A razão entre 12 e 4, nessa ordem, é:", options: ["2", "3", "4", "8", "16"], answer: 1, explanation: "12 ÷ 4 = 3." },
    { id: 5, module: 3, subject: "Matemática", text: "Se 3 cadernos custam R$ 24, quanto custam 5 cadernos iguais?", options: ["R$ 30", "R$ 35", "R$ 40", "R$ 45", "R$ 48"], answer: 2, explanation: "Cada caderno custa 24 ÷ 3 = 8 reais. Cinco custam 40 reais." },
    { id: 6, module: 4, subject: "Matemática", text: "As notas de um estudante foram 6, 8 e 10. Qual é a média aritmética?", options: ["6", "7", "8", "9", "10"], answer: 2, explanation: "(6 + 8 + 10) ÷ 3 = 8." },
    { id: 7, module: 5, subject: "Português", text: "Em um texto argumentativo, a tese corresponde principalmente:", options: ["Ao título", "À opinião central defendida", "À lista de fontes", "Ao exemplo final", "À descrição do cenário"], answer: 1, explanation: "A tese é o posicionamento central que o autor procura defender." },
    { id: 8, module: 5, subject: "Português", text: "Inferir uma informação em um texto significa:", options: ["Copiar uma frase", "Ignorar o contexto", "Deduzir algo a partir de pistas", "Contar parágrafos", "Corrigir a ortografia"], answer: 2, explanation: "Inferir é chegar a uma conclusão usando pistas textuais e contexto." },
    { id: 9, module: 6, subject: "Matemática", text: "Se f(x) = 2x + 3, qual é o valor de f(4)?", options: ["8", "9", "10", "11", "12"], answer: 3, explanation: "f(4) = 2 × 4 + 3 = 11." },
    { id: 10, module: 7, subject: "Matemática", text: "Qual é a área de um retângulo de 8 cm por 5 cm?", options: ["13 cm²", "26 cm²", "30 cm²", "40 cm²", "80 cm²"], answer: 3, explanation: "Área do retângulo = base × altura = 8 × 5 = 40 cm²." },
    { id: 11, module: 8, subject: "Matemática", text: "Um cubo possui aresta de 3 cm. Qual é seu volume?", options: ["9 cm³", "18 cm³", "27 cm³", "36 cm³", "81 cm³"], answer: 2, explanation: "Volume do cubo = aresta³ = 3³ = 27 cm³." },
    { id: 12, module: 9, subject: "Física", text: "Um carro percorre 120 km em 2 horas. Qual é sua velocidade média?", options: ["40 km/h", "50 km/h", "60 km/h", "80 km/h", "100 km/h"], answer: 2, explanation: "Velocidade média = distância ÷ tempo = 120 ÷ 2 = 60 km/h." },
    { id: 13, module: 10, subject: "Biologia", text: "Em uma cadeia alimentar, os produtores são organismos que:", options: ["Sempre caçam animais", "Produzem matéria orgânica", "Decompõem apenas metais", "Não precisam de energia", "Ocupam sempre o último nível"], answer: 1, explanation: "Produtores, como plantas, formam matéria orgânica, geralmente por fotossíntese." },
    { id: 14, module: 11, subject: "Química", text: "Qual partícula possui carga elétrica negativa?", options: ["Próton", "Nêutron", "Elétron", "Núcleo", "Átomo neutro"], answer: 2, explanation: "O elétron possui carga elétrica negativa." },
    { id: 15, module: 12, subject: "Física", text: "De acordo com a segunda lei de Newton, a força resultante é igual a:", options: ["Massa dividida pelo tempo", "Massa vezes aceleração", "Velocidade vezes tempo", "Energia dividida pela massa", "Distância vezes aceleração"], answer: 1, explanation: "A segunda lei de Newton é expressa por F = m · a." },
    { id: 16, module: 13, subject: "Biologia", text: "Qual molécula armazena a maior parte da informação genética dos seres vivos?", options: ["Glicose", "DNA", "Água", "Amido", "Hemoglobina"], answer: 1, explanation: "O DNA contém a informação genética dos organismos." },
    { id: 17, module: 14, subject: "História", text: "Uma característica importante da economia colonial brasileira foi:", options: ["A ausência de exportações", "A produção voltada também ao mercado externo", "A industrialização generalizada", "O fim imediato da escravidão", "A inexistência da agricultura"], answer: 1, explanation: "A economia colonial esteve fortemente ligada à exploração de produtos para exportação." },
    { id: 18, module: 15, subject: "Geografia", text: "O desmatamento pode contribuir para:", options: ["A eliminação de todo impacto climático", "A perda de biodiversidade", "O aumento de todas as nascentes", "A ausência de erosão", "A interrupção do ciclo da água em todo o planeta"], answer: 1, explanation: "A remoção da vegetação destrói habitats e pode reduzir a biodiversidade." },
    { id: 19, module: 16, subject: "Matemática", text: "Ao lançar uma moeda equilibrada, qual é a probabilidade de sair cara?", options: ["0%", "25%", "50%", "75%", "100%"], answer: 2, explanation: "Há dois resultados igualmente prováveis; a chance de cara é 1/2 = 50%." },
    { id: 20, module: 17, subject: "Matemática", text: "Uma pessoa tem 3 camisetas e 2 calças. Quantas combinações de roupa diferentes pode formar usando uma de cada?", options: ["2", "3", "5", "6", "9"], answer: 3, explanation: "Pelo princípio multiplicativo, 3 × 2 = 6 combinações." },
    { id: 21, module: 18, subject: "Química", text: "Compostos orgânicos são geralmente associados à química de qual elemento?", options: ["Hélio", "Carbono", "Neônio", "Argônio", "Prata"], answer: 1, explanation: "A química orgânica estuda principalmente os compostos de carbono." },
    { id: 22, module: 19, subject: "Filosofia", text: "A ética filosófica investiga principalmente:", options: ["A previsão do tempo", "Os princípios da ação moral", "A composição das rochas", "O cálculo de áreas", "A formação das estrelas"], answer: 1, explanation: "A ética reflete sobre valores, deveres e decisões morais." },
    { id: 23, module: 20, subject: "Sociologia", text: "A socialização é o processo pelo qual as pessoas:", options: ["Aprendem normas e valores sociais", "Deixam de viver em sociedade", "Eliminam todas as diferenças culturais", "Nascem conhecendo todas as regras", "Deixam de se comunicar"], answer: 0, explanation: "A socialização envolve aprender normas, valores e práticas da sociedade." },
    { id: 24, module: 21, subject: "Linguagens", text: "A finalidade predominante de uma campanha de vacinação é:", options: ["Entreter sem informar", "Promover uma ação de saúde pública", "Narrar uma aventura fictícia", "Apresentar uma receita culinária", "Descrever um personagem"], answer: 1, explanation: "Campanhas de vacinação buscam informar e incentivar a proteção da saúde." },
    { id: 25, module: 22, subject: "Interdisciplinar", text: "Uma cidade amplia o transporte coletivo e reduz o uso de carros. Uma consequência possível é:", options: ["O aumento obrigatório da poluição", "A redução das emissões por passageiro", "O fim de todos os deslocamentos", "A eliminação de toda desigualdade", "O aumento inevitável do consumo de combustível"], answer: 1, explanation: "Um transporte coletivo eficiente pode reduzir as emissões por pessoa transportada." },
    { id: 26, module: 1, subject: "Matemática", text: "Quanto representa 20% de 150?", options: ["15", "20", "25", "30", "35"], answer: 3, explanation: "0,20 × 150 = 30." },
    { id: 27, module: 2, subject: "Matemática", text: "Uma receita usa 2 xícaras de farinha para 4 porções. Mantida a proporção, quantas xícaras são necessárias para 10 porções?", options: ["3", "4", "5", "6", "8"], answer: 2, explanation: "2/4 = x/10, portanto x = 5." },
    { id: 28, module: 4, subject: "Matemática", text: "Qual é a mediana dos valores 2, 4, 7, 9 e 12?", options: ["2", "4", "7", "9", "12"], answer: 2, explanation: "A mediana é o valor central da lista ordenada: 7." },
    { id: 29, module: 6, subject: "Matemática", text: "A função f(x) = x². Quanto vale f(−3)?", options: ["−9", "−6", "0", "6", "9"], answer: 4, explanation: "(−3)² = 9." },
    { id: 30, module: 7, subject: "Matemática", text: "Qual é a área de um triângulo de base 10 cm e altura 6 cm?", options: ["16 cm²", "30 cm²", "40 cm²", "60 cm²", "80 cm²"], answer: 1, explanation: "Área = base × altura ÷ 2 = 10 × 6 ÷ 2 = 30 cm²." },
    { id: 31, module: 9, subject: "Física", text: "No Sistema Internacional, a unidade de força é:", options: ["Joule", "Watt", "Newton", "Pascal", "Volt"], answer: 2, explanation: "A força é medida em newtons (N)." },
    { id: 32, module: 10, subject: "Biologia", text: "Qual processo permite que plantas utilizem luz para produzir matéria orgânica?", options: ["Fermentação alcoólica", "Fotossíntese", "Evaporação", "Digestão", "Combustão"], answer: 1, explanation: "Na fotossíntese, a energia luminosa é usada para formar matéria orgânica." },
    { id: 33, module: 14, subject: "História", text: "A Lei Áurea, que aboliu legalmente a escravidão no Brasil, foi assinada em:", options: ["1789", "1822", "1850", "1888", "1930"], answer: 3, explanation: "A Lei Áurea foi assinada em 13 de maio de 1888." },
    { id: 34, module: 15, subject: "Geografia", text: "A urbanização corresponde principalmente:", options: ["Ao crescimento da população urbana", "À formação de novas espécies", "À diminuição de toda atividade econômica", "Ao movimento das placas tectônicas", "À formação de minerais"], answer: 0, explanation: "Urbanização é o processo relacionado ao crescimento da população e do espaço urbano." },
    { id: 35, module: 21, subject: "Linguagens", text: "Em uma notícia jornalística, o título geralmente procura:", options: ["Antecipar o assunto principal", "Substituir todos os fatos", "Ocultar obrigatoriamente o tema", "Apresentar apenas opiniões pessoais", "Eliminar a necessidade de contexto"], answer: 0, explanation: "O título apresenta ou resume o assunto principal da notícia." }
  ];

  function setMessage(element, text, type = "") {
    if (!element) return;
    element.textContent = text;
    element.className = "message" + (type ? " " + type : "");
  }

  function validConfig() {
    const config = window.ENEM_QUEST_CONFIG;
    return config &&
      typeof config.url === "string" &&
      typeof config.anonKey === "string" &&
      config.url.startsWith("https://") &&
      !config.url.includes("COLOQUE_") &&
      !config.anonKey.includes("COLOQUE_") &&
      config.anonKey.length > 20;
  }

  function initializeSupabase() {
    if (!validConfig()) {
      setMessage(authMessage,
        "O site carregou, mas falta configurar a URL e a chave pública do Supabase em config.js.",
        "error");
      return false;
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      setMessage(authMessage,
        "A biblioteca do Supabase não carregou. Verifique sua conexão ou o bloqueio do navegador.",
        "error");
      return false;
    }

    try {
      supabaseClient = window.supabase.createClient(
        window.ENEM_QUEST_CONFIG.url,
        window.ENEM_QUEST_CONFIG.anonKey
      );
      return true;
    } catch (error) {
      console.error("Falha ao iniciar Supabase:", error);
      setMessage(authMessage, "Não foi possível iniciar a conexão com o Supabase.", "error");
      return false;
    }
  }

  function setAuthMode() {
    isSignup = !isSignup;
    authTitle.textContent = isSignup ? "Crie sua conta" : "Entre na sua conta";
    authSubtitle.textContent = isSignup
      ? "Comece sua preparação para o ENEM."
      : "Continue sua preparação para o ENEM.";
    authSubmit.textContent = isSignup ? "Criar minha conta" : "Entrar na plataforma";
    authSwitchText.textContent = isSignup ? "Já tem uma conta?" : "Ainda não tem conta?";
    authToggle.textContent = isSignup ? "Fazer login" : "Criar cadastro";
    authPassword.autocomplete = isSignup ? "new-password" : "current-password";
    setMessage(authMessage, "");
  }

  async function handleAuth(event) {
    event.preventDefault();
    setMessage(authMessage, "");

    const email = $("#auth-email").value.trim();
    const password = authPassword.value;

    if (!email || !password) {
      setMessage(authMessage, "Preencha o e-mail e a senha.", "error");
      return;
    }

    if (password.length < 6) {
      setMessage(authMessage, "A senha precisa ter pelo menos 6 caracteres.", "error");
      return;
    }

    if (!supabaseClient && !initializeSupabase()) return;

    authSubmit.disabled = true;
    authToggle.disabled = true;
    authSubmit.textContent = isSignup ? "Criando conta..." : "Entrando...";

    try {
      let result;

      if (isSignup) {
        result = await supabaseClient.auth.signUp({
          email,
          password
        });
      } else {
        result = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });
      }

      if (result.error) throw result.error;

      if (isSignup && !result.data.session) {
        setMessage(authMessage,
          "Cadastro enviado! Confira seu e-mail para confirmar a conta, se a confirmação estiver ativada no Supabase.",
          "success");
        return;
      }

      if (result.data.user) {
        currentUser = result.data.user;
        await showDashboard();
      } else {
        setMessage(authMessage, "A conta foi processada, mas não foi possível confirmar a sessão.", "error");
      }
    } catch (error) {
      console.error("Erro de autenticação:", error);
      setMessage(authMessage, friendlyAuthError(error), "error");
    } finally {
      authSubmit.disabled = false;
      authToggle.disabled = false;
      authSubmit.textContent = isSignup ? "Criar minha conta" : "Entrar na plataforma";
    }
  }

  function friendlyAuthError(error) {
    const message = String(error?.message || "");

    if (message.toLowerCase().includes("invalid login credentials")) {
      return "E-mail ou senha incorretos. Confira os dados ou crie uma conta.";
    }
    if (message.toLowerCase().includes("already registered")) {
      return "Este e-mail já possui cadastro. Tente fazer login.";
    }
    if (message.toLowerCase().includes("password should be")) {
      return "A senha não atende aos requisitos do Supabase.";
    }
    if (message.toLowerCase().includes("email not confirmed")) {
      return "Confirme seu e-mail antes de entrar.";
    }
    if (message.toLowerCase().includes("fetch")) {
      return "Não foi possível conectar ao Supabase. Verifique a URL, a rede e o navegador.";
    }

    return message || "Ocorreu um erro ao autenticar. Tente novamente.";
  }

  function storageKey() {
    return currentUser ? "enem-quest-progress-" + currentUser.id : "enem-quest-progress-guest";
  }

  function loadProgress() {
    try {
      const saved = localStorage.getItem(storageKey());
      const data = saved ? JSON.parse(saved) : {};
      progress = {
        xp: Number(data.xp) || 0,
        answered: Number(data.answered) || 0,
        correct: Number(data.correct) || 0,
        completed: Array.isArray(data.completed) ? data.completed : []
      };
    } catch (error) {
      console.warn("Não foi possível carregar o progresso local:", error);
      progress = { xp: 0, answered: 0, correct: 0, completed: [] };
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(progress));
    } catch (error) {
      console.warn("Não foi possível salvar o progresso:", error);
    }
  }

  function currentLevel() {
    return Math.min(MAX_LEVEL, Math.floor(progress.xp / LEVEL_XP) + 1);
  }

  function renderStats() {
    const level = currentLevel();
    const xpInLevel = level === MAX_LEVEL
      ? progress.xp % LEVEL_XP
      : progress.xp % LEVEL_XP;

    $("#level-number").textContent = level;
    $("#xp-stat").textContent = progress.xp;
    $("#answered-stat").textContent = progress.answered;

    const accuracy = progress.answered
      ? Math.round((progress.correct / progress.answered) * 100)
      : 0;

    $("#accuracy-stat").textContent = accuracy + "%";
    $("#xp-label").textContent = xpInLevel + " / " + LEVEL_XP + " XP";
    $("#xp-bar").style.width = Math.min(100, xpInLevel) + "%";
    $("#progress-message").textContent = level === MAX_LEVEL
      ? "Você chegou ao último nível. Continue praticando para consolidar seus conhecimentos."
      : "Faltam " + (LEVEL_XP - xpInLevel) + " XP para o próximo nível.";

    renderModules();
  }

  function renderModules() {
    const grid = $("#module-grid");
    grid.replaceChildren();

    for (const module of modules) {
      const unlocked = module.level <= currentLevel();
      const completed = progress.completed.includes(module.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "module-card";
      button.disabled = !unlocked;
      button.setAttribute("aria-label", module.title + (unlocked ? "" : ", bloqueado"));

      const top = document.createElement("div");
      top.className = "module-top";

      const icon = document.createElement("span");
      icon.className = "module-icon";
      icon.textContent = module.icon;

      const lock = document.createElement("span");
      lock.className = "module-lock";
      lock.textContent = completed ? "✓ Concluído" : unlocked ? "Nível " + module.level : "🔒 Nível " + module.level;
      top.append(icon, lock);

      const title = document.createElement("h3");
      title.textContent = module.title;

      const description = document.createElement("p");
      description.textContent = module.description;

      const bottom = document.createElement("div");
      bottom.className = "module-bottom";

      const subject = document.createElement("span");
      subject.textContent = module.subject;

      const action = document.createElement("strong");
      action.textContent = completed ? "Revisar ↻" : "Estudar →";

      bottom.append(subject, action);
      button.append(top, title, description, bottom);
      button.addEventListener("click", () => startModule(module));
      grid.append(button);
    }
  }

  function startModule(module) {
    currentQuestions = questions.filter((question) => question.module === module.id);
    if (!currentQuestions.length) {
      setMessage(authMessage, "Ainda não existem questões cadastradas para este módulo.", "error");
      return;
    }

    questionIndex = 0;
    $("#quiz-title").textContent = module.title;
    $("#quiz-panel").classList.remove("hidden");
    $("#quiz-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    showQuestion();
  }

  function showQuestion() {
    const question = currentQuestions[questionIndex];
    selectedAnswer = null;
    answeredThisQuestion = false;

    $("#question-count").textContent =
      "Questão " + (questionIndex + 1) + " de " + currentQuestions.length;
    $("#question-subject").textContent = question.subject;
    $("#question-text").textContent = question.text;
    $("#quiz-progress").style.width =
      ((questionIndex + 1) / currentQuestions.length * 100) + "%";

    const options = $("#answer-options");
    options.replaceChildren();

    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-option";

      const letter = document.createElement("span");
      letter.className = "option-letter";
      letter.textContent = String.fromCharCode(65 + index);

      const label = document.createElement("span");
      label.textContent = option;

      button.append(letter, label);
      button.addEventListener("click", () => {
        if (answeredThisQuestion) return;

        selectedAnswer = index;
        options.querySelectorAll(".answer-option").forEach((item) => {
          item.classList.remove("selected");
        });
        button.classList.add("selected");
        $("#next-question").textContent = "Confirmar resposta";
        $("#next-question").disabled = false;
      });

      options.append(button);
    });

    setMessage($("#answer-feedback"), "");
    $("#next-question").disabled = true;
    $("#next-question").textContent = "Confirmar resposta";
  }

  function handleNextQuestion() {
    if (!answeredThisQuestion) {
      if (selectedAnswer === null) {
        setMessage($("#answer-feedback"), "Selecione uma alternativa primeiro.", "error");
        return;
      }

      const question = currentQuestions[questionIndex];
      const isCorrect = selectedAnswer === question.answer;
      answeredThisQuestion = true;

      progress.answered++;
      if (isCorrect) {
        progress.correct++;
        progress.xp += 10;
        setMessage($("#answer-feedback"), "Resposta correta! +10 XP. " + question.explanation, "success");
      } else {
        setMessage($("#answer-feedback"),
          "Não foi dessa vez. Resposta correta: " +
          question.options[question.answer] + ". " + question.explanation,
          "error");
      }

      $("#answer-options").querySelectorAll(".answer-option").forEach((button, index) => {
        button.disabled = true;
        if (index === question.answer) button.classList.add("correct");
        if (index === selectedAnswer && !isCorrect) button.classList.add("incorrect");
      });

      saveProgress();
      renderStats();

      const lastQuestion = questionIndex === currentQuestions.length - 1;
      $("#next-question").textContent = lastQuestion ? "Finalizar módulo" : "Próxima questão";
      return;
    }

    if (questionIndex < currentQuestions.length - 1) {
      questionIndex++;
      showQuestion();
      return;
    }

    const moduleId = currentQuestions[0].module;
    if (!progress.completed.includes(moduleId)) {
      progress.completed.push(moduleId);
    }

    saveProgress();
    renderStats();
    $("#quiz-panel").classList.add("hidden");
    $("#module-grid").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function showDashboard() {
    authScreen.classList.add("hidden");
    dashboard.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");

    $("#header-status").textContent = currentUser?.email || "Estudante";
    loadProgress();
    renderStats();

    // O progresso deste exemplo é salvo no navegador.
    // Para sincronizá-lo entre dispositivos, será necessário criar
    // uma tabela própria no Supabase e políticas de acesso RLS.
  }

  async function logout() {
    if (supabaseClient) {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error("Erro ao sair:", error);
        setMessage(authMessage, "Não foi possível encerrar a sessão. Tente novamente.", "error");
        return;
      }
    }

    currentUser = null;
    dashboard.classList.add("hidden");
    authScreen.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    $("#header-status").textContent = "Sua jornada começa aqui";
    $("#quiz-panel").classList.add("hidden");
    authForm.reset();
    setMessage(authMessage, "Você saiu da sua conta.", "success");
  }

  async function startApp() {
    authForm.addEventListener("submit", handleAuth);
    authToggle.addEventListener("click", setAuthMode);
    logoutBtn.addEventListener("click", logout);
    $("#next-question").addEventListener("click", handleNextQuestion);
    $("#close-quiz").addEventListener("click", () => {
      $("#quiz-panel").classList.add("hidden");
    });
    $("#brand-home").addEventListener("click", (event) => {
      event.preventDefault();
      if (currentUser) {
        dashboard.scrollIntoView({ behavior: "smooth" });
      } else {
        authScreen.scrollIntoView({ behavior: "smooth" });
      }
    });

    $("#module-count").textContent = modules.length + " módulos";

    // Exibe a plataforma de login mesmo se a conexão falhar.
    // Assim, o botão de alternar entre login e cadastro continua funcionando.
    initializeSupabase();

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;

        if (data.session?.user) {
          currentUser = data.session.user;
          await showDashboard();
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        setMessage(authMessage, "Não foi possível verificar sua sessão. Tente entrar novamente.", "error");
      }

      supabaseClient.auth.onAuthStateChange((_event, session) => {
        if (session?.user && !currentUser) {
          currentUser = session.user;
          showDashboard();
        }
      });
    }
  }

  // Captura erros inesperados para ajudar a identificar falhas.
  window.addEventListener("error", (event) => {
    console.error("Erro no ENEM QUEST:", event.message, event.filename, event.lineno);
  });

  startApp().catch((error) => {
    console.error("Falha ao iniciar o ENEM QUEST:", error);
    setMessage(authMessage, "Ocorreu um erro ao abrir a plataforma. Confira o Console do navegador.", "error");
  });
})();
