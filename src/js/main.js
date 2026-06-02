/**
 * ÍNDICE SARDINHA — main.js
 * Autor: Saulo Ferro Maciel · Maio 2026
 *
 * Segurança: todos os valores do usuário são validados via parseFloat() e
 * renderizados exclusivamente via textContent — sem innerHTML com variáveis.
 */

'use strict';

/* ──────────────────────────────────────────────
   ELEMENTOS DO DOM
   ────────────────────────────────────────────── */
const elSardinha   = document.getElementById('v-sardinha');
const elProduto    = document.getElementById('v-produto');
const elErrS       = document.getElementById('err-sardinha');
const elErrP       = document.getElementById('err-produto');
const elWrapS      = document.getElementById('wrap-sardinha');
const elWrapP      = document.getElementById('wrap-produto');

const elResultUSL  = document.getElementById('r-usl');
const elCansRow    = document.getElementById('cans-row');
const elCansObs    = document.getElementById('cans-obs');

const elFProd      = document.getElementById('f-prod');
const elFSard      = document.getElementById('f-sard');
const elFRes       = document.getElementById('f-res');

const elVDias      = document.getElementById('v-dias');
const elVTexto     = document.getElementById('v-texto');
const elATeto      = document.getElementById('a-teto');
const elATetoReais = document.getElementById('a-teto-reais');
const elASobra     = document.getElementById('a-sobra');
const elASobraUSL  = document.getElementById('a-sobra-usl');
const elASem       = document.getElementById('a-sem');
const elAMes       = document.getElementById('a-mes');
const elBarFill    = document.getElementById('bar-fill');
const elBarLabel   = document.getElementById('bar-label');
const elProgressWrap = document.getElementById('progress-bar-wrap');

const elTimeline   = document.getElementById('timeline-rows');

/* ──────────────────────────────────────────────
   CONFIGURAÇÃO E VALORES DE REFERÊNCIA
   ────────────────────────────────────────────── */
let refPrecoPassagem = 8.40;

function parseConfig(text) {
  const config = {};
  const lines = text.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const valStr = parts.slice(1).join('=').trim().replace(',', '.');
      const val = parseFloat(valStr);
      if (!isNaN(val)) {
        config[key] = val;
      }
    }
  }
  return config;
}

function updateProdutoHint() {
  const val = parseFloat(elProduto.value);
  const elHint = document.getElementById('hint-produto');
  if (elHint) {
    elHint.textContent = (val === refPrecoPassagem)
      ? 'passagem ida e volta · são luís — maranhão'
      : '';
  }
}

/* ──────────────────────────────────────────────
   FORMATAÇÃO (segura — apenas números)
   ────────────────────────────────────────────── */
function fmt(n, dec = 2) {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  });
}

function fmtR(n) {
  return 'R$ ' + fmt(n);
}

/* ──────────────────────────────────────────────
   LATAS VISUAIS
   ────────────────────────────────────────────── */
function renderCans(usl) {
  elCansRow.innerHTML = '';

  if (!isFinite(usl) || usl <= 0) return;

  const full  = Math.floor(usl);
  const frac  = usl - full;
  const total = Math.min(full + (frac > 0 ? 1 : 0), 20);

  for (let i = 0; i < total; i++) {
    const span = document.createElement('span');
    span.className = i < full ? 'can-full' : 'can-faint';
    span.textContent = '🥫';
    elCansRow.appendChild(span);
  }

  if (usl > 20) {
    const more = document.createElement('span');
    more.className = 'can-more';
    more.textContent = '+' + Math.floor(usl - 20);
    elCansRow.appendChild(more);
  }
}

/* ──────────────────────────────────────────────
   TIMELINE DIA A DIA
   ────────────────────────────────────────────── */
