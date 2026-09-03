// ============================================================
// 1. CONFIGURAÇÃO DAS APIs
// ============================================================

// API de geocodificação.
// Ela recebe o nome da cidade e retorna informações como
// latitude, longitude, estado e país.
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

// API responsável por buscar os dados atuais do clima.
const CLIMA_URL = "https://api.open-meteo.com/v1/forecast";

// ============================================================
// 2. ELEMENTOS DA PÁGINA
// ============================================================

// Campo onde o usuário digita o nome da cidade.
const campoCidade = document.getElementById("cidade");

// Botão utilizado para realizar a consulta.
const botaoBuscar = document.getElementById("buscar");

// Área onde os dados do clima serão mostrados.
const resultado = document.getElementById("resultado");

// ============================================================
// 3. EVENTO DO BOTÃO
// ============================================================

// Quando o usuário clicar no botão,
// executa a função buscarClima.
botaoBuscar.addEventListener("click", function (evento) {
  // Impede que o formulário recarregue a página.
  evento.preventDefault();

  // Inicia a consulta.
  buscarClima();
});

// ============================================================
// MELHORIA 1 - PESQUISAR PRESSIONANDO ENTER
// ============================================================

// Permite fazer uma consulta pressionando Enter
// enquanto o usuário estiver no campo da cidade.
campoCidade.addEventListener("keydown", function (evento) {
  // Verifica se a tecla pressionada foi Enter.
  if (evento.key === "Enter") {
    // Evita o envio normal do formulário.
    evento.preventDefault();

    // Realiza a consulta.
    buscarClima();
  }
});

// ============================================================
// 4. FUNÇÃO PRINCIPAL
// ============================================================

