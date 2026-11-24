# Grafana K6 Performance Testing

## GitHub Actions

[![K6 Performance Testing](https://github.com/gabrielpagnan/k-6-performance-testing-ProvaGabrielMatiolaPagnan/actions/workflows/node.js.yml/badge.svg)](https://github.com/gabrielpagnan/k-6-performance-testing-ProvaGabrielMatiolaPagnan/actions/workflows/node.js.yml)

## Getting Started

In order to execute this project you must follow the steps below:

1. Install [Node JS](https://nodejs.org/) (version >= 22.x)
1. Install [Grafana K6](https://dl.k6.io/msi/k6-latest-amd64.msi)
1. Run `npm i --save-dev` to install all the project dependencies
1. Run `npm run ci` to execute the entire test suite

All execution reports can be found in `src/output`.

## Cenário de teste

- **API pública:** [JSONPlaceholder](https://jsonplaceholder.typicode.com) (`GET /posts` e `GET /posts/{id}`)
- **Rampa (stages):** inicia com 7 VUs, máximo de 92 VUs, tempo total de 3,5 minutos

| Stage | Duração | VUs alvo |
| ----- | ------- | -------- |
| 1     | 30s     | 7        |
| 2     | 1m      | 50       |
| 3     | 1m      | 92       |
| 4     | 1m      | 0        |

- **Thresholds:**
  - `http_req_duration: p(90) < 6800ms` — 90% das respostas abaixo de 6800ms
  - `http_req_failed: rate < 0.25` — menos de 25% das requisições com erro
- **Pipeline:** GitHub Actions (`.github/workflows/node.js.yml`) roda a cada push/PR na `master`, diariamente e manualmente; os relatórios ficam disponíveis como artefato `k6-reports`.