function renderTimeline(sardinha, produto, usl) {
  elTimeline.innerHTML = '';

  const teto        = Math.ceil(usl);
  const sobraReais  = (teto * sardinha) - produto;
  const sobraUSL    = sobraReais / sardinha;
  const diasFor1    = sobraReais > 0 ? sardinha / sobraReais : Infinity;
  const numDays     = isFinite(diasFor1)
    ? Math.min(Math.ceil(diasFor1) + 2, 12)
    : 5;

  for (let d = 1; d <= numDays; d++) {
    const acc     = sobraUSL * d;
    const pct     = Math.min(acc, 1) * 100;
    const reached = acc >= 1;

    const row = document.createElement('div');
    row.className = 'timeline-row';

    /* badge "Dia N" */
    const badge = document.createElement('span');
    badge.className = 'day-badge';
    badge.textContent = 'Dia ' + d;

    /* barra */
    const barWrap = document.createElement('div');
    barWrap.className = 'day-bar-wrap';

    const barBg = document.createElement('div');
    barBg.className = 'day-bar-bg';

    const barFill = document.createElement('div');
    barFill.className = 'day-bar-fill';
    barFill.style.width = pct.toFixed(1) + '%';

    barWrap.appendChild(barBg);
    barWrap.appendChild(barFill);

    /* valor USL acumulado */
    const uslLabel = document.createElement('span');
    uslLabel.className = 'day-usl';
    uslLabel.textContent = fmt(acc) + ' USL';

    /* estrela ao completar 1 USL */
    const star = document.createElement('span');
    star.className = 'day-star';
    star.textContent = reached ? '★' : '';

    row.appendChild(badge);
    row.appendChild(barWrap);
    row.appendChild(uslLabel);
    row.appendChild(star);
    elTimeline.appendChild(row);
  }
}

/* ──────────────────────────────────────────────
   CÁLCULO PRINCIPAL
   ────────────────────────────────────────────── */
function calculate() {
  /* Limpar erros e estados visuais anteriores */
  elErrS.textContent = '';
  elErrP.textContent = '';
  elWrapS.style.borderColor = '';
  elWrapP.style.borderColor = '';

  /* Leitura segura dos inputs */
  const sardinha = parseFloat(elSardinha.value);
  const produto  = parseFloat(elProduto.value);

  /* Validação */
  let valid = true;

  if (!isFinite(sardinha) || sardinha <= 0) {
    elErrS.textContent = 'insira um valor positivo';
    elWrapS.style.borderColor = '#A32D2D';
    valid = false;
  }

  if (!isFinite(produto) || produto < 0) {
    elErrP.textContent = 'insira um valor válido (≥ 0)';
    elWrapP.style.borderColor = '#A32D2D';
    valid = false;
  }

  if (!valid) {
    elResultUSL.textContent = '—';
    elCansRow.innerHTML     = '';
    elCansObs.textContent   = '';
    elFProd.textContent     = '—';
    elFSard.textContent     = '—';
    elFRes.textContent      = '—';
    return;
  }

  /* ── Cálculos base ── */
  const usl         = produto / sardinha;
  const teto        = Math.ceil(usl);
  const tetoReais   = teto * sardinha;
  const sobraReais  = tetoReais - produto;
  const sobraUSL    = sobraReais / sardinha;
  const diasPor1    = sobraReais > 0 ? sardinha / sobraReais : Infinity;
  const diasInt     = isFinite(diasPor1) ? Math.ceil(diasPor1) : null;
  const barPct      = isFinite(diasPor1) ? Math.min((sobraUSL % 1) * 100, 100) : 0;

  /* ── Resultado principal ── */
  elResultUSL.textContent = fmt(usl);

  /* ── Fórmula ── */
  elFProd.textContent = fmt(produto);
  elFSard.textContent = fmt(sardinha);
  elFRes.textContent  = fmt(usl);

  /* ── Painel "A Sardinha de Amanhã" ── */
  elATeto.textContent       = teto;
  elATetoReais.textContent  = fmtR(tetoReais);
  elASobra.textContent      = fmtR(sobraReais);
  elASobraUSL.textContent   = fmt(sobraUSL) + ' USL/dia';
  elASem.textContent        = fmt(usl * 5);
  elAMes.textContent        = fmt(usl * 22);

  /* Veredicto */
  if (diasInt !== null) {
    elVDias.textContent  = diasInt;
    elVTexto.textContent = 'dias para o trabalhador\nrepor o valor de uma sardinha';
  } else {
    elVDias.textContent  = '—';
    elVTexto.textContent = 'custo exato — sem sobra diária';
  }

  /* Barra de progresso */
  elBarFill.style.width = barPct.toFixed(1) + '%';
  elProgressWrap.setAttribute('aria-valuenow', Math.round(barPct));

  elBarLabel.textContent = isFinite(diasPor1)
    ? 'troco acumula 1 sardinha extra em ' + fmt(diasPor1, 1) + ' dias úteis'
    : 'sem sobra — custo absorve o teto exato';

  /* ── Visuais ── */
  renderCans(usl);

  // Update Cans Observation
  const roundedUsl = Math.round(usl * 100) / 100;
  const full = Math.floor(roundedUsl);
  const pct = Math.round((roundedUsl - full) * 100);
  const labelFull = full === 1 ? 'lata' : 'latas';

  if (pct === 0) {
    elCansObs.textContent = `${fmt(usl)} usl equivale a ${full} ${labelFull} de sardinha`;
  } else if (full === 0) {
    elCansObs.textContent = `${fmt(usl)} usl equivale a ${pct}% de uma lata de sardinha`;
  } else {
    elCansObs.textContent = `${fmt(usl)} usl equivale a ${full} ${labelFull} e ${pct}% de outra lata de sardinha`;
  }

  renderTimeline(sardinha, produto, usl);
}

