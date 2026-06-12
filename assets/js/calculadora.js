const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const form = document.querySelector("#solar-form");
const alerta = document.querySelector("#form-alert");
const estado = document.querySelector("#estado");
const irradianciaManual = document.querySelector("#irradianciaManual");

const formatoNumero = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

const formatoMoeda = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatoInteiro = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0
});

function valorNumerico(id) {
  const valor = Number.parseFloat(document.getElementById(id).value);
  return Number.isFinite(valor) && valor >= 0 ? valor : 0;
}

function calcular(event) {
  event.preventDefault();
  alerta.textContent = "";

  const consumoTotal = meses.reduce((soma, mes) => soma + valorNumerico(mes), 0);
  const consumoMedio = consumoTotal / 12;
  const percentual = valorNumerico("percSolar");
  const irradiancia = valorNumerico("irradianciaManual") || valorNumerico("estado");
  const tarifa = valorNumerico("tarifa");
  const potenciaPlaca = valorNumerico("potPlaca");
  const performance = valorNumerico("performance") / 100;
  const custoWp = valorNumerico("custoWp");
  const fatorEconomia = valorNumerico("fatorEconomia") / 100;
  const autoconsumo = valorNumerico("autoconsumo") / 100;
  const disponibilidadeKwh = valorNumerico("disponibilidade");
  const reajusteTarifa = valorNumerico("reajusteTarifa") / 100;
  const degradacao = valorNumerico("degradacao") / 100;
  const manutencao = valorNumerico("manutencao") / 100;
  const areaPlaca = valorNumerico("areaPlaca");
  const fatorCo2KgMwh = valorNumerico("fatorCo2");

  if (consumoMedio <= 0 || tarifa <= 0 || potenciaPlaca <= 0 || irradiancia <= 0 || performance <= 0 || fatorEconomia <= 0 || areaPlaca <= 0) {
    alerta.textContent = "Preencha consumo, tarifa, irradiação, placa, performance, compensação e área com valores válidos.";
    return;
  }

  const energiaSolarMes = consumoMedio * percentual;
  const energiaCompensavelMes = Math.max(energiaSolarMes - disponibilidadeKwh, 0);
  const fatorProdutivo = irradiancia * 30 * performance;
  const potenciaSistemaKW = energiaSolarMes / fatorProdutivo;
  const potenciaSistemaW = potenciaSistemaKW * 1000;
  const qtdPlacas = Math.ceil(potenciaSistemaW / potenciaPlaca);
  const potenciaRealKW = (qtdPlacas * potenciaPlaca) / 1000;
  const inversorKW = potenciaRealKW * 0.9;
  const geracaoAnual = potenciaRealKW * irradiancia * 365 * performance;
  const areaTelhado = qtdPlacas * areaPlaca;
  const investimento = potenciaSistemaW * custoWp;
  const manutencaoAnual = investimento * manutencao;
  const energiaEconomizadaMes = (energiaCompensavelMes * fatorEconomia * (1 - autoconsumo)) + (energiaSolarMes * autoconsumo);
  const economiaBrutaAnual = energiaEconomizadaMes * tarifa * 12;
  const economiaAnual = Math.max(economiaBrutaAnual - manutencaoAnual, 0);
  const payback = economiaAnual > 0 && investimento > 0 ? investimento / economiaAnual : 0;
  let economia25 = 0;
  let geracao25 = 0;

  for (let ano = 0; ano < 25; ano += 1) {
    const fatorDegradacao = (1 - degradacao) ** ano;
    const tarifaAno = tarifa * ((1 + reajusteTarifa) ** ano);
    const energiaAno = energiaEconomizadaMes * 12 * fatorDegradacao;
    const manutencaoAno = manutencaoAnual * ((1 + reajusteTarifa) ** ano);
    economia25 += Math.max((energiaAno * tarifaAno) - manutencaoAno, 0);
    geracao25 += geracaoAnual * fatorDegradacao;
  }

  const co2EvitadoTon = (geracao25 / 1000) * fatorCo2KgMwh / 1000;

  document.getElementById("consMedio").textContent = formatoNumero.format(consumoMedio);
  document.getElementById("energiaSolar").textContent = formatoNumero.format(energiaSolarMes);
  document.getElementById("geracaoAnual").textContent = formatoInteiro.format(geracaoAnual);
  document.getElementById("potenciaSistema").textContent = potenciaSistemaKW.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  document.getElementById("inversor").textContent = inversorKW.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  document.getElementById("qtdPlacas").textContent = qtdPlacas;
  document.getElementById("potPlacaShow").textContent = potenciaPlaca;
  document.getElementById("areaTelhado").textContent = formatoNumero.format(areaTelhado);
  document.getElementById("investimento").textContent = formatoMoeda.format(investimento);
  document.getElementById("manutencaoAnual").textContent = formatoMoeda.format(manutencaoAnual);
  document.getElementById("economiaAnual").textContent = formatoMoeda.format(economiaAnual);
  document.getElementById("payback").textContent = payback.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  document.getElementById("economia25").textContent = formatoMoeda.format(economia25);
  document.getElementById("co2Evitado").textContent = co2EvitadoTon.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

estado.addEventListener("change", () => {
  irradianciaManual.value = estado.value;
  calcular(new Event("submit"));
});

form.addEventListener("submit", calcular);
form.addEventListener("reset", () => {
  alerta.textContent = "";
  window.setTimeout(() => calcular(new Event("submit")), 0);
});

calcular(new Event("submit"));
