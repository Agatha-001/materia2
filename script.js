// SOL EM FOCO — JAVASCRIPT
// Aguarda o HTML carregar antes de executar os recursos.

document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector) => document.querySelector(selector);

  // =========================
  // MENU RESPONSIVO
  // =========================

  const menuToggle = $('#menuToggle');
  const menu = $('#menu');

  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      const aberto = menu.classList.toggle('open');

      menuToggle.setAttribute('aria-expanded', String(aberto));
      menuToggle.setAttribute(
        'aria-label',
        aberto ? 'Fechar menu' : 'Abrir menu'
      );
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // =========================
  // ACESSIBILIDADE
  // =========================

  const contrastToggle = $('#contrastToggle');

  if (contrastToggle) {
    contrastToggle.addEventListener('click', event => {
      const ativo = document.body.classList.toggle('high-contrast');

      event.currentTarget.setAttribute('aria-pressed', String(ativo));
    });
  }

  const fontToggle = $('#fontToggle');

  if (fontToggle) {
    fontToggle.addEventListener('click', event => {
      const ativo = document.body.classList.toggle('dyslexia-font');

      event.currentTarget.setAttribute('aria-pressed', String(ativo));
    });
  }

  let fontScale = 1;

  function atualizarFonte() {
    document.documentElement.style.setProperty(
      '--page-scale',
      fontScale
    );
  }

  const textPlus = $('#textPlus');
  const textMinus = $('#textMinus');

  if (textPlus) {
    textPlus.addEventListener('click', () => {
      fontScale = Math.min(1.3, +(fontScale + 0.1).toFixed(1));
      atualizarFonte();
    });
  }

  if (textMinus) {
    textMinus.addEventListener('click', () => {
      fontScale = Math.max(0.85, +(fontScale - 0.1).toFixed(1));
      atualizarFonte();
    });
  }

  // =========================
  // SIMULADOR DE RADIAÇÃO
  // =========================

  function iniciarSimulador() {
    const slider = $('#tempSlider');
    const canvas = $('#spectrumChart');

    const tempOutput = $('#tempOutput');
    const peakOutput = $('#peakOutput');
    const bandOutput = $('#bandOutput');
    const colorName = $('#colorName');
    const glowingObject = $('#glowingObject');

    if (
      !slider || !canvas || !tempOutput ||
      !peakOutput || !bandOutput ||
      !colorName || !glowingObject
    ) {
      console.warn('Verifique os IDs do simulador no HTML.');
      return;
    }

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.warn('Não foi possível criar o gráfico.');
      return;
    }

    // Constantes físicas
    const h = 6.62607015e-34;
    const c = 299792458;
    const k = 1.380649e-23;

    // Lei de Planck
    function planck(lambda, temperatura) {
      const expoente = (h * c) / (lambda * k * temperatura);

      if (expoente > 700) return 0;

      return (2 * h * c * c) /
        (Math.pow(lambda, 5) * (Math.exp(expoente) - 1));
    }

    // Desenhar gráfico
    function desenharGrafico(temperatura) {
      const largura = Math.max(300, canvas.clientWidth || 600);
      const altura = 240;
      const dpr = Math.max(1, window.devicePixelRatio || 1);

      canvas.width = largura * dpr;
      canvas.height = altura * dpr;
      canvas.style.height = altura + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, largura, altura);

      const esquerda = 42;
      const direita = 12;
      const topo = 12;
      const base = 30;

      const larguraGrafico = largura - esquerda - direita;
      const alturaGrafico = altura - topo - base;

      // Linhas de referência
      ctx.strokeStyle = 'rgba(190,215,255,0.2)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= 4; i++) {
        const y = topo + alturaGrafico * i / 4;

        ctx.beginPath();
        ctx.moveTo(esquerda, y);
        ctx.lineTo(largura - direita, y);
        ctx.stroke();
      }

      // Calcular espectro
      const pontos = [];
      let maximo = 0;

      for (let i = 0; i <= 240; i++) {
        const nm = 100 + i * 10;
        const valor = planck(nm * 1e-9, temperatura);

        pontos.push({ nm, valor });
        maximo = Math.max(maximo, valor);
      }

      if (!Number.isFinite(maximo) || maximo <= 0) return;

      const x = nm =>
        esquerda + ((nm - 100) / 2400) * larguraGrafico;

      const y = valor =>
        topo + alturaGrafico -
        (valor / maximo) * alturaGrafico * 0.9;

      // Gradiente do espectro
      const gradiente = ctx.createLinearGradient(
        esquerda, 0, largura - direita, 0
      );

      gradiente.addColorStop(0, '#7b37bc');
      gradiente.addColorStop(0.2, '#4165df');
      gradiente.addColorStop(0.4, '#35a9e8');
      gradiente.addColorStop(0.6, '#51c778');
      gradiente.addColorStop(0.8, '#f79b42');
      gradiente.addColorStop(1, '#e94c4c');

      // Área preenchida
      ctx.beginPath();

      pontos.forEach((ponto, i) => {
        if (i === 0) {
          ctx.moveTo(x(ponto.nm), y(ponto.valor));
        } else {
          ctx.lineTo(x(ponto.nm), y(ponto.valor));
        }
      });

      ctx.lineTo(x(2500), topo + alturaGrafico);
      ctx.lineTo(x(100), topo + alturaGrafico);
      ctx.closePath();

      ctx.fillStyle = gradiente;
      ctx.globalAlpha = 0.18;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Linha do gráfico
      ctx.beginPath();

      pontos.forEach((ponto, i) => {
        if (i === 0) {
          ctx.moveTo(x(ponto.nm), y(ponto.valor));
        } else {
          ctx.lineTo(x(ponto.nm), y(ponto.valor));
        }
      });

      ctx.strokeStyle = '#8be6f5';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Encontrar pico
      let pico = pontos[0];

      pontos.forEach(ponto => {
        if (ponto.valor > pico.valor) {
          pico = ponto;
        }
      });

      const picoX = x(pico.nm);
      const picoY = y(pico.valor);

      // Marcação do pico
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#ffc857';

      ctx.beginPath();
      ctx.moveTo(picoX, picoY);
      ctx.lineTo(picoX, topo + alturaGrafico);
      ctx.stroke();

      ctx.setLineDash([]);

      ctx.fillStyle = '#ffc857';
      ctx.beginPath();
      ctx.arc(picoX, picoY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Legendas
      ctx.fillStyle = '#b4c1d8';
      ctx.font = '11px Arial';

      ctx.fillText('100 nm', esquerda, altura - 8);
      ctx.fillText(
        '1.300 nm',
        esquerda + larguraGrafico * 0.48,
        altura - 8
      );
      ctx.fillText('2.500 nm', largura - 62, altura - 8);
    }

    // Atualizar informações
    function atualizarSimulador() {
      const temperatura = Number(slider.value);

      if (!Number.isFinite(temperatura) || temperatura <= 0) {
        return;
      }

      // Lei de Wien
      const picoNm = 2.897771955e6 / temperatura;

      tempOutput.textContent =
        temperatura.toLocaleString('pt-BR') + ' K';

      peakOutput.textContent =
        Math.round(picoNm) + ' nm';

      bandOutput.textContent =
        picoNm < 380
          ? 'Ultravioleta'
          : picoNm <= 750
            ? 'Visível'
            : 'Infravermelho';

      let nome;
      let cor;

      if (temperatura < 1800) {
        nome = 'Vermelho-alaranjado';
        cor = '#f05d35';
      } else if (temperatura < 3000) {
        nome = 'Alaranjado';
        cor = '#ff963e';
      } else if (temperatura < 4500) {
        nome = 'Amarelado';
        cor = '#ffd05a';
      } else if (temperatura < 6500) {
        nome = 'Branco-amarelado';
        cor = '#fff0b0';
      } else {
        nome = 'Branco-azulado';
        cor = '#dceaff';
      }

      colorName.textContent = nome;
      glowingObject.style.background = cor;
      glowingObject.style.boxShadow = `0 0 28px ${cor}`;

      desenharGrafico(temperatura);
    }

    slider.addEventListener('input', atualizarSimulador);
    window.addEventListener('resize', atualizarSimulador);

    atualizarSimulador();
  }

  // =========================
  // QUIZ INTERATIVO
  // =========================

  function iniciarQuiz() {
    const perguntas = [
      {
        pergunta: 'O que caracteriza um corpo negro ideal?',
        alternativas: [
          'Reflete toda a luz que recebe.',
          'Absorve toda a radiação incidente.',
          'Não emite energia.'
        ],
        correta: 1,
        explicacao: 'Um corpo negro ideal absorve toda a radiação que recebe e também emite radiação térmica quando está aquecido.'
      },
      {
        pergunta: 'O que acontece com o pico do espectro quando a temperatura aumenta?',
        alternativas: [
          'Desloca-se para comprimentos de onda menores.',
          'Desloca-se sempre para o infravermelho.',
          'Não muda.'
        ],
        correta: 0,
        explicacao: 'Pela lei de Wien, o aumento da temperatura desloca o pico para comprimentos de onda menores.'
      },
      {
        pergunta: 'Aproximadamente, onde fica o pico do espectro solar?',
        alternativas: [
          'Em torno de 500 nm, na luz visível.',
          'Em torno de 5 cm, nas ondas de rádio.',
          'Em torno de 10 m, no infravermelho distante.'
        ],
        correta: 0,
        explicacao: 'Aproximando o Sol por um corpo negro de cerca de 5.800 K, o pico fica próximo de 500 nm.'
      },
      {
        pergunta: 'Como um coletor solar aquece a água da piscina?',
        alternativas: [
          'Transforma água em luz.',
          'Absorve radiação e transfere energia térmica para a água.',
          'Impede toda troca de calor.'
        ],
        correta: 1,
        explicacao: 'O coletor absorve energia solar, aquece e transfere parte dessa energia para a água que circula pelo sistema.'
      },
      {
        pergunta: 'Qual sensor pode medir a temperatura da água?',
        alternativas: [
          'LDR.',
          'DS18B20 à prova d’água.',
          'LED.'
        ],
        correta: 1,
        explicacao: 'O DS18B20 em versão encapsulada à prova d’água é um exemplo de sensor digital de temperatura.'
      }
    ];

    const questionCount = $('#questionCount');
    const scoreLabel = $('#scoreLabel');
    const progressBar = $('#progressBar');
    const questionText = $('#questionText');
    const answers = $('#answers');
    const feedback = $('#feedback');
    const nextButton = $('#nextQuestion');
    const result = $('#quizResult');

    if (
      !questionCount || !scoreLabel ||
      !progressBar || !questionText ||
      !answers || !feedback ||
      !nextButton || !result
    ) {
      console.warn('Verifique os IDs do quiz no HTML.');
      return;
    }

    let atual = 0;
    let pontuacao = 0;
    let respondida = false;

    // Mostrar pergunta
    function mostrarPergunta() {
      const item = perguntas[atual];

      respondida = false;

      questionCount.textContent =
        `Questão ${atual + 1} de ${perguntas.length}`;

      scoreLabel.textContent =
        `Pontuação: ${pontuacao}`;

      progressBar.style.width =
        `${(atual / perguntas.length) * 100}%`;

      questionText.textContent = item.pergunta;
      feedback.textContent = '';

      nextButton.disabled = true;
      nextButton.hidden = false;

      nextButton.textContent =
        atual === perguntas.length - 1
          ? 'Ver resultado'
          : 'Próxima questão →';

      result.hidden = true;
      result.textContent = '';

      answers.replaceChildren();

      item.alternativas.forEach((texto, indice) => {
        const botao = document.createElement('button');

        botao.type = 'button';
        botao.className = 'answer';
        botao.textContent = texto;

        botao.addEventListener('click', () => {
          escolherResposta(indice);
        });

        answers.appendChild(botao);
      });
    }

    // Corrigir resposta
    function escolherResposta(indice) {
      if (respondida) return;

      respondida = true;

      const item = perguntas[atual];

      [...answers.querySelectorAll('button')].forEach((botao, i) => {
        botao.disabled = true;

        if (i === item.correta) {
          botao.classList.add('correct');
        }

        if (i === indice && i !== item.correta) {
          botao.classList.add('wrong');
        }
      });

      if (indice === item.correta) {
        pontuacao++;

        feedback.textContent =
          'Muito bem! ' + item.explicacao;
      } else {
        feedback.textContent =
          'Quase! ' + item.explicacao;
      }

      scoreLabel.textContent =
        `Pontuação: ${pontuacao}`;

      nextButton.disabled = false;
    }

    // Resultado final
    function mostrarResultado() {
      progressBar.style.width = '100%';

      answers.replaceChildren();

      questionText.textContent = 'Quiz concluído!';

      feedback.textContent =
        'Você terminou todas as questões.';

      nextButton.hidden = true;
      result.hidden = false;

      result.textContent =
        `Sua pontuação: ${pontuacao} de ${perguntas.length}. ` +
        (
          pontuacao === 5
            ? 'Excelente!'
            : pontuacao >= 3
              ? 'Bom trabalho! Continue estudando.'
              : 'Vale revisar os tópicos e tentar novamente.'
        );

      const reiniciar = document.createElement('button');

      reiniciar.type = 'button';
      reiniciar.className = 'btn secondary';
      reiniciar.textContent = 'Refazer quiz';

      reiniciar.addEventListener('click', () => {
        atual = 0;
        pontuacao = 0;
        mostrarPergunta();
      });

      result.appendChild(document.createElement('br'));
      result.appendChild(reiniciar);
    }

    // Avançar perguntas
    nextButton.addEventListener('click', () => {
      if (!respondida) return;

      if (atual < perguntas.length - 1) {
        atual++;
        mostrarPergunta();
      } else {
        mostrarResultado();
      }
    });

    mostrarPergunta();
  }

  // =========================
  // INICIAR RECURSOS
  // =========================

  try {
    iniciarSimulador();
  } catch (erro) {
    console.error('Erro no simulador:', erro);
  }

  try {
    iniciarQuiz();
  } catch (erro) {
    console.error('Erro no quiz:', erro);
  }

});