/* ──────────────────────────────────────────────
   EVENT LISTENERS
   ────────────────────────────────────────────── */
elSardinha.addEventListener('input', calculate);
elProduto.addEventListener('input', calculate);

/* Controla a exibição dinâmica do hint do produto */
elProduto.addEventListener('input', updateProdutoHint);

/* Acessibilidade: calcular também ao sair do campo */
elSardinha.addEventListener('change', calculate);
elProduto.addEventListener('change', calculate);

/* ──────────────────────────────────────────────
   ABAS (TABS)
   ────────────────────────────────────────────── */
(function initTabs() {
  const tabBtns   = document.querySelectorAll('.tab-btn');
  const panels    = document.querySelectorAll('[role="tabpanel"]');

  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const targetId = btn.getAttribute('aria-controls');

      /* Desativar todas as abas */
      tabBtns.forEach(function(b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      /* Esconder todos os painéis */
      panels.forEach(function(p) {
        p.hidden = true;
      });

      /* Ativar aba clicada */
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      /* Mostrar painel correspondente */
      var target = document.getElementById(targetId);
      if (target) target.hidden = false;
    });
  });
})();

/* ──────────────────────────────────────────────
   INICIALIZAÇÃO (carregamento de config.txt)
   ────────────────────────────────────────────── */
fetch('config.txt')
  .then(response => {
    if (!response.ok) throw new Error('Falha ao carregar config.txt');
    return response.text();
  })
  .then(text => {
    const config = parseConfig(text);
    if (config.preco_mediano_lata_sardinha !== undefined) {
      elSardinha.value = config.preco_mediano_lata_sardinha.toFixed(2);
    }
    if (config.preco_ida_e_volta_passagem !== undefined) {
      elProduto.value = config.preco_ida_e_volta_passagem.toFixed(2);
      refPrecoPassagem = config.preco_ida_e_volta_passagem;
    }
    calculate();
    updateProdutoHint();
  })
  .catch(err => {
    console.warn('Usando valores padrão:', err);
    calculate();
    updateProdutoHint();
  });