function buscarClima() {
  // Pega o texto digitado pelo usuário.
  // trim() remove espaços extras no começo e no fim.
  const cidade = campoCidade.value.trim();

  // ==========================================================
  // 5. VALIDAÇÃO DO CAMPO
  // ==========================================================

  // Se o usuário não digitou nada,
  // mostra uma mensagem e interrompe a função.
  if (cidade === "") {
    resultado.innerHTML = `
      <p class="mensagem">
        Digite o nome de uma cidade.
      </p>
    `;

    return;
  }

  // ==========================================================
  // MENSAGEM DE CARREGAMENTO
  // ==========================================================

  // Mostra uma mensagem enquanto a API responde.
  resultado.innerHTML = `
    <p class="mensagem">
      Consultando o clima...
    </p>
  `;

  // Variável que armazenará o nome encontrado pela API.
  // Inicialmente usamos o nome digitado pelo usuário.
  let nomeCidade = cidade;

  // ==========================================================
  // 6. MONTA A URL PARA PROCURAR A CIDADE
  // ==========================================================

  // encodeURIComponent() prepara o texto para ser usado
  // corretamente dentro de uma URL.
  const urlBusca =
    `${GEO_URL}?name=${encodeURIComponent(cidade)}` +
    `&count=1&language=pt&format=json`;

  // Mostra a URL no Console para facilitar os testes.
  console.log("URL da cidade:", urlBusca);

  // ==========================================================
  // 7. PRIMEIRA REQUISIÇÃO - LOCALIZA A CIDADE
  // ==========================================================

  fetch(urlBusca)
    .then(function (resposta) {
      // Verifica se a requisição foi realizada corretamente.
      if (!resposta.ok) {
        throw new Error("Não foi possível consultar a cidade.");
      }

      // Converte a resposta da API para JSON.
      return resposta.json();
    })

    // ========================================================
    // 8. PEGA A LATITUDE E A LONGITUDE
    // ========================================================

    .then(function (dadosCidade) {
      // Mostra os dados recebidos no Console.
      console.log("Dados da cidade:", dadosCidade);

      // Verifica se a API realmente encontrou uma cidade.
      if (!dadosCidade.results || dadosCidade.results.length === 0) {
        throw new Error("Cidade não encontrada.");
      }

      // Pega o primeiro resultado encontrado.
      const cidadeEncontrada = dadosCidade.results[0];

      // Guarda o nome correto retornado pela API.
      nomeCidade = cidadeEncontrada.name;

      // Pega a latitude.
      const latitude = cidadeEncontrada.latitude;

      // Pega a longitude.
      const longitude = cidadeEncontrada.longitude;

      // Mostra as coordenadas no Console.
      console.log("Latitude:", latitude);

      console.log("Longitude:", longitude);

      // ======================================================
      // 9. MONTA A URL DA CONSULTA DO CLIMA
      // ======================================================

      // current define quais informações atuais
      // queremos receber da API.
      const urlClima =
        `${CLIMA_URL}?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

      console.log("URL do clima:", urlClima);

      // ======================================================
      // 10. SEGUNDA REQUISIÇÃO - CONSULTA O CLIMA
      // ======================================================

      return fetch(urlClima);
    })

    // ========================================================
    // VERIFICA A RESPOSTA DA API DO CLIMA
    // ========================================================

    .then(function (resposta) {
      // Verifica se a consulta foi realizada corretamente.
      if (!resposta.ok) {
        throw new Error("Não foi possível consultar o clima.");
      }

      // Converte a resposta para JSON.
      return resposta.json();
    })

    // ========================================================
    // 11. PEGA OS DADOS DO JSON
    // ========================================================

    .then(function (dadosClima) {
      // Mostra o JSON completo no Console.
      console.log("Dados do clima:", dadosClima);

      // ------------------------------------------------------
      // TEMPERATURA
      // ------------------------------------------------------

      const temperatura = dadosClima.current.temperature_2m;

      // ------------------------------------------------------
      // UMIDADE
      // ------------------------------------------------------

      const umidade = dadosClima.current.relative_humidity_2m;

      // ------------------------------------------------------
      // VELOCIDADE DO VENTO
      // ------------------------------------------------------

      const vento = dadosClima.current.wind_speed_10m;

      // ------------------------------------------------------
      // CÓDIGO DO CLIMA
      // ------------------------------------------------------

      // A Open-Meteo retorna um número que representa
      // a condição climática.
      const codigoClima = dadosClima.current.weather_code;

      // ======================================================
      // MELHORIAS 2 E 3
      // ======================================================

      // Envia o código para a função identificarClima().
      //
      // A função retornará:
      // - descrição;
      // - emoji;
      // - classe do tema.
      const clima = identificarClima(codigoClima);

      // ======================================================
      // MELHORIA 3 - ALTERA O TEMA DO SITE
      // ======================================================

      // Primeiro removemos qualquer tema aplicado anteriormente.
      document.body.classList.remove(
        "clima-sol",
        "clima-nublado",
        "clima-chuva",
        "clima-tempestade",
        "clima-neve",
      );

      // Depois adicionamos a classe correspondente
      // ao clima atual.
      document.body.classList.add(clima.classe);

      // ======================================================
      // 12. MOSTRA O RESULTADO NA PÁGINA
      // ======================================================

      resultado.innerHTML = `

        <div class="card-clima">

          <!--
            MELHORIA 2
            Emoji grande correspondente ao clima.
          -->
          <div class="icone-clima">
            ${clima.icone}
          </div>


          <!-- Nome da cidade -->
          <h2 class="nome-cidade">
            ${nomeCidade}
          </h2>


          <!-- Descrição da condição climática -->
          <p class="condicao-clima">
            ${clima.descricao}
          </p>


          <!-- Informações do clima -->
          <div class="informacoes-clima">

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

          </div>

        </div>

      `;
    })

    // ========================================================
    // TRATAMENTO DE ERROS
    // ========================================================

    .catch(function (erro) {
      // Mostra o erro completo no Console.
      console.error("Erro:", erro);

      // Mostra uma mensagem simples para o usuário.
      resultado.innerHTML = `

        <p class="mensagem erro">
          ${erro.message}
        </p>

      `;
    });
}

// ============================================================
// FUNÇÃO QUE IDENTIFICA A CONDIÇÃO CLIMÁTICA
// ============================================================

// Essa função recebe o weather_code retornado pela API.
//
// Depois retorna:
// - descrição do clima;
// - emoji;
// - classe CSS que altera o tema.

function identificarClima(codigo) {
  // ==========================================================
  // CÉU LIMPO
  // ==========================================================

  if (codigo === 0) {
    return {
      descricao: "Céu limpo",

      icone: "☀️",

      classe: "clima-sol",
    };
  }

  // ==========================================================
  // PARCIALMENTE NUBLADO / NUBLADO
  // ==========================================================

  if (codigo === 1 || codigo === 2 || codigo === 3) {
    return {
      descricao: "Nublado",

      icone: "☁️",

      classe: "clima-nublado",
    };
  }

  // ==========================================================
  // NEVOEIRO
  // ==========================================================

  if (codigo === 45 || codigo === 48) {
    return {
      descricao: "Nevoeiro",

      icone: "🌫️",

      classe: "clima-nublado",
    };
  }

  // ==========================================================
  // GAROA
  // ==========================================================

  if (
    codigo === 51 ||
    codigo === 53 ||
    codigo === 55 ||
    codigo === 56 ||
    codigo === 57
  ) {
    return {
      descricao: "Garoa",

      icone: "🌦️",

      classe: "clima-chuva",
    };
  }

  // ==========================================================
  // CHUVA
  // ==========================================================

  if (
    codigo === 61 ||
    codigo === 63 ||
    codigo === 65 ||
    codigo === 66 ||
    codigo === 67 ||
    codigo === 80 ||
    codigo === 81 ||
    codigo === 82
  ) {
    return {
      descricao: "Chuva",

      icone: "🌧️",

      classe: "clima-chuva",
    };
  }

  // ==========================================================
  // NEVE
  // ==========================================================

  if (
    codigo === 71 ||
    codigo === 73 ||
    codigo === 75 ||
    codigo === 77 ||
    codigo === 85 ||
    codigo === 86
  ) {
    return {
      descricao: "Neve",

      icone: "❄️",

      classe: "clima-neve",
    };
  }

  // ==========================================================
  // TEMPESTADE
  // ==========================================================

  if (codigo === 95 || codigo === 96 || codigo === 99) {
    return {
      descricao: "Tempestade",

      icone: "⛈️",

      classe: "clima-tempestade",
    };
  }

  // ==========================================================
  // CASO NÃO RECONHEÇA O CÓDIGO
  // ==========================================================

  return {
    descricao: "Condição climática",

    icone: "🌤️",

    classe: "clima-nublado",
  };
}
