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

  if (consumoMedio <= 0 || tarifa <= 0 || potenciaPlaca <= 0 || irradiancia <= 0 || performance <= 0 || fatorEconomia <= 0) {
    alerta.textContent = "Preencha consumo, tarifa, irradiação, placa, performance e fator de compensação com valores válidos.";
    return;
  }

  const energiaSolarMes = consumoMedio * percentual;
  const fatorProdutivo = irradiancia * 30 * performance;
  const potenciaSistemaKW = energiaSolarMes / fatorProdutivo;
  const potenciaSistemaW = potenciaSistemaKW * 1000;
  const qtdPlacas = Math.ceil(potenciaSistemaW / potenciaPlaca);
  const investimento = potenciaSistemaW * custoWp;
  const economiaAnual = energiaSolarMes * tarifa * fatorEconomia * 12;
  const payback = economiaAnual > 0 && investimento > 0 ? investimento / economiaAnual : 0;
  const economia25 = economiaAnual * 25;

  document.getElementById("consMedio").textContent = formatoNumero.format(consumoMedio);
  document.getElementById("energiaSolar").textContent = formatoNumero.format(energiaSolarMes);
  document.getElementById("potenciaSistema").textContent = potenciaSistemaKW.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  document.getElementById("qtdPlacas").textContent = qtdPlacas;
  document.getElementById("potPlacaShow").textContent = potenciaPlaca;
  document.getElementById("investimento").textContent = formatoMoeda.format(investimento);
  document.getElementById("economiaAnual").textContent = formatoMoeda.format(economiaAnual);
  document.getElementById("payback").textContent = payback.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  document.getElementById("economia25").textContent = formatoMoeda.format(economia25);
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
