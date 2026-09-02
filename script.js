// ============================================
// 1. CONFIGURAÇÃO DA API
// ============================================

// API que procura a cidade e retorna
// latitude e longitude.
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

// API que consulta os dados do clima.
const CLIMA_URL = "https://api.open-meteo.com/v1/forecast";

// ============================================
// 2. ELEMENTOS DA PÁGINA
// ============================================

// Pega o botão do HTML.
const botaoBuscar = document.getElementById("buscar");

// Pega o campo onde o usuário digita a cidade.
const campoCidade = document.getElementById("cidade");

// Pega a área onde o resultado será mostrado.
const resultado = document.getElementById("resultado");

// ============================================
// 3. LIGA O BOTÃO À FUNÇÃO
// ============================================

// Quando clicar no botão,
// executa a função buscarClima.
botaoBuscar.addEventListener("click", buscarClima);

// ============================================
// Melhoria 1 - Pesquisar com ENTER
// ============================================

campoCidade.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter") {
    // Impede o formulário de recarregar a página.
    evento.preventDefault();

    // Faz a consulta normalmente.
    buscarClima();
  }
});

// ============================================
// 4. FUNÇÃO PRINCIPAL
// ============================================

function buscarClima() {
  // Pega o que foi digitado.
  // trim() remove espaços extras.
  const cidade = campoCidade.value.trim();

  // Mostra no console para testar.
  console.log("Cidade digitada:", cidade);

  // ==========================================
  // 5. VALIDAÇÃO
  // ==========================================

  // Verifica se o campo está vazio.
  if (cidade === "") {
    alert("Bota o nome da cidade aí burrão. Catapimbas!");

    return;
  }

  // Mostra uma mensagem enquanto a consulta acontece.
  resultado.innerHTML = "<p>Consultando o clima...</p>";

  // ==========================================
  // 6. MONTA A URL DA CIDADE
  // ==========================================

  const urlBusca =
    `${GEO_URL}?name=${encodeURIComponent(cidade)}` +
    `&count=1&language=pt&format=json`;

  console.log("URL da cidade:", urlBusca);

  // ==========================================
  // 7. PRIMEIRA REQUISIÇÃO
  // ==========================================

  fetch(urlBusca)
    .then(function (resposta) {
      // Verifica se a requisição funcionou.
      if (!resposta.ok) {
        throw new Error("Não foi possível consultar a cidade.");
      }

      // Converte a resposta para JSON.
      return resposta.json();
    })

    // ========================================
    // 8. PEGA LATITUDE E LONGITUDE
    // ========================================

    .then(function (dadosCidade) {
      console.log("Dados da cidade:", dadosCidade);

      // Verifica se alguma cidade foi encontrada.
      if (!dadosCidade.results || dadosCidade.results.length === 0) {
        throw new Error("Cidade não encontrada.");
      }

      // Pega o primeiro resultado.
      const latitude = dadosCidade.results[0].latitude;

      const longitude = dadosCidade.results[0].longitude;

      console.log("Latitude:", latitude);

      console.log("Longitude:", longitude);

      // ======================================
      // 9. MONTA A URL DO CLIMA
      // ======================================

      const urlClima =
        `${CLIMA_URL}?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

      console.log("URL do clima:", urlClima);

      // ======================================
      // 10. SEGUNDA REQUISIÇÃO
      // ======================================

      return fetch(urlClima);
    })

    .then(function (resposta) {
      // Verifica se a consulta do clima funcionou.
      if (!resposta.ok) {
        throw new Error("Não foi possível consultar o clima.");
      }

      // Converte para JSON.
      return resposta.json();
    })

    // ========================================
    // 11. PEGA OS DADOS DO JSON
    // ========================================

    .then(function (dadosClima) {
      console.log("Dados do clima:", dadosClima);

      // Temperatura atual.
      const temperatura = dadosClima.current.temperature_2m;

      // Umidade atual.
      const umidade = dadosClima.current.relative_humidity_2m;

      // Velocidade do vento.
      const vento = dadosClima.current.wind_speed_10m;

      // Código da condição climática.
      const condicao = dadosClima.current.weather_code;

      // ======================================
      // Melhoria 2 - Ícone de acordo com o clima.
      // ======================================

      let iconeClima = "⛅";
      if (condicao === 0) {
        iconeClima = "☀️";
      } else if (condicao === 1) {
        iconeClima = "🌤️";
      } else if (condicao === 2) {
        iconeClima = "⛅";
      } else if (condicao === 3) {
        iconeClima = "☁️";
      } else {
        iconeClima = "🌦️";
      }

      console.log("Temperatura:", temperatura);

      console.log("Umidade:", umidade);

      console.log("Vento:", vento);

      console.log("Condição:", condicao);

      // ======================================
      // 12. MOSTRA O RESULTADO NA TELA
      // ======================================

      resultado.innerHTML = `

        <div class="card-clima">

          <h2>
            ${cidade}
          </h2>

          <p>
            Temperatura:
            <strong>
              ${temperatura} °C
            </strong>
          </p>

          <p>
            Umidade:
            <strong>
              ${umidade}%
            </strong>
          </p>

          <p>
            Vento:
            <strong>
              ${vento} km/h
            </strong>
          </p>

          <p>
            Condição climática:
            <strong>
              ${condicao}
            </strong>
          </p>

        </div>

      `;
    })

    // ========================================
    // TRATAMENTO DE ERRO
    // ========================================

    .catch(function (erro) {
      console.error("Erro:", erro);

      resultado.innerHTML = `
        <p>
          ${erro.message}
        </p>
      `;
    });
}
